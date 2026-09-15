import type { Disposition, PipelinePacket, SubjectProfile } from "@/lib/graft/types";
export type { Disposition, PipelinePacket, SubjectProfile };

export type Role = "architect" | "dispatcher" | "coder" | "reviewer";

export type TaskState =
  | "queued"
  | "running"
  | "paused"
  | "retrying"
  | "redirected"
  | "escalated"
  | "blocked"
  | "done"
  | "failed";

export type Language =
  | "python"
  | "javascript"
  | "typescript"
  | "go"
  | "rust"
  | "java"
  | "kotlin"
  | "ruby"
  | "php"
  | "csharp"
  | "swift"
  | "c"
  | "cpp"
  | "scala"
  | "elixir"
  | "lua"
  | "other";

export type IngestedFile = {
  path: string;
  content: string;
  language: Language;
  size: number;
};

export type IndexedSymbol = {
  id: string;
  name: string;
  kind: "function" | "class" | "const";
  path: string;
  line: number;
};

export type IndexedImport = {
  fromPath: string;
  specifier: string;
  resolvedPath?: string;
};

export type CallEdge = {
  callerSymbol: string;
  callerPath: string;
  calleeName: string;
  resolvedSymbolId?: string;
  resolvedPath?: string;
  line: number;
};

export type IndexedRoute = {
  path: string;
  method: string;
  route: string;
  line: number;
};

export type FileRecord = {
  path: string;
  language: Language;
  size: number;
  hash: string;
  lineCount: number;
  symbolCount: number;
};

export type ProjectIndex = {
  generatedAt: string;
  files: FileRecord[];
  symbols: IndexedSymbol[];
  imports: IndexedImport[];
  calls: CallEdge[];
  routes: IndexedRoute[];
};

export type Acceptance = {
  id: string;
  statement: string;
  satisfied: boolean;
};

export type TestResult = {
  id: string;
  name: string;
  verdict: "pass" | "fail" | "skip";
  detail: string;
  at: string;
};

export type ReviewResult = {
  id: string;
  reviewer: "reviewer" | "council";
  verdict: "approve" | "reject" | "hold";
  note: string;
  at: string;
};

export type Task = {
  id: string;
  phaseId: string;
  title: string;
  detail: string;
  role: Role;
  state: TaskState;
  retries: number;
  maxRetries: number;
  dependsOn: string[];
  files: string[];
  acceptance: Acceptance[];
  mustNotChange: string[];
  factIds: string[];
  findingIds: string[];
  worktreeId?: string;
  tests: TestResult[];
  reviews: ReviewResult[];
  evidenceIds: string[];
  blockedReason?: string;
  redirectedFrom?: Role;
  notes: string[];
};

export type Phase = {
  id: string;
  title: string;
  intent: string;
  taskIds: string[];
};

export type ProjectPlan = {
  version: number;
  proposedAt: string;
  proposedBy: "architect";
  summary: string;
  packetFingerprint: string;
  graftDisposition: Disposition;
  consumes: {
    product: "G.R.A.F.T.+";
    role: "fact-substrate";
    implementsPlan: false;
    mergeAuthorization: "not-determined";
  };
  phases: Phase[];
};

export type Worktree = {
  id: string;
  taskId: string;
  branch: string;
  createdAt: string;
  files: Record<string, string>;
  diffs: { path: string; before: string; after: string }[];
};

export type GitCommit = {
  sha: string;
  message: string;
  at: string;
  branch: string;
};

export type GitState = {
  head: string;
  branch: string;
  commits: GitCommit[];
  branches: { name: string; sha: string; taskId?: string }[];
};

export type SecretKind = "api-key" | "token" | "pem" | "password" | "bearer";

export type SecretRecord = {
  id: string;
  fingerprint: string;
  kind: SecretKind;
  path: string;
  line: number;
  redacted: string;
};

export type EvidenceKind = "screenshot" | "in-app-check" | "unit-test" | "review";

export type EvidenceRecord = {
  id: string;
  taskId?: string;
  kind: EvidenceKind;
  path?: string;
  label: string;
  verdict: "pass" | "fail" | "indeterminate";
  note: string;
  at: string;
};

export type ActivityEvent = {
  id: string;
  at: string;
  actor: Role | "system" | "ingest";
  title: string;
  detail: string;
  projectId: string;
};

export type ProjectKind = "seeded" | "custom";

export type RefreshDelta = {
  capturedAt: string;
  fromSha?: string;
  toSha?: string;
  source: "github-compare" | "ingested-tree";
  added: string[];
  removed: string[];
  changed: string[];
  unchanged: number;
  nodesAdded: string[];
  nodesDropped: string[];
  truncated?: boolean;
  compareUrl?: string;
  omitted?: number;
  omittedPaths?: string[];
  subtree?: string;
};

export type ProjectOrigin = {
  kind: "github" | "folder" | "seeded";
  owner?: string;
  repo?: string;
  ref?: string;
  sha?: string;
  url?: string;
  subtree?: string;
  truncated?: boolean;
  omitted?: number;
  omittedPaths?: string[];
  omittedNotes?: string[];
  skippedRoots?: string[];
  recentCommits?: string[];
  readOnly?: true;
};

export type Project = {
  id: string;
  name: string;
  kind: ProjectKind;
  seedKey?: "ajenda" | "omnipath";
  createdAt: string;
  updatedAt: string;
  profile: SubjectProfile;
  changedFiles: string[];
  files: IngestedFile[];
  index: ProjectIndex;
  plan: ProjectPlan | null;
  tasks: Task[];
  worktrees: Worktree[];
  git: GitState;
  secrets: SecretRecord[];
  evidence: EvidenceRecord[];
  activity: ActivityEvent[];
  lastPacketFingerprint?: string;
  lastDisposition?: Disposition;
  origin?: ProjectOrigin;
  lastDelta?: RefreshDelta;
};

export type MergeGate = {
  mergeAuthorization: "not-determined";
  graftDisposition: Disposition;
  humanMergeEligible: boolean;
  reason: string;
};

export type DispatchAction =
  | "start"
  | "pause"
  | "retry"
  | "redirect"
  | "escalate"
  | "block"
  | "fail"
  | "complete"
  | "requeue";

export type WorkspaceView =
  | "overview"
  | "ingest"
  | "index"
  | "truth"
  | "plan"
  | "roles"
  | "verify"
  | "git"
  | "secrets";

export type PacketSnapshot = {
  fingerprint: string;
  disposition: Disposition;
  packet: PipelinePacket;
};
