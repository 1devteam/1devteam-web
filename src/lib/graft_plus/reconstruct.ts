/**
 * Browser port of 1devteam/graft_plus reconstruct.
 * Generated structure + completeness + impact + proof + decision.
 * No source dump. No Ajenda domain rules. Never merge authority.
 */

export const MERGE_AUTHORIZATION = "not-determined" as const;
export const IMPLEMENTS_PLAN = false;
export const GRANTS_EXECUTION_AUTHORITY = false;

export type FileInput = { path: string; content: string };

type Node = { id: string; type: string; source: string; layer: "generated" | "overlay" };
type Edge = { from: string; to: string; type: string; evidence: string; layer: "generated" | "overlay" };
type Unresolved = { specifier: string; from: string };

const PY_IMPORT = /^\s*(?:from|import)\s+([A-Za-z0-9_\.]+)/gm;
const FE_IMPORT = /(?:import|export)\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/g;
const SKIP = /(^|\/)(node_modules|dist|build|\.venv|venv|__pycache__|\.git)(\/|$)/;
const RUNTIME = new Set([
  "abc", "argparse", "ast", "asyncio", "base64", "collections", "concurrent", "configparser",
  "contextlib", "copy", "csv", "dataclasses", "datetime", "decimal", "email", "enum", "fnmatch",
  "functools", "getpass", "glob", "gzip", "hashlib", "hmac", "html", "http", "importlib",
  "inspect", "io", "itertools", "json", "logging", "math", "mmap", "multiprocessing", "os",
  "pathlib", "pickle", "pkgutil", "platform", "pprint", "queue", "random", "re", "secrets",
  "shutil", "signal", "socket", "sqlite3", "ssl", "statistics", "string", "struct", "subprocess",
  "sys", "tarfile", "tempfile", "textwrap", "threading", "time", "tomllib", "traceback", "types",
  "typing", "unicodedata", "unittest", "urllib", "uuid", "warnings", "weakref", "webbrowser",
  "xml", "zipfile", "__future__",
]);

function skip(path: string): boolean {
  return SKIP.test(path) || path.includes("/fixtures/");
}

function runtime(specifier: string): boolean {
  const root = specifier.split(".")[0]?.split("/")[0] ?? specifier;
  return RUNTIME.has(root) || specifier.startsWith("node:");
}

function packageRoot(specifier: string): string {
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/");
  return specifier.split(".")[0]?.split("/")[0] ?? specifier;
}

function moduleFor(path: string): string {
  const rel = path.replace(/\\/g, "/").replace(/\.py$/, "");
  const parts = rel.split("/").filter(Boolean);
  if (parts[0] === "src") parts.shift();
  if (parts[parts.length - 1] === "__init__") parts.pop();
  return parts.join(".");
}

function bestTarget(imported: string, modules: Set<string>): string | undefined {
  if (modules.has(imported)) return imported;
  const parts = imported.split(".");
  while (parts.length > 1) {
    parts.pop();
    const c = parts.join(".");
    if (modules.has(c)) return c;
  }
  return undefined;
}

function pythonGraph(files: FileInput[]): { nodes: Node[]; edges: Edge[]; unresolved: Unresolved[] } {
  const py = files.filter((f) => f.path.endsWith(".py") && !skip(f.path) && !f.path.startsWith("tests/"));
  const moduleByPath = new Map(py.map((f) => [f.path, moduleFor(f.path)]));
  const modules = new Set([...moduleByPath.values()].filter(Boolean));
  const nodes: Node[] = [...moduleByPath.entries()]
    .filter(([, m]) => m)
    .map(([path, module]) => ({ id: `py:${module}`, type: "python_module", source: path, layer: "generated" }));
  const edges: Edge[] = [];
  const unresolved: Unresolved[] = [];
  for (const file of py) {
    const module = moduleByPath.get(file.path);
    if (!module) continue;
    PY_IMPORT.lastIndex = 0;
    let match: RegExpExecArray | null;
    const imported = new Set<string>();
    while ((match = PY_IMPORT.exec(file.content))) {
      const name = match[1];
      const target = bestTarget(name, modules);
      if (target && target !== module) imported.add(target);
      else if (!target && !runtime(name)) unresolved.push({ specifier: name, from: file.path });
    }
    for (const target of imported) {
      edges.push({ from: `py:${module}`, to: `py:${target}`, type: "imports", evidence: file.path, layer: "generated" });
    }
  }
  return { nodes, edges, unresolved };
}

