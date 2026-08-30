export type FeaturedWikiEntry = {
  id: string
  title: string
  category: 'Systems' | 'Architecture' | 'Research'
  status?: string
  description: string
  sections: readonly { heading: string; body: string }[]
  related: readonly { label: string; href: string }[]
  evidence: string
}

export const featuredWikiEntries: readonly FeaturedWikiEntry[] = [
  {
    id: 'pride-protocol',
    title: 'PRIDE Protocol',
    category: 'Systems',
    status: 'Used in practice',
    description: 'A development-process discipline that makes the actions required for reliable AI-assisted software engineering explicit and reviewable.',
    sections: [
      {
        heading: 'The problem it addresses',
        body: 'AI-assisted development can produce technically plausible output before enough of the surrounding system has been inspected to establish ownership, dependencies, failure paths, or the required proof. PRIDE treats that as a process problem: apparent completion is not accepted as evidence that the correct engineering work occurred.',
      },
      {
        heading: 'Operating sequence',
        body: 'The stable workflow is Read completely → Understand fully → Plan properly → Execute systematically → Test thoroughly → Document clearly → Review honestly. Proper actions include reading relevant files and traces, searching relevant instances, investigating uncertainty instead of guessing, reasoning across downstream effects, implementing at the owning layer, and verifying the affected behavior.',
      },
      {
        heading: 'Working metric',
        body: 'PRIDE = Proper Actions ÷ Total Actions, with a working target of 95% or greater proper actions. The metric is a development-process standard, not a claim that the protocol independently guarantees software correctness or eliminates model failure.',
      },
    ],
    related: [
      { label: 'Development method', href: '/method' },
      { label: 'Snapshot', href: '/wiki/snapshot' },
      { label: 'Architectural Graph', href: '/wiki/architectural-graph' },
      { label: 'Preserved PRIDE artifact', href: '/#pride-protocol' },
    ],
    evidence: 'The protocol is used in 1DevTeam development. Its effectiveness is treated as an engineering practice claim bounded by observed use, not as a completed comparative research finding.',
  },
  {
    id: 'snapshot',
    title: 'Snapshot',
    category: 'Systems',
    status: 'Snapshot v10 used in practice',
    description: 'A project-context transfer system built to carry structured repository and project state into AI-assisted development contexts.',
    sections: [
      {
        heading: 'Context-transfer problem',
        body: 'A new model context can begin with little or no working knowledge of a large repository. Reconstructing file structure, routes, dependencies, tests, configuration, Git state, and related project information repeatedly consumes reasoning capacity before the actual software problem can be addressed.',
      },
      {
        heading: 'What Snapshot transfers',
        body: 'Snapshot v10 can package Git state, file inventory and hashes, routes, imports and dependencies, tests, parse results, environment and configuration structure, documentation summaries, CI/CD information, and other repository context into a structured artifact. Sensitive values are redacted rather than intentionally transferred.',
      },
      {
        heading: 'What it does not replace',
        body: 'Snapshot does not prove model understanding, replace direct repository inspection, or itself encode architectural ownership and invariants. Its role is narrower: increase the amount of real project state available when work begins so less of that state has to be rediscovered from zero.',
      },
    ],
    related: [
      { label: 'PRIDE Protocol', href: '/wiki/pride-protocol' },
      { label: 'Architectural Graph', href: '/wiki/architectural-graph' },
      { label: 'Snapshot execution artifact', href: '/#snapshot' },
      { label: 'Technical evidence', href: '/work#snapshot' },
    ],
    evidence: 'The public site presents a real Snapshot v10 execution against Ajenda and a reviewed public-safe excerpt of structured output. The design objective is comprehensive project context; full cognitive understanding is not asserted as a measured outcome.',
  },
  {
    id: 'architectural-graph',
    title: 'Ajenda Architectural Graph',
    category: 'Systems',
    status: 'Active development and CI capability',
    description: 'A persistent machine-readable representation of Ajenda software structure, ownership, dependencies, selected invariants, and proof relationships.',
    sections: [
      {
        heading: 'Why project context is not enough',
        body: 'Knowing that files, routes, tests, and imports exist does not by itself establish which component owns a decision, which invariant governs a change, what the real blast radius includes, or which proof is required beyond the edited file. Those relationships otherwise have to be reconstructed during each change analysis.',
      },
      {
        heading: 'Represented relationships',
        body: 'The canonical graph contains module relationships and selected function-level nodes together with metadata such as decision roles. Relationships include defined_in, calls_function, and tests_function, alongside architecture roles, semantic boundaries, dependency edges, selected invariants, and proof information used by development tooling.',
      },
      {
        heading: 'Current use',
        body: 'Ajenda development uses graph state for dependency and impact analysis, decision ownership, graph-aware proof selection, selective-CI reasoning, completeness auditing, architecture decision composition, semantic checks, and selected function-level diagnosis. It is development and CI infrastructure, not customer-facing Ajenda runtime functionality.',
      },
    ],
    related: [
      { label: 'Interactive graph', href: '/#architecture-graph' },
      { label: 'Architectural blast radius', href: '/wiki/architectural-blast-radius' },
      { label: 'Decision ownership', href: '/wiki/decision-ownership' },
      { label: 'Proof selection', href: '/wiki/proof-selection' },
    ],
    evidence: 'The public interactive view is a reviewed projection derived from Ajenda’s canonical development graph. It is deliberately smaller than the full internal graph and should not be interpreted as complete public exposure of the repository architecture.',
  },
  {
    id: 'architectural-blast-radius',
    title: 'Architectural blast radius',
    category: 'Architecture',
    description: 'The set of system surfaces that can be materially affected by a software change, including effects outside the files directly modified.',
    sections: [
      {
        heading: 'Definition',
        body: 'Architectural blast radius can include components, contracts, invariants, runtime surfaces, tests, state relationships, authority boundaries, data paths, integrations, concurrency behavior, recovery paths, and downstream consumers. File-diff size is therefore not a sufficient proxy for affected-system size.',
      },
      {
        heading: 'Why it matters for repair',
        body: 'A change can satisfy its local test while remaining incomplete if a participating contract or downstream behavior has not been repaired or verified. Blast-radius reasoning asks what can materially change because of the modification, not only what code was edited to produce it.',
      },
      {
        heading: 'Use in the current study',
        body: '1DevTeam R&D Program #1 compares reasoning scope and change scope with the architecture materially affected by software changes, then examines subsequent corrective work. The study does not assume that every later pull request was caused by a prior change; chronology, causal relationship, defect class, repair unit, and competing explanations are coded separately.',
      },
    ],
    related: [
      { label: 'Reasoning scope', href: '/wiki/reasoning-scope' },
      { label: 'Corrective PR cascade', href: '/wiki/pr-cascade' },
      { label: 'Decision ownership', href: '/wiki/decision-ownership' },
      { label: 'Formal R&D program', href: '/research' },
    ],
    evidence: 'Blast radius is an analytic construct used for architecture and research coding. The graph can provide impact evidence, but graph presence alone is not proof that every runtime effect has been represented or tested.',
  },
  {
    id: 'reasoning-scope',
    title: 'Reasoning scope',
    category: 'Research',
    description: 'The portion of a software system included in the analysis used to understand, plan, and justify a change.',
    sections: [
      {
        heading: 'Reasoning scope versus file scope',
        body: 'Reasoning scope is not the same as the list of files opened or changed. It concerns which contracts, dependencies, state relationships, owners, invariants, failure paths, tests, and downstream effects were materially included in the analysis supporting the repair.',
      },
      {
        heading: 'Mismatch as a study variable',
        body: 'A local reasoning scope can be smaller than the architecture affected by a change. The study tests whether mismatch between reasoning or implementation scope and architectural blast radius predicts subsequent corrective PR cascades while accounting for alternative explanations such as codebase maturity, CI maturity, model/tool changes, test coverage, PR size, defect class, and repair-unit type.',
      },
      {
        heading: 'Interpretation boundary',
        body: 'Broader reasoning is not automatically better. The relevant target is sufficient coverage of the architecture materially affected by the change. Inspecting unrelated surfaces can add cost without adding evidence, while missing a participating boundary can leave a repair incomplete.',
      },
    ],
    related: [
      { label: 'Architectural blast radius', href: '/wiki/architectural-blast-radius' },
      { label: 'Corrective PR cascade', href: '/wiki/pr-cascade' },
      { label: 'Architectural Graph', href: '/wiki/architectural-graph' },
      { label: 'Formal R&D program', href: '/research' },
    ],
    evidence: 'Reasoning scope is a measured/coded study construct. The site does not treat a single observed repair sequence as proof that scope mismatch causes later corrections.',
  },
  {
    id: 'pr-cascade',
    title: 'Corrective PR cascade',
    category: 'Research',
    description: 'A sequence of subsequent pull requests associated with correcting, completing, or responding to earlier software changes.',
    sections: [
      {
        heading: 'What counts as a cascade',
        body: 'The study tracks later corrective work that is materially related to a prior implementation or repair. Relationship is not inferred from sequence alone. Evidence can include changed behavior, affected contracts, issue context, tests, architectural ownership, review history, and the reason the subsequent pull request became necessary.',
      },
      {
        heading: 'Introduced versus exposed defects',
        body: 'A later correction can repair a defect introduced by an earlier change, complete work that was architecturally incomplete, or address a previously latent defect that the earlier change merely exposed. These mechanisms are distinct and must not be collapsed into a claim that every corrective PR represents damage caused by the immediately preceding PR.',
      },
      {
        heading: 'Why the sequence matters',
        body: 'Repeated corrective propagation can indicate that the unit of repair was smaller than the underlying ownership or invariant boundary. It can also result from unrelated confounders. The study therefore evaluates chronology together with causal evidence, repair-unit type, proof behavior, graph state, and competing explanations.',
      },
    ],
    related: [
      { label: 'Architectural blast radius', href: '/wiki/architectural-blast-radius' },
      { label: 'Reasoning scope', href: '/wiki/reasoning-scope' },
      { label: 'Decision ownership', href: '/wiki/decision-ownership' },
      { label: 'Formal R&D program', href: '/research' },
    ],
    evidence: 'Corrective PR cascade is a research coding concept. Candidate patterns remain observations or candidate findings until the study’s adjudication process supports a stronger classification.',
  },
  {
    id: 'decision-ownership',
    title: 'Decision ownership',
    category: 'Architecture',
    description: 'Identification of the function, component, contract, or invariant that actually owns a software decision rather than merely observing its result.',
    sections: [
      {
        heading: 'Owner versus symptom location',
        body: 'The file where incorrect behavior becomes visible may not own the decision that produced it. Callers, adapters, UI surfaces, tests, and downstream consumers can expose or compensate for behavior whose actual owner is elsewhere. Repairing the observer instead of the owner can distribute compensating logic and enlarge future correction cost.',
      },
      {
        heading: 'Function-level graph support',
        body: 'Ajenda’s graph includes selected python_function nodes with decision-role metadata and relationships such as calls_function, tests_function, and defined_in. This allows diagnosis to move from a module or failing test toward the represented function that classifies, normalizes, segments, maps, or otherwise owns a decision.',
      },
      {
        heading: 'Repair implication',
        body: 'Once ownership is established, the intended repair unit can be compared with the surrounding contracts and invariants. Correct ownership does not eliminate the need for blast-radius analysis: changing the owner can affect every caller, test, state transition, or downstream behavior that relies on that decision.',
      },
    ],
    related: [
      { label: 'Architectural Graph', href: '/wiki/architectural-graph' },
      { label: 'Architectural blast radius', href: '/wiki/architectural-blast-radius' },
      { label: 'Proof selection', href: '/wiki/proof-selection' },
      { label: 'Complex systems remediation', href: '/enterprise' },
    ],
    evidence: 'Decision-role metadata exists for selected Ajenda graph functions. It is a targeted representation, not a claim that every behavioral decision in the codebase has function-level ownership metadata.',
  },
  {
    id: 'proof-selection',
    title: 'Proof selection',
    category: 'Architecture',
    description: 'Selection of the tests, invariant checks, semantic checks, and other evidence required to support a specific software change.',
    sections: [
      {
        heading: 'Beyond the nearest test',
        body: 'The test closest to an edited function can prove direct behavior while missing contracts or downstream effects elsewhere in the blast radius. Proof selection asks which evidence is required by the affected architecture, including regression tests, integration boundaries, invariants, security/authority rules, and failure behavior.',
      },
      {
        heading: 'Graph-aware selection',
        body: 'Ajenda graph tooling can use changed nodes and mapped dependency/test relationships to identify impacted tests and candidate proof obligations. Selective-CI reasoning can then run a targeted proof set rather than treating every test as equally relevant to every change.',
      },
      {
        heading: 'Completeness constraint',
        body: 'Targeted proof is only as reliable as the represented architecture and mappings that support selection. Completeness auditing and explicit residual findings therefore matter: a selective test set should not be interpreted as exhaustive proof when known graph gaps or unmapped behavior remain.',
      },
    ],
    related: [
      { label: 'Architectural Graph', href: '/wiki/architectural-graph' },
      { label: 'Decision ownership', href: '/wiki/decision-ownership' },
      { label: 'Architectural blast radius', href: '/wiki/architectural-blast-radius' },
      { label: 'Technical evidence', href: '/work' },
    ],
    evidence: 'Graph-aware proof selection is used in Ajenda development/CI. The site describes the mechanism and current capability without claiming that selective proof guarantees complete behavioral coverage.',
  },
] as const

export const featuredWikiIds = new Set(featuredWikiEntries.map((entry) => entry.id))

export function featuredWikiEntry(id: string | undefined) {
  return featuredWikiEntries.find((entry) => entry.id === id)
}
