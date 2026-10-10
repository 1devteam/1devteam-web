import type { FileInput, GraphEdge, GraphNode } from "./types.ts";

export type ReviewedOverlay = {
  schema_version?: string;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  invariants?: unknown[];
  function_roots?: Array<string | { path?: string; source?: string }>;
  [key: string]: unknown;
};

const CONVENTIONAL_OVERLAYS = [
  "docs/contracts/dependency-graph.overlay.v1.json",
  ".graft/dependency-graph.overlay.v1.json",
  ".graft/overlay.json",
] as const;

function functionRoots(overlay: ReviewedOverlay): string[] {
  const result = new Set<string>();
  for (const item of overlay.function_roots ?? []) {
    const value =
      typeof item === "string"
        ? item
        : item && typeof item === "object"
          ? item.path ?? item.source
          : undefined;
    if (typeof value === "string" && value.replace(/^\/+|\/+$/g, "")) {
      result.add(value.replace(/^\/+|\/+$/g, ""));
    }
  }
  return [...result].sort();
}

export function discoverReviewedOverlay(files: FileInput[]) {
  for (const path of CONVENTIONAL_OVERLAYS) {
    const file = files.find((item) => item.path === path);
    if (!file) continue;
    const parsed = JSON.parse(file.content) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`overlay root must be an object: ${path}`);
    }
    const overlay = parsed as ReviewedOverlay;
    const nodes = (overlay.nodes ?? []).map((node) => ({
      ...node,
      layer: node.layer ?? "overlay",
    }));
    const edges = (overlay.edges ?? []).map((edge) => ({
      ...edge,
      layer: edge.layer ?? "overlay",
    }));
    return {
      path,
      mode: "repository-discovered" as const,
      overlay,
      nodes,
      edges,
      invariants: overlay.invariants ?? [],
      functionRoots: functionRoots(overlay),
    };
  }
  return {
    path: null,
    mode: "absent" as const,
    overlay: {} as ReviewedOverlay,
    nodes: [] as GraphNode[],
    edges: [] as GraphEdge[],
    invariants: [] as unknown[],
    functionRoots: [] as string[],
  };
}
