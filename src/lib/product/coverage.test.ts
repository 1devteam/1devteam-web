import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runPipeline } from "../graft/engine.ts";
import { buildGraftArchive } from "./artifact.ts";
import { fetchGithubRepo } from "./github.ts";
import { indexFiles } from "./indexer.ts";
import { prepareIngest } from "./ingest.ts";
import { languageOf, skipRoot } from "./paths.ts";

function ingest(files: { path: string; content: string }[]) {
  const prepared = prepareIngest(
    "coverage",
    files.map((file) => ({
      ...file,
      language: languageOf(file.path),
      size: file.content.length,
    })),
  );
  const packet = runPipeline(prepared.profile, prepared.profile.files);
  const archive = buildGraftArchive({
    packet,
    profile: prepared.profile,
    origin: {
      kind: "github",
      owner: "acme",
      repo: "app",
      sha: "deadbeefcafebabe",
      omittedNotes: ["assets/logo.txt (binary)"],
      skippedRoots: ["node_modules"],
      omitted: 1,
      omittedPaths: ["assets/logo.txt"],
      readOnly: true,
    },
    index: prepared.index,
    files: prepared.files,
  });
  return { prepared, packet, archive };
}

describe("production pack coverage", () => {
  it("records stripe, fastapi, and django.db as unresolved package facts", () => {
    const { prepared, archive } = ingest([
      {
        path: "app/crm.py",
        content: [
          "import stripe",
          "from fastapi import FastAPI",
          "from django.db import models",
          "def charge():",
          "    return stripe",
        ].join("\n"),
      },
    ]);
    const deps = prepared.profile.facts.filter((f) => f.kind === "dependency").map((f) => f.claim);
    assert.ok(deps.some((c) => /stripe/.test(c) && /not resolved/.test(c)));
    assert.ok(deps.some((c) => /fastapi/.test(c) && /not resolved/.test(c)));
    assert.ok(deps.some((c) => /django\.db/.test(c) && /not resolved/.test(c)));
    assert.match(archive.markdown, /graph-architecture-decision.json/);
    assert.match(archive.markdown, /not a plan/);
    assert.ok(!prepared.profile.facts.some((f) => f.kind === "gap"));
  });

  it("reconstruction zip has decision JSON and no source tree", () => {
    const { archive } = ingest([
      {
        path: "src/pay.ts",
        content: `import Stripe from "stripe";\nexport function charge() { return 1; }\n`,
      },
    ]);
    assert.match(archive.markdown, /graph-architecture-decision.json/);
    assert.doesNotMatch(archive.markdown, /export function charge/);
    const zipText = new TextDecoder().decode(archive.zip);
    assert.match(zipText, /graph-architecture-decision\.json/);
    assert.doesNotMatch(zipText, /tree\/src\/pay\.ts/);
    assert.equal(archive.zip[0], 0x50);
    assert.equal(archive.zip[1], 0x4b);
  });

  it("extracts contracts and imports for ruby, php, csharp, swift, and c", () => {
    const index = indexFiles([
      {
        path: "lib/bill.rb",
        content: `require "stripe"\nclass Bill\n  def charge\n  end\nend\n`,
        language: "ruby",
        size: 40,
      },
      {
        path: "src/Bill.php",
        content: `<?php\nuse Stripe\\Charge;\nclass Bill { function charge() {} }\n`,
        language: "php",
        size: 40,
      },
      {
        path: "src/Bill.cs",
        content: `using Stripe;\npublic class Bill { public void Charge() {} }\n`,
        language: "csharp",
        size: 40,
      },
      {
        path: "src/Bill.swift",
        content: `import Stripe\nclass Bill { func charge() {} }\n`,
        language: "swift",
        size: 40,
      },
      {
        path: "src/bill.c",
        content: `#include <stdio.h>\nint charge(void) { return 1; }\n`,
        language: "c",
        size: 40,
      },
    ]);
    assert.ok(index.symbols.some((s) => s.path.endsWith(".rb") && s.name === "Bill"));
    assert.ok(index.symbols.some((s) => s.path.endsWith(".rb") && s.name === "charge"));
    assert.ok(index.imports.some((i) => i.fromPath.endsWith(".rb") && i.specifier === "stripe" && !i.resolvedPath));
    assert.ok(index.symbols.some((s) => s.path.endsWith(".php") && s.name === "Bill"));
    assert.ok(index.symbols.some((s) => s.path.endsWith(".php") && s.name === "charge"));
    assert.ok(index.imports.some((i) => i.fromPath.endsWith(".php") && /Stripe/.test(i.specifier)));
    assert.ok(index.symbols.some((s) => s.path.endsWith(".cs") && s.name === "Bill"));
    assert.ok(index.symbols.some((s) => s.path.endsWith(".swift") && s.name === "charge"));
    assert.ok(index.imports.some((i) => i.fromPath.endsWith(".swift") && i.specifier === "Stripe"));
    assert.ok(index.symbols.some((s) => s.path.endsWith(".c") && s.name === "charge"));
    assert.ok(index.imports.some((i) => i.fromPath.endsWith(".c") && i.specifier === "stdio.h"));
  });

  it("indexes python decorator routes and javascript router routes", () => {
    const index = indexFiles([
      {
        path: "api.py",
        content: `@app.get("/crm")\ndef crm():\n    return 1\n`,
        language: "python",
        size: 40,
      },
      {
        path: "server.js",
        content: `router.post("/pay", charge);\n`,
        language: "javascript",
        size: 30,
      },
    ]);
    assert.ok(index.routes.some((r) => r.method === "GET" && r.route === "/crm"));
    assert.ok(index.routes.some((r) => r.method === "POST" && r.route === "/pay"));
  });

  it("names skip directories and binary files instead of hiding them", () => {
    assert.equal(skipRoot("node_modules/stripe/index.js"), "node_modules");
    const { archive } = ingest([{ path: "src/app.ts", content: "export const ok = 1;\n" }]);
    assert.match(archive.markdown, /graph-architecture-decision.json/);
    const zipText = new TextDecoder().decode(archive.zip);
    assert.doesNotMatch(zipText, /tree\/src\/app\.ts/);
  });

  it("marks GitHub binary blobs as omitted notes, not silent drops", async () => {
    const json = (body: unknown, ok = true) => ({
      ok,
      status: ok ? 200 : 404,
      statusText: ok ? "ok" : "no",
      text: async () => JSON.stringify(body),
      json: async () => body,
    });
    const text = (body: string, ok = true) => ({
      ok,
      status: ok ? 200 : 404,
      statusText: ok ? "ok" : "no",
      text: async () => body,
      json: async () => ({}),
    });
    const ingest = await fetchGithubRepo(
      { owner: "acme", repo: "demo" },
      {
        fetchImpl: async (url: string) => {
          if (url.endsWith("/demo")) {
            return json({
              name: "demo",
              full_name: "acme/demo",
              description: "",
              default_branch: "main",
              private: false,
              html_url: "https://github.com/acme/demo",
            });
          }
          if (url.includes("/commits/main")) {
            return json({ sha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", commit: { tree: { sha: "t" } } });
          }
          if (url.includes("/commits?")) return json([]);
          if (url.includes("/git/trees/")) {
            return json({
              sha: "t",
              truncated: false,
              tree: [
                { path: "src/app.ts", type: "blob", size: 20, sha: "1" },
                { path: "node_modules/x.js", type: "blob", size: 20, sha: "2" },
                { path: "pic.txt", type: "blob", size: 20, sha: "3" },
              ],
            });
          }
          if (url.endsWith("src/app.ts")) return text("export const n = 1;\n");
          if (url.endsWith("pic.txt")) return text("\u0000PNG");
          return json({}, false);
        },
      },
    );
    assert.ok(ingest.files.some((f) => f.path === "src/app.ts"));
    assert.ok(ingest.omittedNotes?.some((n) => n.includes("pic.txt") && n.includes("binary")));
    assert.ok(ingest.skippedRoots?.includes("node_modules"));
    assert.ok(!ingest.files.some((f) => f.path === "pic.txt"));
  });
});
