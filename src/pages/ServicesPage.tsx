import { Link } from 'react-router-dom'
import { services } from '@/data/site'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

export function ServicesPage() {
  return (
    <>
      <Seo
        title="Services"
        description="Software and systems development from 1DevTeam across new systems, existing architectures, product development, system remediation, integrations, and AI-enabled software."
        path="/services"
      />
      <PageHero
        eyebrow="Software Development"
        title="Software and systems development for difficult problems"
        description="1DevTeam provides development work across new systems, existing architectures, product development, system remediation, integrations, and AI-enabled software. Work is scoped around the actual system boundary rather than forcing the problem into a predefined service category."
      >
        <Button asChild><Link to="/contact">Discuss a project</Link></Button>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.32fr_0.68fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Capabilities</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">The service category follows the system, not the other way around</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The same engagement can involve product behavior, persistence, authority, integrations, runtime state, recovery, and architecture at once. Service labels are therefore entry points rather than artificial boundaries around the work.
            </p>
          </div>

          <div className="max-w-5xl">
            {services.map((service) => (
              <article key={service.title} className="border-t border-[var(--border)] py-7">
                <div className="grid gap-4 md:grid-cols-[0.34fr_0.66fr]">
                  <h3 className="text-xl font-semibold tracking-tight">{service.title}</h3>
                  <div>
                    <p className="text-base leading-relaxed text-[var(--text-muted)]">{service.description}</p>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-[var(--text-subtle)]">Typical outcomes</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">{service.outcomes.join(' · ')}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[0.32fr_0.68fr]">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How work begins</h2>
          <div className="max-w-4xl">
            <p className="text-[17px] leading-relaxed text-[var(--text-muted)]">
              A development engagement begins by establishing the current system state, required behavior, architectural constraints, available evidence, and ownership boundary of the requested change. Implementation begins after those conditions are sufficiently understood to define the correct scope of work.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild><Link to="/contact">Discuss a project</Link></Button>
              <Button asChild variant="outline"><Link to="/method">Development method</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
