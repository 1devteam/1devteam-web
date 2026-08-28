import { Link } from 'react-router-dom'
import { services } from '@/data/site'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

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
        <div className="container-site grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.title} className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-[var(--text-muted)]">{service.description}</p>
                <ul className="mt-5 space-y-2">
                  {service.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-2 text-sm leading-relaxed text-[var(--text)]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] section-pad">
        <div className="container-site max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How work begins</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
            A development engagement begins by establishing the current system state, required behavior, architectural constraints, available evidence, and ownership boundary of the requested change. Implementation begins after those conditions are sufficiently understood to define the correct scope of work.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild><Link to="/contact">Discuss a project</Link></Button>
            <Button asChild variant="outline"><Link to="/method">Development method</Link></Button>
          </div>
        </div>
      </section>
    </>
  )
}
