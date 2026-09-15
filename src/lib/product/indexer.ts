import type {
  CallEdge,
  FileRecord,
  IngestedFile,
  IndexedImport,
  IndexedRoute,
  IndexedSymbol,
  Language,
  ProjectIndex,
} from "./types.ts";
import { fingerprint, isoNow } from "./hash.ts";
import { languageOf } from "./paths.ts";

const SKIP_CALLS = new Set([
  "if",
  "for",
  "while",
  "return",
  "switch",
  "catch",
  "await",
  "print",
  "len",
  "range",
  "super",
  "self",
  "cls",
  "log",
  "logger",
  "console",
  "require",
  "import",
  "from",
  "class",
  "def",
  "function",
  "async",
  "True",
  "False",
  "None",
  "true",
  "false",
  "null",
  "undefined",
  "fmt",
  "println",
  "panic",
  "vec",
  "ok",
  "err",
  "some",
  "none",
  "new",
  "this",
]);

export { languageOf };

function symbolId(path: string, name: string, line: number): string {
  return `${path}:${name}:${line}`;
}

function pythonSymbols(path: string, content: string): IndexedSymbol[] {
  const out: IndexedSymbol[] = [];
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    const def = line.match(/^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)/);
    if (def) {
      out.push({ id: symbolId(path, def[1], i + 1), name: def[1], kind: "function", path, line: i + 1 });
      return;
    }
    const cls = line.match(/^\s*class\s+([A-Za-z_]\w*)/);
    if (cls) {
      out.push({ id: symbolId(path, cls[1], i + 1), name: cls[1], kind: "class", path, line: i + 1 });
    }
  });
  return out;
}

function jsSymbols(path: string, content: string): IndexedSymbol[] {
  const out: IndexedSymbol[] = [];
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    const fn = line.match(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_]\w*)/);
    if (fn) {
      out.push({ id: symbolId(path, fn[1], i + 1), name: fn[1], kind: "function", path, line: i + 1 });
      return;
    }
    const cls = line.match(/(?:export\s+)?class\s+([A-Za-z_]\w*)/);
    if (cls) {
      out.push({ id: symbolId(path, cls[1], i + 1), name: cls[1], kind: "class", path, line: i + 1 });
      return;
    }
    const arrow = line.match(/(?:export\s+)?(?:const|let|var)\s+([A-Za-z_]\w*)\s*=\s*(?:async\s*)?(?:\(|[A-Za-z_])/);
    if (arrow && /=>|function/.test(line)) {
      out.push({ id: symbolId(path, arrow[1], i + 1), name: arrow[1], kind: "function", path, line: i + 1 });
    }
  });
  return out;
}

function goSymbols(path: string, content: string): IndexedSymbol[] {
  const out: IndexedSymbol[] = [];
  content.split("\n").forEach((line, i) => {
    const fn = line.match(/^func\s+(?:\([^)]+\)\s+)?([A-Za-z_]\w*)\s*\(/);
    if (fn) {
      out.push({ id: symbolId(path, fn[1], i + 1), name: fn[1], kind: "function", path, line: i + 1 });
      return;
    }
    const typ = line.match(/^type\s+([A-Za-z_]\w*)\s+(?:struct|interface)/);
    if (typ) out.push({ id: symbolId(path, typ[1], i + 1), name: typ[1], kind: "class", path, line: i + 1 });
  });
  return out;
}

function rustSymbols(path: string, content: string): IndexedSymbol[] {
  const out: IndexedSymbol[] = [];
  content.split("\n").forEach((line, i) => {
    const fn = line.match(/^\s*(?:pub(?:\([^)]+\))?\s+)?(?:async\s+)?fn\s+([A-Za-z_]\w*)/);
    if (fn) {
      out.push({ id: symbolId(path, fn[1], i + 1), name: fn[1], kind: "function", path, line: i + 1 });
      return;
    }
    const st = line.match(/^\s*(?:pub(?:\([^)]+\))?\s+)?(?:struct|enum|trait)\s+([A-Za-z_]\w*)/);
    if (st) out.push({ id: symbolId(path, st[1], i + 1), name: st[1], kind: "class", path, line: i + 1 });
  });
  return out;
}

