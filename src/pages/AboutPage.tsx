import { Link } from 'react-router-dom'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

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
        <div className="container-site grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>
              AI is neither the boundary of the company nor a background utility concealed behind conventional development language. It is an active part of the development system, and its contribution is represented accordingly.
            </p>
            <p>
              The work remains problem-driven. The appropriate solution may be a new software system, a product, an architectural repair, an integration, a development tool, or a research question.
            </p>
            <p>
              1DevTeam approaches software as a system of interacting contracts, dependencies, state, authority, data, runtime behavior, and failure paths. Implementation is therefore evaluated against the architecture surrounding the requested change rather than only against the behavior immediately visible at the point of modification.
            </p>
            <p>
              AI extends the amount of software that can be inspected, analyzed, generated, tested, and reasoned about. It also introduces engineering constraints including context limits, incomplete reconstruction, premature solution selection, local reasoning, and confidence that may exceed available evidence. Those constraints are treated as engineering problems.
            </p>
          </div>

          <aside className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Operating principles</p>
            <ul className="mt-5 space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
              <li><strong className="text-[var(--text)]">Problem first. Technology second.</strong> Implementation follows the structure of the actual problem rather than a predetermined technology category.</li>
              <li><strong className="text-[var(--text)]">Whole-system reasoning.</strong> A local fix is incomplete when it violates a contract, invariant, dependency, authority boundary, or downstream behavior elsewhere in the system.</li>
              <li><strong className="text-[var(--text)]">Evidence before assumption.</strong> Repository state, tests, runtime behavior, architecture, and explicit proof take precedence over plausible interpretation.</li>
              <li><strong className="text-[var(--text)]">Completion includes verification.</strong> Implementation, testing, failure-path analysis, documentation, and review are parts of the same engineering task.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Development history</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">How the development systems emerged</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              During founder-led development, repeated use of AI on increasingly large software systems exposed several distinct failure modes.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Process</p>
              <h3 className="mt-2 text-2xl font-semibold">PRIDE Protocol</h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
                The first failure mode involved process: technically plausible answers could be produced before sufficient system understanding had been established. PRIDE Protocol converted the required development discipline into an explicit operating standard.
              </p>
            </article>
            <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Context</p>
              <h3 className="mt-2 text-2xl font-semibold">Snapshot</h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
                The second failure mode involved context transfer. Large repositories could not be efficiently reconstructed from zero at the beginning of every new model context. Snapshot was developed to package project structure and state into a reusable context-transfer artifact.
              </p>
            </article>
            <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Architecture</p>
              <h3 className="mt-2 text-2xl font-semibold">Ajenda Architectural Graph</h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
                The third failure mode involved architecture. Repository reading and snapshots could provide extensive information while still requiring the architecture itself to be repeatedly reconstructed during change analysis. The Ajenda Architectural Graph externalized that structure into a persistent machine-readable model.
              </p>
            </article>
          </div>

          <p className="mt-8 max-w-4xl text-[17px] leading-relaxed text-[var(--text-muted)]">
            These systems remain development tools rather than retrospective branding concepts. Their current forms were produced through use, revision, and direct integration into software work.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild><Link to="/method">Development method</Link></Button>
            <Button asChild variant="outline"><Link to="/work">Technical evidence</Link></Button>
          </div>
        </div>
      </section>
    </>
  )
}
