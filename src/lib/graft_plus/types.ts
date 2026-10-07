export type FileInput = { path: string; content: string };

export type GraphNode = {
  id: string;
  type: string;
  source: string;
  layer: "generated" | "overlay";
  [key: string]: unknown;
};

export type GraphEdge = {
  from: string;
  to: string;
  type: string;
  evidence: string;
  layer: "generated" | "overlay";
  [key: string]: unknown;
};

export type UnresolvedReference = { specifier: string; from: string };
