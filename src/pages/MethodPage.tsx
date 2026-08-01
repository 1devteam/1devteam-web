import { Link } from 'react-router-dom'
import { methodSteps } from '@/data/site'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

const principles = [
  {
    title: 'Clarity over theater',
    body: 'We say what gets built, how it is governed, who it is for, and what outcomes it can support. Vague “AI transformation” language is a smell.',
  },
  {
    title: 'Govern before you scale',
    body: 'Human oversight, evaluation, tool boundaries, and failure modes are design requirements — not post-launch paperwork.',
  },
  {
    title: 'Evidence in public',
    body: 'Build journals, architecture notes, and product updates create trust faster than polished claims without inspectable detail.',
  },
  {
    title: 'Dual-path buyers',
    body: 'Self-serve research for people who want to learn first. Clear contact paths for people ready to engage. Both are first-class.',
  },
]

export function MethodPage() {
  return (
    <>
      <Seo
        title="Method"
        description="How 1devteam designs, builds, and governs AI systems: outcome framing, system design, evidence-based delivery, and operational controls."
        path="/method"
      />
      <PageHero
        eyebrow="Method"
        title="How we work with AI"
        description="A disciplined builder’s workflow: frame the outcome, design the system, build with evidence, then operate under governance. This is the hard-earned process without cluttering the homepage."
      >
        <Button asChild>
          <Link to="/contact">Apply this to a project</Link>
        </Button>
      </PageHero>

      <section className="section-pad">
        <div className="container-site">
          <ol className="grid gap-6 md:grid-cols-2">
            {methodSteps.map((step) => (
              <li
                key={step.step}
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 shadow-sm md:p-8"
              >
                <span className="text-sm font-semibold text-[var(--brand)]">
                  Step {step.step}
                </span>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  {step.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] section-pad">
        <div className="container-site">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">
            Operating principles
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {principles.map((p) => (
              <div
                key={p.title}
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6"
              >
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-muted)]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
