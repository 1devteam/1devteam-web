import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { InteractiveArchitectureGraph } from '@/components/architecture/InteractiveArchitectureGraph'
import { SnapshotArtifact } from '@/components/artifacts/SnapshotArtifact'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { researchProgram } from '@/data/research'
import { buildAreas, siteConfig } from '@/data/site'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  email: siteConfig.email,
  sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
}

const graphCapabilities = [
  ['Dependency reasoning', 'Trace what depends on what and why a local change can propagate beyond the file being modified.'],
  ['Decision ownership', 'Locate the function, module, contract, or invariant that actually owns a software decision.'],
  ['Blast-radius analysis', 'Compare an intended modification with the surrounding architecture before treating a local repair as complete.'],
  ['Proof selection', 'Use mapped relationships to identify tests and other evidence required outside the immediate implementation surface.'],
  ['Completeness auditing', 'Expose missing links, unresolved architecture findings, and areas where the represented system state remains incomplete.'],
] as const

export function HomePage() {
  return (
    <>
      <Seo description={siteConfig.description} path="/" jsonLd={organizationJsonLd} />

      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(155deg,#ffffff_0%,var(--bg)_54%,var(--surface)_100%)]">
        <div className="container-site py-20 md:py-28 lg:py-32">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
            Software Development · Applied R&amp;D
          </p>
          <h1 className="mt-6 max-w-5xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-[4.6rem] lg:leading-[1.02]">
            {siteConfig.tagline}
          </h1>
          <p className="mt-7 max-w-3xl text-xl leading-relaxed text-[var(--text-muted)]">
            {siteConfig.description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/work">View our work <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Discuss a project</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="rd-program" className="scroll-mt-24 section-pad border-b border-[var(--border)] bg-white">
        <div className="container-site">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">1DevTeam R&amp;D Program #1</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Architectural reasoning scope and corrective PR cascades</h2>
            <p className="mt-5 text-[18px] leading-relaxed text-[var(--text-muted)]">{researchProgram.summary}</p>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              Ajenda AI provides the longitudinal development record for the study. During that development, the Architectural Graph was introduced to externalize software structure, dependencies, decision ownership, blast radius, and proof relationships. The study preserves graph-absent, graph-construction, and graph-assisted periods as separate conditions rather than assuming graph assistance is superior in advance.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline"><Link to="/research">Read the formal R&amp;D program</Link></Button>
              <a href="#architecture-graph" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline">
                Inspect the graph <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>

          <div id="architecture-graph" className="scroll-mt-24 mt-12 border-t border-[var(--border)] pt-10">
            <div className="mb-6 max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Interactive figure · canonical public inspection surface</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Ajenda Architectural Graph — interactive architecture inspection</h3>
              <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">
                Inspect selected real nodes from Ajenda&apos;s canonical architecture graph. Select a function, examine its decision role, and follow mapped <code>calls_function</code>, <code>tests_function</code>, and <code>defined_in</code> relationships. The public view is a reviewed projection of the development graph rather than a generated illustration.
              </p>
            </div>
            <InteractiveArchitectureGraph compact />
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Development scope</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Software, systems, products, and development tooling</h2>
            <p className="mt-4 text-[18px] leading-relaxed text-[var(--text-muted)]">
              1DevTeam develops software at multiple layers of the system—from product surfaces and application logic to architecture, integrations, state, control boundaries, and development infrastructure. The problem determines the implementation form rather than the other way around.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {buildAreas.map((area) => (
              <article key={area.title} className="border-t border-[var(--border)] pt-5">
                <h3 className="text-xl font-semibold">{area.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">{area.description}</p>
                <Link to={area.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline">
                  Explore <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">AI-assisted development systems</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Development systems derived from active software work</h2>
            <p className="mt-4 text-[18px] leading-relaxed text-[var(--text-muted)]">
              PRIDE Protocol, Snapshot, and the Ajenda Architectural Graph arose from different constraints in AI-assisted software development. Read together, they form a progression from development discipline, to transferable project context, to persistent architectural state.
            </p>
          </div>

          <article id="pride-protocol" className="scroll-mt-24 mt-14 border-t border-[var(--border)] pt-10">
            <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Process discipline</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight">PRIDE Protocol</h3>
                <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                  PRIDE Protocol measures development-process quality by the proportion of proper actions taken during a task. Its working metric is <strong className="text-[var(--text)]">PRIDE = Proper Actions ÷ Total Actions</strong>, with a target of 95% or greater proper actions.
                </p>
                <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                  It emerged from repeated AI-assisted development in which technically plausible answers could arrive before sufficient system understanding had been established. PRIDE makes the required process explicit: read the relevant system completely enough, understand the full problem and context, search rather than guess, implement the complete solution at the correct layer, test the affected behavior, document what changed, and review the result against the actual problem.
                </p>
                <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                  The operating workflow is intentionally stable: <strong className="text-[var(--text)]">Read completely → Understand fully → Plan properly → Execute systematically → Test thoroughly → Document clearly → Review honestly.</strong>
                </p>
                <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                  Process discipline improved how the work was performed, but it did not solve a separate problem: transferring enough of a large software project into a new model context to avoid repeatedly reconstructing the repository from zero.
                </p>
                <Link to="/method" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline">
                  Read the full development method <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              <figure className="lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[#282828] shadow-sm">
                  <img src="/artifacts/pride-protocol-working.svg" alt="PRIDE Protocol working formulation" className="block w-full" />
                </div>
                <figcaption className="mt-3 text-sm leading-relaxed text-[var(--text-subtle)]">
                  Early working formulation of the PRIDE Protocol used during AI-assisted development. The wording is preserved as a process artifact rather than rewritten into a decorative reconstruction.
                </figcaption>
              </figure>
            </div>
          </article>

          <article id="snapshot" className="scroll-mt-24 mt-16 border-t border-[var(--border)] pt-10">
            <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
              <SnapshotArtifact />

              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Project-context transfer</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight">Snapshot</h3>
                <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                  Snapshot addresses the context-transfer problem by producing a structured representation of project state that can be carried into a model context. The v10 artifact can include Git state, file inventory, hashes, routes, imports and dependencies, tests, parse results, environment and configuration structure, documentation summaries, CI/CD information, and related repository context.
                </p>
                <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                  The execution artifact beside this text records a real Snapshot v10.0 run against Ajenda. The expandable JSON excerpt shows part of what the tool actually formed: structured project data rather than a screenshot-only proof that a command executed.
                </p>
                <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                  Snapshot does not replace repository inspection, and it does not itself produce the Architectural Graph. It increases the amount of project context available to the model. Architectural relationships still require a separate representation when the goal is system-wide change reasoning.
                </p>
              </div>
            </div>
          </article>

          <article className="mt-16 border-t border-[var(--border)] pt-10">
            <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Persistent architecture</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight">Architectural Graph</h3>
              </div>
              <div className="max-w-4xl">
                <p className="text-[17px] leading-relaxed text-[var(--text-muted)]">
                  Snapshot increases project context; the Ajenda Architectural Graph externalizes software structure. The graph represents dependencies, decision ownership, selected function-level behavior, tests, architecture roles, semantic boundaries, invariants, and proof relationships in machine-readable form so architecture does not have to be reconstructed from scratch for every change.
                </p>
                <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                  Its current development workflow supports dependency analysis, change-impact analysis, blast-radius identification, graph-selected proof, selective CI reasoning, completeness auditing, architecture decision composition, and selected function-level diagnosis. It is an active Ajenda development and CI capability, not customer-facing runtime functionality.
                </p>
                <a href="#architecture-graph" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline">
                  Inspect the live Architectural Graph above ↑
                </a>
              </div>
            </div>

            <dl className="mt-10 grid gap-x-8 gap-y-7 md:grid-cols-2 xl:grid-cols-5">
              {graphCapabilities.map(([title, description]) => (
                <div key={title} className="border-t border-[var(--border)] pt-4">
                  <dt className="font-semibold text-[var(--text)]">{title}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{description}</dd>
                </div>
              ))}
            </dl>
          </article>

          <div className="mt-14 border-y border-[var(--border)] py-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Relationship between the systems</p>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <p className="text-lg font-semibold leading-relaxed">PRIDE defines how the work should be performed.</p>
              <p className="text-lg font-semibold leading-relaxed">Snapshot increases the project context available to the model.</p>
              <p className="text-lg font-semibold leading-relaxed">The Architectural Graph externalizes system structure for architecture-aware reasoning and proof.</p>
            </div>
          </div>

          <Button asChild variant="outline" className="mt-8">
            <Link to="/method">See the development method</Link>
          </Button>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge variant="brand">Flagship product · private development</Badge>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Structured execution software</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Ajenda AI</h2>
            <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-[var(--text-muted)]">
              Ajenda AI is an actively developed system for converting goals into structured missions, plans, tasks, and controlled execution. Its architecture includes explicit authority, durable state, review boundaries, capability controls, recovery behavior, and traceable execution.
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--text-subtle)]">Private development · locally operational</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild><Link to="/products/ajenda">Explore Ajenda AI</Link></Button>
              <Button asChild variant="outline"><Link to="/research">Read the R&amp;D program</Link></Button>
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--navy-950)] p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Development sequence</p>
            <p className="mt-4 text-xl font-semibold leading-relaxed">
              Observed constraint → technical mechanism → implemented system → current use.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site grid gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Continue the reference</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Follow the work deeper</h2>
          </div>
          <div className="max-w-3xl">
            <p className="text-[17px] leading-relaxed text-[var(--text-muted)]">
              The R&amp;D page documents the study design, intervention boundary, measurements, scientific controls, and current observations. The Technical Wiki defines the architecture, development-system, and research terminology used throughout the site so implemented behavior, hypotheses, objectives, and unresolved questions remain distinguishable.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <Link to="/research" className="font-semibold text-[var(--brand)] hover:underline">Read the R&amp;D program →</Link>
              <Link to="/wiki" className="font-semibold text-[var(--brand)] hover:underline">Open the Technical Wiki →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
