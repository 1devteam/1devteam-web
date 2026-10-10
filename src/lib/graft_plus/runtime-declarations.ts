import type { FileInput, GraphEdge, GraphNode } from "./types.ts";

type CallRecord = {
  name: string;
  args: string;
  startLine: number;
  endLine: number;
};

const ACTION_FIELDS = new Set(["input_model", "provider", "side_effect_class", "credential_requirement"]);
const JOB_IDENTITY_FIELDS = ["job_key", "key", "name", "id"] as const;

function moduleFor(path: string) {
  const parts = path.replace(/\.py$/, "").split("/").filter(Boolean);
  if (parts[0] === "src") parts.shift();
  if (parts.at(-1) === "__init__") parts.pop();
  return parts.join(".");
}

function productionPython(path: string) {
  return path.endsWith(".py") && !/(?:^|\/)(?:tests?|fixtures|migrations|alembic)(?:\/|$)/.test(path);
}

function splitTopLevel(text: string): string[] {
  const result: string[] = [];
  let start = 0;
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if ("([{".includes(char)) depth += 1;
    else if (")]}".includes(char)) depth = Math.max(0, depth - 1);
    else if (char === "," && depth === 0) {
      result.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  const tail = text.slice(start).trim();
  if (tail) result.push(tail);
  return result;
}

function declaredValue(raw: string): unknown {
  const value = raw.trim();
  const quoted = value.match(/^(['"])([\s\S]*)\1$/);
  if (quoted) return quoted[2];
  if (value === "True" || value === "true") return true;
  if (value === "False" || value === "false") return false;
  if (value === "None" || value === "null") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (/^[A-Za-z_][A-Za-z0-9_.]*$/.test(value)) return { symbol: value };

  const collection = value.match(/^[([{]([\s\S]*)[)\]}]$/);
  if (collection) return splitTopLevel(collection[1]).map((item) => declaredValue(item));

  const call = value.match(/^([A-Za-z_][A-Za-z0-9_.]*)\s*\(([\s\S]*)\)$/);
  if (call) {
    const keywords: Record<string, unknown> = {};
    for (const part of splitTopLevel(call[2])) {
      const assignment = part.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]+)$/);
      if (assignment) keywords[assignment[1]] = declaredValue(assignment[2]);
    }
    return Object.keys(keywords).length ? { call: call[1], keywords } : { call: call[1] };
  }
  return { expression: value.slice(0, 240) };
}

function keywordMap(args: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const part of splitTopLevel(args)) {
    const assignment = part.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]+)$/);
    if (assignment) result[assignment[1]] = declaredValue(assignment[2]);
  }
  return result;
}

function literalString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function literalStrings(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value as string[]
    : typeof value === "string"
      ? [value]
      : [];
}

function symbolName(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof (value as { symbol?: unknown }).symbol === "string") {
    return (value as { symbol: string }).symbol;
  }
}

function findCalls(content: string): CallRecord[] {
  const result: CallRecord[] = [];
  const nameRe = /[A-Za-z_][A-Za-z0-9_.]*/y;
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]!;
    if (!/[A-Za-z_]/.test(char)) continue;
    nameRe.lastIndex = index;
    const nameMatch = nameRe.exec(content);
    if (!nameMatch) continue;
    const name = nameMatch[0];
    let cursor = nameRe.lastIndex;
    while (/\s/.test(content[cursor] ?? "")) cursor += 1;
    if (content[cursor] !== "(") {
      index = nameRe.lastIndex - 1;
      continue;
    }

    let depth = 1;
    let quote = "";
    let escaped = false;
    let end = cursor + 1;
    for (; end < content.length; end += 1) {
      const current = content[end]!;
      if (quote) {
        if (escaped) escaped = false;
        else if (current === "\\") escaped = true;
        else if (current === quote) quote = "";
        continue;
      }
      if (current === "'" || current === '"') {
        quote = current;
        continue;
      }
      if (current === "(") depth += 1;
      else if (current === ")") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    if (depth !== 0) continue;
    const startLine = content.slice(0, index).split("\n").length;
    const endLine = content.slice(0, end + 1).split("\n").length;
    result.push({ name, args: content.slice(cursor + 1, end), startLine, endLine });
    index = end;
  }
  return result;
}

function addOrMerge(nodes: Map<string, GraphNode>, node: GraphNode) {
  const existing = nodes.get(node.id);
  if (!existing) {
    nodes.set(node.id, node);
    return;
  }
  const sources = [...new Set([
    String(existing.source ?? ""),
    String(node.source ?? ""),
    ...((existing.sources as string[] | undefined) ?? []),
    ...((node.sources as string[] | undefined) ?? []),
  ].filter(Boolean))].sort();
  Object.assign(existing, node);
  if (sources.length) existing.source = sources[0]!;
  if (sources.length > 1) existing.sources = sources;
}

