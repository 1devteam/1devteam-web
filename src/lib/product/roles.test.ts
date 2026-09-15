import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyDispatch, canTransition } from "./roles.ts";
import type { Task } from "./types.ts";

function task(state: Task["state"], extra: Partial<Task> = {}): Task {
  return {
    id: "t1",
    phaseId: "p",
    title: "T",
    detail: "",
    role: "coder",
    state,
    retries: 0,
    maxRetries: 3,
    dependsOn: extra.dependsOn ?? [],
    files: [],
    acceptance: [],
    mustNotChange: [],
    factIds: [],
    findingIds: [],
    tests: extra.tests ?? [],
    reviews: extra.reviews ?? [],
    evidenceIds: [],
    notes: [],
    ...extra,
  };
}

describe("task state machine", () => {
  it("allows dispatcher start/pause/retry/redirect/escalate", () => {
    assert.equal(canTransition("queued", "running"), true);
    assert.equal(canTransition("running", "paused"), true);
    assert.equal(canTransition("running", "retrying"), true);
    assert.equal(canTransition("running", "redirected"), true);
    assert.equal(canTransition("running", "escalated"), true);
    assert.equal(canTransition("done", "failed"), false);
    const started = applyDispatch(task("queued"), "start");
    assert.equal(started.ok, true);
    const retried = applyDispatch(task("running"), "retry");
    assert.equal(retried.ok, true);
    if (retried.ok) assert.equal(retried.task.retries, 1);
  });

  it("blocks start when dependencies are open and complete when tests fail", () => {
    const blocked = applyDispatch(task("queued", { dependsOn: ["t0"] }), "start", {
      tasks: [task("queued", { id: "t0" })],
    });
    assert.equal(blocked.ok, false);
    const failedTests = applyDispatch(
      task("running", { tests: [{ id: "x", name: "unit", verdict: "fail", detail: "", at: "" }] }),
      "complete",
    );
    assert.equal(failedTests.ok, false);
  });
});
