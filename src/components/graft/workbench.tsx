import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Download } from "lucide-react";
import { GraphMap } from "@/components/graft/graph-map";
import { RecordsPane } from "@/components/graft/records-pane";
import { SchemaPane } from "@/components/graft/schema-pane";
import { TruthPane } from "@/components/graft/truth-pane";
import { downloadPacket } from "@/lib/graft/export";
import { runPipeline } from "@/lib/graft/engine";
import { EMPTY_PUBLIC_SUBJECT, loadPublicRepository } from "@/lib/graft/github";
import { STAGES } from "@/lib/graft/records";
import type { Disposition, SubjectProfile } from "@/lib/graft/types";
import { cn } from "@/lib/utils";

const PANES = [
  ["run", "Run"],
  ["truth", "Truth"],
  ["schema", "Schema"],
  ["records", "Records"],
] as const;

type Pane = (typeof PANES)[number][0];
type Inspector = "residuals" | "decision" | "impact" | "proof" | "adjudication";

function dispositionTone(d: Disposition) {
  if (d === "clear") return "text-ok border-ok/30 bg-ok/10";
  if (d === "blocked") return "text-bad border-bad/30 bg-bad/10";
  return "text-warn border-warn/30 bg-warn/10";
}

function statusTone(status: string) {
  if (status === "SATISFIED") return "text-ok";
  if (status === "VIOLATED") return "text-bad";
  if (status === "INDETERMINATE") return "text-warn";
  return "text-subtle";
}

