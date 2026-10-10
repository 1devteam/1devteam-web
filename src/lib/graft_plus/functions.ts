import type { FileInput, GraphEdge, GraphNode } from "./types.ts";

const BINDING_HANDLER_KEYS = ["handler", "callback", "func", "function", "callable"] as const;
const BINDING_IDENTITY_KEYS = ["name", "id", "key", "action", "event"] as const;
const ROUTE_DECORATORS = new Set(["delete", "get", "head", "options", "patch", "post", "put", "route", "websocket"]);
const CALL_KEYWORDS = new Set([
  "and",
  "assert",
  "await",
  "bool",
  "bytes",
  "dict",
  "enumerate",
  "float",
  "for",
  "if",
  "int",
  "isinstance",
  "len",
  "list",
  "max",
  "min",
  "next",
  "print",
  "range",
  "return",
  "set",
  "str",
  "sum",
  "super",
  "tuple",
  "while",
  "zip",
]);

type Def = {
  key: string;
  node: GraphNode;
  module: string;
  source: string;
  name: string;
  qualifiedName: string;
  ownerClass?: string;
  enclosingFunction?: string;
  indent: number;
  startLine: number;
  endLine: number;
};

type Frame =
  | { kind: "class"; name: string; indent: number }
  | { kind: "function"; qualifiedName: string; ownerClass?: string; indent: number };

type Binding = {
  node: GraphNode;
  edges: GraphEdge[];
  targetKey: string;
  ownerKey?: string;
};

function moduleFor(path: string) {
  const parts = path.replace(/\.py$/, "").split("/").filter(Boolean);
  if (parts[0] === "src") parts.shift();
  if (parts.at(-1) === "__init__") parts.pop();
  return parts.join(".");
}

function indentOf(line: string) {
  const match = line.match(/^[ \t]*/)?.[0] ?? "";
  return [...match].reduce((total, char) => total + (char === "\t" ? 4 : 1), 0);
}

function isProductionPython(path: string) {
  return path.endsWith(".py") && !/(?:^|\/)(?:tests?|fixtures|migrations|alembic)(?:\/|$)/.test(path);
}

function isTestPython(path: string) {
  return path.endsWith(".py") && /(?:^|\/)(?:tests?|test)(?:\/|$)/.test(path);
}

function decoratedRoute(lines: string[], index: number, indent: number) {
  for (let i = index - 1; i >= 0; i--) {
    const line = lines[i] ?? "";
    if (!line.trim()) continue;
    if (indentOf(line) !== indent || !line.trimStart().startsWith("@")) break;
    const target = line.match(/@(?:[A-Za-z_][A-Za-z0-9_]*\.)*([A-Za-z_][A-Za-z0-9_]*)\s*\(/)?.[1]?.toLowerCase();
    if (target && ROUTE_DECORATORS.has(target)) return true;
  }
  return false;
}

function parseDefinitions(file: FileInput): Def[] {
  const lines = file.content.split("\n");
  const module = moduleFor(file.path);
  const frames: Frame[] = [];
  const defs: Def[] = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("@")) continue;
    const indent = indentOf(line);

    while (frames.length && frames.at(-1)!.indent >= indent) frames.pop();

    const classMatch = trimmed.match(/^class\s+([A-Za-z_][A-Za-z0-9_]*)\b/);
    if (classMatch) {
      frames.push({ kind: "class", name: classMatch[1], indent });
      continue;
    }

    const defMatch = trimmed.match(/^(async\s+)?def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
    if (!defMatch) continue;

    const name = defMatch[2];
    const parentFunction = [...frames].reverse().find((frame): frame is Extract<Frame, { kind: "function" }> => frame.kind === "function");
    const parentClass = [...frames].reverse().find((frame): frame is Extract<Frame, { kind: "class" }> => frame.kind === "class");
    const ownerClass = parentFunction?.ownerClass ?? parentClass?.name;
    const qualifiedName = parentFunction
      ? `${parentFunction.qualifiedName}.${name}`
      : ownerClass
        ? `${ownerClass}.${name}`
        : name;

    let endLine = lines.length;
    for (let probe = index + 1; probe < lines.length; probe++) {
      const candidate = lines[probe] ?? "";
      if (!candidate.trim() || candidate.trimStart().startsWith("#")) continue;
      if (indentOf(candidate) <= indent) {
        endLine = probe;
        break;
      }
    }

    const node: GraphNode = {
      id: `fn:${module}:${qualifiedName}`,
      type: ownerClass && !parentFunction ? "python_method" : ownerClass && qualifiedName.startsWith(`${ownerClass}.`) && !qualifiedName.slice(ownerClass.length + 1).includes(".")
        ? "python_method"
        : "python_function",
      source: file.path,
      layer: "generated",
      name,
      qualified_name: qualifiedName,
      module,
      start_line: index + 1,
      end_line: endLine,
      async: Boolean(defMatch[1]),
      detector: "python_source",
      route_handler: decoratedRoute(lines, index, indent),
    };
    if (ownerClass) node.owner_class = ownerClass;
    if (parentFunction) node.enclosing_function = parentFunction.qualifiedName;

    const key = `${module}:${qualifiedName}`;
    defs.push({
      key,
      node,
      module,
      source: file.path,
      name,
      qualifiedName,
      ownerClass,
      enclosingFunction: parentFunction?.qualifiedName,
      indent,
      startLine: index + 1,
      endLine,
    });
    frames.push({ kind: "function", qualifiedName, ownerClass, indent });
  }

  return defs;
}

