import { Link } from 'react-router-dom'
import { researchProgram, rdTools } from '@/data/research'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ResearchPage() {
  return (
    <>
      <Seo
        title="Research & Development"
        description="1DevTeam's first formal R&D program studies architectural reasoning scope and corrective PR cascades while informing Grafted Plus and Grafted First."
        path="/research"
      />
      <PageHero
        eyebrow="Research & Development"
        title="1DevTeam's first formal R&D program"
        description={researchProgram.summary}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/products">See the product work</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/work">See build evidence</Link>
          </Button>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
              Current study
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              {researchProgram.shortTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
              Formal title: {researchProgram.formalTitle}.
            </p>
            <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Primary research question
              </h3>
              <p className="mt-3 text-lg font-medium leading-relaxed">
                {researchProgram.primaryQuestion}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Scientific boundary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-[15px] leading-relaxed text-[var(--text-muted)]">
              <p>
                This is active research, not a marketing proof exercise. Study
                methods, causal adjudication, and outcome comparisons remain
                separate from product-development goals.
              </p>
              <p>
                1DevTeam does not claim that graph-assisted or
                invariant-centered development is superior unless the evidence
                supports that conclusion. Null, negative, and contradictory
                findings remain valid R&D outcomes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
              Applied development outputs
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Grafted Plus and Grafted First
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
              The research program is intended to provide empirical grounding
              for what these tools should represent, which workflows they should
              support, and which software-development failures they should help
              address.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
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
                  <p className="text-[15px] leading-relaxed text-[var(--text-muted)]">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 text-[15px] leading-relaxed text-[var(--text-muted)]">
            <strong className="text-[var(--text)]">Working relationship:</strong>{' '}
            Grafted First is intended to model what a system should become;
            Grafted Plus is intended to reconstruct and reason over what an
            existing system actually is. A future intent-versus-implementation
            reconciliation loop is a development hypothesis under investigation,
            not an established research conclusion.
          </div>
        </div>
      </section>
    </>
  )
}
