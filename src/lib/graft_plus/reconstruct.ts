/**
 * Browser port of 1devteam/graft_plus universal shell.
 * Generated structure + completeness + impact + proof + decision.
 * No source dump. No Ajenda domain rules. Never merge authority.
 */

export const MERGE_AUTHORIZATION = "not-determined" as const;
export const IMPLEMENTS_PLAN = false;
export const GRANTS_EXECUTION_AUTHORITY = false;

export type FileInput = { path: string; content: string };

type Node = {
  id: string;
  type: string;
  source: string;
  layer: "generated" | "overlay";
  [key: string]: unknown;
};
type Edge = { from: string; to: string; type: string; evidence: string; layer: "generated" | "overlay" };
type Unresolved = { specifier: string; from: string };

const PY_IMPORT = /^\s*(?:from|import)\s+([A-Za-z0-9_\.]+)/gm;
const FE_IMPORT = /(?:import|export)\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/g;
const SKIP = /(^|\/)(node_modules|dist|build|\.venv|venv|__pycache__|\.git)(\/|$)/;
const RUNTIME = new Set(
  `abc argparse array ast asyncio atexit base64 bdb binascii bisect builtins bz2 calendar cmath cmd code codecs collections colorsys compileall concurrent configparser contextlib contextvars copy copyreg csv ctypes dataclasses datetime decimal difflib dis doctest email enum errno faulthandler fcntl filecmp fileinput fnmatch fractions ftplib functools gc getopt getpass gettext glob gzip hashlib heapq hmac html http imaplib importlib inspect io ipaddress itertools json keyword linecache locale logging lzma mailbox marshal math mimetypes mmap multiprocessing netrc numbers operator optparse os pathlib pdb pickle pkgutil platform pprint pstats pty pwd queue random re readline reprlib resource rlcompleter runpy sched secrets select selectors shelve shlex shutil signal site smtplib socket socketserver sqlite3 ssl stat statistics string struct subprocess sys sysconfig syslog tarfile tempfile textwrap threading time timeit token tokenize traceback types typing unicodedata unittest urllib uuid venv warnings wave weakref webbrowser xml xmlrpc zipfile zipimport zlib zoneinfo __future__`
    .split(/\s+/),
);
const SOURCE_SUFFIX = /\.(py|ts|tsx|js|jsx|go|rs|rb|php)$/;
const NETWORK_LIBS = /\b(?:import|from)\s+(httpx|requests|aiohttp|smtplib)\b/;

function skip(path: string): boolean {
  return SKIP.test(path) || path.includes("/fixtures/");
}

function productionPy(path: string): boolean {
  return path.endsWith(".py") && !skip(path) && !path.startsWith("tests/") && !path.includes("/tests/");
}

