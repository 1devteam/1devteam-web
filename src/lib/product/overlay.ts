import type { EdgeKind, GraftNode, NodeKind, SubjectProfile, TruthFact } from "../graft/types.ts";
import { slug } from "./hash.ts";

export const OVERLAY_KINDS = [
  { id: "state_resource", edge: "state_ownership", domain: "runtime", label: "State ownership" },
  { id: "network_egress", edge: "egress_authority", domain: "egress", label: "Egress authority" },
  { id: "security_boundary", edge: "tenant_data_boundary", domain: "authority", label: "Tenant data boundary" },
  { id: "runtime_boundary", edge: "calls", domain: "authority", label: "Runtime boundary" },
  { id: "saga", edge: "owns", domain: "runtime", label: "Saga" },
  { id: "policy", edge: "owns", domain: "authority", label: "Policy" },
  { id: "agent", edge: "owns", domain: "runtime", label: "Agent" },
  { id: "business_job", edge: "owns", domain: "runtime", label: "Business job" },
] as const;

export type OverlayDraft = {
  fromId: string;
  kind: NodeKind;
  edgeKind: EdgeKind;
  label: string;
  evidencePath: string;
  domain: string;
};

export function overlayNodeId(fromId: string, kind: string, label: string) {
  return `ov:${slug(fromId)}:${slug(kind)}:${slug(label)}`.slice(0, 80);
}

export function hasReviewedOverlay(profile: Pick<SubjectProfile, "capabilities" | "nodes">) {
  return (
    profile.capabilities.some((item) => item.id === "reviewed-overlay") ||
    profile.nodes.some((node) => node.id.startsWith("ov:"))
  );
}

export function overlayPreset(kind: NodeKind) {
  return OVERLAY_KINDS.find((item) => item.id === kind) ?? OVERLAY_KINDS[0];
}

export function applyOverlayReview(
  profile: SubjectProfile,
  draft: OverlayDraft,
): { profile: SubjectProfile; error?: string; node: GraftNode | null } {
  const from = profile.nodes.find((node) => node.id === draft.fromId);
  if (!from) return { profile, error: "Select a node to review from.", node: null };
  const label = draft.label.trim() || overlayPreset(draft.kind).label;
  const evidencePath = draft.evidencePath.trim() || from.source;
  if (!evidencePath) return { profile, error: "Evidence path is required.", node: null };
  const id = overlayNodeId(from.id, draft.kind, label);
  if (profile.nodes.some((node) => node.id === id)) {
    return { profile, error: "That overlay is already attached.", node: null };
  }

  const node: GraftNode = {
    id,
    kind: draft.kind,
    label,
    source: evidencePath,
    layer: "overlay",
    domain: draft.domain || overlayPreset(draft.kind).domain,
    notes: "Reviewed overlay. Not proof of behavioral consumption.",
  };
  const edge = {
    from: from.id,
    to: id,
    kind: draft.edgeKind,
    evidence: evidencePath,
    layer: "overlay" as const,
  };
  const fact: TruthFact = {
    id: `OV-own-${id}`,
    capability: "reviewed-overlay",
    kind: "ownership",
    claim: `${from.id} has a reviewed ${draft.edgeKind} overlay on ${label}. Consumption is not proven.`,
    nodes: [from.id, id],
    owner: from.id,
    evidence: [
      {
        path: evidencePath,
        note: "Human-reviewed overlay. Refresh keeps it. Missing source stays INDETERMINATE.",
        proofClass: "unproven",
      },
    ],
  };
  const finding = {
    id: `OV-${id}`,
    title: `Reviewed overlay ${label} is bound, consumption open`,
    detail: `${from.id} → ${id} (${draft.edgeKind}) is reviewed overlay at ${evidencePath}. Schema-valid binding is not proof of behavioral consumption.`,
    relatedNodes: [from.id, id],
    blocking: false,
    proofMode: "open" as const,
    expectedBinding: { from: from.id, to: id, kind: draft.edgeKind },
    schemaTargetKind: draft.kind,
  };
  const overlayIds = [...profile.nodes.filter((item) => item.layer === "overlay").map((item) => item.id), id];
  const reviewedCap = {
    id: "reviewed-overlay",
    label: "Reviewed overlay",
    intent: "Human-reviewed overlay. Refresh preserves it. Not a planner. Not merge authority.",
    nodes: overlayIds,
  };
  const capabilities = [
    ...profile.capabilities.filter((item) => item.id !== "reviewed-overlay"),
    reviewedCap,
  ];
  const next: SubjectProfile = {
    ...profile,
    nodes: [...profile.nodes, node],
    edges: [...profile.edges, edge],
    facts: [
      ...profile.facts.filter((item) => !item.id.startsWith("ING-neg-overlay")),
      fact,
    ],
    findings: [...profile.findings.filter((item) => item.id !== finding.id), finding],
    capabilities,
  };
  return { profile: next, node };
}
