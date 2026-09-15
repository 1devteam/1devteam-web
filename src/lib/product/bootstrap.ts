import { runPipeline } from "@/lib/graft/engine";
import { AJENDA, OMNIPATH } from "@/lib/graft/subjects";
import type { SubjectProfile } from "@/lib/graft/types";
import { isoNow } from "./hash.ts";
import { filesFromTextMap } from "./ingest.ts";
import { indexFiles } from "./indexer.ts";
import { proposePlan } from "./planner.ts";
import { initGit } from "./git.ts";
import { isolateFiles } from "./secrets.ts";
import { AJENDA_SOURCE, OMNIPATH_SOURCE } from "./seeds.ts";
import { evidenceFromChecks, pickScreenshot, runChecks } from "./verify.ts";
import type { ActivityEvent, Project } from "./types.ts";

function act(projectId: string, title: string, detail: string, actor: ActivityEvent["actor"] = "system"): ActivityEvent {
  return {
    id: `act-${title.replace(/\s+/g, "-").slice(0, 24)}-${projectId}`,
    at: isoNow(),
    actor,
    title,
    detail,
    projectId,
  };
}

function buildSeeded(
  profile: SubjectProfile,
  source: Record<string, string>,
  changedFiles: string[],
): Project {
  const isolated = isolateFiles(filesFromTextMap(source));
  const index = indexFiles(isolated.files);
  const packet = runPipeline(profile, changedFiles);
  const { plan, tasks } = proposePlan(packet);
  const project: Project = {
    id: profile.id,
    name: profile.name,
    kind: "seeded",
    seedKey: profile.id === "ajenda" ? "ajenda" : "omnipath",
    createdAt: isoNow(),
    updatedAt: isoNow(),
    profile,
    changedFiles,
    files: isolated.files,
    index,
    plan,
    tasks,
    worktrees: [],
    git: initGit(isolated.files),
    secrets: isolated.secrets,
    evidence: [],
    activity: [],
    lastPacketFingerprint: packet.fingerprint,
    lastDisposition: packet.decision.disposition,
    origin: { kind: "seeded", repo: profile.repoHint, sha: profile.provenance.sha, ref: profile.provenance.ref, readOnly: true },
  };
  const shot = pickScreenshot(project, tasks.find((t) => t.id === "t-ver-browser"));
  const checks = runChecks(project, packet);
  project.evidence = evidenceFromChecks(checks, "t-ver-browser", shot);
  project.activity = [
    act(project.id, "Ingested seeded source", `${isolated.files.length} files. Secrets isolated by fingerprint.`),
    act(project.id, "Indexed symbols", `${index.symbols.length} symbols, ${index.imports.length} imports, ${index.calls.length} calls.`),
    act(project.id, "Architect proposed plan", plan.summary, "architect"),
    act(project.id, "G.R.A.F.T.+ packet", `fp ${packet.fingerprint} · ${packet.decision.disposition}`),
  ];
  if (isolated.secrets.length) {
    project.activity.push(
      act(
        project.id,
        "Secrets isolated",
        `${isolated.secrets.length} secret(s) fingerprinted. Plaintext removed from durable files.`,
      ),
    );
  }
  return project;
}

export function seedProjects(): Record<string, Project> {
  return {
    ajenda: buildSeeded(AJENDA, AJENDA_SOURCE, ["backend/services/lease.py"]),
    omnipath: buildSeeded(OMNIPATH, OMNIPATH_SOURCE, ["backend/agents/factory/agent_factory.py"]),
  };
}
