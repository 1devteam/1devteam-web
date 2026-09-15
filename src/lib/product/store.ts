import { create } from "zustand";
import { runPipeline } from "@/lib/graft/engine";
import type { Role, TestResult } from "./types.ts";
import type { DispatchAction, IngestedFile, Project, ProjectOrigin, ReviewResult, WorkspaceView } from "./types.ts";
import type { GithubCompare } from "./github.ts";
import { isoNow, slug, uid } from "./hash.ts";
import { prepareIngest } from "./ingest.ts";
import { applyOverlayReview } from "./overlay.ts";
import type { OverlayDraft } from "./overlay.ts";
import { applyGithubRefresh } from "./refresh.ts";
import { proposePlan } from "./planner.ts";
import { applyDispatch } from "./roles.ts";
import { applyEdit, initGit, openWorktree, recordBranch } from "./git.ts";
import { isolateFile } from "./secrets.ts";
import { languageOf } from "./paths.ts";
import { evidenceFromChecks, pickScreenshot, runChecks } from "./verify.ts";

export const VIEWS: { id: WorkspaceView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "ingest", label: "Files" },
  { id: "index", label: "Index" },
];

type ProductState = {
  projects: Record<string, Project>;
  hydrated: boolean;
  markHydrated: () => void;
  ensureSeeds: () => void;
  ingestCustom: (name: string, files: IngestedFile[], origin?: ProjectOrigin) => string;
  refreshProject: (id: string, files: IngestedFile[], origin: ProjectOrigin, compare?: GithubCompare | null) => boolean;
  reviewOverlay: (id: string, draft: OverlayDraft) => string | null;
  setChangedFiles: (id: string, files: string[]) => void;
  reindex: (id: string) => void;
  propose: (id: string) => void;
  dispatch: (id: string, taskId: string, action: DispatchAction, opts?: { role?: Role; reason?: string }) => string | null;
  coderEdit: (id: string, taskId: string, path: string, content: string) => void;
  addTest: (id: string, taskId: string, result: Omit<TestResult, "id" | "at">) => void;
  addReview: (id: string, taskId: string, result: Omit<ReviewResult, "id" | "at">) => void;
  verifyTask: (id: string, taskId?: string) => void;
  removeProject: (id: string) => void;
};

export function packetOf(project: Project) {
  const files = project.changedFiles.length ? project.changedFiles : project.profile.files.slice(0, 1);
  return runPipeline(project.profile, files);
}

function withActivity(
  project: Project,
  title: string,
  detail: string,
  actor: Project["activity"][number]["actor"] = "system",
): Project {
  return {
    ...project,
    updatedAt: isoNow(),
    activity: [
      {
        id: uid("act"),
        at: isoNow(),
        actor,
        title,
        detail,
        projectId: project.id,
      },
      ...project.activity,
    ].slice(0, 80),
  };
}

export function dropStaleProductStorage() {
  try {
    localStorage.removeItem("graft-plus-product-v1");
  } catch {
    // private mode or quota already blown
  }
}

