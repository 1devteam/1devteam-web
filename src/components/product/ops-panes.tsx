import { useMemo, useState } from "react";
import { callersOf, calleesOf } from "@/lib/product/indexer";
import type { Project } from "@/lib/product/types";
import { Panel } from "@/components/product/ui";

export function IngestPane({ project }: { project: Project }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Panel kicker="FILES" title="Ingested tree">
        <p className="text-sm text-muted">
          Every ingested path for this SHA. Named misses stay on the pack. This tab is not stored
          across refresh.
        </p>
        <ul className="mt-4 max-h-[28rem] space-y-1 overflow-auto rounded-md border border-border bg-bg p-3">
          {project.files.map((file) => (
            <li key={file.path} className="flex justify-between gap-3 font-mono text-xs">
              <span className="min-w-0 truncate">{file.path}</span>
              <span className="shrink-0 text-subtle">{file.language}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <div className="space-y-4">
        <Panel kicker="PROVENANCE">
          <p className="text-sm">{project.profile.provenance.kind}</p>
          <p className="mt-2 font-mono text-xs text-subtle">{project.profile.provenance.repo}</p>
          {project.origin?.sha ? (
            <p className="mt-2 font-mono text-xs text-subtle">
              {project.origin.owner}/{project.origin.repo}@{project.origin.sha.slice(0, 12)}
              {project.origin.omitted ? ` · ${project.origin.omitted} omitted` : ""}
              {project.origin.truncated ? " · truncated" : ""}
              {project.origin.subtree ? ` · /${project.origin.subtree}` : ""}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-muted">{project.profile.provenance.note}</p>
        </Panel>
        {project.origin?.omittedPaths?.length ? (
          <Panel kicker="NAMED MISSES">
            <ul className="max-h-48 space-y-1 overflow-auto font-mono text-xs text-muted">
              {project.origin.omittedPaths.map((path) => (
                <li key={path}>{path}</li>
              ))}
            </ul>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

export function IndexPane({ project }: { project: Project }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(project.index.symbols[0]?.name ?? null);
  const symbols = useMemo(() => {
    const q = query.toLowerCase();
    return project.index.symbols.filter((s) => !q || s.name.toLowerCase().includes(q) || s.path.toLowerCase().includes(q));
  }, [project.index.symbols, query]);
  const callers = selected ? callersOf(project.index, selected) : [];
  const callees = selected ? calleesOf(project.index, selected) : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Panel kicker="SYMBOLS" title={`${project.index.symbols.length} indexed`}>
        <label className="block">
          <span className="text-xs text-subtle">Filter symbol or path</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter symbol or path"
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm"
          />
        </label>
        <ul className="mt-3 max-h-[28rem] space-y-1 overflow-auto">
          {symbols.slice(0, 80).map((symbol) => (
            <li key={symbol.id}>
              <button
                type="button"
                onClick={() => setSelected(symbol.name)}
                className="flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-sm hover:bg-elevated"
              >
                <span>
                  <span className="font-mono">{symbol.name}</span>
                  <span className="ml-2 text-xs text-subtle">{symbol.kind}</span>
                </span>
                <span className="truncate font-mono text-xs text-subtle">{symbol.path}</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
      <div className="space-y-4">
        <Panel kicker="IMPORTS" title={`${project.index.imports.length} edges`}>
          <ul className="max-h-40 space-y-2 overflow-auto font-mono text-xs text-muted">
            {project.index.imports.slice(0, 20).map((item, i) => (
              <li key={`${item.fromPath}-${item.specifier}-${i}`}>
                {item.fromPath.split("/").pop()} → {item.resolvedPath ?? `${item.specifier} (unresolved)`}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel kicker="CALL GRAPH" title={selected ?? "Select a symbol"}>
          <p className="text-xs text-subtle">Callers</p>
          <ul className="mt-2 space-y-1 font-mono text-xs text-muted">
            {callers.slice(0, 8).map((c, i) => (
              <li key={`${c.callerPath}-${i}`}>
                {c.callerSymbol} · {c.callerPath.split("/").pop()}
              </li>
            ))}
            {!callers.length ? <li>None resolved.</li> : null}
          </ul>
          <p className="mt-3 text-xs text-subtle">Callees</p>
          <ul className="mt-2 space-y-1 font-mono text-xs text-muted">
            {callees.slice(0, 8).map((c, i) => (
              <li key={`${c.calleeName}-${i}`}>
                {c.calleeName}
                {c.resolvedPath ? ` · ${c.resolvedPath.split("/").pop()}` : ""}
              </li>
            ))}
            {!callees.length ? <li>None resolved.</li> : null}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
