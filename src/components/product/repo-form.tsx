import { useState } from "react";
import { GitBranch } from "lucide-react";
import { fetchGithubRepo, originFromGithub, parseRepoRef } from "@/lib/product/github";
import type { GithubProgress } from "@/lib/product/github";
import { useProductStore } from "@/lib/product/store";

const EXAMPLES = ["expressjs/express", "pallets/flask"];

type ReconstructionStage = "fetch" | "index" | "complete";

function progressLabel(p: GithubProgress | null, stage: ReconstructionStage): string {
  if (stage === "index") return "Indexing and reconstructing architecture…";
  if (stage === "complete") return "Reconstruction complete. Opening workspace…";
  if (!p) return "Reading repository…";
  if (p.phase === "repo") return "Resolving repository…";
  if (p.phase === "tree") return "Reading git tree…";
  const percent = p.total > 0 ? Math.min(100, Math.round((p.done / p.total) * 100)) : 0;
  return `Reading files ${p.done}/${p.total} (${percent}%)${p.path ? ` · ${p.path.split("/").pop()}` : ""}`;
}

function stageDetail(p: GithubProgress | null, stage: ReconstructionStage): string {
  if (stage === "fetch") {
    if (p?.phase === "files") return "GitHub source ingest is active. Large repositories can remain in this phase for a while.";
    return "Resolving repository identity and source tree.";
  }
  if (stage === "index") {
    return "Source ingest finished. G.R.A.F.T.+ is building contracts, imports, routes, wiring, graph facts, and the session model.";
  }
  return "The reconstructed session is ready.";
}

export function RepoForm({
  onOpened,
}: {
  onOpened: (projectId: string) => void;
}) {
  const ingestCustom = useProductStore((s) => s.ingestCustom);
  const [input, setInput] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<GithubProgress | null>(null);
  const [stage, setStage] = useState<ReconstructionStage>("fetch");
  const [error, setError] = useState<string | null>(null);

  async function openRepo(raw: string) {
    const parsed = parseRepoRef(raw);
    if (!parsed) {
      setError("Use owner/repo or a github.com URL.");
      return;
    }
    setError(null);
    setBusy(true);
    setStage("fetch");
    setProgress({ phase: "repo", done: 0, total: 1 });
    try {
      const ingest = await fetchGithubRepo(parsed, {
        token: token.trim() || undefined,
        onProgress: setProgress,
      });
      const origin = originFromGithub(ingest, parsed);

      setStage("index");
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const id = ingestCustom(ingest.fullName, ingest.files, origin);
      setStage("complete");
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      setInput("");
      onOpened(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that repository.");
    } finally {
      setBusy(false);
      setProgress(null);
      setStage("fetch");
    }
  }

  return (
    <form
      className="rounded-lg border border-border bg-surface p-5"
      onSubmit={(e) => {
        e.preventDefault();
        void openRepo(input);
      }}
    >
      <p className="font-mono text-xs tracking-[0.18em] text-subtle">PUBLIC REPOSITORY</p>
      <h2 className="mt-2 text-xl font-medium tracking-tight">Paste a GitHub repo</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Reads a public GitHub tree and runs the G.R.A.F.T.+ reconstruction (graft_plus). The download is the architecture pack, not a source zip. Overlay stays residual.
      </p>
      <label className="mt-4 block">
        <span className="text-xs text-subtle">Paste owner/repo</span>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="owner/repo"
            autoComplete="off"
            spellCheck={false}
            className="min-h-11 flex-1 rounded-md border border-border bg-bg px-3 text-sm"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            <GitBranch className="size-4" />
            {busy ? "Reconstructing…" : "Reconstruct"}
          </button>
        </div>
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            disabled={busy}
            onClick={() => {
              setInput(ex);
              void openRepo(ex);
            }}
            className="min-h-9 rounded-full border border-border px-3 font-mono text-xs text-muted hover:text-fg"
          >
            {ex}
          </button>
        ))}
        <button
          type="button"
          className="min-h-9 rounded-full px-3 text-xs text-subtle hover:text-fg"
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
      {busy ? (
        <div className="mt-4 rounded-md border border-border bg-bg p-3" aria-live="polite">
          <p className="font-mono text-xs font-medium text-fg">{progressLabel(progress, stage)}</p>
          <p className="mt-1 text-xs text-subtle">{stageDetail(progress, stage)}</p>
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
    </form>
  );
}