function importRows(content: string) {
  const importedNames = new Map<string, { module: string; name: string }>();
  const importedModules = new Map<string, string>();

  const addFromItems = (module: string, rawItems: string) => {
    for (const raw of rawItems.replace(/[()]/g, "").split(",")) {
      const item = raw.trim();
      if (!item || item === "*") continue;
      const aliasMatch = item.match(/^([A-Za-z_][A-Za-z0-9_]*)(?:\s+as\s+([A-Za-z_][A-Za-z0-9_]*))?$/);
      if (!aliasMatch) continue;
      importedNames.set(aliasMatch[2] ?? aliasMatch[1], { module, name: aliasMatch[1] });
    }
  };

  const parenthesizedFrom = /^\s*from\s+([A-Za-z0-9_.]+)\s+import\s*\(([\s\S]*?)\)/gm;
  for (const match of content.matchAll(parenthesizedFrom)) addFromItems(match[1], match[2]);

  const fromPattern = /^\s*from\s+([A-Za-z0-9_.]+)\s+import\s+([^\n]+)/gm;
  for (const match of content.matchAll(fromPattern)) {
    if (match[2].trim() === "(") continue;
    addFromItems(match[1], match[2]);
  }

  const importPattern = /^\s*import\s+([^\n]+)/gm;
  for (const match of content.matchAll(importPattern)) {
    for (const raw of match[1].split(",")) {
      const item = raw.trim();
      const aliasMatch = item.match(/^([A-Za-z_][A-Za-z0-9_.]*)(?:\s+as\s+([A-Za-z_][A-Za-z0-9_]*))?$/);
      if (!aliasMatch) continue;
      importedModules.set(aliasMatch[2] ?? aliasMatch[1].split(".")[0], aliasMatch[1]);
    }
  }

  return { importedNames, importedModules };
}

function activeBodyLines(file: FileInput, symbol: Def, definitions: Def[]) {
  const lines = file.content.split("\n");
  const nested = definitions
    .filter(
      (candidate) =>
        candidate.source === symbol.source &&
        candidate.startLine > symbol.startLine &&
        candidate.endLine <= symbol.endLine &&
        candidate.indent > symbol.indent,
    )
    .map((candidate) => [candidate.startLine, candidate.endLine] as const);

  const rows: Array<{ line: number; text: string }> = [];
  for (let line = symbol.startLine + 1; line <= symbol.endLine; line++) {
    if (nested.some(([start, end]) => line >= start && line <= end)) continue;
    rows.push({ line, text: lines[line - 1] ?? "" });
  }
  return rows;
}

