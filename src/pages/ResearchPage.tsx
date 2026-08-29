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
          <Button asChild size="lg"><a href="/#architecture-graph">Interactive graph</a></Button>
          <Button asChild variant="outline" size="lg"><Link to="/work">Technical evidence</Link></Button>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Formal study title</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{researchProgram.formalTitle}</h2>
          </div>
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">Primary research question</p>
            <p className="mt-3 border-l-4 border-[var(--brand)] pl-6 text-xl font-medium leading-relaxed text-[var(--text)]">{researchProgram.primaryQuestion}</p>

            <div className="mt-10 border-t border-[var(--border)] pt-7">
              <h3 className="text-2xl font-semibold tracking-tight">Scientific boundary</h3>
              <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                <p>
                  This study is an empirical investigation, not a product-validation exercise. Graph-assisted development, invariant-centered repair, Grafted Plus, and Grafted First are not assumed to be superior in advance.
                </p>
                <p>
                  Positive, negative, null, and contradictory results remain valid research outcomes. Product objectives do not determine scientific conclusions, and preliminary observations remain revisable until the evidence supports a stronger classification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Study epochs</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Preserving the intervention boundary</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The periods before, during, and after graph introduction remain distinct development conditions. Earlier work is not retroactively described as an immature form of graph assistance.
            </p>
          </div>

          <ol className="max-w-4xl">
            {researchEpochs.map((epoch, index) => (
              <li key={epoch.name} className="grid gap-3 border-t border-[var(--border)] py-7 md:grid-cols-[0.12fr_0.3fr_0.58fr]">
                <span className="font-mono text-sm font-semibold text-[var(--brand)]">0{index + 1}</span>
                <h3 className="text-xl font-semibold">{epoch.name}</h3>
                <p className="text-base leading-relaxed text-[var(--text-muted)]">{epoch.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Measurement</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">What the study measures</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The objective is to distinguish successful local modification from system-level repair quality and subsequent corrective propagation.
            </p>
          </div>
          <ul className="max-w-4xl">
            {researchMeasures.map((measure, index) => (
              <li key={measure} className="grid gap-3 border-t border-[var(--border)] py-5 md:grid-cols-[0.1fr_0.9fr]">
                <span className="font-mono text-sm text-[var(--brand)]">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-base leading-relaxed text-[var(--text-muted)]">{measure}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Applied R&amp;D relationship</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Grafted Plus and Grafted First</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The study can inform Grafted Plus and Grafted First, but those systems remain development outputs rather than evidence of the study&apos;s conclusion. Research may support their current design assumptions, narrow them, contradict them, or expose different mechanisms entirely.
            </p>
          </div>

          <div className="mt-12 max-w-5xl space-y-10">
            {rdTools.map((tool) => (
              <article key={tool.name} className="border-t border-[var(--border)] pt-7">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="brand">{tool.scope}</Badge>
                  <Badge variant="outline">{tool.status}</Badge>
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">{tool.name}</h3>
                <p className="mt-4 max-w-4xl text-[17px] leading-relaxed text-[var(--text-muted)]">{tool.description}</p>
                <p className="mt-4 max-w-4xl font-mono text-sm leading-relaxed text-[var(--text)]">{tool.operatingModel}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 max-w-5xl border-t border-[var(--border)] pt-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Intended future relationship</p>
            <p className="mt-3 font-mono text-base font-medium leading-relaxed text-[var(--text)]">Grafted First → intended architecture → implementation → Grafted Plus → reconstructed architecture → drift analysis</p>
            <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">This remains a development hypothesis, not a completed research finding.</p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Research operating policy</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Controls on interpretation</h2>
          </div>
          <div className="max-w-4xl">
            {researchPolicy.map((policy) => (
              <article key={policy.title} className="border-t border-[var(--border)] py-6">
                <h3 className="text-lg font-semibold">{policy.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-[var(--text-muted)]">{policy.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Current research status</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Observations remain distinct from findings</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">
              Preliminary observations can be revised, contradicted, or rejected as additional evidence and causal coding are completed.
            </p>
          </div>

          <div className="max-w-4xl">
            {researchNotes.map((note) => (
              <article key={note.title} className="border-t border-[var(--border)] py-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">{note.status}</p>
                <h3 className="mt-2 text-xl font-semibold">{note.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">{note.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
