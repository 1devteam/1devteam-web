import { Link } from 'react-router-dom'
import { AjendaLockup } from '@/components/brand/AjendaLockup'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { rdTools } from '@/data/research'
import { ArrowRight } from 'lucide-react'

export function ProductsPage() {
  return (
    <>
      <Seo title="Products" description="Software 1DevTeam is building, including Ajenda AI and development systems emerging from applied R&D." path="/products" />
      <PageHero
        eyebrow="Products"
        title="Software we are building"
        description="1DevTeam develops products when a problem and its solution justify becoming a reusable system. Product maturity is stated explicitly rather than implied."
      />

      <section className="section-pad">
        <div className="container-site grid gap-8">
          <Card className="overflow-hidden border-[var(--brand)]/20">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <CardHeader>
                  <div className="mb-2 flex flex-wrap gap-2"><Badge variant="brand">Flagship</Badge><Badge variant="outline">Private development · locally operational</Badge></div>
                  <AjendaLockup className="mb-3" size="md" />
                  <CardTitle className="text-2xl md:text-3xl">Ajenda AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="max-w-2xl text-[17px] leading-relaxed text-[var(--text-muted)]">
                    An actively developed execution system for transforming goals into structured missions, plans, tasks, and controlled work. Ajenda emphasizes durable state, explicit authority, recovery, review, and traceable execution.
                  </p>
                  <Button asChild className="mt-6"><Link to="/products/ajenda">Explore Ajenda AI <ArrowRight className="h-4 w-4" aria-hidden /></Link></Button>
                </CardContent>
              </div>
              <div className="border-t border-[var(--border)] bg-[var(--surface)] p-6 lg:border-l lg:border-t-0 lg:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Current boundary</p>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
                  Ajenda is not yet represented here as a generally available hosted service. The site describes the software and its observed development state without inflating commercial maturity.
                </p>
              </div>
            </div>
          </Card>

          <div className="pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Development systems emerging from applied R&amp;D</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Grafted Plus and Grafted First</h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--text-muted)]">
              These are applied development outputs associated with 1DevTeam's first formal R&amp;D program. Research evidence may strengthen, change, narrow, or contradict assumptions about their value.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {rdTools.map((tool) => (
              <Card key={tool.name}>
                <CardHeader><div className="mb-2 flex flex-wrap gap-2"><Badge variant="brand">{tool.scope}</Badge><Badge variant="outline">{tool.status}</Badge></div><CardTitle className="text-2xl">{tool.name}</CardTitle></CardHeader>
                <CardContent><p className="text-base leading-relaxed text-[var(--text-muted)]">{tool.description}</p></CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="max-w-3xl text-base leading-relaxed text-[var(--text-muted)]">The research program remains a separate evidence process. Product goals do not get to rewrite study outcomes.</p>
            <Button asChild variant="outline" className="mt-5"><Link to="/research">Read the R&amp;D program</Link></Button>
          </div>
        </div>
      </section>
    </>
  )
}