function classNames(definitions: Def[], module: string) {
  return new Set(
    definitions
      .filter((symbol) => symbol.module === module && symbol.ownerClass && !symbol.enclosingFunction)
      .map((symbol) => symbol.ownerClass!),
  );
}

function resolveSimpleName(args: {
  symbol?: Def;
  module: string;
  name: string;
  definitions: Map<string, Def>;
  topLevel: Map<string, string>;
  nested: Map<string, string>;
  importedNames: Map<string, { module: string; name: string }>;
}) {
  const { symbol, module, name, definitions, topLevel, nested, importedNames } = args;
  if (symbol) {
    const direct = nested.get(`${module}:${symbol.qualifiedName}:${name}`);
    if (direct) return direct;
    if (symbol.enclosingFunction) {
      const sibling = nested.get(`${module}:${symbol.enclosingFunction}:${name}`);
      if (sibling) return sibling;
    }
  }
  const local = topLevel.get(`${module}:${name}`);
  if (local) return local;
  const imported = importedNames.get(name);
  if (imported) {
    const key = `${imported.module}:${imported.name}`;
    if (definitions.has(key)) return key;
  }
}

function bindingFromText(args: {
  text: string;
  line: number;
  source: string;
  module: string;
  owner?: Def;
  resolveName: (name: string) => string | undefined;
}): Binding[] {
  const { text, line, source, module, owner, resolveName } = args;
  const bindings: Binding[] = [];
  const callPattern = /([A-Za-z_][A-Za-z0-9_.]*)\s*\(([\s\S]{0,1200}?)\)/g;
  for (const match of text.matchAll(callPattern)) {
    const argsText = match[2];
    let identity: string | undefined;
    let identityKeyword: string | undefined;
    for (const key of BINDING_IDENTITY_KEYS) {
      const found = argsText.match(new RegExp(`\\b${key}\\s*=\\s*["']([^"']+)["']`));
      if (found) {
        identity = found[1];
        identityKeyword = key;
        break;
      }
    }
    if (!identity || !identityKeyword) continue;

    let handlerName: string | undefined;
    let handlerKeyword: string | undefined;
    for (const key of BINDING_HANDLER_KEYS) {
      const found = argsText.match(new RegExp(`\\b${key}\\s*=\\s*([A-Za-z_][A-Za-z0-9_]*)`));
      if (found) {
        handlerName = found[1];
        handlerKeyword = key;
        break;
      }
    }
    if (!handlerName || !handlerKeyword) continue;
    const targetKey = resolveName(handlerName);
    if (!targetKey) continue;

    const constructor = match[1];
    const bindingId = `binding:${source}:${line}:0:${identity}`;
    const node: GraphNode = {
      id: bindingId,
      type: "callable_binding",
      source,
      layer: "generated",
      name: identity,
      constructor,
      handler_keyword: handlerKeyword,
      identity_keyword: identityKeyword,
      start_line: line,
      end_line: line + match[0].split("\n").length - 1,
      detector: "python_source",
    };
    const ownerId = owner?.node.id ?? `py:${module}`;
    bindings.push({
      node,
      targetKey,
      ownerKey: owner?.key,
      edges: [
        {
          from: ownerId,
          to: bindingId,
          type: "declares_binding",
          evidence: source,
          start_line: line,
          end_line: node.end_line,
          symbol: constructor,
          detector: "python_source",
          layer: "generated",
        },
        {
          from: bindingId,
          to: `fn:${targetKey}`,
          type: "binds_callable",
          evidence: source,
          start_line: line,
          end_line: node.end_line,
          symbol: identity,
          detector: "python_source",
          layer: "generated",
        },
      ],
    });
  }
  return bindings;
}

