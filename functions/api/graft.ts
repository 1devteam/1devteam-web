interface Env {
  GRAFT_API_ORIGIN?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

const EXPOSED_HEADERS = [
  "content-disposition",
  "x-graft-checksum",
  "x-graft-subject-sha",
  "x-graft-node-count",
  "x-graft-edge-count",
] as const;

function json(status: number, payload: object): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function canonicalOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
      return null;
    }
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const origin = canonicalOrigin(context.env.GRAFT_API_ORIGIN);
  if (!origin) {
    return json(503, {
      error: "Canonical G.R.A.F.T.+ service is not configured.",
      code: "GRAFT_SERVICE_UNAVAILABLE",
    });
  }

  const contentType = context.request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json(415, { error: "Request must be application/json." });
  }

  const body = await context.request.arrayBuffer();
  if (body.byteLength > 8 * 1024) {
    return json(413, { error: "Request body is too large." });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${origin}/v1/reconstruct`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      redirect: "error",
    });
  } catch {
    return json(502, {
      error: "Canonical G.R.A.F.T.+ service could not be reached.",
      code: "GRAFT_SERVICE_UNREACHABLE",
    });
  }

  const headers = new Headers({ "cache-control": "no-store" });
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) headers.set("content-type", upstreamType);
  for (const name of EXPOSED_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}

export function onRequestGet(): Response {
  return json(405, { error: "Use POST /api/graft." });
}
