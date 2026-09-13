import type {
  AdjudicationRow,
  CompletenessReport,
  DecisionManifest,
  GraftEdge,
  GraftGraph,
  GraftNode,
  ImpactReport,
  PipelinePacket,
  PlannerFactPacket,
  ProofManifest,
  Residual,
  SlicedFact,
  SubjectProfile,
  TransferCheck,
  TruthGraph,
} from "./types.ts";
import { SCHEMA_VERSION, TRUTH_SCHEMA_VERSION } from "./types.ts";
import { AJENDA, OMNIPATH } from "./subjects.ts";
import { PLANNER_NOTE, emptyKindIndex, indexByKind } from "./facts.ts";

function nodeMap(nodes: GraftNode[]) {
  return new Map(nodes.map((n) => [n.id, n]));
}

function fingerprint(value: unknown): string {
  const encoded = JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < encoded.length; i += 1) {
    hash ^= encoded.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function walk(
  start: string[],
  edges: GraftEdge[],
  direction: "forward" | "reverse",
): Set<string> {
  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    const from = direction === "forward" ? edge.from : edge.to;
    const to = direction === "forward" ? edge.to : edge.from;
    const list = adj.get(from) ?? [];
    list.push(to);
    adj.set(from, list);
  }
  const seen = new Set<string>();
  const queue = [...start];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const next of adj.get(id) ?? []) {
      if (!seen.has(next)) queue.push(next);
    }
  }
  return seen;
}

export function buildGraph(subject: SubjectProfile): GraftGraph {
  const residuals: Residual[] = [];
  const known = new Set(subject.nodes.map((n) => n.id));
  for (const edge of subject.edges) {
    if (!known.has(edge.from) || !known.has(edge.to)) {
      residuals.push({
        id: `residual-edge-${edge.from}-${edge.to}`,
        category: "unmodeled",
        detail: `Edge ${edge.kind} references an undefined node.`,
      });
    }
  }
  for (const finding of subject.findings) {
    if (subject.acknowledgedFindingIds.includes(finding.id) && finding.blocking) {
      residuals.push({
        id: `ack-${finding.id}`,
        category: "acknowledged-violation",
        detail: `${finding.id} is acknowledged, not repaired.`,
      });
    }
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    subjectId: subject.id,
    nodes: subject.nodes,
    edges: subject.edges,
    invariants: subject.invariants,
    residuals,
  };
}

export function analyzeImpact(subject: SubjectProfile, changedFiles: string[]): ImpactReport {
  const nodes = nodeMap(subject.nodes);
  const mapped = new Set<string>();
  const unmapped: string[] = [];
  for (const file of changedFiles) {
    const hits = subject.nodes.filter((n) => n.source === file);
    if (!hits.length) unmapped.push(file);
    for (const hit of hits) mapped.add(hit.id);
  }
  const consumers = walk([...mapped], subject.edges, "reverse");
  const deps = walk([...mapped], subject.edges, "forward");
  const changedNodes = [...mapped].map((id) => nodes.get(id)!).filter(Boolean);
  const slice = new Set([...consumers, ...deps]);
  const relevant = subject.invariants.filter((inv) =>
    inv.sources.some((src) => slice.has(src) || mapped.has(src)),
  );
  const riskDomains = [...new Set(changedNodes.map((n) => n.domain))];
  return {
    schemaVersion: "1.0",
    changedFiles,
    unmappedChangedFiles: unmapped,
    changedNodes,
    upstreamConsumers: [...consumers]
      .filter((id) => !mapped.has(id))
      .map((id) => nodes.get(id)!)
      .filter(Boolean),
    downstreamDependencies: [...deps]
      .filter((id) => !mapped.has(id))
      .map((id) => nodes.get(id)!)
      .filter(Boolean),
    relevantInvariants: relevant,
    riskDomains,
  };
}

