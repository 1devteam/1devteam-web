# 1devteam Website

AI product studio and systems builder site for **1devteam** — evidence-forward, light-first, dual-path conversion (self-serve research + contact).

The public site intentionally distinguishes repository availability, local
operability, and production availability. Ajenda AI is the flagship and remains
in private development; recovered and archival projects are labeled as such.

**G.R.A.F.T.+** (Graph Reasoning for Architecture, Fidelity & Traceability) is
the public reconstruction workbench on [`/graft`](https://1devteam.com/graft).
Paste a public GitHub repository. It maps that SHA and returns one downloadable
pack. It is a fact substrate, not a planner and not merge authority.
See [`docs/GRAFT.md`](docs/GRAFT.md). `/wiki` serves the same workbench and
canonicalizes to `/graft`. Dedicated `/wiki/:id` references remain.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- shadcn-style components (Radix primitives)
- React Router
- MDX-ready content pipeline
- Cloudflare Pages hosting (`public/_redirects` SPA fallback)

## Scripts

```bash
npm install
npm run dev      # local development
npm run build    # typecheck + production build
npm run preview  # preview production build
npm run lint     # oxlint
npm test         # G.R.A.F.T.+ reconstruction coverage
```

The contact form opens a pre-filled message in the visitor's email client. It
does not display a false server-side delivery confirmation.

## Information architecture

| Route | Purpose |
|-------|---------|
| `/` | Homepage: hero → proof → build areas → Ajenda → work → R&D → method → insights → CTA |
| `/work` | Evidence & build journals |
| `/graft` | G.R.A.F.T.+ workbench: paste a public repo, download one pack |
| `/wiki` | Same workbench (canonical `/graft`) |
| `/wiki/:id` | Expanded technical references (PRIDE, Snapshot, graph, blast radius, …) |
| `/research` | First formal R&D program, study framing, G.R.A.F.T.+, and G.R.A.F.T.1st |
| `/services` | Custom client evaluation |
| `/enterprise` | Enterprise buyer landing |
| `/products` | Product portfolio |
| `/products/ajenda` | Flagship product |
| `/method` | How we work with AI |
| `/insights` | Authority / SEO content |
| `/about` | Company positioning |
| `/contact` | Short qualification form |
| `/privacy`, `/terms`, `/trust` | Footer legal & trust |

## Routine website edits

The site is intentionally organized so routine changes can be made safely by a coding assistant or LLM without searching the entire application.

- **Company links, contact addresses, social links, and logo paths:** `src/data/site.ts`
- **Company and Ajenda brand files:** `public/brand/`
- **R&D program and G.R.A.F.T.+ / G.R.A.F.T.1st descriptions:** `src/data/research.ts`
- **G.R.A.F.T.+ user guide copy:** `src/data/graftGuide.ts` (public page) and `docs/GRAFT.md` (repository)
- **G.R.A.F.T.+ reconstruction engine:** `src/lib/product/` and `src/lib/graft/`
- **Page-level copy and layout:** `src/pages/`
- **Homepage sections:** `src/components/home/`
- **Header and footer:** `src/components/layout/`

For a company-logo change, update the company logo files in `public/brand/` or change `siteConfig.brand.companyOnLight` / `companyOnDark` in `src/data/site.ts`. Header and footer both consume those centralized paths.

Official product names are locked: **G.R.A.F.T.+** (package `graft_plus`) and **G.R.A.F.T.1st**. Do not revive “Grafted Plus” / “Grafted First” in public copy.

## Mail

Public inboxes, both forward to `gabe.n.fat@outlook.com`:

- hello@1devteam.com
- ajenda-ai@1devteam.com

Repo contract: [`email-routing.json`](email-routing.json). Zone steps: [`docs/DOMAIN.md`](docs/DOMAIN.md). This site cannot set MX.

## Deployment

The production site is deployed by **Cloudflare Pages Git integration** from `1devteam/1devteam-web`, branch `main`, using `npm run build` with `dist` as the output directory. Pull requests should be used for controlled changes and preview review before merge. A merge to `main` is the production release path unless the deployment architecture is intentionally changed.

Historical Wrangler / Workers experiments in repository history are not the active production path and should not be treated as deployment authority. Manual production-deploy scripts are intentionally absent; reintroducing one requires a separate reviewed infrastructure change that also updates the deployment documentation.

## Design system

Tokens follow the evidence spec: light-first background, deep navy structure, brand blue `#145BFF`, restrained accent, 16–18px body, accessible focus states, 44px-class touch targets, `prefers-reduced-motion` support.

## Analytics hooks

Primary interactive elements carry `data-analytics` attributes for later wiring (Cloudflare Web Analytics + optional PostHog):

- `hero-primary-cta`, `hero-secondary-cta`
- `work-card-click`, `ajenda-cta`
- `research-page-visit`
- `contact-form-start`, `contact-form-complete`

## Domain

- **Domain:** [1devteam.com](https://1devteam.com)
- **Registrar:** Northwest (stays put — no transfer)
- **DNS + delivery:** Cloudflare
- **Pages project:** `1devteam` → https://1devteam-dgr.pages.dev

Full cutover steps (nameservers, custom domains, email caution): [`docs/DOMAIN.md`](docs/DOMAIN.md)

Current Git-connected production settings:

- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`
- Custom domains: `1devteam.com`, `www.1devteam.com`

## LinkedIn

A professional share for the live workbench, after this ships to `1devteam.com/graft`:

> 1DevTeam now publishes G.R.A.F.T.+ at 1devteam.com/graft.
>
> Paste a public GitHub repository. It reconstructs that SHA into one downloadable pack: inventory, contracts, dependencies, routes, wiring, and recent commits. Feed the pack to an AI. Unknowns become small follow-up questions.
>
> It does not plan. It does not merge. Overlay stays residual until it is evidenced.
>
> Contact: hello@1devteam.com · ajenda-ai@1devteam.com

Keep claims to what the page actually does. Do not advertise Ajenda as a hosted product or G.R.A.F.T.+ as a planner.