function actionContracts(functionNodes: GraphNode[]) {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const actions = new Map<string, GraphNode>();

  for (const binding of functionNodes) {
    if (binding.type !== "callable_binding" || typeof binding.name !== "string") continue;
    const fields = binding.declared_fields && typeof binding.declared_fields === "object"
      ? binding.declared_fields as Record<string, unknown>
      : {};
    const constructor = String(binding.constructor ?? "");
    const actionish = constructor.toLowerCase().includes("action") || [...ACTION_FIELDS].some((key) => key in fields);
    if (!actionish) continue;

    const actionId = `action:${binding.name}`;
    const action: GraphNode = {
      id: actionId,
      type: "runtime_action",
      source: binding.source,
      layer: "generated",
      name: binding.name,
      constructor,
      declared_fields: fields,
      detector: "python_literal_runtime_declaration",
    };
    addOrMerge(nodes, action);
    actions.set(binding.name, nodes.get(actionId)!);
    edges.push({
      from: actionId,
      to: binding.id,
      type: "declared_by",
      evidence: binding.source,
      start_line: binding.start_line,
      end_line: binding.end_line,
      detector: "python_literal_runtime_declaration",
      layer: "generated",
    });

    const inputModel = symbolName(fields.input_model);
    if (inputModel) {
      const id = `input-contract:${inputModel}`;
      addOrMerge(nodes, {
        id,
        type: "runtime_input_contract",
        source: binding.source,
        layer: "generated",
        name: inputModel,
        detector: "python_literal_runtime_declaration",
      });
      edges.push({
        from: actionId,
        to: id,
        type: "declares_input_model",
        evidence: binding.source,
        detector: "python_literal_runtime_declaration",
        layer: "generated",
      });
    }

    const sideEffect = symbolName(fields.side_effect_class);
    if (sideEffect) {
      const id = `side-effect-class:${sideEffect}`;
      addOrMerge(nodes, {
        id,
        type: "side_effect_class",
        source: binding.source,
        layer: "generated",
        name: sideEffect,
        detector: "python_literal_runtime_declaration",
      });
      edges.push({
        from: actionId,
        to: id,
        type: "declares_side_effect_class",
        evidence: binding.source,
        detector: "python_literal_runtime_declaration",
        layer: "generated",
      });
    }

    const provider = literalString(fields.provider);
    if (provider) {
      const id = `provider:${provider}`;
      addOrMerge(nodes, {
        id,
        type: "runtime_provider",
        source: binding.source,
        layer: "generated",
        name: provider,
        detector: "python_literal_runtime_declaration",
      });
      edges.push({
        from: actionId,
        to: id,
        type: "uses_provider",
        evidence: binding.source,
        detector: "python_literal_runtime_declaration",
        layer: "generated",
      });
    }

    const credential = fields.credential_requirement;
    if (credential && typeof credential === "object") {
      const id = `credential-requirement:${binding.name}`;
      addOrMerge(nodes, {
        id,
        type: "credential_requirement",
        source: binding.source,
        layer: "generated",
        name: binding.name,
        declaration: credential,
        detector: "python_literal_runtime_declaration",
      });
      edges.push({
        from: actionId,
        to: id,
        type: "requires_credential",
        evidence: binding.source,
        detector: "python_literal_runtime_declaration",
        layer: "generated",
      });
      const keywords = (credential as { keywords?: unknown }).keywords;
      const credentialProvider = keywords && typeof keywords === "object"
        ? literalString((keywords as Record<string, unknown>).provider)
        : undefined;
      if (credentialProvider) {
        const providerId = `provider:${credentialProvider}`;
        addOrMerge(nodes, {
          id: providerId,
          type: "runtime_provider",
          source: binding.source,
          layer: "generated",
          name: credentialProvider,
          detector: "python_literal_runtime_declaration",
        });
        edges.push({
          from: id,
          to: providerId,
          type: "credential_for_provider",
          evidence: binding.source,
          detector: "python_literal_runtime_declaration",
          layer: "generated",
        });
      }
    }
  }
  return { nodes, edges, actions };
}

