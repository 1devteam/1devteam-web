import type { FileInput, GraphEdge, GraphNode } from "./types.ts";

export function attachEvidenceAnchors(files: FileInput[], nodes: GraphNode[], edges: GraphEdge[]) {
  const byPath = new Map(files.map((file) => [file.path, file.content]));
  const count = (source: string) => Math.max(1, (byPath.get(source) ?? "").split("\n").length);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  for (const node of nodes) {
    const source = node.source;
    if (!source || !byPath.has(source)) continue;
    const lineValue = node.start_line ?? node.line;
    const precise = typeof lineValue === "number";
    const start = precise ? Number(lineValue) : 1;
    const end = typeof node.end_line === "number" ? Number(node.end_line) : precise ? start : count(source);
    node.evidence_anchor = {
      source,
      start_line: start,
      end_line: Math.max(start, end),
      symbol: node.name ?? node.handler ?? node.label,
      detector: node.detector ?? "source_inventory",
      precision: precise ? "line" : "file",
    };
  }

  for (const edge of edges) {
    const source = edge.evidence;
    if (!source || !byPath.has(source)) continue;
    const target = nodeById.get(edge.to);
    let start = typeof edge.start_line === "number" ? Number(edge.start_line) : undefined;
    let end = typeof edge.end_line === "number" ? Number(edge.end_line) : undefined;
    if (start === undefined && target?.source === source) {
      const candidate = target.start_line ?? target.line;
      if (typeof candidate === "number") {
        start = Number(candidate);
        end = typeof target.end_line === "number" ? Number(target.end_line) : start;
      }
    }
    const precise = start !== undefined;
    const startValue = start ?? 1;
    edge.evidence_anchor = {
      source,
      start_line: startValue,
      end_line: Math.max(startValue, end ?? (precise ? startValue : count(source))),
      symbol: edge.symbol ?? target?.name ?? target?.handler ?? target?.label,
      detector: edge.detector ?? (precise ? "target_declaration" : "source_relationship"),
      precision: precise ? "line" : "file",
    };
  }
}
