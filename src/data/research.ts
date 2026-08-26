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
      "An existing-project system-mapping and audit tool intended to reconstruct a software system's architecture, contracts, invariants, dependencies, authority relationships, state/data paths, and boundaries into a machine-reasonable representation for system-wide reasoning by an external LLM.",
  },
  {
    name: 'Grafted First',
    scope: 'Project origin',
    status: 'R&D / in development',
    description:
      'A project-origin architecture and reasoning tool intended to model the parameters, components, contracts, invariants, dependencies, constraints, state/data relationships, and interacting variables of an intended system before substantial implementation, so an external LLM can reason across the whole design and guide implementation.',
  },
] as const
