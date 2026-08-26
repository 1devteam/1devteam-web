import { Link } from 'react-router-dom'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/data/site'

export function AboutPage() {
  return (
    <>
      <Seo
        title="About"
        description="1devteam is an AI product studio, systems builder, and active R&D program developing governed software and architecture-intelligence tooling."
        path="/about"
      />
      <PageHero
        eyebrow="About"
        title="Builders of governed systems"
        description={`${siteConfig.name} is an AI product studio, systems builder, and active R&D organization — not a generic agency, not a pure consultancy, and not a single-product company. We design software that moves businesses from goals to execution.`}
      />

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>
              <strong className="font-semibold text-[var(--text)]">1DevTeam L.L.C.</strong>{' '}
              is the legal entity behind the 1DevTeam brand, its R&D program,
              product development, and company operations.
            </p>
            <p>
              The market is full of AI language. We compete on systems: clear
              categories, production engineering, human oversight, and evidence
              you can inspect. Ajenda AI is our flagship product; client work
              spans custom AI systems, SaaS products, and operations
              infrastructure.
            </p>
            <p>
              1DevTeam's first formal R&D program studies architectural
              reasoning scope, corrective PR cascades, graph-assisted
              development, and related evidence. That research is intended to
              inform Grafted Plus for existing systems and Grafted First for
              project-origin architecture, while keeping product goals separate
              from scientific conclusions.
            </p>
            <p>
              Technical buyers want inspectable claims, credible stacks, and
              serious risk handling. Operators want to know whether talking to
              us is worth the time. Both audiences get the same standard:
              specific messaging, visible proof, and dual-path conversion —
              learn on your own or contact us now.
            </p>
            <p>
              We publish method, work notes, and product thinking in public.
              That is intentional. Trust is calibrated with evidence, not claimed
              with mood.
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
            <h2 className="text-xl font-semibold tracking-tight">
              How to evaluate us
            </h2>
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
              <li>
                <Link to="/work" className="font-medium text-[var(--brand)] hover:underline">
                  Work
                </Link>{' '}
                — proof, build journals, and systems patterns.
              </li>
              <li>
                <Link to="/research" className="font-medium text-[var(--brand)] hover:underline">
                  Research & Development
                </Link>{' '}
                — the first formal R&D program and its scientific boundaries.
              </li>
              <li>
                <Link to="/products/ajenda" className="font-medium text-[var(--brand)] hover:underline">
                  Ajenda AI
                </Link>{' '}
                — flagship product depth.
              </li>
              <li>
                <Link to="/method" className="font-medium text-[var(--brand)] hover:underline">
                  Method
                </Link>{' '}
                — how we design and govern AI systems.
              </li>
              <li>
                <Link to="/trust" className="font-medium text-[var(--brand)] hover:underline">
                  Trust & Security
                </Link>{' '}
                — lightweight trust layer.
              </li>
            </ul>
            <Button asChild className="mt-8">
              <Link to="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
