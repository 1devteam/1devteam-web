import { factsForPlanner, runPipeline } from "../graft/engine.ts";
import type { Finding, GraftEdge, GraftNode, SubjectProfile, TruthFact } from "../graft/types.ts";
import type { GithubCompare } from "./github.ts";
import { rankPath } from "./paths.ts";
import type { IngestedFile, Project, ProjectOrigin, RefreshDelta } from "./types.ts";
import { isoNow, uid } from "./hash.ts";
import { honestyFindings, prepareIngest } from "./ingest.ts";
import { initGit } from "./git.ts";

export type RefreshResult = {
  project: Project;
  previousSha?: string;
  nextSha?: string;
  unchangedSha: boolean;
  packetImplementsPlan: false;
  delta: RefreshDelta;
};

const SLICE_MAX = 24;

export function diffIngestedFiles(prior: IngestedFile[], next: IngestedFile[]) {
  const prev = new Map(prior.map((file) => [file.path, file.content]));
  const nxt = new Map(next.map((file) => [file.path, file.content]));
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  let unchanged = 0;
  for (const [path, content] of nxt) {
    if (!prev.has(path)) added.push(path);
    else if (prev.get(path) !== content) changed.push(path);
    else unchanged += 1;
  }
  for (const path of prev.keys()) {
    if (!nxt.has(path)) removed.push(path);
  }
  added.sort();
  removed.sort();
  changed.sort();
  return { added, removed, changed, unchanged };
}

export function diffGeneratedNodes(prior: GraftNode[], next: GraftNode[]) {
  const prev = new Set(prior.filter((node) => node.layer === "generated").map((node) => node.id));
  const nxt = new Set(next.filter((node) => node.layer === "generated").map((node) => node.id));
  return {
    nodesAdded: [...nxt].filter((id) => !prev.has(id)).sort(),
    nodesDropped: [...prev].filter((id) => !nxt.has(id)).sort(),
  };
}

export function computeRefreshDelta(input: {
  priorFiles: IngestedFile[];
  priorNodes: GraftNode[];
  nextFiles: IngestedFile[];
  nextNodes: GraftNode[];
  fromSha?: string;
  toSha?: string;
  compare?: GithubCompare | null;
}): RefreshDelta {
  const tree = diffIngestedFiles(input.priorFiles, input.nextFiles);
  const nodes = diffGeneratedNodes(input.priorNodes, input.nextNodes);
  if (input.compare) {
    const added: string[] = [];
    const removed: string[] = [];
    const changed: string[] = [];
    for (const file of input.compare.files) {
      if (file.status === "added") added.push(file.path);
      else if (file.status === "removed") removed.push(file.path);
      else changed.push(file.path);
    }
    added.sort();
    removed.sort();
    changed.sort();
    return {
      capturedAt: isoNow(),
      fromSha: input.compare.base,
      toSha: input.compare.head,
      source: "github-compare",
      added,
      removed,
      changed,
      unchanged: tree.unchanged,
      nodesAdded: nodes.nodesAdded,
      nodesDropped: nodes.nodesDropped,
      truncated: input.compare.truncated,
      compareUrl: input.compare.htmlUrl,
    };
  }
  return {
    capturedAt: isoNow(),
    fromSha: input.fromSha,
    toSha: input.toSha,
    source: "ingested-tree",
    added: tree.added,
    removed: tree.removed,
    changed: tree.changed,
    unchanged: tree.unchanged,
    nodesAdded: nodes.nodesAdded,
    nodesDropped: nodes.nodesDropped,
  };
}

function byRank(a: string, b: string) {
  return rankPath(b) - rankPath(a) || a.localeCompare(b);
}

export function roundSliceFromDelta(
  delta: RefreshDelta,
  ingestedPaths: Set<string>,
  fallback: string[],
): string[] {
  const round = [...delta.changed, ...delta.added];
  if (!round.length && !delta.removed.length) return fallback;
  const inTree = round.filter((path) => ingestedPaths.has(path)).sort(byRank);
  const unmapped = round.filter((path) => !ingestedPaths.has(path)).sort(byRank);
  const removed = [...delta.removed].sort(byRank).slice(0, 4);
  const picked = [...inTree.slice(0, 20), ...unmapped.slice(0, 8), ...removed];
  const unique = [...new Set(picked)].slice(0, SLICE_MAX);
  return unique.length ? unique : fallback;
}

function overlayMissingFindings(overlay: GraftNode[], paths: Set<string>, sha: string): Finding[] {
  return overlay
    .filter((node) => node.source && !paths.has(node.source) && !node.source.startsWith("UNMAPPED"))
    .map((node) => ({
      id: `REFRESH-missing-${node.id}`,
      title: `Overlay ${node.label} source is not in the refreshed tree`,
      detail: `${node.source} is absent at ${sha.slice(0, 12)}. The overlay relationship stays INDETERMINATE.`,
      relatedNodes: [node.id],
      blocking: false,
      proofMode: "open" as const,
    }));
}

