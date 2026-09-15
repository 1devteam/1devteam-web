# Public release status

**Reviewed:** September 13, 2026

## What is live

- The complete React site is routed and buildable; the former construction-only
  shell is removed.
- Search indexing is enabled and the sitemap covers every public route.
- `/robots.txt` is served by a Pages Function with no-store semantics so the
  retired construction policy cannot remain cached at the custom domain.
- Ajenda AI is presented as the flagship product and explicitly described as a
  private, locally operational development system—not a generally available
  hosted service.
- `/graft` is the public **G.R.A.F.T.+** workbench: paste a public GitHub
  repository, reconstruct one SHA, download one pack. `/wiki` serves the same
  workbench and canonicalizes to `/graft`. Dedicated `/wiki/:id` references
  remain. G.R.A.F.T.+ is a fact substrate: not a planner, not merge authority.
  Ajenda and Omnipath are derivation records, not this workbench.
  See [`GRAFT.md`](GRAFT.md).
- Official names are locked to G.R.A.F.T.+ and G.R.A.F.T.1st in public copy.
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
- The public G.R.A.F.T.+ page maps public GitHub repositories in the browser
  tab. The reconstruction is session-only. Overlay stays residual.
  Cloudflare Email Routing for hello@ and ajenda-ai@ is a zone setting, not a
  Pages build output.
- Add automated browser accessibility and route tests to CI.
