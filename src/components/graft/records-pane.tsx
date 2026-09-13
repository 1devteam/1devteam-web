import { LEARNINGS, MATURITY, PRODUCT, RECORDS, driveUrl } from "@/lib/graft/records";

export function RecordsPane() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <article className="rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs tracking-widest text-subtle">OFFICIAL NAMES</p>
          <h2 className="mt-2 text-lg font-medium tracking-tight">{PRODUCT.expansion}</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-bg p-4">
              <dt className="font-mono text-xs text-subtle">EXISTING SYSTEM</dt>
              <dd className="mt-1 text-base font-medium">{PRODUCT.plus}</dd>
              <dd className="mt-2 text-sm text-muted">{PRODUCT.plusMeaning}</dd>
              <dd className="mt-2 font-mono text-xs text-subtle">package {PRODUCT.package}</dd>
            </div>
            <div className="rounded-md border border-border bg-bg p-4">
              <dt className="font-mono text-xs text-subtle">PROJECT ORIGIN</dt>
              <dd className="mt-1 text-base font-medium">{PRODUCT.first}</dd>
              <dd className="mt-2 text-sm text-muted">{PRODUCT.firstMeaning}</dd>
              <dd className="mt-2 font-mono text-xs text-subtle">not this lab</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs tracking-widest text-subtle">LEARNED ON AJENDA</p>
          <h2 className="mt-2 text-lg font-medium tracking-tight">What is being carried forward</h2>
          <ol className="mt-4 space-y-3">
            {LEARNINGS.map((item, index) => (
              <li key={item} className="border-t border-border pt-3 first:border-0 first:pt-0">
                <p className="font-mono text-xs text-subtle">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-1 text-sm text-muted">{item}</p>
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs tracking-widest text-subtle">R&D DRIVE INDEX</p>
          <p className="mt-2 text-sm text-muted">
            Distilled from the 1DevTeam R&D Program folder. Read-only. Living handoffs, not
            primary evidence. Frozen records are not rewritten.
          </p>
          <ul className="mt-4 space-y-3">
            {RECORDS.map((record) => (
              <li key={record.id} className="border-t border-border pt-3 first:border-0 first:pt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">{record.title}</p>
                  <p className="font-mono text-[11px] text-subtle">{record.date}</p>
                </div>
                <p className="mt-1 font-mono text-[11px] tracking-widest text-subtle">
                  {record.kind.toUpperCase()} · {record.role}
                </p>
                <p className="mt-2 text-sm text-muted">{record.summary}</p>
                <a
                  href={driveUrl(record.driveId)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center font-mono text-xs text-accent underline-offset-4 hover:underline"
                >
                  Open source record
                </a>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <aside className="space-y-4">
        <article className="rounded-lg border border-warn/30 bg-warn/10 p-5">
          <p className="font-mono text-xs tracking-widest text-warn">MATURITY BOUNDARY</p>
          <ul className="mt-3 space-y-3 text-sm text-fg/90">
            {MATURITY.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs tracking-widest text-subtle">READ-ONLY RULE</p>
          <p className="mt-2 text-sm text-muted">
            Anything outside the R&D Program folder is an external reference. This lab may
            search, cite, and compare those systems. It does not edit them. Ajenda and Omnipath v2
            remain reconstruction subjects, not writable working storage.
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <p className="font-mono text-xs tracking-widest text-subtle">SCIENTIFIC NEUTRALITY</p>
          <p className="mt-2 text-sm text-muted">
            Product goals do not decide research conclusions. Observation, inference, hypothesis,
            engineering result, and validated finding stay distinct. Negative and null outcomes
            remain valid.
          </p>
        </article>
      </aside>
    </div>
  );
}
