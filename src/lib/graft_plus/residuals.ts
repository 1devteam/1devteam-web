import type { UnresolvedReference } from "./types.ts";

export const UNRESOLVED_LEDGER_FILE = "graph-unresolved-ledger.v1.json" as const;

export function classifyUnresolvedReference(specifier: string, source: string): string {
  const lowered = specifier.toLowerCase();
  const sourceLower = source.toLowerCase();
  if (
    lowered.startsWith("http://") ||
    lowered.startsWith("https://") ||
    lowered.startsWith("chrome:") ||
    lowered.startsWith("chrome-untrusted:") ||
    lowered.startsWith("devtools:") ||
    lowered.startsWith("file:")
  ) return "url_or_scheme";
  if (specifier.startsWith(".")) return "relative_internal_reference";
  if (
    sourceLower.includes("/test") ||
    sourceLower.includes("tests/") ||
    sourceLower.includes(".test.") ||
    sourceLower.includes(".spec.") ||
    sourceLower.includes("fixture")
  ) return "test_or_fixture_context";
  if (
    sourceLower.includes("generated") ||
    sourceLower.includes("gen/") ||
    sourceLower.includes("out/") ||
    sourceLower.includes("build/")
  ) return "generated_or_build_context";
  if (
    lowered.startsWith("tools.") ||
    lowered.startsWith("tools/") ||
    lowered.startsWith("build.") ||
    lowered.startsWith("build/") ||
    lowered.startsWith("scripts.") ||
    lowered.startsWith("scripts/")
  ) return "tooling_or_build_reference";
  return "unresolved_absolute_reference";
}

export type UnresolvedLedger = {
  schema_version: "1.0";
  encoding: "dictionary-pairs-v1";
  reference_count: number;
  unique_specifier_count: number;
  unique_source_count: number;
  class_counts: Record<string, number>;
  top_specifiers: Array<{ specifier: string; count: number }>;
  top_sources: Array<{ source: string; count: number }>;
  specifier_table: string[];
  source_table: string[];
  references: Array<[number, number]>;
};

export function buildUnresolvedLedger(rows: UnresolvedReference[]): UnresolvedLedger {
  const uniquePairs = new Map<string, UnresolvedReference>();
  for (const row of rows) uniquePairs.set(`${row.specifier}\0${row.from}`, row);
  const pairs = [...uniquePairs.values()].sort(
    (a, b) => a.specifier.localeCompare(b.specifier) || a.from.localeCompare(b.from),
  );
  const specifiers = [...new Set(pairs.map((row) => row.specifier))].sort();
  const sources = [...new Set(pairs.map((row) => row.from))].sort();
  const specifierIndex = new Map(specifiers.map((value, index) => [value, index]));
  const sourceIndex = new Map(sources.map((value, index) => [value, index]));
  const classCounts = new Map<string, number>();
  const specifierCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();
  const references: Array<[number, number]> = [];

  for (const row of pairs) {
    references.push([specifierIndex.get(row.specifier)!, sourceIndex.get(row.from)!]);
    const cls = classifyUnresolvedReference(row.specifier, row.from);
    classCounts.set(cls, (classCounts.get(cls) ?? 0) + 1);
    specifierCounts.set(row.specifier, (specifierCounts.get(row.specifier) ?? 0) + 1);
    sourceCounts.set(row.from, (sourceCounts.get(row.from) ?? 0) + 1);
  }
  const topSpecifiers = [...specifierCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 128)
    .map(([specifier, count]) => ({ specifier, count }));
  const topSources = [...sourceCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 128)
    .map(([source, count]) => ({ source, count }));

  return {
    schema_version: "1.0",
    encoding: "dictionary-pairs-v1",
    reference_count: references.length,
    unique_specifier_count: specifiers.length,
    unique_source_count: sources.length,
    class_counts: Object.fromEntries([...classCounts.entries()].sort()),
    top_specifiers: topSpecifiers,
    top_sources: topSources,
    specifier_table: specifiers,
    source_table: sources,
    references,
  };
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, stable(child)]),
    );
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(stable(value));
}

function rotr(value: number, shift: number): number {
  return (value >>> shift) | (value << (32 - shift));
}

export function sha256Hex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const bitLength = bytes.length * 8;
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const data = new Uint8Array(paddedLength);
  data.set(bytes);
  data[bytes.length] = 0x80;
  const view = new DataView(data.buffer);
  const high = Math.floor(bitLength / 0x100000000);
  const low = bitLength >>> 0;
  view.setUint32(paddedLength - 8, high, false);
  view.setUint32(paddedLength - 4, low, false);

  const k = new Uint32Array([
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
  ]);
  const h = new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
  const w = new Uint32Array(64);

  for (let offset = 0; offset < data.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15]!, 7) ^ rotr(w[i - 15]!, 18) ^ (w[i - 15]! >>> 3);
      const s1 = rotr(w[i - 2]!, 17) ^ rotr(w[i - 2]!, 19) ^ (w[i - 2]! >>> 10);
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0;
    }
    let [a,b,c,d,e,f,g,hh] = [...h];
    for (let i = 0; i < 64; i += 1) {
      const s1 = rotr(e!, 6) ^ rotr(e!, 11) ^ rotr(e!, 25);
      const ch = (e! & f!) ^ (~e! & g!);
      const t1 = (hh! + s1 + ch + k[i]! + w[i]!) >>> 0;
      const s0 = rotr(a!, 2) ^ rotr(a!, 13) ^ rotr(a!, 22);
      const maj = (a! & b!) ^ (a! & c!) ^ (b! & c!);
      const t2 = (s0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d! + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h[0]=(h[0]!+a!)>>>0; h[1]=(h[1]!+b!)>>>0; h[2]=(h[2]!+c!)>>>0; h[3]=(h[3]!+d!)>>>0;
    h[4]=(h[4]!+e!)>>>0; h[5]=(h[5]!+f!)>>>0; h[6]=(h[6]!+g!)>>>0; h[7]=(h[7]!+hh!)>>>0;
  }
  return [...h].map((value) => value.toString(16).padStart(8, "0")).join("");
}

export function ledgerMetadata(ledger: UnresolvedLedger) {
  return {
    file: UNRESOLVED_LEDGER_FILE,
    schema_version: ledger.schema_version,
    encoding: ledger.encoding,
    reference_count: ledger.reference_count,
    unique_specifier_count: ledger.unique_specifier_count,
    unique_source_count: ledger.unique_source_count,
    class_counts: ledger.class_counts,
    sha256: sha256Hex(canonicalJson(ledger)),
  };
}

export function compactGraph<T extends { facts: Record<string, unknown> }>(graph: T, ledger: UnresolvedLedger): T {
  const facts = { ...graph.facts };
  delete facts.unresolved_imports;
  facts.unresolved_reference_ledger = ledgerMetadata(ledger);
  return { ...graph, facts };
}
