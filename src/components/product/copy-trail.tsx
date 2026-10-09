import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/product/types";

type MaterializedArchive = {
  filename: string;
  markdown: string;
  zip: Uint8Array;
};

type ArchiveWorkerResponse =
  | {
      ok: true;
      filename: string;
      markdown: string;
      zip: ArrayBuffer;
    }
  | {
      ok: false;
      error: string;
    };

function triggerDownload(archive: MaterializedArchive) {
  const zipBuffer = archive.zip.buffer.slice(
    archive.zip.byteOffset,
    archive.zip.byteOffset + archive.zip.byteLength,
  ) as ArrayBuffer;
  const blob = new Blob([zipBuffer], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = archive.filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function CopyTrail({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const [archive, setArchive] = useState<MaterializedArchive | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    areaRef.current?.focus();
    areaRef.current?.select();
  }, [open, archive?.markdown]);

  async function download() {
    if (building) return;
    setError(null);

    let next = archive;
    if (!next) {
      setBuilding(true);
      try {
        next = await new Promise<MaterializedArchive>((resolve, reject) => {
          const worker = new Worker(new URL("../../lib/product/archive-worker.ts", import.meta.url), {
            type: "module",
          });
          workerRef.current = worker;

          worker.onmessage = (event: MessageEvent<ArchiveWorkerResponse>) => {
            worker.terminate();
            workerRef.current = null;
            if (!event.data.ok) {
              reject(new Error(event.data.error));
              return;
            }
            resolve({
              filename: event.data.filename,
              markdown: event.data.markdown,
              zip: new Uint8Array(event.data.zip),
            });
          };

          worker.onerror = (event) => {
            worker.terminate();
            workerRef.current = null;
            reject(new Error(event.message || "Could not build G.R.A.F.T.+ pack."));
          };

          worker.postMessage({
            profile: {
              name: project.profile.name,
              provenance: project.profile.provenance,
            },
            origin: project.origin,
            files: project.files.map(({ path, content, language }) => ({ path, content, language })),
          });
        });
        setArchive(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not build G.R.A.F.T.+ pack.");
        return;
      } finally {
        setBuilding(false);
      }
    }

    triggerDownload(next);
    setOpen(true);
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => void download()}
          disabled={building}
          className="min-h-11 rounded-full bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
        >
          {building ? "Building pack…" : "Download pack"}
        </button>
        {error ? <span className="max-w-xs text-right text-xs text-bad">{error}</span> : null}
      </div>
      {open && archive ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-bg/80 p-4 sm:items-center">
          <div className="flex max-h-[90vh] w-full max-w-3xl min-w-0 flex-col rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium">{archive.filename}</p>
            <p className="mt-1 text-sm text-muted">
              Zip is the fact pack: AI receiver guide, ASCII topology, JSON evidence graph, factual change set,
              completeness, unresolved ledger, and receipt. No source dump. Give the pack to an AI;
              G.R.A.F.T.+ does not make the architecture decision.
            </p>
            <textarea
              ref={areaRef}
              readOnly
              value={archive.markdown}
              className="mt-3 min-h-[50vh] w-full min-w-0 flex-1 rounded-md border border-border bg-bg p-3 font-mono text-xs leading-relaxed"
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void download()}
                disabled={building}
                className="min-h-11 rounded-full bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-60"
              >
                Download again
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-full border border-border px-4 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