function testGraph(files: FileInput[], production: Set<string>): { nodes: Node[]; edges: Edge[]; unresolved: Unresolved[] } {
  const tests = files.filter((f) => f.path.startsWith("tests/") && f.path.endsWith(".py") && !skip(f.path));
  const nodes: Node[] = tests.map((f) => ({ id: `test:${f.path}`, type: "test_module", source: f.path, layer: "generated" }));
  const edges: Edge[] = [];
  const unresolved: Unresolved[] = [];
  for (const file of tests) {
    PY_IMPORT.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = PY_IMPORT.exec(file.content))) {
      const name = match[1];
      const target = bestTarget(name, production);
      if (target) edges.push({ from: `test:${file.path}`, to: `py:${target}`, type: "tests", evidence: file.path, layer: "generated" });
      else if (!runtime(name)) unresolved.push({ specifier: name, from: file.path });
    }
  }
  return { nodes, edges, unresolved };
}

function frontendGraph(files: FileInput[]): { nodes: Node[]; edges: Edge[]; unresolved: Unresolved[] } {
  const fe = files.filter((f) => /\.(ts|tsx)$/.test(f.path) && !skip(f.path) && !f.path.endsWith(".d.ts"));
  const set = new Set(fe.map((f) => f.path));
  const nodes: Node[] = fe.map((f) => ({ id: `fe:${f.path}`, type: "frontend_module", source: f.path, layer: "generated" }));
  const edges: Edge[] = [];
  const unresolved: Unresolved[] = [];
  for (const file of fe) {
    FE_IMPORT.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = FE_IMPORT.exec(file.content))) {
      const spec = match[1];
      if (spec.startsWith(".")) {
        const parent = file.path.split("/").slice(0, -1).join("/");
        const raw = `${parent}/${spec}`.replace(/\/\.\//g, "/");
        const cands = [raw, `${raw}.ts`, `${raw}.tsx`, `${raw}/index.ts`, `${raw}/index.tsx`];
        const hit = cands.find((c) => set.has(c));
        if (hit && hit !== file.path) {
          edges.push({ from: `fe:${file.path}`, to: `fe:${hit}`, type: "imports", evidence: file.path, layer: "generated" });
        } else if (!hit) unresolved.push({ specifier: spec, from: file.path });
      } else if (!runtime(spec)) {
        unresolved.push({ specifier: spec, from: file.path });
      }
    }
  }
  return { nodes, edges, unresolved };
}

function surfaces(files: FileInput[]): Node[] {
  const nodes: Node[] = [];
  for (const file of files) {
    const name = file.path.split("/").pop() ?? file.path;
    if (file.path.startsWith(".github/workflows/") && (name.endsWith(".yml") || name.endsWith(".yaml"))) {
      nodes.push({ id: `ci:${file.path}`, type: "ci_workflow", source: file.path, layer: "generated" });
    } else if (name === "Dockerfile" || name.startsWith("Dockerfile.") || name === "docker-compose.yml" || name === "docker-compose.yaml") {
      nodes.push({ id: `docker:${file.path}`, type: "docker", source: file.path, layer: "generated" });
    } else if (["pyproject.toml", "package.json", "go.mod", "Cargo.toml", "requirements.txt"].includes(name)) {
      nodes.push({ id: `manifest:${file.path}`, type: "manifest", source: file.path, layer: "generated" });
    }
  }
  return nodes;
}

function sha256sync(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0");
}

