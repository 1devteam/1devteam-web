import type { FileInput, GraphEdge, GraphNode } from "./types.ts";

export const SOURCE_SUFFIXES = new Set([
  ".bash", ".c", ".cc", ".cjs", ".cpp", ".cs", ".cts", ".ex", ".exs", ".go", ".h",
  ".hpp", ".java", ".js", ".jsx", ".kt", ".kts", ".lua", ".mjs", ".mts", ".php", ".py",
  ".rb", ".rs", ".scala", ".sh", ".swift", ".ts", ".tsx", ".zsh",
]);
export const TEST_SUFFIXES = new Set([".bats"]);
export const DOCUMENT_SUFFIXES = new Set([".adoc", ".md", ".rst"]);
export const CONFIG_SUFFIXES = new Set([".cfg", ".ini", ".json", ".toml", ".yaml", ".yml"]);
export const CONTRACT_SUFFIXES = new Set([".avsc", ".gql", ".graphql", ".proto", ".sql"]);
export const BUILD_SUFFIXES = new Set([
  ".bazel", ".bzl", ".cmake", ".csproj", ".fsproj", ".gn", ".gni", ".gradle", ".ninja", ".vbproj",
]);
export const BUILD_FILES = new Set([
  ".gn", "BUILD", "BUILD.bazel", "BUILD.gn", "CMakeLists.txt", "Cargo.lock", "Cargo.toml", "DEPS",
  "GNUmakefile", "Gemfile", "Makefile", "MODULE.bazel", "Package.swift", "Rakefile", "SConscript",
  "SConstruct", "WORKSPACE", "WORKSPACE.bazel", "build.gradle", "build.gradle.kts", "composer.json",
  "go.mod", "go.sum", "meson.build", "meson_options.txt", "mix.exs", "package-lock.json", "package.json",
  "pom.xml", "pyproject.toml", "requirements.txt", "settings.gradle", "settings.gradle.kts",
]);
export const GOVERNANCE_FILES = new Set(["CODEOWNERS", "OWNERS", "PRESUBMIT.py", "SECURITY.md"]);

const SPECIAL_FILES = new Set([
  ...BUILD_FILES, ...GOVERNANCE_FILES, ".env.example", "Dockerfile", "Procfile",
]);

const SKIP_PARTS = new Set([
  ".git", ".mypy_cache", ".pytest_cache", ".tox", ".turbo", ".venv", "__pycache__", "build",
  "coverage", "dist", "node_modules", "target", "vendor", "venv",
]);

function suffix(path: string): string {
  const base = path.split("/").pop() ?? path;
  const at = base.lastIndexOf(".");
  return at >= 0 ? base.slice(at).toLowerCase() : "";
}

function base(path: string): string {
  return path.split("/").pop() ?? path;
}

export function language(path: string): string {
  return ({
    ".bats": "shell", ".bash": "shell", ".c": "c", ".cc": "cpp", ".cjs": "javascript",
    ".cpp": "cpp", ".cs": "csharp", ".cts": "typescript", ".ex": "elixir", ".exs": "elixir",
    ".go": "go", ".h": "c", ".hpp": "cpp", ".java": "java", ".js": "javascript", ".jsx": "javascript",
    ".kt": "kotlin", ".kts": "kotlin", ".lua": "lua", ".md": "markdown", ".mjs": "javascript",
    ".mts": "typescript", ".php": "php", ".py": "python", ".rb": "ruby", ".rs": "rust",
    ".scala": "scala", ".sh": "shell", ".swift": "swift", ".ts": "typescript", ".tsx": "typescript",
    ".zsh": "shell", ".avsc": "avro", ".gql": "graphql", ".graphql": "graphql", ".proto": "protobuf",
    ".sql": "sql", ".csproj": "msbuild", ".fsproj": "msbuild", ".gradle": "gradle", ".vbproj": "msbuild",
  } as Record<string, string>)[suffix(path)] ?? "other";
}

export function isRelevantFile(file: FileInput): boolean {
  const parts = file.path.split("/");
  if (parts.some((part) => SKIP_PARTS.has(part))) return false;
  const name = base(file.path);
  if (name.startsWith(".env") && name !== ".env.example") return false;
  const ext = suffix(file.path);
  const configBearing =
    CONFIG_SUFFIXES.has(ext) &&
    (parts.length === 1 || file.path.startsWith(".github/") || /(?:^|[-_.])(config|settings|schema|manifest|lock|workspace)(?:$|[-_.])|^(?:tsconfig|jsconfig|docker-compose)/i.test(name));
  return SOURCE_SUFFIXES.has(ext) ||
    TEST_SUFFIXES.has(ext) ||
    DOCUMENT_SUFFIXES.has(ext) ||
    CONTRACT_SUFFIXES.has(ext) ||
    BUILD_SUFFIXES.has(ext) ||
    configBearing ||
    SPECIAL_FILES.has(name) ||
    /^#!.*(?:sh|bash|zsh|python|node)/.test(file.content.split("\n", 1)[0] ?? "");
}

