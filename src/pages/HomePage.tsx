import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SnapshotArtifact } from '@/components/artifacts/SnapshotArtifact'
import { AjendaCommandCenter } from '@/components/product/AjendaCommandCenter'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { researchProgram } from '@/data/research'
import { buildAreas, siteConfig } from '@/data/site'

const InteractiveArchitectureGraph = lazy(() =>
  import('@/components/architecture/InteractiveArchitectureGraph').then((module) => ({ default: module.InteractiveArchitectureGraph })),
)

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  email: siteConfig.email,
  sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
}

const developmentSystems = [
  {
    name: 'PRIDE Protocol',
    role: 'Process discipline',
    description: 'Defines how AI-assisted development work should be performed: sufficient reading, explicit uncertainty handling, complete implementation, verification, documentation, and review.',
    href: '/method',
    cta: 'Read the development method',
  },
  {
    name: 'Snapshot',
    role: 'Project-context transfer',
    description: 'Packages structured repository and project state so a new model context can begin with substantially more of the real system available for inspection.',
    href: '/wiki#snapshot',
    cta: 'Read the Snapshot reference',
  },
  {
    name: 'Architectural Graph',
    role: 'Persistent architecture',
    description: 'Externalizes dependencies, decision ownership, selected invariants, change impact, and proof relationships for architecture-aware development and CI.',
    href: '/#architecture-graph',
    cta: 'Inspect the interactive graph',
  },
] as const

export function HomePage() {
  return (
    <>
      <Seo description={siteConfig.description} path="/" jsonLd={organizationJsonLd} />

      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(155deg,#ffffff_0%,var(--bg)_54%,var(--surface)_100%)]">
        <div className="container-site py-20 md:py-28 lg:py-32">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Software Development · Applied R&amp;D</p>
          <h1 className="mt-6 max-w-5xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-[4.6rem] lg:leading-[1.02]">{siteConfig.tagline}</h1>
          <p className="mt-7 max-w-3xl text-xl leading-relaxed text-[var(--text-muted)]">{siteConfig.description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link to="/work">Inspect the work <ArrowRight className="h-4 w-4" aria-hidden /></Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/contact">Discuss a project</Link></Button>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Development scope</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Software, systems, products, and the methods used to build them</h2>
            <p className="mt-4 text-[18px] leading-relaxed text-[var(--text-muted)]">Work can begin with a new product, an existing system that is failing at its architectural boundaries, or a recurring development constraint that warrants tooling or formal investigation. The problem determines the implementation form.</p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {buildAreas.map((area) => (
              <article key={area.title} className="border-t border-[var(--border)] pt-5">
                <h3 className="text-xl font-semibold">{area.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">{area.description}</p>
                <Link to={area.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline">{area.cta} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">AI-assisted development systems</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Three systems address three different sources of development error</h2>
            <p className="mt-4 text-[18px] leading-relaxed text-[var(--text-muted)]">PRIDE governs process, Snapshot transfers project context, and the Architectural Graph preserves machine-readable system structure. The full methodology lives on the Method page; the Wiki defines the terminology; this page preserves the primary public artifacts.</p>
          </div>
          <div className="mt-10 grid gap-7 lg:grid-cols-3">
            {developmentSystems.map((system) => (
              <article key={system.name} className="border-t border-[var(--border)] pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">{system.role}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">{system.name}</h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">{system.description}</p>
                {system.href.startsWith('/#') ? (
                  <a href={system.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline">{system.cta} <ArrowRight className="h-4 w-4" aria-hidden /></a>
                ) : (
                  <Link to={system.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline">{system.cta} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                )}
              </article>
            ))}
          </div>
          <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:items-start">
            <figure id="pride-protocol" className="scroll-mt-24">
              <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[#282828] shadow-sm">
                <img src="/artifacts/pride-protocol-working.svg" alt="PRIDE Protocol working formulation" loading="lazy" decoding="async" className="block w-full" />
              </div>
              <figcaption className="mt-3 text-sm leading-relaxed text-[var(--text-subtle)]">Preserved working formulation of the PRIDE Protocol used during AI-assisted development.</figcaption>
            </figure>
            <div id="snapshot" className="scroll-mt-24"><SnapshotArtifact /></div>
          </div>
        </div>
      </section>

      <section id="rd-program" className="scroll-mt-24 section-pad border-b border-[var(--border)] bg-white">
        <div className="container-site">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">1DevTeam R&amp;D Program #1</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Architectural reasoning scope and corrective PR cascades</h2>
            <p className="mt-5 text-[18px] leading-relaxed text-[var(--text-muted)]">{researchProgram.summary}</p>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">Ajenda AI provides the longitudinal development record. The study preserves graph-absent, graph-construction, and graph-assisted periods as distinct conditions and does not assume graph assistance is superior in advance.</p>
            <Button asChild variant="outline" className="mt-6"><Link to="/research">Read the formal R&amp;D program</Link></Button>
          </div>
          <div id="architecture-graph" className="scroll-mt-24 mt-12 border-t border-[var(--border)] pt-10">
            <div className="mb-6 max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Interactive figure · reviewed public projection</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Ajenda Architectural Graph</h3>
              <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">Inspect selected real nodes and mapped <code>calls_function</code>, <code>tests_function</code>, and <code>defined_in</code> relationships from Ajenda&apos;s canonical development graph.</p>
            </div>
            <Suspense fallback={<div className="min-h-64 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6" role="status">Loading interactive architecture inspection…</div>}>
              <InteractiveArchitectureGraph compact />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Badge variant="brand">Flagship product · private development</Badge>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Structured execution software</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Ajenda AI</h2>
            <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-[var(--text-muted)]">Ajenda converts objectives into structured missions, plans, tasks, approvals, and controlled execution. Its architecture separates interpretation from authority and maintains durable state, review, recovery, and traceable outcomes.</p>
            <p className="mt-4 text-sm font-medium text-[var(--text-subtle)]">Private development · locally operational</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild><Link to="/products/ajenda">Explore Ajenda AI</Link></Button>
              <Button asChild variant="outline"><Link to="/work">Inspect technical evidence</Link></Button>
            </div>
          </div>
          <AjendaCommandCenter />
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--navy-950)] py-12 text-white">
        <div className="container-site flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Technical reference</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Definitions, architecture terms, and research language are maintained in the Wiki.</h2>
          </div>
          <Button asChild variant="secondary"><Link to="/wiki">Open the Technical Wiki</Link></Button>
        </div>
      </section>
    </>
  )
}
