import type { PipelinePacket, SubjectProfile } from "../graft/types.ts";
import type { IngestedFile, ProjectIndex, ProjectOrigin } from "./types.ts";
import { zipStore } from "./zip.ts";
import { reconstructPack } from "../graft_plus/reconstruct.ts";

export const PACK_SCHEMA = "graft-pack-1";

function fenceFor(path: string): string {
  if (path.endsWith(".py")) return "python";
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "ts";
  if (path.endsWith(".js") || path.endsWith(".jsx") || path.endsWith(".mjs")) return "js";
  if (path.endsWith(".go")) return "go";
  if (path.endsWith(".rs")) return "rust";
  if (path.endsWith(".java") || path.endsWith(".kt")) return "java";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".yml") || path.endsWith(".yaml")) return "yaml";
  if (path.endsWith(".md") || path.endsWith(".rst")) return "markdown";
  if (path.endsWith(".toml")) return "toml";
  if (path.endsWith(".sh")) return "bash";
  return "";
}

export function readmeExcerpt(files: Pick<IngestedFile, "path" | "content">[]): string | undefined {
  const readmes = files.filter((item) => {
    const base = item.path.split("/").pop() ?? item.path;
    return /^readme(\.|$)/i.test(base);
  });
  const file = readmes.sort(
    (a, b) => a.path.split("/").length - b.path.split("/").length || a.path.localeCompare(b.path),
  )[0];
  if (!file?.content.trim()) return undefined;
  const body = file.content
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line, i, all) => line.length > 0 || (i > 0 && all[i - 1]?.length > 0))
    .slice(0, 24)
    .join("\n")
    .slice(0, 1200);
  return body || undefined;
}

function packageRoot(specifier: string): string {
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/");
  if (specifier.startsWith("github.com/")) return specifier.split("/").slice(0, 3).join("/");
  return specifier.split(/[./]/)[0] ?? specifier;
}

