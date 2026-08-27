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
        description="Ajenda AI, Grafted Plus, and Grafted First — product and R&D systems from 1devteam."
        path="/products"
      />
      <PageHero
        eyebrow="Products"
        title="Software we build and operate"
        description="Ajenda AI is the flagship. 1DevTeam also develops architecture-intelligence tooling through its first formal R&D program."
      />

      <section className="section-pad">
        <div className="container-site grid gap-6">
          <Card className="overflow-hidden border-[var(--brand)]/20">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <CardHeader>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="brand">Flagship</Badge>
                    <Badge variant="outline">Private development</Badge>
                  </div>
                  <AjendaLockup className="mb-3" size="md" />
                  <CardTitle className="text-2xl md:text-3xl">Ajenda AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="max-w-2xl text-[17px] leading-relaxed text-[var(--text-muted)]">
                    A locally operational, actively tested governed execution system that moves teams from goals to
                    structured plans, tasks, and accountable progress — with
                    human oversight where risk demands it.
                  </p>
                  <Button asChild className="mt-6">
                    <Link to="/products/ajenda">
                      Explore Ajenda AI
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </div>
              <div className="border-t border-[var(--border)] bg-[var(--surface)] p-6 lg:border-l lg:border-t-0 lg:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Built for
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--text)]">
                  <li>Operators who need more than chat transcripts</li>
                  <li>Teams that require review gates and auditability</li>
                  <li>Leaders who must defend AI decisions internally</li>
                </ul>
                <p className="mt-5 text-sm leading-relaxed text-[var(--text-muted)]">
                  Ajenda is not yet offered here as a generally available hosted service.
                </p>
              </div>
            </div>
          </Card>

          <div className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
              Architecture intelligence R&D
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Grafted Plus and Grafted First
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--text-muted)]">
              These tools are applied development outputs of 1DevTeam's first
              formal R&D program. Their capabilities and comparative value are
              being refined from evidence rather than assumed in advance.
            </p>
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
                <CardContent>
                  <p className="text-base leading-relaxed text-[var(--text-muted)]">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="max-w-3xl text-base leading-relaxed text-[var(--text-muted)]">
              The R&D program studies the software-development failures these
              tools are intended to address and keeps scientific conclusions
              separate from product positioning.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/research">Read the R&D program</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
