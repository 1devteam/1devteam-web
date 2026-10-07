import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reconstructPack } from "./reconstruct.ts";

function graphOf(files: Array<{ path: string; content: string }>) {
  return reconstructPack({ files })["dependency-graph.v1.json"] as {
    schema_version: string;
    nodes: Array<Record<string, unknown>>;
    edges: Array<Record<string, unknown>>;
    facts: Record<string, unknown>;
    metrics: Record<string, unknown>;
  };
}

function node(graph: ReturnType<typeof graphOf>, id: string) {
  return graph.nodes.find((item) => item.id === id);
}

describe("canonical 1.7 browser parity surface", () => {
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

    assert.equal(node(graph, "file:engine/native/core.cc")?.source_provenance, "authored");
    assert.equal(node(graph, "file:engine/gen/generated.cc")?.source_provenance, "generated");
    assert.equal(node(graph, "file:third_party/lib/vendor.cc")?.source_provenance, "vendored");

    const edgeKeys = new Set(graph.edges.map((edge) => `${edge.from}|${edge.to}|${edge.type}`));
    assert.ok(edgeKeys.has("subsystem:engine/web|subsystem:engine|member_of_subsystem"));
    assert.ok(edgeKeys.has("build:engine/BUILD.gn|file:engine/native/core.cc|declares_build_input"));
    assert.ok(edgeKeys.has("build:engine/BUILD.gn|fe:engine/web/app.ts|declares_build_input"));

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
    const find = (kind: string, source: string) => boundaries.filter((r) => r.kind === kind && r.source === source);
    assert.deepEqual(find("wildcard_import", "app.py").map((r) => r.line), [1]);
    assert.deepEqual(find("dynamic_load", "app.py").map((r) => r.line), [3]);
    assert.deepEqual(find("dependency_injection", "app.py").map((r) => r.line), [4]);
    assert.deepEqual(find("route_composition", "app.py").map((r) => r.line), [5]);
    assert.deepEqual(find("dynamic_load", "app.js").map((r) => r.line), [1]);
    assert.deepEqual(find("dependency_injection", "app.js").map((r) => r.line), [2]);
    assert.deepEqual(find("route_composition", "app.js").map((r) => r.line), [3]);
    assert.deepEqual(find("wildcard_import", "App.java").map((r) => r.line), [1]);
    assert.ok(find("code_generation", "package.json").length);
    assert.ok(find("build_module_mapping", "tsconfig.json").length);
    assert.ok(graph.metrics.unresolved_relationship_boundary_count);
  });

  it("attaches source evidence anchors to generated facts", () => {
    const graph = graphOf([
      { path: "pkg/main.py", content: "from fastapi import APIRouter\nrouter = APIRouter()\n@router.get('/health')\ndef health():\n    return {'ok': True}\n" },
    ]);
    const route = node(graph, "route:GET /health");
    assert.ok(route?.evidence_anchor);
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
    assert.equal(graph.metrics.contract_source_count, 5);
    assert.equal(graph.metrics.configuration_key_count, 4);
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
    assert.ok(edges.has("route:GET /value|fn:app.api:value|handled_by"));
  });

  it("reports canonical assurance dimensions", () => {
    const pack = reconstructPack({ files: [{ path: "pkg/main.py", content: "import unknown_package\n" }] });
    const completeness = pack["graph-completeness-report.json"] as Record<string, unknown>;
    const decision = pack["graph-architecture-decision.json"] as {
      decision: { dimensions: Record<string, string>; architecture_disposition: string };
    };
    assert.equal(completeness.identity_integrity_pass, true);
    assert.equal(decision.decision.dimensions.artifact_integrity, "passed");
    assert.equal(decision.decision.dimensions.identity_integrity, "passed");
    assert.equal(decision.decision.dimensions.structural_coverage, "gaps-visible");
    assert.equal(decision.decision.architecture_disposition, "review-required");
  });

});
