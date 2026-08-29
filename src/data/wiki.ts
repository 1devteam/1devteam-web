export type WikiCategory = 'Systems' | 'Architecture' | 'Research' | 'Glossary'

export type WikiEntry = {
  id: string
  title: string
  category: WikiCategory
  summary: string
  detail: string
  related: readonly string[]
  status?: string
}

export const wikiCategories: readonly WikiCategory[] = ['Systems', 'Architecture', 'Research', 'Glossary']

export const wikiEntries: readonly WikiEntry[] = [
  {
    id: 'pride-protocol',
    title: 'PRIDE Protocol',
    category: 'Systems',
    summary: 'A development-process discipline for reliable AI-assisted engineering.',
    detail:
      'PRIDE defines the actions required for complete reading, sufficient context, system-level reasoning, correct implementation scope, testing, verification, documentation, and review. Its working metric is PRIDE = Proper Actions ÷ Total Actions, with a target of 95% or greater proper actions.',
    related: ['Snapshot', 'Ajenda Architectural Graph', 'Whole-system reasoning'],
    status: 'Used in practice',
  },
  {
    id: 'snapshot',
    title: 'Snapshot',
    category: 'Systems',
    summary: 'A project-context transfer system used during Ajenda development.',
    detail:
      'Snapshot packages structured project state so a language model can begin work with substantially more repository context already available. Captured state can include Git status, file inventory and hashes, routes, dependencies and imports, tests, parse results, environment and configuration structure, and related project evidence. Snapshot reduces repeated project reconstruction; it does not replace repository inspection or architecture reasoning.',
    related: ['PRIDE Protocol', 'Ajenda Architectural Graph', 'Project context'],
    status: 'Snapshot v10 used in practice',
  },
  {
    id: 'architectural-graph',
    title: 'Ajenda Architectural Graph',
    category: 'Systems',
    summary: 'A persistent machine-readable model of Ajenda architecture and change relationships.',
    detail:
      'The graph represents software entities and relationships including modules, selected functions, decision ownership, dependencies, tests, invariants, architecture roles, and selected semantic boundaries. It is used in Ajenda development and CI for impact analysis, proof selection, completeness auditing, architecture decisions, semantic checks, and selected function-level diagnosis. It is development infrastructure, not customer-facing Ajenda runtime functionality.',
    related: ['Architectural blast radius', 'Decision ownership', 'Proof selection', 'Graph completeness'],
    status: 'Active development and CI capability',
  },
  {
    id: 'ajenda-ai',
    title: 'Ajenda AI',
    category: 'Systems',
    summary: 'Structured execution software for missions, plans, tasks, approvals, and controlled actions.',
    detail:
      'Ajenda converts objectives into durable mission state and controlled execution. Its architecture separates interpretation, planning, authority, capability selection, review, execution, recovery, and outcome recording so understanding an instruction does not silently grant permission to act.',
    related: ['Mission', 'Authority boundary', 'Controlled execution', 'Execution evidence'],
    status: 'Private development · locally operational',
  },
  {
    id: 'grafted-plus',
    title: 'Grafted Plus',
    category: 'Systems',
    summary: 'An R&D system concept for reconstructing and exposing the architecture of existing software.',
    detail:
      'Grafted Plus is intended to extract and map architectural truth from an existing system into a machine-reasonable representation so an external language model can reason across ownership, dependencies, invariants, state, data paths, runtime boundaries, blast radius, and proof obligations without repeatedly rebuilding the architecture from isolated files.',
    related: ['Grafted First', 'Reconstructed architecture', 'Architecture drift'],
    status: 'R&D / in development',
  },
  {
    id: 'grafted-first',
    title: 'Grafted First',
    category: 'Systems',
    summary: 'An R&D system concept for modeling intended architecture before substantial implementation begins.',
    detail:
      'Grafted First is intended to represent the complete intended system—components, models, contracts, invariants, dependencies, constraints, state, data relationships, boundaries, and interacting variables—before implementation. An external language model can then reason over the explicit design and guide implementation against it. Comparative effectiveness remains a research question.',
    related: ['Grafted Plus', 'Intended architecture', 'Architecture drift'],
    status: 'R&D / in development',
  },
  {
    id: 'architectural-blast-radius',
    title: 'Architectural blast radius',
    category: 'Architecture',
    summary: 'The set of system surfaces that can be materially affected by a software change.',
    detail:
      'Architectural blast radius can include components, contracts, invariants, runtime surfaces, tests, state relationships, authority boundaries, data paths, integrations, and downstream behavior. It is broader than the set of files directly modified by a change. The study compares reasoning and change scope with this broader affected surface.',
    related: ['Change scope', 'Reasoning scope', 'Impact analysis', 'Corrective PR cascade'],
  },
  {
    id: 'decision-ownership',
    title: 'Decision ownership',
    category: 'Architecture',
    summary: 'Identification of the component or function that actually owns a behavioral decision.',
    detail:
      'Decision ownership is used to distinguish the architectural owner of behavior from files that merely observe, call, wrap, or compensate for it. In graph-assisted Ajenda work, selected function nodes can carry decision-role metadata so repair analysis can move from a visible symptom toward the function or contract that owns the decision.',
    related: ['Repair unit', 'python_function node', 'calls_function', 'Architectural blast radius'],
  },
  {
    id: 'invariant',
    title: 'Invariant',
    category: 'Architecture',
    summary: 'A condition that must remain true across relevant system states or operations.',
    detail:
      'Invariants can govern state ownership, authority, data access, concurrency, execution ordering, recovery, or other architectural behavior. A locally passing change remains incomplete if it violates a relevant invariant elsewhere in the affected system.',
    related: ['Proof selection', 'Whole-system reasoning', 'Repair unit'],
  },
  {
    id: 'impact-analysis',
    title: 'Impact analysis',
    category: 'Architecture',
    summary: 'Graph-assisted determination of nodes, tests, and system surfaces affected by a proposed change.',
    detail:
      'Ajenda graph tooling can start from changed or selected nodes and traverse machine-readable relationships to identify affected architecture and candidate proof obligations. Impact analysis is used as evidence for change scope; it does not by itself prove that every affected runtime behavior has been validated.',
    related: ['Architectural blast radius', 'Proof selection', 'Selective CI'],
  },
  {
    id: 'proof-selection',
    title: 'Proof selection',
    category: 'Architecture',
    summary: 'Selection of tests and checks required to support a specific architecture change.',
    detail:
      'Graph-aware proof selection uses architecture state and impact information to determine which tests, invariants, semantic checks, or other verification surfaces should run for a change. It extends beyond the immediate test closest to the edited file.',
    related: ['Impact analysis', 'Selective CI', 'Graph completeness'],
  },
  {
    id: 'selective-ci',
    title: 'Selective CI',
    category: 'Architecture',
    summary: 'Execution of a targeted proof set selected from change and architecture information.',
    detail:
      'Ajenda uses graph-aware proof information to support selective-CI reasoning and shadow execution. The purpose is to reduce irrelevant proof while preserving evidence required by the affected architecture. Selectivity is constrained by graph completeness and the quality of mapped relationships.',
    related: ['Proof selection', 'Graph completeness', 'Impact analysis'],
  },
  {
    id: 'graph-completeness',
    title: 'Graph completeness',
    category: 'Architecture',
    summary: 'An audit of whether required architecture entities and relationships are represented sufficiently for graph-governed reasoning.',
    detail:
      'Completeness auditing identifies missing mappings, topology gaps, and known historical findings instead of treating graph presence as proof of complete architectural coverage. A passing completeness audit can preserve acknowledged residual findings rather than hiding them.',
    related: ['Ajenda Architectural Graph', 'Proof selection', 'Impact analysis'],
  },
  {
    id: 'calls-function',
    title: 'calls_function',
    category: 'Architecture',
    summary: 'A directed graph relationship indicating that one represented function calls another.',
    detail:
      'The relationship is used for selected function-level dependency and impact reasoning. It describes a represented call relationship in the canonical graph; it should not be interpreted as a complete dynamic execution trace.',
    related: ['python_function node', 'tests_function', 'defined_in'],
  },
  {
    id: 'tests-function',
    title: 'tests_function',
    category: 'Architecture',
    summary: 'A graph relationship connecting a test to a represented function it directly exercises.',
    detail:
      'Direct function-test edges make selected proof relationships explicit in the architecture graph and can support impact analysis and targeted verification. They represent mapped direct relationships, not every possible indirect test effect.',
    related: ['calls_function', 'defined_in', 'Proof selection'],
  },
  {
    id: 'defined-in',
    title: 'defined_in',
    category: 'Architecture',
    summary: 'A graph relationship connecting a represented function to the module or file that defines it.',
    detail:
      'The relationship preserves the distinction between function-level decision nodes and their source-code container, allowing analysis to move between architectural ownership and concrete repository location.',
    related: ['python_function node', 'calls_function', 'Decision ownership'],
  },
  {
    id: 'pr-cascade',
    title: 'Corrective PR cascade',
    category: 'Research',
    summary: 'A sequence of subsequent pull requests associated with correcting, completing, or responding to prior software changes.',
    detail:
      'The study examines corrective propagation without assuming that every later PR was caused by the immediately preceding PR. Coding distinguishes introduced defects from previously latent defects that a change merely exposed and considers causal relationships, chronology, repair unit, proof behavior, and competing explanations.',
    related: ['Architectural blast radius', 'Reasoning scope', 'Repair unit'],
  },
  {
    id: 'reasoning-scope',
    title: 'Reasoning scope',
    category: 'Research',
    summary: 'The portion of the system included in the analysis used to understand and plan a software change.',
    detail:
      'Reasoning scope can be narrower or broader than the actual architecture affected by a change. The primary study asks whether mismatch between reasoning or change scope and architectural blast radius predicts subsequent corrective PR cascades.',
    related: ['Change scope', 'Architectural blast radius', 'Corrective PR cascade'],
  },
  {
    id: 'change-scope',
    title: 'Change scope',
    category: 'Research',
    summary: 'The implementation surface actually modified to produce a software change.',
    detail:
      'Change scope is evaluated against architectural blast radius rather than treated as sufficient simply because a local test passes. A change can be technically valid at one layer while remaining incomplete relative to the contracts, invariants, or downstream behavior affected by the repair.',
    related: ['Reasoning scope', 'Architectural blast radius', 'Repair unit'],
  },
  {
    id: 'repair-unit',
    title: 'Repair unit',
    category: 'Research',
    summary: 'The abstraction level at which a software defect or required correction is represented and repaired.',
    detail:
      'Study coding can distinguish local symptom, component contract, cross-boundary contract, shared invariant, and system-wide invariant repair units. A shift in repair-unit abstraction is a candidate mechanism under study, not evidence by itself that one development condition is superior.',
    related: ['Decision ownership', 'Invariant', 'Corrective PR cascade'],
  },
  {
    id: 'graph-absent',
    title: 'Graph absent',
    category: 'Research',
    summary: 'The study epoch in which the architectural graph did not exist.',
    detail:
      'Architecture had to be reconstructed from source code, tests, runtime traces, PR history, review context, and existing development discipline. This period is coded as graph absent—not as an implicit, primitive, or immature graph.',
    related: ['Graph construction', 'Graph assisted', 'Ajenda Architectural Graph'],
  },
  {
    id: 'graph-construction',
    title: 'Graph construction',
    category: 'Research',
    summary: 'The study epoch during which graph capabilities were being built and calibrated.',
    detail:
      'This period separates graph creation from later graph-assisted development so the intervention boundary remains explicit. Capabilities introduced across this period include architecture representation, semantic overlays, impact analysis, invariant mapping, proof selection, and governance controls.',
    related: ['Graph absent', 'Graph assisted', 'Ajenda Architectural Graph'],
  },
  {
    id: 'graph-assisted',
    title: 'Graph assisted',
    category: 'Research',
    summary: 'The study epoch in which active repair work can materially use persistent graph state.',
    detail:
      'Graph-assisted work can use graph-derived impact analysis, invariant checks, proof selection, architecture decisions, and post-repair graph-state comparison. The study does not assume that this condition is superior; codebase maturity, CI maturity, model and tooling changes, test coverage, PR size, repair unit, and defect class remain competing explanations.',
    related: ['Graph absent', 'Graph construction', 'Impact analysis'],
  },
  {
    id: 'candidate-finding',
    title: 'Candidate finding',
    category: 'Research',
    summary: 'A research proposition tracked before final adjudication.',
    detail:
      'A candidate finding is not a finished result. It can accumulate evidence, become provisionally supported, be contradicted, be rejected, or later be adjudicated as supported. This separation prevents preliminary observations from being presented as settled scientific conclusions.',
    related: ['Preliminary observation', 'Scientific boundary'],
  },
  {
    id: 'mission',
    title: 'Mission',
    category: 'Glossary',
    summary: 'A durable Ajenda unit that represents an objective and its structured execution state.',
    detail:
      'A mission can contain planning, tasks, authority state, approvals, execution progress, outcomes, and recovery information. Treating missions as durable state distinguishes Ajenda execution from transient conversational context.',
    related: ['Ajenda AI', 'Controlled execution', 'Execution evidence'],
  },
  {
    id: 'authority-boundary',
    title: 'Authority boundary',
    category: 'Glossary',
    summary: 'A boundary separating interpretation or planning from permission to perform an external action.',
    detail:
      'Ajenda treats understanding a request and having authority to execute it as separate concerns. Capability checks, policy, approvals, and explicit execution controls can therefore govern actions independently from language interpretation.',
    related: ['Ajenda AI', 'Controlled execution', 'Mission'],
  },
  {
    id: 'controlled-execution',
    title: 'Controlled execution',
    category: 'Glossary',
    summary: 'Execution routed through explicit capability, authority, policy, review, and failure-handling boundaries.',
    detail:
      'Controlled execution is intended to preserve the distinction between deciding what should happen and authorizing software to perform the action. The exact controls depend on the operation and system context.',
    related: ['Authority boundary', 'Execution evidence', 'Ajenda AI'],
  },
  {
    id: 'execution-evidence',
    title: 'Execution evidence',
    category: 'Glossary',
    summary: 'Recorded state and outcomes that make system actions inspectable after execution.',
    detail:
      'Execution evidence can include mission state, approvals, selected capabilities, actions, state transitions, errors, recovery behavior, and resulting outcomes. It provides an inspectable record rather than relying only on conversational claims about what occurred.',
    related: ['Controlled execution', 'Mission', 'Ajenda AI'],
  },
  {
    id: 'whole-system-reasoning',
    title: 'Whole-system reasoning',
    category: 'Glossary',
    summary: 'Analysis that includes relevant dependencies, contracts, state, authority, invariants, failure paths, and downstream effects.',
    detail:
      'Whole-system reasoning does not require inspecting every file for every change. It requires reasoning scope to cover the architecture materially affected by the change and to identify unresolved information instead of silently substituting assumptions.',
    related: ['Architectural blast radius', 'PRIDE Protocol', 'Reasoning scope'],
  },
  {
    id: 'intended-architecture',
    title: 'Intended architecture',
    category: 'Glossary',
    summary: 'An explicit model of what a software system is designed to become.',
    detail:
      'Within the Grafted First concept, intended architecture includes components, contracts, invariants, dependencies, constraints, state, data relationships, ownership, and boundaries modeled before substantial implementation.',
    related: ['Grafted First', 'Reconstructed architecture', 'Architecture drift'],
  },
  {
    id: 'reconstructed-architecture',
    title: 'Reconstructed architecture',
    category: 'Glossary',
    summary: 'A machine-reasonable representation extracted from an existing software system.',
    detail:
      'Within the Grafted Plus concept, reconstructed architecture is intended to reflect the actual system rather than the design originally intended for it. The quality of that reconstruction depends on the evidence extracted and the completeness of the mapping.',
    related: ['Grafted Plus', 'Intended architecture', 'Architecture drift'],
  },
  {
    id: 'architecture-drift',
    title: 'Architecture drift',
    category: 'Glossary',
    summary: 'Difference between intended system architecture and reconstructed actual architecture.',
    detail:
      'A future Grafted workflow may compare an intended architecture produced at project origin with an architecture reconstructed after implementation. This comparison remains a development hypothesis rather than an established research result.',
    related: ['Grafted First', 'Grafted Plus', 'Intended architecture', 'Reconstructed architecture'],
  },
]
