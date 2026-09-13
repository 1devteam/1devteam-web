import { Workbench } from '@/components/graft/workbench'
import { GraftUserGuide } from '@/components/graft/user-guide'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

export function WikiPage() {
  return (
    <>
      <Seo path="/wiki" />

      <PageHero
        eyebrow="G.R.A.F.T.+"
        title="Reconstruct existing systems into evidence-linked facts"
        description="Graph Reasoning for Architecture, Fidelity & Traceability. This page is the working G.R.A.F.T.+ prototype and its user guide: two reconstruction subjects, visible residuals, and a fact packet a planner can consume. It is not a planner and not merge authority."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href="#graft-plus">Open the prototype</a>
          </Button>
          <Button asChild variant="outline">
            <a href="#guide">Read the user guide</a>
          </Button>
        </div>
      </PageHero>

      <Workbench />

      <GraftUserGuide />

      <section className="border-t border-[var(--border)] bg-[var(--navy-950)] py-12 text-white">
        <div className="container-site max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Evidence boundary</p>
          <p className="mt-3 text-xl font-semibold leading-relaxed">
            The prototype reconstructs what exists. Implemented behavior is described as implemented. Development objectives remain objectives. Research hypotheses remain hypotheses.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            G.R.A.F.T.+ is a fact substrate, not a substitute for repository evidence, study records, or merge authorization. Schema-valid is not proof of behavioral consumption.
          </p>
        </div>
      </section>
    </>
  )
}
