import { collectArchitectureTopology } from "./architecture.ts";
import { auditGraph, decideGraph } from "./assurance.ts";
import { collectRelationshipBoundaries } from "./boundaries.ts";
import { collectConfigurationGraph } from "./configuration.ts";
import { collectContractGraph } from "./contracts.ts";
import { attachEvidenceAnchors } from "./evidence.ts";
import { collectFunctionGraph } from "./functions.ts";
import { collectPackageTopology, inventoryNodes } from "./inventory.ts";
import { collectLanguageGraph } from "./languages.ts";
import { buildMachineIndex } from "./machine-index.ts";
import { buildUnresolvedLedger, compactGraph } from "./residuals.ts";
import type { FileInput, GraphEdge, GraphNode, UnresolvedReference } from "./types.ts";
export type { FileInput } from "./types.ts";

/**
 * Browser port of 1devteam/graft_plus universal shell.
 * Generated structure + completeness + impact + proof + decision.
 * No source dump. No Ajenda domain rules. Never merge authority.
 */

export const MERGE_AUTHORIZATION = "not-determined" as const;
export const IMPLEMENTS_PLAN = false;
export const GRANTS_EXECUTION_AUTHORITY = false;

export const GRAFT_SEMANTIC_AUTHORITY = "1devteam/graft_plus" as const;
export const GRAFT_EXECUTION_AUTHORITY = "1devteam/1devteam-web" as const;
export const GRAFT_SYNC_MODE = "github-reviewed-manual-port" as const;
export const GRAFT_EMBEDDED_ENGINE = "browser-universal-shell" as const;
export const GRAFT_EMBEDDED_SCHEMA_VERSION = "1.8" as const;
export const GRAFT_CANONICAL_REFERENCE_SHA = "6fc2ece7f83ddea0796b0ae7621fd8398157fbe2" as const;
export const GRAFT_CANONICAL_REFERENCE_SCHEMA_VERSION = "1.8" as const;
export const GRAFT_SYNC_STATUS = "synchronized" as const;

const SEMANTIC_PROVENANCE = {
  semantic_authority: GRAFT_SEMANTIC_AUTHORITY,
  execution_authority: GRAFT_EXECUTION_AUTHORITY,
  synchronization_mode: GRAFT_SYNC_MODE,
  synchronization_status: GRAFT_SYNC_STATUS,
  embedded_engine: GRAFT_EMBEDDED_ENGINE,
  embedded_schema_version: GRAFT_EMBEDDED_SCHEMA_VERSION,
  canonical_reference: {
    repo: GRAFT_SEMANTIC_AUTHORITY,
    sha: GRAFT_CANONICAL_REFERENCE_SHA,
    schema_version: GRAFT_CANONICAL_REFERENCE_SCHEMA_VERSION,
    parity_claimed: true,
  },
  runtime_dependency: "none",
} as const;

type Node = GraphNode;
type Edge = GraphEdge;
type Unresolved = UnresolvedReference;

