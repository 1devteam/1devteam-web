import { Link } from 'react-router-dom'
import { methodSteps, services, siteConfig } from '@/data/site'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

const fit = [
  'Operators who need a system in production, not a workshop deck',
  'Technical leads who must defend AI decisions internally',
  'Teams that require review gates, audit trails, and clear ownership',
]

export function EnterprisePage() {
  return (
    <>
      <Seo
        title="Enterprise"
        description="Custom and enterprise systems from 1devteam — governed AI, SaaS products, and operations infrastructure built for production."
        path="/enterprise"
      />
      <PageHero
        eyebrow="Enterprise"
        title="Systems built to run, not to demo"
        description="1devteam designs and ships governed AI systems, productized software, and operations infrastructure for teams that need results they can inspect and own."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/contact">Discuss a project</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/work">See the work</Link>
          </Button>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Who this is for
            </h2>
            <ul className="mt-6 space-y-3">
              {fit.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-[var(--text-muted)]">
              Studio inbox:{' '}
              <a
                href={`mailto:${siteConfig.email}`}
                className="font-medium text-[var(--brand)] hover:underline"
              >
                {siteConfig.email}
              </a>
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              What we take on
            </h2>
            <div className="mt-6 grid gap-4">
              {services.map((service) => (
                <Card key={service.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] section-pad">
        <div className="container-site">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            How engagement works
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {methodSteps.map((step) => (
              <div key={step.step}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
                  {step.step}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/contact">Request a consultation</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/method">Full method</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
