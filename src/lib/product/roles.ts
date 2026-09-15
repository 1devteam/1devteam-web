import type { DispatchAction, Role, Task, TaskState } from "./types.ts";

export const TASK_STATES: TaskState[] = [
  "queued",
  "running",
  "paused",
  "retrying",
  "redirected",
  "escalated",
  "blocked",
  "done",
  "failed",
];

export const ROLES: { id: Role; label: string; owns: string }[] = [
  { id: "architect", label: "Architect", owns: "Plans, phases, and residuals from G.R.A.F.T.+ facts." },
  { id: "dispatcher", label: "Dispatcher", owns: "Queue, start, pause, retry, redirect, escalate." },
  { id: "coder", label: "Coder", owns: "Worktree edits against ingested files." },
  { id: "reviewer", label: "Reviewer", owns: "Diffs, tests, evidence, and accept/reject." },
];

const TRANSITIONS: Record<TaskState, TaskState[]> = {
  queued: ["running", "redirected", "escalated", "blocked", "failed"],
  running: ["paused", "retrying", "redirected", "escalated", "blocked", "done", "failed"],
  paused: ["running", "redirected", "escalated", "blocked", "failed"],
  retrying: ["running", "failed", "escalated", "blocked"],
  redirected: ["queued", "running"],
  escalated: ["queued", "running", "blocked", "failed"],
  blocked: ["queued", "escalated", "failed"],
  done: ["queued"],
  failed: ["queued", "escalated"],
};

export function canTransition(from: TaskState, to: TaskState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function actionTarget(action: DispatchAction, task: Task): TaskState {
  switch (action) {
    case "start":
      return task.state === "retrying" || task.state === "redirected" ? "running" : "running";
    case "pause":
      return "paused";
    case "retry":
      return "retrying";
    case "redirect":
      return "redirected";
    case "escalate":
      return "escalated";
    case "block":
      return "blocked";
    case "fail":
      return "failed";
    case "complete":
      return "done";
    case "requeue":
      return "queued";
    default:
      return task.state;
  }
}

export function dependenciesMet(task: Task, tasks: Task[]): boolean {
  return task.dependsOn.every((id) => tasks.find((t) => t.id === id)?.state === "done");
}

export function applyDispatch(
  task: Task,
  action: DispatchAction,
  options: { role?: Role; reason?: string; tasks?: Task[] } = {},
): { ok: true; task: Task } | { ok: false; reason: string } {
  const nextState = actionTarget(action, task);
  if (action === "start" && options.tasks && !dependenciesMet(task, options.tasks)) {
    return { ok: false, reason: "Dependencies are not done." };
  }
  if (action === "retry" && task.retries >= task.maxRetries) {
    return { ok: false, reason: "Retry budget exhausted." };
  }
  if (action === "complete") {
    const testsFailed = task.tests.some((t) => t.verdict === "fail");
    const rejected = task.reviews.some((r) => r.verdict === "reject");
    if (testsFailed) return { ok: false, reason: "Failing tests block completion." };
    if (rejected) return { ok: false, reason: "A reject review blocks completion." };
  }
  if (!canTransition(task.state, nextState)) {
    return { ok: false, reason: `Cannot ${action} from ${task.state}.` };
  }
  const next: Task = {
    ...task,
    state: nextState,
    retries: action === "retry" ? task.retries + 1 : task.retries,
    role: options.role ?? task.role,
    redirectedFrom: action === "redirect" ? task.role : task.redirectedFrom,
    blockedReason: action === "block" ? options.reason : nextState === "blocked" ? task.blockedReason : undefined,
    notes: options.reason ? [...task.notes, options.reason] : task.notes,
  };
  return { ok: true, task: next };
}
