import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { factsForPlanner, runPipeline } from "../graft/engine.ts";
import { AJENDA, OMNIPATH } from "../graft/subjects.ts";
import { githubRefFromProject } from "./github.ts";
import { filesFromTextMap } from "./ingest.ts";
import { applyGithubRefresh, mergeRefreshedProfile } from "./refresh.ts";
import { AJENDA_SOURCE, OMNIPATH_SOURCE } from "./seeds.ts";
import { initGit } from "./git.ts";
import { prepareIngest } from "./ingest.ts";
import type { Project } from "./types.ts";

function seededProject(which: "ajenda" | "omnipath"): Project {
  const profile = which === "ajenda" ? AJENDA : OMNIPATH;
  const source = which === "ajenda" ? AJENDA_SOURCE : OMNIPATH_SOURCE;
  const files = filesFromTextMap(source);
  const prepared = prepareIngest(profile.name, files, { repoHint: profile.repoHint, sha: profile.provenance.sha });
  return {
    id: profile.id,
    name: profile.name,
    kind: "seeded",
    seedKey: which,
    createdAt: "2026-09-13T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z",
    profile,
    changedFiles: [profile.files[0]!],
    files: prepared.files,
    index: prepared.index,
    plan: null,
    tasks: [],
    worktrees: [],
    git: initGit(prepared.files, { sha: profile.provenance.sha, branch: "main" }),
    secrets: prepared.secrets,
    evidence: [],
    activity: [],
    origin: {
      kind: "seeded",
      repo: profile.provenance.repo,
      ref: profile.provenance.ref,
      sha: profile.provenance.sha,
      readOnly: true,
    },
  };
}

describe("githubRefFromProject", () => {
  it("uses the same configured branch for Ajenda and Omnipath", () => {
    const ajenda = githubRefFromProject(seededProject("ajenda"));
    const omnipath = githubRefFromProject(seededProject("omnipath"));
    assert.deepEqual(ajenda, { owner: "1devteam", repo: "ajenda-ai", ref: "main" });
    const withSubtree = seededProject("ajenda");
    withSubtree.origin = { ...withSubtree.origin, kind: "seeded", subtree: "backend/services" };
    assert.equal(githubRefFromProject(withSubtree)?.subtree, "backend/services");
    assert.deepEqual(omnipath, { owner: "1devteam", repo: "omnipath-v2", ref: "main" });
  });

  it("follows a branch, not a pinned commit, for GitHub origins", () => {
    const project = seededProject("ajenda");
    project.seedKey = undefined;
    project.profile = { ...project.profile, id: "custom" as "ajenda" };
    project.origin = {
      kind: "github",
      owner: "acme",
      repo: "demo",
      ref: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      sha: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      readOnly: true,
    };
    const ref = githubRefFromProject(project);
    assert.equal(ref?.owner, "acme");
    assert.equal(ref?.repo, "demo");
    assert.equal(ref?.ref, undefined);
  });
});

