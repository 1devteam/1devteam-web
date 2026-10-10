import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeGraphAscii } from "./ascii-ir.ts";
import {
  GRAFT_CANONICAL_REFERENCE_SCHEMA_VERSION,
  GRAFT_CANONICAL_REFERENCE_SHA,
  GRAFT_EMBEDDED_SCHEMA_VERSION,
  GRAFT_SYNC_MODE,
  GRAFT_SYNC_STATUS,
  reconstructPack,
} from "./reconstruct.ts";
import { canonicalJson, sha256Hex } from "./residuals.ts";

function packOf(files: Array<{ path: string; content: string }>) {
  return reconstructPack({ files });
}

function graphOf(files: Array<{ path: string; content: string }>) {
  return packOf(files)["dependency-graph.v1.json"] as {
    schema_version: string;
    nodes: Array<Record<string, unknown>>;
    edges: Array<Record<string, unknown>>;
    facts: Record<string, unknown>;
    semantic_provenance: Record<string, unknown>;
  };
}

function node(graph: ReturnType<typeof graphOf>, id: string) {
  return graph.nodes.find((item) => item.id === id);
}

function routeNode(
  graph: ReturnType<typeof graphOf>,
  source: string,
  method: string,
  path: string,
) {
  return graph.nodes.find(
    (item) =>
      item.type === "http_route" &&
      item.source === source &&
      item.method === method &&
      (item.path === path || item.route === path),
  );
}

