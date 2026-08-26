import { Link } from 'react-router-dom'
import { researchProgram, rdTools } from '@/data/research'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Button } from '@/components/ui/button'

export function ResearchPreview() {
  return (
    <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Research & Development"
            title="1DevTeam's first formal R&D program"
            description={researchProgram.summary}
          />
          <Button asChild variant="outline" className="shrink-0 self-start md:self-auto">
            <Link to="/research" data-analytics="research-page-visit">
              Read the R&D program
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {rdTools.map((tool) => (
            <div
              key={tool.name}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
                {tool.scope}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">{tool.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