export function collectFunctionGraph(files: FileInput[], pythonBySource: Map<string, string>) {
  const production = files.filter((file) => isProductionPython(file.path));
  const definitionsList = production.flatMap(parseDefinitions);
  const definitions = new Map(definitionsList.map((symbol) => [symbol.key, symbol]));
  const topLevel = new Map(
    definitionsList
      .filter((symbol) => !symbol.ownerClass && !symbol.enclosingFunction && !symbol.qualifiedName.includes("."))
      .map((symbol) => [`${symbol.module}:${symbol.name}`, symbol.key]),
  );
  const classMethods = new Map(
    definitionsList
      .filter((symbol) => symbol.ownerClass && !symbol.enclosingFunction)
      .map((symbol) => [`${symbol.module}:${symbol.ownerClass}:${symbol.name}`, symbol.key]),
  );
  const nested = new Map(
    definitionsList
      .filter((symbol) => symbol.enclosingFunction)
      .map((symbol) => [`${symbol.module}:${symbol.enclosingFunction}:${symbol.name}`, symbol.key]),
  );
  const importsByModule = new Map<string, ReturnType<typeof importRows>>();
  const localClassesByModule = new Map<string, Set<string>>();
  const importedClassesByModule = new Map<string, Map<string, { module: string; name: string }>>();

  for (const file of production) {
    const module = moduleFor(file.path);
    const imports = importRows(file.content);
    importsByModule.set(module, imports);
    localClassesByModule.set(module, classNames(definitionsList, module));
    const classes = new Map<string, { module: string; name: string }>();
    for (const [alias, target] of imports.importedNames) {
      if ([...classMethods.keys()].some((key) => key.startsWith(`${target.module}:${target.name}:`))) {
        classes.set(alias, target);
      }
    }
    importedClassesByModule.set(module, classes);
  }

  const participants = new Set<string>();
  const callEdges: GraphEdge[] = [];
  const bindingNodes: GraphNode[] = [];
  const bindingEdges: GraphEdge[] = [];

  for (const file of production) {
    const module = moduleFor(file.path);
    const fileDefinitions = definitionsList.filter((symbol) => symbol.source === file.path);
    const imports = importsByModule.get(module) ?? { importedNames: new Map(), importedModules: new Map() };
    const localClasses = localClassesByModule.get(module) ?? new Set<string>();
    const importedClasses = importedClassesByModule.get(module) ?? new Map<string, { module: string; name: string }>();

    for (const symbol of fileDefinitions) {
      const bodyRows = activeBodyLines(file, symbol, definitionsList);
      const instances = new Map<string, { module: string; name: string }>();

      for (const row of bodyRows) {
        const assignment = row.text.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?::[^=]+)?=\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
        if (!assignment) continue;
        const className = assignment[2];
        if (localClasses.has(className)) instances.set(assignment[1], { module, name: className });
        else if (importedClasses.has(className)) instances.set(assignment[1], importedClasses.get(className)!);
      }

      const resolveName = (name: string) =>
        resolveSimpleName({ symbol, module, name, definitions, topLevel, nested, importedNames: imports.importedNames });

      const resolveMethod = (base: string, method: string) => {
        if ((base === "self" || base === "cls") && symbol.ownerClass) {
          return classMethods.get(`${module}:${symbol.ownerClass}:${method}`);
        }
        if (localClasses.has(base)) return classMethods.get(`${module}:${base}:${method}`);
        const importedClass = importedClasses.get(base);
        if (importedClass) return classMethods.get(`${importedClass.module}:${importedClass.name}:${method}`);
        const instanceClass = instances.get(base);
        if (instanceClass) return classMethods.get(`${instanceClass.module}:${instanceClass.name}:${method}`);
        const importedModule = imports.importedModules.get(base);
        if (importedModule) {
          const candidate = `${importedModule}:${method}`;
          if (definitions.has(candidate)) return candidate;
        }
      };

      const seenCalls = new Set<string>();
      for (const row of bodyRows) {
        const constructorMethod = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\([^\n)]*\)\.([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
        for (const match of row.text.matchAll(constructorMethod)) {
          const className = match[1];
          const classRef = localClasses.has(className)
            ? { module, name: className }
            : importedClasses.get(className);
          const targetKey = classRef ? classMethods.get(`${classRef.module}:${classRef.name}:${match[2]}`) : undefined;
          if (!targetKey || targetKey === symbol.key) continue;
          const edgeKey = `${symbol.key}|${targetKey}|${row.line}`;
          if (seenCalls.has(edgeKey)) continue;
          seenCalls.add(edgeKey);
          participants.add(symbol.key);
          participants.add(targetKey);
          callEdges.push({
            from: symbol.node.id,
            to: `fn:${targetKey}`,
            type: "calls_function",
            evidence: file.path,
            start_line: row.line,
            end_line: row.line,
            symbol: `${className}().${match[2]}`,
            detector: "python_source",
            layer: "generated",
          });
        }

        const attributeCall = /\b([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
        for (const match of row.text.matchAll(attributeCall)) {
          if (row.text.slice(Math.max(0, (match.index ?? 0) - 2), match.index ?? 0) === "().") continue;
          const targetKey = resolveMethod(match[1], match[2]);
          if (!targetKey || targetKey === symbol.key) continue;
          const edgeKey = `${symbol.key}|${targetKey}|${row.line}`;
          if (seenCalls.has(edgeKey)) continue;
          seenCalls.add(edgeKey);
          participants.add(symbol.key);
          participants.add(targetKey);
          callEdges.push({
            from: symbol.node.id,
            to: `fn:${targetKey}`,
            type: "calls_function",
            evidence: file.path,
            start_line: row.line,
            end_line: row.line,
            symbol: `${match[1]}.${match[2]}`,
            detector: "python_source",
            layer: "generated",
          });
        }

        const simpleCall = /(?<!\.)\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
        for (const match of row.text.matchAll(simpleCall)) {
          const name = match[1];
          if (CALL_KEYWORDS.has(name) || localClasses.has(name) || importedClasses.has(name)) continue;
          const targetKey = resolveName(name);
          if (!targetKey || targetKey === symbol.key) continue;
          const edgeKey = `${symbol.key}|${targetKey}|${row.line}`;
          if (seenCalls.has(edgeKey)) continue;
          seenCalls.add(edgeKey);
          participants.add(symbol.key);
          participants.add(targetKey);
          callEdges.push({
            from: symbol.node.id,
            to: `fn:${targetKey}`,
            type: "calls_function",
            evidence: file.path,
            start_line: row.line,
            end_line: row.line,
            symbol: name,
            detector: "python_source",
            layer: "generated",
          });
        }
      }

      const activeText = bodyRows.map((row) => row.text).join("\n");
      const bindings = bindingFromText({
        text: activeText,
        line: bodyRows[0]?.line ?? symbol.startLine,
        source: file.path,
        module,
        owner: symbol,
        resolveName,
      });
      for (const binding of bindings) {
        bindingNodes.push(binding.node);
        bindingEdges.push(...binding.edges);
        participants.add(binding.targetKey);
        if (binding.ownerKey) participants.add(binding.ownerKey);
      }
    }

    const coveredLines = new Set<number>();
    for (const symbol of fileDefinitions) {
      for (let line = symbol.startLine; line <= symbol.endLine; line++) coveredLines.add(line);
    }
    const moduleRows = file.content
      .split("\n")
      .map((text, index) => ({ line: index + 1, text }))
      .filter((row) => !coveredLines.has(row.line));
    const moduleText = moduleRows.map((row) => row.text).join("\n");
    const moduleResolve = (name: string) =>
      resolveSimpleName({ module, name, definitions, topLevel, nested, importedNames: imports.importedNames });
    for (const binding of bindingFromText({
      text: moduleText,
      line: moduleRows[0]?.line ?? 1,
      source: file.path,
      module,
      resolveName: moduleResolve,
    })) {
      bindingNodes.push(binding.node);
      bindingEdges.push(...binding.edges);
      participants.add(binding.targetKey);
    }
  }

  const testEdges: GraphEdge[] = [];
  for (const file of files.filter((item) => isTestPython(item.path))) {
    const imports = importRows(file.content);
    const importedFunctions = new Map<string, string>();
    const importedClasses = new Map<string, { module: string; name: string }>();

    for (const [alias, target] of imports.importedNames) {
      const functionKey = `${target.module}:${target.name}`;
      if (definitions.has(functionKey)) {
        importedFunctions.set(alias, functionKey);
        participants.add(functionKey);
        testEdges.push({
          from: `test:${file.path}`,
          to: `fn:${functionKey}`,
          type: "tests_function",
          evidence: file.path,
          start_line: 1,
          end_line: 1,
          symbol: target.name,
          detector: "python_source",
          layer: "generated",
        });
      } else if ([...classMethods.keys()].some((key) => key.startsWith(`${target.module}:${target.name}:`))) {
        importedClasses.set(alias, target);
      }
    }

    const instances = new Map<string, { module: string; name: string }>();
    for (const [index, line] of file.content.split("\n").entries()) {
      const assignment = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?::[^=]+)?=\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
      if (assignment && importedClasses.has(assignment[2])) {
        instances.set(assignment[1], importedClasses.get(assignment[2])!);
      }

      const constructorMethod = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\([^\n)]*\)\.([A-Za-z_][A-Za-z0-9_]*)/g;
      for (const match of line.matchAll(constructorMethod)) {
        const classRef = importedClasses.get(match[1]);
        const targetKey = classRef ? classMethods.get(`${classRef.module}:${classRef.name}:${match[2]}`) : undefined;
        if (!targetKey) continue;
        participants.add(targetKey);
        testEdges.push({
          from: `test:${file.path}`,
          to: `fn:${targetKey}`,
          type: "tests_function",
          evidence: file.path,
          start_line: index + 1,
          end_line: index + 1,
          symbol: match[2],
          detector: "python_source",
          layer: "generated",
        });
      }

      const attribute = /\b([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)/g;
      for (const match of line.matchAll(attribute)) {
        const classRef = importedClasses.get(match[1]) ?? instances.get(match[1]);
        let targetKey = classRef ? classMethods.get(`${classRef.module}:${classRef.name}:${match[2]}`) : undefined;
        if (!targetKey) {
          const importedModule = imports.importedModules.get(match[1]);
          const candidate = importedModule ? `${importedModule}:${match[2]}` : "";
          if (candidate && definitions.has(candidate)) targetKey = candidate;
        }
        if (!targetKey) continue;
        participants.add(targetKey);
        testEdges.push({
          from: `test:${file.path}`,
          to: `fn:${targetKey}`,
          type: "tests_function",
          evidence: file.path,
          start_line: index + 1,
          end_line: index + 1,
          symbol: match[2],
          detector: "python_source",
          layer: "generated",
        });
      }
    }
  }

  for (const symbol of definitionsList) {
    if (symbol.node.route_handler === true || symbol.name === "main") participants.add(symbol.key);
  }

  const nodes = [...participants]
    .sort()
    .map((key) => definitions.get(key)!.node);
  const emitted = new Set(nodes.map((node) => node.id));
  const edges = [...callEdges, ...testEdges, ...bindingEdges].filter(
    (edge) => emitted.has(edge.to) || edge.type === "declares_binding" || edge.type === "binds_callable",
  );

  const declaredBindings = new Set(edges.filter((edge) => edge.type === "declares_binding").map((edge) => edge.to));
  const keptBindings = bindingNodes.filter((node) => declaredBindings.has(node.id));

  for (const key of [...participants].sort()) {
    const symbol = definitions.get(key)!;
    const parent = pythonBySource.get(symbol.source);
    if (!parent) continue;
    edges.push({
      from: parent,
      to: symbol.node.id,
      type: "defines_function",
      evidence: symbol.source,
      start_line: symbol.startLine,
      end_line: symbol.endLine,
      symbol: symbol.qualifiedName,
      detector: "python_source",
      layer: "generated",
    });
  }

  const uniqueNodes = new Map<string, GraphNode>();
  for (const node of [...nodes, ...keptBindings]) uniqueNodes.set(node.id, node);
  const uniqueEdges = new Map<string, GraphEdge>();
  for (const edge of edges) uniqueEdges.set(JSON.stringify(edge), edge);

  return {
    nodes: [...uniqueNodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...uniqueEdges.values()].sort(
      (a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.type.localeCompare(b.type),
    ),
  };
}
