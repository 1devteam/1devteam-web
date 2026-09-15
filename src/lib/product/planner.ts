import { factsForPlanner } from "../graft/engine.ts";
import type { PipelinePacket, SlicedFact } from "../graft/types.ts";
import { isoNow } from "./hash.ts";
import type { Acceptance, Phase, ProjectPlan, Role, Task } from "./types.ts";

function acceptance(id: string, statement: string): Acceptance {
  return { id, statement, satisfied: false };
}

function task(partial: Omit<Task, "retries" | "maxRetries" | "tests" | "reviews" | "evidenceIds" | "notes" | "state"> & {
  state?: Task["state"];
}): Task {
  return {
    retries: 0,
    maxRetries: 3,
    tests: [],
    reviews: [],
    evidenceIds: [],
    notes: [],
    state: partial.state ?? "queued",
    ...partial,
  };
}

function factFiles(fact: SlicedFact): string[] {
  return [...new Set(fact.evidence.map((e) => e.path))];
}

export function proposePlan(
  packet: PipelinePacket,
  existing?: { plan: ProjectPlan; tasks: Task[] },
): { plan: ProjectPlan; tasks: Task[] } {
  const facts = factsForPlanner(packet);
  const done = new Map((existing?.tasks ?? []).filter((t) => t.state === "done").map((t) => [t.id, t]));
  const tasks: Task[] = [];
  const phases: Phase[] = [];

  const inventory = facts.byKind.inventory.filter((f) => f.inSlice);
  const negatives = facts.byKind.negative.filter((f) => f.inSlice);
  const gaps = facts.byKind.gap.filter((f) => f.inSlice);
  const contracts = facts.byKind.contract.filter((f) => f.inSlice);
  const proofs = facts.byKind.proof.filter((f) => f.inSlice);

  const freeze = task({
    id: "t-sub-freeze",
    phaseId: "substrate",
    title: "Lock generated inventory",
    detail: `Treat ${inventory.length || packet.impact.changedNodes.length} inventory/ownership facts as the planning substrate. G.R.A.F.T.+ does not choose the correction.`,
    role: "architect",
    files: packet.changedFiles,
    factIds: inventory.map((f) => f.id),
    findingIds: [],
    dependsOn: [],
    mustNotChange: [],
    acceptance: [
      acceptance("a1", "Planner packet implementsPlan is false."),
      acceptance("a2", "Merge authorization remains not-determined."),
    ],
  });
  tasks.push(freeze);
  phases.push({
    id: "substrate",
    title: "Substrate",
    intent: "Freeze the G.R.A.F.T.+ inventory before any correction sequence.",
    taskIds: [freeze.id],
  });

  const constraintIds: string[] = [];
  for (const fact of negatives) {
    const id = `t-neg-${fact.id}`;
    const item = task({
      id,
      phaseId: "constraints",
      title: `Honor negative: ${fact.claim.slice(0, 72)}`,
      detail: fact.claim,
      role: "architect",
      files: factFiles(fact),
      factIds: [fact.id],
      findingIds: fact.relatedFindingIds ?? [],
      dependsOn: [freeze.id],
      mustNotChange: fact.mustNotChange ?? [],
      acceptance: [
        acceptance("n1", `Do not rewrite: ${(fact.mustNotChange ?? []).join(", ") || "listed negatives"}.`),
        acceptance("n2", "Reference-only facts are not implementation decisions."),
      ],
    });
    tasks.push(item);
    constraintIds.push(id);
  }
  if (!constraintIds.length) {
    const id = "t-neg-none";
    tasks.push(
      task({
        id,
        phaseId: "constraints",
        title: "No in-slice negatives",
        detail: "No must-not-change boundaries in this slice. Still do not import reference facts.",
        role: "architect",
        files: packet.changedFiles,
        factIds: [],
        findingIds: [],
        dependsOn: [freeze.id],
        mustNotChange: [],
        acceptance: [acceptance("n0", "Reference facts stay out of ownership.")],
      }),
    );
    constraintIds.push(id);
  }
  phases.push({
    id: "constraints",
    title: "Constraints",
    intent: "Negatives and must-not-change paths are planning gates, not suggestions.",
    taskIds: constraintIds,
  });

  const residualIds: string[] = [];
  const residualSources = [...gaps, ...contracts.filter((c) => c.stale || c.declared !== c.observed)];
  for (const fact of residualSources) {
    const related = packet.adjudication.filter(
      (row) => row.applicable && (fact.relatedFindingIds ?? []).includes(row.findingId),
    );
    const blocked = related.some((row) => row.status === "VIOLATED") && packet.decision.disposition === "blocked";
    const id = `t-gap-${fact.id}`;
    residualIds.push(id);
    tasks.push(
      task({
        id,
        phaseId: "residuals",
        title: `Investigate ${fact.kind}: ${fact.claim.slice(0, 64)}`,
        detail: `${fact.claim} Acknowledgement is not a repair. The planner may sequence investigation; it may not silently close a residual.`,
        role: "coder",
        files: factFiles(fact),
        factIds: [fact.id],
        findingIds: fact.relatedFindingIds ?? [],
        dependsOn: [freeze.id, ...constraintIds],
        mustNotChange: fact.mustNotChange ?? [],
        state: blocked ? "blocked" : "queued",
        blockedReason: blocked ? "Graft disposition is blocked on this slice." : undefined,
        acceptance: [
          acceptance("g1", "Residual remains visible on the G.R.A.F.T.+ graph."),
          acceptance("g2", "Any edit lives on a task worktree, not on HEAD."),
        ],
      }),
    );
  }
  for (const file of packet.impact.unmappedChangedFiles) {
    const id = `t-unmap-${file.replace(/[^\w]+/g, "-").slice(0, 40)}`;
    residualIds.push(id);
    tasks.push(
      task({
        id,
        phaseId: "residuals",
        title: `Review unmapped file ${file}`,
        detail: "Unmapped changed files never dispose as clear. Manual review is required.",
        role: "reviewer",
        files: [file],
        factIds: [],
        findingIds: [],
        dependsOn: [freeze.id],
        mustNotChange: [],
        acceptance: [acceptance("u1", "File is mapped or remains review-required.")],
      }),
    );
  }
  if (!residualIds.length) {
    const id = "t-gap-none";
    residualIds.push(id);
    tasks.push(
      task({
        id,
        phaseId: "residuals",
        title: "No in-slice residual requiring investigation",
        detail: "Slice has no gap/contract residual. Proof still required.",
        role: "coder",
        files: packet.changedFiles,
        factIds: [],
        findingIds: [],
        dependsOn: [freeze.id],
        mustNotChange: [],
        acceptance: [acceptance("g0", "Disposition remains whatever G.R.A.F.T.+ reported.")],
      }),
    );
  }
  phases.push({
    id: "residuals",
    title: "Residuals",
    intent: "Gaps, stale contracts, and unmapped paths become tasks. They are not auto-repaired.",
    taskIds: residualIds,
  });

  const proofIds: string[] = [];
  const required = packet.proof.requiredTests;
  if (required.length) {
    for (const testPath of required) {
      const id = `t-prf-${testPath.replace(/[^\w]+/g, "-").slice(0, 40)}`;
      proofIds.push(id);
      tasks.push(
        task({
          id,
          phaseId: "proof",
          title: `Run mapped test ${testPath}`,
          detail: "Proof selection came from blast radius, not from the planner.",
          role: "coder",
          files: [testPath],
          factIds: proofs.map((f) => f.id),
          findingIds: [],
          dependsOn: residualIds,
          mustNotChange: [],
          acceptance: [acceptance("p1", "Test result is recorded on the task.")],
        }),
      );
    }
  } else {
    const id = "t-prf-missing";
    proofIds.push(id);
    tasks.push(
      task({
        id,
        phaseId: "proof",
        title: "Record missing-test mapping",
        detail: packet.proof.manualReview.join(" ") || "No test module maps onto the changed slice.",
        role: "reviewer",
        files: packet.changedFiles,
        factIds: proofs.map((f) => f.id),
        findingIds: [],
        dependsOn: residualIds,
        mustNotChange: [],
        acceptance: [acceptance("p0", "Missing test mapping stays a review gate.")],
      }),
    );
  }
  phases.push({
    id: "proof",
    title: "Proof",
    intent: "Required tests and review gates selected by G.R.A.F.T.+ proof, not invented by the planner.",
    taskIds: proofIds,
  });

  const verify = task({
    id: "t-ver-browser",
    phaseId: "verify",
    title: "Attach browser or in-app evidence",
    detail: "Screenshot evidence and in-app packet checks. This product cannot drive an arbitrary ingested app's browser.",
    role: "reviewer",
    files: packet.changedFiles,
    factIds: facts.byKind.runtime.map((f) => f.id),
    findingIds: [],
    dependsOn: proofIds,
    mustNotChange: [],
    acceptance: [
      acceptance("v1", "At least one evidence record is attached."),
      acceptance("v2", "Packet still reports implementsPlan false."),
    ],
  });
  tasks.push(verify);
  phases.push({
    id: "verify",
    title: "Verify",
    intent: "Evidence is tied to tasks. Merge stays not-determined.",
    taskIds: [verify.id],
  });

  const merged = tasks.map((item) => {
    const prior = done.get(item.id);
    if (!prior) return item;
    return {
      ...item,
      state: "done" as const,
      tests: prior.tests,
      reviews: prior.reviews,
      evidenceIds: prior.evidenceIds,
      worktreeId: prior.worktreeId,
      notes: prior.notes,
      acceptance: item.acceptance.map((a) => ({ ...a, satisfied: true })),
    };
  });

  const summary = [
    `Consumes G.R.A.F.T.+ packet ${packet.fingerprint}.`,
    `Disposition ${packet.decision.disposition}; merge authorization not-determined.`,
    `${gaps.length} gap(s), ${negatives.length} negative(s), ${packet.impact.unmappedChangedFiles.length} unmapped file(s).`,
    "This plan does not inherit merge authority and does not treat acknowledgements as repairs.",
  ].join(" ");

  const plan: ProjectPlan = {
    version: (existing?.plan.version ?? 0) + 1,
    proposedAt: isoNow(),
    proposedBy: "architect",
    summary,
    packetFingerprint: packet.fingerprint,
    graftDisposition: packet.decision.disposition,
    consumes: {
      product: "G.R.A.F.T.+",
      role: "fact-substrate",
      implementsPlan: false,
      mergeAuthorization: "not-determined",
    },
    phases,
  };

  void facts.implementsPlan;
  return { plan, tasks: merged };
}

export function roleForView(viewRole: Role, tasks: Task[]): Task[] {
  if (viewRole === "dispatcher") return tasks;
  if (viewRole === "architect") return tasks.filter((t) => t.role === "architect" || t.state === "escalated");
  return tasks.filter((t) => t.role === viewRole || t.state === "escalated");
}
