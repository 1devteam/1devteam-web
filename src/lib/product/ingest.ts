import type { Capability, Finding, GraftEdge, GraftNode, NodeKind, SubjectProfile, TruthFact } from "../graft/types.ts";
import { indexFiles } from "./indexer.ts";
import { fingerprint, isoNow, slug } from "./hash.ts";
import { isolateFiles } from "./secrets.ts";
import type { IngestedFile, ProjectIndex, ProjectOrigin } from "./types.ts";
import {
  MAX_FILE_BYTES,
  isTextPath,
  languageOf,
  rankPath,
  selectSourceFiles,
  shouldSkipPath,
} from "./paths.ts";

export { MAX_FILE_BYTES, isTextPath, languageOf, shouldSkipPath, rankPath, selectSourceFiles };

export function nodeId(path: string): string {
  const name = path.replace(/\.[^.]+$/, "").replace(/[\\/]/g, ".");
  return `mod:${name}`;
}

export function kindFromPath(path: string): NodeKind {
  if (/(^|\/)(tests?|__tests__|spec)(\/|$)/i.test(path) || /\.(test|spec)\./.test(path)) return "test_module";
  const base = path.split("/").pop() ?? path;
  if (/^(package\.json|pyproject\.toml|go\.mod|Cargo\.toml|Gemfile)$/i.test(base)) return "runtime_artifact";
  if (path.endsWith(".py") || path.endsWith(".go") || path.endsWith(".rs") || path.endsWith(".java")) {
    return "python_module";
  }
  if (/\.(ts|tsx|js|jsx)$/.test(path)) return "frontend_module";
  return "python_module";
}

export function domainFromPath(path: string): string {
  if (kindFromPath(path) === "test_module") return "proof";
  if (kindFromPath(path) === "runtime_artifact") return "runtime";
  if (path.includes("/api/") || path.includes("/routes/") || path.includes("/pages/")) return "surface";
  if (path.includes("auth") || path.includes("govern") || path.includes("policy") || path.includes("security")) {
    return "authority";
  }
  if (path.includes("economy") || path.includes("market")) return "economy";
  if (path.includes("alembic") || path.includes("migration") || path.includes("/db/")) return "data";
  const top = path.split("/")[0]?.toLowerCase() ?? "runtime";
  if (["src", "lib", "app", "apps", "packages", "backend", "server", "cmd", "pkg", "internal"].includes(top)) {
    return "runtime";
  }
  if (top === "frontend" || top === "web" || top === "ui") return "surface";
  return "runtime";
}

export function pickGraphFiles(files: IngestedFile[]): Set<string> {
  return new Set(files.map((f) => f.path));
}

export function honestyFindings(input: {
  omitted?: number;
  omittedPaths?: string[];
  omittedNotes?: string[];
  skippedRoots?: string[];
  truncated?: boolean;
  graphDropped?: string[];
  relatedNodes: string[];
}): Finding[] {
  const related = input.relatedNodes.slice(0, 24);
  const out: Finding[] = [];
  if (input.truncated) {
    out.push({
      id: "OMIT-truncated",
      title: "GitHub tree was truncated",
      detail:
        "The recursive tree listing was truncated. Inventory is a ranked slice, not the full repository. Residual stays INDETERMINATE.",
      relatedNodes: related,
      blocking: false,
      proofMode: "open",
    });
  }
  if (input.omitted && input.omitted > 0) {
    const sample = (input.omittedNotes ?? input.omittedPaths ?? []).slice(0, 8).join(", ");
    out.push({
      id: "OMIT-files",
      title: "Readable files not ingested",
      detail: `${input.omitted} readable files were not ingested.${sample ? ` Including ${sample}.` : ""} Incomplete inventory stays INDETERMINATE.`,
      relatedNodes: related,
      blocking: false,
      proofMode: "open",
    });
  }
  if (input.skippedRoots?.length) {
    out.push({
      id: "SKIP-dirs",
      title: "Skip directories not treated as source",
      detail: `Skipped ${input.skippedRoots.join(", ")}. These are not product source.`,
      relatedNodes: related,
      blocking: false,
      proofMode: "open",
    });
  }
  if (input.graphDropped?.length) {
    const sample = input.graphDropped.slice(0, 8).join(", ");
    out.push({
      id: "OMIT-graph",
      title: "Generated graph dropped files by node cap",
      detail: `${input.graphDropped.length} ingested files have no generated node. ${sample}. Those paths stay INDETERMINATE.`,
      relatedNodes: related,
      blocking: false,
      proofMode: "open",
    });
  }
  return out;
}

