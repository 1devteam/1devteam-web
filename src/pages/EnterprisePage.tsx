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
        <div className="container-site grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">System-level development</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              1DevTeam approaches these systems through explicit architecture reconstruction, dependency analysis, controlled implementation, and proof across the affected surface.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Applicable work</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {applicableWork.map((item) => (
                <li key={item} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white p-4 text-base leading-relaxed text-[var(--text-muted)]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Engineering sequence</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Reason across the affected system</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {methodSteps.map((step) => (
              <div key={step.step} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">{step.step}</p>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{step.description}</p>
              </div>
            ))}
          </div>
          <Button asChild className="mt-8"><Link to="/contact">Discuss a system</Link></Button>
        </div>
      </section>
    </>
  )
}
