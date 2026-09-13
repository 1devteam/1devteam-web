import { useMemo, useState } from "react";
import { runPipeline, evaluateTransfer } from "@/lib/graft/engine";
import { PROFILE_ONLY, SUBJECTS } from "@/lib/graft/subjects";
import { HYPOTHESIS } from "@/lib/graft/records";
import { cn } from "@/lib/utils";
import type { Disposition, ScenarioKind } from "@/lib/graft/types";

const KINDS: { id: ScenarioKind; label: string }[] = [
  { id: "surface", label: "Surface" },
  { id: "authority", label: "Authority" },
  { id: "residual", label: "Residual" },
  { id: "unmapped", label: "Unmapped" },
];

function tone(d: Disposition) {
  if (d === "clear") return "text-ok border-ok/30 bg-ok/10";
  if (d === "blocked") return "text-bad border-bad/30 bg-bad/10";
  return "text-warn border-warn/30 bg-warn/10";
}

export function TransferPane() {
  const [kind, setKind] = useState<ScenarioKind>("surface");
  const checks = useMemo(() => evaluateTransfer(), []);
  const runs = useMemo(
    () =>
      SUBJECTS.map((subject) => {
        const scenario = subject.scenarios.find((s) => s.kind === kind) ?? subject.scenarios[0];
        return { subject, scenario, packet: runPipeline(subject, scenario.files) };
      }),
    [kind],
  );

  return (
    <div className="grid gap-4">
      <article className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs tracking-widest text-subtle">TWO-SUBJECT SLICE</p>
            <h2 className="mt-1 text-lg font-medium tracking-tight">Same engine, different DNA</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Ajenda remains the longitudinal subject. Omnipath v2 is the transfer subject.
              Profile rules stay profile rules.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setKind(item.id)}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors duration-150",
                  kind === item.id
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-bg text-fg",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {runs.map(({ subject, scenario, packet }) => (
            <div key={subject.id} className="rounded-md border border-border bg-bg p-4">
              <p className="font-mono text-xs tracking-widest text-subtle">
                {subject.id.toUpperCase()} · {scenario.label.toUpperCase()}
              </p>
              <p className="mt-2 text-sm text-muted">{scenario.intent}</p>
              <p
                className={cn(
                  "mt-3 inline-flex rounded-full border px-3 py-1 font-mono text-xs",
                  tone(packet.decision.disposition),
                )}
              >
                {packet.decision.disposition}
              </p>
              <p className="mt-3 font-mono text-xs text-subtle">
                SAT {packet.decision.counts.satisfied} · VIO {packet.decision.counts.violated} · IND{" "}
                {packet.decision.counts.indeterminate} · residuals {packet.graph.residuals.length}
              </p>
              <p className="mt-2 font-mono text-[11px] text-muted">{scenario.files.join(" · ")}</p>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-lg font-medium tracking-tight">Transfer checks</h2>
          <p className="mt-2 text-sm text-muted">
            Checks the core, not product superiority. A break here is a schema problem, not a
            subject defect.
          </p>
          <ul className="mt-4 space-y-3">
            {checks.map((check) => (
              <li key={check.id} className="border-t border-border pt-3 first:border-0 first:pt-0">
                <p className="text-sm font-medium">{check.statement}</p>
                <p className={cn("mt-1 font-mono text-xs", check.holds ? "text-ok" : "text-bad")}>
                  {check.holds ? "holds" : "breaks"} · {check.note}
                </p>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-lg font-medium tracking-tight">What stays a profile</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <p className="font-mono text-xs text-subtle">AJENDA · LONGITUDINAL</p>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {PROFILE_ONLY.ajenda.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs text-subtle">OMNIPATH V2 · TRANSFER</p>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {PROFILE_ONLY.omnipath.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-5 border-t border-border pt-4 text-sm text-muted">
            <span className="font-medium text-fg">Hypothesis, not a claim. </span>
            {HYPOTHESIS}
          </p>
        </article>
      </div>
    </div>
  );
}
