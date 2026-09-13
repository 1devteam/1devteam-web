export const SCHEMA_VERSION = "1.0-core";
export const TRUTH_SCHEMA_VERSION = "1.0-truth";

export type Layer = "generated" | "overlay" | "runtime" | "proof";

export type NodeKind =
  | "python_module"
  | "frontend_module"
  | "test_module"
  | "db_table"
  | "network_egress"
  | "state_resource"
  | "security_boundary"
  | "runtime_boundary"
  | "business_job"
  | "runtime_artifact"
  | "runtime_action"
  | "agent"
  | "event_stream"
  | "saga"
  | "policy";

export type EdgeKind =
  | "imports"
  | "tests"
  | "calls"
  | "consumes"
  | "emits"
  | "owns"
  | "orchestrates"
  | "tenant_data_boundary"
  | "rls_enforced"
  | "state_ownership"
  | "credential_authority"
  | "egress_authority"
  | "binding";

export type FindingStatus = "SATISFIED" | "VIOLATED" | "INDETERMINATE";
export type Disposition = "clear" | "review-required" | "blocked";
export type ScenarioKind = "surface" | "authority" | "residual" | "unmapped";

export type GraftNode = {
  id: string;
  kind: NodeKind;
  label: string;
  source: string;
  layer: Layer;
  domain: string;
  notes?: string;
};

export type GraftEdge = {
  from: string;
  to: string;
  kind: EdgeKind;
  evidence: string;
  layer: Layer;
};

export type Invariant = {
  id: string;
  statement: string;
  sources: string[];
  risk: string;
};

export type Finding = {
  id: string;
  title: string;
  detail: string;
  relatedNodes: string[];
  blocking: boolean;
  proofMode?: "required" | "open";
  expectedBinding?: { from: string; to: string; kind: EdgeKind };
  expectedConsumption?: { from: string; to: string; kind: EdgeKind };
  schemaTargetKind?: NodeKind;
};

export type Scenario = {
  id: string;
  kind: ScenarioKind;
  label: string;
  files: string[];
  intent: string;
};

export type ProofClass =
  | "unit-test"
  | "integration-test"
  | "migration"
  | "runtime-trace"
  | "readback"
  | "docs-only"
  | "source-symbol"
  | "distilled"
  | "unproven";

export type FactKind =
  | "inventory"
  | "ownership"
  | "dependency"
  | "negative"
  | "contract"
  | "proof"
  | "gap"
  | "runtime"
  | "freshness"
  | "reference";

export type GapKind =
  | "missing"
  | "partial"
  | "stale"
  | "duplicated"
  | "simulated"
  | "conflicting"
  | "docs-only";

export type EvidenceLink = {
  path: string;
  symbol?: string;
  sha?: string;
  note: string;
  proofClass: ProofClass;
};

export type TruthFact = {
  id: string;
  capability: string;
  kind: FactKind;
  claim: string;
  nodes: string[];
  evidence: EvidenceLink[];
  owner?: string;
  gapKind?: GapKind;
  declared?: string;
  observed?: string;
  notOwned?: string[];
  mustNotChange?: string[];
  stale?: boolean;
  referenceOnly?: boolean;
  relatedFindingIds?: string[];
};

export type Capability = {
  id: string;
  label: string;
  intent: string;
  nodes: string[];
};

export type Provenance = {
  kind: "source-backed" | "distilled";
  repo: string;
  sha?: string;
  capturedAt: string;
  note: string;
};

export type SubjectProfile = {
  id: "ajenda" | "omnipath";
  name: string;
  dna: string;
  repoHint: string;
  files: string[];
  scenarios: Scenario[];
  nodes: GraftNode[];
  edges: GraftEdge[];
  invariants: Invariant[];
  findings: Finding[];
  acknowledgedFindingIds: string[];
  provenance: Provenance;
  capabilities: Capability[];
  facts: TruthFact[];
};

export type Residual = {
  id: string;
  category: "unmapped" | "indeterminate" | "unmodeled" | "acknowledged-violation";
  detail: string;
};

export type GraftGraph = {
  schemaVersion: string;
  subjectId: string;
  nodes: GraftNode[];
  edges: GraftEdge[];
  invariants: Invariant[];
  residuals: Residual[];
};

export type ImpactReport = {
  schemaVersion: string;
  changedFiles: string[];
  unmappedChangedFiles: string[];
  changedNodes: GraftNode[];
  upstreamConsumers: GraftNode[];
  downstreamDependencies: GraftNode[];
  relevantInvariants: Invariant[];
  riskDomains: string[];
};

export type ProofManifest = {
  schemaVersion: string;
  selectedBundles: { id: string; reason: string }[];
  requiredTests: string[];
  requiredGates: string[];
  reviewGates: string[];
  manualReview: string[];
};

export type CompletenessReport = {
  schemaVersion: string;
  integrityPass: boolean;
  unacknowledgedBlocking: string[];
  acknowledged: string[];
  missingEvidence: string[];
};

export type AdjudicationRow = {
  findingId: string;
  title: string;
  applicable: boolean;
  binding: "present" | "missing" | "unknown";
  schema: "accepted" | "rejected" | "unknown";
  consumption: "consumed" | "unconsumed" | "unknown";
  status: FindingStatus | "NOT_APPLICABLE";
  note: string;
};

export type DecisionManifest = {
  schemaVersion: string;
  disposition: Disposition;
  mergeAuthorization: "not-determined";
  blockingReasons: string[];
  reviewReasons: string[];
  warnings: string[];
  counts: {
    satisfied: number;
    violated: number;
    indeterminate: number;
  };
};

export type TransferCheck = {
  id: string;
  statement: string;
  holds: boolean;
  note: string;
};

export type SlicedFact = TruthFact & { inSlice: boolean };

export type DerivedDependency = {
  from: string;
  to: string;
  kind: EdgeKind;
  evidence: string;
  layer: Layer;
};

export type TruthGraph = {
  schemaVersion: string;
  subjectId: string;
  provenance: Provenance;
  capabilities: (Capability & { inSlice: boolean })[];
  facts: SlicedFact[];
  derivedDependencies: DerivedDependency[];
};

export type FactKindIndex = Record<FactKind, SlicedFact[]>;

export type PlannerFactPacket = {
  schemaVersion: string;
  product: "G.R.A.F.T.+";
  role: "fact-substrate";
  implementsPlan: false;
  mergeAuthorization: "not-determined";
  provenance: Provenance;
  subjectId: string;
  changedFiles: string[];
  unmappedChangedFiles: string[];
  sliceNodeIds: string[];
  byKind: FactKindIndex;
  derivedDependencies: DerivedDependency[];
  note: string;
};

export type PipelinePacket = {
  subjectId: string;
  changedFiles: string[];
  graph: GraftGraph;
  impact: ImpactReport;
  proof: ProofManifest;
  completeness: CompletenessReport;
  adjudication: AdjudicationRow[];
  decision: DecisionManifest;
  truth: TruthGraph;
  fingerprint: string;
};
