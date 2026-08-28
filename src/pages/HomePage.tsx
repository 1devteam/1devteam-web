import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

      <section className="section-pad">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
              Development scope
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Software, systems, products, and development tooling
            </h2>
            <p className="mt-4 text-[18px] leading-relaxed text-[var(--text-muted)]">
              1DevTeam develops software at multiple layers of the system—from product surfaces and application logic to architecture, integrations, state, control boundaries, and development infrastructure.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {buildAreas.map((area) => (
              <Link
                key={area.title}
                to={area.href}
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <h3 className="text-xl font-semibold">{area.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">{area.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">
                  Explore <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
              AI-assisted development systems
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Development systems derived from active software work
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              PRIDE Protocol, Snapshot, and the Ajenda Architectural Graph were developed in response to different constraints encountered during AI-assisted software development. They address three separate layers of the development problem.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Development process discipline</p>
              <h3 className="mt-2 text-2xl font-semibold">PRIDE Protocol</h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
                PRIDE defines the actions required for reliable AI-assisted engineering: complete reading, sufficient context, system-level reasoning, correct implementation scope, testing, verification, documentation, and review.
              </p>
              <p className="mt-4 font-mono text-sm font-semibold text-[var(--text)]">PRIDE = Proper Actions ÷ Total Actions</p>
            </article>
            <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Project-context transfer</p>
              <h3 className="mt-2 text-2xl font-semibold">Snapshot</h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
                Snapshot captures structured project state so an LLM can begin work with substantially more of the repository, architecture, configuration, routes, dependencies, tests, and development context already available.
              </p>
            </article>
            <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Persistent architecture and change reasoning</p>
              <h3 className="mt-2 text-2xl font-semibold">Architectural Graph</h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
                The Ajenda Architectural Graph represents software structure, dependencies, decision ownership, invariants, proof relationships, and selected function-level behavior in machine-readable form. It is used during Ajenda development for impact analysis, proof selection, architecture checks, completeness auditing, and targeted diagnosis.
              </p>
            </article>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <figure className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[#173f79] shadow-sm">
              <img src="/artifacts/snapshot-v10.svg" alt="Snapshot v10 execution in the Ajenda development shell" className="block w-full" />
              <figcaption className="border-t border-white/10 bg-[#0a1120] px-5 py-4 text-sm leading-relaxed text-slate-200">
                <strong className="text-white">Snapshot v10.0 · execution artifact.</strong> Snapshot executed against the Ajenda repository. The captured run indexed 1,376 files and 2,451 routes, reported zero Python parse errors, recorded the active Git state, and operated with project writes disabled.
              </figcaption>
            </figure>

            <figure className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-sm">
              <img src="/artifacts/mission-composition-graph.svg" alt="Selected decision functions from Ajenda's canonical architecture graph" className="block w-full" />
              <figcaption className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed text-[var(--text-muted)]">
                <strong className="text-[var(--text)]">Ajenda Architectural Graph · architecture artifact.</strong> Deterministic rendering of selected nodes and <code>calls_function</code> relationships from the canonical Ajenda dependency graph. Schema 1.2 · 1,202 nodes · 3,600 edges. The displayed relationships are derived from the graph artifact produced by Ajenda&apos;s architecture CI workflow rather than reconstructed for presentation.
              </figcaption>
            </figure>
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
        <div className="container-site grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Applied R&amp;D</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Research grounded in active software development</h2>
          </div>
          <div>
            <p className="text-[17px] leading-relaxed text-[var(--text-muted)]">
              1DevTeam&apos;s first formal R&amp;D program studies architectural reasoning scope and corrective PR cascades in AI-assisted software development. The current study examines whether mismatches between the scope of a software change and its actual architectural blast radius predict subsequent corrective work.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The research also informs the development of Grafted Plus and Grafted First while keeping product objectives separate from scientific conclusions.
            </p>
            <Button asChild className="mt-7"><Link to="/research">Read the R&amp;D program</Link></Button>
          </div>
        </div>
      </section>
    </>
  )
}
