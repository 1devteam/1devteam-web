import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { buildAreas, proofPoints, siteConfig } from '@/data/site'

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
            Software development · Applied R&amp;D · Human + AI engineering
          </p>
          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-[4.6rem] lg:leading-[1.02]">
            We build software — and better ways to build it.
          </h1>
          <p className="mt-7 max-w-2xl text-xl leading-relaxed text-[var(--text-muted)]">
            1DevTeam works alongside AI to solve difficult problems, build dependable systems and products, and improve the methods and tools used to develop them.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/work">Explore our work <ArrowRight className="h-4 w-4" aria-hidden /></Link>
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
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">What 1DevTeam builds</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Software and systems for real problems</h2>
            <p className="mt-4 text-[18px] leading-relaxed text-[var(--text-muted)]">
              The problem comes first. Sometimes the result is a product. Sometimes it is a custom system, a repair to an existing architecture, a development tool, or a research question worth investigating.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {buildAreas.map((area) => (
              <Link key={area.title} to={area.href} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                <h3 className="text-xl font-semibold">{area.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">{area.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">Explore <ArrowRight className="h-4 w-4" aria-hidden /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Built from problems encountered while building</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Working beside AI, in practice</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                1DevTeam has repeatedly encountered practical limits in AI-assisted development, investigated the failure, built a mechanism around it, and then used that mechanism in real work.
              </p>
              <div className="mt-6 space-y-4">
                <div><strong>PRIDE Protocol</strong><p className="mt-1 text-base text-[var(--text-muted)]">A proper-action discipline for complete reading, system-level reasoning, testing, verification, and recovery when the process falls short.</p></div>
                <div><strong>Snapshot</strong><p className="mt-1 text-base text-[var(--text-muted)]">A project-context transfer system designed to move a language model from zero prior project knowledge toward comprehensive working context.</p></div>
                <div><strong>Architectural Graph</strong><p className="mt-1 text-base text-[var(--text-muted)]">Persistent architecture state used for dependency, ownership, invariant, blast-radius, proof, and selected function-level reasoning in Ajenda development.</p></div>
              </div>
              <Button asChild variant="outline" className="mt-7"><Link to="/method">See the development method</Link></Button>
            </div>

            <div className="space-y-6">
              <figure className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[#173f79] shadow-sm">
                <img src="/artifacts/snapshot-v10.svg" alt="Snapshot v10 execution in the Ajenda development shell" className="block w-full" />
                <figcaption className="border-t border-white/10 bg-[#0a1120] px-5 py-4 text-sm leading-relaxed text-slate-200">
                  <strong className="text-white">Execution artifact · Snapshot v10.0.</strong> A real Ajenda run: 1,376 files, 2,451 detected routes, zero Python parse errors, and project writes disabled.
                </figcaption>
              </figure>

              <figure className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-sm">
                <img src="/artifacts/mission-composition-graph.svg" alt="Selected decision functions from Ajenda's canonical architecture graph" className="block w-full" />
                <figcaption className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed text-[var(--text-muted)]">
                  <strong className="text-[var(--text)]">Architecture artifact · canonical graph schema 1.2.</strong> This view is deterministically drawn from real graph nodes and call edges, not generated illustration.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge variant="brand">Flagship product · private development</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Ajenda AI</h2>
            <p className="mt-4 max-w-xl text-[18px] leading-relaxed text-[var(--text-muted)]">
              Ajenda is an actively developed execution system for turning goals into structured missions, plans, tasks, and controlled work. Its architecture emphasizes explicit authority, durable state, review boundaries, recovery behavior, and evidence around what the system is allowed to do.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild><Link to="/products/ajenda">Explore Ajenda AI</Link></Button>
              <Button asChild variant="outline"><Link to="/research">Read the R&amp;D program</Link></Button>
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--navy-950)] p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Development pattern</p>
            <p className="mt-4 text-2xl font-semibold leading-snug">Build → encounter a limitation → investigate it → create a mechanism → use it → learn → improve how we build.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-white py-10">
        <div className="container-site grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofPoints.map((point) => (
            <div key={point.title}>
              <h2 className="text-sm font-semibold">{point.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{point.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
