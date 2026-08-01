# Public release status

**Reviewed:** July 31, 2026

## What is live

- The complete React site is routed and buildable; the former construction-only
  shell is removed.
- Search indexing is enabled and the sitemap covers every public route.
- Ajenda AI is presented as the flagship product and explicitly described as a
  private, locally operational development system—not a generally available
  hosted service.
- OmniPath recovery projects and SweepstacX are described with their recovery or
  maturity limitations rather than implied production claims.
- The contact form opens a pre-filled message in the visitor's email client. It
  never reports server-side receipt because no server-side form service is
  configured.

## Verification

- `npm run lint` completes with one existing non-blocking Fast Refresh warning.
- `npm run build` passes TypeScript and Vite production compilation.
- Local production preview returns HTTP 200 for primary routes and SPA fallback.
- Cloudflare Pages serves `1devteam.com` and `www.1devteam.com` with HTTPS.

## Known limitations and future work

- Add a server-side contact endpoint only when delivery, abuse prevention,
  privacy handling, and monitoring are configured together.
- Replace research-style portfolio summaries with dated build journals and
  screenshots as public evidence becomes available.
- Add automated browser accessibility and route tests to CI.
- `npm audit --omit=dev` currently reports the React Router server-action/RSC
  advisory. This site is a client-only Vite SPA and does not implement React
  Server Components or React Router server actions; update when a compatible
  patched release is available and keep this rationale under review.
