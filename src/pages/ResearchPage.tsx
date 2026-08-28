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
        description="1DevTeam R&D Program #1 studies architectural reasoning scope and corrective PR cascades in AI-assisted software development."
        path="/research"
      />
      <PageHero
        eyebrow="1DevTeam R&D Program #1"
        title="Architectural reasoning scope and corrective PR cascades"
        description={researchProgram.summary}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link to="/work">Technical evidence</Link></Button>
          <Button asChild variant="outline" size="lg"><Link to="/products">Applied R&amp;D outputs</Link></Button>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Formal study title</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{researchProgram.formalTitle}</h2>
            <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-subtle)]">Primary research question</h3>
              <p className="reading-measure mt-3 text-lg font-medium leading-relaxed">{researchProgram.primaryQuestion}</p>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-xl">Scientific boundary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
              <p>
                This study is an empirical investigation, not a product-validation exercise. Graph-assisted development, invariant-centered repair, Grafted Plus, and Grafted First are not assumed to be superior in advance.
              </p>
              <p>
                Positive, negative, null, and contradictory results remain valid research outcomes. Product objectives do not determine scientific conclusions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Study epochs</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Preserving the intervention boundary</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The study preserves the periods before, during, and after graph introduction as distinct development conditions rather than treating earlier work as an immature form of graph assistance.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {researchEpochs.map((epoch, index) => (
              <article key={epoch.name} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-action)] text-sm font-semibold text-white">{index + 1}</span>
                  <h3 className="text-lg font-semibold">{epoch.name}</h3>
                </div>
                <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">{epoch.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Measurement</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">What the study measures</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The objective is to distinguish successful local modification from system-level repair quality and subsequent corrective propagation.
            </p>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {researchMeasures.map((measure) => (
              <li key={measure} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white p-4 text-base leading-relaxed text-[var(--text-muted)]">
                {measure}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Applied R&amp;D relationship</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Grafted Plus and Grafted First</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The study can inform Grafted Plus and Grafted First, but those systems remain development outputs rather than evidence of the study&apos;s conclusion. Research may support their current design assumptions, narrow them, contradict them, or expose different mechanisms entirely.
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
                  <p className="text-base leading-relaxed text-[var(--text-muted)]">{tool.description}</p>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">Operating model</p>
                    <p className="mt-2 text-base font-medium leading-relaxed text-[var(--text)]">{tool.operatingModel}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Intended future relationship</p>
            <p className="mt-3 text-base font-medium leading-relaxed text-[var(--text)]">Grafted First → intended architecture → implementation → Grafted Plus → reconstructed architecture → drift analysis</p>
            <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">This remains a development hypothesis, not a completed research finding.</p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Research operating policy</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Controls on interpretation</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {researchPolicy.map((policy) => (
              <Card key={policy.title}>
                <CardHeader><CardTitle className="text-lg">{policy.title}</CardTitle></CardHeader>
                <CardContent><p className="text-base leading-relaxed text-[var(--text-muted)]">{policy.description}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Current research status</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Observations remain distinct from findings</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">
              Observations produced during the study remain distinguishable from hypotheses and adjudicated findings. Preliminary observations can be revised, contradicted, or rejected as additional evidence and causal coding are completed.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {researchNotes.map((note) => (
              <Card key={note.title}>
                <CardHeader>
                  <Badge variant="outline" className="mb-2 w-fit">{note.status}</Badge>
                  <CardTitle className="text-xl">{note.title}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-base leading-relaxed text-[var(--text-muted)]">{note.description}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
