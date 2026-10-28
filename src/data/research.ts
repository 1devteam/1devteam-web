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
    name: 'G.R.A.F.T.+',
    scope: 'Existing systems',
    status: 'Applied R&D output · in development',
    description:
      'G.R.A.F.T.+ reconstructs a public GitHub repository at one SHA into evidence-linked facts and one downloadable pack so an external language model can reason over inventory, contracts, dependencies, routes, wiring, and intent. Residuals stay visible. It is a fact substrate, not a planner and not merge authority.',
    operatingModel:
      'Public repository → reconstruct one SHA → download the fact pack → give the receipt and ASCII topology to an AI → let the AI calculate reach, proof, risk, and architecture.',
  },
  {
    name: 'G.R.A.F.T.1st',
    scope: 'Project-origin architecture',
    status: 'Applied R&D output · in development',
    description:
      'G.R.A.F.T.1st is intended to model the architecture of a software system before implementation begins. The objective is to represent contracts, nodes, models, ownership, dependencies, state, boundaries, and system interactions in a form that can be reasoned over before the first implementation decisions are committed to code. Its relationship to implementation quality remains a research and development question rather than an established conclusion. This lab is G.R.A.F.T.+ only.',
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
      'The architecture graph and associated CI capabilities were introduced and expanded. The graph increasingly exposed source-backed structure, while blast radius, proof strategy, risk, and architectural judgment remained separate reasoning steps.',
  },
  {
    name: 'Graph-Assisted Development',
    description:
      'Persistent graph state and increasingly fine-grained responsibility identity became available during active development. The receiving AI used that observed state to calculate impact, choose proof, and make architectural decisions.',
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
      'Before the graph existed, system structure had to be reconstructed repeatedly from code, tests, traces, and prior context. Graph-assisted work can expose persistent machine-readable identities and relationships; the receiving AI derives blast radius, proof obligations, risk, and architectural judgment from that observed reality.',
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

export const futureResearch = {
  title: 'Entangled Software: Perceiving Emergent Behavior Before It Happens',
  status: 'Future R&D · collaborators and research support welcome',
  description:
    '1DevTeam is developing a research direction for understanding how interactions among software components produce unexpected system-wide behavior. The proposed approach combines architecture mapping, continuous multiscale information-flow observation, and controlled experiments to detect how small changes propagate through a system.',
  aim:
    'Starting with fully characterized baseline systems, the study will introduce individual mechanisms against matched controls, repeat experiments, and investigate whether recurring mathematical relationships can predict interactions not yet observed. The goal is to develop evidence-based foresight into architectural change, emergent capabilities, and system-level risk.',
  collaboration:
    'We welcome conversations with research collaborators, systems engineers, academic partners, and organizations interested in supporting exploratory work through funding, compute resources, experimental infrastructure, or joint studies.',
  researchUrl:
    'https://github.com/1devteam/rd-program/blob/main/studies/emergent-interaction-foresight/research-foundation-2026-10-15.md',
} as const

export const substrateResearch = {
  title: 'Machine-Native Substrate',
  status: 'Experimental reference kernel · bounded correction search merged · independent research ongoing',
  description:
    'Substrate investigates a persistent computational workspace designed for AI to represent, operate, simulate, verify, and evolve complex systems. Software engineering is an initial application, not the boundary of the research.',
  evidence:
    'Merged work includes machine-facing typed Worlds, durable state and replay, counterfactual trials, separate acceptance interfaces, and bounded deterministic correction search (PR #58). Multi-step correction (PR #59) remains draft. Independent model efficiency comparisons, production isolation, and a complete cognitive runtime have not been demonstrated. Repository access may require permission.',
  architectureUrl: 'https://github.com/1devteam/machine-native-substrate',
  researchUrl: 'https://github.com/1devteam/rd-program/tree/main/studies/machine-native-substrate',
} as const

// Dated cross-project portfolio status. Engineering sources govern capability
// claims; rd-program governs independent study results (and is private).
export const researchPortfolio = [
  {
    name: 'Ajenda AI',
    scope: 'Governed execution and business intelligence',
    status: 'Merged, bounded engineering capabilities · not production-certified',
    description:
      'The intelligence spine now includes tenant-scoped measurements, continuing needs, canonical runtime evidence, reviewed response lineage, and observational impact recurrence. The public-research rebuild remains a draft; provider and commercial outcomes are not assumed.',
    evidenceLabel: 'Merged intelligence-spine evidence',
    evidenceUrl: 'https://github.com/1devteam/ajenda-ai/pull/631',
    accessNote: 'Open-source engineering record; separate unfinished work remains in PR #636.',
  },
  {
    name: 'G.R.A.F.T.+',
    scope: 'Machine-native architecture observation',
    status: 'Canonical schema 1.14 · reviewed browser implementation',
    description:
      'The canonical engine reconstructs source-anchored declarations, participating callable topology, routes, dependencies, security boundaries and runtime contracts. The website runs a separately reviewed embedded browser port. The receiving AI makes design and risk judgments.',
    evidenceLabel: 'Canonical schema 1.14',
    evidenceUrl: 'https://github.com/1devteam/graft_plus/pull/25',
    accessNote: 'The observer does not plan, grant execution authority or approve merges.',
  },
  {
    name: 'Machine-Native Substrate',
    scope: 'AI-native computational environment',
    status: 'Experimental kernel · bounded correction search merged',
    description:
      'Typed Worlds can be constructed, executed, replayed, compared and tested in disposable trials. A bounded deterministic structural correction search is merged; multi-step repair is proposed. The general AI-native workspace and independent cost advantages remain research objectives.',
    evidenceLabel: 'Engineering source (restricted access)',
    evidenceUrl: 'https://github.com/1devteam/machine-native-substrate/pull/58',
    accessNote: 'Private repository; access requires permission. No independent blinded model benchmark has been completed.',
  },
] as const

export const researchPortfolioIntro =
  'Research connects three distinct systems: Ajenda AI as a governed execution environment, G.R.A.F.T.+ as an observational fact instrument, and Substrate as an experimental AI-native computational workspace. Each maintains separate implementation authority and evidence limits.'