const PY_IMPORT = /^\s*(?:from|import)\s+([A-Za-z0-9_\.]+)/gm;
const SKIP = /(^|\/)(node_modules|dist|build|\.venv|venv|__pycache__|\.git)(\/|$)/;
const RUNTIME = new Set(
  `abc argparse array ast asyncio atexit base64 bdb binascii bisect builtins bz2 calendar cmath cmd code codecs collections colorsys compileall concurrent configparser contextlib contextvars copy copyreg csv ctypes dataclasses datetime decimal difflib dis doctest email enum errno faulthandler fcntl filecmp fileinput fnmatch fractions ftplib functools gc getopt getpass gettext glob gzip hashlib heapq hmac html http imaplib importlib inspect io ipaddress itertools json keyword linecache locale logging lzma mailbox marshal math mimetypes mmap multiprocessing netrc numbers operator optparse os pathlib pdb pickle pkgutil platform pprint pstats pty pwd queue random re readline reprlib resource rlcompleter runpy sched secrets select selectors shelve shlex shutil signal site smtplib socket socketserver sqlite3 ssl stat statistics string struct subprocess sys sysconfig syslog tarfile tempfile textwrap threading time timeit token tokenize traceback types typing unicodedata unittest urllib uuid venv warnings wave weakref webbrowser xml xmlrpc zipfile zipimport zlib zoneinfo __future__`
    .split(/\s+/),
);
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
  const js = files.filter((f) => /\.(cjs|cts|js|jsx|mjs|mts|ts|tsx)$/.test(f.path) && !skip(f.path) && !f.path.endsWith(".d.ts"));
  const set = new Set(js.map((f) => f.path));
  const isTest = (path: string) => /(?:^|\/)(?:tests?|specs?|__tests__)(?:\/|$)|(?:\.test|\.spec)\.[^.]+$/i.test(path);
  const id = (path: string) => (isTest(path) ? `test:${path}` : `js:${path}`);
  const nodes: Node[] = js.map((f) => ({
    id: id(f.path),
    type: isTest(f.path) ? "test_module" : "javascript_module",
    source: f.path,
    layer: "generated",
  }));
  const edges: Edge[] = [];
  const unresolved: Unresolved[] = [];
  const importRe = /(?:import|export)\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]|\brequire\(\s*['"]([^'"]+)['"]\s*\)|\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const file of js) {
    let match: RegExpExecArray | null;
    importRe.lastIndex = 0;
    while ((match = importRe.exec(file.content))) {
      const spec = match[1] ?? match[2] ?? match[3];
      if (!spec) continue;
      if (spec.startsWith(".")) {
        const parent = file.path.split("/").slice(0, -1).join("/");
        const parts = [...parent.split("/").filter(Boolean), ...spec.split("/")];
        const normalized: string[] = [];
        for (const part of parts) {
          if (!part || part === ".") continue;
          if (part === "..") normalized.pop();
          else normalized.push(part);
        }
        const raw = normalized.join("/");
        const cands = [raw, ...[".cjs",".cts",".js",".jsx",".mjs",".mts",".ts",".tsx"].map((s) => raw + s), ...[".cjs",".cts",".js",".jsx",".mjs",".mts",".ts",".tsx"].map((s) => `${raw}/index${s}`)];
        const hit = cands.find((candidate) => set.has(candidate));
        if (hit && hit !== file.path) {
          edges.push({ from: id(file.path), to: id(hit), type: isTest(file.path) && !isTest(hit) ? "tests" : "imports", evidence: file.path, layer: "generated" });
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

function annotatePythonRoutes(files: FileInput[], nodes: Node[]) {
  const routeNodes = new Map(nodes.filter((node) => node.type === "http_route").map((node) => [node.id, node]));
  for (const file of files.filter((item) => item.path.endsWith(".py"))) {
    const pattern = /@(?:[A-Za-z0-9_]+\.)(get|post|put|patch|delete|head|options|websocket)\(\s*["']([^"']+)["'][^\n]*\)\s*\n\s*(?:async\s+)?def\s+([A-Za-z_][A-Za-z0-9_]*)/gi;
    for (const match of file.content.matchAll(pattern)) {
      const method = match[1].toUpperCase();
      const pathValue = match[2];
      const handler = match[3];
      const route = routeNodes.get(`route:${method} ${pathValue}`);
      if (!route) continue;
      const start = file.content.slice(0, match.index ?? 0).split("\n").length;
      const defOffset = (match.index ?? 0) + match[0].lastIndexOf("def ");
      const rest = file.content.slice(defOffset);
      const nextDef = rest.slice(1).search(/\n(?:async\s+)?def\s+|\nclass\s+/);
      const endOffset = nextDef >= 0 ? defOffset + nextDef + 1 : file.content.length;
      route.start_line = start;
      route.end_line = file.content.slice(0, endOffset).split("\n").length;
      route.handler = handler;
      route.detector = "python_source";
      route.path = pathValue;
    }
  }
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
  const languages = collectLanguageGraph(files);
  const surfaceNodes = surfaces(files);
  const generated = semantic(files);
  annotatePythonRoutes(files, generated.nodes);
  let nodes: Node[] = [...py.nodes, ...fe.nodes, ...tests.nodes, ...languages.nodes, ...surfaceNodes, ...generated.nodes];
  let edges: Edge[] = [...py.edges, ...fe.edges, ...tests.edges, ...languages.edges, ...generated.edges];

  const sourceNodeIds = new Map<string, string>();
  for (const node of nodes) {
    if (!sourceNodeIds.has(node.source)) sourceNodeIds.set(node.source, node.id);
  }
  const pythonBySource = new Map(py.nodes.map((node) => [node.source, node.id]));

  const functions = collectFunctionGraph(files, pythonBySource);
  nodes.push(...functions.nodes);
  edges.push(...functions.edges);
  const functionIds = new Set(functions.nodes.map((node) => node.id));
  for (const route of generated.nodes.filter((node) => node.type === "http_route" && typeof node.handler === "string")) {
    const module = moduleFor(route.source);
    const target = `fn:${module}:${route.handler}`;
    if (functionIds.has(target)) {
      edges.push({
        from: route.id,
        to: target,
        type: "handled_by",
        evidence: route.source,
        start_line: route.start_line,
        end_line: route.end_line,
        symbol: route.handler,
        detector: route.detector ?? "python_source",
        layer: "generated",
      });
    }
  }

  const packages = collectPackageTopology(files, sourceNodeIds);
  nodes.push(...packages.nodes);
  edges.push(...packages.edges);

  const contracts = collectContractGraph(files, sourceNodeIds);
  nodes.push(...contracts.nodes);
  edges.push(...contracts.edges);

  const configuration = collectConfigurationGraph(files, sourceNodeIds);
  nodes.push(...configuration.nodes);
  edges.push(...configuration.edges);

  const architecture = collectArchitectureTopology(files, nodes);
  for (const node of nodes) {
    const annotation = architecture.annotations.get(node.id);
    if (annotation) Object.assign(node, annotation);
  }
  nodes.push(...architecture.nodes);
  edges.push(...architecture.edges);

  const mappedSources = new Set(nodes.map((node) => node.source).filter(Boolean));
  const inventory = inventoryNodes(files, mappedSources);
  nodes.push(...inventory.nodes);

  const boundaryFacts = collectRelationshipBoundaries(files);

  const unresolvedMap = new Map<string, Unresolved>();
  for (const row of [...py.unresolved, ...fe.unresolved, ...tests.unresolved, ...languages.unresolved]) {
    unresolvedMap.set(`${row.specifier}|${row.from}`, row);
  }

  const dependencyIds = new Map(
    packages.nodes
      .filter((node) => node.type === "external_dependency" && typeof node.name === "string")
      .map((node) => [String(node.name), node.id]),
  );
  const declaredExternalImports: Array<Unresolved & { package: string }> = [];
  const unresolved: Unresolved[] = [];
  for (const row of [...unresolvedMap.values()].sort(
    (a, b) => a.specifier.localeCompare(b.specifier) || a.from.localeCompare(b.from),
  )) {
    const packageName = packageRoot(row.specifier);
    const target = dependencyIds.get(packageName);
    const source = sourceNodeIds.get(row.from);
    if (target && source) {
      edges.push({
        from: source,
        to: target,
        type: "imports_package",
        evidence: row.from,
        layer: "generated",
      });
      declaredExternalImports.push({ ...row, package: packageName });
    } else {
      unresolved.push(row);
    }
  }

  const nodeById = new Map<string, Node>();
  for (const node of nodes) {
    const existing = nodeById.get(node.id);
    nodeById.set(node.id, existing ? { ...existing, ...node } : node);
  }
  nodes = [...nodeById.values()];

  const roots = [...new Set(unresolved.map((r) => packageRoot(r.specifier)))].sort();
  const known = new Set(nodes.map((n) => n.id));
  const edgeByKey = new Map<string, Edge>();
  for (const edge of edges) {
    if (!known.has(edge.from) || !known.has(edge.to)) continue;
    const key = JSON.stringify(edge, Object.keys(edge).sort());
    edgeByKey.set(key, edge);
  }
  const kept = [...edgeByKey.values()];
  attachEvidenceAnchors(files, nodes, kept);

  const evidencePrecisionCounts = {
    nodes: nodes.reduce<Record<string, number>>((acc, node) => {
      const precision = String((node.evidence_anchor as { precision?: string } | undefined)?.precision ?? "none");
      acc[precision] = (acc[precision] ?? 0) + 1;
      return acc;
    }, {}),
    edges: kept.reduce<Record<string, number>>((acc, edge) => {
      const precision = String((edge.evidence_anchor as { precision?: string } | undefined)?.precision ?? "none");
      acc[precision] = (acc[precision] ?? 0) + 1;
      return acc;
    }, {}),
  };

  const graph = {
    schema_version: "1.8",
    product: "G.R.A.F.T.+",
    package: "graft_plus",
    role: "fact-substrate",
    implementsPlan: IMPLEMENTS_PLAN,
    grants_execution_authority: GRANTS_EXECUTION_AUTHORITY,
    semantic_provenance: SEMANTIC_PROVENANCE,
    nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)),
    edges: kept.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to)),
    facts: {
      unresolved_imports: unresolved,
      unresolved_package_roots: roots,
      declared_external_imports: declaredExternalImports,
      ...inventory.facts,
      ...boundaryFacts,
      ...contracts.facts,
      ...configuration.facts,
      ...architecture.facts,
      evidence_precision_counts: evidencePrecisionCounts,
    },
    metrics: {
      node_count: nodes.length,
      edge_count: kept.length,
      overlay_node_count: 0,
      unresolved_import_count: unresolved.length,
      surface_count: surfaceNodes.length,
      inventory_file_count: inventory.facts.file_count,
      relationship_parsed_file_count: inventory.facts.relationship_parsed_file_count,
      relationship_unparsed_file_count: inventory.facts.relationship_unparsed_file_count,
      relationship_boundary_count: boundaryFacts.relationship_boundary_count,
      unresolved_relationship_boundary_count: boundaryFacts.unresolved_relationship_boundary_count,
      relationship_boundary_counts_by_kind: boundaryFacts.relationship_boundary_counts_by_kind,
      contract_source_count: contracts.facts.contract_source_count,
      contract_declaration_count: contracts.facts.contract_declaration_count,
      contract_declaration_counts_by_kind: contracts.facts.contract_declaration_counts_by_kind,
      configuration_key_count: configuration.facts.configuration_key_count,
      deployment_fact_count: configuration.facts.deployment_fact_count,
      deployment_fact_counts_by_kind: configuration.facts.deployment_fact_counts_by_kind,
      subsystem_count: architecture.facts.subsystem_count,
      cross_language_subsystem_count: architecture.facts.cross_language_subsystem_count,
      build_definition_count: architecture.facts.build_definition_count,
      build_input_edge_count: architecture.facts.build_input_edge_count,
      build_target_count: architecture.facts.build_target_count,
      build_target_input_edge_count: architecture.facts.build_target_input_edge_count,
      build_target_dependency_edge_count: architecture.facts.build_target_dependency_edge_count,
      governance_boundary_count: architecture.facts.governance_boundary_count,
      source_provenance_counts: architecture.facts.source_provenance_counts,
      evidence_precision_counts: evidencePrecisionCounts,
      edge_counts_by_type: kept.reduce<Record<string, number>>((acc, e) => {
        acc[e.type] = (acc[e.type] ?? 0) + 1;
        return acc;
      }, {}),
    },
  };
  const completeness = auditGraph(
    {
      nodes: graph.nodes,
      edges: graph.edges,
      facts: graph.facts,
      metrics: graph.metrics,
    },
    new Set(files.map((file) => file.path)),
  );
  const unresolvedLedger = buildUnresolvedLedger(unresolved);
  const machineIndex = buildMachineIndex(graph, unresolvedLedger);
  const artifactGraph = compactGraph(graph, unresolvedLedger);
  const decision = decideGraph(graph as unknown as Record<string, unknown>, completeness);
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
    changed_file_count: 0,
    unmapped_changed_file_count: 0,
    impacted_test_count: 0,
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
  const sha = input.origin?.sha ?? "unpinned";
  const receipt = {
    product: "G.R.A.F.T.+",
    package: "graft_plus",
    engine: GRAFT_EMBEDDED_ENGINE,
    semantic_provenance: SEMANTIC_PROVENANCE,
    subject: input.origin?.url ?? `${input.origin?.owner ?? "local"}/${input.origin?.repo ?? "subject"}`,
    subject_sha: sha,
    status: completeness.integrity_pass ? "passed" : "failed",
    decipher: "graph-architecture-decision.json",
    machine_index: "graph-machine-index.v1.json",
    residual_ledger: "graph-unresolved-ledger.v1.json",
    grants_execution_authority: GRANTS_EXECUTION_AUTHORITY,
    implementsPlan: IMPLEMENTS_PLAN,
    merge_authorization: MERGE_AUTHORIZATION,
    fingerprint: sha256sync(JSON.stringify({ nodes: graph.nodes.map((n) => n.id), sha })),
  };
  return {
    "graph-architecture-decision.json": decision,
    "graph-machine-index.v1.json": machineIndex,
    "dependency-graph.v1.json": artifactGraph,
    "graph-unresolved-ledger.v1.json": unresolvedLedger,
    "graph-completeness-report.json": completeness,
    "graph-impact-report.json": impact,
    "graph-proof-manifest.json": proofs,
    "graft-plus-receipt.json": receipt,
  };
}
