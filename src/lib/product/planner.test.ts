import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { factsForPlanner, runPipeline } from "../graft/engine.ts";
import { AJENDA, OMNIPATH } from "../graft/subjects.ts";
import { proposePlan } from "./planner.ts";

describe("architect planner", () => {
  it("consumes graft facts and never claims to implement a plan", () => {
    const packet = runPipeline(OMNIPATH, ["backend/agents/factory/agent_factory.py"]);
    const facts = factsForPlanner(packet);
    const { plan, tasks } = proposePlan(packet);
    assert.equal(facts.implementsPlan, false);
    assert.equal(plan.consumes.implementsPlan, false);
    assert.equal(plan.consumes.mergeAuthorization, "not-determined");
    assert.equal(plan.graftDisposition, packet.decision.disposition);
    assert.ok(tasks.some((t) => t.mustNotChange.includes("backend/agents/governance/pride_kernel.py")));
    assert.ok(tasks.some((t) => t.factIds.includes("OP-gap-pride-factory") || t.findingIds.includes("OP-pride-unconsumed")));
  });

  it("keeps unmapped files as review tasks and does not treat ack as repair", () => {
    const packet = runPipeline(AJENDA, ["backend/services/knowledge.py"]);
    const { plan, tasks } = proposePlan(packet);
    assert.notEqual(plan.graftDisposition, "clear");
    assert.ok(tasks.some((t) => t.detail.includes("Acknowledgement is not a repair") || t.factIds.includes("AJ-gap-knowledge-consume")));
  });

  it("preserves done tasks across revise", () => {
    const packet = runPipeline(AJENDA, ["backend/services/lease.py"]);
    const first = proposePlan(packet);
    first.tasks[0].state = "done";
    const second = proposePlan(packet, first);
    assert.equal(second.plan.version, 2);
    assert.equal(second.tasks.find((t) => t.id === first.tasks[0].id)?.state, "done");
  });
});
