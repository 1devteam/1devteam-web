# 1devteam Website

AI product studio and systems builder site for **1devteam** — evidence-forward, light-first, dual-path conversion (self-serve research + contact).

The public site intentionally distinguishes repository availability, local
operability, and production availability. Ajenda AI is the flagship and remains
in private development; recovered and archival projects are labeled as such.

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
```

The contact form opens a pre-filled message in the visitor's email client. It
does not display a false server-side delivery confirmation.

## Information architecture

| Route | Purpose |
|-------|---------|
| `/` | Homepage: hero → proof → build areas → Ajenda → work → R&D → method → insights → CTA |
| `/work` | Evidence & build journals |
| `/research` | First formal R&D program, study framing, Grafted Plus, and Grafted First |
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
- **R&D program and Grafted Plus / Grafted First descriptions:** `src/data/research.ts`
- **Page-level copy and layout:** `src/pages/`
- **Homepage sections:** `src/components/home/`
- **Header and footer:** `src/components/layout/`

For a company-logo change, update the company logo files in `public/brand/` or change `siteConfig.brand.companyOnLight` / `companyOnDark` in `src/data/site.ts`. Header and footer both consume those centralized paths.

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
