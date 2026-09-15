import type { IngestedFile, Project } from "./types.ts";
import { MAX_FILE_BYTES, languageOf, rankPath, selectSourceFiles, skipRoot } from "./paths.ts";
import { SUBJECT_REFRESH } from "../graft/subjects.ts";

export type RepoRef = {
  owner: string;
  repo: string;
  ref?: string;
  subtree?: string;
};

export type GithubProgress = {
  phase: "repo" | "tree" | "files" | "compare";
  done: number;
  total: number;
  path?: string;
};

export type GithubIngest = {
  name: string;
  fullName: string;
  description: string;
  defaultBranch: string;
  ref: string;
  sha: string;
  htmlUrl: string;
  private: boolean;
  truncated: boolean;
  omitted: number;
  omittedPaths?: string[];
  omittedNotes?: string[];
  skippedRoots?: string[];
  files: IngestedFile[];
  recentCommits: string[];
};

export type GithubFetch = (
  url: string,
  init?: RequestInit,
) => Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
}>;

const GH = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";
const CONCURRENCY = 8;

export function githubRawUrl(owner: string, repo: string, sha: string, path: string): string {
  const encoded = path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
  return `${RAW}/${owner}/${repo}/${sha}/${encoded}`;
}

export function parseRepoRef(input: string): RepoRef | null {
  let s = input.trim();
  if (!s || s.length > 400) return null;
  if (s.startsWith("ghp_") || s.startsWith("github_pat_")) return null;
  s = s.replace(/^git@github\.com:/i, "https://github.com/");
  s = s.replace(/^(https?:\/\/)?github\.com\//i, "https://github.com/");
  if (!s.includes("github.com") && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/.test(s)) {
    s = `https://github.com/${s}`;
  }
  let url: URL;
  try {
    url = new URL(s);
  } catch {
    return null;
  }
  if (!/(^|\.)github\.com$/i.test(url.hostname)) return null;
  const parts = url.pathname
    .replace(/^\//, "")
    .replace(/\.git$/i, "")
    .split("/")
    .filter(Boolean);
  if (parts.length < 2) return null;
  const owner = parts[0];
  const repo = parts[1];
  if (!owner || !repo || owner === "." || repo === ".") return null;
  let ref: string | undefined;
  let subtree: string | undefined;
  if ((parts[2] === "tree" || parts[2] === "blob") && parts[3]) {
    ref = decodeURIComponent(parts[3]);
    if (parts.length > 4) subtree = parts.slice(4).join("/");
  } else if (parts[2] === "commit" && parts[3]) {
    ref = parts[3];
  }
  return { owner, repo, ref, subtree };
}

function headers(token?: string): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function fail(status: number, body: string, privateHint: boolean): Error {
  if (status === 404) {
    return new Error(
      privateHint
        ? "Repository not found. If it is private, add a session token — it is never stored."
        : "Repository not found, or the branch/commit does not exist.",
    );
  }
  if (status === 401) return new Error("GitHub token was rejected.");
  if (status === 403 && /rate limit/i.test(body)) {
    return new Error("GitHub rate limit reached. Add a session token or wait, then retry.");
  }
  if (status === 403) {
    return new Error("GitHub refused the request. The repository may be private.");
  }
  return new Error(`GitHub returned ${status}.`);
}

async function ghJson<T>(
  fetchImpl: GithubFetch,
  url: string,
  token: string | undefined,
  privateHint: boolean,
): Promise<T> {
  const res = await fetchImpl(url, { headers: headers(token) });
  const text = await res.text();
  if (!res.ok) throw fail(res.status, text, privateHint);
  return JSON.parse(text) as T;
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      out[i] = await fn(items[i]!, i);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return out;
}

export async function fetchGithubRepo(
  ref: RepoRef,
  options: {
    token?: string;
    fetchImpl?: GithubFetch;
    onProgress?: (p: GithubProgress) => void;
    signal?: AbortSignal;
  } = {},
): Promise<GithubIngest> {
  const fetchImpl = options.fetchImpl ?? (globalThis.fetch as GithubFetch);
  const token = options.token?.trim() || undefined;
  options.onProgress?.({ phase: "repo", done: 0, total: 1 });

  type RepoJson = {
    name: string;
    full_name: string;
    description: string | null;
    default_branch: string;
    private: boolean;
    html_url: string;
  };
  const repo = await ghJson<RepoJson>(
    fetchImpl,
    `${GH}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}`,
    token,
    Boolean(token),
  );
  const wantRef = ref.ref || repo.default_branch;
  options.onProgress?.({ phase: "tree", done: 0, total: 1 });

  type CommitJson = { sha: string; commit?: { tree?: { sha: string } } };
  const commit = await ghJson<CommitJson>(
    fetchImpl,
    `${GH}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}/commits/${encodeURIComponent(wantRef)}`,
    token,
    repo.private,
  );
  const treeSha = commit.commit?.tree?.sha ?? commit.sha;

  type TreeJson = {
    sha: string;
    truncated: boolean;
    tree: { path: string; type: string; size?: number; sha: string }[];
  };
  const tree = await ghJson<TreeJson>(
    fetchImpl,
    `${GH}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}/git/trees/${treeSha}?recursive=1`,
    token,
    repo.private,
  );

  const prefix = ref.subtree ? `${ref.subtree.replace(/\/$/, "")}/` : "";
  const blobs = tree.tree
    .filter((entry) => entry.type === "blob")
    .map((entry) => ({ path: entry.path, size: entry.size ?? 0, sha: entry.sha }))
    .filter((entry) => !prefix || entry.path === ref.subtree || entry.path.startsWith(prefix))
    .map((entry) =>
      prefix && entry.path.startsWith(prefix) ? { ...entry, path: entry.path.slice(prefix.length) } : entry,
    )
    .filter((entry) => entry.path);

  const skippedRoots = [
    ...new Set(tree.tree.map((entry) => skipRoot(entry.path)).filter((root): root is string => Boolean(root))),
  ].sort();

  const picked = selectSourceFiles(blobs);
  options.onProgress?.({ phase: "files", done: 0, total: picked.selected.length });

  const files: IngestedFile[] = [];
  const omittedNotes: string[] = picked.omittedPaths.map((path) => `${path} (oversize)`);
  await mapPool(picked.selected, CONCURRENCY, async (entry, i) => {
    if (options.signal?.aborted) return;
    const rawUrl = githubRawUrl(ref.owner, ref.repo, commit.sha, `${prefix}${entry.path}`);
    const apiUrl = `${GH}/repos/${ref.owner}/${ref.repo}/contents/${encodeURIComponent(prefix + entry.path)}?ref=${encodeURIComponent(commit.sha)}`;
    try {
      let text = "";
      if (token) {
        const json = await ghJson<{ encoding?: string; content?: string; download_url?: string; size?: number }>(
          fetchImpl,
          apiUrl,
          token,
          true,
        );
        if (json.encoding === "base64" && json.content) {
          text = atob(json.content.replace(/\n/g, ""));
        } else if (json.download_url) {
          const res = await fetchImpl(json.download_url, { headers: headers(token) });
          text = await res.text();
        }
      } else {
        const res = await fetchImpl(rawUrl);
        if (!res.ok) return;
        text = await res.text();
      }
      if (text.includes("\u0000")) {
        omittedNotes.push(`${entry.path} (binary)`);
        return;
      }
      if (text.length > MAX_FILE_BYTES) {
        omittedNotes.push(`${entry.path} (oversize)`);
        return;
      }
      files.push({
        path: entry.path,
        content: text,
        language: languageOf(entry.path),
        size: text.length,
      });
    } catch {
      return;
    } finally {
      options.onProgress?.({ phase: "files", done: i + 1, total: picked.selected.length, path: entry.path });
    }
  });

  if (!files.length) {
    throw new Error("No readable source files in this tree. Try a different path or a smaller repository.");
  }

  files.sort((a, b) => rankPath(b.path) - rankPath(a.path) || a.path.localeCompare(b.path));

  const fetched = new Set(files.map((file) => file.path));
  const missed = picked.selected.filter((entry) => !fetched.has(entry.path)).map((entry) => entry.path);
  for (const path of missed) {
    if (!omittedNotes.some((note) => note.startsWith(`${path} `) || note.startsWith(`${path} (`))) {
      omittedNotes.push(`${path} (unreadable)`);
    }
  }
  const omittedPaths = omittedNotes.map((note) => note.replace(/ \([^)]+\)$/, ""));
  const omitted = omittedNotes.length;

  let recentCommits: string[] = [];
  try {
    type CommitRow = { sha: string; commit?: { message?: string } };
    const rows = await ghJson<CommitRow[]>(
      fetchImpl,
      `${GH}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}/commits?sha=${encodeURIComponent(commit.sha)}&per_page=10`,
      token,
      repo.private,
    );
    recentCommits = rows.map((row) => {
      const msg = (row.commit?.message ?? "").split("\n")[0]?.trim() ?? "";
      return `${row.sha.slice(0, 7)} ${msg}`.trim();
    });
  } catch {
    recentCommits = [];
  }

  return {
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? "",
    defaultBranch: repo.default_branch,
    ref: wantRef,
    sha: commit.sha,
    htmlUrl: repo.html_url,
    private: repo.private,
    truncated: tree.truncated,
    omitted,
    omittedPaths,
    omittedNotes,
    skippedRoots,
    files,
    recentCommits,
  };
}

export function originFromGithub(ingest: GithubIngest, parsed: RepoRef) {
  return {
    kind: "github" as const,
    owner: parsed.owner,
    repo: parsed.repo,
    ref: ingest.ref,
    sha: ingest.sha,
    url: ingest.htmlUrl,
    subtree: parsed.subtree,
    truncated: ingest.truncated,
    omitted: ingest.omitted,
    omittedPaths: ingest.omittedPaths,
    omittedNotes: ingest.omittedNotes,
    skippedRoots: ingest.skippedRoots,
    recentCommits: ingest.recentCommits,
    readOnly: true as const,
  };
}

const PINNED_SHA = /^[0-9a-f]{40}$/i;
export const GIT_SHA = /^[0-9a-f]{7,40}$/i;

export function isComparableSha(value?: string): value is string {
  return Boolean(value && GIT_SHA.test(value.trim()));
}

export type GithubCompareFile = {
  path: string;
  previousPath?: string;
  status: "added" | "removed" | "changed";
};

export type GithubCompare = {
  base: string;
  head: string;
  status: string;
  aheadBy: number;
  behindBy: number;
  truncated: boolean;
  files: GithubCompareFile[];
  htmlUrl?: string;
};

function relativizeComparePath(path: string, subtree?: string): string | null {
  if (!subtree) return path;
  const prefix = subtree.replace(/\/$/, "");
  if (path === prefix) return path.split("/").pop() ?? path;
  if (path.startsWith(`${prefix}/`)) return path.slice(prefix.length + 1);
  return null;
}

function mapCompareStatus(status: string): GithubCompareFile["status"] | null {
  if (status === "added" || status === "copied") return "added";
  if (status === "removed") return "removed";
  if (status === "unchanged") return null;
  return "changed";
}

export async function fetchGithubCompare(
  ref: Pick<RepoRef, "owner" | "repo" | "subtree">,
  base: string,
  head: string,
  options: { token?: string; fetchImpl?: GithubFetch } = {},
): Promise<GithubCompare | null> {
  if (!isComparableSha(base) || !isComparableSha(head) || base === head) return null;
  const fetchImpl = options.fetchImpl ?? (globalThis.fetch as GithubFetch);
  const token = options.token?.trim() || undefined;
  const url = `${GH}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`;
  try {
    type CompareJson = {
      status?: string;
      ahead_by?: number;
      behind_by?: number;
      html_url?: string;
      files?: { filename: string; status: string; previous_filename?: string }[];
    };
    const json = await ghJson<CompareJson>(fetchImpl, url, token, Boolean(token));
    const files: GithubCompareFile[] = [];
    for (const entry of json.files ?? []) {
      const status = mapCompareStatus(entry.status);
      if (!status) continue;
      const path = relativizeComparePath(entry.filename, ref.subtree);
      if (!path) continue;
      files.push({
        path,
        previousPath: entry.previous_filename
          ? (relativizeComparePath(entry.previous_filename, ref.subtree) ?? undefined)
          : undefined,
        status,
      });
    }
    return {
      base,
      head,
      status: json.status ?? "unknown",
      aheadBy: json.ahead_by ?? 0,
      behindBy: json.behind_by ?? 0,
      truncated: (json.files?.length ?? 0) >= 300,
      files,
      htmlUrl: json.html_url,
    };
  } catch {
    return null;
  }
}

export function githubRefFromProject(project: Pick<Project, "origin" | "profile" | "seedKey">): RepoRef | null {
  const seeded = project.seedKey ?? (project.profile.id === "ajenda" || project.profile.id === "omnipath" ? project.profile.id : undefined);
  if (seeded && seeded in SUBJECT_REFRESH) {
    const configured = SUBJECT_REFRESH[seeded];
    const subtree = project.origin?.subtree;
    return subtree
      ? { owner: configured.owner, repo: configured.repo, ref: configured.ref, subtree }
      : { owner: configured.owner, repo: configured.repo, ref: configured.ref };
  }
  const origin = project.origin;
  if (origin?.kind === "github" && origin.owner && origin.repo) {
    const pinned = Boolean(origin.ref && PINNED_SHA.test(origin.ref));
    return {
      owner: origin.owner,
      repo: origin.repo,
      ref: pinned ? undefined : origin.ref,
      subtree: origin.subtree,
    };
  }
  const hint = (origin?.repo ?? project.profile.repoHint ?? "").replace(/@[\w.-]+$/, "");
  if (!hint) return null;
  return parseRepoRef(hint);
}

export function isGithubRefreshable(project: Pick<Project, "origin" | "profile">): boolean {
  return githubRefFromProject(project) !== null;
}
