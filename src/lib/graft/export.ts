import type { PipelinePacket } from "./types.ts";
import { factsForPlanner } from "./engine.ts";

export function packetArtifact(packet: PipelinePacket) {
  return {
    tool: "graft_plus",
    product: "G.R.A.F.T.+",
    expansion: "Graph Reasoning for Architecture, Fidelity & Traceability",
    schemaVersion: packet.graph.schemaVersion,
    truthSchemaVersion: packet.truth.schemaVersion,
    subjectId: packet.subjectId,
    changedFiles: packet.changedFiles,
    fingerprint: packet.fingerprint,
    mergeAuthorization: packet.decision.mergeAuthorization,
    graph: packet.graph,
    impact: packet.impact,
    proof: packet.proof,
    completeness: packet.completeness,
    adjudication: packet.adjudication,
    decision: packet.decision,
    truth: packet.truth,
    plannerInput: factsForPlanner(packet),
  };
}

function saveJson(name: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPacket(packet: PipelinePacket) {
  const artifact = packetArtifact(packet);
  saveJson(`graft-plus-${packet.subjectId}-${packet.fingerprint}.json`, artifact);
}

export function downloadFacts(packet: PipelinePacket) {
  const facts = factsForPlanner(packet);
  saveJson(`graft-plus-facts-${packet.subjectId}-${packet.fingerprint}.json`, facts);
}
