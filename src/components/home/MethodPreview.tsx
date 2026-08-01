import { Link } from 'react-router-dom'
import { methodSteps } from '@/data/site'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Button } from '@/components/ui/button'

export function MethodPreview() {
  return (
    <section className="section-pad border-t border-[var(--border)] bg-white">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Method"
            title="How we work with AI"
            description="Discipline over hype: frame outcomes, design systems, build with evidence, then govern what ships."
          />
          <Button asChild variant="outline" className="shrink-0 self-start md:self-auto">
            <Link to="/method" data-analytics="method-page-visit">
              Read the method
            </Link>
          </Button>
        </div>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {methodSteps.map((step) => (
            <li
              key={step.step}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]/50 p-5"
            >
              <span className="text-sm font-semibold text-[var(--brand)]">
                {step.step}
              </span>
              <h3 className="mt-2 text-base font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
