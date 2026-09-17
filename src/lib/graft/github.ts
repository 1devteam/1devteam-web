import type {
  Capability,
  EdgeKind,
  FactKind,
  GraftEdge,
  GraftNode,
  Layer,
  SubjectProfile,
  TruthFact,
} from "./types.ts";

type TreeItem = { path: string; type: "blob" | "tree"; size?: number };
type RepositoryRef = { owner: string; repo: string; ref: string; label: string };

const MAX_SOURCE_FILES = 80;
const MAX_SOURCE_BYTES = 1_200_000;
const SOURCE_EXTENSIONS = new Set([".py", ".js", ".jsx", ".ts", ".tsx", ".go", ".rs", ".java", ".rb"]);

export const EMPTY_PUBLIC_SUBJECT: SubjectProfile = {
  id: "public-repository",
  name: "Public repository",
  dna: "Load a public GitHub repository to create a bounded, evidence-linked reconstruction.",
  repoHint: "https://github.com/owner/repository",
  files: ["README.md"],
  scenarios: [{ id: "awaiting-repository", kind: "surface", label: "Awaiting repository", files: ["README.md"], intent: "Enter a public GitHub repository URL to begin." }],
  nodes: [], edges: [], invariants: [], findings: [], acknowledgedFindingIds: [],
  provenance: { kind: "source-backed", repo: "none", capturedAt: new Date(0).toISOString(), note: "No repository has been loaded." },
  capabilities: [], facts: [],
};

export function parseGitHubUrl(value: string): RepositoryRef {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid public GitHub repository URL.");
  }
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") {
    throw new Error("Only public github.com repository URLs are supported.");
  }
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2 || parts[0].startsWith("@") || parts[1].startsWith(".")) {
    throw new Error("Use a repository URL such as https://github.com/owner/repository.");
  }
  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, "");
  const ref = parts[2] === "tree" && parts.slice(3).length ? parts.slice(3).join("/") : "HEAD";
  return { owner, repo, ref, label: `${owner}/${repo}@${ref}` };
}

