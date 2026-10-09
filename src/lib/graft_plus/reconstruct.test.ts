import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  GRAFT_CANONICAL_REFERENCE_SHA,
  reconstructPack,
} from "./reconstruct.ts";

describe("graft_plus reconstruct", () => {
  it("names frontend modules and never grants merge or architectural authority", () => {
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
      schema_version: string;
      nodes: { id: string }[];
      edges: { from: string; to: string }[];
      facts: { unresolved_package_roots: string[] };
    };
    const ids = graph.nodes.map((node) => node.id);

    assert.equal(graph.schema_version, "1.11");
    assert.ok(ids.includes("js:src/a.ts"));
    assert.ok(ids.includes("js:src/b.ts"));
    assert.ok(ids.includes("ci:.github/workflows/ci.yml"));
    assert.ok(ids.includes("manifest:package.json"));
    assert.ok(graph.edges.some((edge) => edge.from === "js:src/a.ts" && edge.to === "js:src/b.ts"));
    assert.ok(graph.facts.unresolved_package_roots.includes("stripe"));

    const receipt = pack["graft-plus-receipt.json"] as {
      merge_authorization: string;
      implementsPlan: boolean;
      grants_execution_authority: boolean;
      status_scope: string;
      does_not_compute: string[];
    };
    assert.equal(receipt.merge_authorization, "not-determined");
    assert.equal(receipt.implementsPlan, false);
    assert.equal(receipt.grants_execution_authority, false);
    assert.equal(receipt.status_scope, "instrument-integrity-only");
    assert.ok(receipt.does_not_compute.includes("architecture_disposition"));
    assert.equal("graph-architecture-decision.json" in pack, false);
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

    const graph = pack["dependency-graph.v1.json"] as {
      nodes: { id: string; type: string }[];
      semantic_provenance: {
        semantic_authority: string;
        canonical_engine: string;
        canonical_schema_version: string;
        website_execution_authority: string;
        website_synchronization_mode: string;
        website_runtime_dependency: string;
      };
    };
    const types = new Set(graph.nodes.map((node) => node.type));
    assert.ok(types.has("database_table"));
    assert.ok(types.has("http_route"));
    assert.ok(types.has("contract"));
    assert.ok(types.has("network_egress_sink"));

    const receipt = pack["graft-plus-receipt.json"] as {
      engine: string;
      semantic_provenance: typeof graph.semantic_provenance;
      website_sync: {
        canonical_reference_sha: string;
        canonical_reference_schema_version: string;
        synchronization_mode: string;
        synchronization_status: string;
        parity_claimed: boolean;
      };
    };

    assert.equal(receipt.engine, "browser-universal-shell");
    assert.equal(receipt.semantic_provenance.semantic_authority, "1devteam/graft_plus");
    assert.equal(receipt.semantic_provenance.canonical_engine, "python-universal-shell");
    assert.equal(receipt.semantic_provenance.canonical_schema_version, "1.11");
    assert.equal(receipt.semantic_provenance.website_execution_authority, "1devteam/1devteam-web");
    assert.equal(receipt.semantic_provenance.website_synchronization_mode, "github-reviewed-manual-port");
    assert.equal(receipt.semantic_provenance.website_runtime_dependency, "none");
    assert.equal(receipt.website_sync.canonical_reference_sha, GRAFT_CANONICAL_REFERENCE_SHA);
    assert.equal(receipt.website_sync.canonical_reference_schema_version, "1.11");
    assert.equal(receipt.website_sync.synchronization_mode, "github-reviewed-manual-port");
    assert.equal(receipt.website_sync.synchronization_status, "synchronized");
    assert.equal(receipt.website_sync.parity_claimed, true);
  });

  it("names Flask/Express routes and SQLAlchemy tables, and does not leak stdlib", () => {
    const pack = reconstructPack({
      files: [
        {
          path: "app/web.py",
          content: `import ctypes\nimport stripe\nfrom flask import Flask\napp = Flask(__name__)\n@app.route("/status", methods=["GET", "POST"])\ndef status():\n    return "ok"\nclass Watch:\n    __tablename__ = "watches"\n`,
        },
        { path: "server.js", content: `router.post("/pay", charge);\n` },
      ],
    });
    const graph = pack["dependency-graph.v1.json"] as {
      nodes: { id: string }[];
      facts: { unresolved_package_roots: string[]; unresolved_reference_ledger: { reference_count: number } };
    };
    const ledger = pack["graph-unresolved-ledger.v1.json"] as {
      specifier_table: string[];
      references: Array<[number, number]>;
    };
    const ids = new Set(graph.nodes.map((node) => node.id));
    const specs = new Set(ledger.specifier_table);

    assert.ok(ids.has("route:GET /status"));
    assert.ok(ids.has("route:POST /status"));
    assert.ok(ids.has("route:POST /pay"));
    assert.ok(ids.has("db:table:watches"));
    assert.equal(specs.has("ctypes"), false);
    assert.ok(specs.has("stripe"));
    assert.equal(graph.facts.unresolved_package_roots.includes(""), false);
    assert.equal(graph.facts.unresolved_reference_ledger.reference_count, ledger.references.length);

    const completeness = pack["graph-completeness-report.json"] as {
      role: string;
      residuals: Record<string, unknown>;
    };
    assert.equal(completeness.role, "instrument-integrity");
    assert.equal("unresolved_imports" in completeness.residuals, false);
    assert.ok("unresolved_import_count" in completeness.residuals);
  });

  it("contains no Ajenda domain strings", () => {
    const src = readFileSync(fileURLToPath(new URL("./reconstruct.ts", import.meta.url)), "utf8");
    assert.doesNotMatch(src, /hubspot/i);
    assert.doesNotMatch(src, /tenant-isolation/);
    assert.doesNotMatch(src, /lease-owner/);
  });
});
