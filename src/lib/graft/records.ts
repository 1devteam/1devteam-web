export type RecordKind =
  | "authority"
  | "amendment"
  | "progression"
  | "protocol"
  | "handoff";

export type ResearchRecord = {
  id: string;
  title: string;
  date: string;
  kind: RecordKind;
  driveId: string;
  role: string;
  summary: string;
};

export const PRODUCT = {
  plus: "G.R.A.F.T.+",
  first: "G.R.A.F.T.1st",
  expansion: "Graph Reasoning for Architecture, Fidelity & Traceability",
  package: "graft_plus",
  plusMeaning: "Added to an already-built or actively evolving system.",
  firstMeaning: "The project begins with G.R.A.F.T. before substantial implementation.",
} as const;

export const STAGES = [
  {
    id: "structural",
    title: "Structural generation",
    detail:
      "Source-backed extraction of modules, tests, migrations, tables, and sinks. Canonical edge direction is consumer to dependency.",
  },
  {
    id: "overlay",
    title: "Semantic overlay",
    detail:
      "Relationships imports cannot safely express: runtime and security boundaries, state ownership, authority, reviewed exceptions.",
  },
  {
    id: "impact",
    title: "Impact and blast radius",
    detail:
      "Changed files map to nodes, unmapped paths, transitive consumers, downstream prerequisites, invariants, and risk domains.",
  },
  {
    id: "proof",
    title: "Proof selection",
    detail:
      "Impact selects required tests and gates. Bundles stay advisory; missing mappings become review-only.",
  },
  {
    id: "completeness",
    title: "Completeness ratchet",
    detail:
      "Acknowledged findings stay visible. Acknowledgements are not repairs. New unacknowledged blocking findings fail closed.",
  },
  {
    id: "adjudication",
    title: "Adjudication",
    detail:
      "Applicability → binding precedence → schema acceptance → behavioral consumption → SATISFIED / VIOLATED / INDETERMINATE.",
  },
  {
    id: "decision",
    title: "Advisory decision",
    detail:
      "Disposition is clear, review-required, or blocked. Merge authorization remains not-determined.",
  },
] as const;

export const LEARNINGS = [
  "A persistent architectural representation changes the reasoning substrate. Structure that had to be reconstructed from code, tests, and context can be exposed as machine-readable state.",
  "Generated structure and semantic overlay must remain distinct. Ownership, invariants, and authority cannot be safely inferred from imports alone.",
  "Residuals matter. A useful graph system must track what is satisfied, violated, indeterminate, or still unmodeled instead of forcing completeness.",
  "Adjudication is required. Candidate findings need a chain that tests applicability, binding, schema, and consumption before a status is assigned.",
  "The graph is strongest as an architecture-analysis control. It must not silently become merge authority or product marketing.",
  "Schema-valid binding is not proof of behavioral consumption. Independent proof stages stay separately witnessed.",
] as const;

export const CORE_FORWARD = [
  "Stable graph schema: nodes, edges, ownership, invariants, residuals, proof links",
  "Separation of generated extraction from semantic overlay",
  "Explicit residual and indeterminate categories",
  "Impact and blast-radius analysis",
  "Proof selection driven by impact",
  "Completeness audit with ratchet",
  "Adjudication chain that keeps proof stages independent",
  "Advisory architecture decision that never claims merge authority",
  "Versioned evidence-linked truth graph as fact substrate for a planner, not a planner itself",
] as const;

export const HYPOTHESIS =
  "When a reconstruction pipeline is forced to run against two architecturally different existing systems and is required to keep residuals explicit, the resulting graph schema and adjudication rules tend to become more general and less project-bound. Whether this improves architectural reasoning quality, reduces corrective cascades, or merely changes the location of failure detection remains an open empirical question. Positive, negative, and null outcomes are all valid.";

export const MATURITY = [
  "Do not claim general G.R.A.F.T. superiority, universal correctness, or progressive-enforcement readiness.",
  "Independent validation beyond the current controls, provenance locking, conservative INDETERMINATE behavior, and mission- or plan-specific applicability remain required before enforcement can be considered.",
  "Ajenda-specific domain rules (RLS inventory, exact egress classifications, exact state-resource lists) are examples, not the universal core.",
  "Omnipath v2 is a second reconstruction and transfer subject. It is not automatically enrolled in Ajenda's longitudinal PR-cascade design.",
  "G.R.A.F.T.1st remains a related but distinct line. This lab is G.R.A.F.T.+ only.",
] as const;

export const ADJUDICATION_STAGES = [
  { id: "applicable", label: "Applicability", meaning: "Is this finding in the instantiated change slice?" },
  { id: "binding", label: "Binding", meaning: "Does the authoritative binding exist with precedence?" },
  { id: "schema", label: "Schema", meaning: "Does the bound target accept the declared schema kind?" },
  { id: "consumption", label: "Consumption", meaning: "Is the binding behaviorally consumed, not merely present?" },
  { id: "status", label: "Status", meaning: "SATISFIED, VIOLATED, INDETERMINATE, or not applicable." },
] as const;

