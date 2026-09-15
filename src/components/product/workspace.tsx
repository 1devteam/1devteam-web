import { useState } from "react";
import { Link } from "react-router-dom";
import { IndexPane, IngestPane } from "@/components/product/ops-panes";
import { OverviewPane } from "@/components/product/overview-pane";
import { Chip } from "@/components/product/ui";
import { useProductStore, VIEWS } from "@/lib/product/store";
import type { WorkspaceView } from "@/lib/product/types";
import { cn } from "@/lib/utils";
import { RevisionStrip } from "@/components/graft/revision-strip";
import { CopyTrail } from "@/components/product/copy-trail";

export function Workspace({ projectId }: { projectId: string }) {
  const project = useProductStore((s) => s.projects[projectId]);
  const [view, setView] = useState<WorkspaceView>("overview");

  if (!project) {
    return (
      <div className="container-site py-16">
        <h1 className="text-2xl font-medium">Map not in this tab</h1>
        <p className="mt-2 text-muted">Paste the repository again. The reconstruction is not saved across refresh.</p>
        <Link to="/graft" className="mt-6 inline-flex min-h-11 items-center text-sm font-medium">
          Map another repository
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-x-hidden">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Link to="/graft" className="font-mono text-xs text-subtle">
                ← Map another repository
              </Link>
              <h1 className="mt-1 text-3xl font-medium tracking-tight">{project.name}</h1>
              <div className="mt-1">
                <RevisionStrip profile={project.profile} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CopyTrail project={project} />
              <Chip>{project.profile.files.length} files</Chip>
              {project.origin?.omitted ? <Chip>{project.origin.omitted} not ingested</Chip> : null}
            </div>
          </div>
          <nav className="-mx-1 flex max-w-full gap-1 overflow-x-auto pb-1" aria-label="Project views">
            {VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={cn(
                  "min-h-11 shrink-0 rounded-full px-4 text-sm font-medium",
                  view === item.id ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="mx-auto min-w-0 max-w-7xl px-4 py-6 sm:px-6">
        {view === "overview" ? <OverviewPane project={project} /> : null}
        {view === "ingest" ? <IngestPane project={project} /> : null}
        {view === "index" ? <IndexPane project={project} /> : null}
      </div>
    </div>
  );
}