function mergeGenerated(
  prepared: SubjectProfile,
  prior: GraftNode[],
  priorEdges: GraftEdge[],
  filePaths: Set<string>,
): { nodes: GraftNode[]; edges: GraftEdge[]; facts: TruthFact[] } {
  const kept = prior.filter((node) => node.layer === "generated" && filePaths.has(node.source));
  const covered = new Set(kept.map((node) => node.source));
  const remap = new Map<string, string>();
  for (const node of prepared.nodes) {
    const existing = kept.find((item) => item.source === node.source);
    remap.set(node.id, existing?.id ?? node.id);
  }
  const additions = prepared.nodes
    .filter((node) => !covered.has(node.source))
    .map((node) => ({ ...node, id: remap.get(node.id) ?? node.id, layer: "generated" as const }));
  const nodes = [...kept, ...additions];
  const known = new Set(nodes.map((node) => node.id));
  const edges: GraftEdge[] = [];
  const edgeSeen = new Set<string>();
  function push(edge: GraftEdge) {
    if (!known.has(edge.from) || !known.has(edge.to) || edge.from === edge.to) return;
    const key = `${edge.from}->${edge.to}:${edge.kind}:${edge.layer}`;
    if (edgeSeen.has(key)) return;
    edgeSeen.add(key);
    edges.push(edge);
  }
  for (const edge of priorEdges) {
    if (edge.layer === "generated") push(edge);
  }
  for (const edge of prepared.edges) {
    push({
      ...edge,
      from: remap.get(edge.from) ?? edge.from,
      to: remap.get(edge.to) ?? edge.to,
      layer: "generated",
    });
  }
  const facts = prepared.facts
    .filter((fact) => fact.kind !== "negative")
    .map((fact) => ({
      ...fact,
      nodes: fact.nodes.map((id) => remap.get(id) ?? id),
    }));
  return { nodes, edges, facts };
}

export function mergeRefreshedProfile(
  prior: SubjectProfile,
  files: IngestedFile[],
  origin: ProjectOrigin,
): { profile: SubjectProfile; omitted: number } {
  const prepared = prepareIngest(prior.name, files, {
    repoHint: origin.url ?? (origin.owner && origin.repo ? `${origin.owner}/${origin.repo}` : prior.repoHint),
    sha: origin.sha,
    truncated: origin.truncated,
    omitted: origin.omitted,
    omittedPaths: origin.omittedPaths,
    omittedNotes: origin.omittedNotes,
    skippedRoots: origin.skippedRoots,
  });
  const paths = new Set(prepared.files.map((file) => file.path));
  const generated = mergeGenerated(prepared.profile, prior.nodes, prior.edges, paths);
  const overlayNodes = prior.nodes.filter((node) => node.layer !== "generated");
  const overlayEdges = prior.edges.filter((edge) => edge.layer !== "generated");
  const overlayFacts: TruthFact[] = prior.facts
    .filter((fact) => fact.capability !== "ingested")
    .map((fact) => {
      const missing = fact.evidence.some((ev) => ev.path && ev.path !== "." && !paths.has(ev.path));
      return missing ? { ...fact, stale: true, gapKind: fact.gapKind ?? "stale" } : { ...fact, stale: false };
    });
  const sha = origin.sha ?? "";
  const capturedAt = isoNow();
  const refreshFindings = overlayMissingFindings(overlayNodes, paths, sha);
  const keptFindings = prior.findings.filter(
    (finding) =>
      !finding.id.startsWith("REFRESH-") &&
      !finding.id.startsWith("OMIT-") &&
      !finding.id.startsWith("SKIP-"),
  );
  const omitFindings = honestyFindings({
    omitted: prepared.omitted,
    omittedPaths: prepared.omittedPaths,
    omittedNotes: origin.omittedNotes,
    skippedRoots: origin.skippedRoots,
    truncated: origin.truncated,
    graphDropped: prepared.files
      .filter((file) => !prepared.profile.nodes.some((n) => n.source === file.path))
      .map((file) => file.path),
    relatedNodes: generated.nodes.map((n) => n.id),
  });
  const overlayNodeIds = new Set(overlayNodes.map((n) => n.id));
  const nodes = [...generated.nodes.filter((node) => !overlayNodeIds.has(node.id)), ...overlayNodes];
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edgeSeen = new Set<string>();
  const edges: GraftEdge[] = [];
  for (const edge of [...generated.edges, ...overlayEdges]) {
    const key = `${edge.from}->${edge.to}:${edge.kind}:${edge.layer}`;
    if (edgeSeen.has(key)) continue;
    edgeSeen.add(key);
    edges.push(edge);
  }
  const ingestedCap = prepared.profile.capabilities.find((c) => c.id === "ingested");
  const capabilities = [
    ...prior.capabilities.filter((c) => c.id !== "ingested"),
    ingestedCap ? { ...ingestedCap, nodes: generated.nodes.map((n) => n.id) } : undefined,
  ].filter(Boolean) as SubjectProfile["capabilities"];

  const unresolvedOpen: Finding[] = generated.facts.some((f) => f.kind === "gap")
    ? [
        {
          id: "REFRESH-unresolved-generated",
          title: "Unresolved generated relationships remain INDETERMINATE",
          detail: "Imports or calls that did not resolve in this tree are unproven, not violations.",
          relatedNodes: generated.nodes
            .slice(0, 3)
            .map((n) => n.id)
            .filter((id) => nodeIds.has(id)),
          blocking: false,
          proofMode: "open",
        },
      ]
    : [];

  const profile: SubjectProfile = {
    ...prior,
    files: [...new Set([...prepared.profile.files, ...prior.scenarios.flatMap((s) => s.files)])],
    nodes,
    edges,
    facts: [...overlayFacts, ...generated.facts],
    findings: [...keptFindings, ...refreshFindings, ...unresolvedOpen, ...omitFindings],
    capabilities,
    provenance: {
      kind: "source-backed",
      repo: origin.owner && origin.repo ? `${origin.owner}/${origin.repo}` : prior.provenance.repo,
      ref: origin.ref,
      sha: origin.sha,
      capturedAt,
      readOnly: true,
      note: `Read-only refresh at ${origin.ref ?? "HEAD"}@${(origin.sha ?? "").slice(0, 12)}. Generated layer overwritten. Reviewed overlay preserved.`,
    },
    dna: `${prior.name} reconstructed read-only from ${origin.ref ?? "HEAD"}@${(origin.sha ?? "unknown").slice(0, 12)}. Overlay preserved. Not a planner.`,
  };
  return { profile, omitted: prepared.omitted };
}

