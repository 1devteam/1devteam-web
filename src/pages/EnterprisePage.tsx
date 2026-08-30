import { Link } from 'react-router-dom'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

const systemSignals = [
  'The visible defect crosses state, data, authority, concurrency, integration, or recovery boundaries.',
  'A local patch passes its immediate test while related behavior regresses elsewhere.',
  'Multiple compensating fixes have accumulated around behavior owned by another component or contract.',
  'The requested change cannot be scoped confidently without reconstructing dependencies and decision ownership first.',
  'Failure paths or downstream consumers are materially affected by a change that appears local in the codebase.',
] as const

const workOutputs = [
  ['Architecture reconstruction', 'Establish the relevant components, contracts, dependencies, state, authority, and unresolved boundaries surrounding the problem.'],
  ['Ownership and change scope', 'Identify which component owns the behavior, what the architectural blast radius includes, and which invariants constrain the repair.'],
  ['Correct-layer implementation', 'Modify the owning layer instead of distributing compensating logic around the visible symptom.'],
  ['Proof across the affected surface', 'Verify direct behavior together with regression surface, integrations, failure paths, relevant invariants, and downstream effects.'],
] as const

export function EnterprisePage() {
  return (
    <>
      <Seo
        title="Enterprise"
        description="System-level software development for complex architectures where changes can cross state, security, authority, data, integration, runtime, and operational boundaries."
        path="/enterprise"
      />
      <PageHero
        eyebrow="Complex Systems & Architecture Remediation"
        title="Repair the system, not only the symptom."
        description="Some software problems cannot be corrected reliably at the point where the failure becomes visible. The change surface may include ownership, state, data boundaries, authority, concurrency, integrations, recovery behavior, and downstream consumers."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link to="/contact">Discuss a complex system</Link></Button>
          <Button asChild variant="outline" size="lg"><Link to="/work">Inspect technical evidence</Link></Button>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Scope trigger</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">System complexity, not organization size</h2>
          </div>
          <div className="max-w-4xl space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>
              This work is defined by the architecture surrounding the change rather than by a customer-size label. A small product can contain a system-level problem; a larger organization can have a narrowly local one. The determining question is whether the requested behavior crosses architectural boundaries that must be understood together.
            </p>
            <p>
              The objective is not to expand scope unnecessarily. It is to avoid declaring a repair complete when the local edit has not resolved the contracts, dependencies, state, authority, failure paths, or downstream behavior that participate in the same problem.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Signals</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">When architecture reconstruction becomes part of the repair</h2>
          </div>
          <ul className="max-w-4xl">
            {systemSignals.map((signal) => (
              <li key={signal} className="border-t border-[var(--border)] py-5 text-base leading-relaxed text-[var(--text-muted)]">{signal}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Engineering output</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">What system-level remediation produces</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The development method governs how the work is performed. This page describes the system-level scope produced when the problem requires more than a feature-local edit.
            </p>
          </div>
          <dl className="max-w-4xl">
            {workOutputs.map(([title, description]) => (
              <div key={title} className="grid gap-3 border-t border-[var(--border)] py-6 md:grid-cols-[0.34fr_0.66fr]">
                <dt className="font-semibold text-[var(--text)]">{title}</dt>
                <dd className="text-base leading-relaxed text-[var(--text-muted)]">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site grid gap-10 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Related material</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Method, evidence, and architecture terms</h2>
          </div>
          <div className="max-w-4xl">
            <p className="text-[17px] leading-relaxed text-[var(--text-muted)]">
              PRIDE Protocol defines the development process; the Work section exposes current artifacts and implementation evidence; the Technical Wiki defines architectural blast radius, reasoning scope, decision ownership, invariants, and related terms used in this work.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline"><Link to="/method">Development method</Link></Button>
              <Button asChild variant="outline"><Link to="/work">Technical evidence</Link></Button>
              <Button asChild variant="outline"><Link to="/wiki#architectural-blast-radius">Architectural blast radius</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
