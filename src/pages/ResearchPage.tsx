import { Link } from 'react-router-dom'
import {
  researchEpochs,
  researchMeasures,
  researchNotes,
  researchPolicy,
  researchProgram,
  rdTools,
} from '@/data/research'
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
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text)]">
              Current study
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              {researchProgram.shortTitle}
            </h2>
            <p className="reading-measure mt-4 text-base font-medium leading-relaxed text-[var(--text)]">
              Formal title: {researchProgram.formalTitle}.
            </p>
            <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Primary research question
              </h3>
              <p className="reading-measure mt-3 text-lg font-medium leading-relaxed">
                {researchProgram.primaryQuestion}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Scientific boundary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-base font-medium leading-relaxed text-[var(--text)]">
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
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text)]">
              Applied development outputs
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Grafted Plus and Grafted First
            </h2>
            <p className="reading-measure mt-3 text-[17px] font-medium leading-relaxed text-[var(--text)]">
              These tools are development outputs of the R&D program, not proof
              of its outcome. Research evidence informs what they should model,
              which workflows they should support, and which failure modes they
              may help expose.
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
                <CardContent className="space-y-5">
                  <p className="text-base font-medium leading-relaxed text-[var(--text)]">
                    {tool.description}
                  </p>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      Operating model
                    </p>
                    <p className="mt-2 text-base font-medium leading-relaxed text-[var(--text)]">
                      {tool.operatingModel}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="reading-measure mt-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 text-base font-medium leading-relaxed text-[var(--text)]">
            <strong>Working relationship:</strong>{' '}
            Grafted First is intended to model what a system should become;
            Grafted Plus is intended to reconstruct and reason over what an
            existing system actually is. A future loop of intended architecture
            → implementation → reconstructed actual architecture → drift
            comparison is a development hypothesis under investigation, not an
            established research conclusion.
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text)]">
              Research operating policy
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              How we keep the study scientifically useful
            </h2>
            <p className="reading-measure mt-3 text-[17px] font-medium leading-relaxed text-[var(--text)]">
              Serious contributors should be able to see not only what we are
              building, but also the constraints placed on the evidence that is
              allowed to support it.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {researchPolicy.map((policy) => (
              <Card key={policy.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-medium leading-relaxed text-[var(--text)]">
                    {policy.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text)]">
                Study epochs
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                The graph did not always exist
              </h2>
              <p className="reading-measure mt-3 text-[17px] font-medium leading-relaxed text-[var(--text)]">
                The study preserves the intervention boundary instead of
                describing earlier development as a weaker version of a graph
                workflow.
              </p>
              <div className="mt-6 space-y-4">
                {researchEpochs.map((epoch, index) => (
                  <div
                    key={epoch.name}
                    className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-action)] text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold">{epoch.name}</h3>
                    </div>
                    <p className="mt-3 text-base font-medium leading-relaxed text-[var(--text)]">
                      {epoch.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text)]">
                Measurement
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                What we are measuring
              </h2>
              <p className="reading-measure mt-3 text-[17px] font-medium leading-relaxed text-[var(--text)]">
                The study is designed to distinguish local success from
                system-level repair quality and later corrective propagation.
              </p>
              <ul className="mt-6 space-y-3">
                {researchMeasures.map((measure) => (
                  <li
                    key={measure}
                    className="flex gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white p-4 text-base font-medium leading-relaxed text-[var(--text)]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-action)]"
                    />
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text)]">
              Notes from the work so far
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Preliminary observations, not finished claims
            </h2>
            <p className="reading-measure mt-3 text-[17px] font-medium leading-relaxed text-[var(--text)]">
              These notes are exposed because the distinction between an
              observation, an exploratory hypothesis, and an adjudicated finding
              matters. They may be revised, contradicted, or rejected as the
              corpus and causal coding mature.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {researchNotes.map((note) => (
              <Card key={note.title}>
                <CardHeader>
                  <Badge variant="outline" className="mb-2 w-fit">
                    {note.status}
                  </Badge>
                  <CardTitle className="text-xl">{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-medium leading-relaxed text-[var(--text)]">
                    {note.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="reading-measure mt-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 text-base font-medium leading-relaxed text-[var(--text)]">
            <strong>Contributor signal:</strong>{' '}
            the investment here is in a research-and-development process that is
            expected to preserve uncertainty and competing explanations. Grafted
            Plus and Grafted First should become stronger when the evidence is
            strong, change when the evidence is mixed, and remain falsifiable
            rather than being protected from negative results.
          </div>
        </div>
      </section>
    </>
  )
}
