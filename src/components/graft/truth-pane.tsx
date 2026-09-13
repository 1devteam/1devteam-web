import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { downloadFacts } from "@/lib/graft/export";
import { FACT_KINDS } from "@/lib/graft/facts";
import type { FactKind, PipelinePacket, SlicedFact } from "@/lib/graft/types";
import { cn } from "@/lib/utils";

type Props = {
  packet: PipelinePacket;
};

function proofTone(proofClass: string) {
  if (proofClass === "unit-test" || proofClass === "integration-test" || proofClass === "migration") {
    return "text-ok";
  }
  if (proofClass === "docs-only" || proofClass === "distilled" || proofClass === "unproven") {
    return "text-warn";
  }
  return "text-subtle";
}

export function TruthPane({ packet }: Props) {
  const [kind, setKind] = useState<FactKind>("inventory");
  const [capability, setCapability] = useState<string>("all");

  const facts = useMemo(() => {
    return packet.truth.facts.filter((fact) => {
      if (fact.kind !== kind) return false;
      if (capability === "all") return fact.inSlice || fact.kind === "reference" || fact.kind === "freshness";
      return fact.capability === capability;
    });
  }, [packet.truth.facts, kind, capability]);

  const counts = useMemo(() => {
    const map = new Map<FactKind, number>();
    for (const fact of packet.truth.facts) {
      if (!fact.inSlice && fact.kind !== "reference" && fact.kind !== "freshness") continue;
      map.set(fact.kind, (map.get(fact.kind) ?? 0) + 1);
    }
    return map;
  }, [packet.truth.facts]);

  return (
    <div className="grid gap-4">
      <article className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs tracking-widest text-subtle">FACT SUBSTRATE · 1.0-TRUTH</p>
            <h2 className="mt-1 text-lg font-medium tracking-tight">Evidence-linked system truth</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Facts a planner can consume. Not a correction sequence. Not merge authority.
              Reference observations stay observations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadFacts(packet)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-bg px-4 text-sm font-medium"
          >
            <Download className="size-4" />
            Export facts
          </button>
        </div>
        <dl className="mt-4 grid gap-3 font-mono text-xs text-subtle sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt>provenance</dt>
            <dd className="mt-1 text-fg">{packet.truth.provenance.kind}</dd>
          </div>
          <div>
            <dt>repo</dt>
            <dd className="mt-1 text-fg">{packet.truth.provenance.repo}</dd>
          </div>
          <div>
            <dt>sha</dt>
            <dd className="mt-1 break-all text-fg">{packet.truth.provenance.sha ?? "distilled"}</dd>
          </div>
          <div>
            <dt>captured</dt>
            <dd className="mt-1 text-fg">{packet.truth.provenance.capturedAt}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-muted">{packet.truth.provenance.note}</p>
      </article>

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-lg border border-border bg-surface p-4">
            <p className="font-mono text-xs tracking-widest text-subtle">CAPABILITY</p>
            <ul className="mt-3 space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => setCapability("all")}
                  className={cn(
                    "min-h-11 w-full rounded-md border px-3 py-2 text-left text-sm",
                    capability === "all" ? "border-accent bg-elevated" : "border-border bg-bg",
                  )}
                >
                  Slice and standing facts
                </button>
              </li>
              {packet.truth.capabilities.map((cap) => (
                <li key={cap.id}>
                  <button
                    type="button"
                    onClick={() => setCapability(cap.id)}
                    className={cn(
                      "min-h-11 w-full rounded-md border px-3 py-2 text-left",
                      capability === cap.id ? "border-accent bg-elevated" : "border-border bg-bg",
                    )}
                  >
                    <span className="block text-sm font-medium">{cap.label}</span>
                    <span className="mt-1 block font-mono text-xs text-subtle">
                      {cap.inSlice ? "in slice" : "outside slice"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-2">
            {FACT_KINDS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setKind(item.id)}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors duration-150",
                  kind === item.id
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-surface text-fg",
                )}
              >
                {item.label}
                <span className="ml-2 font-mono text-xs opacity-70">{counts.get(item.id) ?? 0}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">{FACT_KINDS.find((item) => item.id === kind)?.meaning}</p>

          {kind === "dependency" && packet.truth.derivedDependencies.length ? (
            <article className="rounded-lg border border-border bg-surface p-4">
              <p className="font-mono text-xs tracking-widest text-subtle">DERIVED FROM GRAPH EDGES</p>
              <ul className="mt-3 space-y-2">
                {packet.truth.derivedDependencies.map((edge) => (
                  <li
                    key={`${edge.from}-${edge.to}-${edge.kind}`}
                    className="font-mono text-xs text-muted"
                  >
                    {edge.from} → {edge.kind} {edge.to} · {edge.layer} · {edge.evidence}
                  </li>
                ))}
              </ul>
            </article>
          ) : null}

          {facts.length ? (
            <ul className="space-y-3">
              {facts.map((fact) => (
                <FactCard key={fact.id} fact={fact} />
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-border bg-surface p-5 text-sm text-subtle">
              No facts of this kind in the current filter.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function FactCard({ fact }: { fact: SlicedFact }) {
  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-mono text-xs text-subtle">{fact.id}</p>
        <div className="flex flex-wrap gap-2">
          {fact.referenceOnly ? (
            <span className="rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 font-mono text-[11px] text-warn">
              not a decision
            </span>
          ) : null}
          {fact.stale ? (
            <span className="rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 font-mono text-[11px] text-warn">
              stale
            </span>
          ) : null}
          {fact.gapKind ? (
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted">
              {fact.gapKind}
            </span>
          ) : null}
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-mono text-[11px]",
              fact.inSlice ? "border-ok/30 text-ok" : "border-border text-subtle",
            )}
          >
            {fact.inSlice ? "in slice" : "standing"}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium">{fact.claim}</p>
      {fact.declared || fact.observed ? (
        <p className="mt-2 grid gap-1 font-mono text-[11px] text-subtle sm:grid-cols-2">
          {fact.declared ? <span>declared · {fact.declared}</span> : null}
          {fact.observed ? <span>observed · {fact.observed}</span> : null}
        </p>
      ) : null}
      {fact.owner ? (
        <p className="mt-2 font-mono text-[11px] text-subtle">owner {fact.owner}</p>
      ) : null}
      {fact.notOwned?.length ? (
        <p className="mt-2 font-mono text-[11px] text-subtle">
          does not own · {fact.notOwned.join(" · ")}
        </p>
      ) : null}
      {fact.mustNotChange?.length ? (
        <p className="mt-2 font-mono text-[11px] text-warn">
          must not change · {fact.mustNotChange.join(" · ")}
        </p>
      ) : null}
      <ul className="mt-3 space-y-2 border-t border-border pt-3">
        {fact.evidence.map((item, index) => (
          <li key={`${item.path}-${index}`}>
            <p className={cn("font-mono text-[11px]", proofTone(item.proofClass))}>
              {item.proofClass}
              {item.symbol ? ` · ${item.symbol}` : ""}
            </p>
            <p className="font-mono text-xs text-muted">{item.path}</p>
            <p className="text-xs text-subtle">{item.note}</p>
          </li>
        ))}
      </ul>
    </li>
  );
}
