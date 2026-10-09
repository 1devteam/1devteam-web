import { classifyUnresolvedReference } from "./residuals.ts";
import type { GraphEdge, GraphNode } from "./types.ts";

const TEST_EDGE_TYPES = new Set(["tests", "tests_function"]);
const STATIC_EDGE_TYPE = "imports";

export function auditGraph(
  graph: { nodes: GraphNode[]; edges: GraphEdge[]; facts: Record<string, unknown> },
  files: Set<string>,
) {
  const counts = new Map<string, number>();
  for (const node of graph.nodes) counts.set(node.id, (counts.get(node.id) ?? 0) + 1);
  const duplicateNodeIds = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id)
    .sort();
  const identityCollisionCount = [...counts.values()]
    .filter((count) => count > 1)
    .reduce((total, count) => total + count - 1, 0);

  const known = new Set(graph.nodes.map((node) => node.id));
  const undefinedEdgeEndpoints = [
    ...new Set(
      graph.edges
        .flatMap((edge) => [edge.from, edge.to])
        .filter((endpoint) => !known.has(endpoint)),
    ),
  ].sort();

  const mappedSources = new Set(
    graph.nodes.map((node) => node.source).filter((source): source is string => Boolean(source)),
  );
  const unmappedSourceFiles = [...files].filter((source) => !mappedSources.has(source)).sort();
  const staleGraphSources = graph.nodes
    .filter((node) => node.source && !files.has(node.source))
    .map((node) => ({ id: node.id, source: node.source }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const unresolved =
    (graph.facts.unresolved_imports as Array<{ specifier: string; from: string }> | undefined) ?? [];
  const unresolvedClasses: Record<string, number> = {};
  for (const row of unresolved) {
    const classification = classifyUnresolvedReference(row.specifier, row.from);
    unresolvedClasses[classification] = (unresolvedClasses[classification] ?? 0) + 1;
  }

  const missingSemanticEdgeEvidence: string[] = [];
  for (const edge of graph.edges) {
    if (edge.type === STATIC_EDGE_TYPE || TEST_EDGE_TYPES.has(edge.type)) continue;
    if (!edge.evidence || !files.has(edge.evidence)) {
      missingSemanticEdgeEvidence.push(
        edge.evidence || `${edge.from}->${edge.to}:${edge.type}`,
      );
    }
  }

  const overlayNodes = graph.nodes.filter((node) => node.layer === "overlay");
  const facts = graph.facts;
  const residuals = {
    overlay: overlayNodes.length ? "attached" : "residual",
    identity_collision_count: identityCollisionCount,
    duplicate_node_ids: duplicateNodeIds,
    unresolved_import_count: unresolved.length,
    unresolved_import_classes: Object.fromEntries(
      Object.entries(unresolvedClasses).sort(([a], [b]) => a.localeCompare(b)),
    ),
    unresolved_package_roots: facts.unresolved_package_roots ?? [],
    unmapped_source_file_count: unmappedSourceFiles.length,
    unmapped_source_files: unmappedSourceFiles,
    relationship_unparsed_file_count: Number(facts.relationship_unparsed_file_count ?? 0),
    relationship_unparsed_files: facts.relationship_unparsed_files ?? [],
    relationship_boundary_count: Number(facts.relationship_boundary_count ?? 0),
    unresolved_relationship_boundary_count: Number(
      facts.unresolved_relationship_boundary_count ?? 0,
    ),
    relationship_boundary_counts_by_kind: facts.relationship_boundary_counts_by_kind ?? {},
    relationship_boundaries: facts.relationship_boundaries ?? [],
    evidence_precision_counts: facts.evidence_precision_counts ?? {},
    contract_source_count: Number(facts.contract_source_count ?? 0),
    contract_declaration_count: Number(facts.contract_declaration_count ?? 0),
    contract_declaration_counts_by_kind: facts.contract_declaration_counts_by_kind ?? {},
    configuration_key_count: Number(facts.configuration_key_count ?? 0),
    deployment_fact_count: Number(facts.deployment_fact_count ?? 0),
    deployment_fact_counts_by_kind: facts.deployment_fact_counts_by_kind ?? {},
    subsystem_count: Number(facts.subsystem_count ?? 0),
    subsystem_direct_member_counts: facts.subsystem_direct_member_counts ?? {},
    cross_language_subsystem_count: Number(facts.cross_language_subsystem_count ?? 0),
    cross_language_subsystems: facts.cross_language_subsystems ?? [],
    build_definition_count: Number(facts.build_definition_count ?? 0),
    build_definition_counts_by_system: facts.build_definition_counts_by_system ?? {},
    build_input_edge_count: Number(facts.build_input_edge_count ?? 0),
    governance_boundary_count: Number(facts.governance_boundary_count ?? 0),
    governance_boundary_counts_by_kind: facts.governance_boundary_counts_by_kind ?? {},
    source_provenance_counts: facts.source_provenance_counts ?? {},
    stale_graph_source_count: staleGraphSources.length,
    stale_graph_sources: staleGraphSources,
    known_violations: [] as string[],
    unacknowledged_blocking_findings: [] as string[],
    note:
      "Residuals stay visible. An acknowledgement is not a repair. Overlay stays residual until a reviewed relationship is attached.",
  };

  const integrityPass =
    duplicateNodeIds.length === 0 &&
    undefinedEdgeEndpoints.length === 0 &&
    missingSemanticEdgeEvidence.length === 0;

  return {
    schema_version: "1.4",
    role: "instrument-integrity",
    integrity_pass: integrityPass,
    identity_integrity_pass: duplicateNodeIds.length === 0,
    duplicate_node_ids: duplicateNodeIds,
    identity_collision_count: identityCollisionCount,
    undefined_edge_endpoints: undefinedEdgeEndpoints,
    semantic_findings: [] as unknown[],
    unacknowledged_blocking_findings: [] as string[],
    acknowledged_findings: [] as string[],
    integrity: {
      identity_integrity_pass: duplicateNodeIds.length === 0,
      duplicate_node_ids: duplicateNodeIds,
      identity_collision_count: identityCollisionCount,
      missing_semantic_edge_evidence: [...new Set(missingSemanticEdgeEvidence)].sort(),
      unacknowledged_blocking_findings: [] as string[],
      acknowledged_semantic_findings: [] as string[],
      known_violations: [] as string[],
      semantic_finding_count: 0,
      unmapped_source_file_count: unmappedSourceFiles.length,
      relationship_unparsed_file_count: Number(facts.relationship_unparsed_file_count ?? 0),
      evidence_precision_counts: facts.evidence_precision_counts ?? {},
      unresolved_relationship_boundary_count: Number(
        facts.unresolved_relationship_boundary_count ?? 0,
      ),
      stale_graph_source_count: staleGraphSources.length,
      pass: integrityPass,
    },
    residuals,
    note:
      "An acknowledgement means the detector already knows the finding. It is not a repair.",
  };
}