export function Workbench() {
  const [subject, setSubject] = useState<SubjectProfile>(EMPTY_PUBLIC_SUBJECT);
  const [repoUrl, setRepoUrl] = useState("https://github.com/1devteam/ajenda-ai");
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [pane, setPane] = useState<Pane>("run");
  const [inspector, setInspector] = useState<Inspector>("adjudication");
  const packet = useMemo(
    () => runPipeline(subject, files.length ? files : subject.files.slice(0, 1)),
    [subject, files],
  );

  const highlight = useMemo(() => {
    const ids = [
      ...packet.impact.changedNodes,
      ...packet.impact.upstreamConsumers,
      ...packet.impact.downstreamDependencies,
    ].map((n) => n.id);
    return new Set(ids);
  }, [packet]);

  async function analyzeRepository(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadPublicRepository(repoUrl);
      setSubject(loaded.subject);
      setFiles(loaded.changedFiles);
      setSelected(null);
      setInspector("adjudication");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Repository analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  const selectedNode = packet.graph.nodes.find((n) => n.id === selected);
  const selectedEdges = selected
    ? packet.graph.edges.filter((edge) => edge.from === selected || edge.to === selected)
    : [];
  return (
    <div id="graft-plus" className="graft-workbench bg-bg text-fg">
      <header className="border-b border-border px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.22em] text-subtle">
              GRAFT_PLUS · UNIVERSAL CORE
            </p>
            <h2 className="mt-1 text-3xl font-medium tracking-tight text-fg sm:text-4xl">
              Working prototype
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Reconstruct an existing system into evidence-linked facts. Residuals stay visible.
              Not a planner. Not merge authority.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="G.R.A.F.T.+ panes">
            {PANES.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={pane === id}
                onClick={() => setPane(id)}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors duration-150",
                  pane === id
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-surface text-fg",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-surface px-4 py-3 sm:px-6">
          <p className="mx-auto max-w-7xl text-sm text-muted">
            Public repositories are analyzed from bounded source reads. Runtime behavior remains
            explicitly unknown unless runtime evidence is supplied. Merge authorization remains{" "}
          <span className="font-mono text-fg">not-determined</span>. Schema-valid is not proof of
          behavioral consumption. Acknowledgements are not repairs.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {pane === "truth" ? <TruthPane packet={packet} /> : null}
        {pane === "schema" ? <SchemaPane /> : null}
        {pane === "records" ? <RecordsPane /> : null}
        {pane === "run" ? (
          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-w-0 space-y-4">
              <section className="rounded-lg border border-border bg-surface p-4">
                <p className="font-mono text-xs tracking-widest text-subtle">PUBLIC GITHUB REPOSITORY</p>
                <form className="mt-3 grid gap-3" onSubmit={analyzeRepository}>
                  <label className="grid gap-1 text-sm">
                    <span className="text-muted">Repository URL</span>
                    <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/owner/repository" className="min-h-11 rounded-md border border-border bg-bg px-3 font-mono text-xs" type="url" required />
                  </label>
                  <button type="submit" disabled={loading} className="min-h-11 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg disabled:opacity-60">
                    {loading ? "Reading repository…" : "Map repository"}
                  </button>
                </form>
                {error ? <p role="alert" className="mt-3 text-sm text-bad">{error}</p> : null}
                <p className="mt-3 text-sm text-muted">{subject.dna}</p>
                <p className="mt-2 font-mono text-[11px] text-subtle">{subject.provenance.repo} · {subject.provenance.sha ?? "not loaded"}</p>
              </section>

              <section className="rounded-lg border border-border bg-surface p-4">
                <p className="font-mono text-xs tracking-widest text-subtle">CHANGED FILES</p>
                <ul className="mt-3 space-y-2">
                  {subject.files.slice(0, 40).map((path) => <li key={path} className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs">{path}</li>)}
                </ul>
                {subject.files.length > 40 ? <p className="mt-2 text-xs text-subtle">Showing 40 of {subject.files.length} indexed files.</p> : null}
              </section>
            </aside>

            <section className="min-w-0 space-y-4">
              <div className="flex flex-wrap gap-2">
                {STAGES.map((stage) => (
                  <span
                    key={stage.id}
                    className="rounded-full border border-border bg-elevated px-3 py-1 font-mono text-xs text-muted"
                  >
                    {stage.title}
                  </span>
                ))}
              </div>

              <div
                className={cn(
                  "rounded-lg border px-4 py-3",
                  dispositionTone(packet.decision.disposition),
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium tracking-tight">
                      Disposition: {packet.decision.disposition}
                    </p>
                    <p className="mt-1 text-sm opacity-80">
                      SATISFIED {packet.decision.counts.satisfied} · VIOLATED{" "}
                      {packet.decision.counts.violated} · INDETERMINATE{" "}
                      {packet.decision.counts.indeterminate}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-xs tabular-nums">fp {packet.fingerprint}</p>
                    <button
                      type="button"
                      onClick={() => downloadPacket(packet)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-current/30 bg-bg/40 px-4 text-sm font-medium"
                    >
                      <Download className="size-4" />
                      Export packet
                    </button>
                  </div>
                </div>
              </div>

              <GraphMap
                nodes={packet.graph.nodes}
                edges={packet.graph.edges}
                highlight={highlight}
                selected={selected}
                onSelect={setSelected}
              />

              {selectedNode ? (
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="font-mono text-xs text-subtle">
                    {selectedNode.kind} · {selectedNode.layer} · {selectedNode.domain}
                  </p>
                  <p className="mt-1 font-medium">{selectedNode.id}</p>
                  <p className="mt-1 font-mono text-xs text-muted">{selectedNode.source}</p>
                  {selectedEdges.length ? (
                    <ul className="mt-3 space-y-1 border-t border-border pt-3">
                      {selectedEdges.map((edge) => (
                        <li
                          key={`${edge.from}-${edge.to}-${edge.kind}`}
                          className="font-mono text-xs text-subtle"
                        >
                          {edge.from === selectedNode.id ? "→" : "←"} {edge.kind}{" "}
                          {edge.from === selectedNode.id ? edge.to : edge.from} · {edge.layer}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-lg border border-border bg-surface">
                <div className="flex flex-wrap gap-1 border-b border-border p-2">
                  {(
                    [
                      ["adjudication", "Adjudication"],
                      ["residuals", "Residuals"],
                      ["decision", "Decision"],
                      ["impact", "Impact"],
                      ["proof", "Proof"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setInspector(id)}
                      className={cn(
                        "min-h-11 rounded-md px-3 text-sm font-medium",
                        inspector === id ? "bg-elevated text-fg" : "text-muted",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  {inspector === "residuals" ? (
                    <PacketList
                      items={packet.graph.residuals.map((r) => `${r.category} · ${r.detail}`)}
                      empty="No residuals on this graph."
                    />
                  ) : null}
                  {inspector === "decision" ? (
                    <PacketList
                      items={[
                        `merge authorization: ${packet.decision.mergeAuthorization}`,
                        ...packet.decision.blockingReasons.map((r) => `BLOCK · ${r}`),
                        ...packet.decision.reviewReasons.map((r) => `REVIEW · ${r}`),
                        ...packet.decision.warnings.map((r) => `WARN · ${r}`),
                      ]}
                      empty="No blocking or review reasons on this slice."
                    />
                  ) : null}
                  {inspector === "impact" ? (
                    <PacketList
                      items={[
                        `Changed nodes: ${packet.impact.changedNodes.map((n) => n.id).join(", ") || "none"}`,
                        `Consumers: ${packet.impact.upstreamConsumers.map((n) => n.id).join(", ") || "none"}`,
                        `Dependencies: ${packet.impact.downstreamDependencies.map((n) => n.id).join(", ") || "none"}`,
                        `Risk domains: ${packet.impact.riskDomains.join(", ") || "none"}`,
                        ...packet.impact.relevantInvariants.map((inv) => `${inv.id} · ${inv.statement}`),
                      ]}
                      empty="No mapped impact."
                    />
                  ) : null}
                  {inspector === "proof" ? (
                    <PacketList
                      items={[
                        ...packet.proof.selectedBundles.map((b) => `${b.id} · ${b.reason}`),
                        ...packet.proof.requiredTests.map((t) => `test · ${t}`),
                        ...packet.proof.requiredGates.map((g) => `gate · ${g}`),
                        ...packet.proof.reviewGates.map((g) => `review · ${g}`),
                      ]}
                      empty="No proof bundle selected."
                    />
                  ) : null}
                  {inspector === "adjudication" ? (
                    <ul className="space-y-4">
                      {packet.adjudication.map((row) => (
                        <li key={row.findingId} className="border-t border-border pt-4 first:border-0 first:pt-0">
                          <p className="text-sm font-medium">{row.title}</p>
                          <p className={cn("mt-1 font-mono text-xs", statusTone(row.status))}>
                            {row.status}
                          </p>
                          <p className="mt-2 grid gap-1 font-mono text-[11px] text-subtle sm:grid-cols-4">
                            <span>bind {row.binding}</span>
                            <span>schema {row.schema}</span>
                            <span>consume {row.consumption}</span>
                            <span>{row.applicable ? "in slice" : "outside slice"}</span>
                          </p>
                          <p className="mt-2 text-xs text-muted">{row.note}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>

      <footer className="border-t border-border px-4 py-5 sm:px-6">
        <p className="mx-auto max-w-7xl text-xs text-subtle">
          G.R.A.F.T.+ reconstructs what exists. Enforcement remains disabled. Omnipath v2 is
          source-backed; Ajenda remains the longitudinal control. Frozen records are not rewritten.
        </p>
      </footer>
    </div>
  );
}

function PacketList({
  items,
  empty,
}: {
  items: string[];
  empty: string;
}) {
  if (!items.length) {
    return <p className="text-sm text-subtle">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="text-sm leading-snug text-muted">
          {item}
        </li>
      ))}
    </ul>
  );
}
