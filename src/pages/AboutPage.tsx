import { Link } from 'react-router-dom'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/data/site'

const principles = [
  ['Problem first. Technology second.', 'Implementation follows the structure of the actual problem rather than a predetermined technology category.'],
  ['Whole-system reasoning.', 'A local fix is incomplete when it violates a contract, invariant, dependency, authority boundary, or downstream behavior elsewhere in the system.'],
  ['Evidence before assumption.', 'Repository state, tests, runtime behavior, architecture, and explicit proof take precedence over plausible interpretation.'],
  ['Completion includes verification.', 'Implementation, testing, failure-path analysis, documentation, and review are parts of the same engineering task.'],
] as const

const developmentHistory = [
  {
    label: 'Process',
    title: 'PRIDE Protocol',
    problem: 'AI-assisted implementation could become plausible before enough of the surrounding system had been understood.',
    response: 'The development process was made explicit and measurable around proper actions, verification, and complete-system reasoning.',
    href: '/method',
    cta: 'Read the development method',
  },
  {
    label: 'Context',
    title: 'Snapshot',
    problem: 'Large repositories still had to be reconstructed when a new model context began.',
    response: 'Snapshot was built to transfer structured repository and project state without claiming to replace direct inspection or architectural reasoning.',
    href: '/wiki#snapshot',
    cta: 'Read the Snapshot reference',
  },
  {
    label: 'Architecture',
    title: 'Ajenda Architectural Graph',
    problem: 'Project information alone did not preserve decision ownership, invariants, dependencies, blast radius, or proof relationships.',
    response: 'The graph externalized that structure into a persistent machine-readable development and CI artifact.',
    href: '/#architecture-graph',
    cta: 'Inspect the Architectural Graph',
  },
] as const

export function AboutPage() {
  return (
    <>
      <Seo
        title="About"
        description="1DevTeam develops software, products, architecture tooling, and development systems while working alongside AI throughout the engineering process."
        path="/about"
      />
      <PageHero
        eyebrow="About 1DevTeam"
        title="Software development and applied R&D"
        description="1DevTeam develops software, products, architecture tooling, and development systems while working alongside AI throughout the engineering process."
      />

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.36fr_0.64fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Company model</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">A development company organized around difficult problems</h2>
          </div>
          <div className="max-w-4xl space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>
              {siteConfig.legalName} is the company behind 1DevTeam&apos;s software development, products, development tooling, and applied research. AI is an active part of the development system and is represented openly as part of how the work is performed.
            </p>
            <p>
              The company is not bounded by a single technology category. A problem may require a new software system, product development, architecture remediation, integration work, development tooling, or a formal research question. The implementation form follows the problem.
            </p>
            <p>
              Software is treated as a system of interacting contracts, dependencies, state, authority, data, runtime behavior, and failure paths. A change is complete only when the surrounding architecture and required proof support that conclusion.
            </p>
            <p>
              Working alongside AI expands the amount of software that can be inspected, generated, tested, and reasoned about, while also introducing engineering constraints such as context limits, incomplete reconstruction, premature solution selection, and confidence that can exceed available evidence. Those constraints are treated as engineering problems in their own right.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site grid gap-12 lg:grid-cols-[0.36fr_0.64fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Operating principles</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Standards that remain stable across the work</h2>
          </div>
          <dl className="max-w-4xl">
            {principles.map(([title, description]) => (
              <div key={title} className="grid gap-2 border-t border-[var(--border)] py-6 md:grid-cols-[0.36fr_0.64fr]">
                <dt className="font-semibold text-[var(--text)]">{title}</dt>
                <dd className="text-[17px] leading-relaxed text-[var(--text-muted)]">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Development history</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">A recurring engineering pattern</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              Several current 1DevTeam systems originated from constraints discovered during real software development. Their histories are related, but their responsibilities are different: process discipline, context transfer, and persistent architecture.
            </p>
          </div>

          <div className="mt-12 max-w-5xl">
            {developmentHistory.map((item) => (
              <article key={item.title} className="grid gap-5 border-t border-[var(--border)] py-8 md:grid-cols-[0.24fr_0.76fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">{item.label}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">{item.title}</h3>
                </div>
                <div>
                  <p className="text-base leading-relaxed text-[var(--text)]"><strong>Observed constraint:</strong> {item.problem}</p>
                  <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]"><strong className="text-[var(--text)]">Engineering response:</strong> {item.response}</p>
                  {item.href.startsWith('/#') ? (
                    <a href={item.href} className="mt-4 inline-block text-sm font-semibold text-[var(--brand)] hover:underline">{item.cta} →</a>
                  ) : (
                    <Link to={item.href} className="mt-4 inline-block text-sm font-semibold text-[var(--brand)] hover:underline">{item.cta} →</Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          <p className="mt-10 max-w-4xl text-[17px] leading-relaxed text-[var(--text-muted)]">
            The recurring pattern is: observe a limitation → investigate the mechanism → build a correction → use it in real work → refine it from evidence → reuse or productize it only when the evidence supports doing so. The formal R&amp;D program applies the same discipline to questions that require empirical study rather than product interpretation.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild><Link to="/method">Development method</Link></Button>
            <Button asChild variant="outline"><Link to="/research">Formal R&amp;D program</Link></Button>
            <Button asChild variant="outline"><Link to="/wiki">Technical Wiki</Link></Button>
          </div>
        </div>
      </section>
    </>
  )
}
