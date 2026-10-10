import type { FileInput, GraphEdge, GraphNode } from "./types.ts";

type RouterKey = string;
type RouterObject = {
  key: RouterKey;
  module: string;
  source: string;
  name: string;
  prefix: string;
  kind: "application" | "router";
};

type RouteDeclaration = {
  id: string;
  source: string;
  module: string;
  method: string;
  path: string;
  handler?: string;
  owner?: string;
  startLine: number;
  endLine: number;
  detector: string;
};

type Include = {
  parent: RouterKey;
  child: RouterKey;
  prefix: string;
  source: string;
};

function moduleFor(path: string) {
  const parts = path.replace(/\.py$/, "").split("/").filter(Boolean);
  if (parts[0] === "src") parts.shift();
  if (parts.at(-1) === "__init__") parts.pop();
  return parts.join(".");
}

function productionPython(path: string) {
  return path.endsWith(".py") && !/(?:^|\/)(?:tests?|fixtures|migrations|alembic)(?:\/|$)/.test(path);
}

function lineAt(content: string, offset: number) {
  return content.slice(0, offset).split("\n").length;
}

function joinPath(...parts: string[]) {
  const cleaned = parts
    .filter((part) => part && part !== "/")
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
  return cleaned.length ? "/" + cleaned.join("/") : "/";
}

function literalKeyword(args: string, key: string) {
  return args.match(new RegExp("\\b" + key + "\\s*=\\s*[\"']([^\"']*)[\"']"))?.[1] ?? "";
}

function routerKey(module: string, name: string): RouterKey {
  return module + ":module:" + name;
}

function parseImports(content: string) {
  const names = new Map<string, { module: string; name: string }>();
  const modules = new Map<string, string>();

  for (const match of content.matchAll(/^\s*from\s+([A-Za-z0-9_.]+)\s+import\s+([^\n]+)/gm)) {
    const importedModule = match[1];
    for (const raw of match[2].replace(/[()]/g, "").split(",")) {
      const item = raw.trim();
      const alias = item.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:\s+as\s+([A-Za-z_][A-Za-z0-9_]*))?$/);
      if (alias) names.set(alias[2] ?? alias[1], { module: importedModule, name: alias[1] });
    }
  }
  for (const match of content.matchAll(/^\s*import\s+([^\n]+)/gm)) {
    for (const raw of match[1].split(",")) {
      const item = raw.trim();
      const alias = item.match(/^([A-Za-z_][A-Za-z0-9_.]*)(?:\s+as\s+([A-Za-z_][A-Za-z0-9_]*))?$/);
      if (alias) modules.set(alias[2] ?? alias[1].split(".")[0], alias[1]);
    }
  }
  return { names, modules };
}

function resolveRouter(
  module: string,
  expression: string,
  routers: Map<RouterKey, RouterObject>,
  imports: Map<string, ReturnType<typeof parseImports>>,
): RouterKey | undefined {
  const value = expression.trim();
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    const local = routerKey(module, value);
    if (routers.has(local)) return local;
    const imported = imports.get(module)?.names.get(value);
    if (imported) {
      const target = routerKey(imported.module, imported.name);
      if (routers.has(target)) return target;
    }
  }
  const attribute = value.match(/^([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)$/);
  if (attribute) {
    const targetModule = imports.get(module)?.modules.get(attribute[1]);
    if (targetModule) {
      const target = routerKey(targetModule, attribute[2]);
      if (routers.has(target)) return target;
    }
  }
}

