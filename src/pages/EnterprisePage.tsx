import { Link } from 'react-router-dom'
import { methodSteps } from '@/data/site'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

const applicableWork = [
  'Architecture reconstruction and remediation',
  'Cross-system integrations',
  'State and ownership problems',
  'Reliability and recovery behavior',
  'AI capabilities with explicit control boundaries',
  'Architecture-aware modernization',
  'Technical R&D associated with an existing system',
  'Development tooling created around a recurring engineering constraint',
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
        eyebrow="Complex Systems"
        title="Complex software requires system-level reasoning"
        description="Changes inside larger systems frequently cross multiple architectural boundaries at once. A request that appears local may affect state, authentication, data ownership, runtime behavior, integrations, concurrency, security, or downstream consumers."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link to="/contact">Discuss a system</Link></Button>
          <Button asChild variant="outline" size="lg"><Link to="/work">Technical evidence</Link></Button>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">System-level development</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">The visible feature is not always the real change surface</h2>
          </div>
          <div className="max-w-4xl space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>
              In complex software, the code directly modified by a request can be only a fraction of the architecture materially affected by it. State ownership, authentication, data boundaries, concurrency, integrations, recovery behavior, and downstream consumers can all participate in the same change even when the visible defect appears local.
            </p>
            <p>
              1DevTeam approaches that work through explicit architecture reconstruction, dependency analysis, ownership identification, controlled implementation, and proof across the affected surface. The objective is not to expand scope unnecessarily; it is to avoid treating an architectural problem as if it were only a feature-level edit.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Applicable work</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Where this approach is most useful</h2>
          </div>
          <ul className="max-w-4xl columns-1 gap-10 sm:columns-2">
            {applicableWork.map((item) => (
              <li key={item} className="break-inside-avoid border-t border-[var(--border)] py-4 text-base leading-relaxed text-[var(--text-muted)]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Engineering sequence</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Reason across the affected system</h2>
          </div>
          <ol className="max-w-4xl">
            {methodSteps.map((step) => (
              <li key={step.step} className="grid gap-3 border-t border-[var(--border)] py-6 md:grid-cols-[0.12fr_0.3fr_0.58fr]">
                <span className="font-mono text-sm font-semibold text-[var(--brand)]">{step.step}</span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-base leading-relaxed text-[var(--text-muted)]">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="container-site mt-8">
          <Button asChild><Link to="/contact">Discuss a system</Link></Button>
        </div>
      </section>
    </>
  )
}
