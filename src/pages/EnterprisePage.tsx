import { Link } from 'react-router-dom'
import { methodSteps, services } from '@/data/site'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

export function EnterprisePage() {
  return (
    <>
      <Seo title="Enterprise" description="System-aware software development for larger or higher-consequence architectures where local changes can cross multiple boundaries." path="/enterprise" />
      <PageHero
        eyebrow="Enterprise"
        title="Complex systems need more than a feature-level view"
        description="For larger or higher-consequence systems, development decisions can cross data, security, authority, state, integration, and operational boundaries at the same time. 1DevTeam approaches that work as a system rather than a collection of isolated tickets."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link to="/contact">Discuss a system</Link></Button>
          <Button asChild variant="outline" size="lg"><Link to="/work">See the work</Link></Button>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Strong fit</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              Work where understanding the existing system is part of solving the problem; where failure in one layer can propagate into others; or where the resulting software needs explicit ownership, control, and evidence.
            </p>
            <p className="mt-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
              Potential work can include architecture reconstruction, cross-system integration, controlled AI capabilities, reliability and recovery work, system remediation, technical R&amp;D, and development tooling created around the specific problem.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service.title} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-5">
                <h3 className="text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Working sequence</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {methodSteps.map((step) => (
              <div key={step.step}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">{step.step}</p>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
