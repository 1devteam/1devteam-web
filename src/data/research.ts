export const researchProgram = {
  shortTitle: '1DevTeam Architectural Scope & PR Cascade Study',
  formalTitle:
    'Architectural Reasoning Scope and Corrective PR Cascades in AI-Assisted Software Development: A Longitudinal and Prospective Study of Ajenda AI',
  primaryQuestion:
    'Does mismatch between the reasoning or change scope applied to a software modification and the actual architectural blast radius of that modification predict subsequent corrective pull-request cascades?',
  summary:
    "1DevTeam's first formal R&D program studies architectural reasoning scope and corrective PR cascades in AI-assisted software development. The study examines whether mismatches between the scope applied to a software change and its actual architectural blast radius predict subsequent corrective work.",
} as const

export const rdTools = [
  {
    name: 'Grafted Plus',
    scope: 'Existing systems',
    status: 'Applied R&D output · in development',
    description:
      "Grafted Plus is intended to reconstruct and expose the architecture of an existing software system so an external language model can reason over system structure, ownership, dependencies, invariants, and change impact with less repeated architectural reconstruction. Its capabilities and comparative value remain subjects of active development and research.",
    operatingModel:
      'Existing system → reconstruct architectural state → expose ownership, dependencies, invariants, blast radius, and proof relationships → reason across the system.',
  },
  {
    name: 'Grafted First',
    scope: 'Project-origin architecture',
    status: 'Applied R&D output · in development',
    description:
      'Grafted First is intended to model the architecture of a software system before implementation begins. The objective is to represent contracts, nodes, models, ownership, dependencies, state, boundaries, and system interactions in a form that can be reasoned over before the first implementation decisions are committed to code. Its relationship to implementation quality remains a research and development question rather than an established conclusion.',
    operatingModel:
      'Intended system → explicitly model the architectural problem → reason across the complete design → build against that model.',
  },
] as const

export const researchPolicy = [
  {
    title: 'Scientific conclusions remain independent',
    description:
      'The study is an empirical investigation, not a product-validation exercise. Positive, negative, null, and contradictory results remain valid research outcomes, and product objectives do not determine scientific conclusions.',
  },
  {
    title: 'Preserve the graph intervention boundary',
    description:
      'The pre-graph period is coded as graph absent. Graph construction and graph-assisted development are separate epochs so the intervention is not retroactively projected onto earlier work.',
  },
  {
    title: 'Triangulate material findings',
    description:
      'Material findings are evaluated across chronology, PR context, human directives, assistant-generated operational prompts, repository architecture, changed-file scope, CI and proof behavior, corrective relationships, graph state, and relevant confounders.',
  },
  {
    title: 'Separate instruction origin',
    description:
      'Human directives and assistant-generated operational prompts are treated as distinct sources when evaluating whether workflow changes came from instruction differences or from a different reasoning environment.',
  },
  {
    title: 'Control competing explanations',
    description:
      'CI maturity, model and tooling changes, codebase maturity, test coverage, repair-unit type, PR size, and defect class are treated as competing explanations rather than being silently attributed to graph assistance.',
  },
] as const

export const researchEpochs = [
  {
    name: 'Pre-Graph',
    description:
      'The architectural graph did not yet exist. Development relied on repository inspection, testing, traces, PR review, manual architectural reconstruction, and the existing PRIDE development discipline.',
  },
  {
    name: 'Graph Construction',
    description:
      'The architecture graph and associated CI capabilities were introduced and expanded, including semantic overlays, blast-radius analysis, invariant mapping, proof selection, and governance controls.',
  },
  {
    name: 'Graph-Assisted Development',
    description:
      'Graph-derived architectural state, impact analysis, proof selection, completeness checks, and increasingly fine-grained decision ownership became available during active development.',
  },
] as const

export const researchMeasures = [
  'Reasoning scope and change scope applied to the repair.',
  'Architectural blast radius, including changed files, runtime surfaces, dependencies, invariants, and affected proof.',
  'Corrective PR propagation and whether later work repairs an introduced defect, exposes a latent defect, or extends an incomplete repair.',
  'Repair-unit type and the ownership layer at which the change is applied.',
  'Local proof versus system-level proof and the residual state intentionally left unresolved.',
  'Graph state and expected versus observed graph-state movement after repair.',
  'Test coverage, CI maturity, codebase maturity, model and tool capability, PR size, defect class, and related confounders.',
  'Where failures are detected: later corrective work, pre-merge proof, graph governance, or semantic enforcement.',
] as const

export const researchNotes = [
  {
    status: 'Preliminary qualitative note',
    title: 'Human directive style does not appear to explain the whole shift',
    description:
      'Terse, verification-oriented human directives appear in both graph-absent and graph-assisted cases. The full prompt corpus is not yet quantitatively coded, so this remains a covariate under measurement rather than a frozen finding.',
  },
  {
    status: 'Observed workflow difference',
    title: 'Persistent architectural state changes the reasoning substrate',
    description:
      'Before the graph existed, system structure had to be reconstructed repeatedly from code, tests, traces, and prior context. Graph-assisted work can expose nodes, edges, authority relationships, blast radius, invariants, and proof obligations as persistent machine-readable state.',
  },
  {
    status: 'Observed measurement capability',
    title: 'Repairs can be evaluated against residual system state',
    description:
      'A green test suite is not the only available finish signal. A targeted repair can also be compared with expected graph-state movement, preservation of unrelated residual findings, and post-merge recertification.',
  },
  {
    status: 'Exploratory hypothesis',
    title: 'Graph assistance may move some failures earlier',
    description:
      'One hypothesis under investigation is that graph-governed workflows may shift some failures from later corrective PRs into earlier semantic detection, proof selection, or governance review. This is distinct from claiming that graph assistance reduces failures overall.',
  },
  {
    status: 'Confounder control',
    title: 'Process discipline and CI improvement predate the graph',
    description:
      'PRIDE-style requirements for complete reasoning predate the graph, while CI and proof infrastructure also matured over time. Neither can be credited to graph assistance without separate evidence.',
  },
] as const