function isTest(path: string): boolean {
  return suffix(path) === ".bats" || /(?:^|\/)(?:tests?|specs?|__tests__)(?:\/|$)|(?:\.test|\.spec)\.[^.]+$/i.test(path);
}

function intentKind(path: string): string | undefined {
  const name = base(path).toLowerCase();
  if (["package.json", "pyproject.toml", "cargo.toml", "go.mod"].includes(name)) return "manifest";
  if (name.startsWith("readme")) return "readme";
  if (!DOCUMENT_SUFFIXES.has(suffix(path))) return undefined;
  if (path.toLowerCase().includes("/adr/") || /(?:^|[-_.])adr(?:$|[-_.])/.test(name)) return "architecture-decision";
  if (/(?:^|[-_.])(architecture|design|specification|spec|plan|status|roadmap|contributing)(?:$|[-_.])/i.test(name) ||
      /\/(?:architecture|design|specs|planning)\//i.test(path)) return "declared-intent";
  return undefined;
}

function classify(path: string): string {
  const name = base(path);
  const ext = suffix(path);
  if (GOVERNANCE_FILES.has(name)) return "governance_file";
  if (BUILD_FILES.has(name) || BUILD_SUFFIXES.has(ext)) return "build_file";
  if (isTest(path)) return "test_file";
  if (SOURCE_SUFFIXES.has(ext) || TEST_SUFFIXES.has(ext)) return "source_file";
  if (DOCUMENT_SUFFIXES.has(ext)) return "documentation";
  if (CONTRACT_SUFFIXES.has(ext)) return "contract_source";
  return "configuration";
}

export function inventoryNodes(files: FileInput[], mappedSources: Set<string>) {
  const relevant = files.filter(isRelevantFile).sort((a, b) => a.path.localeCompare(b.path));
  const nodes: GraphNode[] = [];
  const relationshipCandidates: string[] = [];
  const inventoryOnly: string[] = [];
  const intentSources: { path: string; kind: string }[] = [];

  for (const file of relevant) {
    const kind = intentKind(file.path);
    if (kind) intentSources.push({ path: file.path, kind });
    const ext = suffix(file.path);
    if (SOURCE_SUFFIXES.has(ext) || TEST_SUFFIXES.has(ext)) relationshipCandidates.push(file.path);
    if (mappedSources.has(file.path)) continue;
    inventoryOnly.push(file.path);
    nodes.push({
      id: `file:${file.path}`,
      type: classify(file.path),
      source: file.path,
      layer: "generated",
      language: language(file.path),
      relationship_status: "inventory_only",
      intent_kind: kind,
    });
  }

  const candidates = [...new Set(relationshipCandidates)].sort();
  const parsed = candidates.filter((path) => mappedSources.has(path));
  const unparsed = candidates.filter((path) => !mappedSources.has(path));
  return {
    nodes,
    facts: {
      file_count: relevant.length,
      relationship_candidate_count: candidates.length,
      relationship_parsed_file_count: parsed.length,
      relationship_unparsed_file_count: unparsed.length,
      relationship_unparsed_files: unparsed,
      inventory_only_files: inventoryOnly.sort(),
      intent_sources: intentSources.sort((a, b) => a.kind.localeCompare(b.kind) || a.path.localeCompare(b.path)),
    },
  };
}

function parsePackageJson(content: string): Record<string, unknown> | undefined {
  try {
    const value = JSON.parse(content);
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
  } catch {
    return undefined;
  }
}

function parsePyproject(content: string): Record<string, unknown> | undefined {
  const project = content.match(/(?:^|\n)\[project\]([\s\S]*?)(?=\n\[|$)/)?.[1];
  if (!project) return undefined;
  const name = project.match(/(?:^|\n)\s*name\s*=\s*["']([^"']+)["']/)?.[1];
  const depsBody = project.match(/(?:^|\n)\s*dependencies\s*=\s*\[([\s\S]*?)\]/)?.[1];
  const dependencies = depsBody
    ? [...depsBody.matchAll(/["']([A-Za-z0-9_.@/-]+)/g)].map((m) => m[1])
    : [];
  return { name, dependencies };
}

function normalizeJoin(parent: string, raw: string): string {
  const stack = parent === "." ? [] : parent.split("/").filter(Boolean);
  for (const part of raw.replace(/^\.\//, "").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return stack.join("/");
}

function wildcardMatch(value: string, pattern: string): boolean {
  const re = new RegExp("^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*") + "$");
  return re.test(value);
}

export function collectPackageTopology(files: FileInput[], sourceNodeIds: Map<string, string>) {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const declarations: { id: string; path: string; payload: Record<string, unknown>; ecosystem: string }[] = [];
  const seenIds = new Set<string>();

  for (const file of files.filter(isRelevantFile)) {
    const name = base(file.path);
    let payload: Record<string, unknown> | undefined;
    let ecosystem = "";
    if (name === "package.json") {
      if (/(?:^|\/)(?:fixture|fixtures|test|tests|__tests__)(?:\/|$)/.test(file.path)) continue;
      payload = parsePackageJson(file.content);
      ecosystem = "npm";
    } else if (name === "pyproject.toml") {
      if (/(?:^|\/)(?:fixture|fixtures|test|tests|__tests__)(?:\/|$)/.test(file.path)) continue;
      payload = parsePyproject(file.content);
      ecosystem = "python";
    }
    if (!payload) continue;
    const parent = file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : ".";
    const rawName = typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : parent;
    let id = `package:${rawName}`;
    if (seenIds.has(id)) id = `${id}:${file.path}`;
    seenIds.add(id);
    const node: GraphNode = {
      id, type: "software_package", source: file.path, layer: "generated",
      name: rawName, ecosystem,
    };
    if (ecosystem === "npm" && payload.scripts && typeof payload.scripts === "object") node.scripts = payload.scripts;
    nodes.push(node);
    declarations.push({ id, path: file.path, payload, ecosystem });
  }

  const packageByName = new Map(nodes.map((n) => [String(n.name), n.id]));
  const dependencyNodes = new Map<string, GraphNode>();
  const manifestIds = new Set(sourceNodeIds.values());

  for (const decl of declarations) {
    const manifestId = `manifest:${decl.path}`;
    if (manifestIds.has(manifestId)) {
      edges.push({ from: decl.id, to: manifestId, type: "declared_in", evidence: decl.path, layer: "generated" });
    }
    const parent = decl.path.includes("/") ? decl.path.slice(0, decl.path.lastIndexOf("/")) : ".";
    const entrypoints: [string, string][] = [];
    if (decl.ecosystem === "npm") {
      if (typeof decl.payload.main === "string") entrypoints.push(["main", decl.payload.main]);
      if (typeof decl.payload.bin === "string") entrypoints.push(["bin", decl.payload.bin]);
      else if (decl.payload.bin && typeof decl.payload.bin === "object") {
        for (const [name, value] of Object.entries(decl.payload.bin as Record<string, unknown>)) {
          if (typeof value === "string") entrypoints.push([`bin:${name}`, value]);
        }
      }
    }
    for (const [role, raw] of entrypoints) {
      const targetPath = normalizeJoin(parent, raw);
      const target = sourceNodeIds.get(targetPath);
      if (target) edges.push({ from: decl.id, to: target, type: "declares_entrypoint", role, evidence: decl.path, layer: "generated" });
    }

    const maps: [string, Record<string, unknown>][] = [];
    for (const key of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
      const value = decl.payload[key];
      if (value && typeof value === "object" && !Array.isArray(value)) maps.push([key, value as Record<string, unknown>]);
    }
    if (Array.isArray(decl.payload.dependencies)) {
      maps.push(["dependencies", Object.fromEntries(decl.payload.dependencies.map((v) => [String(v), "declared"]))]);
    }
    for (const [scope, map] of maps) {
      for (const [dependency, constraint] of Object.entries(map).sort()) {
        let target = packageByName.get(dependency);
        if (!target) {
          target = `dependency:${dependency}`;
          if (!dependencyNodes.has(target)) dependencyNodes.set(target, {
            id: target, type: "external_dependency", source: decl.path, layer: "generated", name: dependency,
          });
        }
        edges.push({ from: decl.id, to: target, type: "depends_on_package", scope, constraint: String(constraint), evidence: decl.path, layer: "generated" });
      }
    }
  }

  for (const root of declarations) {
    const ws = root.payload.workspaces;
    const patterns = Array.isArray(ws)
      ? ws.map(String)
      : ws && typeof ws === "object" && Array.isArray((ws as { packages?: unknown }).packages)
        ? ((ws as { packages: unknown[] }).packages.map(String))
        : [];
    const rootParent = root.path.includes("/") ? root.path.slice(0, root.path.lastIndexOf("/")) : ".";
    for (const child of declarations) {
      if (child.id === root.id) continue;
      const childParent = child.path.includes("/") ? child.path.slice(0, child.path.lastIndexOf("/")) : ".";
      const relative = rootParent === "." ? childParent : childParent.startsWith(rootParent + "/") ? childParent.slice(rootParent.length + 1) : "";
      if (relative && patterns.some((pattern) => wildcardMatch(relative, pattern.replace(/\/$/, "")))) {
        edges.push({ from: root.id, to: child.id, type: "contains_workspace", evidence: root.path, layer: "generated" });
      }
    }
  }

  return {
    nodes: [...nodes, ...dependencyNodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    edges: edges.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.type.localeCompare(b.type)),
  };
}
