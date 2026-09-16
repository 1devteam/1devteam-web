export type GuideSection = {
  id: string
  title: string
  body: readonly string[]
  steps?: readonly { label: string; detail: string }[]
  facts?: readonly { term: string; meaning: string }[]
}

export const graftGuideIntro = {
  eyebrow: 'How to use it',
  title: 'What G.R.A.F.T.+ is, and how to read a pack',
  lede:
    'G.R.A.F.T.+ reconstructs an existing public repository into evidence-linked facts and one downloadable pack. Feed that pack to an AI. It is not a planner, and it is not merge authority.',
} as const

export const graftGuideSections: readonly GuideSection[] = [
  {
    id: 'what-it-is',
    title: 'What it is',
    body: [
      'G.R.A.F.T.+ — Graph Reasoning for Architecture, Fidelity & Traceability — maps a public GitHub repository at one SHA. The reconstruction is inventory, contracts, inner dependencies, unresolved imports, routes, wiring, commits, README claimed intent, and structural surfaces.',
      'The download is the reconstruction pack from graft_plus: architecture decision, dependency graph, completeness, impact, proof, receipt. Source is not in the zip. Overlay stays residual.',
      'Human-facing name: G.R.A.F.T.+. Repository and package identifier: graft_plus. G.R.A.F.T.1st is a related but distinct line that models intended architecture before substantial implementation. This page is G.R.A.F.T.+ only.',
    ],
  },
  {
    id: 'what-it-is-not',
    title: 'What it is not',
    body: [
      'G.R.A.F.T.+ does not choose a correction, write a plan, or authorize a merge. The pack role is fact-substrate. implementsPlan is always false. mergeAuthorization remains not-determined.',
      'It does not replace repository inspection, tests, runtime traces, or human review. A generated inventory is not an overlay. An acknowledged finding is not a repair. Ajenda and Omnipath are derivation records, not this workbench.',
    ],
    facts: [
      { term: 'Fact substrate', meaning: 'Supplies evidence-linked facts a planner may consume. Does not plan.' },
      { term: 'Pack', meaning: 'One zip: architecture decision, graph, completeness, impact, proof, receipt.' },
      { term: 'Residual', meaning: 'Unmapped, unmodeled, or overlay state that stays visible.' },
      { term: 'Overlay', meaning: 'Policy, saga, ownership, and runtime-authority facts. Unmodeled overlay remains residual.' },
    ],
  },
  {
    id: 'how-to-use',
    title: 'How to use this page',
    body: [
      'Paste a public GitHub repository. Reconstruct. Download the pack. Feed graph-architecture-decision.json to an AI, then the graph. The run lives in this tab until you download it or leave.',
    ],
    steps: [
      {
        label: 'Paste owner/repo',
        detail: 'A GitHub URL or git SSH form also works. Public repositories reconstruct without a token.',
      },
      {
        label: 'Reconstruct',
        detail: 'The tree is read at one SHA. Every ingested path, contract, and resolved inner dependency is a fact, not a sample.',
      },
      {
        label: 'Download the pack',
        detail: 'The zip holds graph-architecture-decision.json and the rest of the reconstruction pack. It does not include the source tree.',
      },
      {
        label: 'Read joints first',
        detail: 'Provenance, commits, README claimed intent, named misses, skip directories, unresolved packages, inventory, contracts, dependencies, routes, wiring. Questions arrive from those joints.',
      },
    ],
  },
  {
    id: 'reading-a-run',
    title: 'Reading a pack',
    body: [
      'The reader protocol is baked into every map so a downstream AI does not need a second briefing. Honor negatives. Leave overlay residual. Do not invent files that were named as omitted.',
      'Unresolved imports are facts: the specifier is not in this tree. They are not missing files and not a separate gap lane.',
      'The packet repeats the boundary: product G.R.A.F.T.+, role fact-substrate, implementsPlan false, mergeAuthorization not-determined.',
    ],
  },
  {
    id: 'production-boundary',
    title: 'What is proven here — and what is not claimed',
    body: [
      'Public GitHub repositories reconstruct without a token. Every ingested path, contract, and resolved inner dependency is a fact. Files GitHub will not return, or that exceed the text size limit, are named on the map. Skip directories such as node_modules and .git are named, not treated as source.',
      'This page does not store reconstructions across refresh. It does not plan, merge, or host Ajenda or Omnipath. Overlay is residual until evidenced.',
    ],
  },
]

export const graftRelatedSystems = [
  { id: 'pride-protocol', href: '/wiki/pride-protocol', label: 'PRIDE Protocol', note: 'Process discipline used alongside reconstruction.' },
  { id: 'snapshot', href: '/wiki/snapshot', label: 'Snapshot', note: 'Project-context transfer. Complements, does not replace, the map.' },
  { id: 'architectural-graph', href: '/wiki/architectural-graph', label: 'Ajenda Architectural Graph', note: 'Persistent architecture used in Ajenda development and CI.' },
  { id: 'architectural-blast-radius', href: '/wiki/architectural-blast-radius', label: 'Architectural blast radius', note: 'Affected system surfaces beyond the edited files.' },
  { id: 'proof-selection', href: '/wiki/proof-selection', label: 'Proof selection', note: 'Which tests and checks the affected architecture requires.' },
  { id: 'decision-ownership', href: '/wiki/decision-ownership', label: 'Decision ownership', note: 'Who owns a behavior, not who observes it.' },
  { id: 'reasoning-scope', href: '/wiki/reasoning-scope', label: 'Reasoning scope', note: 'What was actually analyzed for a change.' },
  { id: 'pr-cascade', href: '/wiki/pr-cascade', label: 'Corrective PR cascade', note: 'Later corrections related to earlier changes.' },
] as const
