import { factsForPlanner } from "@/lib/graft/engine";
import type { PipelinePacket } from "@/lib/graft/types";
import { activityIsClean } from "./secrets.ts";
import { isoNow, uid } from "./hash.ts";
import type { EvidenceRecord, Project, Task } from "./types.ts";

export const EVIDENCE_CATALOG: {
  id: string;
  path: string;
  label: string;
  seedKey?: "ajenda" | "omnipath";
  hint: string;
}[] = [
  { id: "ev-op-factory", path: "/evidence/omnipath-factory.png", label: "Factory slice graph", seedKey: "omnipath", hint: "factory" },
  { id: "ev-op-run", path: "/evidence/omnipath-run.png", label: "Omnipath run disposition", seedKey: "omnipath", hint: "saga" },
  { id: "ev-op-gov", path: "/evidence/omnipath-governance.png", label: "Governance residual", seedKey: "omnipath", hint: "pride" },
  { id: "ev-op-market", path: "/evidence/omnipath-marketplace.png", label: "Marketplace spend", seedKey: "omnipath", hint: "market" },
  { id: "ev-truth-gaps", path: "/evidence/truth-factory-gaps.png", label: "Factory gaps", seedKey: "omnipath", hint: "gap" },
  { id: "ev-truth-inv", path: "/evidence/truth-inventory.png", label: "Inventory facts", hint: "inventory" },
  { id: "ev-truth-neg", path: "/evidence/truth-negatives.png", label: "Negative boundaries", hint: "negative" },
  { id: "ev-truth-ref", path: "/evidence/truth-reference.png", label: "Reference facts", hint: "reference" },
  { id: "ev-schema", path: "/evidence/schema-pane.png", label: "Schema pane", hint: "schema" },
  { id: "ev-records", path: "/evidence/records-pane.png", label: "Frozen records", hint: "records" },
  { id: "ev-transfer", path: "/evidence/transfer-pane.png", label: "Two-subject transfer", hint: "transfer" },
  { id: "ev-node", path: "/evidence/node-selected.png", label: "Selected node", hint: "graph" },
];

export type CheckResult = {
  id: string;
  statement: string;
  verdict: "pass" | "fail" | "indeterminate";
  note: string;
};

export function runChecks(project: Project, packet: PipelinePacket, task?: Task): CheckResult[] {
  const planner = factsForPlanner(packet);
  const activity = project.activity.map((a) => a.detail).join("\n");
  const checks: CheckResult[] = [
    {
      id: "implements-plan",
      statement: "G.R.A.F.T.+ packet does not implement a plan",
      verdict: planner.implementsPlan === false ? "pass" : "fail",
      note: `role=${planner.role}`,
    },
    {
      id: "merge",
      statement: "Merge authorization remains not-determined",
      verdict: packet.decision.mergeAuthorization === "not-determined" ? "pass" : "fail",
      note: packet.decision.mergeAuthorization,
    },
    {
      id: "secrets",
      statement: "Activity log has no plaintext secrets",
      verdict: activityIsClean(activity) ? "pass" : "fail",
      note: `${project.secrets.length} fingerprint(s) isolated`,
    },
    {
      id: "worktree",
      statement: "Running coder tasks have a worktree",
      verdict: project.tasks
        .filter((t) => t.role === "coder" && t.state === "running")
        .every((t) => t.worktreeId)
        ? "pass"
        : "fail",
      note: `${project.worktrees.length} worktree(s)`,
    },
    {
      id: "browser-target",
      statement: "Browser evidence for this subject",
      verdict: project.kind === "custom" ? "indeterminate" : "pass",
      note:
        project.kind === "custom"
          ? "No browser target for an arbitrary ingested app. Attach your own screenshots."
          : "Seeded reconstruction screenshots are attached as evidence.",
    },
  ];
  if (task) {
    checks.push({
      id: "task-tests",
      statement: `Tests recorded for ${task.id}`,
      verdict: task.tests.length ? (task.tests.some((t) => t.verdict === "fail") ? "fail" : "pass") : "indeterminate",
      note: task.tests.length ? `${task.tests.length} result(s)` : "No test result yet",
    });
  }
  return checks;
}

export function evidenceFromChecks(
  checks: CheckResult[],
  taskId?: string,
  screenshot?: (typeof EVIDENCE_CATALOG)[number],
): EvidenceRecord[] {
  const at = isoNow();
  const records: EvidenceRecord[] = checks.map((check) => ({
    id: uid("ev"),
    taskId,
    kind: "in-app-check",
    label: check.statement,
    verdict: check.verdict,
    note: check.note,
    at,
  }));
  if (screenshot) {
    const failed = checks.some((c) => c.verdict === "fail");
    records.push({
      id: uid("shot"),
      taskId,
      kind: "screenshot",
      path: screenshot.path,
      label: screenshot.label,
      verdict: failed ? "fail" : "pass",
      note: "Workbench screenshot captured during reconstruction.",
      at,
    });
  }
  return records;
}

export function pickScreenshot(project: Project, task?: Task) {
  const hay = `${task?.title ?? ""} ${task?.detail ?? ""} ${project.seedKey ?? ""}`.toLowerCase();
  const bySeed = EVIDENCE_CATALOG.filter((e) => !e.seedKey || e.seedKey === project.seedKey);
  return bySeed.find((e) => hay.includes(e.hint)) ?? bySeed[0] ?? EVIDENCE_CATALOG[0];
}
