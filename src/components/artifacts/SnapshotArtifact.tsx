const publicSafeExcerpt = `{
  "schema_version": "10.0",
  "timestamp": "2026-08-27T16:47:33.236486+00:00",
  "project": "ajenda-ai",
  "git_context": {
    "branch": "fix/mission-clause-segmentation-clean",
    "head": "16abe55",
    "uncommitted_files": []
  },
  "summary": {
    "files": 1376,
    "routes_static": 2451,
    "py_errors": 0,
    "uncommitted_files": 0
  },
  "dependency_graph": "[964 indexed entries omitted]",
  "config_files": "[41 indexed files omitted]",
  "docs_summary": "[110 records omitted]",
  "ci_cd_info": "[10 records omitted]",
  "files_static": "[1376 file records omitted]"
}`

export function SnapshotArtifact() {
  return (
    <figure className="min-w-0">
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[#173f79] shadow-sm">
        <img
          src="/artifacts/snapshot-v10.svg"
          alt="Snapshot v10 execution in the Ajenda development shell"
          loading="lazy"
          decoding="async"
          className="block w-full"
        />
        <figcaption className="border-t border-white/10 bg-[#0a1120] px-5 py-4 text-sm leading-relaxed text-slate-200">
          <strong className="text-white">Snapshot v10.0 · execution artifact.</strong>{' '}
          Executed against Ajenda. The public derivative preserves recorded run values while redacting local filesystem paths.
        </figcaption>
      </div>

      <details className="group mt-4 border-y border-[var(--border)] py-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--brand)] marker:hidden">
          Inspect public-safe JSON excerpt <span aria-hidden className="inline-block transition-transform group-open:rotate-90">→</span>
        </summary>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          This excerpt preserves actual Snapshot v10 field names and verified values from the captured run. Large or sensitive values are summarized rather than reproduced: local paths, environment values, configuration contents, and the full repository inventory remain omitted.
        </p>
        <pre className="mt-4 max-h-[30rem] overflow-auto rounded-[var(--radius-sm)] border border-[var(--border)] bg-[#0a1120] p-5 text-xs leading-relaxed text-slate-100">
          <code>{publicSafeExcerpt}</code>
        </pre>
      </details>
    </figure>
  )
}
