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
        description="Custom AI systems, SaaS product development, operations infrastructure, and AI governance — built for production and accountability."
        path="/services"
      />
      <PageHero
        eyebrow="Services"
        title="Custom systems for operators who need results"
        description="Services at 1devteam are not staff augmentation theater. We design and build governed systems with clear boundaries, delivery discipline, and ownership models your team can run."
      >
        <Button asChild>
          <Link to="/contact">Discuss a project</Link>
        </Button>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.title} className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[15px] leading-relaxed text-[var(--text-muted)]">
                  {service.description}
                </p>
                <ul className="mt-5 space-y-2">
                  {service.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex gap-2 text-sm leading-relaxed text-[var(--text)]"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]"
                        aria-hidden
                      />
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
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Dual-path engagement
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
            Research on your own through Work, Products, Method, and Insights —
            or start a conversation when you are ready. Custom and enterprise
            work is scoped through discussion; productized paths stay
            self-serve where possible.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/contact">Request a consultation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/method">How we work</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
