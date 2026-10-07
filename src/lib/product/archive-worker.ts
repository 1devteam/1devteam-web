/// <reference lib="webworker" />

import { buildGraftArchive } from "./artifact.ts";
import type { IngestedFile, ProjectOrigin } from "./types.ts";
import type { SubjectProfile } from "../graft/types.ts";

type ArchiveWorkerRequest = {
  profile: Pick<SubjectProfile, "name" | "provenance">;
  origin?: ProjectOrigin;
  files: Pick<IngestedFile, "path" | "content" | "language">[];
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

const workerScope = globalThis as unknown as DedicatedWorkerGlobalScope;

workerScope.onmessage = (event: MessageEvent<ArchiveWorkerRequest>) => {
  try {
    const archive = buildGraftArchive({
      profile: event.data.profile,
      origin: event.data.origin,
      files: event.data.files,
    });
    const zip = archive.zip.buffer.slice(
      archive.zip.byteOffset,
      archive.zip.byteOffset + archive.zip.byteLength,
    ) as ArrayBuffer;
    const response: ArchiveWorkerResponse = {
      ok: true,
      filename: archive.filename,
      markdown: archive.markdown,
      zip,
    };
    workerScope.postMessage(response, [zip]);
  } catch (error) {
    const response: ArchiveWorkerResponse = {
      ok: false,
      error: error instanceof Error ? error.message : "Could not build G.R.A.F.T.+ pack.",
    };
    workerScope.postMessage(response);
  }
};
