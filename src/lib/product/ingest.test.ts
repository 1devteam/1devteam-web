import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { factsForPlanner, runPipeline } from "../graft/engine.ts";
import { prepareIngest } from "./ingest.ts";

describe("custom ingest", () => {
  it("builds a generated-only profile with overlay residual and planner-safe packet", () => {
    const prepared = prepareIngest("Demo App", [
      {
        path: "src/app.ts",
        content: `import { helper } from "./util";\nexport function boot() { helper(); }\n`,
        language: "typescript",
        size: 20,
      },
      {
        path: "src/util.ts",
        content: `export function helper() { return 1; }\n`,
        language: "typescript",
        size: 20,
      },
    ]);
    assert.ok(prepared.profile.nodes.every((n) => n.layer === "generated"));
    assert.ok(prepared.profile.edges.every((e) => e.layer === "generated"));
    assert.ok(prepared.profile.edges.some((e) => e.kind === "imports"));
    const packet = runPipeline(prepared.profile, ["src/app.ts"]);
    const facts = factsForPlanner(packet);
    assert.equal(facts.implementsPlan, false);
    assert.equal(packet.decision.mergeAuthorization, "not-determined");
    assert.equal(prepared.profile.findings.length, 0);
    assert.ok(prepared.profile.facts.some((f) => f.kind === "negative"));
    assert.equal(
      prepared.profile.facts.filter((f) => f.kind === "inventory" && !f.claim.includes("not ingested")).length,
      prepared.files.length,
    );
    assert.ok(prepared.profile.facts.some((f) => f.kind === "contract" && /boot/.test(f.claim)));
    assert.ok(prepared.profile.facts.some((f) => f.kind === "dependency"));
    assert.ok(!prepared.profile.facts.some((f) => f.kind === "gap"));
    assert.deepEqual(prepared.profile.scenarios[0]?.files, prepared.profile.files);
  });

  it("indexes an arbitrary python package layout as generated inventory", () => {
    const prepared = prepareIngest(
      "acme/service",
      [
        {
          path: "pkg/api.py",
          content: "from pkg.core import run\ndef handle():\n    return run()\n",
          language: "python",
          size: 40,
        },
        {
          path: "pkg/core.py",
          content: "def run():\n    return 1\n",
          language: "python",
          size: 20,
        },
      ],
      { repoHint: "https://github.com/acme/service", sha: "abc1234deadbeef" },
    );
    const resolved = prepared.index.imports.find((i) => i.specifier === "pkg.core");
    assert.equal(resolved?.resolvedPath, "pkg/core.py");
    assert.equal(prepared.profile.provenance.sha, "abc1234deadbeef");
    const packet = runPipeline(prepared.profile, ["pkg/api.py"]);
    assert.equal(packet.decision.mergeAuthorization, "not-determined");
    assert.ok(packet.impact.changedNodes.length >= 1);
  });

  it("records unresolved imports as dependency facts", () => {
    const prepared = prepareIngest("billing", [
      {
        path: "src/pay.ts",
        content: `import Stripe from "stripe";\nexport function charge() { return Stripe; }\n`,
        language: "typescript",
        size: 40,
      },
    ]);
    const fact = prepared.profile.facts.find((f) => f.kind === "dependency" && /stripe/.test(f.claim));
    assert.ok(fact);
    assert.match(fact.claim, /not resolved in this tree/);
    assert.ok(!prepared.profile.facts.some((f) => f.kind === "gap"));
  });

  it("maps every generated node and only omits oversize or unreadable files", () => {
    const many = Array.from({ length: 80 }, (_, i) => ({
      path: `src/mod${String(i).padStart(3, "0")}.ts`,
      content: `export const n${i} = ${i};\n`,
      language: "typescript" as const,
      size: 20,
    }));
    const graph = prepareIngest("Full Graph", many);
    assert.equal(graph.profile.nodes.length, 80);
    assert.ok(!graph.profile.findings.some((f) => f.id === "OMIT-graph"));
    const packet = runPipeline(graph.profile, ["src/mod000.ts"]);
    assert.equal(packet.decision.mergeAuthorization, "not-determined");

    const over = Array.from({ length: 810 }, (_, i) => ({
      path: `pkg/f${i}.ts`,
      content: `export const x${i} = ${i};\n`,
      language: "typescript" as const,
      size: 20,
    }));
    const all = prepareIngest("All Files", over);
    assert.equal(all.omitted, 0);
    assert.equal(all.profile.nodes.length, 810);
    assert.ok(!all.profile.findings.some((f) => f.id === "OMIT-files"));
  });

  it("maps contracts and resolved dependencies without a gap lane", () => {
    const prepared = prepareIngest("Web", [
      {
        path: "src/main.tsx",
        content: `import { createRoot } from "react-dom/client";\nimport { Slot } from "@radix-ui/react-slot";\nimport { boot } from "./lib/boot";\ncreateRoot(document.body).render(<Slot />); boot();\n`,
        language: "typescript",
        size: 40,
      },
      {
        path: "src/lib/boot.ts",
        content: `export function boot() { return 1; }\n`,
        language: "typescript",
        size: 20,
      },
    ]);
    assert.equal(prepared.profile.facts.filter((f) => f.kind === "gap").length, 0);
    assert.ok(prepared.profile.facts.some((f) => f.kind === "contract" && f.claim.includes("boot")));
    assert.ok(prepared.profile.facts.some((f) => f.kind === "dependency" && f.claim.includes("src/lib/boot.ts")));
    assert.ok(prepared.profile.edges.some((e) => e.kind === "imports"));
    assert.ok(prepared.profile.capabilities.some((c) => c.label === "src"));
  });
});