export const RECORDS: ResearchRecord[] = [
  {
    id: "program-index",
    title: "00 — READ FIRST — R&D Program Index, G.R.A.F.T. Names & READ-ONLY Boundaries",
    date: "2026-08-31",
    kind: "authority",
    driveId: "1zXXeXlh1EexAFLi3vNl-dGAnechb-CuRnyCgPZjkDwY",
    role: "Top-level R&D authority and naming.",
    summary:
      "Defines G.R.A.F.T.+ and G.R.A.F.T.1st, the R&D folder boundary, and the default rule that everything outside that folder is read-only external reference.",
  },
  {
    id: "naming-standard",
    title: "G.R.A.F.T. Product Naming & Scope Standard — 2026-08-31",
    date: "2026-08-31",
    kind: "authority",
    driveId: "1CcmjJ6tjo1zgne7RnLqHr0dd3tiiVv8a9B_rCqEFSWY",
    role: "Canonical product names and product boundary.",
    summary:
      "G.R.A.F.T.+ reconstructs what a system actually is. G.R.A.F.T.1st models what a system should become before substantial implementation. Shared ontology does not erase different evidence boundaries.",
  },
  {
    id: "naming-lock",
    title: "G.R.A.F.T. Naming Lock — 2026-09-13",
    date: "2026-09-13",
    kind: "amendment",
    driveId: "1_paDEc99TH5KSfcuofHApePpxAii6Dbn21KaU0jL1QM",
    role: "Locked display and package identifiers.",
    summary:
      "Human-facing name is G.R.A.F.T.+. Technical repository and Python package identifier is graft_plus. Historical spellings stay mapped, not rewritten.",
  },
  {
    id: "study-boundary",
    title: "00 — READ FIRST — G.R.A.F.T. Study Boundary & Current State",
    date: "2026-08-31",
    kind: "handoff",
    driveId: "1TupvRLTMrgecKN5aVfQ-35zAQd1BGzJVyOo62TnpYMQ",
    role: "Graph-First study entry and maturity boundary.",
    summary:
      "Records the Ajenda PR 501–502 adjudication line, the rule that candidate detection is not enforcement, and the standing prohibition on claiming universal correctness.",
  },
  {
    id: "tool-progression",
    title: "G.R.A.F.T.+ Tool Progression — 2026-09-13",
    date: "2026-09-13",
    kind: "progression",
    driveId: "1uPSJLOzFmBh0Uv6zAlBbI6EjSuYqb6R_UvTxDetYDew",
    role: "Engineering progression of the reconstruction pipeline.",
    summary:
      "Aligns Drive notes with the live Ajenda graph system: structural generation, overlay, impact, proof, completeness ratchet, adjudication, advisory decision, and CI integration.",
  },
  {
    id: "transition",
    title: "R&D Program Transition Note — 2026-09-13",
    date: "2026-09-13",
    kind: "handoff",
    driveId: "1DutvhoYSO_HCerI9WZZK1Vo11ULLzIu6Oy4r5pnUo8g",
    role: "Extraction of the reusable core and second subject.",
    summary:
      "What was learned on Ajenda, what is being carried into a project-agnostic pipeline, why Omnipath v2 is the transfer subject, and a non-contaminating hypothesis.",
  },
  {
    id: "boundary-amendment",
    title: "Amendment to G.R.A.F.T. Study Boundary — 2026-09-13",
    date: "2026-09-13",
    kind: "amendment",
    driveId: "1MOZSNm1VRR_BAAm0J03THr2ZqAOggcBxk-_vqSItRLg",
    role: "Dated amendment. Does not rewrite earlier text.",
    summary:
      "Points the study boundary at the tool progression record, names the reusable core, and records Omnipath v2 as the second existing-system subject.",
  },
  {
    id: "index-amendment",
    title: "Amendment to R&D Program Index — 2026-09-13",
    date: "2026-09-13",
    kind: "amendment",
    driveId: "1XFlCttcNgQzTppruwhWr3H-crD5pJRZqXeotmApjdRI",
    role: "Program-index amendment for the second subject.",
    summary:
      "Keeps Ajenda as the primary longitudinal subject for the PR Cascade study and designates Omnipath v2 as a reconstruction and transfer subject under the default read-only external rule.",
  },
  {
    id: "canonical-protocol",
    title: "Canonical Graph Construction Protocol v0.1",
    date: "2026-08-25",
    kind: "protocol",
    driveId: "1uKSzTDvOiOsyV3uHUfXEUu8Uw7Z5oClPs_Xds5O9iZ0",
    role: "G.R.A.F.T.1st-adjacent construction protocol. Read-only here.",
    summary:
      "Defines a language-independent canonical design graph built from frozen intent, not from code. This lab does not execute that protocol; it reconstructs observed systems.",
  },
  {
    id: "applicability",
    title: "Instantiated G.R.A.F.T. Resolver Applicability Protocol — 2026-08-31",
    date: "2026-08-31",
    kind: "protocol",
    driveId: "109a4T2lbSZRqkiHrj7D-UZOLl4z-6KNKwvQlwbr7RJs",
    role: "Why INDETERMINATE is a first-class result.",
    summary:
      "A static violation is not a repair authorization. Missing plan, job, satisfier, or resolver state must remain INDETERMINATE. Historical task names do not prove job identity.",
  },
];

export function driveUrl(id: string) {
  return `https://docs.google.com/document/d/${id}/edit`;
}