function unresolvedBySpecifier(index?: ProjectIndex): { specifier: string; from: string[] }[] {
  if (!index) return [];
  const map = new Map<string, string[]>();
  for (const row of index.imports) {
    if (row.resolvedPath) continue;
    const list = map.get(row.specifier) ?? [];
    list.push(row.fromPath);
    map.set(row.specifier, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([specifier, from]) => ({ specifier, from: [...new Set(from)].sort() }));
}

export function packSlug(origin: ProjectOrigin | undefined, profile: SubjectProfile): string {
  const repo =
    origin?.kind === "github" ? `${origin.owner}-${origin.repo}` : (profile.provenance.repo ?? profile.name);
  const sha = (origin?.sha ?? profile.provenance.sha ?? "HEAD").slice(0, 8);
  return `${String(repo).replace(/[^\w.-]+/g, "-")}-${sha}`;
}

export function copyReadyTrail(input: {
  packet: PipelinePacket;
  profile: SubjectProfile;
  origin?: ProjectOrigin;
  overlayCount?: number;
  index?: ProjectIndex;
  files?: Pick<IngestedFile, "path" | "content">[];
}): string {
  const { packet, profile, origin, index } = input;
  const overlayNodes = profile.nodes.filter((n) => n.layer === "overlay");
  const overlayCount = input.overlayCount ?? overlayNodes.length;
  const overlayEdges = profile.edges.filter((e) => e.layer === "overlay");
  const generatedEdges = profile.edges.filter((e) => e.layer === "generated");
  const sha = origin?.sha ?? profile.provenance.sha ?? "unpinned";
  const ref = origin?.ref ?? profile.provenance.ref ?? "HEAD";
  const repo =
    origin?.kind === "github" ? `${origin.owner}/${origin.repo}` : (profile.provenance.repo ?? profile.repoHint);
  const files = profile.files;
  const overlayLines = overlayNodes.length
    ? overlayNodes.map((n) => `- ${n.id} · ${n.kind} · ${n.source}`)
    : ["- none. Overlay is residual until a reviewed relationship is attached."];
  const surfaces = profile.capabilities.filter((c) => c.id !== "ingested");
  const between = generatedEdges.map((e) => `- ${e.kind}: ${e.from} → ${e.to} (${e.evidence})`);
  const findings = profile.findings.map((f) => `${f.id} (${f.proofMode ?? "open"}): ${f.detail}`);
  const docker = files.filter((path) => /(?:^|\/)Dockerfile/i.test(path) || /docker-compose/i.test(path));
  const ci = files.filter((path) => path.includes(".github/workflows") || /gitlab-ci|circleci/i.test(path));
  const routes = index?.routes ?? [];
  const commits = origin?.recentCommits ?? [];
  const bodies = input.files ?? [];
  const byPath = new Map(bodies.map((file) => [file.path, file.content]));
  const readme = readmeExcerpt(bodies);
  const slug = packSlug(origin, profile);
  const unresolved = unresolvedBySpecifier(index);
  const packageRoots = [...new Set(unresolved.map((row) => packageRoot(row.specifier)))].sort();
  const innerDeps = profile.facts.filter((f) => f.kind === "dependency" && f.claim.includes(" → "));
  const outerDeps = profile.facts.filter((f) => f.kind === "dependency" && f.claim.includes("not resolved in this tree"));
  const contracts = profile.facts.filter((f) => f.kind === "contract");

  const fileSections: string[] = [];
  for (const path of files) {
    const source = byPath.get(path);
    const fileContracts = contracts.filter((f) => f.claim.startsWith(`${path} `) || f.evidence.some((e) => e.path === path));
    const fileInner = innerDeps.filter((f) => f.claim.startsWith(`${path} `));
    const fileOuter = outerDeps.filter((f) => f.claim.startsWith(`${path} `));
    const fileRoutes = routes.filter((r) => r.path === path);
    const fence = fenceFor(path);
    fileSections.push(`### ${path}`);
    if (fileContracts.length) {
      fileSections.push("Contracts:");
      for (const fact of fileContracts) fileSections.push(`- ${fact.claim}`);
    } else fileSections.push("Contracts: none declared");
    if (fileInner.length || fileOuter.length) {
      fileSections.push("Dependencies:");
      for (const fact of [...fileInner, ...fileOuter]) fileSections.push(`- ${fact.claim}`);
    } else fileSections.push("Dependencies: none");
    if (fileRoutes.length) {
      fileSections.push("Routes:");
      for (const row of fileRoutes) fileSections.push(`- ${row.method} ${row.route} · line ${row.line}`);
    }
    fileSections.push("Source:");
    fileSections.push("```" + fence);
    fileSections.push(source ?? "");
    fileSections.push("```");
    fileSections.push("");
  }

  return [
    `# G.R.A.F.T.+ reconstruction map`,
    ``,
    `Product: G.R.A.F.T.+`,
    `Role: fact-substrate`,
    `Artifact: one pack for one revision (this markdown plus GRAFT-PACK.json and tree/)`,
    `Schema: ${PACK_SCHEMA}`,
    `implementsPlan: false`,
    `mergeAuthorization: not-determined`,
    `Disposition: ${packet.decision.disposition}`,
    `Fingerprint: ${packet.fingerprint}`,
    `Download-name: GRAFT-PACK-${slug}.zip`,
    ``,
    `## How to read this`,
    `You are reading a reconstruction of one git revision. This is a map, not a plan and not a merge.`,
    ``,
    `Joints come first: inventory, contracts, inner dependencies, unresolved imports, routes, wiring, commits, README.`,
    `Source for every ingested file follows under Files. Answer follow-ups from this pack. Do not guess.`,
    `An import not resolved in this tree is still a fact. It is not a missing file and not overlay.`,
    `Do not invent overlay (policy, saga, ownership, runtime authority) unless it is evidenced here.`,
    `Honor negatives. Leave residual overlay residual. Do not treat acknowledgements as repairs.`,
    `Do not pick the next slice as determined. Infer only as a proposal against these facts.`,
    `If this markdown is truncated, open GRAFT-PACK.json and tree/ in the same zip. They hold the same revision complete.`,
    ``,
    `## Provenance`,
    `- Repository: ${repo}`,
    `- Ref: ${ref}`,
    `- SHA: ${sha}`,
    `- Captured: ${profile.provenance.capturedAt}`,
    `- Read-only: yes`,
    origin?.subtree ? `- Subtree: ${origin.subtree}` : null,
    origin?.truncated ? `- GitHub tree listing was truncated` : null,
    ``,
    `## Recent commits`,
    ...(commits.length ? commits.map((c) => `- ${c}`) : ["- none captured"]),
    ``,
    `## README (claimed intent)`,
    readme ? readme : "- none in ingested files",
    ``,
    `## Reconstruction`,
    `- Files ingested: ${files.length}`,
    `- Generated nodes: ${profile.nodes.filter((n) => n.layer === "generated").length}`,
    `- Generated edges: ${generatedEdges.length}`,
    `- Contracts: ${contracts.length}`,
    `- Inner dependencies: ${innerDeps.length}`,
    `- Unresolved imports: ${outerDeps.length}`,
    `- Routes: ${routes.length}`,
    `- Overlay nodes: ${overlayCount}`,
    `- Overlay edges: ${overlayEdges.length}`,
    origin?.omitted ? `- Readable files not ingested: ${origin.omitted}` : `- Readable files not ingested: 0`,
    ``,
    `## Not ingested`,
    ...(origin?.omittedNotes?.length
      ? origin.omittedNotes.map((note) => `- ${note}`)
      : origin?.omitted
        ? origin.omittedPaths?.length
          ? origin.omittedPaths.map((path) => `- ${path}`)
          : [`- ${origin.omitted} readable files. Paths were not captured.`]
        : ["- none"]),
    ``,
    `## Skipped directories`,
    ...(origin?.skippedRoots?.length ? origin.skippedRoots.map((root) => `- ${root}`) : ["- none"]),
    ``,
    `## Surfaces (structural intent)`,
    ...(surfaces.length ? surfaces.map((c) => `- ${c.label}: ${c.intent}`) : ["- none"]),
    ``,
    `## Unresolved package roots`,
    ...(packageRoots.length ? packageRoots.map((name) => `- ${name}`) : ["- none"]),
    ``,
    `## Unresolved imports (not in this tree)`,
    ...(unresolved.length
      ? unresolved.map((row) => `- ${row.specifier} · from ${row.from.join(", ")}`)
      : ["- none"]),
    ``,
    `## Inventory (every ingested path)`,
    ...files.map((path) => `- ${path}`),
    ``,
    `## Contracts`,
    ...(contracts.length ? contracts.map((f) => `- ${f.claim}`) : ["- none"]),
    ``,
    `## Routes`,
    ...(routes.length ? routes.map((r) => `- ${r.method} ${r.route} · ${r.path}:${r.line}`) : ["- none"]),
    ``,
    `## Dependencies`,
    ...(innerDeps.length || outerDeps.length
      ? [...innerDeps, ...outerDeps].map((f) => `- ${f.claim}`)
      : ["- none"]),
    ``,
    `## Between`,
    ...(between.length ? between : ["- none"]),
    ``,
    `## Docker`,
    ...(docker.length ? docker.map((path) => `- ${path}`) : ["- none in ingested files"]),
    ``,
    `## CI`,
    ...(ci.length ? ci.map((path) => `- ${path}`) : ["- none in ingested files"]),
    ``,
    `## Overlay`,
    ...overlayLines,
    ``,
    `## Negatives (do not invent past these)`,
    ...(profile.facts.filter((f) => f.kind === "negative").map((f) => `- ${f.claim}`).length
      ? profile.facts.filter((f) => f.kind === "negative").map((f) => `- ${f.claim}`)
      : ["- none"]),
    ``,
    `## Reconstruction honesty`,
    ...(findings.length ? findings.map((c) => `- ${c}`) : ["- complete for ingested files"]),
    ``,
    `## Files`,
    `Every ingested file follows. Contracts and dependencies for that path sit above its source.`,
    ``,
    ...fileSections,
    `## Note`,
    `These facts are the map. Unknowns become follow-up questions answered from this pack. G.R.A.F.T.+ does not choose corrections, additions, or merge authority.`,
    ``,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function graftPackJson(input: {
  packet: PipelinePacket;
  profile: SubjectProfile;
  origin?: ProjectOrigin;
  index?: ProjectIndex;
  files?: Pick<IngestedFile, "path" | "content" | "language">[];
}): string {
  const { packet, profile, origin, index } = input;
  const files = (input.files ?? []).map((file) => ({
    path: file.path,
    language: file.language ?? "other",
    content: file.content,
  }));
  return JSON.stringify(
    {
      schema: PACK_SCHEMA,
      implementsPlan: false,
      mergeAuthorization: "not-determined",
      disposition: packet.decision.disposition,
      fingerprint: packet.fingerprint,
      origin: origin ?? null,
      provenance: profile.provenance,
      reconstruction: {
        files: profile.files.length,
        contracts: profile.facts.filter((f) => f.kind === "contract").length,
        dependencies: profile.facts.filter((f) => f.kind === "dependency").length,
        unresolved: profile.facts.filter((f) => f.kind === "dependency" && f.claim.includes("not resolved in this tree"))
          .length,
        routes: index?.routes.length ?? 0,
        omitted: origin?.omitted ?? 0,
      },
      files,
      facts: profile.facts,
      index: index ?? null,
      findings: profile.findings,
    },
    null,
    2,
  );
}

export function buildGraftArchive(input: {
  packet: PipelinePacket;
  profile: SubjectProfile;
  origin?: ProjectOrigin;
  index?: ProjectIndex;
  files?: Pick<IngestedFile, "path" | "content" | "language">[];
}): { filename: string; markdown: string; json: string; zip: Uint8Array } {
  const pack = reconstructPack({
    files: (input.files ?? []).map((f) => ({ path: f.path, content: f.content })),
    origin: input.origin,
  });
  const decision = pack["graph-architecture-decision.json"] as Record<string, unknown>;
  const graph = pack["dependency-graph.v1.json"] as { metrics?: { node_count?: number; edge_count?: number } };
  const slug = packSlug(input.origin, input.profile);
  const markdown = [
    "# G.R.A.F.T.+ reconstruction pack",
    "",
    "Product: G.R.A.F.T.+",
    "Role: fact-substrate",
    "implementsPlan: false",
    "mergeAuthorization: not-determined",
    `Disposition: ${(decision.decision as { architecture_disposition?: string })?.architecture_disposition ?? "unknown"}`,
    "",
    "## How to read this",
    "Decipher graph-architecture-decision.json first. Then dependency-graph.v1.json.",
    "This is a map of what exists. It is not a plan and not a merge.",
    "Source is not in this zip. Point an AI at these JSON files.",
    "",
    "## Counts",
    `- Graph nodes: ${graph.metrics?.node_count ?? 0}`,
    `- Graph edges: ${graph.metrics?.edge_count ?? 0}`,
    "",
    "## Files in this pack",
    "- graph-architecture-decision.json",
    "- dependency-graph.v1.json",
    "- graph-completeness-report.json",
    "- graph-impact-report.json",
    "- graph-proof-manifest.json",
    "- graft-plus-receipt.json",
    "",
  ].join("\n");
  const json = JSON.stringify(pack, null, 2);
  const entries = Object.entries(pack).map(([name, value]) => ({
    name,
    data: JSON.stringify(value, null, 2) + "\n",
  }));
  entries.unshift({ name: "README.md", data: markdown });
  return {
    filename: `GRAFT-PACK-${slug}.zip`,
    markdown,
    json,
    zip: zipStore(entries),
  };
}
