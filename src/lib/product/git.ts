import type { PipelinePacket } from "@/lib/graft/types";
import { fingerprint, isoNow } from "./hash.ts";
import type { GitState, IngestedFile, MergeGate, Task, Worktree } from "./types.ts";

export function filesHash(files: IngestedFile[]): string {
  return fingerprint(files.map((f) => `${f.path}:${fingerprint(f.content)}`).join("|"));
}

export function initGit(files: IngestedFile[], origin?: { sha?: string; branch?: string }): GitState {
  const sha = origin?.sha ?? filesHash(files);
  const branch = origin?.branch ?? "main";
  return {
    head: sha,
    branch,
    commits: [
      {
        sha,
        message: origin?.sha ? `HEAD = ${origin.sha.slice(0, 12)}` : "HEAD = ingest snapshot",
        at: isoNow(),
        branch,
      },
    ],
    branches: [{ name: branch, sha }],
  };
}

export function openWorktree(task: Task, files: IngestedFile[]): Worktree {
  const map: Record<string, string> = {};
  for (const file of files) {
    if (!task.files.length || task.files.includes(file.path)) {
      map[file.path] = file.content;
    }
  }
  if (!Object.keys(map).length) {
    for (const file of files) map[file.path] = file.content;
  }
  return {
    id: `wt-${task.id}`,
    taskId: task.id,
    branch: `graft/task-${task.id}`,
    createdAt: isoNow(),
    files: map,
    diffs: [],
  };
}

export function applyEdit(tree: Worktree, path: string, after: string): Worktree {
  const before = tree.files[path] ?? "";
  if (before === after) return tree;
  const diffs = tree.diffs.filter((d) => d.path !== path);
  diffs.push({ path, before, after });
  return {
    ...tree,
    files: { ...tree.files, [path]: after },
    diffs,
  };
}

export function unifiedDiff(before: string, after: string, path: string): string {
  const a = before.split("\n");
  const b = after.split("\n");
  const lines = [`--- a/${path}`, `+++ b/${path}`];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) {
    if (a[i] === b[i]) continue;
    if (a[i] !== undefined) lines.push(`-${a[i]}`);
    if (b[i] !== undefined) lines.push(`+${b[i]}`);
  }
  return lines.join("\n");
}

export function mergeGate(packet: PipelinePacket): MergeGate {
  return {
    mergeAuthorization: "not-determined",
    graftDisposition: packet.decision.disposition,
    humanMergeEligible: packet.decision.disposition === "clear",
    reason:
      packet.decision.disposition === "clear"
        ? "Graft disposition is clear. Merge authorization remains not-determined — record a human merge outside this product."
        : `Graft disposition is ${packet.decision.disposition}. Merge stays not-determined.`,
  };
}

export function recordBranch(git: GitState, tree: Worktree): GitState {
  const sha = fingerprint(tree.files);
  const branches = git.branches.filter((b) => b.name !== tree.branch);
  branches.push({ name: tree.branch, sha, taskId: tree.taskId });
  const commits = [
    {
      sha,
      message: `worktree ${tree.branch}`,
      at: isoNow(),
      branch: tree.branch,
    },
    ...git.commits,
  ].slice(0, 40);
  return { ...git, branches, commits };
}
