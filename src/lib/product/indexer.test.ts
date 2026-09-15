import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calleesOf, callersOf, indexFiles, resolveSpecifier } from "./indexer.ts";
import { filesFromTextMap } from "./ingest.ts";
import { OMNIPATH_SOURCE } from "./seeds.ts";

describe("indexer", () => {
  it("extracts python classes, defs, imports, callers and callees", () => {
    const files = filesFromTextMap(OMNIPATH_SOURCE);
    const index = indexFiles(files);
    const factory = index.symbols.find((s) => s.name === "AgentFactory");
    assert.ok(factory);
    assert.equal(factory?.kind, "class");
    const create = index.symbols.find((s) => s.name === "create_specialized_agent");
    assert.ok(create);
    const imported = index.imports.find(
      (i) => i.fromPath.includes("agent_factory.py") && i.specifier.includes("governance_hooks"),
    );
    assert.ok(imported);
    assert.equal(imported?.resolvedPath, "backend/agents/integration/governance_hooks.py");
    const prideImport = index.imports.find(
      (i) => i.fromPath.includes("agent_factory.py") && i.specifier.includes("pride_kernel"),
    );
    assert.equal(prideImport, undefined);
    const callers = callersOf(index, "on_agent_created");
    assert.ok(callers.some((c) => c.callerPath.includes("agent_factory.py")));
    const callees = calleesOf(index, "create_specialized_agent");
    assert.ok(callees.some((c) => c.calleeName === "on_agent_created" || c.calleeName === "_spawn"));
  });

  it("extracts python HTTP routes as map facts", () => {
    const index = indexFiles([
      {
        path: "backend/api/routes/health.py",
        content: "router.get(\"/health\")\nrouter.post(\"/ready\")\n",
        language: "python",
        size: 40,
      },
    ]);
    assert.ok(index.routes.some((r) => r.method === "GET" && r.route === "/health"));
    assert.ok(index.routes.some((r) => r.method === "POST" && r.route === "/ready"));
  });

  it("resolves relative and dotted specifiers", () => {
    const files = new Set(["backend/agents/factory/agent_factory.py", "backend/agents/integration/governance_hooks.py"]);
    assert.equal(
      resolveSpecifier(
        "backend/agents/factory/agent_factory.py",
        "backend.agents.integration.governance_hooks",
        files,
      ),
      "backend/agents/integration/governance_hooks.py",
    );
    assert.equal(
      resolveSpecifier("pkg/api.py", "pkg.core", new Set(["pkg/api.py", "pkg/core.py"])),
      "pkg/core.py",
    );
    assert.equal(
      resolveSpecifier("src/app.ts", "@/lib/util", new Set(["src/lib/util.ts", "src/app.ts"])),
      "src/lib/util.ts",
    );
  });
});
