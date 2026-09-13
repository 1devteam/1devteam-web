import { CORE_TRANSFERS } from "@/lib/graft/subjects";
import { ADJUDICATION_STAGES, CORE_FORWARD, PRODUCT, STAGES } from "@/lib/graft/records";

export function SchemaPane() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-lg border border-border bg-surface p-5">
        <p className="font-mono text-xs tracking-widest text-subtle">UNIVERSAL CORE</p>
        <h2 className="mt-2 text-lg font-medium tracking-tight">Project-agnostic pipeline</h2>
        <p className="mt-2 text-sm text-muted">
          Extracted from Ajenda. Domain rules stay examples. Completeness is never forced.
          Independent proof stages stay separate.
        </p>
        <ol className="mt-4 space-y-3">
          {STAGES.map((stage, index) => (
            <li key={stage.id} className="border-t border-border pt-3 first:border-0 first:pt-0">
              <p className="font-mono text-xs text-subtle">
                {String(index + 1).padStart(2, "0")} · {stage.title.toUpperCase()}
              </p>
              <p className="mt-1 text-sm text-muted">{stage.detail}</p>
            </li>
          ))}
        </ol>
      </article>

      <div className="grid gap-4">
        <article className="rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs tracking-widest text-subtle">PACKET SHAPE</p>
          <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-accent">
{`graft_plus  schema ${"1.0-core"}
truth        schema ${"1.0-truth"}
nodes[]  edges[]  invariants[]  residuals[]
facts[]  capabilities[]  provenance
impact.{changed, consumers, deps, unmapped}
proof.{bundles, tests, gates}
completeness.{integrity, acknowledged}
adjudication.{SATISFIED|VIOLATED|INDETERMINATE}
decision.{clear|review-required|blocked}
decision.merge_authorization = not-determined
plannerInput.role = fact-substrate
plannerInput.implementsPlan = false`}
          </pre>
          <p className="mt-4 text-sm text-muted">
            {PRODUCT.plus} reconstructs what exists into facts a planner can consume. It is not
            the planner. {PRODUCT.first} models what should exist first. This lab is{" "}
            {PRODUCT.plus} only.
          </p>
        </article>

        <article className="rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs tracking-widest text-subtle">ADJUDICATION CHAIN</p>
          <ol className="mt-3 space-y-2">
            {ADJUDICATION_STAGES.map((stage) => (
              <li key={stage.id}>
                <p className="text-sm font-medium">{stage.label}</p>
                <p className="text-xs text-subtle">{stage.meaning}</p>
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs tracking-widest text-subtle">TRANSFERABLE RULES</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {CORE_TRANSFERS.map((item) => (
              <li key={item} className="border-t border-border pt-2 first:border-0 first:pt-0">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-xs text-subtle">CARRIED FORWARD FROM AJENDA</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {CORE_FORWARD.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
