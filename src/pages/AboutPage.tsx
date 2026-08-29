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
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">A development company built around difficult problems</h2>
          </div>
          <div className="max-w-4xl space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>
              {siteConfig.legalName} is the company behind 1DevTeam&apos;s software development, products, development tooling, and applied research. AI is neither the boundary of the company nor a background utility concealed behind conventional development language. It is an active part of the development system, and its contribution is represented accordingly.
            </p>
            <p>
              The work remains problem-driven. The appropriate solution may be a new software system, a product, an architectural repair, an integration, a development tool, or a research question. The implementation form follows the problem rather than forcing the problem into a preferred technology category.
            </p>
            <p>
              1DevTeam approaches software as a system of interacting contracts, dependencies, state, authority, data, runtime behavior, and failure paths. Implementation is evaluated against the architecture surrounding a requested change rather than only against the behavior immediately visible at the point of modification.
            </p>
            <p>
              AI extends the amount of software that can be inspected, analyzed, generated, tested, and reasoned about. It also introduces engineering constraints including context limits, incomplete reconstruction, premature solution selection, local reasoning, and confidence that may exceed available evidence. Those constraints are treated as engineering problems rather than reasons to conceal the AI relationship.
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
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">How the development systems emerged</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              Repeated use of AI on increasingly large software systems exposed different classes of failure. The resulting tools were not designed as retrospective branding concepts; each was built in response to a concrete development constraint and then revised through use.
            </p>
          </div>

          <div className="mt-12 max-w-5xl space-y-12">
            <article className="border-t border-[var(--border)] pt-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Process → PRIDE Protocol</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Plausible output could arrive before sufficient understanding</h3>
              <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                The first failure mode involved process. A model could produce technically plausible answers before enough of the surrounding system had been read to establish whether the proposed change belonged at the correct architectural layer. PRIDE Protocol converted the required development discipline into an explicit operating standard: read completely enough, investigate uncertainty, reason system-wide, implement the complete solution, test the real behavior, document the result, and review the work against the actual problem.
              </p>
              <a href="/#pride-protocol" className="mt-4 inline-block text-sm font-semibold text-[var(--brand)] hover:underline">View the PRIDE working artifact →</a>
            </article>

            <article className="border-t border-[var(--border)] pt-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Context → Snapshot</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Process discipline did not solve context transfer</h3>
              <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                Large repositories still had to be reconstructed at the beginning of new model contexts. Snapshot was developed to package project structure and state into a reusable context-transfer artifact, including repository inventory, routes, dependency relationships, tests, parse results, configuration structure, Git state, and related project information. That reduced repeated rediscovery without claiming to replace repository inspection or architectural reasoning.
              </p>
              <a href="/#snapshot" className="mt-4 inline-block text-sm font-semibold text-[var(--brand)] hover:underline">Inspect Snapshot execution and output →</a>
            </article>

            <article className="border-t border-[var(--border)] pt-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Architecture → Ajenda Architectural Graph</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Project information and architectural meaning are not the same thing</h3>
              <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                Repository reading and Snapshot could expose extensive project information while still requiring the architecture itself to be reconstructed during change analysis. The Ajenda Architectural Graph externalized that next layer into a persistent machine-readable model of structure, ownership, dependencies, selected invariants, proof relationships, and increasingly fine-grained decision behavior.
              </p>
              <a href="/#architecture-graph" className="mt-4 inline-block text-sm font-semibold text-[var(--brand)] hover:underline">Inspect the live Architectural Graph →</a>
            </article>
          </div>

          <p className="mt-12 max-w-4xl text-[17px] leading-relaxed text-[var(--text-muted)]">
            The recurring pattern is consistent: observe a limitation → investigate the mechanism → build a correction → use it in real work → refine it from evidence → reuse or productize it only when the evidence supports doing so. That pattern now extends into 1DevTeam&apos;s first formal R&amp;D program, where questions raised during Ajenda development are studied systematically rather than converted directly into product claims.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild><Link to="/method">Development method</Link></Button>
            <Button asChild variant="outline"><Link to="/research">Formal R&amp;D program</Link></Button>
          </div>
        </div>
      </section>
    </>
  )
}
