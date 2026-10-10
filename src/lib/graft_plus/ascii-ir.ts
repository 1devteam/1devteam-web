import { canonicalJson, sha256Hex } from "./residuals.ts";

export const ASCII_GRAPH_FILE = "dependency-graph.ascii.v1.txt" as const;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const EDGE_CHUNK = 4096;

function width(count: number): number {
  if (count <= 1) return 1;
  let result = 1;
  let capacity = ALPHABET.length;
  while (capacity < count) {
    result += 1;
    capacity *= ALPHABET.length;
  }
  return result;
}

function code(index: number, size: number): string {
  if (index < 0) throw new Error("index must be non-negative");
  const chars = Array(size).fill(ALPHABET[0]);
  let value = index;
  for (let offset = size - 1; offset >= 0; offset -= 1) {
    chars[offset] = ALPHABET[value % ALPHABET.length];
    value = Math.floor(value / ALPHABET.length);
  }
  if (value) throw new Error("index exceeds code width");
  return chars.join("");
}

function escapeValue(value: unknown): string {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("|", "\\p")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r");
}

function splitOnce(value: string, marker: string): [string, string] {
  const index = value.indexOf(marker);
  if (index < 0) throw new Error(`missing ${marker} in ASCII graph row`);
  return [value.slice(0, index), value.slice(index + marker.length)];
}

function unescapeValue(value: string): string {
  let out = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]!;
    if (char !== "\\") {
      out += char;
      continue;
    }
    const marker = value[index + 1];
    if (!marker) throw new Error("trailing escape in ASCII graph");
    if (marker === "\\") out += "\\";
    else if (marker === "p") out += "|";
    else if (marker === "n") out += "\n";
    else if (marker === "r") out += "\r";
    else throw new Error(`unknown ASCII graph escape: ${marker}`);
    index += 1;
  }
  return out;
}

function rankTypes(values: string[]): string[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value]) => value);
}

export function encodeGraphAscii(graph: {
  nodes?: Array<Record<string, unknown>>;
  edges?: Array<Record<string, unknown>>;
}): string {
  const nodes = [...(graph.nodes ?? [])].sort((a, b) => String(a.id ?? "").localeCompare(String(b.id ?? "")));
  const edges = [...(graph.edges ?? [])].sort(
    (a, b) =>
      String(a.from ?? "").localeCompare(String(b.from ?? "")) ||
      String(a.to ?? "").localeCompare(String(b.to ?? "")) ||
      String(a.type ?? "").localeCompare(String(b.type ?? "")),
  );

  const nodeIds = nodes.map((node) => String(node.id ?? ""));
  if (new Set(nodeIds).size !== nodeIds.length) throw new Error("ASCII graph requires unique node ids");
  const nodeIndex = new Map(nodeIds.map((id, index) => [id, index]));
  const missing = [...new Set(edges.flatMap((edge) => [String(edge.from ?? ""), String(edge.to ?? "")]))]
    .filter((endpoint) => !nodeIndex.has(endpoint))
    .sort();
  if (missing.length) throw new Error(`ASCII graph has undefined edge endpoints: ${missing.join(", ")}`);

  const nodeTypes = rankTypes(nodes.map((node) => String(node.type ?? "")));
  const edgeTypes = rankTypes(edges.map((edge) => String(edge.type ?? "")));
  const sources = [...new Set(nodes.map((node) => String(node.source ?? "")).filter(Boolean))].sort();
  const typeIndex = new Map(nodeTypes.map((value, index) => [value, index]));
  const relationIndex = new Map(edgeTypes.map((value, index) => [value, index]));
  const sourceIndex = new Map(sources.map((value, index) => [value, index]));
  const nodeWidth = width(nodes.length);
  const relationWidth = width(edgeTypes.length);
  const typeWidth = width(nodeTypes.length);
  const sourceWidth = width(sources.length);
  const graphSha = sha256Hex(canonicalJson(graph));

  const lines = [
    `G2|n=${nodes.length}|e=${edges.length}|s=${sources.length}|nw=${nodeWidth}|rw=${relationWidth}|tw=${typeWidth}|sw=${sourceWidth}|d=c>d|h=${graphSha}`,
  ];

  nodeTypes.forEach((value, index) => lines.push(`T${code(index, typeWidth)}=${escapeValue(value)}`));
  edgeTypes.forEach((value, index) => lines.push(`R${code(index, relationWidth)}=${escapeValue(value)}`));
  sources.forEach((value, index) => lines.push(`S${code(index, sourceWidth)}=${escapeValue(value)}`));

  nodes.forEach((node, index) => {
    const source = String(node.source ?? "");
    const fields = [
      escapeValue(node.id),
      code(typeIndex.get(String(node.type ?? ""))!, typeWidth),
      source ? code(sourceIndex.get(source)!, sourceWidth) : "",
      escapeValue(node.subsystem),
      escapeValue(node.layer),
      escapeValue(node.relationship_status),
    ];
    lines.push(`N${code(index, nodeWidth)}=${fields.join("|")}`);
  });

  const edgeStream = edges
    .map(
      (edge) =>
        code(nodeIndex.get(String(edge.from ?? ""))!, nodeWidth) +
        code(relationIndex.get(String(edge.type ?? ""))!, relationWidth) +
        code(nodeIndex.get(String(edge.to ?? ""))!, nodeWidth),
    )
    .join("");

  lines.push(`E=${edgeStream.slice(0, EDGE_CHUNK)}`);
  for (let offset = EDGE_CHUNK; offset < edgeStream.length; offset += EDGE_CHUNK) {
    lines.push(`E+${edgeStream.slice(offset, offset + EDGE_CHUNK)}`);
  }
  return lines.join("\n") + "\n";
}

