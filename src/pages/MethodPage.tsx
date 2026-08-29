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
        description="1DevTeam's development method is designed around a simple constraint: software cannot be changed reliably when the reasoning scope is smaller than the architecture affected by the change. AI increases the amount of implementation and analysis that can be performed, but it does not eliminate the requirement for context, architectural ownership, verification, and proof."
      >
        <Button asChild><Link to="/contact">Apply this to a project</Link></Button>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Development cycle</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">A stable process for changing complex software</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              The seven stages are not presentation labels. They describe the sequence used to keep implementation attached to sufficient reading, architectural ownership, proof, and review.
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
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Proper actions as a development standard</h2>
            <p className="mt-4 font-mono text-sm font-semibold text-[var(--text)]">PRIDE = Proper Actions ÷ Total Actions</p>
            <p className="mt-2 text-sm font-medium text-[var(--text-subtle)]">Target: 95% or greater proper actions</p>
          </div>

          <div className="max-w-4xl space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>
              PRIDE formalizes the development requirements above as a measurable discipline. The protocol was developed after repeated AI-assisted development sessions showed a recurring process failure: a model could generate a plausible implementation before reading enough of the system to establish whether that implementation belonged at the correct architectural layer.
            </p>
            <p>
              The protocol changes the optimization target from rapid apparent completion to correct engineering process. Proper actions include complete reading, full error and trace inspection, searching all relevant instances, implementing complete solutions rather than patches, following established practices, investigating instead of assuming, and considering system-wide dependencies and downstream effects.
            </p>
            <p>
              When the process falls below the standard, the recovery sequence is explicit: <strong className="text-[var(--text)]">Acknowledge → identify the missed proper action → redo the work correctly → incorporate the result into the next cycle.</strong>
            </p>
            <a href="/#pride-protocol" className="inline-block text-sm font-semibold text-[var(--brand)] hover:underline">View the preserved PRIDE working artifact →</a>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)]">
        <div className="container-site max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Context transfer</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">PRIDE improved the process. Snapshot addressed what the model knew.</h2>
          <div className="mt-6 max-w-4xl space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>
              Large software repositories present a separate problem from development discipline: transferring enough project state into a new model context to support accurate work without repeatedly reconstructing the repository from zero.
            </p>
            <p>
              Snapshot addresses that problem by producing a structured representation of project state. Depending on the project, that representation can include Git state, file inventory, hashes, routes, imports and dependencies, tests, parse results, environment and configuration structure, documentation summaries, CI/CD information, and related repository context.
            </p>
            <p>
              Snapshot does not replace repository inspection or architectural reasoning. It reduces the amount of project state that must be rediscovered before those activities can begin.
            </p>
            <a href="/#snapshot" className="inline-block text-sm font-semibold text-[var(--brand)] hover:underline">Inspect the Snapshot execution and public-safe JSON excerpt →</a>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-site max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Persistent architecture</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Snapshot increased project context. The graph externalized architectural structure.</h2>
          <div className="mt-6 max-w-4xl space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>
              Project context and architectural meaning are not equivalent. A model can know that files, routes, tests, imports, and configuration exist while still having to reconstruct which component owns a decision, which invariant governs a change, what depends on that change, and what proof is required outside the immediate file.
            </p>
            <p>
              The Ajenda Architectural Graph addresses that layer by representing software entities and relationships such as modules, selected functions, file ownership, call relationships, tests, architecture roles, semantic boundaries, and selected invariants in persistent machine-readable form.
            </p>
            <p>
              Its current development workflow supports dependency analysis, change-impact analysis, blast-radius identification, graph-selected proof, selective CI reasoning, completeness auditing, architecture decision composition, and selected function-level diagnosis. The graph is an active Ajenda development and CI capability. It is not represented as customer-facing runtime functionality.
            </p>
            <a href="/#architecture-graph" className="inline-block text-sm font-semibold text-[var(--brand)] hover:underline">Inspect the canonical interactive Architectural Graph →</a>
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
