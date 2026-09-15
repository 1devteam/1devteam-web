import { RefreshGithub } from "@/components/product/refresh-github";
import { Panel } from "@/components/product/ui";
import type { Project } from "@/lib/product/types";

export function OverviewPane({ project }: { project: Project }) {
  const contracts = project.profile.facts.filter((f) => f.kind === "contract").length;
  const deps = project.profile.facts.filter((f) => f.kind === "dependency").length;
  return (
    <div className="grid min-w-0 gap-4">
      <RefreshGithub project={project} />
      <Panel kicker="MAP" title="This reconstruction">
        <p className="font-mono text-xs text-subtle">
          {project.origin?.kind === "github"
            ? `${project.origin.owner}/${project.origin.repo}@${(project.origin.sha ?? "HEAD").slice(0, 12)}`
            : project.name}
          {project.origin?.omitted ? ` · ${project.origin.omitted} not ingested` : ""}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm tabular-nums sm:grid-cols-4">
          <div>
            <dt className="text-xs text-subtle">Files</dt>
            <dd>{project.profile.files.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Contracts</dt>
            <dd>{contracts}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Dependencies</dt>
            <dd>{deps}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">Routes</dt>
            <dd>{project.index.routes.length}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-muted">
          Download the pack and feed GRAFT-MAP.md or GRAFT-PACK.json to an AI. Source is in the zip.
          Overlay is residual. This tab is not a planner.
        </p>
      </Panel>
    </div>
  );
}
