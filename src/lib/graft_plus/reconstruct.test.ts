import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { reconstructPack } from "./reconstruct.ts";

describe("graft_plus reconstruct", () => {
  it("names frontend modules and never grants merge", () => {
    const pack = reconstructPack({
      files: [
        { path: "src/a.ts", content: `import { b } from "./b";\nimport stripe from "stripe";\nexport function a() { return b; }\n` },
        { path: "src/b.ts", content: `export const b = 1;\n` },
        { path: ".github/workflows/ci.yml", content: "name: ci\n" },
        { path: "package.json", content: "{}\n" },
      ],
      origin: { owner: "acme", repo: "app", sha: "abc12345" },
    });
    const graph = pack["dependency-graph.v1.json"] as {
      nodes: { id: string }[];
      edges: { from: string; to: string }[];
      facts: { unresolved_package_roots: string[] };
    };
    const ids = graph.nodes.map((n) => n.id);
    assert.ok(ids.includes("fe:src/a.ts"));
    assert.ok(ids.includes("fe:src/b.ts"));
    assert.ok(ids.includes("ci:.github/workflows/ci.yml"));
    assert.ok(ids.includes("manifest:package.json"));
    assert.ok(graph.edges.some((e) => e.from === "fe:src/a.ts" && e.to === "fe:src/b.ts"));
    assert.ok(graph.facts.unresolved_package_roots.includes("stripe"));
    const decision = pack["graph-architecture-decision.json"] as {
      decision: { merge_authorization: string; review_reasons: string[]; warnings: string[] };
      implementsPlan: boolean;
      residuals: { overlay: string };
    };
    assert.equal(decision.decision.merge_authorization, "not-determined");
    assert.equal(decision.implementsPlan, false);
    assert.equal(decision.residuals.overlay, "residual");
    assert.ok(decision.decision.review_reasons.includes("overlay_residual"));
  });

  it("names tables, routes, contracts, and unclassified egress without Ajenda policy", () => {
    const pack = reconstructPack({
      files: [
        {
          path: "alembic/versions/0001_init.py",
          content: `def upgrade():\n    op.create_table("leads")\n    op.execute("ALTER TABLE leads ENABLE ROW LEVEL SECURITY")\n`,
        },
        {
          path: "app/api.py",
          content: `import httpx\nfrom pydantic import BaseModel\nclass Lead(BaseModel):\n    name: str\n@app.get("/leads")\ndef list_leads():\n    return httpx.get("https://example.com")\n`,
        },
      ],
    });
    const graph = pack["dependency-graph.v1.json"] as { nodes: { id: string; type: string }[] };
    const types = new Set(graph.nodes.map((n) => n.type));
    assert.ok(types.has("database_table"));
    assert.ok(types.has("http_route"));
    assert.ok(types.has("contract"));
    assert.ok(types.has("network_egress_sink"));
    const decision = pack["graph-architecture-decision.json"] as {
      decision: { architecture_disposition: string; merge_authorization: string; blocking_reasons: string[] };
    };
    assert.equal(decision.decision.merge_authorization, "not-determined");
    assert.equal(decision.decision.architecture_disposition, "clear");
    assert.ok(!decision.decision.blocking_reasons.some((r) => r.includes("rls-missing")));
    const receipt = pack["graft-plus-receipt.json"] as { engine: string };
    assert.equal(receipt.engine, "universal-shell");
  });

  it("contains no Ajenda domain strings", () => {
    const src = readFileSync(fileURLToPath(new URL("./reconstruct.ts", import.meta.url)), "utf8");
    assert.doesNotMatch(src, /hubspot/i);
    assert.doesNotMatch(src, /tenant-isolation/);
    assert.doesNotMatch(src, /lease-owner/);
  });
});