describe("canonical 1.13 browser parity surface", () => {
  it("pins the manually promoted canonical revision and authority boundary", () => {
    assert.equal(GRAFT_CANONICAL_REFERENCE_SHA, "8248b1054504069e79414278db793ffebd55e103");
    assert.equal(GRAFT_CANONICAL_REFERENCE_SCHEMA_VERSION, "1.13");
    assert.equal(GRAFT_EMBEDDED_SCHEMA_VERSION, "1.13");
    assert.equal(GRAFT_SYNC_MODE, "github-reviewed-manual-port");
    assert.equal(GRAFT_SYNC_STATUS, "synchronized");

    const pack = packOf([{ path: "main.py", content: "VALUE = 1\n" }]);
    const graph = pack["dependency-graph.v1.json"] as {
      semantic_provenance: Record<string, unknown>;
    };
    const receipt = pack["graft-plus-receipt.json"] as {
      status_scope: string;
      merge_authorization: string;
      implementsPlan: boolean;
      grants_execution_authority: boolean;
      does_not_compute: string[];
      website_sync: Record<string, unknown>;
    };

    assert.deepEqual(graph.semantic_provenance, {
      semantic_authority: "1devteam/graft_plus",
      canonical_engine: "python-universal-shell",
      canonical_schema_version: "1.13",
      website_execution_authority: "1devteam/1devteam-web",
      website_synchronization_mode: "github-reviewed-manual-port",
      website_runtime_dependency: "none",
      overlay_mode: "none",
    });
    assert.equal(receipt.status_scope, "instrument-integrity-only");
    assert.equal(receipt.merge_authorization, "not-determined");
    assert.equal(receipt.implementsPlan, false);
    assert.equal(receipt.grants_execution_authority, false);
    assert.deepEqual(receipt.does_not_compute, [
      "blast_radius",
      "proof_selection",
      "risk_classification",
      "architecture_disposition",
      "change_recommendation",
    ]);
    assert.equal(receipt.website_sync.canonical_reference_sha, GRAFT_CANONICAL_REFERENCE_SHA);
    assert.equal(receipt.website_sync.canonical_reference_schema_version, "1.13");
    assert.equal(receipt.website_sync.synchronization_mode, "github-reviewed-manual-port");
    assert.equal(receipt.website_sync.synchronization_status, "synchronized");
    assert.equal(receipt.website_sync.parity_claimed, true);
  });

  it("projects Chromium-style hierarchy, build topology, provenance, and governance", () => {
    const graph = graphOf([
      { path: "engine/BUILD.gn", content: 'sources = ["native/core.cc", "web/app.ts", "gen/generated.cc"]\n' },
      { path: "engine/web/BUILD.gn", content: 'sources = ["app.ts"]\n' },
      { path: "engine/OWNERS", content: "team@example.com\n" },
      { path: "engine/PRESUBMIT.py", content: "def CheckChangeOnUpload(input_api, output_api):\n    return []\n" },
      { path: "engine/SECURITY.md", content: "# Security\n" },
      { path: "engine/native/core.cc", content: "int core() { return 1; }\n" },
      { path: "engine/web/app.ts", content: "export const app = 1;\n" },
      { path: "engine/gen/generated.cc", content: "// GENERATED FILE - DO NOT EDIT\nint generated() { return 1; }\n" },
      { path: "third_party/lib/vendor.cc", content: "int vendor() { return 1; }\n" },
    ]);

    const ids = new Set(graph.nodes.map((item) => String(item.id)));
    for (const id of ["subsystem:.", "subsystem:engine", "subsystem:engine/web", "subsystem:third_party"]) {
      assert.ok(ids.has(id), id);
    }
    assert.ok(ids.has("build:engine/BUILD.gn"));
    assert.ok(ids.has("build:engine/web/BUILD.gn"));
    assert.equal(node(graph, "governance:engine/OWNERS")?.governance_kind, "ownership");
    assert.equal(node(graph, "governance:engine/PRESUBMIT.py")?.governance_kind, "process");
    assert.equal(node(graph, "governance:engine/SECURITY.md")?.governance_kind, "security");
    assert.equal(node(graph, "native:engine/native/core.cc")?.source_provenance, "authored");
    assert.equal(node(graph, "native:engine/gen/generated.cc")?.source_provenance, "generated");
    assert.equal(node(graph, "native:third_party/lib/vendor.cc")?.source_provenance, "vendored");

    const edgeKeys = new Set(graph.edges.map((edge) => `${edge.from}|${edge.to}|${edge.type}`));
    assert.ok(edgeKeys.has("subsystem:engine/web|subsystem:engine|member_of_subsystem"));
    assert.ok(edgeKeys.has("build:engine/BUILD.gn|native:engine/native/core.cc|declares_build_input"));
    assert.ok(edgeKeys.has("build:engine/BUILD.gn|js:engine/web/app.ts|declares_build_input"));

    const buildCounts = graph.facts.build_definition_counts_by_system as Record<string, number>;
    assert.equal(buildCounts.gn, 2);
    const governance = graph.facts.governance_boundary_counts_by_kind as Record<string, number>;
    assert.deepEqual(governance, { ownership: 1, process: 1, security: 1 });
  });

  it("preserves unresolved runtime/build relationship boundaries without inventing edges", () => {
    const graph = graphOf([
      {
        path: "app.py",
        content:
          "from plugins import *\n" +
          "import importlib\n" +
          "plugin = importlib.import_module(plugin_name)\n" +
          "db = Depends(get_db)\n" +
          "app.include_router(router, prefix='/v1')\n",
      },
      {
        path: "app.js",
        content:
          "const plugin = import(pluginName)\n" +
          "const service = container.resolve(token)\n" +
          "app.use('/admin', adminRouter)\n",
      },
      { path: "App.java", content: "import com.example.plugins.*;\nclass App {}\n" },
      { path: "schema.proto", content: 'syntax = "proto3";\nmessage User {}\n' },
      {
        path: "package.json",
        content: JSON.stringify({ name: "fixture", scripts: { generate: "protoc schema.proto" } }),
      },
      {
        path: "tsconfig.json",
        content: JSON.stringify({ compilerOptions: { paths: { "@app/*": ["src/*"] } } }),
      },
    ]);

    const boundaries = graph.facts.relationship_boundaries as Array<Record<string, unknown>>;
    const find = (kind: string, source: string) => boundaries.filter((row) => row.kind === kind && row.source === source);
    assert.deepEqual(find("wildcard_import", "app.py").map((row) => row.line), [1]);
    assert.deepEqual(find("dynamic_load", "app.py").map((row) => row.line), [3]);
    const pythonDi = find("dependency_injection", "app.py");
    assert.deepEqual(pythonDi.map((row) => row.line), [4]);
    assert.equal(pythonDi[0]?.status, "declared");
    assert.equal(pythonDi[0]?.target_symbol, "get_db");
    assert.deepEqual(find("route_composition", "app.py").map((row) => row.line), [5]);
    assert.deepEqual(find("dynamic_load", "app.js").map((row) => row.line), [1]);
    assert.deepEqual(find("dependency_injection", "app.js").map((row) => row.line), [2]);
    assert.deepEqual(find("route_composition", "app.js").map((row) => row.line), [3]);
    assert.deepEqual(find("wildcard_import", "App.java").map((row) => row.line), [1]);
    assert.ok(find("code_generation", "package.json").length);
    assert.ok(find("build_module_mapping", "tsconfig.json").length);
    assert.ok(Number(graph.facts.unresolved_relationship_boundary_count));
  });

  it("attaches source evidence anchors to generated facts", () => {
    const graph = graphOf([
      {
        path: "pkg/main.py",
        content:
          "from fastapi import APIRouter\nrouter = APIRouter()\n@router.get('/health')\ndef health():\n    return {'ok': True}\n",
      },
    ]);
    const route = routeNode(graph, "pkg/main.py", "GET", "/health");
    assert.ok(route?.evidence_anchor);
    assert.match(String(route?.id), /^route-declaration:pkg\.main:GET:\/health@L\d+$/);
    const anchor = route?.evidence_anchor as Record<string, unknown>;
    assert.equal(anchor.source, "pkg/main.py");
  });

  it("maps extended language relationships with canonical identities", () => {
    const graph = graphOf([
      { path: "rust/lib.rs", content: "mod util;\npub fn run() { util::work(); }\n" },
      { path: "rust/util.rs", content: "pub fn work() {}\n" },
      { path: "ruby/app.rb", content: "require_relative 'service'\n" },
      { path: "ruby/service.rb", content: "class Service; end\n" },
      { path: "native/main.c", content: '#include "util.h"\nint main(void) { return value(); }\n' },
      { path: "native/util.h", content: "int value(void);\n" },
      { path: "jvm/example/A.java", content: "package example;\nimport example.B;\nclass A {}\n" },
      { path: "jvm/example/B.java", content: "package example;\nclass B {}\n" },
      { path: "lua/main.lua", content: "local util = require('lib.util')\n" },
      { path: "lua/lib/util.lua", content: "return {}\n" },
    ]);
    const edges = new Set(graph.edges.map((edge) => `${edge.from}|${edge.to}|${edge.type}`));
    assert.ok(edges.has("rs:rust/lib.rs|rs:rust/util.rs|imports"));
    assert.ok(edges.has("rb:ruby/app.rb|rb:ruby/service.rb|imports"));
    assert.ok(edges.has("native:native/main.c|native:native/util.h|imports"));
    assert.ok(edges.has("jvm:jvm/example/A.java|jvm:jvm/example/B.java|imports"));
    assert.ok(edges.has("lua:lua/main.lua|lua:lua/lib/util.lua|imports"));
  });

  it("maps contracts and configuration without leaking values", () => {
    const graph = graphOf([
      { path: "schemas/common.proto", content: 'syntax = "proto3";\nmessage Id { string value = 1; }\n' },
      { path: "schemas/api.proto", content: 'syntax = "proto3";\nimport "common.proto";\nmessage User {}\nservice Users { rpc Get (User) returns (User); }\n' },
      { path: "schemas/api.graphql", content: "type User { id: ID! }\ntype Query {\n  user(id: ID!): User\n}\n" },
      { path: "schemas/schema.sql", content: "CREATE TABLE public.users (id integer);\nCREATE VIEW active_users AS SELECT * FROM public.users;\n" },
      { path: "schemas/event.avsc", content: JSON.stringify({ type: "record", name: "UserCreated", fields: [] }) },
      { path: "client.py", content: "SCHEMA = 'schemas/api.proto'\nimport os\ndatabase = os.getenv('DATABASE_URL')\n" },
      { path: ".env.example", content: "DATABASE_URL=postgres://secret.example/db\nFEATURE_BETA=true\n" },
      { path: "server.js", content: "const port = process.env.PORT\n" },
      { path: "Dockerfile", content: "FROM python:3.12\nENV WORKERS=2\nEXPOSE 8000/tcp\nCMD [\"python\", \"client.py\"]\n" },
      { path: "docker-compose.yml", content: "services:\n  api:\n    command: python client.py\n    ports:\n      - '8000:8000'\n    environment:\n      DATABASE_URL: hidden\n    healthcheck:\n      test: curl localhost\n" },
    ]);
    const ids = new Set(graph.nodes.map((item) => String(item.id)));
    assert.ok(ids.has("contract:protobuf_message:schemas/api.proto:User"));
    assert.ok(ids.has("contract:protobuf_service:schemas/api.proto:Users"));
    assert.ok(ids.has("contract:protobuf_rpc:schemas/api.proto:Get"));
    assert.ok(ids.has("contract:graphql_operation:schemas/api.graphql:Query.user"));
    assert.ok(ids.has("contract:sql_table:schemas/schema.sql:public.users"));
    assert.ok(ids.has("contract:sql_view:schemas/schema.sql:active_users"));
    assert.ok(ids.has("contract:avro_record:schemas/event.avsc:UserCreated"));
    assert.ok(ids.has("config:key:DATABASE_URL"));
    assert.ok(ids.has("config:key:FEATURE_BETA"));
    assert.ok(ids.has("config:key:PORT"));
    assert.ok(ids.has("config:key:WORKERS"));
    const serialized = JSON.stringify(graph);
    assert.equal(serialized.includes("postgres://secret.example/db"), false);
    assert.equal(serialized.includes("DATABASE_URL: hidden"), false);
    assert.equal(Number(graph.facts.contract_source_count), 5);
    assert.equal(Number(graph.facts.configuration_key_count), 4);
  });

  it("emits participating Python functions and route handlers", () => {
    const graph = graphOf([
      { path: "app/helpers.py", content: "def used():\n    return 1\n\ndef isolated():\n    return 2\n" },
      { path: "app/api.py", content: "from fastapi import APIRouter\nfrom app.helpers import used\nrouter = APIRouter()\n@router.get('/value')\ndef value():\n    return used()\n" },
      { path: "tests/test_api.py", content: "from app.api import value\n" },
    ]);
    const ids = new Set(graph.nodes.map((item) => String(item.id)));
    assert.ok(ids.has("fn:app.helpers:used"));
    assert.ok(ids.has("fn:app.api:value"));
    assert.equal(ids.has("fn:app.helpers:isolated"), false);
    const edges = new Set(graph.edges.map((edge) => `${edge.from}|${edge.to}|${edge.type}`));
    assert.ok(edges.has("fn:app.api:value|fn:app.helpers:used|calls_function"));
    assert.ok(edges.has("test:tests/test_api.py|fn:app.api:value|tests_function"));
    const valueRoute = routeNode(graph, "app/api.py", "GET", "/value");
    assert.ok(valueRoute);
    assert.ok(edges.has(`${valueRoute.id}|fn:app.api:value|handled_by`));
  });

  it("maps methods, nested handlers, callable bindings, route ownership, and direct method tests", () => {
    const graph = graphOf([
      {
        path: "app/runtime.py",
        content:
          "class Worker:\n" +
          "    def complete(self):\n" +
          "        return self._rollup()\n\n" +
          "    def _rollup(self):\n" +
          "        return 1\n\n" +
          "def isolated_helper():\n" +
          "    return 0\n\n" +
          "def register():\n" +
          "    def handler():\n" +
          "        return Worker().complete()\n" +
          "    return ActionDefinition(name='job.complete', handler=handler)\n\n" +
          "@router.post('/run')\n" +
          "def run_route():\n" +
          "    return Worker().complete()\n",
      },
      {
        path: "tests/test_runtime.py",
        content:
          "from app.runtime import Worker\n\n" +
          "def test_complete():\n" +
          "    worker = Worker()\n" +
          "    assert worker.complete() == 1\n",
      },
    ]);

    const nodes = new Map(graph.nodes.map((item) => [String(item.id), item]));
    const edges = new Set(graph.edges.map((edge) => `${edge.from}|${edge.to}|${edge.type}`));
    const complete = "fn:app.runtime:Worker.complete";
    const rollup = "fn:app.runtime:Worker._rollup";
    const register = "fn:app.runtime:register";
    const handler = "fn:app.runtime:register.handler";
    const routeHandler = "fn:app.runtime:run_route";

    assert.equal(nodes.get(complete)?.type, "python_method");
    assert.equal(nodes.get(complete)?.owner_class, "Worker");
    assert.equal(nodes.get(handler)?.type, "python_function");
    assert.equal(nodes.get(handler)?.enclosing_function, "register");
    assert.equal(nodes.get(routeHandler)?.route_handler, true);
    assert.equal(nodes.has("fn:app.runtime:isolated_helper"), false);

    assert.ok(edges.has(`${complete}|${rollup}|calls_function`));
    assert.ok(edges.has(`${handler}|${complete}|calls_function`));
    assert.ok(edges.has(`${routeHandler}|${complete}|calls_function`));

    const binding = graph.nodes.find(
      (item) => item.type === "callable_binding" && item.name === "job.complete",
    );
    assert.ok(binding);
    assert.equal(binding.constructor, "ActionDefinition");
    assert.ok(edges.has(`${register}|${binding.id}|declares_binding`));
    assert.ok(edges.has(`${binding.id}|${handler}|binds_callable`));

    const runRoute = routeNode(graph, "app/runtime.py", "POST", "/run");
    assert.ok(runRoute);
    assert.ok(edges.has(`${runRoute.id}|${routeHandler}|handled_by`));
    assert.ok(edges.has(`test:tests/test_runtime.py|${complete}|tests_function`));
  });

  it("reports instrument integrity without emitting architectural judgment", () => {
    const pack = packOf([{ path: "pkg/main.py", content: "import unknown_package\n" }]);
    const completeness = pack["graph-completeness-report.json"] as {
      role: string;
      integrity_pass: boolean;
      residuals: { unresolved_import_count: number };
    };
    assert.equal(completeness.role, "instrument-integrity");
    assert.equal(completeness.integrity_pass, true);
    assert.equal(completeness.residuals.unresolved_import_count, 1);

    for (const retired of [
      "graph-architecture-decision.json",
      "graph-impact-report.json",
      "graph-proof-manifest.json",
      "graph-machine-index.v1.json",
    ]) {
      assert.equal(retired in pack, false, retired);
    }
  });

  it("models GN targets and resolves repository-root native includes", () => {
    const pack = packOf([
      { path: "base/memory/raw_ptr.h", content: "struct RawPtr {};\n" },
      { path: "app/main.cc", content: '#include "base/memory/raw_ptr.h"\nint main() { return 0; }\n' },
      { path: "app/util.cc", content: "int util() { return 1; }\n" },
      {
        path: "app/BUILD.gn",
        content:
          'source_set("util") {\n  sources = ["util.cc"]\n}\n' +
          'executable("app") {\n  sources = ["main.cc"]\n  deps = [":util"]\n}\n',
      },
    ]);
    const graph = pack["dependency-graph.v1.json"] as ReturnType<typeof graphOf>;
    assert.equal(graph.schema_version, "1.13");
    const ids = new Set(graph.nodes.map((row) => String(row.id)));
    assert.ok(ids.has("build-target://app:util"));
    assert.ok(ids.has("build-target://app:app"));
    const edges = new Set(graph.edges.map((edge) => `${edge.from}|${edge.to}|${edge.type}`));
    assert.ok(edges.has("build-target://app:app|build-target://app:util|depends_on_build_target"));
    assert.ok(edges.has("build-target://app:app|native:app/main.cc|declares_build_input"));
    assert.ok(edges.has("native:app/main.cc|native:base/memory/raw_ptr.h|imports"));
    assert.equal(Number(graph.facts.build_target_count), 2);
    assert.equal(Number(graph.facts.build_target_dependency_edge_count), 1);
    const ledger = pack["graph-unresolved-ledger.v1.json"] as { specifier_table: string[] };
    assert.equal(ledger.specifier_table.includes("base/memory/raw_ptr.h"), false);
  });

  it("ships ASCII topology, factual change set, compact graph, and lossless residual ledger", () => {
    const pack = packOf([
      { path: "a.py", content: "import mystery_package\n" },
      { path: "b.py", content: "import mystery_package\n" },
    ]);
    const graph = pack["dependency-graph.v1.json"] as {
      nodes: Array<Record<string, unknown>>;
      edges: Array<Record<string, unknown>>;
      facts: Record<string, unknown>;
      [key: string]: unknown;
    };
    assert.equal("metrics" in graph, false);
    assert.equal("unresolved_imports" in graph.facts, false);

    const ascii = pack["dependency-graph.ascii.v1.txt"] as string;
    const decoded = decodeGraphAscii(ascii);
    assert.match(ascii, /^G2\|/);
    assert.equal(decoded.schema_version, "ascii-topology-v2");
    assert.equal(decoded.direction, "c>d");
    assert.equal(decoded.nodes.length, graph.nodes.length);
    assert.equal(decoded.edges.length, graph.edges.length);

    const changeSet = pack["graph-change-set.v1.json"] as {
      role: string;
      requested: boolean;
      changed_files: unknown[];
      changed_node_ids: unknown[];
    };
    assert.equal(changeSet.role, "factual-change-set");
    assert.equal(changeSet.requested, false);
    assert.deepEqual(changeSet.changed_files, []);
    assert.deepEqual(changeSet.changed_node_ids, []);

    const pointer = graph.facts.unresolved_reference_ledger as {
      reference_count: number;
      sha256: string;
      encoding: string;
    };
    const ledger = pack["graph-unresolved-ledger.v1.json"] as {
      reference_count: number;
      unique_specifier_count: number;
      references: Array<[number, number]>;
    };
    assert.equal(pointer.encoding, "dictionary-pairs-v1");
    assert.equal(pointer.reference_count, 2);
    assert.equal(sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    assert.equal(pointer.sha256, sha256Hex(canonicalJson(ledger)));
    assert.equal(ledger.reference_count, 2);
    assert.equal(ledger.unique_specifier_count, 1);
    assert.equal(ledger.references.length, 2);

    assert.equal(typeof pack["00-AI-READ-FIRST.md"], "string");
  });
});
