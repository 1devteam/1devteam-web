import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fetchGithubCompare, fetchGithubRepo, githubRawUrl, isComparableSha, parseRepoRef } from "./github.ts";
import { rankPath, selectSourceFiles } from "./paths.ts";

describe("parseRepoRef", () => {
  it("accepts owner/repo, URLs, git SSH, tree paths, and commits", () => {
    assert.deepEqual(parseRepoRef("expressjs/express"), { owner: "expressjs", repo: "express", ref: undefined, subtree: undefined });
    assert.equal(parseRepoRef("https://github.com/pallets/flask.git")?.repo, "flask");
    assert.equal(parseRepoRef("git@github.com:1devteam/1devteam-web.git")?.owner, "1devteam");
    const tree = parseRepoRef("https://github.com/expressjs/express/tree/master/lib");
    assert.equal(tree?.ref, "master");
    assert.equal(tree?.subtree, "lib");
    assert.equal(parseRepoRef("https://github.com/expressjs/express/commit/abc123")?.ref, "abc123");
    assert.equal(parseRepoRef("ghp_notarepo"), null);
    assert.equal(parseRepoRef("not a repo"), null);
  });
});

describe("githubRawUrl", () => {
  it("encodes path segments so percent-named files are fetchable", () => {
    assert.equal(
      githubRawUrl("django", "django", "abc", "tests/view_tests/media/%2F.txt"),
      "https://raw.githubusercontent.com/django/django/abc/tests/view_tests/media/%252F.txt",
    );
  });
});

describe("file ranking", () => {
  it("prefers source and manifests over lockfiles", () => {
    const picked = selectSourceFiles([
      { path: "yarn.lock", size: 10 },
      { path: "src/index.ts", size: 10 },
      { path: "package.json", size: 10 },
      { path: "dist/app.js", size: 10 },
      { path: "README.md", size: 10 },
    ]);
    assert.deepEqual(
      new Set(picked.selected.map((f) => f.path)),
      new Set(["package.json", "README.md", "src/index.ts"]),
    );
    assert.ok(rankPath("src/lib/engine.ts") > rankPath("vendor/pkg.js"));
  });
});

describe("fetchGithubRepo", () => {
  it("walks repo metadata, tree, and raw files without persisting a token", async () => {
    const calls: string[] = [];
    const fetchImpl = async (url: string) => {
      calls.push(url);
      if (url.includes("/repos/acme/demo") && url.endsWith("demo")) {
        return json({
          name: "demo",
          full_name: "acme/demo",
          description: "A demo",
          default_branch: "main",
          private: false,
          html_url: "https://github.com/acme/demo",
        });
      }
      if (url.includes("/commits/main")) {
        return json({ sha: "deadbeefcafebabe", commit: { tree: { sha: "treesha" } } });
      }
      if (url.includes("/commits?")) {
        return json([{ sha: "deadbeefcafebabe", commit: { message: "boot helper\n\nbody" } }]);
      }
      if (url.includes("/git/trees/")) {
        return json({
          sha: "treesha",
          truncated: false,
          tree: [
            { path: "src/app.ts", type: "blob", size: 40, sha: "1" },
            { path: "src/util.ts", type: "blob", size: 40, sha: "2" },
            { path: "yarn.lock", type: "blob", size: 40, sha: "3" },
            { path: "README.md", type: "blob", size: 20, sha: "4" },
          ],
        });
      }
      if (url.includes("raw.githubusercontent.com") && url.endsWith("src/app.ts")) {
        return text("import { helper } from './util';\nexport function boot() { helper(); }\n");
      }
      if (url.includes("raw.githubusercontent.com") && url.endsWith("src/util.ts")) {
        return text("export function helper() { return 1; }\n");
      }
      if (url.includes("raw.githubusercontent.com") && url.endsWith("README.md")) {
        return text("# demo\n");
      }
      return { ok: false, status: 404, statusText: "no", text: async () => "", json: async () => ({}) };
    };

    const ingest = await fetchGithubRepo({ owner: "acme", repo: "demo" }, { fetchImpl });
    assert.equal(ingest.fullName, "acme/demo");
    assert.equal(ingest.sha, "deadbeefcafebabe");
    assert.ok(ingest.files.some((f) => f.path === "src/app.ts"));
    assert.deepEqual(ingest.recentCommits, ["deadbee boot helper"]);
    assert.ok(!ingest.files.some((f) => f.path === "yarn.lock"));
    assert.ok(calls.some((u) => u.includes("/repos/acme/demo")));
    assert.ok(calls.some((u) => u.includes("raw.githubusercontent.com")));
    assert.ok(calls.every((u) => !u.toLowerCase().includes("authorization")));
  });
});

describe("fetchGithubCompare", () => {
  it("maps compare files and does not persist a token", async () => {
    const calls: string[] = [];
    const fetchImpl = async (url: string, init?: RequestInit) => {
      calls.push(url);
      assert.ok(!url.toLowerCase().includes("ghp_"));
      if (url.includes("/compare/")) {
        const auth = new Headers(init?.headers).get("Authorization");
        assert.equal(auth, "Bearer ghp_session");
        return json({
          status: "ahead",
          ahead_by: 1,
          behind_by: 0,
          html_url: "https://github.com/acme/demo/compare/aaa...bbb",
          files: [
            { filename: "src/app.ts", status: "modified" },
            { filename: "src/new.ts", status: "added" },
            { filename: "gone.ts", status: "removed" },
            { filename: "lib/util.ts", status: "renamed", previous_filename: "lib/old.ts" },
          ],
        });
      }
      return { ok: false, status: 404, statusText: "no", text: async () => "", json: async () => ({}) };
    };
    const compare = await fetchGithubCompare(
      { owner: "acme", repo: "demo" },
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      { token: "ghp_session", fetchImpl },
    );
    assert.equal(compare?.status, "ahead");
    assert.ok(compare?.files.some((f) => f.path === "src/app.ts" && f.status === "changed"));
    assert.ok(compare?.files.some((f) => f.path === "src/new.ts" && f.status === "added"));
    assert.ok(compare?.files.some((f) => f.path === "gone.ts" && f.status === "removed"));
    assert.ok(compare?.files.some((f) => f.path === "lib/util.ts" && f.previousPath === "lib/old.ts"));
    assert.ok(calls.some((u) => u.includes("/compare/")));
    assert.ok(calls.every((u) => !u.includes("ghp_session")));
  });

  it("returns null when compare is unavailable or SHAs match", async () => {
    const fetchImpl = async () => ({
      ok: false,
      status: 404,
      statusText: "no",
      text: async () => "missing",
      json: async () => ({}),
    });
    const missing = await fetchGithubCompare(
      { owner: "acme", repo: "demo" },
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      { fetchImpl },
    );
    assert.equal(missing, null);
    assert.equal(await fetchGithubCompare({ owner: "acme", repo: "demo" }, "abc", "abc"), null);
    assert.equal(isComparableSha("deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"), true);
    assert.equal(isComparableSha("not-a-sha"), false);
  });
});

function json(value: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "ok",
    text: async () => JSON.stringify(value),
    json: async () => value,
  };
}

function text(value: string) {
  return {
    ok: true,
    status: 200,
    statusText: "ok",
    text: async () => value,
    json: async () => ({}),
  };
}
