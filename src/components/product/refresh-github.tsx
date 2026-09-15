import { useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  fetchGithubCompare,
  fetchGithubRepo,
  githubRefFromProject,
  isComparableSha,
  originFromGithub,
} from "@/lib/product/github";
import type { GithubProgress } from "@/lib/product/github";
import { useProductStore } from "@/lib/product/store";
import type { Project, RefreshDelta } from "@/lib/product/types";

function progressLabel(p: GithubProgress | null): string {
  if (!p) return "Reading repository…";
  if (p.phase === "repo") return "Resolving repository…";
  if (p.phase === "tree") return "Reading git tree…";
  if (p.phase === "compare") return "Comparing previous revision…";
  return `Reading files ${p.done}/${p.total}${p.path ? ` · ${p.path.split("/").pop()}` : ""}`;
}

function shortSha(value?: string) {
  return value ? value.slice(0, 12) : "none";
}

function RoundDelta({ delta, slice }: { delta: RefreshDelta; slice: string[] }) {
  const files = [
    ...delta.changed.map((path) => ({ path, mark: "changed" })),
    ...delta.added.map((path) => ({ path, mark: "added" })),
    ...delta.removed.map((path) => ({ path, mark: "removed" })),
  ];
  const shown = files.slice(0, 12);
  const hidden = files.length - shown.length;
  const nodes = [...delta.nodesAdded.map((id) => `+ ${id}`), ...delta.nodesDropped.map((id) => `− ${id}`)].slice(0, 8);
  const nodeHidden = delta.nodesAdded.length + delta.nodesDropped.length - nodes.length;
  return (
    <div className="mt-4 rounded-md border border-border bg-bg p-4">
      <p className="font-mono text-xs tracking-[0.18em] text-subtle">THIS ROUND</p>
      <p className="mt-2 font-mono text-xs text-fg">
        {shortSha(delta.fromSha)} → {shortSha(delta.toSha)}
        {" · "}
        {delta.source === "github-compare" ? "GitHub compare" : "ingested tree"}
        {delta.truncated ? " · truncated" : ""}
      </p>
      <p className="mt-2 text-sm text-muted">
        {delta.changed.length} changed · {delta.added.length} added · {delta.removed.length} removed
        {delta.unchanged ? ` · ${delta.unchanged} unchanged in reconstruction` : ""}
        {delta.subtree ? ` · /${delta.subtree}` : ""}
      </p>
      {delta.omitted || delta.truncated ? (
        <p className="mt-2 text-sm text-warn">
          {delta.truncated ? "GitHub tree truncated. " : ""}
          {delta.omitted ? `${delta.omitted} files omitted by cap. Incomplete inventory stays INDETERMINATE.` : ""}
        </p>
      ) : null}
      {delta.omittedPaths?.length ? (
        <p className="mt-1 font-mono text-xs text-subtle">{delta.omittedPaths.slice(0, 6).join(" · ")}</p>
      ) : null}
      <p className="mt-1 text-sm text-muted">
        Generated nodes +{delta.nodesAdded.length} / −{delta.nodesDropped.length}. Overlay kept.
      </p>
      {shown.length ? (
        <ul className="mt-3 max-h-48 space-y-1 overflow-auto">
          {shown.map((item) => (
            <li key={`${item.mark}:${item.path}`} className="flex justify-between gap-3 font-mono text-xs">
              <span className="min-w-0 truncate text-fg">{item.path}</span>
              <span className="shrink-0 text-subtle">{item.mark}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">No file movement in this round.</p>
      )}
      {hidden > 0 ? <p className="mt-2 font-mono text-xs text-subtle">and {hidden} more</p> : null}
      {nodes.length ? (
        <p className="mt-2 font-mono text-xs text-subtle">{nodes.join(" · ")}</p>
      ) : null}
      {nodeHidden > 0 ? <p className="font-mono text-xs text-subtle">and {nodeHidden} more nodes</p> : null}
      <p className="mt-3 font-mono text-xs text-subtle">
        This round · {slice.length} file{slice.length === 1 ? "" : "s"}
        {slice.length ? ` · ${slice.slice(0, 3).join(", ")}${slice.length > 3 ? "…" : ""}` : ""}
      </p>
      {delta.compareUrl ? (
        <a
          href={delta.compareUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex min-h-11 items-center text-sm text-muted hover:text-fg"
        >
          Open compare on GitHub
        </a>
      ) : null}
    </div>
  );
}

export function RefreshGithub({ project }: { project: Project }) {
  const refreshProject = useProductStore((s) => s.refreshProject);
  const parsed = githubRefFromProject(project);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<GithubProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [subtree, setSubtree] = useState(project.origin?.subtree ?? parsed?.subtree ?? "");

  if (!parsed) return null;

  const repoRef = parsed;
  const sha = project.origin?.sha ?? project.profile.provenance.sha;

  async function refresh() {
    setError(null);
    setNote(null);
    setBusy(true);
    setProgress({ phase: "repo", done: 0, total: 1 });
    try {
      const ingest = await fetchGithubRepo(
        { ...repoRef, subtree: subtree.trim() || undefined },
        {
          token: token.trim() || undefined,
          onProgress: setProgress,
        },
      );
      const origin = originFromGithub(ingest, { ...repoRef, subtree: subtree.trim() || undefined });
      const previous = sha;
      let compare = null;
      if (isComparableSha(previous) && previous !== ingest.sha) {
        setProgress({ phase: "compare", done: 0, total: 1 });
        compare = await fetchGithubCompare(
          { ...repoRef, subtree: subtree.trim() || undefined },
          previous,
          ingest.sha,
          {
            token: token.trim() || undefined,
          },
        );
      }
      refreshProject(project.id, ingest.files, origin, compare);
      if (previous && previous === ingest.sha) {
        setNote(`Still at ${ingest.sha.slice(0, 12)}. Graph rebuilt from that tree.`);
      } else if (compare && previous) {
        setNote(
          `Now at ${ingest.sha.slice(0, 12)}. This round is the GitHub compare from ${previous.slice(0, 12)}.`,
        );
      } else {
        setNote(
          `Now at ${ingest.sha.slice(0, 12)}${previous ? ` (was ${previous.slice(0, 12)})` : ""}. This round is the ingested-tree delta.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh that repository.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <section className="min-w-0 rounded-lg border border-border bg-surface p-5">
      <p className="font-mono text-xs tracking-[0.18em] text-subtle">REFRESH FROM GITHUB</p>
      <h2 className="mt-2 text-xl font-medium tracking-tight">Rebuild against the latest tree</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        After you push, refresh overwrites this reconstruction and records the round delta.
        When a previous SHA exists, that compare is the round. Optional subtree reconstructs
        only that path. Overlay is kept. Merge stays not-determined.
      </p>
      <p className="mt-3 font-mono text-xs text-subtle">
        {parsed.owner}/{parsed.repo}
        {parsed.ref ? `@${parsed.ref}` : ""}
        {parsed.subtree ? ` / ${parsed.subtree}` : ""}
        {sha ? ` · last ${sha.slice(0, 12)}` : ""}
      </p>
      <label className="mt-3 block">
        <span className="text-xs text-subtle">Subtree (optional) — refresh this path only</span>
        <input
          value={subtree}
          onChange={(e) => setSubtree(e.target.value)}
          placeholder="backend/services"
          className="mt-1 min-h-11 w-full min-w-0 max-w-full rounded-md border border-border bg-bg px-3 font-mono text-sm"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void refresh()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-fg disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />
          {busy ? "Refreshing…" : "Refresh reconstruction"}
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full border border-border px-4 text-sm text-muted hover:text-fg"
          onClick={() => setShowToken((v) => !v)}
        >
          {showToken ? "Hide token" : "Private / rate limit"}
        </button>
      </div>
      {showToken ? (
        <label className="mt-3 block">
          <span className="text-xs text-subtle">Session token — not persisted, not logged</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm"
          />
        </label>
      ) : null}
      {busy ? <p className="mt-3 font-mono text-xs text-subtle">{progressLabel(progress)}</p> : null}
      {note ? <p className="mt-3 text-sm text-ok">{note}</p> : null}
      {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
      {project.lastDelta ? <RoundDelta delta={project.lastDelta} slice={project.changedFiles} /> : null}
    </section>
  );
}
