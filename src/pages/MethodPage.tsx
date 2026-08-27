import { Link } from 'react-router-dom'
import { methodSteps } from '@/data/site'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

const prideSteps = [
  'Read completely',
  'Understand fully',
  'Plan properly',
  'Execute systematically',
  'Test thoroughly',
  'Document clearly',
  'Review honestly',
] as const

export function MethodPage() {
  return (
    <>
      <Seo
        title="Method"
        description="How 1DevTeam works alongside AI: understand the problem, map the system, build at the correct ownership layer, and prove what changed."
        path="/method"
      />
      <PageHero
        eyebrow="Method"
        title="Understand first. Build systematically. Prove what changed."
        description="1DevTeam's development method grew through repeated work on real software systems alongside AI. The objective is not to make the model move faster; it is to create conditions for sufficient context, correct architectural scope, and verifiable results."
      >
        <Button asChild><Link to="/contact">Apply this to a project</Link></Button>
      </PageHero>

      <section className="section-pad">
        <div className="container-site">
          <ol className="grid gap-6 md:grid-cols-2">
            {methodSteps.map((step) => (
              <li key={step.step} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 shadow-sm md:p-8">
                <span className="text-sm font-semibold text-[var(--brand)]">Step {step.step}</span>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{step.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Development systems created along the way</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Three practical answers to three different problems</h2>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Process discipline</p>
              <h3 className="mt-2 text-2xl font-semibold">PRIDE Protocol</h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
                Built in response to fast, plausible development answers that could outrun context and verification. PRIDE measures quality through proper actions rather than apparent completion.
              </p>
              <p className="mt-4 font-mono text-sm font-semibold text-[var(--text)]">PRIDE = Proper Actions ÷ Total Actions</p>
            </article>
            <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Context transfer</p>
              <h3 className="mt-2 text-2xl font-semibold">Snapshot</h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
                Designed to take a language model from zero prior knowledge of a software project toward comprehensive working context by capturing repository state, structure, routes, tests, configuration, and related evidence.
              </p>
            </article>
            <article className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Persistent architecture</p>
              <h3 className="mt-2 text-2xl font-semibold">Architectural Graph</h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
                Used in Ajenda to persist architectural relationships and drive impact analysis, invariants, proof selection, completeness auditing, architecture decisions, and selective function-level diagnosis.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">PRIDE workflow</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Proper action is part of the solution</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              Reading completely, understanding the system, testing behavior, and verifying evidence are not overhead. They are part of producing a trustworthy result.
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {prideSteps.map((step, index) => (
              <li key={step} className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-semibold text-white">{index + 1}</span>
                <span className="font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--navy-950)] py-12 text-white">
        <div className="container-site">
          <p className="max-w-4xl text-2xl font-semibold leading-relaxed">
            PRIDE addresses how the AI works. Snapshot addresses what project context it knows. The graph addresses how the developer and AI reason across the system.
          </p>
        </div>
      </section>
    </>
  )
}
