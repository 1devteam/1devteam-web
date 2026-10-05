import { useState } from "react";
import { Download, GitBranch } from "lucide-react";

const EXAMPLES = ["expressjs/express", "pallets/flask"];

type RunMeta = {
  sha: string | null;
  nodes: string | null;
  edges: string | null;
  checksum: string | null;
  filename: string;
};

function parseFilename(value: string | null): string {
  if (!value) return "GRAFT-PACK.zip";
  const match = /filename="?([^";]+)"?/i.exec(value);
  return match?.[1] || "GRAFT-PACK.zip";
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown };
    if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
  } catch {
    // Canonical service may fail before producing JSON. Preserve status below.
  }
  return `G.R.A.F.T.+ reconstruction failed (${response.status}).`;
}

export function CanonicalGraftReconstruct() {
  const [repository, setRepository] = useState("");
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<RunMeta | null>(null);

  async function reconstruct(rawRepository: string) {
    const value = rawRepository.trim();
    if (!value) return;
    setBusy(true);
    setError(null);
    setMeta(null);

    try {
      const payload: { repository: string; ref?: string } = { repository: value };
      if (ref.trim()) payload.ref = ref.trim();

      const response = await fetch("/api/graft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await errorMessage(response));

      const blob = await response.blob();
      const filename = parseFilename(response.headers.get("content-disposition"));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setMeta({
        filename,
        sha: response.headers.get("x-graft-subject-sha"),
        nodes: response.headers.get("x-graft-node-count"),
        edges: response.headers.get("x-graft-edge-count"),
        checksum: response.headers.get("x-graft-checksum"),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Canonical G.R.A.F.T.+ service is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="reconstruct" className="scroll-mt-24 border-b border-border">
      <div className="container-site max-w-3xl py-12 sm:py-16">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs tracking-[0.18em] text-subtle">CANONICAL ENGINE</p>
          <h2 className="mt-2 text-xl font-medium tracking-tight">Reconstruct a public GitHub repository</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            This page does not implement G.R.A.F.T.+ itself. It submits the repository to the canonical
            <span className="font-mono"> 1devteam/graft_plus </span>
            service and downloads the pack returned by that engine.
          </p>

          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void reconstruct(repository);
            }}
          >
            <label className="block">
              <span className="text-xs text-subtle">Public repository</span>
              <input
                value={repository}
                onChange={(event) => setRepository(event.target.value)}
                placeholder="owner/repo"
                autoComplete="off"
                spellCheck={false}
                className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-subtle">Optional branch, tag, or commit SHA</span>
              <input
                value={ref}
                onChange={(event) => setRef(event.target.value)}
                placeholder="main or exact SHA"
                autoComplete="off"
                spellCheck={false}
                className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 font-mono text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={busy || !repository.trim()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              <GitBranch className="size-4" />
              {busy ? "Reconstructing…" : "Reconstruct with canonical G.R.A.F.T.+"}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                disabled={busy}
                onClick={() => {
                  setRepository(example);
                  void reconstruct(example);
                }}
                className="min-h-9 rounded-full border border-border px-3 font-mono text-xs text-muted hover:text-fg disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>

          {error ? (
            <div className="mt-5 rounded-md border border-bad/30 bg-bad/10 p-4 text-sm text-bad">
              <p className="font-medium">Reconstruction unavailable</p>
              <p className="mt-1">{error}</p>
              <p className="mt-2 text-xs opacity-80">
                The site will not fall back to its retired embedded reconstruction engine. This prevents
                a stale website implementation from presenting itself as canonical G.R.A.F.T.+.
              </p>
            </div>
          ) : null}

          {meta ? (
            <div className="mt-5 rounded-md border border-border bg-bg p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Download className="size-4" /> Pack downloaded
              </div>
              <dl className="mt-3 grid gap-2 font-mono text-xs text-muted sm:grid-cols-2">
                <div><dt className="text-subtle">file</dt><dd>{meta.filename}</dd></div>
                <div><dt className="text-subtle">subject SHA</dt><dd>{meta.sha || "not returned"}</dd></div>
                <div><dt className="text-subtle">nodes</dt><dd>{meta.nodes || "not returned"}</dd></div>
                <div><dt className="text-subtle">edges</dt><dd>{meta.edges || "not returned"}</dd></div>
                <div className="sm:col-span-2"><dt className="text-subtle">checksum</dt><dd className="break-all">{meta.checksum || "not returned"}</dd></div>
              </dl>
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-medium">Single authority</h2>
            <p className="mt-2 text-sm text-muted">
              Reconstruction semantics, graph schemas, assurance rules, and pack generation live in
              <span className="font-mono"> graft_plus</span>. The website is only the delivery surface.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-medium">Fail closed</h2>
            <p className="mt-2 text-sm text-muted">
              If the canonical service is not configured or cannot be reached, reconstruction stops.
              The browser does not silently substitute a separate implementation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