export function applyGithubRefresh(
  project: Project,
  files: IngestedFile[],
  origin: ProjectOrigin,
  compare?: GithubCompare | null,
): RefreshResult {
  const previousSha = project.origin?.sha ?? project.profile.provenance.sha;
  const prepared = prepareIngest(project.name, files, {
    repoHint: origin.url ?? (origin.owner && origin.repo ? `${origin.owner}/${origin.repo}` : project.profile.repoHint),
    sha: origin.sha,
    truncated: origin.truncated,
  });
  const { profile, omitted } = mergeRefreshedProfile(project.profile, files, origin);
  const paths = new Set(prepared.files.map((file) => file.path));
  const kept = project.changedFiles.filter((path) => paths.has(path));
  const fallback = kept.length > 0 ? kept : profile.files;
  const fallbackSlice = fallback.length ? fallback : [profile.files[0] ?? "README.md"];
  const delta = computeRefreshDelta({
    priorFiles: project.files,
    priorNodes: project.profile.nodes,
    nextFiles: prepared.files,
    nextNodes: profile.nodes,
    fromSha: previousSha,
    toSha: origin.sha,
    compare,
  });
  const slice = roundSliceFromDelta(delta, paths, fallbackSlice);
  const packet = runPipeline(profile, slice);
  const planner = factsForPlanner(packet);
  const nextSha = origin.sha;
  const unchangedSha = Boolean(previousSha && nextSha && previousSha === nextSha);
  const recordedDelta: RefreshDelta = {
    ...delta,
    omitted: prepared.omitted || origin.omitted,
    omittedPaths: prepared.omittedPaths,
    truncated: origin.truncated,
    subtree: origin.subtree,
  };
  const resolvedOrigin: ProjectOrigin = {
    ...origin,
    kind: "github",
    readOnly: true,
    omitted: origin.omitted ?? omitted,
    omittedPaths: prepared.omittedPaths,
  };
  const fromLabel = (recordedDelta.fromSha ?? "none").slice(0, 12);
  const toLabel = (recordedDelta.toSha ?? "HEAD").slice(0, 12);
  const next: Project = {
    ...project,
    updatedAt: isoNow(),
    profile,
    changedFiles: slice,
    files: prepared.files,
    index: prepared.index,
    plan: project.plan,
    tasks: project.tasks,
    worktrees: [],
    git: initGit(prepared.files, { sha: origin.sha, branch: origin.ref ?? "HEAD" }),
    secrets: prepared.secrets,
    lastPacketFingerprint: packet.fingerprint,
    lastDisposition: packet.decision.disposition,
    origin: resolvedOrigin,
    lastDelta: recordedDelta,
    activity: [
      {
        id: uid("act"),
        at: isoNow(),
        actor: "ingest" as const,
        title: "Refreshed reconstruction",
        detail: `Read-only ${resolvedOrigin.owner}/${resolvedOrigin.repo}@${toLabel} (${resolvedOrigin.ref ?? "HEAD"}). ${recordedDelta.source} ${fromLabel}→${toLabel}. ${recordedDelta.changed.length} changed, ${recordedDelta.added.length} added, ${recordedDelta.removed.length} removed${recordedDelta.omitted ? `, ${recordedDelta.omitted} omitted` : ""}${recordedDelta.subtree ? `, subtree ${recordedDelta.subtree}` : ""}. Previous snapshot overwritten. Overlay preserved. implementsPlan=${planner.implementsPlan}.`,
        projectId: project.id,
      },
      ...project.activity,
    ].slice(0, 80),
  };
  return { project: next, previousSha, nextSha, unchangedSha, packetImplementsPlan: false, delta: recordedDelta };
}