function runtime(specifier: string): boolean {
  if (!specifier) return true;
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
      if (!name) continue;
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
  const tests = files.filter((f) => (f.path.startsWith("tests/") || f.path.includes("/tests/")) && f.path.endsWith(".py") && !skip(f.path));
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

function semantic(files: FileInput[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const tables = new Map<string, { sources: string[]; rls: boolean }>();

  for (const file of files) {
    if (!file.path.endsWith(".py") || skip(file.path)) continue;
    const isMigration = /(?:^|\/)(?:alembic|migrations)\/versions\/.+\.py$/.test(file.path);
    if (isMigration) {
      const id = `migration:${file.path.split("/").pop()?.replace(/\.py$/, "")}`;
      nodes.push({ id, type: "migration", source: file.path, layer: "generated" });
      const tableRe = /op\.(?:create_table|add_column|drop_table|alter_column)\(\s*["']([A-Za-z0-9_]+)/g;
      let match: RegExpExecArray | null;
      const found = new Set<string>();
      while ((match = tableRe.exec(file.content))) found.add(match[1]);
      const rlsRe = /ALTER\s+TABLE\s+([A-Za-z0-9_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
      while ((match = rlsRe.exec(file.content))) {
        found.add(match[1]);
        const row = tables.get(match[1]) ?? { sources: [], rls: false };
        row.rls = true;
        tables.set(match[1], row);
      }
      for (const table of found) {
        const row = tables.get(table) ?? { sources: [], rls: false };
        row.sources.push(file.path);
        tables.set(table, row);
        edges.push({ from: id, to: `db:table:${table}`, type: "creates_or_alters_table", evidence: file.path, layer: "generated" });
      }
    }
  }
  for (const [table, row] of [...tables.entries()].sort()) {
    nodes.push({
      id: `db:table:${table}`,
      type: "database_table",
      source: row.sources.at(-1) ?? "",
      layer: "generated",
      label: table,
      rls_enabled: row.rls,
    });
  }

  for (const file of files.filter((f) => productionPy(f.path))) {
    const module = moduleFor(file.path);
    let match: RegExpExecArray | null;
    const routeRe = /@(?:[A-Za-z0-9_]+\.)(get|post|put|patch|delete|head|options|websocket)\(\s*["']([^"']+)/gi;
    while ((match = routeRe.exec(file.content))) {
      const method = match[1].toUpperCase();
      const route = match[2];
      const id = `route:${method} ${route}`;
      nodes.push({ id, type: "http_route", source: file.path, layer: "generated", method, route });
      edges.push({ from: `py:${module}`, to: id, type: "exposes_route", evidence: file.path, layer: "generated" });
    }
    const flaskRe = /@(?:[A-Za-z0-9_]+)\.route\(\s*["']([^"']+)["'](?:[^)]*methods\s*=\s*\[([^\]]+)\])?/gi;
    while ((match = flaskRe.exec(file.content))) {
      const route = match[1];
      const methods = match[2]
        ? match[2].split(",").map((m) => m.replace(/['"\s]/g, "")).filter(Boolean)
        : ["GET"];
      for (const method of methods) {
        const id = `route:${method.toUpperCase()} ${route}`;
        nodes.push({ id, type: "http_route", source: file.path, layer: "generated", method: method.toUpperCase(), route });
        edges.push({ from: `py:${module}`, to: id, type: "exposes_route", evidence: file.path, layer: "generated" });
      }
    }
    const djangoRe = /\b(?:path|re_path|url)\(\s*["']([^"']+)/g;
    while ((match = djangoRe.exec(file.content))) {
      const id = `route:ANY ${match[1]}`;
      nodes.push({ id, type: "http_route", source: file.path, layer: "generated", method: "ANY", route: match[1] });
      edges.push({ from: `py:${module}`, to: id, type: "exposes_route", evidence: file.path, layer: "generated" });
    }
    const tableRe = /__tablename__\s*=\s*["']([A-Za-z0-9_]+)/g;
    while ((match = tableRe.exec(file.content))) {
      const id = `db:table:${match[1]}`;
      nodes.push({ id, type: "database_table", source: file.path, layer: "generated", label: match[1] });
      edges.push({ from: `py:${module}`, to: id, type: "defines_table", evidence: file.path, layer: "generated" });
    }
    if (NETWORK_LIBS.test(file.content) && /\.(get|post|put|patch|delete|request)\s*\(/.test(file.content)) {
      const sink = `egress:${module}`;
      nodes.push({ id: sink, type: "network_egress_sink", source: file.path, layer: "generated", classification: "unclassified" });
      edges.push({ from: `py:${module}`, to: sink, type: "network_call", evidence: file.path, layer: "generated" });
    }
    const modelRe = /^class\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*(?:BaseModel|Protocol|TypedDict|Enum)/gm;
    while ((match = modelRe.exec(file.content))) {
      const id = `contract:${module}:${match[1]}`;
      nodes.push({ id, type: "contract", source: file.path, layer: "generated", name: match[1], kind: "model" });
      edges.push({ from: `py:${module}`, to: id, type: "defines_contract", evidence: file.path, layer: "generated" });
    }
    if (/@dataclass/.test(file.content)) {
      const dcRe = /@dataclass[\s\S]{0,80}class\s+([A-Za-z_][A-Za-z0-9_]*)/g;
      while ((match = dcRe.exec(file.content))) {
        const id = `contract:${module}:${match[1]}`;
        nodes.push({ id, type: "contract", source: file.path, layer: "generated", name: match[1], kind: "dataclass" });
        edges.push({ from: `py:${module}`, to: id, type: "defines_contract", evidence: file.path, layer: "generated" });
      }
    }
  }

  const jsRoute = /\b(?:app|router|api)\.(get|post|put|patch|delete|all)\(\s*['"]([^'"]+)/gi;
  for (const file of files.filter((f) => /\.(js|mjs|ts)$/.test(f.path) && !skip(f.path))) {
    let match: RegExpExecArray | null;
    jsRoute.lastIndex = 0;
    while ((match = jsRoute.exec(file.content))) {
      const id = `route:${match[1].toUpperCase()} ${match[2]}`;
      nodes.push({ id, type: "http_route", source: file.path, layer: "generated", method: match[1].toUpperCase(), route: match[2] });
    }
  }

  const tsRe = /export\s+(?:interface|type)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  for (const file of files.filter((f) => /\.(ts|tsx)$/.test(f.path) && !skip(f.path))) {
    let match: RegExpExecArray | null;
    tsRe.lastIndex = 0;
    while ((match = tsRe.exec(file.content))) {
      nodes.push({
        id: `contract:${file.path}:${match[1]}`,
        type: "contract",
        source: file.path,
        layer: "generated",
        name: match[1],
        kind: "typescript",
      });
    }
  }
  return { nodes, edges };
}

function coverage(files: FileInput[], nodes: Node[]): { unmapped_source_files: string[]; stale_graph_sources: { id: string; source: string }[] } {
  const mapped = new Set(nodes.map((n) => n.source).filter(Boolean));
  const unmapped = files
    .filter((f) => SOURCE_SUFFIX.test(f.path) && !skip(f.path) && !mapped.has(f.path))
    .map((f) => f.path)
    .sort();
  const present = new Set(files.map((f) => f.path));
  const stale = nodes
    .filter((n) => n.source && !present.has(n.source))
    .map((n) => ({ id: n.id, source: n.source }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return { unmapped_source_files: unmapped, stale_graph_sources: stale };
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
  const generated = semantic(files);
  const nodes = [...py.nodes, ...fe.nodes, ...tests.nodes, ...surfaceNodes, ...generated.nodes];
  const edges = [...py.edges, ...fe.edges, ...tests.edges, ...generated.edges];
  const unresolvedMap = new Map<string, Unresolved>();
  for (const row of [...py.unresolved, ...fe.unresolved, ...tests.unresolved]) {
    unresolvedMap.set(`${row.specifier}|${row.from}`, row);
  }
  const unresolved = [...unresolvedMap.values()].sort((a, b) => a.specifier.localeCompare(b.specifier) || a.from.localeCompare(b.from));
  const roots = [...new Set(unresolved.map((r) => packageRoot(r.specifier)))].sort();
  const known = new Set(nodes.map((n) => n.id));
  const kept = edges.filter((e) => known.has(e.from) && known.has(e.to));
  const missing = [...new Set(edges.flatMap((e) => [e.from, e.to]).filter((id) => !known.has(id)))].sort();
  const cover = coverage(files, nodes);
  const graph = {
    schema_version: "1.1",
    product: "G.R.A.F.T.+",
    package: "graft_plus",
    role: "fact-substrate",
    implementsPlan: IMPLEMENTS_PLAN,
    grants_execution_authority: GRANTS_EXECUTION_AUTHORITY,
    nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)),
    edges: kept.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to)),
    facts: { unresolved_imports: unresolved, unresolved_package_roots: roots },
    metrics: {
      node_count: nodes.length,
      edge_count: kept.length,
      overlay_node_count: 0,
      unresolved_import_count: unresolved.length,
      surface_count: surfaceNodes.length,
      edge_counts_by_type: kept.reduce<Record<string, number>>((acc, e) => {
        acc[e.type] = (acc[e.type] ?? 0) + 1;
        return acc;
      }, {}),
    },
  };
  const residuals = {
    overlay: "residual",
    unresolved_import_count: unresolved.length,
    unresolved_package_roots: roots,
    no_git_range: true,
    unmapped_changed_files: [] as string[],
    unmapped_source_file_count: cover.unmapped_source_files.length,
    unmapped_source_files: cover.unmapped_source_files.slice(0, 50),
    stale_graph_source_count: cover.stale_graph_sources.length,
    stale_graph_sources: cover.stale_graph_sources,
    note: "Residuals stay visible. Unresolved imports are facts, not missing files. Overlay stays residual until a reviewed relationship is attached.",
  };
  const completeness = {
    schema_version: "1.1",
    integrity_pass: missing.length === 0,
    undefined_edge_endpoints: missing,
    unacknowledged_blocking_findings: [] as string[],
    node_count: nodes.length,
    edge_count: kept.length,
    residuals,
    note: "An acknowledgement is not a repair. Missing overlay is residual, not an Ajenda policy failure.",
  };
  const impact = {
    schema_version: "1.2",
    changed_files: [] as string[],
    changed_nodes: [] as Node[],
    unmapped_changed_files: [] as string[],
    upstream_consumers: [] as string[],
    downstream_dependencies: [] as string[],
    impacted_tests: [] as string[],
    affected_semantic_nodes: [] as string[],
    dependency_semantic_nodes: [] as string[],
    relevant_invariants: [] as string[],
    changed_node_count: 0,
    note: "no git range requested; blast-radius fields are present and empty",
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
  if (cover.unmapped_source_files.length) review.push("unmapped_source_files");
  if (cover.stale_graph_sources.length) review.push("stale_graph_sources");
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
    impact: {
      changed_files: [],
      upstream_consumers: [],
      downstream_dependencies: [],
      unmapped_changed_files: [],
    },
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
    engine: "universal-shell",
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
