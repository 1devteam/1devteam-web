export type GuideSection = {
  id: string
  title: string
  body: readonly string[]
  steps?: readonly { label: string; detail: string }[]
  facts?: readonly { term: string; meaning: string }[]
}

export const graftGuideIntro = {
  eyebrow: 'How to use it',
  title: 'What G.R.A.F.T.+ is, what it proves, and how to read a pack',
  lede:
    'G.R.A.F.T.+ — Graph Reasoning for Architecture, Fidelity & Traceability — reconstructs an existing public repository into evidence-linked facts and one downloadable pack. The current public workbench is a reconstruction instrument, not a planner, merge authority, or execution authority.',
} as const

export const graftGuideSections: readonly GuideSection[] = [
  {
    id: 'what-it-is',
    title: 'What it is',
    body: [
      'G.R.A.F.T.+ — Graph Reasoning for Architecture, Fidelity & Traceability — maps a public GitHub repository at one SHA. The workbench records inventory, declared contracts, resolved and unresolved dependency evidence, routes where supported, wiring, recent commits, README-claimed intent, structural surfaces, completeness signals, impact, proof, and decision state.',
      'The download is the reconstruction pack from graft_plus. It is intended to give an external language model or engineer a durable evidence substrate rather than force them to reconstruct the repository from memory. Overlay remains residual unless it is evidenced.',
      'G.R.A.F.T.1st — the project-origin Graph Reasoning for Architecture, Fidelity & Traceability research line — is related but distinct. Current R&D is exploring machine-native construction from finished-state product claims, recursive necessity derivation, semantic simulation, and later implementation reconciliation. The public workbench on this page is G.R.A.F.T.+ only.',
    ],
  },
  {
    id: 'what-it-is-not',
    title: 'What it is not',
    body: [
      'G.R.A.F.T.+ does not choose a correction, write a plan, authorize a merge, or grant execution authority. The pack role is fact-substrate. implementsPlan remains false and mergeAuthorization remains not-determined.',
      'A successful reconstruction is not a claim that the complete architecture has been understood. Repository ingestion, graph integrity, semantic reconstruction depth, runtime proof, and change safety are different questions and should remain separate.',
    ],
    facts: [
      { term: 'Fact substrate', meaning: 'Supplies evidence-linked facts a planner may consume. Does not plan.' },
      { term: 'Integrity', meaning: 'Checks internal artifact consistency. It must not be read as architectural completeness.' },
      { term: 'Semantic depth', meaning: 'How much architectural meaning the current engine can reconstruct from the ingested source and configuration surfaces.' },
      { term: 'Residual', meaning: 'Unmapped, unmodeled, unresolved, or overlay state that remains visible instead of being guessed away.' },
      { term: 'Overlay', meaning: 'Policy, saga, ownership, runtime-authority, and other reviewed architectural relationships not safely inferred from source syntax alone.' },
    ],
  },
  {
    id: 'how-to-use',
    title: 'How to use this page',
    body: [
      'Paste a public GitHub repository. Reconstruct. Download the pack. Give the pack to an AI or engineer as evidence. The run lives in this tab until you download it or leave.',
    ],
    steps: [
      {
        label: 'Paste owner/repo',
        detail: 'A GitHub URL or git SSH form also works. Public repositories reconstruct without a token.',
      },
      {
        label: 'Reconstruct one SHA',
        detail: 'G.R.A.F.T.+ pins the reconstruction to repository evidence at a revision. Read the resulting counts and named residuals before drawing architectural conclusions.',
      },
      {
        label: 'Download the pack',
        detail: 'The zip contains the architecture decision, dependency graph, completeness, impact, proof, receipt, and reconstruction evidence produced by the current engine.',
      },
      {
        label: 'Read the boundaries first',
        detail: 'Start with provenance, named misses, skipped directories, node and edge counts, unresolved references, semantic surfaces, completeness, and warnings. Those boundaries tell you what the pack can and cannot support.',
      },
    ],
  },
  {
    id: 'reading-a-run',
    title: 'Reading a pack',
    body: [
      'The reader protocol is baked into every map so a downstream AI does not need a second briefing. Honor negative evidence. Do not invent files, relationships, runtime behavior, or authority that the artifact did not prove.',
      'Unresolved imports are observations, not automatically defects. At larger scale they may represent external packages, generated modules, test or tooling dependencies, optional paths, environment-provided modules, internal resolution gaps, or other classes that require further classification.',
      'Treat graph integrity, structural coverage, architectural reconstruction confidence, and runtime/change proof as separate dimensions. A graph may be internally consistent while still being semantically incomplete.',
      'The packet repeats the authority boundary: product G.R.A.F.T.+ — Graph Reasoning for Architecture, Fidelity & Traceability; role fact-substrate; implementsPlan false; mergeAuthorization not-determined.',
    ],
  },
  {
    id: 'production-boundary',
    title: 'What is proven here — and what is not claimed',
    body: [
      'The workbench has demonstrated repository ingestion at substantial scale, including a 2026-10-04 Chromium stress run that read 29,473 files and completed artifact production. That run also exposed the current frontier: semantic reconstruction can lag far behind successful ingestion.',
      'The Chromium evidence exposed canonical-identity collisions, a Python mocking PATCH versus HTTP PATCH semantic false positive, unresolved-reference classification needs, weak cross-language reconstruction, and a disposition model that was too willing to call an internally valid graph architecturally clear. Those are evidence for hardening the engine, not evidence that the Graph Reasoning for Architecture, Fidelity & Traceability concept has reached its ceiling.',
      'The Chromium run used the rushed universal-shell implementation rather than the strongest historical Ajenda-specialized G.R.A.F.T. implementation. It should therefore be read as a lower-bound stress result for the current public site engine.',
    ],
  },
  {
    id: 'current-hardening',
    title: 'Current hardening direction',
    body: [
      'Current Graph Reasoning for Architecture, Fidelity & Traceability hardening is aimed at canonical identity uniqueness, semantic disambiguation, language-aware extraction followed by language-independent normalization, build-system and generated-code relationships, unresolved-reference classification, subsystem hierarchy, ownership and process boundaries, cross-language joins, and separate integrity versus architectural-completeness signals.',
      'The research question is not merely how many files G.R.A.F.T.+ can read. It is how faithfully repository evidence can be transformed into an architectural representation that remains useful at large scale without hiding uncertainty.',
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
