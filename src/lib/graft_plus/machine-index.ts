import type { GraphEdge, GraphNode } from "./types.ts";
import type { UnresolvedLedger } from "./residuals.ts";

const STRUCTURAL_EDGE_TYPES = new Set([
  "member_of_subsystem",
  "governs_build_of",
  "governs_boundary_of",
  "declared_in",
  "defines_function",
  "defines_contract",
]);

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function top(
  counts: Map<string, number>,
  nodes: Map<string, GraphNode>,
  field: string,
  limit = 64,
) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .flatMap(([id, count]) => {
      const node = nodes.get(id);
      return node ? [{ id, type: node.type, source: node.source, [field]: count }] : [];
    });
}

export function buildMachineIndex(
  graph: { nodes: GraphNode[]; edges: GraphEdge[] },
  ledger: UnresolvedLedger,
) {
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const fanIn = new Map<string, number>();
  const fanOut = new Map<string, number>();
  const depIn = new Map<string, number>();
  const depOut = new Map<string, number>();
  const crossings = new Map<string, { from_subsystem: string; to_subsystem: string; edge_type: string; count: number }>();

  for (const edge of graph.edges) {
    increment(fanOut, edge.from);
    increment(fanIn, edge.to);
    if (!STRUCTURAL_EDGE_TYPES.has(edge.type)) {
      increment(depOut, edge.from);
      increment(depIn, edge.to);
    }
    const fromSubsystem = String(nodes.get(edge.from)?.subsystem ?? "");
    const toSubsystem = String(nodes.get(edge.to)?.subsystem ?? "");
    if (fromSubsystem && toSubsystem && fromSubsystem !== toSubsystem) {
      const key = `${fromSubsystem}\0${toSubsystem}\0${edge.type}`;
      const row = crossings.get(key) ?? {
        from_subsystem: fromSubsystem,
        to_subsystem: toSubsystem,
        edge_type: edge.type,
        count: 0,
      };
      row.count += 1;
      crossings.set(key, row);
    }
  }

  const incident = new Set([...fanIn.keys(), ...fanOut.keys()]);
  const nodeTypeCounts = new Map<string, number>();
  const edgeTypeCounts = new Map<string, number>();
  for (const node of graph.nodes) increment(nodeTypeCounts, node.type || "unknown");
  for (const edge of graph.edges) increment(edgeTypeCounts, edge.type || "unknown");

  const contracts = new Map<string, number>();
  const build = new Map<string, number>();
  for (const node of graph.nodes) {
    if (["contract", "contract_source"].includes(node.type) && (depIn.get(node.id) ?? 0) > 0) {
      contracts.set(node.id, depIn.get(node.id)!);
    }
    if (["build_definition", "build_target"].includes(node.type) && (depOut.get(node.id) ?? 0) > 0) {
      build.set(node.id, depOut.get(node.id)!);
    }
  }

  return {
    schema_version: "1.0",
    product: "G.R.A.F.T.+",
    role: "machine-topology-index",
    direction: "consumer-to-dependency",
    node_count: graph.nodes.length,
    edge_count: graph.edges.length,
    node_type_counts: Object.fromEntries([...nodeTypeCounts.entries()].sort()),
    edge_type_counts: Object.fromEntries([...edgeTypeCounts.entries()].sort()),
    top_fan_in: top(fanIn, nodes, "fan_in"),
    top_fan_out: top(fanOut, nodes, "fan_out"),
    top_dependency_fan_in: top(depIn, nodes, "dependency_fan_in"),
    top_dependency_fan_out: top(depOut, nodes, "dependency_fan_out"),
    contract_hubs: top(contracts, nodes, "dependency_fan_in", 32),
    build_hubs: top(build, nodes, "dependency_fan_out", 32),
    cross_subsystem_edges: [...crossings.values()]
      .sort((a, b) => b.count - a.count || a.from_subsystem.localeCompare(b.from_subsystem))
      .slice(0, 128),
    isolated_node_count: graph.nodes.filter((node) => !incident.has(node.id)).length,
    isolated_node_sample: graph.nodes.filter((node) => !incident.has(node.id)).map((node) => node.id).sort().slice(0, 128),
    unresolved: {
      reference_count: ledger.reference_count,
      unique_specifier_count: ledger.unique_specifier_count,
      unique_source_count: ledger.unique_source_count,
      class_counts: ledger.class_counts,
      top_specifiers: ledger.top_specifiers,
      top_sources: ledger.top_sources,
    },
    negatives: [
      "High degree is a structural signal, not a defect.",
      "A hub is not a refactor recommendation.",
      "Cross-subsystem traffic is evidence of coupling, not proof of improper coupling.",
    ],
  };
}
