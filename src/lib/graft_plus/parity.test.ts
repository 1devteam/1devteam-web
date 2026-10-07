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
});
