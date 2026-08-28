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
      <Seo
        title="Products"
        description="Software developed by 1DevTeam from recurring system problems, including Ajenda AI, Grafted Plus, and Grafted First."
        path="/products"
      />
      <PageHero
        eyebrow="Products"
        title="Software developed from recurring system problems"
        description="1DevTeam develops products when the underlying problem, architecture, and expected reuse justify a durable software system. Product maturity is stated according to current evidence rather than implied through presentation."
      />

      <section className="section-pad">
        <div className="container-site grid gap-8">
          <Card className="overflow-hidden border-[var(--brand)]/20">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <CardHeader>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="brand">Flagship product</Badge>
                    <Badge variant="outline">Private development · locally operational</Badge>
                  </div>
                  <AjendaLockup className="mb-3" size="md" />
                  <CardTitle className="text-2xl md:text-3xl">Ajenda AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="max-w-2xl text-[17px] leading-relaxed text-[var(--text-muted)]">
                    Ajenda AI is an execution system for converting goals into structured missions, plans, tasks, approvals, and controlled actions. The system is being developed around the requirements of durable execution rather than conversation alone. Its architecture includes explicit authority boundaries, persistent mission state, capability selection, review paths, recovery behavior, execution evidence, and controlled interaction with connected systems.
                  </p>
                  <Button asChild className="mt-6">
                    <Link to="/products/ajenda">Explore Ajenda AI <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                  </Button>
                </CardContent>
              </div>
              <div className="border-t border-[var(--border)] bg-[var(--surface)] p-6 lg:border-l lg:border-t-0 lg:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Current status</p>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
                  Ajenda AI is under active private development and is locally operational. This site does not represent it as a generally available hosted service or claim customer deployment that has not occurred.
                </p>
              </div>
            </div>
          </Card>

          <div className="pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Applied R&amp;D outputs</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Grafted Plus and Grafted First</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {rdTools.map((tool) => (
              <Card key={tool.name}>
                <CardHeader>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="brand">{tool.scope}</Badge>
                    <Badge variant="outline">{tool.status}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{tool.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-base leading-relaxed text-[var(--text-muted)]">{tool.description}</p>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">Operating model</p>
                    <p className="mt-2 text-base font-medium leading-relaxed text-[var(--text)]">{tool.operatingModel}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Intended future relationship</p>
            <p className="mt-3 max-w-4xl text-base font-medium leading-relaxed text-[var(--text)]">
              Grafted First → intended architecture → implementation → Grafted Plus → reconstructed architecture → drift analysis
            </p>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--text-muted)]">
              This remains a development hypothesis, not a completed research finding. The research program can support, narrow, change, or contradict the assumptions behind these systems.
            </p>
            <Button asChild variant="outline" className="mt-5"><Link to="/research">Read the R&amp;D program</Link></Button>
          </div>
        </div>
      </section>
    </>
  )
}