export function collectRuntimeDeclarations(files: FileInput[], functionNodes: GraphNode[]) {
  const actionLayer = actionContracts(functionNodes);
  const nodes = new Map(actionLayer.nodes);
  const edges: GraphEdge[] = [...actionLayer.edges];
  const jobs: Array<{
    key: string;
    source: string;
    module: string;
    constructor: string;
    fields: Record<string, unknown>;
    requiredInputs: string[];
    producedOutputs: string[];
    candidateActions: string[];
    dependencies: Array<{ key: string; kind?: string }>;
    startLine: number;
    endLine: number;
  }> = [];

  for (const file of files.filter((item) => productionPython(item.path))) {
    for (const call of findCalls(file.content)) {
      const fields = keywordMap(call.args);
      const hasJobShape = "candidate_actions" in fields || ("required_inputs" in fields && "produced_outputs" in fields);
      if (!hasJobShape) continue;
      const key = JOB_IDENTITY_FIELDS.map((field) => literalString(fields[field])).find(Boolean);
      if (!key) continue;

      const dependencies: Array<{ key: string; kind?: string }> = [];
      const rawDependencies = fields.dependencies;
      if (Array.isArray(rawDependencies)) {
        for (const row of rawDependencies) {
          if (!row || typeof row !== "object") continue;
          const keywords = (row as { keywords?: unknown }).keywords;
          if (!keywords || typeof keywords !== "object") continue;
          const keywordRecord = keywords as Record<string, unknown>;
          const dependencyKey = JOB_IDENTITY_FIELDS.map((field) => literalString(keywordRecord[field])).find(Boolean);
          if (!dependencyKey) continue;
          dependencies.push({ key: dependencyKey, kind: literalString(keywordRecord.kind) });
        }
      }

      jobs.push({
        key,
        source: file.path,
        module: moduleFor(file.path),
        constructor: call.name,
        fields,
        requiredInputs: literalStrings(fields.required_inputs),
        producedOutputs: literalStrings(fields.produced_outputs),
        candidateActions: literalStrings(fields.candidate_actions),
        dependencies,
        startLine: call.startLine,
        endLine: call.endLine,
      });
    }
  }

  const declaredJobs = new Set(jobs.map((job) => job.key));
  const producedOutputs = new Set(jobs.flatMap((job) => job.producedOutputs));

  for (const job of jobs) {
    const jobId = `job:${job.key}`;
    addOrMerge(nodes, {
      id: jobId,
      type: "business_job",
      source: job.source,
      layer: "generated",
      name: job.key,
      constructor: job.constructor,
      declared_fields: job.fields,
      start_line: job.startLine,
      end_line: job.endLine,
      detector: "python_literal_runtime_declaration",
    });
    edges.push({
      from: jobId,
      to: `py:${job.module}`,
      type: "declared_in",
      evidence: job.source,
      start_line: job.startLine,
      end_line: job.endLine,
      detector: "python_literal_runtime_declaration",
      layer: "generated",
    });

    for (const output of job.producedOutputs) {
      const id = `artifact:${output}`;
      addOrMerge(nodes, {
        id,
        type: "runtime_artifact",
        source: job.source,
        layer: "generated",
        name: output,
        detector: "python_literal_runtime_declaration",
      });
      edges.push({
        from: id,
        to: jobId,
        type: "produced_by",
        evidence: job.source,
        detector: "python_literal_runtime_declaration",
        layer: "generated",
      });
    }

    for (const input of job.requiredInputs) {
      const artifact = producedOutputs.has(input);
      const id = artifact ? `artifact:${input}` : `input:${input}`;
      addOrMerge(nodes, {
        id,
        type: artifact ? "runtime_artifact" : "runtime_input",
        source: job.source,
        layer: "generated",
        name: input,
        detector: "python_literal_runtime_declaration",
      });
      edges.push({
        from: jobId,
        to: id,
        type: artifact ? "requires_artifact" : "requires_input",
        evidence: job.source,
        detector: "python_literal_runtime_declaration",
        layer: "generated",
      });
    }

    for (const actionName of job.candidateActions) {
      const id = `action:${actionName}`;
      addOrMerge(nodes, actionLayer.actions.get(actionName) ?? {
        id,
        type: "runtime_action",
        source: job.source,
        layer: "generated",
        name: actionName,
        observation: "candidate_action",
        detector: "python_literal_runtime_declaration",
      });
      edges.push({
        from: jobId,
        to: id,
        type: "candidate_action",
        evidence: job.source,
        detector: "python_literal_runtime_declaration",
        layer: "generated",
      });
    }

    for (const dependency of job.dependencies) {
      const id = `job:${dependency.key}`;
      if (!declaredJobs.has(dependency.key)) {
        addOrMerge(nodes, {
          id,
          type: "business_job_reference",
          source: job.source,
          layer: "generated",
          name: dependency.key,
          detector: "python_literal_runtime_declaration",
        });
      }
      edges.push({
        from: jobId,
        to: id,
        type: "depends_on_job",
        evidence: job.source,
        dependency_kind: dependency.kind,
        detector: "python_literal_runtime_declaration",
        layer: "generated",
      });
    }
  }

  const counts: Record<string, number> = {};
  for (const node of nodes.values()) counts[node.type] = (counts[node.type] ?? 0) + 1;
  return {
    nodes: [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    edges: edges.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.type.localeCompare(b.type)),
    facts: {
      runtime_declaration_node_counts: Object.fromEntries(Object.entries(counts).sort()),
      runtime_declaration_edge_count: edges.length,
    },
  };
}