describe("mergeRefreshedProfile", () => {
  it("overwrites the snapshot, keeps overlay, and does not duplicate stable Ajenda nodes", () => {
    const files = filesFromTextMap({
      ...AJENDA_SOURCE,
      "backend/services/lease.py": `${AJENDA_SOURCE["backend/services/lease.py"]}\n# refreshed\n`,
    });
    const { profile } = mergeRefreshedProfile(AJENDA, files, {
      kind: "github",
      owner: "1devteam",
      repo: "ajenda-ai",
      ref: "main",
      sha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      readOnly: true,
    });
    assert.equal(profile.provenance.sha, "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    assert.equal(profile.provenance.ref, "main");
    assert.equal(profile.provenance.readOnly, true);
    assert.equal(profile.nodes.filter((n) => n.id === "py:lease").length, 1);
    assert.equal(profile.nodes.filter((n) => n.id === "state:lease-lock").length, 1);
    assert.ok(profile.nodes.some((n) => n.id === "state:lease-lock" && n.layer === "overlay"));
    assert.ok(profile.edges.some((e) => e.layer === "overlay" && e.kind === "state_ownership"));
    assert.ok(profile.capabilities.some((c) => c.id === "lease"));
    assert.ok(!profile.facts.some((f) => f.kind === "negative" && /not modeled/i.test(f.claim)));
    const packet = runPipeline(profile, ["backend/services/lease.py"]);
    const planner = factsForPlanner(packet);
    assert.equal(planner.implementsPlan, false);
    assert.equal(packet.decision.mergeAuthorization, "not-determined");
    assert.ok(profile.facts.some((f) => f.evidence.some((ev) => ev.path)));
  });

  it("uses the same contract for Omnipath", () => {
    const files = filesFromTextMap(OMNIPATH_SOURCE);
    const { profile } = mergeRefreshedProfile(OMNIPATH, files, {
      kind: "github",
      owner: "1devteam",
      repo: "omnipath-v2",
      ref: "main",
      sha: "cccccccccccccccccccccccccccccccccccccccc",
      readOnly: true,
    });
    assert.equal(profile.nodes.filter((n) => n.id === "py:saga").length, 1);
    assert.ok(profile.nodes.some((n) => n.id === "saga:mission-execution" && n.layer === "overlay"));
    assert.equal(profile.provenance.sha, "cccccccccccccccccccccccccccccccccccccccc");
    assert.equal(profile.provenance.ref, "main");
  });

  it("keeps missing overlay relationships INDETERMINATE when a source file disappears", () => {
    const files = filesFromTextMap({
      "backend/services/lease.py": AJENDA_SOURCE["backend/services/lease.py"],
    });
    const { profile } = mergeRefreshedProfile(AJENDA, files, {
      kind: "github",
      owner: "1devteam",
      repo: "ajenda-ai",
      ref: "main",
      sha: "dddddddddddddddddddddddddddddddddddddddd",
      readOnly: true,
    });
    assert.ok(profile.nodes.some((n) => n.id === "bound:egress" && n.layer === "overlay"));
    assert.ok(profile.findings.some((f) => f.id.startsWith("REFRESH-missing-") && f.proofMode === "open"));
    const packet = runPipeline(profile, ["backend/services/lease.py"]);
    assert.ok(packet.adjudication.some((row) => row.findingId.startsWith("REFRESH-missing-") && row.status === "INDETERMINATE"));
  });
});

describe("applyGithubRefresh", () => {
  it("overwrites the previous snapshot on the same project", () => {
    const before = seededProject("ajenda");
    const first = applyGithubRefresh(before, filesFromTextMap(AJENDA_SOURCE), {
      kind: "github",
      owner: "1devteam",
      repo: "ajenda-ai",
      ref: "main",
      sha: "1111111111111111111111111111111111111111",
      readOnly: true,
    });
    const second = applyGithubRefresh(first.project, filesFromTextMap(AJENDA_SOURCE), {
      kind: "github",
      owner: "1devteam",
      repo: "ajenda-ai",
      ref: "main",
      sha: "2222222222222222222222222222222222222222",
      readOnly: true,
    });
    assert.equal(second.project.id, "ajenda");
    assert.equal(second.project.kind, "seeded");
    assert.equal(second.project.seedKey, "ajenda");
    assert.equal(second.project.origin?.sha, "2222222222222222222222222222222222222222");
    assert.equal(second.project.profile.provenance.sha, "2222222222222222222222222222222222222222");
    assert.notEqual(second.project.origin?.sha, first.previousSha);
    assert.equal(second.project.git.head, "2222222222222222222222222222222222222222");
    assert.equal(second.project.git.commits.length, 1);
    assert.equal(second.project.git.commits[0]?.sha, "2222222222222222222222222222222222222222");
    assert.ok(!JSON.stringify(second.project.origin).includes("1111111111111111111111111111111111111111"));
    assert.ok(!JSON.stringify(second.project.profile.provenance).includes("1111111111111111111111111111111111111111"));
    assert.equal(second.packetImplementsPlan, false);
    assert.equal("snapshots" in second.project, false);
    assert.equal(second.project.profile.nodes.filter((n) => n.id === "py:lease").length, 1);
    assert.equal(second.project.lastDelta?.fromSha, "1111111111111111111111111111111111111111");
    assert.equal(second.project.lastDelta?.toSha, "2222222222222222222222222222222222222222");
    assert.equal(second.delta.source, "ingested-tree");
  });

  it("records an ingested-tree delta and uses changed files as the round slice", () => {
    const before = seededProject("ajenda");
    const files = filesFromTextMap({
      ...AJENDA_SOURCE,
      "backend/services/lease.py": `${AJENDA_SOURCE["backend/services/lease.py"]}\n# round\n`,
      "backend/services/extra.py": "def extra():\n    return 1\n",
    });
    const result = applyGithubRefresh(before, files, {
      kind: "github",
      owner: "1devteam",
      repo: "ajenda-ai",
      ref: "main",
      sha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      readOnly: true,
    });
    assert.equal(result.delta.source, "ingested-tree");
    assert.ok(result.delta.changed.includes("backend/services/lease.py"));
    assert.ok(result.delta.added.includes("backend/services/extra.py"));
    assert.ok(result.project.changedFiles.includes("backend/services/lease.py"));
    assert.ok(result.project.changedFiles.includes("backend/services/extra.py"));
    assert.ok(result.delta.nodesAdded.length >= 1);
    assert.equal(result.packetImplementsPlan, false);
  });

  it("drops generated nodes for missing files without dropping overlay", () => {
    const before = seededProject("ajenda");
    const result = applyGithubRefresh(
      before,
      filesFromTextMap({ "backend/services/lease.py": AJENDA_SOURCE["backend/services/lease.py"] }),
      {
        kind: "github",
        owner: "1devteam",
        repo: "ajenda-ai",
        ref: "main",
        sha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        readOnly: true,
      },
    );
    assert.ok(result.delta.removed.includes("backend/services/knowledge.py"));
    assert.ok(result.delta.nodesDropped.includes("py:knowledge"));
    assert.ok(result.project.profile.nodes.some((n) => n.id === "bound:egress" && n.layer === "overlay"));
  });

  it("uses the GitHub compare as the round slice even when ingested content matches", () => {
    const before = seededProject("ajenda");
    const result = applyGithubRefresh(
      before,
      filesFromTextMap(AJENDA_SOURCE),
      {
        kind: "github",
        owner: "1devteam",
        repo: "ajenda-ai",
        ref: "main",
        sha: "cccccccccccccccccccccccccccccccccccccccc",
        readOnly: true,
      },
      {
        base: "1111111111111111111111111111111111111111",
        head: "cccccccccccccccccccccccccccccccccccccccc",
        status: "ahead",
        aheadBy: 2,
        behindBy: 0,
        truncated: false,
        files: [
          { path: "backend/services/knowledge.py", status: "changed" },
          { path: "docs/notes.md", status: "changed" },
        ],
        htmlUrl: "https://github.com/1devteam/ajenda-ai/compare/1111...cccc",
      },
    );
    assert.equal(result.delta.source, "github-compare");
    assert.deepEqual(result.delta.changed, ["backend/services/knowledge.py", "docs/notes.md"]);
    assert.ok(result.project.changedFiles.includes("backend/services/knowledge.py"));
    assert.ok(result.project.changedFiles.includes("docs/notes.md"));
    assert.equal(result.project.lastDelta?.compareUrl, "https://github.com/1devteam/ajenda-ai/compare/1111...cccc");
    const planner = factsForPlanner(runPipeline(result.project.profile, result.project.changedFiles));
    assert.equal(planner.implementsPlan, false);
  });

  it("overwrites the previous delta instead of accumulating rounds", () => {
    const before = seededProject("ajenda");
    const first = applyGithubRefresh(before, filesFromTextMap(AJENDA_SOURCE), {
      kind: "github",
      owner: "1devteam",
      repo: "ajenda-ai",
      ref: "main",
      sha: "1111111111111111111111111111111111111111",
      readOnly: true,
    });
    const second = applyGithubRefresh(
      first.project,
      filesFromTextMap({
        ...AJENDA_SOURCE,
        "backend/services/lease.py": `${AJENDA_SOURCE["backend/services/lease.py"]}\n# two\n`,
      }),
      {
        kind: "github",
        owner: "1devteam",
        repo: "ajenda-ai",
        ref: "main",
        sha: "2222222222222222222222222222222222222222",
        readOnly: true,
      },
    );
    assert.equal(second.project.lastDelta?.fromSha, "1111111111111111111111111111111111111111");
    assert.equal(second.project.lastDelta?.toSha, "2222222222222222222222222222222222222222");
    assert.equal("deltas" in second.project, false);
    assert.ok(second.project.lastDelta?.changed.includes("backend/services/lease.py"));
  });

  it("records omitted honesty on refresh without dropping overlay", () => {
    const before = seededProject("ajenda");
    const many: Record<string, string> = { ...AJENDA_SOURCE };
    for (let i = 0; i < 80; i += 1) many[`src/extra${i}.ts`] = `export const n${i} = ${i};\n`;
    const result = applyGithubRefresh(before, filesFromTextMap(many), {
      kind: "github",
      owner: "1devteam",
      repo: "ajenda-ai",
      ref: "main",
      sha: "ffffffffffffffffffffffffffffffffffffffff",
      readOnly: true,
      subtree: "backend",
      truncated: true,
    });
    assert.ok(result.project.profile.findings.some((f) => f.id.startsWith("OMIT-") && f.proofMode === "open"));
    assert.ok(result.project.profile.nodes.some((n) => n.id === "state:lease-lock" && n.layer === "overlay"));
    assert.equal(result.delta.subtree, "backend");
    assert.equal(result.delta.truncated, true);
    assert.equal(result.packetImplementsPlan, false);
  });
});
