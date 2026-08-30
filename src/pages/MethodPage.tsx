import { Link } from 'react-router-dom'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

const prideSteps = [
  {
    step: '01',
    title: 'Read completely',
    description: 'Inspect the relevant code, configuration, contracts, tests, runtime behavior, and surrounding architecture before selecting a solution.',
  },
  {
    step: '02',
    title: 'Understand fully',
    description: 'Determine what owns the behavior, why the current system behaves as it does, which assumptions are supported, and which information remains unresolved.',
  },
  {
    step: '03',
    title: 'Plan properly',
    description: 'Define the required change, affected dependencies, invariants, failure paths, tests, and downstream consequences.',
  },
  {
    step: '04',
    title: 'Execute systematically',
    description: 'Implement the complete repair or capability at the correct ownership boundary rather than distributing patches around the visible symptom.',
  },
  {
    step: '05',
    title: 'Test thoroughly',
    description: 'Verify direct behavior, regression surface, edge cases, integration boundaries, and relevant system invariants.',
  },
  {
    step: '06',
    title: 'Document clearly',
    description: 'Record the resulting behavior, architectural decisions, evidence, unresolved constraints, and any material change in system understanding.',
  },
  {
    step: '07',
    title: 'Review honestly',
    description: 'Evaluate whether the implementation solved the actual problem and whether the reasoning process met the required development standard.',
  },
] as const

const properActions = [
  'Read all relevant files, traces, contracts, and configuration before modifying behavior.',
  'Search all relevant instances instead of assuming the visible failure is isolated.',
  'Investigate missing information rather than filling uncertainty with a plausible guess.',
  'Reason across dependencies, state, authority, failure paths, invariants, and downstream effects.',
  'Implement the complete solution at the component that owns the behavior.',
  'Test direct behavior, regression surface, integration boundaries, edge cases, and failure paths.',
  'Document the resulting behavior and review whether the actual problem was solved.',
] as const

export function MethodPage() {
  return (
    <>
      <Seo
        title="Method"
        description="1DevTeam's development method for AI-assisted software engineering: establish sufficient context, identify architectural ownership, implement at the correct layer, and verify the affected system."
        path="/method"
      />
      <PageHero
        eyebrow="Development Method"
        title="Understand completely enough to change the correct part of the system."
        description="1DevTeam's development method is designed around a simple constraint: software cannot be changed reliably when the reasoning scope is smaller than the architecture affected by the change. AI increases the amount of implementation and analysis that can be performed, but it does not eliminate the requirement for context, ownership, verification, and proof."
      >
        <Button asChild><Link to="/contact">Apply this to a project</Link></Button>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">PRIDE development cycle</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">A stable sequence for changing complex software</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The seven stages define the operating sequence. They keep implementation attached to sufficient reading, explicit reasoning, proof, and review rather than treating code generation as completion.
            </p>
          </div>

          <ol className="max-w-4xl">
            {prideSteps.map((step) => (
              <li key={step.step} className="grid gap-3 border-t border-[var(--border)] py-6 md:grid-cols-[0.12fr_0.3fr_0.58fr]">
                <span className="font-mono text-sm font-semibold text-[var(--brand)]">{step.step}</span>
                <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="text-base leading-relaxed text-[var(--text-muted)]">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">PRIDE Protocol</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Proper actions as the quality unit</h2>
            <p className="mt-4 font-mono text-sm font-semibold text-[var(--text)]">PRIDE = Proper Actions ÷ Total Actions</p>
            <p className="mt-2 text-sm font-medium text-[var(--text-subtle)]">Working target: 95% or greater proper actions</p>
          </div>

          <div className="max-w-4xl">
            <p className="text-[17px] leading-relaxed text-[var(--text-muted)]">
              PRIDE measures the development process by whether the actions required for reliable engineering were actually taken. The metric does not treat fast output, confidence, or apparent completion as substitutes for the work needed to establish system understanding and proof.
            </p>
            <ul className="mt-6">
              {properActions.map((action) => (
                <li key={action} className="border-t border-[var(--border)] py-4 text-base leading-relaxed text-[var(--text-muted)]">{action}</li>
              ))}
            </ul>
            <p className="mt-6 text-[17px] leading-relaxed text-[var(--text-muted)]">
              When the process falls below the standard, recovery is explicit: <strong className="text-[var(--text)]">Acknowledge → identify the missed proper action → redo the work correctly → incorporate the result into the next cycle.</strong>
            </p>
            <a href="/#pride-protocol" className="mt-5 inline-block text-sm font-semibold text-[var(--brand)] hover:underline">View the preserved PRIDE working artifact →</a>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Supporting systems</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Process, context, and architecture remain separate responsibilities</h2>
          </div>

          <div className="max-w-4xl">
            <article className="border-t-2 border-[var(--text)] py-7">
              <h3 className="text-2xl font-semibold tracking-tight">Snapshot supplies project context</h3>
              <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">
                Snapshot transfers structured repository and project state into model working context. It reduces repeated reconstruction, but it does not replace direct repository inspection or determine the architecture surrounding a change.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                <a href="/#snapshot" className="text-[var(--brand)] hover:underline">Inspect the Snapshot artifact →</a>
                <Link to="/wiki#snapshot" className="text-[var(--brand)] hover:underline">Reference definition →</Link>
              </div>
            </article>

            <article className="border-t border-[var(--border)] py-7">
              <h3 className="text-2xl font-semibold tracking-tight">The Architectural Graph supplies persistent structure</h3>
              <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">
                The Ajenda Architectural Graph represents mapped software entities and relationships used for dependency reasoning, decision ownership, change impact, proof selection, completeness auditing, and selected function-level diagnosis. It is an active development and CI capability, not customer-facing Ajenda runtime functionality.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                <a href="/#architecture-graph" className="text-[var(--brand)] hover:underline">Inspect the interactive graph →</a>
                <Link to="/wiki#architectural-graph" className="text-[var(--brand)] hover:underline">Reference definition →</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--navy-950)] py-12 text-white">
        <div className="container-site">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Relationship between the three systems</p>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <p className="text-lg font-semibold leading-relaxed">PRIDE defines how the work should be performed.</p>
            <p className="text-lg font-semibold leading-relaxed">Snapshot increases the project context available to the model.</p>
            <p className="text-lg font-semibold leading-relaxed">The Architectural Graph externalizes system structure for architecture-aware reasoning and proof.</p>
          </div>
          <p className="mt-6 max-w-4xl text-base leading-relaxed text-slate-300">
            Each addresses a different source of error in AI-assisted software development. None substitutes for the others, and none is treated as a complete solution to software-development quality on its own.
          </p>
        </div>
      </section>
    </>
  )
}