function javaSymbols(path: string, content: string): IndexedSymbol[] {
  const out: IndexedSymbol[] = [];
  content.split("\n").forEach((line, i) => {
    const cls = line.match(/\b(?:class|interface|enum|record)\s+([A-Za-z_]\w*)/);
    if (cls) out.push({ id: symbolId(path, cls[1], i + 1), name: cls[1], kind: "class", path, line: i + 1 });
    const fn = line.match(
      /\b(?:public|private|protected|static|final|synchronized|native|abstract|\s)+([A-Za-z_][\w<>,\[\]]*)\s+([A-Za-z_]\w*)\s*\(/,
    );
    if (fn && !/^(if|for|while|switch|catch|return)$/.test(fn[2])) {
      out.push({ id: symbolId(path, fn[2], i + 1), name: fn[2], kind: "function", path, line: i + 1 });
    }
  });
  return out;
}

function pythonImports(_path: string, content: string): { specifier: string }[] {
  const out: { specifier: string }[] = [];
  for (const line of content.split("\n")) {
    const from = line.match(/^\s*from\s+([\w.]+)\s+import/);
    if (from) {
      out.push({ specifier: from[1] });
      continue;
    }
    const direct = line.match(/^\s*import\s+([\w.]+)/);
    if (direct) out.push({ specifier: direct[1] });
  }
  return out;
}

function jsImports(_path: string, content: string): { specifier: string }[] {
  const out: { specifier: string }[] = [];
  const re = /(?:import\s+(?:[^'"\n]+from\s+)?|require\(\s*|import\(\s*)['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content))) {
    out.push({ specifier: match[1] });
  }
  return out;
}

function goImports(content: string): { specifier: string }[] {
  const out: { specifier: string }[] = [];
  const block = content.match(/import\s*\(([\s\S]*?)\)/);
  const body = block ? block[1] : "";
  for (const line of body.split("\n")) {
    const m = line.match(/["']([^"']+)["']/);
    if (m) out.push({ specifier: m[1] });
  }
  const single = content.match(/import\s+(?:[A-Za-z_]\w*\s+)?["']([^"']+)["']/);
  if (single) out.push({ specifier: single[1] });
  return out;
}

function rustImports(content: string): { specifier: string }[] {
  const out: { specifier: string }[] = [];
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*use\s+([^;]+);/);
    if (m) out.push({ specifier: m[1].trim() });
  }
  return out;
}

function javaImports(content: string): { specifier: string }[] {
  const out: { specifier: string }[] = [];
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*import\s+([^;]+);/);
    if (m) out.push({ specifier: m[1].trim() });
  }
  return out;
}

function lineSymbols(
  path: string,
  content: string,
  matchers: { re: RegExp; kind: IndexedSymbol["kind"]; group: number }[],
): IndexedSymbol[] {
  const out: IndexedSymbol[] = [];
  content.split("\n").forEach((line, i) => {
    for (const matcher of matchers) {
      const m = line.match(matcher.re);
      if (m?.[matcher.group]) {
        out.push({
          id: symbolId(path, m[matcher.group], i + 1),
          name: m[matcher.group],
          kind: matcher.kind,
          path,
          line: i + 1,
        });
      }
    }
  });
  return out;
}

function lineImports(content: string, re: RegExp): { specifier: string }[] {
  const out: { specifier: string }[] = [];
  for (const line of content.split("\n")) {
    const m = line.match(re);
    if (m?.[1]) out.push({ specifier: m[1].trim() });
  }
  return out;
}

function rubySymbols(path: string, content: string): IndexedSymbol[] {
  return lineSymbols(path, content, [
    { re: /^\s*class\s+([A-Za-z_]\w*)/, kind: "class", group: 1 },
    { re: /^\s*module\s+([A-Za-z_]\w*)/, kind: "class", group: 1 },
    { re: /^\s*def\s+(?:self\.)?([A-Za-z_]\w*[?!]?)/, kind: "function", group: 1 },
  ]);
}