export function subjectFromIngest(
  name: string,
  files: IngestedFile[],
  index: ProjectIndex,
  repoHint = "local-ingest",
  extra: {
    sha?: string;
    omitted?: number;
    truncated?: boolean;
    omittedPaths?: string[];
    omittedNotes?: string[];
    skippedRoots?: string[];
  } = {},
): SubjectProfile {
  const id = slug(name);
  const capturedAt = isoNow();
  const graphFiles = pickGraphFiles(files);
  const graphDropped = files.filter((file) => !graphFiles.has(file.path)).map((file) => file.path);
  const nodes: GraftNode[] = files
    .filter((file) => graphFiles.has(file.path))
    .map((file) => ({
      id: nodeId(file.path),
      kind: kindFromPath(file.path),
      label: file.path.split("/").pop() ?? file.path,
      source: file.path,
      layer: "generated",
      domain: domainFromPath(file.path),
    }));
  const known = new Set(nodes.map((n) => n.id));
  const edges: GraftEdge[] = [];
  const seenEdge = new Set<string>();
  function pushEdge(from: string, to: string, kind: GraftEdge["kind"], evidence: string) {
    if (!known.has(from) || !known.has(to) || from === to) return;
    const key = `${from}->${to}:${kind}`;
    if (seenEdge.has(key)) return;
    seenEdge.add(key);
    edges.push({ from, to, kind, evidence, layer: "generated" });
  }

  for (const item of index.imports) {
    if (!item.resolvedPath) continue;
    pushEdge(nodeId(item.fromPath), nodeId(item.resolvedPath), "imports", `${item.fromPath} imports ${item.specifier}`);
  }

  for (const call of index.calls) {
    if (!call.resolvedPath || call.resolvedPath === call.callerPath) continue;
    pushEdge(
      nodeId(call.callerPath),
      nodeId(call.resolvedPath),
      "calls",
      `${call.callerSymbol} → ${call.calleeName} (${call.callerPath}:${call.line})`,
    );
  }

  for (const file of files) {
    if (kindFromPath(file.path) !== "test_module") continue;
    const target = files.find(
      (other) =>
        other.path !== file.path &&
        file.content.includes(other.path.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "___"),
    );
    if (target) pushEdge(nodeId(file.path), nodeId(target.path), "tests", file.path);
  }

  const surfaceBuckets = new Map<string, string[]>();
  for (const node of nodes) {
    const top = node.source.split("/")[0] ?? node.source;
    const list = surfaceBuckets.get(top) ?? [];
    list.push(node.id);
    surfaceBuckets.set(top, list);
  }
  const capabilities: Capability[] = [
    {
      id: "ingested",
      label: "Ingested surface",
      intent: "Generated map of this revision. Overlay remains unmodeled.",
      nodes: nodes.map((n) => n.id),
    },
    ...[...surfaceBuckets.entries()].map(([dir, ids]) => ({
      id: `surface-${fingerprint(dir).slice(0, 8)}`,
      label: dir,
      intent: `Generated surface of ${dir}. Shape, contracts, and wiring only.`,
      nodes: ids,
    })),
  ];

  const facts: TruthFact[] = [];
  for (const file of files) {
    const cap = `surface-${fingerprint(file.path.split("/")[0] ?? file.path).slice(0, 8)}`;
    facts.push({
      id: `ING-inv-${fingerprint(file.path).slice(0, 8)}`,
      capability: cap,
      kind: "inventory",
      claim: `${file.path} is present in the generated inventory.`,
      nodes: graphFiles.has(file.path) ? [nodeId(file.path)] : [],
      evidence: [{ path: file.path, note: "Ingested file.", proofClass: "source-symbol" }],
    });
  }

  for (const symbol of index.symbols) {
    const cap = `surface-${fingerprint(symbol.path.split("/")[0] ?? symbol.path).slice(0, 8)}`;
    facts.push({
      id: `ING-con-${fingerprint(symbol.id).slice(0, 8)}`,
      capability: cap,
      kind: "contract",
      claim: `${symbol.path} declares ${symbol.kind} ${symbol.name} at line ${symbol.line}.`,
      nodes: graphFiles.has(symbol.path) ? [nodeId(symbol.path)] : [],
      evidence: [
        {
          path: symbol.path,
          symbol: symbol.name,
          note: `${symbol.kind} ${symbol.name}`,
          proofClass: "source-symbol",
        },
      ],
    });
  }

  for (const item of index.imports) {
    const cap = `surface-${fingerprint(item.fromPath.split("/")[0] ?? item.fromPath).slice(0, 8)}`;
    if (item.resolvedPath) {
      facts.push({
        id: `ING-dep-${fingerprint(`${item.fromPath}:${item.specifier}`).slice(0, 8)}`,
        capability: cap,
        kind: "dependency",
        claim: `${item.fromPath} imports ${item.specifier} → ${item.resolvedPath}.`,
        nodes: [nodeId(item.fromPath), nodeId(item.resolvedPath)],
        evidence: [{ path: item.fromPath, note: item.specifier, proofClass: "source-symbol" }],
      });
    } else {
      facts.push({
        id: `ING-dep-${fingerprint(`${item.fromPath}:${item.specifier}`).slice(0, 8)}`,
        capability: cap,
        kind: "dependency",
        claim: `${item.fromPath} imports ${item.specifier} (not resolved in this tree).`,
        nodes: graphFiles.has(item.fromPath) ? [nodeId(item.fromPath)] : [],
        evidence: [{ path: item.fromPath, note: item.specifier, proofClass: "source-symbol" }],
      });
    }
  }

  facts.push({
    id: `ING-neg-overlay-${fingerprint(id).slice(0, 8)}`,
    capability: "ingested",
    kind: "negative",
    claim: "Overlay (policy, saga, ownership, runtime authority) is not modeled for this ingest.",
    nodes: nodes.slice(0, 1).map((n) => n.id),
    evidence: [{ path: files[0]?.path ?? ".", note: "Generated-only reconstruction.", proofClass: "unproven" }],
  });
  facts.push({
    id: `ING-fresh-${fingerprint(id).slice(0, 8)}`,
    capability: "ingested",
    kind: "freshness",
    claim: `Generated reconstruction captured ${capturedAt}${extra.sha ? ` at ${extra.sha.slice(0, 8)}` : ""}. Overlay facts are residual.`,
    nodes: nodes.slice(0, 1).map((n) => n.id),
    evidence: [{ path: files[0]?.path ?? ".", note: "Ingest timestamp.", proofClass: "unproven" }],
  });
  if (extra.omitted || extra.truncated) {
    facts.push({
      id: `ING-inv-cap-${fingerprint(id).slice(0, 8)}`,
      capability: "ingested",
      kind: "inventory",
      claim: extra.truncated
        ? "GitHub tree was truncated. Inventory is incomplete for this revision."
        : `${extra.omitted} readable files were not ingested. Inventory is incomplete for this revision.`,
      nodes: nodes.slice(0, 1).map((n) => n.id),
      evidence: [{ path: ".", note: "Ingest ceiling / truncated tree.", proofClass: "unproven" }],
    });
  }

  const paths = files.map((f) => f.path);

  return {
    id,
    name,
    dna: `Generated map of ${name}. Contracts, dependencies, and wiring at this revision. Overlay residual. Not a planner.`,
    repoHint,
    files: paths,
    scenarios: [
      {
        id: "ingested-surface",
        kind: "surface",
        label: "Full reconstruction",
        files: paths,
        intent: "Whole generated map. Not a change-set slice.",
      },
    ],
    nodes,
    edges,
    invariants: [],
    findings: honestyFindings({
      omitted: extra.omitted,
      omittedPaths: extra.omittedPaths,
      omittedNotes: extra.omittedNotes,
      skippedRoots: extra.skippedRoots,
      truncated: extra.truncated,
      graphDropped,
      relatedNodes: nodes.map((n) => n.id),
    }),
    acknowledgedFindingIds: [],
    provenance: {
      kind: "source-backed",
      repo: repoHint,
      sha: extra.sha,
      capturedAt,
      note: extra.omitted
        ? `Generated layer only. Mapped ${files.length} files, omitted ${extra.omitted}. Overlay is residual.`
        : "Generated layer only. Overlay is residual. Not a planner.",
    },
    capabilities,
    facts,
  };
}