export function reconstructPack(input: {
  files: FileInput[];
  origin?: { owner?: string; repo?: string; ref?: string; sha?: string; url?: string };
}): Record<string, unknown> {
  const files = input.files.filter((f) => !skip(f.path));
  const py = pythonGraph(files);
  const production = new Set(py.nodes.map((n) => n.id.slice(3)));
  const tests = testGraph(files, production);
  const fe = frontendGraph(files);
  const surfaceNodes = surfaces(files);
  const nodes = [...py.nodes, ...fe.nodes, ...tests.nodes, ...surfaceNodes];
  const edges = [...py.edges, ...fe.edges, ...tests.edges];
  const unresolvedMap = new Map<string, Unresolved>();
  for (const row of [...py.unresolved, ...fe.unresolved, ...tests.unresolved]) {
    unresolvedMap.set(`${row.specifier}|${row.from}`, row);
  }
  const unresolved = [...unresolvedMap.values()].sort((a, b) => a.specifier.localeCompare(b.specifier) || a.from.localeCompare(b.from));
  const roots = [...new Set(unresolved.map((r) => packageRoot(r.specifier)))].sort();
  const known = new Set(nodes.map((n) => n.id));
  const missing = [...new Set(edges.flatMap((e) => [e.from, e.to]).filter((id) => !known.has(id)))].sort();
  const graph = {
    schema_version: "1.1",
    product: "G.R.A.F.T.+",
    package: "graft_plus",
    role: "fact-substrate",
    implementsPlan: IMPLEMENTS_PLAN,
    grants_execution_authority: GRANTS_EXECUTION_AUTHORITY,
    nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)),
    edges: edges.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to)),
    facts: { unresolved_imports: unresolved, unresolved_package_roots: roots },
    metrics: {
      node_count: nodes.length,
      edge_count: edges.length,
      overlay_node_count: 0,
      unresolved_import_count: unresolved.length,
      surface_count: surfaceNodes.length,
      edge_counts_by_type: edges.reduce<Record<string, number>>((acc, e) => {
        acc[e.type] = (acc[e.type] ?? 0) + 1;
        return acc;
      }, {}),
    },
  };
  const residuals = {
    overlay: "residual",
    unresolved_imports: unresolved,
    unresolved_package_roots: roots,
    no_git_range: true,
    unmapped_changed_files: [] as string[],
    note: "Residuals stay visible. Unresolved imports are facts, not missing files. Overlay stays residual until a reviewed relationship is attached.",
  };
  const completeness = {
    schema_version: "1.1",
    integrity_pass: missing.length === 0,
    undefined_edge_endpoints: missing,
    unacknowledged_blocking_findings: [] as string[],
    node_count: nodes.length,
    edge_count: edges.length,
    residuals,
    note: "An acknowledgement is not a repair.",
  };
  const impact = {
    schema_version: "1.0",
    changed_files: [] as string[],
    changed_nodes: [] as Node[],
    unmapped_changed_files: [] as string[],
    impacted_tests: [] as string[],
    changed_node_count: 0,
    note: "no git range requested",
  };
  const proofs = {
    schema_version: "1.0",
    selected_bundles: [] as unknown[],
    required_tests: [] as string[],
    required_gates: [] as string[],
    manual_review: [] as string[],
    note: "Bundles are overlay-supplied. This package has no product-specific proofs.",
  };
  const review = ["overlay_residual"];
  const warnings = ["no_git_range"];
  if (roots.length) warnings.push("unresolved_imports");
  const decision = {
    schema_version: "1.1",
    product: "G.R.A.F.T.+",
    package: "graft_plus",
    role: "fact-substrate",
    decision: {
      architecture_disposition: completeness.integrity_pass ? "clear" : "blocked",
      merge_authorization: MERGE_AUTHORIZATION,
      full_ci_required: true,
      blocking_reasons: missing.length ? ["undefined_edge_endpoints"] : [],
      review_reasons: review,
      warnings,
    },
    grants_execution_authority: GRANTS_EXECUTION_AUTHORITY,
    implementsPlan: IMPLEMENTS_PLAN,
    residuals,
    negatives: [
      "This pack is a map. It is not a plan.",
      "merge_authorization is not-determined even when disposition is clear.",
      "An acknowledgement is not a repair.",
      "Do not invent missing nodes.",
      "Unresolved imports are facts, not missing files.",
      "Overlay stays residual until a reviewed relationship is attached.",
    ],
  };
  const sha = input.origin?.sha ?? "unpinned";
  const receipt = {
    product: "G.R.A.F.T.+",
    package: "graft_plus",
    subject: input.origin?.url ?? `${input.origin?.owner ?? "local"}/${input.origin?.repo ?? "subject"}`,
    subject_sha: sha,
    status: completeness.integrity_pass ? "passed" : "failed",
    decipher: "graph-architecture-decision.json",
    grants_execution_authority: GRANTS_EXECUTION_AUTHORITY,
    implementsPlan: IMPLEMENTS_PLAN,
    merge_authorization: MERGE_AUTHORIZATION,
    fingerprint: sha256sync(JSON.stringify({ nodes: graph.nodes.map((n) => n.id), sha })),
  };
  return {
    "graph-architecture-decision.json": decision,
    "dependency-graph.v1.json": graph,
    "graph-completeness-report.json": completeness,
    "graph-impact-report.json": impact,
    "graph-proof-manifest.json": proofs,
    "graft-plus-receipt.json": receipt,
  };
}
