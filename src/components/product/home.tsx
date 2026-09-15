import { RepoForm } from "@/components/product/repo-form";
import { useProductStore } from "@/lib/product/store";

export function GraftReconstruct() {
  const projects = useProductStore((s) => s.projects);
  const openProject = useProductStore((s) => s.openProject);
  const list = Object.values(projects).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <section id="reconstruct" className="scroll-mt-24 border-b border-border">
      <div className="container-site max-w-3xl py-12 sm:py-16">
        <p className="mt-3 max-w-2xl text-pretty text-sm text-muted">
          The map lives in this tab until you download it or leave. Run it again on the same SHA
          for the same facts.
        </p>
        <div className="mt-8">
          <RepoForm onOpened={(id) => openProject(id)} />
        </div>
        {list.length ? (
          <div className="mt-10">
            <h2 className="text-lg font-medium">This tab</h2>
            <ul className="mt-3 space-y-2">
              {list.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => openProject(project.id)}
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {project.origin?.kind === "github"
                      ? `${project.origin.owner}/${project.origin.repo}`
                      : project.name}
                  </button>
                  <span className="ml-2 font-mono text-xs text-subtle">
                    {project.profile.files.length} files
                    {project.origin?.omitted ? ` · ${project.origin.omitted} not ingested` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-lg font-medium">What is proven here</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Public GitHub repositories reconstruct without a token.</li>
            <li>Every ingested path, contract, and resolved inner dependency is a fact, not a sample.</li>
            <li>Files GitHub will not return, or that exceed the text size limit, are named on the map.</li>
            <li>The download is one zip: map, JSON pack, and the ingested tree. An AI can answer from that pack.</li>
          </ul>
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-medium">What is not claimed</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>This is not a planner and not merge authority.</li>
            <li>Ajenda and Omnipath are derivation records, not this workbench.</li>
            <li>Skip directories such as node_modules and .git are not source.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
