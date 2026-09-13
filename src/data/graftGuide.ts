export type GuideSection = {
  id: string
  title: string
  body: readonly string[]
  steps?: readonly { label: string; detail: string }[]
  facts?: readonly { term: string; meaning: string }[]
}

export const graftGuideIntro = {
  eyebrow: 'User guide',
  title: 'What G.R.A.F.T.+ is, and how to use this prototype',
  lede:
    'G.R.A.F.T.+ reconstructs existing software into evidence-linked facts. This page is the working prototype and the public description of that system. It is not a planner, and it is not merge authority.',
} as const

export const graftGuideSections: readonly GuideSection[] = [
  {
    id: 'what-it-is',
    title: 'What it is',
    body: [
      'G.R.A.F.T.+ — Graph Reasoning for Architecture, Fidelity & Traceability — extracts architectural truth from a system that already exists. The reconstruction is a graph plus a fact packet: ownership, dependencies, invariants, state, data paths, runtime boundaries, blast radius, and proof obligations, each tied to evidence.',
      'An external language model can consume that packet instead of repeatedly rebuilding architecture from isolated files. Residuals stay visible. Incomplete overlay stays incomplete. Schema-valid is not proof of behavioral consumption.',
      'Human-facing name: G.R.A.F.T.+. Repository and package identifier: graft_plus. G.R.A.F.T.1st is a related but distinct line that models intended architecture before substantial implementation. This lab is G.R.A.F.T.+ only.',
    ],
  },
  {
    id: 'what-it-is-not',
    title: 'What it is not',
    body: [
      'G.R.A.F.T.+ does not choose a correction, write a plan, or authorize a merge. The packet role is fact-substrate. implementsPlan is always false. mergeAuthorization remains not-determined even when disposition is clear.',
      'It does not replace repository inspection, tests, runtime traces, or human review. A generated inventory is not an overlay. An acknowledged finding is not a repair.',
    ],
    facts: [
      { term: 'Fact substrate', meaning: 'Supplies evidence-linked facts a planner may consume. Does not plan.' },
      { term: 'Disposition', meaning: 'clear, review-required, or blocked — a reconstruction outcome, not a merge decision.' },
      { term: 'Residual', meaning: 'Unmapped, unmodeled, indeterminate, or acknowledged-violation state that stays visible.' },
      { term: 'Overlay', meaning: 'Policy, saga, ownership, and runtime-authority facts. Unmodeled overlay remains residual.' },
    ],
  },
  {
    id: 'how-to-use',
    title: 'How to use the prototype',
    body: [
      'The instrument panel above this guide is the working reconstruction. Two subjects are loaded. You do not ingest an arbitrary repository on this public page; the subjects are prepared reconstructions.',
    ],
    steps: [
      {
        label: 'Open the prototype',
        detail: 'Jump to the workbench. The graph is the blast-radius map for the current subject and changed-file slice.',
      },
      {
        label: 'Choose a subject',
        detail: 'Ajenda is a distilled reconstruction. Omnipath v2 is source-backed at a captured commit. Switching subjects re-runs the pipeline.',
      },
      {
        label: 'Read Run',
        detail: 'Disposition, residuals, impact, proof, and adjudication for the current slice. Clear does not mean merge.',
      },
      {
        label: 'Read Truth',
        detail: 'Inventory, negatives, gaps, contracts, and proofs. Filter by kind. Facts that are not in the slice stay out of the planner packet.',
      },
      {
        label: 'Read Schema and Transfer',
        detail: 'Schema is the packet shape a planner can consume. Transfer checks that facts remain coherent when the subject changes.',
      },
      {
        label: 'Read Records, then export',
        detail: 'Records are frozen R&D notes, not live conclusions. Export downloads the fact packet and planner input as JSON.',
      },
    ],
  },
  {
    id: 'reading-a-run',
    title: 'Reading a run',
    body: [
      'Start from changed files. The engine maps those files onto graph nodes, walks consumers and dependencies, selects proof, audits completeness, and adjudicates findings in the slice.',
      'Unmapped changed files fail closed: they become review-required. Missing test mapping is a review gate, not a silent pass. Overlay edges without evidence are completeness failures.',
      'Export the packet when you want a planner to consume the reconstruction. The packet repeats the boundary: product G.R.A.F.T.+, role fact-substrate, implementsPlan false, mergeAuthorization not-determined.',
    ],
  },
  {
    id: 'subjects',
    title: 'Subjects on this page',
    body: [
      'Ajenda is reconstructed from a distilled architectural model used in 1DevTeam development. It demonstrates overlay facts, invariants, and acknowledged residuals without claiming the public graph is the full internal Ajenda graph.',
      'Omnipath v2 is reconstructed from source-backed evidence at a captured SHA. Marketplace spend, governance, and factory surfaces are represented; risk-tier consumption remains a visible gap rather than a repaired overlay.',
      'Neither subject is a hosted product on this page. Both are reconstruction inputs so the prototype can be inspected against real systems 1DevTeam actually works on.',
    ],
  },
  {
    id: 'production-boundary',
    title: 'What this prototype demonstrates — and what it does not',
    body: [
      'This public prototype demonstrates code-graph impact analysis, written facts, task-ready planner input, visible residuals, transfer checks, and frozen project records. Those are the behaviors the instrument presents.',
      'A production G.R.A.F.T.+ capable of precise planning against an arbitrary repository still needs project ingestion, file/symbol/import/caller/callee indexing, durable plans and tasks, separated Architect/Dispatcher/Coder/Reviewer workflows, real browser evidence, secrets isolation, git/worktree integration, and a dashboard bound to durable state. This page does not claim those internals are shipping here.',
    ],
  },
]

export const graftRelatedSystems = [
  { id: 'pride-protocol', href: '/wiki/pride-protocol', label: 'PRIDE Protocol', note: 'Process discipline used alongside reconstruction.' },
  { id: 'snapshot', href: '/wiki/snapshot', label: 'Snapshot', note: 'Project-context transfer. Complements, does not replace, the graph.' },
  { id: 'architectural-graph', href: '/wiki/architectural-graph', label: 'Ajenda Architectural Graph', note: 'Persistent architecture used in Ajenda development and CI.' },
  { id: 'architectural-blast-radius', href: '/wiki/architectural-blast-radius', label: 'Architectural blast radius', note: 'Affected system surfaces beyond the edited files.' },
  { id: 'proof-selection', href: '/wiki/proof-selection', label: 'Proof selection', note: 'Which tests and checks the affected architecture requires.' },
  { id: 'decision-ownership', href: '/wiki/decision-ownership', label: 'Decision ownership', note: 'Who owns a behavior, not who observes it.' },
  { id: 'reasoning-scope', href: '/wiki/reasoning-scope', label: 'Reasoning scope', note: 'What was actually analyzed for a change.' },
  { id: 'pr-cascade', href: '/wiki/pr-cascade', label: 'Corrective PR cascade', note: 'Later corrections related to earlier changes.' },
] as const
