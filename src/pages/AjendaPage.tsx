import { Link } from 'react-router-dom'
import { AjendaCommandCenter } from '@/components/product/AjendaCommandCenter'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { siteConfig } from '@/data/site'

const features = [
  {
    title: 'Goals to plans',
    description:
      'Turn business outcomes into structured workstreams instead of starting every day from a blank prompt.',
  },
  {
    title: 'Accountable tasks',
    description:
      'Ownership, status, and progress that teams can see — not ephemeral chat threads that disappear into history.',
  },
  {
    title: 'Governed actions',
    description:
      'Control gates and human review for high-risk steps so automation stays defensible.',
  },
  {
    title: 'Operator-first UX',
    description:
      'A product surface designed for execution quality, not novelty demos or abstract “AI magic.”',
  },
]

export function AjendaPage() {
  return (
    <>
      <Seo
        title="Ajenda AI"
        description="Ajenda AI is 1devteam’s flagship product: governed execution software that moves teams from goals to accountable progress."
        path="/products/ajenda"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Ajenda AI',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description:
            'Governed execution software that turns goals into structured plans, tasks, and accountable progress.',
          provider: {
            '@type': 'Organization',
            name: siteConfig.name,
            url: siteConfig.url,
          },
        }}
      />
      <PageHero
        eyebrow="Products · Ajenda AI"
        title="From goals to execution — with governance"
        description="Ajenda is not another chatbot. It is a system for structured work: plans, ownership, progress, and human oversight. Built by 1devteam as the flagship of a broader AI systems practice."
      >
        <img
          src={siteConfig.brand.productOnLight}
          alt="Ajenda AI"
          className="mb-2 h-10 w-auto"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/contact">Request a demo</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/method">How we build AI systems</Link>
          </Button>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <AjendaCommandCenter caption="Local Ajenda command center, 31 July 2026 — not a concept mock." />
          <div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">
              What makes Ajenda different
            </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2
                      className="h-5 w-5 text-[var(--success)]"
                      aria-hidden
                    />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[15px] leading-relaxed text-[var(--text-muted)]">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Who it is for
            </h2>
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
              <li>Founders and operators who need execution systems, not slideware.</li>
              <li>
                Technical leads who care whether AI claims are inspectable and
                safe enough to run.
              </li>
              <li>
                Teams adopting AI that must show governance, oversight, and
                accountability.
              </li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 md:p-8">
            <h3 className="text-lg font-semibold">Part of 1devteam</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
              Ajenda is the flagship product of a broader operating company. We
              also design custom AI systems, SaaS products, and operations
              infrastructure for clients who need more than a single product
              surface.
            </p>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Product inbox:{' '}
              <a
                href={`mailto:${siteConfig.productEmail}`}
                className="font-medium text-[var(--brand)] hover:underline"
              >
                {siteConfig.productEmail}
              </a>
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link to="/contact">Talk to us about Ajenda</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/services">Custom systems</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
