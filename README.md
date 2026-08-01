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
| `/` | Homepage: hero → proof → build areas → Ajenda → work → method → insights → CTA |
| `/work` | Evidence & build journals |
| `/services` | Custom client evaluation |
| `/products` | Product portfolio |
| `/products/ajenda` | Flagship product |
| `/method` | How we work with AI |
| `/insights` | Authority / SEO content |
| `/about` | Company positioning |
| `/contact` | Short qualification form |
| `/privacy`, `/terms`, `/trust` | Footer legal & trust |

## Design system

Tokens follow the evidence spec: light-first background, deep navy structure, brand blue `#145BFF`, restrained accent, 16–18px body, accessible focus states, 44px-class touch targets, `prefers-reduced-motion` support.

## Analytics hooks

Primary interactive elements carry `data-analytics` attributes for later wiring (Cloudflare Web Analytics + optional PostHog):

- `hero-primary-cta`, `hero-secondary-cta`
- `work-card-click`, `ajenda-cta`
- `contact-form-start`, `contact-form-complete`

## Domain

- **Domain:** [1devteam.com](https://1devteam.com)
- **Registrar:** Northwest (stays put — no transfer)
- **DNS + delivery:** Cloudflare
- **Pages project:** `1devteam` → https://1devteam.pages.dev

Full cutover steps (nameservers, custom domains, email caution): [`docs/DOMAIN.md`](docs/DOMAIN.md)

```bash
npm run deploy          # production branch deploy to Pages
npm run deploy:preview  # preview deployment
```

Git-connected option (optional): Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Node version: see `.nvmrc`
- Custom domains: `1devteam.com`, `www.1devteam.com` (after zone is Active)
