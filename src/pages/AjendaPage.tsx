import { Link } from 'react-router-dom'
import { AjendaCommandCenter } from '@/components/product/AjendaCommandCenter'
import { AjendaLockup } from '@/components/brand/AjendaLockup'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { siteConfig } from '@/data/site'

const features = [
  { title: 'Structured missions', description: 'Objectives are represented as durable mission state rather than temporary conversational context.' },
  { title: 'Explicit authority', description: 'Interpretation, planning, and execution authority are modeled separately so recognizing an instruction does not silently authorize an external action.' },
  { title: 'Controlled execution', description: 'Actions can be routed through capability boundaries, policy checks, approvals, and execution controls appropriate to the operation.' },
  { title: 'Review & recovery', description: 'The system models approval states, execution failures, recovery paths, and controlled continuation as part of normal operation.' },
  { title: 'Traceable outcomes', description: 'Mission state, approvals, actions, and resulting outcomes are recorded so system behavior can be inspected after execution.' },
]

export function AjendaPage() {
  const productImage = `${siteConfig.url}/artifacts/ajenda-ai-actual-screenshot.webp`
  return (
    <>
      <Seo
        title="Ajenda AI"
        description="Ajenda AI converts objectives into structured missions, plans, tasks, approvals, and controlled execution."
        path="/products/ajenda"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Ajenda AI',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description: 'Structured execution software for missions, plans, tasks, authority, review, recovery, and traceable work.',
          image: productImage,
          provider: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
        }}
      />
      <PageHero
        eyebrow="Ajenda AI"
        title="Turn goals into governed execution."
        description="Ajenda AI converts objectives into structured missions, plans, tasks, approvals, and controlled execution. The system is designed around the distinction between understanding a request and having authority to act on it."
      >
        <AjendaLockup className="mb-2" size="lg" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link to="/contact">Discuss Ajenda AI</Link></Button>
          <Button asChild variant="outline" size="lg"><Link to="/method">Development method</Link></Button>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <AjendaCommandCenter />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Execution architecture</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight">Understanding and authority remain separate</h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">That distinction extends through mission interpretation, planning, capability selection, execution, review, recovery, and outcome recording.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle2 className="h-5 w-5 text-[var(--success)]" aria-hidden />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-base leading-relaxed text-[var(--text-muted)]">{feature.description}</p></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Current status</h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">Ajenda AI is under active private development and is locally operational. This site does not represent Ajenda as a generally available hosted service or claim customer deployment that has not occurred.</p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 md:p-8">
            <h3 className="text-lg font-semibold">Part of 1DevTeam</h3>
            <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">Ajenda is the current flagship product inside 1DevTeam&apos;s broader software-development and applied-R&amp;D work. Its development also provides the active software environment in which portions of the architecture tooling and current research program are being exercised.</p>
            <p className="mt-4 text-sm text-[var(--text-subtle)]">Product inbox: <a href={`mailto:${siteConfig.productEmail}`} className="font-medium text-[var(--brand)] hover:underline">{siteConfig.productEmail}</a></p>
          </div>
        </div>
      </section>
    </>
  )
}
