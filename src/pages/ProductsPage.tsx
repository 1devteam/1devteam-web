import { Link } from 'react-router-dom'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export function ProductsPage() {
  return (
    <>
      <Seo
        title="Products"
        description="Ajenda AI and the product portfolio from 1devteam — SaaS tools built by an AI systems studio, not a single-product homepage."
        path="/products"
      />
      <PageHero
        eyebrow="Products"
        title="Software we build and operate"
        description="Ajenda AI is the flagship. The company is larger than one product — a studio that designs, ships, and governs operational software."
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

          <Card>
            <CardHeader>
              <Badge variant="outline" className="mb-2 w-fit">
                Coming next
              </Badge>
              <CardTitle className="text-xl">Future systems</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="max-w-2xl text-[15px] leading-relaxed text-[var(--text-muted)]">
                This page is the durable home for productized software from
                1devteam. New tools will appear here with the same standard:
                clear problem, inspectable design, and production intent.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link to="/contact">Suggest a product need</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
