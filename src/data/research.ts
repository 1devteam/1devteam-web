export const researchProgram = {
  shortTitle: '1DevTeam Architectural Scope & PR Cascade Study',
  formalTitle:
    'Architectural Reasoning Scope and Corrective PR Cascades in AI-Assisted Software Development: A Longitudinal and Prospective Study of Ajenda AI',
  primaryQuestion:
    'Does mismatch between the reasoning/change scope of a software PR and its actual architectural blast radius predict subsequent corrective PR cascades?',
  summary:
    "1DevTeam's first formal R&D program studies architectural reasoning scope, corrective PR cascades, graph-assisted development, repair-unit abstraction, blast-radius coverage, and related evidence. The research is intended to empirically ground and refine Grafted Plus and Grafted First without assuming that either approach is superior in advance.",
} as const

export const rdTools = [
  {
    name: 'Grafted Plus',
    scope: 'Existing systems',
    status: 'R&D / in development',
    description:
      "An existing-project system-mapping and audit tool intended to reconstruct a software system's architecture, contracts, invariants, dependencies, authority and ownership relationships, state and data paths, runtime boundaries, and other materially relevant structure into a machine-reasonable representation. An external LLM can then reason across that persistent system model instead of repeatedly reconstructing architecture from isolated files and local context.",
    operatingModel:
      'Existing system → extract and map architectural truth → expose system structure, blast radius, invariants, and proof obligations → reason across the system.',
  },
  {
    name: 'Grafted First',
    scope: 'Project origin',
    status: 'R&D / in development',
    description:
      'A project-origin architecture and reasoning tool intended to model the complete intended system before substantial implementation: parameters, components, models, contracts, invariants, dependencies, constraints, state and data relationships, boundaries, and interacting variables. An external LLM can reason over that explicit design, test scenarios against it, and guide implementation against the model rather than beginning from disconnected code decisions.',
    operatingModel:
      'Intended system → explicitly model the architectural problem → reason across the complete design → build against that model.',
  },
] as const

export const researchPolicy = [
  {
    title: 'Evidence over promotion',
    description:
      'The study is not allowed to become product marketing. Null, negative, contradictory, and inconvenient results remain valid outcomes, and product goals cannot redefine the evidence after the fact.',
  },
  {
    title: 'Keep the graph boundary exact',
    description:
      'The historical pre-graph period is coded as graph absent, not as an immature or implicit graph. Graph construction and graph-assisted production work are separate epochs so the intervention is not retroactively invented.',
  },
  {
    title: 'Triangulate material findings',
    description:
      'A substantive finding cannot rest on one convenient slice of evidence. Relevant cases are checked across chronology and PR context, human directives, assistant-generated operational prompts, repository architecture, changed-file scope, CI and proof behavior, corrective relationships, graph state, and confounders.',
  },
  {
    title: 'Separate who supplied the instruction',
    description:
      'Short human directives are not treated as equivalent to the longer operational prompts that an assistant may generate for downstream tools. Prompt-origin separation matters when testing whether workflow changes came from better instructions or from a different reasoning environment.',
  },
  {
    title: 'Control competing explanations',
    description:
      'CI maturity, model and tooling changes, codebase maturity, test coverage, repair-unit type, PR size, and defect class are treated as competing explanations rather than silently credited to graph assistance.',
  },
] as const

export const researchEpochs = [
  {
    name: 'Graph absent',
    description:
      'Architecture had to be reconstructed from source, tests, runtime traces, PR history, and review context. No persistent architecture graph existed.',
  },
  {
    name: 'Graph construction',
    description:
      'The architecture graph, semantic overlay, blast-radius analysis, invariant mapping, proof selection, and governance controls were being built and calibrated.',
  },
  {
    name: 'Graph assisted',
    description:
      'Production repair work can materially use persistent architectural state, graph-derived impact analysis, invariant checks, proof selection, and post-repair graph-state comparison.',
  },
] as const

export const researchMeasures = [
  'Repair-unit type: local symptom, component contract, cross-boundary contract, shared invariant, or system-wide invariant.',
  'Predicted architectural blast radius and whether changed files, tests, runtime surfaces, and invariants cover it.',
  'Local proof versus systemic proof, including what remains intentionally unresolved after a repair.',
  'Expected graph-state movement versus observed post-repair and post-merge state.',
  'Downstream corrective PR behavior, including introduced defects versus previously latent defects that a change merely exposed.',
  'Prompting regime and instruction origin, alongside CI maturity, model/tool changes, codebase maturity, and defect class.',
  'Where failures are detected: production/corrective work, pre-merge proof, graph governance, or semantic enforcement.',
] as const

export const researchNotes = [
  {
    status: 'Preliminary qualitative note',
    title: 'Human directive style does not appear to explain the whole shift',
    description:
      'Terse, verification-oriented human directives appear in both graph-absent and graph-assisted cases. The full prompt corpus is not yet quantitatively coded, so this is not a frozen finding; it is a covariate being measured independently.',
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
      'A green test suite is no longer the only available finish signal. A targeted repair can also be compared with an expected graph-state transition, preservation of unrelated residual findings, and post-merge recertification.',
  },
  {
    status: 'Exploratory hypothesis',
    title: 'Graph assistance may move some failures earlier',
    description:
      'One hypothesis under investigation is that graph-governed workflows may shift some failures from later corrective PRs into earlier semantic detection, proof selection, or governance review. That is different from simply claiming that the graph reduces failures.',
  },
  {
    status: 'Confounder control',
    title: 'Thoroughness and CI improvements did not begin with the graph',
    description:
      'The Pride-style requirement for complete reasoning predates the graph, while CI and proof infrastructure also matured over time. Neither can be credited to graph assistance without separate evidence.',
  },
] as const
