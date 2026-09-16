import { useEffect, useRef, useState } from "react";
import { buildGraftArchive } from "@/lib/product/artifact";
import { packetOf } from "@/lib/product/store";
import type { Project } from "@/lib/product/types";

export function CopyTrail({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const packet = packetOf(project);
  const archive = buildGraftArchive({
    packet,
    profile: project.profile,
    origin: project.origin,
    index: project.index,
    files: project.files,
  });

  useEffect(() => {
    if (!open) return;
    areaRef.current?.focus();
    areaRef.current?.select();
  }, [open, archive.markdown]);

  function download() {
    const copy = new Uint8Array(archive.zip.byteLength);
    copy.set(archive.zip);
    const blob = new Blob([copy], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = archive.filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={download}
        className="min-h-11 rounded-full bg-accent px-4 text-sm font-medium text-accent-fg"
      >
        Download pack
      </button>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-bg/80 p-4 sm:items-center">
          <div className="flex max-h-[90vh] w-full max-w-3xl min-w-0 flex-col rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium">{archive.filename}</p>
            <p className="mt-1 text-sm text-muted">
              Zip is the reconstruction pack: architecture decision, graph, completeness, impact, proof,
              receipt. No source dump. Feed the JSON to an AI. Leave this tab and the run is gone.
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
                onClick={download}
                className="min-h-11 rounded-full bg-accent px-4 text-sm font-medium text-accent-fg"
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
