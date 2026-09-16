/**
 * Browser port of 1devteam/graft_plus reconstruct.
 * Generated structure + completeness + impact + proof + decision.
 * No source dump. No Ajenda domain rules. Never merge authority.
 */

export const MERGE_AUTHORIZATION = "not-determined" as const;
export const IMPLEMENTS_PLAN = false;
export const GRANTS_EXECUTION_AUTHORITY = false;

export type FileInput = { path: string; content: string };

type Node = { id: string; type: string; source: string };
type Edge = { from: string; to: string; type: string; evidence: string };

const PY_IMPORT = /^\s*(?:from|import)\s+([A-Za-z0-9_\.]+)/gm;
const FE_IMPORT = /(?:import|export)\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/g;
const SKIP = /(^|\/)(node_modules|dist|build|\.venv|venv|__pycache__|\.git)(\/|$)/;

function skip(path: string): boolean {
  return SKIP.test(path) || path.includes("/fixtures/");
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

function pythonGraph(files: FileInput[]): { nodes: Node[]; edges: Edge[] } {
  const py = files.filter((f) => f.path.endsWith(".py") && !skip(f.path) && !f.path.startsWith("tests/"));
  const moduleByPath = new Map(py.map((f) => [f.path, moduleFor(f.path)]));
  const modules = new Set([...moduleByPath.values()].filter(Boolean));
  const prefixes = [...new Set([...modules].map((m) => m.split(".")[0]).filter(Boolean))];
  const nodes: Node[] = [...moduleByPath.entries()]
    .filter(([, m]) => m)
    .map(([path, module]) => ({ id: `py:${module}`, type: "python_module", source: path }));
  const edges: Edge[] = [];
  for (const file of py) {
    const module = moduleByPath.get(file.path);
    if (!module) continue;
    PY_IMPORT.lastIndex = 0;
    let match: RegExpExecArray | null;
    const imported = new Set<string>();
    while ((match = PY_IMPORT.exec(file.content))) {
      const name = match[1];
      if (prefixes.length && !prefixes.some((p) => name === p || name.startsWith(`${p}.`))) continue;
      const target = bestTarget(name, modules);
      if (target && target !== module) imported.add(target);
    }
    for (const target of imported) {
      edges.push({ from: `py:${module}`, to: `py:${target}`, type: "imports", evidence: file.path });
    }
  }
  return { nodes, edges };
}

function testGraph(files: FileInput[], production: Set<string>): { nodes: Node[]; edges: Edge[] } {
  const tests = files.filter((f) => f.path.startsWith("tests/") && f.path.endsWith(".py") && !skip(f.path));
  const prefixes = [...new Set([...production].map((m) => m.split(".")[0]).filter(Boolean))];
  const nodes: Node[] = tests.map((f) => ({ id: `test:${f.path}`, type: "test_module", source: f.path }));
  const edges: Edge[] = [];
  for (const file of tests) {
    PY_IMPORT.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = PY_IMPORT.exec(file.content))) {
      const name = match[1];
      if (prefixes.length && !prefixes.some((p) => name === p || name.startsWith(`${p}.`))) continue;
      const target = bestTarget(name, production);
      if (target) edges.push({ from: `test:${file.path}`, to: `py:${target}`, type: "tests", evidence: file.path });
    }
  }
  return { nodes, edges };
}

function frontendGraph(files: FileInput[]): { nodes: Node[]; edges: Edge[] } {
  const fe = files.filter((f) => /\.(ts|tsx)$/.test(f.path) && !skip(f.path) && !f.path.endsWith(".d.ts"));
  const set = new Set(fe.map((f) => f.path));
  const nodes: Node[] = fe.map((f) => ({ id: `fe:${f.path}`, type: "frontend_module", source: f.path }));
  const edges: Edge[] = [];
  for (const file of fe) {
    FE_IMPORT.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = FE_IMPORT.exec(file.content))) {
      const spec = match[1];
      if (!spec.startsWith(".")) continue;
      const parent = file.path.split("/").slice(0, -1).join("/");
      const raw = `${parent}/${spec}`.replace(/\/\.\//g, "/");
      const cands = [raw, `${raw}.ts`, `${raw}.tsx`, `${raw}/index.ts`, `${raw}/index.tsx`];
      const hit = cands.find((c) => set.has(c));
      if (hit && hit !== file.path) {
        edges.push({ from: `fe:${file.path}`, to: `fe:${hit}`, type: "imports", evidence: file.path });
      }
    }
  }
  return { nodes, edges };
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
  const nodes = [...py.nodes, ...fe.nodes, ...tests.nodes];
  const edges = [...py.edges, ...fe.edges, ...tests.edges];
  const known = new Set(nodes.map((n) => n.id));
  const missing = [...new Set(edges.flatMap((e) => [e.from, e.to]).filter((id) => !known.has(id)))].sort();
  const graph = {
    schema_version: "1.0",
    product: "G.R.A.F.T.+",
    package: "graft_plus",
    role: "fact-substrate",
    implementsPlan: IMPLEMENTS_PLAN,
    grants_execution_authority: GRANTS_EXECUTION_AUTHORITY,
    nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)),
    edges: edges.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to)),
    metrics: {
      node_count: nodes.length,
      edge_count: edges.length,
      edge_counts_by_type: edges.reduce<Record<string, number>>((acc, e) => {
        acc[e.type] = (acc[e.type] ?? 0) + 1;
        return acc;
      }, {}),
    },
  };
  const completeness = {
    schema_version: "1.0",
    integrity_pass: missing.length === 0,
    undefined_edge_endpoints: missing,
    unacknowledged_blocking_findings: [] as string[],
    node_count: nodes.length,
    edge_count: edges.length,
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
  const disposition = completeness.integrity_pass ? "clear" : "blocked";
  const decision = {
    schema_version: "1.0",
    product: "G.R.A.F.T.+",
    package: "graft_plus",
    role: "fact-substrate",
    decision: {
      architecture_disposition: disposition,
      merge_authorization: MERGE_AUTHORIZATION,
      full_ci_required: true,
      blocking_reasons: missing.length ? ["undefined_edge_endpoints"] : [],
      review_reasons: [] as string[],
      warnings: [] as string[],
    },
    grants_execution_authority: GRANTS_EXECUTION_AUTHORITY,
    implementsPlan: IMPLEMENTS_PLAN,
    negatives: [
      "This pack is a map. It is not a plan.",
      "merge_authorization is not-determined even when disposition is clear.",
      "An acknowledgement is not a repair.",
      "Do not invent missing nodes.",
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