export function prepareIngest(
  name: string,
  raw: IngestedFile[],
  extra: {
    repoHint?: string;
    sha?: string;
    truncated?: boolean;
    omitted?: number;
    omittedPaths?: string[];
    omittedNotes?: string[];
    skippedRoots?: string[];
  } = {},
) {
  const picked = selectSourceFiles(raw);
  const omittedPaths = [...new Set([...(extra.omittedPaths ?? []), ...picked.omittedPaths])];
  const omitted = Math.max(extra.omitted ?? 0, picked.omitted, omittedPaths.length);
  const limited = picked.selected.map((f) => ({
    ...f,
    language: languageOf(f.path),
    size: f.content.length,
  }));
  const isolated = isolateFiles(limited);
  const index = indexFiles(isolated.files);
  const profile = subjectFromIngest(name, isolated.files, index, extra.repoHint ?? "local-ingest", {
    sha: extra.sha,
    omitted,
    omittedPaths,
    truncated: extra.truncated,
    omittedNotes: extra.omittedNotes,
    skippedRoots: extra.skippedRoots,
  });
  return {
    files: isolated.files,
    secrets: isolated.secrets,
    index,
    profile,
    omitted,
    omittedPaths,
    truncated: extra.truncated,
  };
}

export function filesFromTextMap(map: Record<string, string>): IngestedFile[] {
  return Object.entries(map).map(([path, content]) => ({
    path,
    content,
    language: languageOf(path),
    size: content.length,
  }));
}

