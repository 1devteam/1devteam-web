import { Link } from 'react-router-dom'
import {
  researchEpochs,
  researchMeasures,
  researchNotes,
  researchPolicy,
  researchProgram,
  rdTools,
  futureResearch,
  substrateResearch,
  researchPortfolio,
  researchPortfolioIntro,
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
        description="Research on governed execution, machine-native architecture observation, and AI-native computational systems, with evidence limits and source lineage."
        path="/research"
      />
      <PageHero
        eyebrow="1DevTeam Research & Development"
        title="Machine-native systems. Source-backed progress."
        description={researchPortfolioIntro}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><a href="/#architecture-graph">Interactive graph</a></Button>
          <Button asChild variant="outline" size="lg"><Link to="/work">Technical evidence</Link></Button>
        </div>
      </PageHero>

      <section className="section-pad" aria-labelledby="research-portfolio-heading">
        <div className="container-site">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Engineering status · 28 October 2026</p>
            <h2 id="research-portfolio-heading" className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Three systems, separate evidence and authority</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">These are source-backed implementation checkpoints, not controlled comparative research results or production readiness certificates. Open drafts and unmeasured hypotheses remain distinct from merged engineering work.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {researchPortfolio.map((project) => (
              <article key={project.name} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">{project.scope}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{project.name}</h3>
                <p className="mt-3 text-sm font-semibold text-[var(--text)]">{project.status}</p>
                <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">{project.description}</p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--text-subtle)]">{project.accessNote}</p>
                <a href={project.evidenceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm font-semibold text-[var(--brand)] hover:underline">{project.evidenceLabel} →</a>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-[var(--text-subtle)]">The authoritative R&amp;D program and Substrate implementation repositories are access-controlled; external readers may need permission to inspect those sources. Public Ajenda and G.R.A.F.T.+ engineering records remain linked above.</p>
        </div>
      </section>

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
                  This study is an empirical investigation, not a product-validation exercise. Graph-assisted development, invariant-centered repair, G.R.A.F.T.+, and G.R.A.F.T.1st are not assumed to be superior in advance.
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
              This is the original longitudinal Ajenda study within the broader R&amp;D program. The periods before, during, and after graph introduction remain distinct. Earlier work is not retroactively described as graph assistance.
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
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">G.R.A.F.T.+ and G.R.A.F.T.1st</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The study can inform G.R.A.F.T.+ and G.R.A.F.T.1st, but those systems remain development outputs rather than evidence of the study&apos;s conclusion. Research may support their current design assumptions, narrow them, contradict them, or expose different mechanisms entirely.
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
                {tool.name === 'G.R.A.F.T.+' ? (
                  <p className="mt-4">
                    <Link to="/graft" className="text-sm font-semibold text-[var(--brand)] hover:underline">
                      Map a public repository →
                    </Link>
                  </p>
                ) : null}
              </article>
            ))}
          </div>

          <div className="mt-10 max-w-5xl border-t border-[var(--border)] pt-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Intended future relationship</p>
            <p className="mt-3 font-mono text-base font-medium leading-relaxed text-[var(--text)]">G.R.A.F.T.1st → intended architecture → implementation → G.R.A.F.T.+ → reconstructed architecture → drift analysis</p>
            <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">This remains a development hypothesis, not a completed research finding.</p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]" aria-labelledby="substrate-research-heading">
        <div className="container-site grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Active R&amp;D program</p>
            <h2 id="substrate-research-heading" className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{substrateResearch.title}</h2>
            <p className="mt-3 text-sm font-medium text-[var(--brand)]">{substrateResearch.status}</p>
          </div>
          <div className="max-w-4xl space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>{substrateResearch.description}</p>
            <p>{substrateResearch.evidence}</p>
            <div className="flex flex-wrap gap-6 text-sm font-semibold text-[var(--brand)]">
              <a href={substrateResearch.architectureUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Architecture and implementation →</a>
              <a href={substrateResearch.researchUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Research and protocols →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]" aria-labelledby="future-research-heading">
        <div className="container-site grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Future R&amp;D work</p>
            <h2 id="future-research-heading" className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{futureResearch.title}</h2>
            <p className="mt-3 text-sm font-medium text-[var(--brand)]">{futureResearch.status}</p>
          </div>
          <div className="max-w-4xl space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>{futureResearch.description}</p>
            <p>{futureResearch.aim}</p>
            <p>{futureResearch.collaboration}</p>
            <div className="flex flex-wrap items-center gap-5 pt-2">
              <a href={futureResearch.researchUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--brand)] hover:underline">Read the research foundation →</a>
              <Link to="/contact" className="text-sm font-semibold text-[var(--brand)] hover:underline">Discuss collaboration or support →</Link>
            </div>
            <p className="text-sm text-[var(--text-subtle)]">Proposed research, not a demonstrated predictive capability.</p>
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
