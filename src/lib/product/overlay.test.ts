import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { factsForPlanner, runPipeline } from "../graft/engine.ts";
import { AJENDA } from "../graft/subjects.ts";
import { applyOverlayReview } from "./overlay.ts";
import { filesFromTextMap, prepareIngest } from "./ingest.ts";
import { applyGithubRefresh } from "./refresh.ts";
import { AJENDA_SOURCE } from "./seeds.ts";
import { initGit } from "./git.ts";
import type { Project } from "./types.ts";

function projectFrom(name: string, files: ReturnType<typeof filesFromTextMap>): Project {
  const prepared = prepareIngest(name, files, { repoHint: name, sha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
  return {
    id: "demo",
    name,
    kind: "custom",
    createdAt: "2026-09-14T00:00:00.000Z",
    updatedAt: "2026-09-14T00:00:00.000Z",
    profile: prepared.profile,
    changedFiles: [prepared.profile.files[0]!],
    files: prepared.files,
    index: prepared.index,
    plan: null,
    tasks: [],
    worktrees: [],
    git: initGit(prepared.files, { sha: prepared.profile.provenance.sha, branch: "main" }),
    secrets: prepared.secrets,
    evidence: [],
    activity: [],
    origin: {
      kind: "github",
      owner: "acme",
      repo: "demo",
      ref: "main",
      sha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      readOnly: true,
    },
  };
}

describe("reviewed overlay", () => {
  it("attaches overlay that refresh keeps, and missing source stays INDETERMINATE", () => {
    const before = projectFrom("Demo", filesFromTextMap({
      "src/app.ts": "export function boot() { return 1; }\n",
      "src/util.ts": "export function helper() { return 1; }\n",
    }));
    const fromId = before.profile.nodes.find((n) => n.source === "src/app.ts")!.id;
    const reviewed = applyOverlayReview(before.profile, {
      fromId,
      kind: "state_resource",
      edgeKind: "state_ownership",
      label: "session lock",
      evidencePath: "src/app.ts",
      domain: "runtime",
    });
    assert.equal(reviewed.error, undefined);
    assert.equal(reviewed.node?.layer, "overlay");
    assert.ok(reviewed.profile.nodes.some((n) => n.id === reviewed.node?.id && n.layer === "overlay"));
    assert.ok(reviewed.profile.edges.some((e) => e.to === reviewed.node?.id && e.layer === "overlay"));
    assert.ok(!reviewed.profile.facts.some((f) => /not modeled/i.test(f.claim)));
    const packet = runPipeline(reviewed.profile, ["src/app.ts"]);
    assert.equal(factsForPlanner(packet).implementsPlan, false);
    assert.ok(packet.adjudication.some((row) => row.findingId.startsWith("OV-") && row.status === "INDETERMINATE"));

    const kept = applyGithubRefresh(
      { ...before, profile: reviewed.profile },
      filesFromTextMap({
        "src/app.ts": "export function boot() { return 1; }\n",
        "src/util.ts": "export function helper() { return 2; }\n",
      }),
      {
        kind: "github",
        owner: "acme",
        repo: "demo",
        ref: "main",
        sha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        readOnly: true,
      },
    );
    assert.equal(kept.project.profile.nodes.filter((n) => n.id === reviewed.node?.id).length, 1);
    assert.ok(kept.project.profile.nodes.some((n) => n.id === reviewed.node?.id && n.layer === "overlay"));
    assert.equal(kept.packetImplementsPlan, false);

    const missing = applyGithubRefresh(
      kept.project,
      filesFromTextMap({ "src/util.ts": "export function helper() { return 2; }\n" }),
      {
        kind: "github",
        owner: "acme",
        repo: "demo",
        ref: "main",
        sha: "cccccccccccccccccccccccccccccccccccccccc",
        readOnly: true,
      },
    );
    assert.ok(missing.project.profile.nodes.some((n) => n.id === reviewed.node?.id && n.layer === "overlay"));
    assert.ok(
      missing.project.profile.findings.some(
        (f) => f.id === `REFRESH-missing-${reviewed.node!.id}` && f.proofMode === "open",
      ),
    );
    const after = runPipeline(missing.project.profile, ["src/util.ts", "src/app.ts"]);
    assert.ok(
      after.adjudication.some(
        (row) => row.findingId === `REFRESH-missing-${reviewed.node!.id}` && row.status === "INDETERMINATE",
      ),
    );
  });

  it("uses the same contract on Ajenda", () => {
    const files = filesFromTextMap(AJENDA_SOURCE);
    const prepared = prepareIngest("Ajenda", files, { repoHint: AJENDA.repoHint, sha: "dddddddddddddddddddddddddddddddddddddddd" });
    const reviewed = applyOverlayReview(AJENDA, {
      fromId: "py:lease",
      kind: "policy",
      edgeKind: "owns",
      label: "lease quota",
      evidencePath: "backend/services/lease.py",
      domain: "authority",
    });
    const project: Project = {
      id: "ajenda",
      name: "Ajenda",
      kind: "seeded",
      seedKey: "ajenda",
      createdAt: "2026-09-14T00:00:00.000Z",
      updatedAt: "2026-09-14T00:00:00.000Z",
      profile: reviewed.profile,
      changedFiles: ["backend/services/lease.py"],
      files: prepared.files,
      index: prepared.index,
      plan: null,
      tasks: [],
      worktrees: [],
      git: initGit(prepared.files),
      secrets: [],
      evidence: [],
      activity: [],
      origin: { kind: "github", owner: "1devteam", repo: "ajenda-ai", ref: "main", sha: "1111", readOnly: true },
    };
    const next = applyGithubRefresh(project, files, {
      kind: "github",
      owner: "1devteam",
      repo: "ajenda-ai",
      ref: "main",
      sha: "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      readOnly: true,
    });
    assert.ok(next.project.profile.nodes.some((n) => n.label === "lease quota" && n.layer === "overlay"));
    assert.ok(next.project.profile.nodes.some((n) => n.id === "state:lease-lock" && n.layer === "overlay"));
  });
});