type DirHandle = {
  name: string;
  kind: "directory" | "file";
  values?: () => AsyncIterable<DirHandle>;
  getFile?: () => Promise<File>;
};

async function walkHandle(handle: DirHandle, prefix = ""): Promise<IngestedFile[]> {
  const out: IngestedFile[] = [];
  if (!handle.values) return out;
  for await (const entry of handle.values()) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (shouldSkipPath(path)) continue;
    if (entry.kind === "directory") {
      out.push(...(await walkHandle(entry, path)));
    } else if (entry.getFile && isTextPath(path)) {
      const file = await entry.getFile();
      if (file.size > MAX_FILE_BYTES) continue;
      const content = await file.text();
      out.push({ path, content, language: languageOf(path), size: content.length });
    }
  }
  return out;
}

export async function pickDirectory(): Promise<IngestedFile[] | null> {
  const picker = (window as unknown as { showDirectoryPicker?: () => Promise<DirHandle> }).showDirectoryPicker;
  if (!picker) return null;
  const root = await picker();
  return walkHandle(root, root.name);
}

export async function filesFromList(list: FileList | File[]): Promise<IngestedFile[]> {
  const out: IngestedFile[] = [];
  for (const file of Array.from(list)) {
    const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
    if (shouldSkipPath(path) || !isTextPath(path) || file.size > MAX_FILE_BYTES) continue;
    const content = await file.text();
    out.push({ path, content, language: languageOf(path), size: content.length });
  }
  return out;
}

export function originForFolder(name: string, omitted = 0): ProjectOrigin {
  return { kind: "folder", repo: name, omitted };
}
