import { collectArchitectureTopology } from "./architecture.ts";
import { auditGraph } from "./assurance.ts";
import { ASCII_GRAPH_FILE, encodeGraphAscii } from "./ascii-ir.ts";
import { CHANGE_SET_FILE, buildNoRangeChangeSet } from "./change-set.ts";
import { collectRelationshipBoundaries } from "./boundaries.ts";
import { collectConfigurationGraph } from "./configuration.ts";
import { collectContractGraph } from "./contracts.ts";
import { attachEvidenceAnchors } from "./evidence.ts";
import { collectFunctionGraph } from "./functions.ts";
import { collectPackageTopology, inventoryNodes } from "./inventory.ts";
import { collectLanguageGraph } from "./languages.ts";
import { buildUnresolvedLedger, compactGraph, UNRESOLVED_LEDGER_FILE } from "./residuals.ts";
import { AI_RECEIVER_GUIDE } from "./receiver-guide.ts";
import { collectRuntimeDeclarations } from "./runtime-declarations.ts";
import type { FileInput, GraphEdge, GraphNode, UnresolvedReference } from "./types.ts";
export type { FileInput } from "./types.ts";

/**
 * Browser port of 1devteam/graft_plus universal shell.
 * Observes and encodes source-backed facts plus instrument integrity.
 * Reasoning, blast radius, proof selection, risk, architecture, and merge judgment belong to the receiving AI.
 */

export const MERGE_AUTHORIZATION = "not-determined" as const;
export const IMPLEMENTS_PLAN = false;
export const GRANTS_EXECUTION_AUTHORITY = false;

export const GRAFT_SEMANTIC_AUTHORITY = "1devteam/graft_plus" as const;
export const GRAFT_EXECUTION_AUTHORITY = "1devteam/1devteam-web" as const;
export const GRAFT_SYNC_MODE = "github-reviewed-manual-port" as const;
export const GRAFT_EMBEDDED_ENGINE = "browser-universal-shell" as const;
export const GRAFT_EMBEDDED_SCHEMA_VERSION = "1.14" as const;
export const GRAFT_CANONICAL_REFERENCE_SHA = "5150d0b141830dd85a7daee60078976d3ee24556" as const;
export const GRAFT_CANONICAL_REFERENCE_SCHEMA_VERSION = "1.14" as const;
export const GRAFT_SYNC_STATUS = "synchronized" as const;

const SEMANTIC_PROVENANCE = {
  semantic_authority: GRAFT_SEMANTIC_AUTHORITY,
  canonical_engine: "python-universal-shell",
  canonical_schema_version: GRAFT_CANONICAL_REFERENCE_SCHEMA_VERSION,
  website_execution_authority: GRAFT_EXECUTION_AUTHORITY,
  website_synchronization_mode: GRAFT_SYNC_MODE,
  website_runtime_dependency: "none",
} as const;

