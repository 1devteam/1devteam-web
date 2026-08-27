import { Link } from 'react-router-dom'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

export function AboutPage() {
  return (
    <>
      <Seo
        title="About"
        description="1DevTeam is a software development and applied R&D company working alongside AI to solve difficult software and systems problems."
        path="/about"
      />
      <PageHero
        eyebrow="About 1DevTeam"
        title="A development company built around difficult problems"
        description="1DevTeam L.L.C. is the company behind our software development, products, development tooling, and applied research. AI is part of how we work, but it does not define the limits of the problem."
      />

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>
              We begin with the problem, investigate the system around it, and build the form of solution the evidence supports. Sometimes that is a product. Sometimes it is a custom system, an architectural repair, a development tool, or a research question.
            </p>
            <p>
              A recurring pattern has emerged through the work: encounter a limitation, investigate why it exists, build a mechanism to address it, use that mechanism in real work, and refine it as new evidence appears.
            </p>
            <p>
              PRIDE Protocol grew from problems with rushed AI-assisted development. Snapshot grew from the difficulty of transferring a large software project into a new AI context. The Ajenda Architectural Graph grew from the need to reason about dependencies, contracts, ownership, invariants, and blast radius without reconstructing the architecture from scratch each time.
            </p>
            <p>
              That same pattern now extends into 1DevTeam's first formal R&amp;D program, where questions raised during Ajenda development are being studied systematically rather than converted directly into product claims.
            </p>
            <p className="font-medium text-[var(--text)]">
              The common thread is not a particular model, framework, or product category. It is a way of working: understand the problem, reason across the whole system, act on evidence, and turn useful discoveries into better software, methods, or tools.
            </p>
          </div>

          <aside className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Working principles</p>
            <ul className="mt-5 space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
              <li><strong className="text-[var(--text)]">Problem first.</strong> Technology follows the actual need.</li>
              <li><strong className="text-[var(--text)]">Work beside AI.</strong> Treat context, verification, and system understanding as engineering concerns.</li>
              <li><strong className="text-[var(--text)]">Whole-system thinking.</strong> Local success is not enough if surrounding architecture is damaged.</li>
              <li><strong className="text-[var(--text)]">Evidence over labels.</strong> State what is operational, experimental, under study, or unresolved.</li>
            </ul>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild><Link to="/method">How we work</Link></Button>
              <Button asChild variant="outline"><Link to="/work">See the work</Link></Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