function phpSymbols(path: string, content: string): IndexedSymbol[] {
  return lineSymbols(path, content, [
    { re: /\b(?:class|interface|trait|enum)\s+([A-Za-z_]\w*)/, kind: "class", group: 1 },
    { re: /\bfunction\s+([A-Za-z_]\w*)\s*\(/, kind: "function", group: 1 },
  ]);
}

function csharpSymbols(path: string, content: string): IndexedSymbol[] {
  return lineSymbols(path, content, [
    { re: /\b(?:class|interface|struct|record|enum)\s+([A-Za-z_]\w*)/, kind: "class", group: 1 },
    { re: /\b(?:public|private|protected|internal|static|async|override|virtual|new|\s)+\s+[A-Za-z_][\w<>,\[\]]*\s+([A-Za-z_]\w*)\s*\(/, kind: "function", group: 1 },
  ]);
}

function swiftSymbols(path: string, content: string): IndexedSymbol[] {
  return lineSymbols(path, content, [
    { re: /\b(?:class|struct|enum|protocol|actor)\s+([A-Za-z_]\w*)/, kind: "class", group: 1 },
    { re: /\bfunc\s+([A-Za-z_]\w*)/, kind: "function", group: 1 },
  ]);
}

function cSymbols(path: string, content: string): IndexedSymbol[] {
  return lineSymbols(path, content, [
    { re: /^\s*(?:typedef\s+)?(?:struct|enum|union|class)\s+([A-Za-z_]\w*)/, kind: "class", group: 1 },
    { re: /^\s*[A-Za-z_][\w\s\*]+\s+([A-Za-z_]\w*)\s*\([^;]*\)\s*\{?/, kind: "function", group: 1 },
  ]);
}

function scalaSymbols(path: string, content: string): IndexedSymbol[] {
  return lineSymbols(path, content, [
    { re: /\b(?:class|object|trait|enum)\s+([A-Za-z_]\w*)/, kind: "class", group: 1 },
    { re: /\bdef\s+([A-Za-z_]\w*)/, kind: "function", group: 1 },
  ]);
}

function elixirSymbols(path: string, content: string): IndexedSymbol[] {
  return lineSymbols(path, content, [
    { re: /\bdefmodule\s+([A-Za-z_][\w.]*)/, kind: "class", group: 1 },
    { re: /\bdefp?\s+([A-Za-z_]\w*)/, kind: "function", group: 1 },
  ]);
}

function luaSymbols(path: string, content: string): IndexedSymbol[] {
  return lineSymbols(path, content, [
    { re: /\bfunction\s+(?:[A-Za-z_]\w*\.)?([A-Za-z_]\w*)\s*\(/, kind: "function", group: 1 },
  ]);
}

function symbolsFor(lang: Language, path: string, content: string): IndexedSymbol[] {
  if (lang === "python") return pythonSymbols(path, content);
  if (lang === "javascript" || lang === "typescript") return jsSymbols(path, content);
  if (lang === "go") return goSymbols(path, content);
  if (lang === "rust") return rustSymbols(path, content);
  if (lang === "java" || lang === "kotlin") return javaSymbols(path, content);
  if (lang === "ruby") return rubySymbols(path, content);
  if (lang === "php") return phpSymbols(path, content);
  if (lang === "csharp") return csharpSymbols(path, content);
  if (lang === "swift") return swiftSymbols(path, content);
  if (lang === "c" || lang === "cpp") return cSymbols(path, content);
  if (lang === "scala") return scalaSymbols(path, content);
  if (lang === "elixir") return elixirSymbols(path, content);
  if (lang === "lua") return luaSymbols(path, content);
  return [];
}

function importsFor(lang: Language, path: string, content: string): { specifier: string }[] {
  if (lang === "python") return pythonImports(path, content);
  if (lang === "javascript" || lang === "typescript") return jsImports(path, content);
  if (lang === "go") return goImports(content);
  if (lang === "rust") return rustImports(content);
  if (lang === "java" || lang === "kotlin") return javaImports(content);
  if (lang === "ruby") return lineImports(content, /^\s*(?:require|require_relative)\s+['"]([^'"]+)['"]/);
  if (lang === "php") return lineImports(content, /^\s*(?:use|require|include)(?:_once)?\s+\\?['"]?([^;'"]+)/);
  if (lang === "csharp") return lineImports(content, /^\s*using\s+([^;]+);/);
  if (lang === "swift") return lineImports(content, /^\s*import\s+([A-Za-z_][\w.]*)/);
  if (lang === "c" || lang === "cpp") return lineImports(content, /^\s*#include\s+[<"]([^>"]+)[>"]/);
  if (lang === "scala") return lineImports(content, /^\s*import\s+([^\s]+)/);
  if (lang === "elixir") return lineImports(content, /^\s*(?:alias|import|require|use)\s+([A-Za-z_][\w.]*)/);
  if (lang === "lua") return lineImports(content, /require\(\s*['"]([^'"]+)['"]/);
  return [];
}

function pythonRoutes(path: string, content: string): IndexedRoute[] {
  const out: IndexedRoute[] = [];
  const call = /\.(get|post|put|delete|patch|route|api_route)\(\s*['"]([^'"]+)['"]/gi;
  const deco = /@(?:\w+\.)?(get|post|put|delete|patch|route)\(\s*['"]([^'"]+)['"]/gi;
  content.split("\n").forEach((line, i) => {
    for (const re of [call, deco]) {
      re.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = re.exec(line))) {
        const raw = match[1].toUpperCase();
        out.push({
          path,
          method: raw === "ROUTE" || raw === "API_ROUTE" ? "ROUTE" : raw,
          route: match[2],
          line: i + 1,
        });
      }
    }
  });
  return out;
}

function jsRoutes(path: string, content: string): IndexedRoute[] {
  const out: IndexedRoute[] = [];
  const re = /\.(get|post|put|delete|patch|all|use)\(\s*['"`]([^'"`]+)['"`]/gi;
  content.split("\n").forEach((line, i) => {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(line))) {
      out.push({
        path,
        method: match[1].toUpperCase(),
        route: match[2],
        line: i + 1,
      });
    }
  });
  return out;
}

function expandPython(specifier: string, files: Set<string>): string[] {
  const asPath = specifier.replace(/\./g, "/");
  const candidates = [`${asPath}.py`, `${asPath}/__init__.py`];
  const prefixes = new Set<string>();
  for (const file of files) {
    const parts = file.split("/");
    for (let i = 1; i <= Math.min(3, parts.length - 1); i += 1) {
      prefixes.add(parts.slice(0, i).join("/"));
    }
  }
  for (const prefix of prefixes) {
    candidates.push(`${prefix}/${asPath}.py`, `${prefix}/${asPath}/__init__.py`);
  }
  const suffix = `/${asPath}.py`;
  for (const file of files) {
    if (file.endsWith(suffix) || file === `${asPath}.py`) candidates.push(file);
  }
  return candidates;
}

export function resolveSpecifier(
  fromPath: string,
  specifier: string,
  files: Set<string>,
): string | undefined {
  const candidates: string[] = [];
  if (specifier.startsWith(".")) {
    const dir = fromPath.split("/").slice(0, -1).join("/");
    const joined = `${dir}/${specifier}`.split("/");
    const stack: string[] = [];
    for (const part of joined) {
      if (part === "." || part === "") continue;
      if (part === "..") stack.pop();
      else stack.push(part);
    }
    const base = stack.join("/");
    candidates.push(
      base,
      `${base}.py`,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}.js`,
      `${base}.jsx`,
      `${base}.go`,
      `${base}.rs`,
      `${base}/index.ts`,
      `${base}/index.js`,
      `${base}/index.tsx`,
      `${base}/mod.rs`,
      `${base}/__init__.py`,
    );
  } else if (specifier.startsWith("@/") || specifier.startsWith("~/") || specifier.startsWith("#/")) {
    const rest = specifier.replace(/^(@\/|~\/|#\/)/, "");
    candidates.push(
      rest,
      `src/${rest}`,
      `${rest}.ts`,
      `${rest}.tsx`,
      `src/${rest}.ts`,
      `src/${rest}.tsx`,
      `src/${rest}.js`,
    );
  } else if (specifier.startsWith("crate::") || specifier.startsWith("super::") || specifier.startsWith("self::")) {
    const rest = specifier.replace(/^(?:crate|super|self)::/, "").replace(/::/g, "/");
    candidates.push(`src/${rest}.rs`, `src/${rest}/mod.rs`, `${rest}.rs`);
  } else if (specifier.includes(".") && !specifier.startsWith("github.com") && !specifier.includes("/")) {
    candidates.push(...expandPython(specifier, files));
  } else if (specifier.includes("/")) {
    const trimmed = specifier.replace(/^\//, "");
    candidates.push(
      trimmed,
      `${trimmed}.ts`,
      `${trimmed}.tsx`,
      `${trimmed}.js`,
      `${trimmed}.py`,
      `${trimmed}/index.ts`,
      `${trimmed}/__init__.py`,
    );
  }
  for (const candidate of candidates) {
    if (files.has(candidate)) return candidate;
  }
  return undefined;
}

function callsIn(path: string, content: string, caller: string): Omit<CallEdge, "resolvedSymbolId" | "resolvedPath">[] {
  const out: Omit<CallEdge, "resolvedSymbolId" | "resolvedPath">[] = [];
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    const re = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(line))) {
      const name = match[1];
      if (SKIP_CALLS.has(name) || name === caller) continue;
      if (/^\s*(def|class|function|async|func|fn)\b/.test(line) && line.indexOf(name) < 12) continue;
      out.push({
        callerSymbol: caller,
        callerPath: path,
        calleeName: name,
        line: i + 1,
      });
    }
  });
  return out;
}

function enclosingSymbol(symbols: IndexedSymbol[], line: number): IndexedSymbol | undefined {
  let current: IndexedSymbol | undefined;
  for (const symbol of symbols) {
    if (symbol.line <= line) current = symbol;
    else break;
  }
  return current;
}

export function indexFiles(files: IngestedFile[]): ProjectIndex {
  const fileSet = new Set(files.map((f) => f.path));
  const symbols: IndexedSymbol[] = [];
  const imports: IndexedImport[] = [];
  const records: FileRecord[] = [];
  const routes: IndexedRoute[] = [];
  const rawCalls: Omit<CallEdge, "resolvedSymbolId" | "resolvedPath">[] = [];

  for (const file of files) {
    const lang = file.language === "other" ? languageOf(file.path) : file.language;
    const fileSymbols = symbolsFor(lang, file.path, file.content);
    symbols.push(...fileSymbols);
    if (lang === "python") routes.push(...pythonRoutes(file.path, file.content));
    if (lang === "javascript" || lang === "typescript") routes.push(...jsRoutes(file.path, file.content));
    for (const spec of importsFor(lang, file.path, file.content)) {
      imports.push({
        fromPath: file.path,
        specifier: spec.specifier,
        resolvedPath: resolveSpecifier(file.path, spec.specifier, fileSet),
      });
    }
    rawCalls.push(
      ...callsIn(file.path, file.content, enclosingSymbol(fileSymbols, 1)?.name ?? "module").map((call) => {
        const owner = enclosingSymbol(fileSymbols, call.line);
        return { ...call, callerSymbol: owner?.name ?? "module" };
      }),
    );
    records.push({
      path: file.path,
      language: lang,
      size: file.size || file.content.length,
      hash: fingerprint(file.content),
      lineCount: file.content.split("\n").length,
      symbolCount: fileSymbols.length,
    });
  }

  const byName = new Map<string, IndexedSymbol[]>();
  for (const symbol of symbols) {
    const list = byName.get(symbol.name) ?? [];
    list.push(symbol);
    byName.set(symbol.name, list);
  }

  const calls: CallEdge[] = rawCalls.map((call) => {
    const hits = byName.get(call.calleeName) ?? [];
    const unique = hits.length === 1 ? hits[0] : hits.find((h) => h.path !== call.callerPath) ?? hits[0];
    return {
      ...call,
      resolvedSymbolId: unique?.id,
      resolvedPath: unique?.path,
    };
  });

  return {
    generatedAt: isoNow(),
    files: records,
    symbols,
    imports,
    calls,
    routes,
  };
}

export function callersOf(index: ProjectIndex, symbolName: string): CallEdge[] {
  return index.calls.filter((c) => c.calleeName === symbolName);
}

export function calleesOf(index: ProjectIndex, symbolName: string): CallEdge[] {
  return index.calls.filter((c) => c.callerSymbol === symbolName);
}