const WEBSITE_SYNC_PROVENANCE = {
  canonical_reference_sha: GRAFT_CANONICAL_REFERENCE_SHA,
  canonical_reference_schema_version: GRAFT_CANONICAL_REFERENCE_SCHEMA_VERSION,
  embedded_engine: GRAFT_EMBEDDED_ENGINE,
  embedded_schema_version: GRAFT_EMBEDDED_SCHEMA_VERSION,
  synchronization_mode: GRAFT_SYNC_MODE,
  synchronization_status: GRAFT_SYNC_STATUS,
  parity_claimed: true,
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
  const tables = new Map<
    string,
    { sources: string[]; enabled: boolean; forced: boolean; policies: Set<string> }
  >();

  for (const file of files) {
    if (!file.path.endsWith(".py") || skip(file.path)) continue;
    const isMigration = /(?:^|\/)(?:alembic|migrations)\/versions\/.+\.py$/.test(file.path);
    if (!isMigration) continue;
    const id = `migration:${file.path.split("/").pop()?.replace(/\.py$/, "")}`;
    nodes.push({ id, type: "migration", source: file.path, layer: "generated" });

    const found = new Set<string>();
    let match: RegExpExecArray | null;
    const tableRe = /op\.(?:create_table|add_column|drop_table|alter_column)\(\s*["']([A-Za-z0-9_]+)/g;
    while ((match = tableRe.exec(file.content))) found.add(match[1]);

    const enableRe = /ALTER\s+TABLE\s+([A-Za-z0-9_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
    while ((match = enableRe.exec(file.content))) {
      found.add(match[1]);
      const row = tables.get(match[1]) ?? { sources: [], enabled: false, forced: false, policies: new Set<string>() };
      row.enabled = true;
      tables.set(match[1], row);
    }

    const forceRe = /ALTER\s+TABLE\s+([A-Za-z0-9_]+)\s+FORCE\s+ROW\s+LEVEL\s+SECURITY/gi;
    while ((match = forceRe.exec(file.content))) {
      found.add(match[1]);
      const row = tables.get(match[1]) ?? { sources: [], enabled: false, forced: false, policies: new Set<string>() };
      row.forced = true;
      tables.set(match[1], row);
    }

    const policyRe = /CREATE\s+POLICY\s+([A-Za-z0-9_]+)\s+ON\s+([A-Za-z0-9_]+)/gi;
    while ((match = policyRe.exec(file.content))) {
      const [, policy, table] = match;
      found.add(table);
      const row = tables.get(table) ?? { sources: [], enabled: false, forced: false, policies: new Set<string>() };
      row.policies.add(policy);
      tables.set(table, row);
    }

    for (const table of found) {
      const row = tables.get(table) ?? { sources: [], enabled: false, forced: false, policies: new Set<string>() };
      row.sources.push(file.path);
      tables.set(table, row);
      edges.push({ from: id, to: `db:table:${table}`, type: "creates_or_alters_table", evidence: file.path, layer: "generated" });
    }
  }

  for (const [table, row] of [...tables.entries()].sort()) {
    const source = row.sources.at(-1) ?? "";
    nodes.push({
      id: `db:table:${table}`,
      type: "database_table",
      source,
      layer: "generated",
      label: table,
      rls_enabled: row.enabled,
      rls_forced: row.forced,
      rls_policies: [...row.policies].sort(),
    });
    if (row.enabled || row.forced || row.policies.size) {
      const boundary = `security-boundary:rls:${table}`;
      nodes.push({
        id: boundary,
        type: "security_boundary",
        source,
        layer: "generated",
        boundary_kind: "row_level_security",
        table,
        enabled: row.enabled,
        forced: row.forced,
        policies: [...row.policies].sort(),
        detector: "migration_sql",
      });
      edges.push({
        from: `db:table:${table}`,
        to: boundary,
        type: "rls_enforced",
        evidence: source,
        detector: "migration_sql",
        layer: "generated",
      });
    }
  }

  type RouterInfo = {
    key: string;
    module: string;
    scope: string;
    name: string;
    prefix: string;
    kind: "application" | "router";
    source: string;
    line: number;
  };
  type Declaration = {
    id: string;
    method: string;
    path: string;
    source: string;
    module?: string;
    handler?: string;
    owner?: string;
    scope: string;
    line: number;
    endLine: number;
    detector: string;
  };

  const production = files.filter((file) => productionPy(file.path));
  const routers = new Map<string, RouterInfo>();
  const functionResults = new Map<string, string>();
  const imports = new Map<string, Map<string, { module: string; name: string }>>();
  const declarations: Declaration[] = [];
  const includes: Array<{ parent: string; child: string; prefix: string; source: string; line: number }> = [];

  const lineAt = (text: string, offset: number) => text.slice(0, offset).split("\n").length;
  const joinPath = (...parts: string[]) => {
    const clean = parts.filter(Boolean).map((part) => part.replace(/^\/+|\/+$/g, "")).filter(Boolean);
    return clean.length ? `/${clean.join("/")}` : "/";
  };

  const scopesByFile = new Map<string, Array<{ name: string; start: number; end: number }>>();
  for (const file of production) {
    const lines = file.content.split("\n");
    const scopes: Array<{ name: string; start: number; end: number }> = [];
    for (let index = 0; index < lines.length; index += 1) {
      const match = lines[index]?.match(/^(?:async\s+)?def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
      if (!match) continue;
      let endLine = lines.length;
      for (let probe = index + 1; probe < lines.length; probe += 1) {
        if (/^(?:async\s+)?def\s+|^class\s+/.test(lines[probe] ?? "")) {
          endLine = probe;
          break;
        }
      }
      scopes.push({ name: match[1], start: index + 1, end: endLine });
    }
    scopesByFile.set(file.path, scopes);

    const module = moduleFor(file.path);
    const imported = new Map<string, { module: string; name: string }>();
    const importRe = /^\s*from\s+([A-Za-z0-9_.]+)\s+import\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+as\s+([A-Za-z_][A-Za-z0-9_]*))?/gm;
    for (const match of file.content.matchAll(importRe)) {
      imported.set(match[3] ?? match[2], { module: match[1], name: match[2] });
    }
    imports.set(module, imported);

    const assignmentRe = /^([ \t]*)([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(APIRouter|FastAPI)\s*\(([^\n)]*)\)/gm;
    for (const match of file.content.matchAll(assignmentRe)) {
      const line = lineAt(file.content, match.index ?? 0);
      const scope = scopes.find((item) => line >= item.start && line <= item.end)?.name ?? "module";
      const prefix = match[4].match(/\bprefix\s*=\s*["']([^"']*)["']/)?.[1] ?? "";
      const key = `${module}:${scope}:${match[2]}`;
      routers.set(key, {
        key,
        module,
        scope,
        name: match[2],
        prefix,
        kind: match[3] === "FastAPI" ? "application" : "router",
        source: file.path,
        line,
      });
    }
  }

  for (const file of production) {
    const module = moduleFor(file.path);
    const scopes = scopesByFile.get(file.path) ?? [];
    for (const scope of scopes) {
      const text = file.content.split("\n").slice(scope.start - 1, scope.end).join("\n");
      const returned = [...text.matchAll(/^\s*return\s+([A-Za-z_][A-Za-z0-9_]*)\s*$/gm)].map((match) => match[1]);
      const keys = returned
        .map((name) => `${module}:${scope.name}:${name}`)
        .filter((key) => routers.has(key));
      if (new Set(keys).size === 1) functionResults.set(`${module}:${scope.name}`, keys[0]);
    }
  }

  const resolveRouter = (module: string, scope: string, raw: string): string | undefined => {
    const expression = raw.trim().replace(/,$/, "");
    const call = expression.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*\)$/)?.[1];
    const name = call ?? expression.match(/^([A-Za-z_][A-Za-z0-9_]*)$/)?.[1];
    if (name) {
      const local = `${module}:${scope}:${name}`;
      if (routers.has(local)) return local;
      const top = `${module}:module:${name}`;
      if (routers.has(top)) return top;
      const imported = imports.get(module)?.get(name);
      if (imported) {
        const importedRouter = `${imported.module}:module:${imported.name}`;
        if (routers.has(importedRouter)) return importedRouter;
        return functionResults.get(`${imported.module}:${imported.name}`);
      }
      return functionResults.get(`${module}:${name}`);
    }
  };

  for (const file of production) {
    const module = moduleFor(file.path);
    const scopes = scopesByFile.get(file.path) ?? [];
    const scopeFor = (line: number) => scopes.find((item) => line >= item.start && line <= item.end)?.name ?? "module";

    const routeRe = /@([A-Za-z_][A-Za-z0-9_]*)\.(get|post|put|patch|delete|head|options|websocket)\(\s*["']([^"']+)["'][^\n]*\)\s*\n\s*(?:async\s+)?def\s+([A-Za-z_][A-Za-z0-9_]*)/gi;
    for (const match of file.content.matchAll(routeRe)) {
      const line = lineAt(file.content, match.index ?? 0);
      const method = match[2].toUpperCase();
      const pathValue = match[3];
      const id = `route-declaration:${module}:${method}:${pathValue}@L${line}`;
      declarations.push({
        id,
        method,
        path: pathValue,
        source: file.path,
        module,
        handler: match[4],
        owner: match[1],
        scope: scopeFor(line),
        line,
        endLine: line + match[0].split("\n").length - 1,
        detector: "python_source",
      });
    }

    const flaskRe = /@([A-Za-z_][A-Za-z0-9_]*)\.route\(\s*["']([^"']+)["']([^\n]*)\)\s*\n\s*(?:async\s+)?def\s+([A-Za-z_][A-Za-z0-9_]*)/gi;
    for (const match of file.content.matchAll(flaskRe)) {
      const line = lineAt(file.content, match.index ?? 0);
      const methodsMatch = match[3].match(/methods\s*=\s*\[([^\]]+)\]/);
      const methods = methodsMatch
        ? methodsMatch[1].split(",").map((value) => value.replace(/["'\s]/g, "")).filter(Boolean)
        : ["GET"];
      for (const rawMethod of methods) {
        const method = rawMethod.toUpperCase();
        const id = `route-declaration:${module}:${method}:${match[2]}@L${line}`;
        declarations.push({
          id,
          method,
          path: match[2],
          source: file.path,
          module,
          handler: match[4],
          owner: match[1],
          scope: scopeFor(line),
          line,
          endLine: line + match[0].split("\n").length - 1,
          detector: "python_source",
        });
      }
    }

    const djangoRe = /\b(?:path|re_path|url)\(\s*["']([^"']+)/g;
    for (const match of file.content.matchAll(djangoRe)) {
      const line = lineAt(file.content, match.index ?? 0);
      declarations.push({
        id: `route-declaration:${module}:ANY:${match[1]}@L${line}`,
        method: "ANY",
        path: match[1],
        source: file.path,
        module,
        scope: scopeFor(line),
        line,
        endLine: line,
        detector: "python_source",
      });
    }

    const includeRe = /([A-Za-z_][A-Za-z0-9_]*)\.include_router\(\s*([A-Za-z_][A-Za-z0-9_]*(?:\(\))?)([^\n]*)/g;
    for (const match of file.content.matchAll(includeRe)) {
      const line = lineAt(file.content, match.index ?? 0);
      const scope = scopeFor(line);
      const parent = resolveRouter(module, scope, match[1]);
      const child = resolveRouter(module, scope, match[2]);
      if (!parent || !child) continue;
      includes.push({
        parent,
        child,
        prefix: match[3].match(/\bprefix\s*=\s*["']([^"']*)["']/)?.[1] ?? "",
        source: file.path,
        line,
      });
    }
  }

  const jsRoute = /\b(?:app|router|api)\.(get|post|put|patch|delete|all)\(\s*['"]([^'"]+)/gi;
  for (const file of files.filter((item) => /\.(js|mjs|ts|tsx)$/.test(item.path) && !skip(item.path))) {
    for (const match of file.content.matchAll(jsRoute)) {
      const line = lineAt(file.content, match.index ?? 0);
      const method = match[1].toUpperCase();
      declarations.push({
        id: `route-declaration:js:${file.path}:${method}:${match[2]}@L${line}`,
        method,
        path: match[2],
        source: file.path,
        scope: "module",
        line,
        endLine: line,
        detector: "javascript_route_pattern",
      });
    }
  }

  const declarationRouter = new Map<string, string>();
  for (const declaration of declarations) {
    nodes.push({
      id: declaration.id,
      type: "http_route",
      route_identity: "declaration",
      source: declaration.source,
      layer: "generated",
      method: declaration.method,
      route: declaration.path,
      path: declaration.path,
      handler: declaration.handler,
      router_owner: declaration.owner,
      start_line: declaration.line,
      end_line: declaration.endLine,
      detector: declaration.detector,
    });
    if (declaration.module) {
      edges.push({
        from: `py:${declaration.module}`,
        to: declaration.id,
        type: "declares_route",
        evidence: declaration.source,
        start_line: declaration.line,
        end_line: declaration.endLine,
        symbol: declaration.handler,
        detector: declaration.detector,
        layer: "generated",
      });
    }
    if (declaration.module && declaration.owner) {
      const resolved = resolveRouter(declaration.module, declaration.scope, declaration.owner);
      if (resolved) declarationRouter.set(declaration.id, resolved);
    }
  }

  const children = new Set(includes.map((item) => item.child));
  const includesByParent = new Map<string, typeof includes>();
  for (const include of includes) {
    const list = includesByParent.get(include.parent) ?? [];
    list.push(include);
    includesByParent.set(include.parent, list);
  }
  const routesByRouter = new Map<string, Declaration[]>();
  for (const declaration of declarations) {
    const router = declarationRouter.get(declaration.id);
    if (!router) continue;
    const list = routesByRouter.get(router) ?? [];
    list.push(declaration);
    routesByRouter.set(router, list);
  }

  const runtimeNodes = new Map<string, Node>();
  const walk = (routerKey: string, prefix: string, trail: Set<string>) => {
    if (trail.has(routerKey)) return;
    const router = routers.get(routerKey);
    if (!router) return;
    const current = joinPath(prefix, router.prefix);
    const nextTrail = new Set(trail);
    nextTrail.add(routerKey);

    for (const declaration of routesByRouter.get(routerKey) ?? []) {
      const fullPath = joinPath(current, declaration.path);
      const runtimeId = `runtime-route:${declaration.method}:${fullPath}`;
      const existing = runtimeNodes.get(runtimeId);
      if (existing) {
        const sources = new Set<string>(Array.isArray(existing.sources) ? existing.sources as string[] : []);
        sources.add(declaration.source);
        existing.sources = [...sources].sort();
      } else {
        runtimeNodes.set(runtimeId, {
          id: runtimeId,
          type: "runtime_route",
          source: declaration.source,
          sources: [declaration.source],
          layer: "generated",
          route_identity: "runtime-composed",
          method: declaration.method,
          path: fullPath,
          route: fullPath,
          composition_proven: true,
          detector: "python_source_route_composition",
        });
      }
      edges.push({
        from: declaration.id,
        to: runtimeId,
        type: "composes_to",
        evidence: declaration.source,
        start_line: declaration.line,
        end_line: declaration.endLine,
        symbol: declaration.handler,
        detector: "python_source_route_composition",
        layer: "generated",
      });
    }

    for (const include of includesByParent.get(routerKey) ?? []) {
      walk(include.child, joinPath(current, include.prefix), nextTrail);
    }
  };

  for (const [key, router] of routers) {
    if (router.kind === "application" && !children.has(key)) walk(key, "", new Set());
  }
  nodes.push(...runtimeNodes.values());

  for (const file of production) {
    const module = moduleFor(file.path);
    let match: RegExpExecArray | null;
    const tableRe = /__tablename__\s*=\s*["']([A-Za-z0-9_]+)/g;
    while ((match = tableRe.exec(file.content))) {
      const id = `db:table:${match[1]}`;
      nodes.push({ id, type: "database_table", source: file.path, layer: "generated", label: match[1] });
      edges.push({ from: `py:${module}`, to: id, type: "defines_table", evidence: file.path, layer: "generated" });
    }
    if (NETWORK_LIBS.test(file.content) && /\.(get|post|put|patch|delete|request)\s*\(/.test(file.content)) {
      const sink = `egress:${module}`;
      nodes.push({ id: sink, type: "network_egress_sink", source: file.path, layer: "generated", classification: "unclassified" });
      edges.push({ from: `py:${module}`, to: sink, type: "direct_network_egress", evidence: file.path, layer: "generated" });
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

  const tsRe = /export\s+(?:interface|type)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  for (const file of files.filter((item) => /\.(ts|tsx)$/.test(item.path) && !skip(item.path))) {
    for (const match of file.content.matchAll(tsRe)) {
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

function aggregateOccurrenceEdges(edges: Edge[]): Edge[] {
  const aggregateTypes = new Set(["calls_function", "tests_function", "injects_dependency"]);
  const grouped = new Map<string, Edge[]>();
  const passthrough: Edge[] = [];
  for (const edge of edges) {
    if (!aggregateTypes.has(edge.type)) {
      passthrough.push(edge);
      continue;
    }
    const key = `${edge.from}|${edge.to}|${edge.type}|${edge.layer}`;
    const rows = grouped.get(key) ?? [];
    rows.push(edge);
    grouped.set(key, rows);
  }

  const aggregated: Edge[] = [];
  for (const rows of grouped.values()) {
    const first = { ...rows[0] };
    const observations = [...new Map(rows.map((row) => {
      const observation = {
        evidence: row.evidence,
        start_line: row.start_line,
        end_line: row.end_line,
        symbol: row.symbol,
        detector: row.detector,
      };
      return [JSON.stringify(observation), observation];
    })).values()].sort((a, b) =>
      String(a.evidence ?? "").localeCompare(String(b.evidence ?? "")) ||
      Number(a.start_line ?? 0) - Number(b.start_line ?? 0) ||
      String(a.symbol ?? "").localeCompare(String(b.symbol ?? "")),
    );
    first.occurrences = observations.length || rows.length;
    if (observations.length > 1) first.observations = observations;
    aggregated.push(first);
  }
  return [...passthrough, ...aggregated];
}

function repositoryOverlay(files: FileInput[]) {
  const conventional = [
    "docs/contracts/dependency-graph.overlay.v1.json",
    ".graft/dependency-graph.overlay.v1.json",
    ".graft/overlay.json",
  ];
  const file = conventional.map((path) => files.find((item) => item.path === path)).find(Boolean);
  if (!file) {
    return {
      file: undefined,
      nodes: [] as Node[],
      edges: [] as Edge[],
      invariants: [] as unknown[],
      functionRoots: [] as string[],
    };
  }
  try {
    const payload = JSON.parse(file.content) as {
      nodes?: Array<Record<string, unknown>>;
      edges?: Array<Record<string, unknown>>;
      invariants?: unknown[];
      function_roots?: Array<string | { path?: string; source?: string }>;
    };
    const functionRoots = [...new Set(
      (payload.function_roots ?? [])
        .map((item) =>
          typeof item === "string"
            ? item
            : item && typeof item === "object"
              ? item.path ?? item.source
              : undefined,
        )
        .filter((value): value is string => typeof value === "string" && Boolean(value.replace(/^\/+|\/+$/g, "")))
        .map((value) => value.replace(/^\/+|\/+$/g, "")),
    )].sort();
    return {
      file,
      nodes: (payload.nodes ?? []).map((node) => ({ ...node, layer: "overlay" })) as Node[],
      edges: (payload.edges ?? []).map((edge) => ({ ...edge, layer: "overlay" })) as Edge[],
      invariants: payload.invariants ?? [],
      functionRoots,
    };
  } catch {
    return {
      file,
      nodes: [] as Node[],
      edges: [] as Edge[],
      invariants: [] as unknown[],
      functionRoots: [] as string[],
    };
  }
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
  const overlay = repositoryOverlay(files);
  let nodes: Node[] = [
    ...py.nodes,
    ...fe.nodes,
    ...tests.nodes,
    ...languages.nodes,
    ...surfaceNodes,
    ...generated.nodes,
    ...overlay.nodes,
  ];
  let edges: Edge[] = [
    ...py.edges,
    ...fe.edges,
    ...tests.edges,
    ...languages.edges,
    ...generated.edges,
    ...overlay.edges,
  ];

  const sourceNodeIds = new Map<string, string>();
  for (const node of nodes) {
    if (!sourceNodeIds.has(node.source)) sourceNodeIds.set(node.source, node.id);
  }
  const pythonBySource = new Map(py.nodes.map((node) => [node.source, node.id]));

  const functions = collectFunctionGraph(files, pythonBySource, overlay.functionRoots);
  nodes.push(...functions.nodes);
  edges.push(...functions.edges);

  const runtimeDeclarations = collectRuntimeDeclarations(files, functions.nodes);
  nodes.push(...runtimeDeclarations.nodes);
  edges.push(...runtimeDeclarations.edges);

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
  const kept = aggregateOccurrenceEdges([...edgeByKey.values()]);
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

  const semanticProvenance = {
    ...SEMANTIC_PROVENANCE,
    overlay_mode: overlay.file ? "auto-discovered" : "none",
  };

  const graph = {
    schema_version: "1.14",
    product: "G.R.A.F.T.+",
    package: "graft_plus",
    role: "fact-substrate",
    implementsPlan: IMPLEMENTS_PLAN,
    grants_execution_authority: GRANTS_EXECUTION_AUTHORITY,
    semantic_provenance: semanticProvenance,
    generated_from: {
      python_roots: files.some((file) => file.path.endsWith(".py")) ? ["."] : [],
      adapters: [
        "python",
        "javascript-typescript",
        "shell-bats",
        "go",
        "rust",
        "ruby",
        "php",
        "c-cpp",
        "java-kotlin-scala",
        "csharp",
        "lua",
        "elixir",
        "swift",
        "package-manifests",
        "relationship-boundary-ledger",
        "contract-declarations",
        "configuration-deployment",
        "subsystem-hierarchy",
        "build-system-topology",
        "source-provenance",
        "cross-language-subsystem-joins",
        "governance-boundaries",
        "evidence-anchors",
        "route-declaration-composition",
        "dependency-provider-topology",
        "runtime-declaration-contracts",
      ],
      function_roots: overlay.functionRoots,
      overlay: overlay.file?.path ?? null,
    },
    nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)),
    edges: kept.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.type.localeCompare(b.type)),
    invariants: overlay.invariants,
    facts: {
      unresolved_imports: unresolved,
      unresolved_package_roots: roots,
      declared_external_imports: declaredExternalImports,
      ...inventory.facts,
      ...boundaryFacts,
      ...contracts.facts,
      ...configuration.facts,
      ...architecture.facts,
      ...runtimeDeclarations.facts,
      evidence_precision_counts: evidencePrecisionCounts,
    },
  };

  const completeness = auditGraph(
    {
      nodes: graph.nodes,
      edges: graph.edges,
      facts: graph.facts,
    },
    new Set(files.map((file) => file.path)),
  );
  const unresolvedLedger = buildUnresolvedLedger(unresolved);
  const artifactGraph = compactGraph(graph, unresolvedLedger);
  const asciiGraph = encodeGraphAscii(artifactGraph);
  const changeSet = buildNoRangeChangeSet();
  const sha = input.origin?.sha ?? "unpinned";

  const receipt = {
    product: "G.R.A.F.T.+",
    package: "graft_plus",
    engine: GRAFT_EMBEDDED_ENGINE,
    role: "fact-substrate",
    semantic_provenance: semanticProvenance,
    website_sync: WEBSITE_SYNC_PROVENANCE,
    subject: input.origin?.url ?? `${input.origin?.owner ?? "local"}/${input.origin?.repo ?? "subject"}`,
    subject_sha: sha,
    status: completeness.integrity_pass ? "passed" : "failed",
    status_scope: "instrument-integrity-only",
    machine_graph: ASCII_GRAPH_FILE,
    change_set: CHANGE_SET_FILE,
    graph_json_compatibility: "dependency-graph.v1.json",
    residual_ledger: UNRESOLVED_LEDGER_FILE,
    files: [
      "00-AI-READ-FIRST.md",
      ASCII_GRAPH_FILE,
      "dependency-graph.v1.json",
      CHANGE_SET_FILE,
      UNRESOLVED_LEDGER_FILE,
      "graph-completeness-report.json",
      "graft-plus-receipt.json",
    ],
    grants_execution_authority: GRANTS_EXECUTION_AUTHORITY,
    implementsPlan: IMPLEMENTS_PLAN,
    merge_authorization: MERGE_AUTHORIZATION,
    does_not_compute: [
      "blast_radius",
      "proof_selection",
      "risk_classification",
      "architecture_disposition",
      "change_recommendation",
    ],
  };

  return {
    "00-AI-READ-FIRST.md": AI_RECEIVER_GUIDE,
    [ASCII_GRAPH_FILE]: asciiGraph,
    "dependency-graph.v1.json": artifactGraph,
    [CHANGE_SET_FILE]: changeSet,
    [UNRESOLVED_LEDGER_FILE]: unresolvedLedger,
    "graph-completeness-report.json": completeness,
    "graft-plus-receipt.json": receipt,
  };
}
