import type { IngestedFile, Language } from "./types.ts";

export const MAX_FILE_BYTES = 2_000_000;


const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  "__pycache__",
  ".venv",
  "venv",
  "vendor",
  ".turbo",
  ".cache",
  "target",
]);

const TEXT_EXT = new Set([
  "py",
  "js",
  "jsx",
  "ts",
  "tsx",
  "mjs",
  "cjs",
  "json",
  "md",
  "rst",
  "sql",
  "toml",
  "yml",
  "yaml",
  "css",
  "html",
  "txt",
  "ini",
  "cfg",
  "sh",
  "go",
  "rs",
  "java",
  "kt",
  "rb",
  "php",
  "cs",
  "swift",
  "c",
  "h",
  "cc",
  "cpp",
  "hpp",
  "cxx",
  "scala",
  "ex",
  "exs",
  "lua",
  "proto",
  "vue",
  "svelte",
  "graphql",
  "env",
  "example",
]);

const BOOST_DIR =
  /(?:^|\/)(src|lib|app|apps|packages|backend|frontend|server|cmd|pkg|internal|core|services)\//;
const PENALTY =
  /(?:^|\/)(dist|build|vendor|generated|__snapshots__|testdata|fixtures|node_modules)\/|(?:^|\/)[^/]*\.(min|map|lock)$|package-lock|pnpm-lock|yarn\.lock|Cargo\.lock|go\.sum|poetry\.lock|composer\.lock/;
const MANIFEST =
  /(?:^|\/)(README(?:\.\w+)?|package\.json|pyproject\.toml|setup\.py|go\.mod|Cargo\.toml|Gemfile|composer\.json|pom\.xml|build\.gradle(?:\.kts)?|Makefile|Dockerfile)$/i;
const SOURCE_EXT = /\.(py|ts|tsx|js|jsx|mjs|cjs|go|rs|java|kt|rb|php|cs|swift|c|h|cc|cpp|hpp|scala|ex|exs|lua)$/i;

export function languageOf(path: string): Language {
  if (path.endsWith(".py")) return "python";
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".js") || path.endsWith(".jsx") || path.endsWith(".mjs") || path.endsWith(".cjs")) {
    return "javascript";
  }
  if (path.endsWith(".go")) return "go";
  if (path.endsWith(".rs")) return "rust";
  if (path.endsWith(".java")) return "java";
  if (path.endsWith(".kt") || path.endsWith(".kts")) return "kotlin";
  if (path.endsWith(".rb")) return "ruby";
  if (path.endsWith(".php")) return "php";
  if (path.endsWith(".cs")) return "csharp";
  if (path.endsWith(".swift")) return "swift";
  if (path.endsWith(".c") || path.endsWith(".h")) return "c";
  if (/\.(cc|cpp|cxx|hpp|hh)$/.test(path)) return "cpp";
  if (path.endsWith(".scala")) return "scala";
  if (path.endsWith(".ex") || path.endsWith(".exs")) return "elixir";
  if (path.endsWith(".lua")) return "lua";
  return "other";
}

export function isTextPath(path: string): boolean {
  const base = path.split("/").pop() ?? path;
  if (base === "Dockerfile" || base === "Makefile" || base.startsWith(".env")) return true;
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return TEXT_EXT.has(ext);
}

export function skipRoot(path: string): string | undefined {
  const parts = path.split("/");
  const i = parts.findIndex((part) => SKIP_DIRS.has(part));
  if (i < 0) return undefined;
  return parts.slice(0, i + 1).join("/");
}

export function shouldSkipPath(path: string): boolean {
  const parts = path.split("/");
  const base = parts[parts.length - 1] ?? path;
  if (/^\.env($|\.)/i.test(base) && !/\.(example|sample|template)$/i.test(base)) return true;
  return parts.some((part) => SKIP_DIRS.has(part) || part === ".DS_Store");
}

export function rankPath(path: string): number {
  let score = 0;
  if (SOURCE_EXT.test(path)) score += 8;
  if (MANIFEST.test(path)) score += 12;
  if (BOOST_DIR.test(path)) score += 4;
  if (/(?:^|\/)(tests?|__tests__|spec)(?:\/|$)/i.test(path) || /\.(test|spec)\./.test(path)) score -= 1;
  if (PENALTY.test(path)) score -= 20;
  const depth = path.split("/").length;
  score -= Math.max(0, depth - 4);
  return score;
}

export function selectSourceFiles<T extends { path: string; size?: number }>(
  items: T[],
): { selected: T[]; omitted: number; omittedPaths: string[] } {
  const omittedPaths: string[] = [];
  const eligible: T[] = [];
  for (const item of items) {
    if (shouldSkipPath(item.path) || !isTextPath(item.path)) continue;
    if (typeof item.size === "number" && item.size > MAX_FILE_BYTES) {
      omittedPaths.push(item.path);
      continue;
    }
    eligible.push(item);
  }
  const selected = [...eligible].sort((a, b) => {
    const diff = rankPath(b.path) - rankPath(a.path);
    if (diff) return diff;
    return a.path.localeCompare(b.path);
  });
  return { selected, omitted: omittedPaths.length, omittedPaths };
}

export function looksInternalSpecifier(specifier: string): boolean {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith("@/") ||
    specifier.startsWith("~/")
  ) {
    return true;
  }
  if (specifier.startsWith("@")) return false;
  if (specifier.startsWith("http") || specifier.startsWith("github.com/")) return false;
  return /^[A-Za-z_][\w]*(\.[A-Za-z_][\w]*)+$/.test(specifier);
}

export function asIngested(path: string, content: string): IngestedFile {
  return { path, content, language: languageOf(path), size: content.length };
}