export function selectProof(subject: SubjectProfile, impact: ImpactReport): ProofManifest {
  const slice = new Set([
    ...impact.changedNodes.map((n) => n.id),
    ...impact.upstreamConsumers.map((n) => n.id),
    ...impact.downstreamDependencies.map((n) => n.id),
  ]);
  const bundles: { id: string; reason: string }[] = [];
  const requiredTests: string[] = [];
  const requiredGates: string[] = [];
  const reviewGates: string[] = [];
  const manualReview: string[] = [];

  const kinds = new Set(
    [...impact.changedNodes, ...impact.downstreamDependencies, ...impact.upstreamConsumers].map(
      (n) => n.kind,
    ),
  );

  if (kinds.has("security_boundary") || kinds.has("db_table")) {
    bundles.push({
      id: "tenant-isolation",
      reason: "Tenant or table nodes are in the blast radius.",
    });
    requiredGates.push("rls-inventory");
  }
  if (kinds.has("network_egress")) {
    bundles.push({
      id: "governed-egress",
      reason: "Egress authority is in the blast radius.",
    });
    requiredGates.push("egress-classification");
  }
  if (kinds.has("state_resource")) {
    bundles.push({
      id: "state-ownership",
      reason: "State ownership resources are in the blast radius.",
    });
    requiredGates.push("lease-idempotency");
  }
  if (kinds.has("agent") || kinds.has("saga") || kinds.has("event_stream")) {
    bundles.push({
      id: "orchestration-boundary",
      reason: "Agent, saga, or event nodes are in the blast radius.",
    });
    requiredGates.push("saga-compensation");
  }

  for (const node of subject.nodes) {
    if (node.kind === "test_module") {
      const covers = subject.edges.some(
        (edge) => edge.from === node.id && edge.kind === "tests" && slice.has(edge.to),
      );
      if (covers) requiredTests.push(node.source);
    }
  }

  if (impact.unmappedChangedFiles.length) {
    reviewGates.push("unmapped-path-review");
    manualReview.push(
      `Unmapped changed file treated as review-required: ${impact.unmappedChangedFiles.join(", ")}`,
    );
  }
  if (!requiredTests.length && impact.changedNodes.length) {
    reviewGates.push("missing-test-mapping");
    manualReview.push("No test module maps onto the changed slice.");
  }

  return {
    schemaVersion: "1.0",
    selectedBundles: bundles,
    requiredTests: [...new Set(requiredTests)].sort(),
    requiredGates: [...new Set(requiredGates)].sort(),
    reviewGates: [...new Set(reviewGates)].sort(),
    manualReview,
  };
}

export function auditCompleteness(subject: SubjectProfile, graph: GraftGraph): CompletenessReport {
  const unacknowledged = subject.findings
    .filter((f) => f.blocking && !subject.acknowledgedFindingIds.includes(f.id))
    .map((f) => f.id);
  const acknowledged = subject.acknowledgedFindingIds.filter((id) =>
    subject.findings.some((f) => f.id === id),
  );
  const missingEvidence = graph.edges
    .filter((edge) => edge.layer === "overlay" && !edge.evidence)
    .map((edge) => `${edge.from}->${edge.to}`);
  return {
    schemaVersion: "1.0",
    integrityPass: unacknowledged.length === 0 && missingEvidence.length === 0,
    unacknowledgedBlocking: unacknowledged,
    acknowledged,
    missingEvidence,
  };
}

export function adjudicate(subject: SubjectProfile, impact: ImpactReport): AdjudicationRow[] {
  const slice = new Set([
    ...impact.changedNodes.map((n) => n.id),
    ...impact.upstreamConsumers.map((n) => n.id),
    ...impact.downstreamDependencies.map((n) => n.id),
  ]);
  const nodes = nodeMap(subject.nodes);

  return subject.findings.map((finding) => {
    const applicable = finding.relatedNodes.some((id) => slice.has(id));
    if (!applicable) {
      return {
        findingId: finding.id,
        title: finding.title,
        applicable: false,
        binding: "unknown",
        schema: "unknown",
        consumption: "unknown",
        status: "NOT_APPLICABLE",
        note: "Outside the instantiated change slice.",
      };
    }

    let binding: AdjudicationRow["binding"] = "unknown";
    if (finding.expectedBinding) {
      binding = subject.edges.some(
        (edge) =>
          edge.from === finding.expectedBinding!.from &&
          edge.to === finding.expectedBinding!.to &&
          edge.kind === finding.expectedBinding!.kind,
      )
        ? "present"
        : "missing";
    }

    let schema: AdjudicationRow["schema"] = "unknown";
    if (finding.expectedBinding && finding.schemaTargetKind) {
      const target = nodes.get(finding.expectedBinding.to);
      schema = target?.kind === finding.schemaTargetKind ? "accepted" : "rejected";
    }

    let consumption: AdjudicationRow["consumption"] = "unknown";
    if (finding.expectedConsumption) {
      consumption = subject.edges.some(
        (edge) =>
          edge.from === finding.expectedConsumption!.from &&
          edge.to === finding.expectedConsumption!.to &&
          edge.kind === finding.expectedConsumption!.kind,
      )
        ? "consumed"
        : "unconsumed";
    }

    let status: AdjudicationRow["status"] = "INDETERMINATE";
    let note = "Residual: one or more proof stages remain unknown.";
    const open = finding.proofMode === "open";
    if (open) {
      if (binding === "present" && schema === "accepted" && consumption === "consumed") {
        status = "SATISFIED";
        note = "Open residual closed by complete proof.";
      } else {
        status = "INDETERMINATE";
        note = "Open residual. Completeness is not forced.";
      }
    } else if (binding === "missing") {
      status = "VIOLATED";
      note = "Missing authoritative binding.";
    } else if (schema === "rejected") {
      status = "VIOLATED";
      note = "Binding present but schema-rejected.";
    } else if (consumption === "unconsumed") {
      status = "VIOLATED";
      note = "Schema-valid binding is not proof of behavioral consumption.";
    } else if (binding === "present" && schema === "accepted" && consumption === "consumed") {
      status = "SATISFIED";
      note = "Applicability, binding, schema, and consumption all hold.";
    }

    return {
      findingId: finding.id,
      title: finding.title,
      applicable: true,
      binding,
      schema,
      consumption,
      status,
      note,
    };
  });
}