async function githubJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) {
    if (response.status === 403) throw new Error("GitHub public API rate limit reached. Try again later or use a narrower repository.");
    if (response.status === 404) throw new Error("Repository or ref was not found, or it is not public.");
    throw new Error(`GitHub returned HTTP ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

function layerFor(path: string): Layer {
  const value = path.toLowerCase();
  if (value.includes("test") || value.includes("spec")) return "proof";
  if (value.includes("docker") || value.includes("compose") || value.includes(".github/") || value.startsWith("deploy/")) return "overlay";
  if (value.includes("migration") || value.includes("alembic") || value.includes("schema") || value.includes("model")) return "overlay";
  return "generated";
}

function nodeKind(path: string): GraftNode["kind"] {
  const value = path.toLowerCase();
  if (value.includes("test") || value.includes("spec")) return "test_module";
  if (value.includes("migration") || value.includes("alembic") || value.includes("schema")) return "db_table";
  if (value.includes("worker") || value.includes("queue") || value.includes("runtime") || value.includes("lease")) return "runtime_boundary";
  if (value.includes("policy") || value.includes("auth") || value.includes("permission")) return "security_boundary";
  if (value.includes("http") || value.includes("network") || value.includes("email") || value.includes("provider")) return "network_egress";
  return "python_module";
}

function importTargets(path: string, text: string, paths: Set<string>): string[] {
  const targets = new Set<string>();
  const addModule = (name: string) => {
    const stem = name.replace(/^\.?\//, "").replace(/\./g, "/").replace(/\.(js|jsx|ts|tsx|py)$/, "");
    for (const candidate of [stem, `${stem}.py`, `${stem}.ts`, `${stem}.tsx`, `${stem}.js`, `${stem}/__init__.py`, `${stem}/index.ts`]) {
      if (paths.has(candidate)) { targets.add(candidate); break; }
    }
  };
  if (path.endsWith(".py")) {
    for (const match of text.matchAll(/^\s*(?:from\s+([\w.]+)|import\s+([\w.]+))/gm)) addModule(match[1] ?? match[2]);
  } else {
    for (const match of text.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
      if (match[1].startsWith(".")) addModule(match[1]);
    }
  }
  return [...targets];
}

function fact(id: string, capability: string, kind: FactKind, claim: string, nodes: string[], evidence: string[], gapKind?: TruthFact["gapKind"]): TruthFact {
  return {
    id, capability, kind, claim, nodes,
    gapKind,
    evidence: evidence.map((path) => ({ path, note: "Observed in the public repository snapshot.", proofClass: "source-symbol" })),
  };
}

export async function loadPublicRepository(value: string): Promise<{ subject: SubjectProfile; changedFiles: string[] }> {
  const repository = parseGitHubUrl(value);
  const apiRoot = `https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}`;
  const tree = await githubJson<{ sha: string; truncated?: boolean; tree: TreeItem[] }>(`${apiRoot}/git/trees/${encodeURIComponent(repository.ref)}?recursive=1`);
  if (tree.truncated) throw new Error("GitHub truncated this repository tree. Choose a smaller repository or a subdirectory ref.");
  const files = tree.tree.filter((item) => item.type === "blob").map((item) => item.path).sort();
  const sourceCandidates = files.filter((path) => SOURCE_EXTENSIONS.has(path.slice(path.lastIndexOf(".")))).slice(0, MAX_SOURCE_FILES);
  const sourceByPath = new Map<string, string>();
  let totalBytes = 0;
  await Promise.all(sourceCandidates.map(async (path) => {
    const item = tree.tree.find((entry) => entry.path === path);
    if ((item?.size ?? 0) > 250_000 || totalBytes >= MAX_SOURCE_BYTES) return;
    try {
      const response = await fetch(`https://raw.githubusercontent.com/${repository.owner}/${repository.repo}/${encodeURIComponent(repository.ref)}/${path}`);
      if (!response.ok) return;
      const text = await response.text();
      if (text.length <= 250_000) { sourceByPath.set(path, text); totalBytes += text.length; }
    } catch { /* Keep the missing source visible through the inventory and unknowns. */ }
  }));

  const nodes: GraftNode[] = files.map((path) => ({ id: `file:${path}`, kind: nodeKind(path), label: path, source: path, layer: layerFor(path), domain: layerFor(path) }));
  const known = new Set(files);
  const edges: GraftEdge[] = [];
  for (const [path, text] of sourceByPath) {
    for (const target of importTargets(path, text, known)) {
      edges.push({ from: `file:${path}`, to: `file:${target}`, kind: "imports" as EdgeKind, evidence: path, layer: "generated" });
    }
  }
  const sourcePaths = [...sourceByPath.keys()];
  const runtimePaths = files.filter((path) => /worker|queue|runtime|lease|dispatch/i.test(path));
  const facts: TruthFact[] = [
    fact("repo-inventory", "repository", "inventory", `${files.length} public repository files were observed at ${repository.label}.`, files.slice(0, 200).map((path) => `file:${path}`), files.slice(0, 20)),
    fact("source-sample", "repository", "proof", `${sourcePaths.length} source files were fetched for import analysis; the sample is bounded and may be incomplete.`, sourcePaths.map((path) => `file:${path}`), sourcePaths.slice(0, 20), sourcePaths.length < sourceCandidates.length ? "partial" : undefined),
    fact("runtime-observation-unavailable", "runtime", "gap", "Runtime execution, leases, queues, and external effects cannot be proven from a public source snapshot.", runtimePaths.map((path) => `file:${path}`), runtimePaths.slice(0, 20), "missing"),
    fact("semantic-contracts-unmodeled", "contracts", "gap", "Ownership, schema validity, authorization, and behavioral consumption require project-specific analysis beyond this generic source pass.", [], [], "missing"),
  ];
  const capabilities: Capability[] = [
    { id: "repository", label: "Repository inventory", intent: "What files and source surfaces exist?", nodes: nodes.slice(0, 200).map((node) => node.id) },
    { id: "runtime", label: "Runtime exposure", intent: "What cannot be proven without execution evidence?", nodes: runtimePaths.map((path) => `file:${path}`) },
    { id: "contracts", label: "Contract gaps", intent: "Which claims remain project-specific or unmodeled?", nodes: [] },
  ];
  const allNodeIds = nodes.map((node) => node.id);
  const subject: SubjectProfile = {
    id: repository.label,
    name: repository.label,
    dna: "Public repository reconstruction from a bounded, read-only GitHub snapshot.",
    repoHint: `https://github.com/${repository.owner}/${repository.repo}/tree/${repository.ref}`,
    files: files.slice(0, 200),
    scenarios: [{ id: "repository-snapshot", kind: "surface", label: "Repository snapshot", files: sourcePaths.slice(0, 20), intent: "Inspect the fetched public source surface and its explicit residuals." }],
    nodes,
    edges,
    invariants: [],
    findings: [
      { id: "GF-runtime-unavailable", title: "Runtime behavior is not observable", detail: "A public source snapshot cannot prove queue, lease, worker, database, or external-effect behavior.", relatedNodes: runtimePaths.map((path) => `file:${path}`), blocking: false, proofMode: "open" },
      { id: "GF-generic-contract-gap", title: "Project-specific contracts require review", detail: "Generic parsing cannot establish ownership, authorization, schema consumption, or business correctness.", relatedNodes: allNodeIds.slice(0, 200), blocking: false, proofMode: "open" },
    ],
    acknowledgedFindingIds: [],
    provenance: { kind: "source-backed", repo: `github.com/${repository.owner}/${repository.repo}`, sha: tree.sha, capturedAt: new Date().toISOString(), note: "Fetched from public GitHub tree and bounded raw source reads. No repository code was executed." },
    capabilities,
    facts,
  };
  return { subject, changedFiles: sourcePaths.length ? sourcePaths.slice(0, 20) : files.slice(0, 1) };
}
