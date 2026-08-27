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
  { title: 'Structured missions', description: 'Turn an objective into explicit missions, plans, tasks, and durable execution state.' },
  { title: 'Explicit authority', description: 'Separate understanding from permission so recognizing an intent does not silently grant external-action authority.' },
  { title: 'Review and recovery', description: 'Model approvals, failure handling, recovery paths, and controlled continuation rather than treating errors as an afterthought.' },
  { title: 'Inspectable execution', description: 'Make ownership, progress, state transitions, and execution evidence visible rather than burying work inside a chat transcript.' },
]

export function AjendaPage() {
  return (
    <>
      <Seo
        title="Ajenda AI"
        description="Ajenda AI is 1DevTeam's flagship product: an actively developed system for turning goals into structured missions, plans, tasks, and controlled execution."
        path="/products/ajenda"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Ajenda AI',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description: 'Structured execution software for missions, plans, tasks, authority, review, recovery, and traceable work.',
          provider: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
        }}
      />
      <PageHero
        eyebrow="Products · Ajenda AI"
        title="From goals to execution — with explicit control"
        description="Ajenda AI is a structured execution system built to turn an objective into governed work: missions, plans, tasks, ownership, progress, and controlled actions."
      >
        <AjendaLockup className="mb-2" size="lg" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link to="/contact">Talk to us about Ajenda</Link></Button>
          <Button asChild variant="outline" size="lg"><Link to="/method">How 1DevTeam builds</Link></Button>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <AjendaCommandCenter caption="Local Ajenda command center, 31 July 2026 — a real development surface." />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Current development emphasis</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight">Execution machinery, not conversation alone</h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
              Ajenda is being developed around the machinery required to execute work reliably: authority, state, capability selection, review, recovery, auditability, and failure handling.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CheckCircle2 className="h-5 w-5 text-[var(--success)]" aria-hidden />{feature.title}</CardTitle></CardHeader>
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
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Maturity boundary</h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
              Ajenda is in private development and is locally operational. This page does not represent it as a generally available hosted service or imply customer deployment that has not occurred.
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 md:p-8">
            <h3 className="text-lg font-semibold">Part of 1DevTeam</h3>
            <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
              Ajenda is one product inside a broader software-development and applied-R&amp;D company. The company also works on custom systems, development tooling, architecture problems, and research emerging from real development work.
            </p>
            <p className="mt-4 text-sm text-[var(--text-subtle)]">Product inbox: <a href={`mailto:${siteConfig.productEmail}`} className="font-medium text-[var(--brand)] hover:underline">{siteConfig.productEmail}</a></p>
          </div>
        </div>
      </section>
    </>
  )
}