export function composeDecision(
  impact: ImpactReport,
  proof: ProofManifest,
  completeness: CompletenessReport,
  adjudication: AdjudicationRow[],
): DecisionManifest {
  const blockingReasons: string[] = [];
  const reviewReasons: string[] = [...proof.manualReview];
  const warnings: string[] = [];

  if (!completeness.integrityPass) {
    const suffix = completeness.unacknowledgedBlocking.length
      ? `: ${completeness.unacknowledgedBlocking.join(", ")}`
      : "";
    blockingReasons.push(`Completeness integrity failed${suffix}`);
  }
  for (const gate of proof.reviewGates) {
    reviewReasons.push(`Review-only gate required: ${gate}`);
  }

  const applicable = adjudication.filter((row) => row.applicable);
  const counts = {
    satisfied: applicable.filter((r) => r.status === "SATISFIED").length,
    violated: applicable.filter((r) => r.status === "VIOLATED").length,
    indeterminate: applicable.filter((r) => r.status === "INDETERMINATE").length,
  };

  for (const row of applicable) {
    if (row.status === "VIOLATED") {
      if (completeness.unacknowledgedBlocking.includes(row.findingId)) continue;
      if (completeness.acknowledged.includes(row.findingId)) {
        reviewReasons.push(`Acknowledged violation is not a repair: ${row.findingId}`);
      } else {
        reviewReasons.push(`Applicable violation: ${row.findingId}`);
      }
    }
    if (row.status === "INDETERMINATE") {
      reviewReasons.push(`Applicable residual remains INDETERMINATE: ${row.findingId}`);
    }
  }

  if (counts.indeterminate) {
    warnings.push(
      `${counts.indeterminate} applicable finding(s) remain INDETERMINATE. Conservative residual tracking is required.`,
    );
  }
  if (impact.unmappedChangedFiles.length) {
    warnings.push("An unmapped changed file is never treated as safe.");
  }

  const disposition: DecisionManifest["disposition"] = blockingReasons.length
    ? "blocked"
    : reviewReasons.length
      ? "review-required"
      : "clear";

  return {
    schemaVersion: "1.1",
    disposition,
    mergeAuthorization: "not-determined",
    blockingReasons: [...new Set(blockingReasons)].sort(),
    reviewReasons: [...new Set(reviewReasons)].sort(),
    warnings: [...new Set(warnings)].sort(),
    counts,
  };
}

function sliceIds(impact: ImpactReport): Set<string> {
  return new Set([
    ...impact.changedNodes.map((n) => n.id),
    ...impact.upstreamConsumers.map((n) => n.id),
    ...impact.downstreamDependencies.map((n) => n.id),
  ]);
}

export function compileTruth(subject: SubjectProfile, impact: ImpactReport): TruthGraph {
  const slice = sliceIds(impact);
  const changed = new Set(impact.changedFiles);
  const facts: SlicedFact[] = subject.facts.map((item) => {
    const always =
      item.kind === "freshness" || item.kind === "reference" || item.referenceOnly === true;
    const nodeHit = item.nodes.some((id) => slice.has(id));
    const pathHit = item.evidence.some((ev) => changed.has(ev.path));
    return { ...item, inSlice: always || nodeHit || pathHit };
  });
  const derivedDependencies = subject.edges
    .filter((edge) => slice.has(edge.from) || slice.has(edge.to))
    .map((edge) => ({
      from: edge.from,
      to: edge.to,
      kind: edge.kind,
      evidence: edge.evidence,
      layer: edge.layer,
    }));
  return {
    schemaVersion: TRUTH_SCHEMA_VERSION,
    subjectId: subject.id,
    provenance: subject.provenance,
    capabilities: subject.capabilities.map((cap) => ({
      ...cap,
      inSlice: cap.nodes.some((id) => slice.has(id)),
    })),
    facts,
    derivedDependencies,
  };
}