export function decodeGraphAscii(text: string): {
  schema_version: "ascii-topology-v1" | "ascii-topology-v2";
  direction: string;
  source_graph_sha256: string;
  nodes: Array<Record<string, string>>;
  edges: Array<{ from: string; to: string; type: string }>;
} {
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  if (!lines[0] || !(lines[0].startsWith("G1|") || lines[0].startsWith("G2|"))) {
    throw new Error("unsupported ASCII graph header");
  }
  const version = lines[0].split("|", 1)[0]!;
  const header = Object.fromEntries(lines[0].split("|").slice(1).map((part) => splitOnce(part, "="))) as Record<string, string>;
  const nodeCount = Number(header.n);
  const edgeCount = Number(header.e);
  const nodeWidth = Number(header.nw);
  const relationWidth = Number(header.rw);
  const sourceCount = Number(header.s ?? 0);
  const nodeTypes = new Map<string, string>();
  const edgeTypes = new Map<string, string>();
  const sources = new Map<string, string>();
  const nodesByCode = new Map<string, Record<string, string>>();
  const edgeChunks: string[] = [];

  for (const line of lines.slice(1)) {
    if (line.startsWith("T")) {
      const [key, value] = splitOnce(line.slice(1), "=");
      nodeTypes.set(key!, unescapeValue(value));
    } else if (line.startsWith("R")) {
      const [key, value = ""] = line.slice(1).split("=", 2);
      edgeTypes.set(key!, unescapeValue(value));
    } else if (line.startsWith("S")) {
      const [key, value] = splitOnce(line.slice(1), "=");
      sources.set(key!, unescapeValue(value));
    } else if (line.startsWith("N")) {
      const [key, raw] = splitOnce(line.slice(1), "=");
      const fields = raw.split("|");
      if (fields.length !== 6) throw new Error("invalid ASCII node row");
      const [id, typeCode, source, subsystem, layer, relationshipStatus] = fields;
      const decodedSource = version === "G2" && source ? sources.get(source!) ?? "" : unescapeValue(source!);
      const node: Record<string, string> = {
        id: unescapeValue(id!),
        type: nodeTypes.get(typeCode!)!,
        source: decodedSource,
      };
      const optional = {
        subsystem: unescapeValue(subsystem!),
        layer: unescapeValue(layer!),
        relationship_status: unescapeValue(relationshipStatus!),
      };
      for (const [name, value] of Object.entries(optional)) if (value) node[name] = value;
      nodesByCode.set(key!, node);
    } else if (line.startsWith("E=")) edgeChunks.push(line.slice(2));
    else if (line.startsWith("E+")) edgeChunks.push(line.slice(2));
    else throw new Error(`unknown ASCII graph row: ${line.slice(0, 16)}`);
  }

  if (nodesByCode.size !== nodeCount) throw new Error("ASCII graph node count mismatch");
  if (version === "G2" && sources.size !== sourceCount) throw new Error("ASCII graph source dictionary count mismatch");
  const edgeStream = edgeChunks.join("");
  const recordWidth = nodeWidth + relationWidth + nodeWidth;
  if (edgeStream.length !== edgeCount * recordWidth) throw new Error("ASCII graph edge stream length mismatch");

  const edges: Array<{ from: string; to: string; type: string }> = [];
  for (let offset = 0; offset < edgeStream.length; offset += recordWidth) {
    const record = edgeStream.slice(offset, offset + recordWidth);
    const sourceCode = record.slice(0, nodeWidth);
    const relationCode = record.slice(nodeWidth, nodeWidth + relationWidth);
    const targetCode = record.slice(nodeWidth + relationWidth);
    edges.push({
      from: nodesByCode.get(sourceCode)!.id,
      to: nodesByCode.get(targetCode)!.id,
      type: edgeTypes.get(relationCode)!,
    });
  }

  return {
    schema_version: version === "G2" ? "ascii-topology-v2" : "ascii-topology-v1",
    direction: header.d!,
    source_graph_sha256: header.h!,
    nodes: Array.from({ length: nodeCount }, (_, index) => nodesByCode.get(code(index, nodeWidth))!),
    edges,
  };
}