export const useProductStore = create<ProductState>()((set, get) => ({
  projects: {},
  hydrated: false,
  markHydrated: () => set({ hydrated: true }),
  ensureSeeds: () => {
    const current = get().projects;
    const next: Record<string, Project> = {};
    let dropped = false;
    for (const [id, project] of Object.entries(current)) {
      const distilled = project.kind === "seeded" && project.origin?.kind !== "github";
      if (distilled) {
        dropped = true;
        continue;
      }
      next[id] = project;
    }
    if (dropped) set({ projects: next });
  },
  ingestCustom: (name, files, origin) => {
    const prepared = prepareIngest(name, files, {
      repoHint: origin?.url ?? origin?.repo ?? name,
      sha: origin?.sha,
      omitted: origin?.omitted,
      omittedPaths: origin?.omittedPaths,
      omittedNotes: origin?.omittedNotes,
      skippedRoots: origin?.skippedRoots,
      truncated: origin?.truncated,
    });
    const id = `${slug(name)}-${uid("p").slice(-6)}`;
    const changed = prepared.profile.files;
    const packet = runPipeline(
      prepared.profile,
      changed.length ? changed : [prepared.profile.files[0] ?? "README.md"],
    );
    const resolvedOrigin: ProjectOrigin = origin ?? {
      kind: "folder",
      repo: name,
      omitted: prepared.omitted,
    };
    const project: Project = {
      id,
      name,
      kind: "custom",
      createdAt: isoNow(),
      updatedAt: isoNow(),
      profile: prepared.profile,
      changedFiles: changed,
      files: prepared.files,
      index: prepared.index,
      plan: null,
      tasks: [],
      worktrees: [],
      git: initGit(prepared.files, origin?.sha ? { sha: origin.sha, branch: origin.ref ?? "HEAD" } : undefined),
      secrets: prepared.secrets,
      evidence: [],
      activity: [],
      lastPacketFingerprint: packet.fingerprint,
      lastDisposition: packet.decision.disposition,
      origin: { ...resolvedOrigin, omitted: resolvedOrigin.omitted ?? prepared.omitted },
    };
    const source =
      origin?.kind === "github"
        ? `${origin.owner}/${origin.repo}@${(origin.sha ?? "HEAD").slice(0, 8)}`
        : "folder";
    const ready = withActivity(
      project,
      origin?.kind === "github" ? "Mapped GitHub repository" : "Mapped folder",
      `${prepared.files.length} files, ${prepared.index.symbols.length} contracts, ${prepared.index.imports.length} imports from ${source}. Overlay unmodeled.${
        prepared.omitted ? ` ${prepared.omitted} files not ingested.` : ""
      } Session only — download the map before you leave.`,
      "ingest",
    );
    set({ projects: { ...get().projects, [id]: ready } });
    return id;
  },
  refreshProject: (id, files, origin, compare) => {
    const project = get().projects[id];
    if (!project) return false;
    const result = applyGithubRefresh(project, files, origin, compare);
    set({ projects: { ...get().projects, [id]: result.project } });
    return true;
  },
  reviewOverlay: (id, draft) => {
    const project = get().projects[id];
    if (!project) return "Project missing.";
    const reviewed = applyOverlayReview(project.profile, draft);
    if (reviewed.error) return reviewed.error;
    const packet = runPipeline(
      reviewed.profile,
      project.changedFiles.length ? project.changedFiles : [reviewed.profile.files[0] ?? "README.md"],
    );
    set({
      projects: {
        ...get().projects,
        [id]: withActivity(
          {
            ...project,
            profile: reviewed.profile,
            lastPacketFingerprint: packet.fingerprint,
            lastDisposition: packet.decision.disposition,
          },
          "Reviewed overlay attached",
          `${draft.edgeKind} ${draft.label}`,
        ),
      },
    });
    return null;
  },
  setChangedFiles: (id, files) => {
    const project = get().projects[id];
    if (!project) return;
    const packet = runPipeline(project.profile, files.length ? files : [project.profile.files[0] ?? "README.md"]);
    set({
      projects: {
        ...get().projects,
        [id]: {
          ...project,
          changedFiles: files,
          lastPacketFingerprint: packet.fingerprint,
          lastDisposition: packet.decision.disposition,
        },
      },
    });
  },
  reindex: (id) => {
    const project = get().projects[id];
    if (!project) return;
    const prepared = prepareIngest(project.name, project.files, {
      repoHint: project.origin?.url ?? project.profile.repoHint,
      sha: project.origin?.sha,
    });
    set({
      projects: {
        ...get().projects,
        [id]: withActivity(
          {
            ...project,
            files: prepared.files,
            index: prepared.index,
            secrets: prepared.secrets,
            git: { ...project.git, head: project.git.head },
          },
          "Reindexed",
          `${prepared.index.symbols.length} symbols`,
        ),
      },
    });
  },
  propose: (id) => {
    const project = get().projects[id];
    if (!project) return;
    const packet = packetOf(project);
    const { plan, tasks } = proposePlan(
      packet,
      project.plan ? { plan: project.plan, tasks: project.tasks } : undefined,
    );
    set({
      projects: {
        ...get().projects,
        [id]: withActivity(
          {
            ...project,
            plan,
            tasks,
            lastPacketFingerprint: packet.fingerprint,
            lastDisposition: packet.decision.disposition,
          },
          "Architect revised plan",
          plan.summary,
          "architect",
        ),
      },
    });
  },
  dispatch: (id, taskId, action, opts) => {
    const project = get().projects[id];
    if (!project) return "Project missing.";
    const task = project.tasks.find((item) => item.id === taskId);
    if (!task) return "Task missing.";
    const result = applyDispatch(task, action, { ...opts, tasks: project.tasks });
    if (!result.ok) return result.reason;
    let worktrees = project.worktrees;
    let git = project.git;
    if (action === "start") {
      const tree = openWorktree(result.task, project.files);
      worktrees = [...worktrees.filter((item) => item.taskId !== taskId), tree];
      git = recordBranch(git, tree);
    }
    const tasks = project.tasks.map((item) => (item.id === taskId ? result.task : item));
    set({
      projects: {
        ...get().projects,
        [id]: withActivity(
          { ...project, tasks, worktrees, git },
          `Dispatch ${action}`,
          `${task.title} → ${result.task.state}`,
          opts?.role ?? "dispatcher",
        ),
      },
    });
    return null;
  },
  coderEdit: (id, taskId, path, content) => {
    const project = get().projects[id];
    if (!project) return;
    const isolated = isolateFile({
      path,
      content,
      language: languageOf(path),
      size: content.length,
    });
    const worktrees = project.worktrees.map((tree) =>
      tree.taskId === taskId ? applyEdit(tree, path, isolated.file.content) : tree,
    );
    set({
      projects: {
        ...get().projects,
        [id]: withActivity(
          {
            ...project,
            worktrees,
            secrets: [...project.secrets, ...isolated.secrets],
          },
          "Coder edit",
          path,
          "coder",
        ),
      },
    });
  },
  addTest: (id, taskId, result) => {
    const project = get().projects[id];
    if (!project) return;
    const tasks = project.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            tests: [...task.tests, { ...result, id: uid("test"), at: isoNow() }],
          }
        : task,
    );
    set({
      projects: {
        ...get().projects,
        [id]: withActivity({ ...project, tasks }, "Test recorded", result.name, "reviewer"),
      },
    });
  },
  addReview: (id, taskId, result) => {
    const project = get().projects[id];
    if (!project) return;
    const tasks = project.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            reviews: [...task.reviews, { ...result, id: uid("rev"), at: isoNow() }],
          }
        : task,
    );
    set({
      projects: {
        ...get().projects,
        [id]: withActivity({ ...project, tasks }, "Review recorded", result.verdict, "reviewer"),
      },
    });
  },
  verifyTask: (id, taskId) => {
    const project = get().projects[id];
    if (!project) return;
    const task = taskId ? project.tasks.find((item) => item.id === taskId) : undefined;
    const packet = packetOf(project);
    const checks = runChecks(project, packet, task);
    const shot = pickScreenshot(project, task);
    const records = evidenceFromChecks(checks, taskId, shot);
    const tasks = project.tasks.map((item) =>
      item.id === taskId
        ? {
            ...item,
            evidenceIds: [...new Set([...item.evidenceIds, ...records.map((r) => r.id)])],
            acceptance: item.acceptance.map((a) => ({ ...a, satisfied: true })),
          }
        : item,
    );
    set({
      projects: {
        ...get().projects,
        [id]: withActivity(
          { ...project, tasks, evidence: [...records, ...project.evidence].slice(0, 60) },
          "Verification run",
          checks.map((c) => `${c.verdict} ${c.id}`).join(" · "),
          "reviewer",
        ),
      },
    });
  },
  removeProject: (id) => {
    const next = { ...get().projects };
    delete next[id];
    set({ projects: next });
  },
}));