export function factsForPlanner(
  packet: PipelinePacket,
): PlannerFactPacket {
  const inSlice = packet.truth.facts.filter((f) => f.inSlice);
  return {
    schemaVersion: TRUTH_SCHEMA_VERSION,
    product: "G.R.A.F.T.+",
    role: "fact-substrate",
    implementsPlan: false,
    mergeAuthorization: "not-determined",
    provenance: packet.truth.provenance,
    subjectId: packet.subjectId,
    changedFiles: packet.changedFiles,
    unmappedChangedFiles: packet.impact.unmappedChangedFiles,
    sliceNodeIds: [
      ...packet.impact.changedNodes,
      ...packet.impact.upstreamConsumers,
      ...packet.impact.downstreamDependencies,
    ].map((n) => n.id),
    byKind: inSlice.length ? indexByKind(inSlice) : emptyKindIndex(),
    derivedDependencies: packet.truth.derivedDependencies,
    note: PLANNER_NOTE,
  };
}

export function runPipeline(subject: SubjectProfile, changedFiles: string[]): PipelinePacket {
  const graph = buildGraph(subject);
  const impact = analyzeImpact(subject, changedFiles);
  const proof = selectProof(subject, impact);
  const completeness = auditCompleteness(subject, graph);
  const adjudicationRows = adjudicate(subject, impact);
  const decision = composeDecision(impact, proof, completeness, adjudicationRows);
  const truth = compileTruth(subject, impact);
  const residuals: Residual[] = [
    ...graph.residuals,
    ...impact.unmappedChangedFiles.map((file) => ({
      id: `unmapped:${file}`,
      category: "unmapped" as const,
      detail: `Changed file is not mapped to a graph node: ${file}`,
    })),
  ];
  const packet: PipelinePacket = {
    subjectId: subject.id,
    changedFiles,
    graph: { ...graph, residuals },
    impact,
    proof,
    completeness,
    adjudication: adjudicationRows,
    decision,
    truth,
    fingerprint: "",
  };
  packet.fingerprint = fingerprint({
    subject: subject.id,
    files: changedFiles,
    disposition: decision.disposition,
    counts: decision.counts,
    truth: truth.schemaVersion,
    factIds: truth.facts.filter((f) => f.inSlice).map((f) => f.id),
  });
  return packet;
}

export function evaluateTransfer(): TransferCheck[] {
  const ajUnmapped = runPipeline(AJENDA, ["docs/notes.md"]);
  const opUnmapped = runPipeline(OMNIPATH, ["HETZNER_DEPLOYMENT_GUIDE.md"]);
  const ajLease = runPipeline(AJENDA, ["backend/services/lease.py"]);
  const opGov = runPipeline(OMNIPATH, ["backend/agents/factory/agent_factory.py"]);
  const packets = [ajUnmapped, opUnmapped, ajLease, opGov];

  return [
    {
      id: "schema",
      statement: "Same core schema version on both subjects",
      holds: ajLease.graph.schemaVersion === opGov.graph.schemaVersion,
      note: ajLease.graph.schemaVersion,
    },
    {
      id: "unmapped",
      statement: "Unmapped changed files never dispose as clear",
      holds:
        ajUnmapped.decision.disposition !== "clear" &&
        opUnmapped.decision.disposition !== "clear",
      note: `${ajUnmapped.decision.disposition} / ${opUnmapped.decision.disposition}`,
    },
    {
      id: "merge",
      statement: "Merge authorization remains not-determined",
      holds: packets.every((p) => p.decision.mergeAuthorization === "not-determined"),
      note: "Architecture analysis does not claim merge authority.",
    },
    {
      id: "ack",
      statement: "Acknowledgements are not treated as repairs",
      holds: AJENDA.acknowledgedFindingIds.length > 0 && OMNIPATH.acknowledgedFindingIds.length > 0,
      note: "Known violations stay visible on the graph.",
    },
    {
      id: "stages",
      statement: "Adjudication keeps independent proof stages",
      holds: packets.every((p) =>
        p.adjudication.every((row) => row.binding && row.schema && row.consumption),
      ),
      note: "Applicability, binding, schema, consumption remain separate.",
    },
  ];
}