export function collectRouteGraph(files: FileInput[]) {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const routers = new Map<RouterKey, RouterObject>();
  const imports = new Map<string, ReturnType<typeof parseImports>>();
  const declarations: RouteDeclaration[] = [];
  const includes: Include[] = [];

  const pythonFiles = files.filter((file) => productionPython(file.path));

  for (const file of pythonFiles) {
    const module = moduleFor(file.path);
    imports.set(module, parseImports(file.content));

    const routerPattern = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?::[^=\n]+)?=\s*(?:[A-Za-z_][A-Za-z0-9_]*\.)?(APIRouter|FastAPI)\s*\(([^\n)]*)\)/gm;
    for (const match of file.content.matchAll(routerPattern)) {
      const name = match[1];
      const constructor = match[2];
      const args = match[3] ?? "";
      const key = routerKey(module, name);
      routers.set(key, {
        key,
        module,
        source: file.path,
        name,
        prefix: literalKeyword(args, "prefix"),
        kind: constructor === "FastAPI" ? "application" : "router",
      });
    }
  }

  for (const file of pythonFiles) {
    const module = moduleFor(file.path);

    const decoratorPattern = /@([A-Za-z_][A-Za-z0-9_]*)\.(get|post|put|patch|delete|head|options|websocket)\(\s*["']([^"']+)["'][^\n]*\)\s*\n\s*(?:async\s+)?def\s+([A-Za-z_][A-Za-z0-9_]*)/gi;
    for (const match of file.content.matchAll(decoratorPattern)) {
      const owner = match[1];
      const method = match[2].toUpperCase();
      const path = match[3];
      const handler = match[4];
      const startLine = lineAt(file.content, match.index ?? 0);
      const id = "route-declaration:" + module + ":" + method + ":" + path + "@L" + startLine;
      declarations.push({
        id,
        source: file.path,
        module,
        method,
        path,
        handler,
        owner,
        startLine,
        endLine: startLine + match[0].split("\n").length - 1,
        detector: "python_source_route_declaration",
      });
    }

    const flaskPattern = /@([A-Za-z_][A-Za-z0-9_]*)\.route\(\s*["']([^"']+)["']([^\n]*)\)\s*\n\s*(?:async\s+)?def\s+([A-Za-z_][A-Za-z0-9_]*)/gi;
    for (const match of file.content.matchAll(flaskPattern)) {
      const owner = match[1];
      const path = match[2];
      const methodsRaw = match[3].match(/methods\s*=\s*\[([^\]]+)\]/i)?.[1];
      const methods = methodsRaw
        ? methodsRaw.split(",").map((item) => item.replace(/['"\s]/g, "")).filter(Boolean)
        : ["GET"];
      const handler = match[4];
      const startLine = lineAt(file.content, match.index ?? 0);
      for (const methodRaw of methods) {
        const method = methodRaw.toUpperCase();
        declarations.push({
          id: "route-declaration:" + module + ":" + method + ":" + path + "@L" + startLine,
          source: file.path,
          module,
          method,
          path,
          handler,
          owner,
          startLine,
          endLine: startLine + match[0].split("\n").length - 1,
          detector: "python_source_route_declaration",
        });
      }
    }

    const includePattern = /([A-Za-z_][A-Za-z0-9_.]*)\.include_router\(\s*([A-Za-z_][A-Za-z0-9_.]*)([\s\S]*?)\)/g;
    for (const match of file.content.matchAll(includePattern)) {
      const parent = resolveRouter(module, match[1], routers, imports);
      const child = resolveRouter(module, match[2], routers, imports);
      if (!parent || !child) continue;
      includes.push({
        parent,
        child,
        prefix: literalKeyword(match[3] ?? "", "prefix"),
        source: file.path,
      });
    }
  }

  const declarationRouter = new Map<string, RouterKey>();
  for (const declaration of declarations) {
    nodes.push({
      id: declaration.id,
      type: "http_route",
      route_identity: "declaration",
      source: declaration.source,
      layer: "generated",
      method: declaration.method,
      path: declaration.path,
      handler: declaration.handler,
      router_owner: declaration.owner,
      start_line: declaration.startLine,
      end_line: declaration.endLine,
      detector: declaration.detector,
    });
    edges.push({
      from: "py:" + declaration.module,
      to: declaration.id,
      type: "declares_route",
      evidence: declaration.source,
      start_line: declaration.startLine,
      end_line: declaration.endLine,
      symbol: declaration.handler,
      detector: declaration.detector,
      layer: "generated",
    });
    if (declaration.owner) {
      const resolved = resolveRouter(declaration.module, declaration.owner, routers, imports);
      if (resolved) declarationRouter.set(declaration.id, resolved);
    }
  }

  const declarationsByRouter = new Map<RouterKey, RouteDeclaration[]>();
  for (const declaration of declarations) {
    const key = declarationRouter.get(declaration.id);
    if (!key) continue;
    const list = declarationsByRouter.get(key) ?? [];
    list.push(declaration);
    declarationsByRouter.set(key, list);
  }

  const includesByParent = new Map<RouterKey, Include[]>();
  const children = new Set<RouterKey>();
  for (const include of includes) {
    const list = includesByParent.get(include.parent) ?? [];
    list.push(include);
    includesByParent.set(include.parent, list);
    children.add(include.child);
  }

  const runtimeNodes = new Map<string, GraphNode>();
  const runtimeSources = new Map<string, Set<string>>();

  function walk(key: RouterKey, accumulated: string, trail: Set<RouterKey>) {
    if (trail.has(key)) return;
    const router = routers.get(key);
    if (!router) return;
    const nextTrail = new Set(trail);
    nextTrail.add(key);
    const currentPrefix = joinPath(accumulated, router.prefix);

    for (const declaration of declarationsByRouter.get(key) ?? []) {
      const fullPath = joinPath(currentPrefix, declaration.path);
      const runtimeId = "runtime-route:" + declaration.method + ":" + fullPath;
      const sources = runtimeSources.get(runtimeId) ?? new Set<string>();
      sources.add(declaration.source);
      runtimeSources.set(runtimeId, sources);
      if (!runtimeNodes.has(runtimeId)) {
        runtimeNodes.set(runtimeId, {
          id: runtimeId,
          type: "runtime_route",
          route_identity: "runtime-composed",
          source: declaration.source,
          layer: "generated",
          method: declaration.method,
          path: fullPath,
          composition_proven: true,
          detector: "python_source_route_composition",
        });
      }
      edges.push({
        from: declaration.id,
        to: runtimeId,
        type: "composes_to",
        evidence: declaration.source,
        start_line: declaration.startLine,
        end_line: declaration.endLine,
        symbol: declaration.handler,
        detector: "python_source_route_composition",
        layer: "generated",
      });
    }

    for (const include of includesByParent.get(key) ?? []) {
      walk(include.child, joinPath(currentPrefix, include.prefix), nextTrail);
    }
  }

  const roots = [...routers.values()]
    .filter((router) => router.kind === "application" && !children.has(router.key))
    .map((router) => router.key);
  for (const root of roots) walk(root, "", new Set());

  for (const [id, node] of runtimeNodes) {
    const sources = [...(runtimeSources.get(id) ?? [])].sort();
    if (sources.length === 1) node.source = sources[0]!;
    if (sources.length > 1) node.sources = sources;
    nodes.push(node);
  }

  const jsPattern = /\b(?:app|router|api)\.(get|post|put|patch|delete|all)\(\s*['"]([^'"]+)['"]\s*(?:,\s*([A-Za-z_$][\w$]*))?/gi;
  for (const file of files.filter((item) => /\.(cjs|cts|js|jsx|mjs|mts|ts|tsx)$/.test(item.path) && !/(?:^|\/)(?:tests?|__tests__)(?:\/|$)/.test(item.path))) {
    for (const match of file.content.matchAll(jsPattern)) {
      const method = match[1].toUpperCase();
      const path = match[2];
      const handler = match[3];
      const line = lineAt(file.content, match.index ?? 0);
      const id = "route-declaration:js:" + file.path + ":" + method + ":" + path + "@L" + line;
      nodes.push({
        id,
        type: "http_route",
        route_identity: "declaration",
        source: file.path,
        layer: "generated",
        method,
        path,
        handler,
        start_line: line,
        end_line: line,
        detector: "javascript_route_pattern",
      });
      edges.push({
        from: "js:" + file.path,
        to: id,
        type: "declares_route",
        evidence: file.path,
        start_line: line,
        end_line: line,
        symbol: handler,
        detector: "javascript_route_pattern",
        layer: "generated",
      });
    }
  }

  return {
    nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)),
    edges: edges.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.type.localeCompare(b.type)),
  };
}
