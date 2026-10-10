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

    assert.equal(graph.schema_version, "1.14");
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
    assert.equal(receipt.semantic_provenance.canonical_schema_version, "1.14");
    assert.equal(receipt.semantic_provenance.website_execution_authority, "1devteam/1devteam-web");
    assert.equal(receipt.semantic_provenance.website_synchronization_mode, "github-reviewed-manual-port");
    assert.equal(receipt.semantic_provenance.website_runtime_dependency, "none");
    assert.equal(receipt.website_sync.canonical_reference_sha, GRAFT_CANONICAL_REFERENCE_SHA);
    assert.equal(receipt.website_sync.canonical_reference_schema_version, "1.14");
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

    const routes = graph.nodes.filter((node) => node.type === "http_route") as Array<{
      id: string;
      method?: string;
      path?: string;
      source?: string;
    }>;
    assert.ok(routes.some((route) => route.method === "GET" && route.path === "/status" && route.source === "app/web.py"));
    assert.ok(routes.some((route) => route.method === "POST" && route.path === "/status" && route.source === "app/web.py"));
    assert.ok(routes.some((route) => route.method === "POST" && route.path === "/pay" && route.source === "server.js"));
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

  it("keeps duplicate relative routes distinct and composes only proven runtime paths", () => {
    const pack = reconstructPack({
      files: [
        {
          path: "app/routes/account.py",
          content:
            "from fastapi import APIRouter\n" +
            "router = APIRouter(prefix='/account')\n" +
            "@router.get('/me')\n" +
            "def account_me():\n" +
            "    return {}\n",
        },
        {
          path: "app/routes/auth.py",
          content:
            "from fastapi import APIRouter\n" +
            "router = APIRouter(prefix='/auth')\n" +
            "@router.get('/me')\n" +
            "def auth_me():\n" +
            "    return {}\n",
        },
        {
          path: "app/main.py",
          content:
            "from fastapi import FastAPI\n" +
            "from app.routes.account import router as account_router\n" +
            "from app.routes.auth import router as auth_router\n" +
            "app = FastAPI()\n" +
            "app.include_router(account_router, prefix='/v1')\n" +
            "app.include_router(auth_router, prefix='/v1')\n",
        },
      ],
    });
    const graph = pack["dependency-graph.v1.json"] as {
      nodes: Array<Record<string, unknown>>;
      edges: Array<Record<string, unknown>>;
    };
    const declarations = graph.nodes.filter(
      (node) => node.type === "http_route" && node.route_identity === "declaration" && node.path === "/me",
    );
    assert.equal(declarations.length, 2);
    assert.equal(new Set(declarations.map((node) => node.id)).size, 2);

    const runtimeIds = new Set(
      graph.nodes.filter((node) => node.type === "runtime_route").map((node) => String(node.id)),
    );
    assert.ok(runtimeIds.has("runtime-route:GET:/v1/account/me"));
    assert.ok(runtimeIds.has("runtime-route:GET:/v1/auth/me"));
    const composition = new Set(graph.edges.map((edge) => `${edge.from}|${edge.to}|${edge.type}`));
    assert.ok([...composition].some((key) => key.endsWith("|runtime-route:GET:/v1/account/me|composes_to")));
    assert.ok([...composition].some((key) => key.endsWith("|runtime-route:GET:/v1/auth/me|composes_to")));
  });

  it("emits literal runtime declarations without making runtime decisions", () => {
    const pack = reconstructPack({
      files: [
        {
          path: "app/runtime.py",
          content:
            "def qualify(payload):\n" +
            "    return payload\n\n" +
            "def register():\n" +
            "    return ActionDefinition(name='sales.qualify', handler=qualify, provider='local_sales', input_model=SalesLeadInput, side_effect_class=SideEffectClass.INTERNAL_READ, credential_requirement=CredentialRequirement(provider='crm'))\n\n" +
            "JOB = BusinessJob(job_key='qualify_lead', required_inputs=('company_name',), produced_outputs=('qualification_score',), candidate_actions=('sales.qualify',))\n",
        },
      ],
    });
    const graph = pack["dependency-graph.v1.json"] as {
      nodes: Array<Record<string, unknown>>;
      edges: Array<Record<string, unknown>>;
      facts: Record<string, unknown>;
      [key: string]: unknown;
    };
    const ids = new Set(graph.nodes.map((node) => String(node.id)));
    for (const id of [
      "job:qualify_lead",
      "action:sales.qualify",
      "input:company_name",
      "artifact:qualification_score",
      "input-contract:SalesLeadInput",
      "provider:local_sales",
      "provider:crm",
      "side-effect-class:SideEffectClass.INTERNAL_READ",
      "credential-requirement:sales.qualify",
    ]) {
      assert.ok(ids.has(id), id);
    }
    const edges = new Set(graph.edges.map((edge) => `${edge.from}|${edge.to}|${edge.type}`));
    assert.ok(edges.has("job:qualify_lead|action:sales.qualify|candidate_action"));
    assert.ok(edges.has("artifact:qualification_score|job:qualify_lead|produced_by"));
    assert.ok(edges.has("action:sales.qualify|credential-requirement:sales.qualify|requires_credential"));
    assert.equal("decision" in graph, false);
    assert.equal("risk" in graph, false);
    assert.equal("proof_selection" in graph, false);
  });

  it("contains no Ajenda domain strings", () => {
    const src = readFileSync(fileURLToPath(new URL("./reconstruct.ts", import.meta.url)), "utf8");
    assert.doesNotMatch(src, /hubspot/i);
    assert.doesNotMatch(src, /tenant-isolation/);
    assert.doesNotMatch(src, /lease-owner/);
  });
});
