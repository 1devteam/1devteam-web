# Domain: 1devteam.com

**Registrar:** Northwest (unchanged — do not transfer)
**DNS + CDN + SSL + site delivery:** Cloudflare
**App hosting:** Cloudflare Pages project `1devteam`

## Model

```
Northwest (registrar only)
        │  nameservers only
        ▼
Cloudflare (authoritative DNS + proxy + SSL)
        │  custom domains
        ▼
Cloudflare Pages (static site from this repo)
```

You are **not** moving the domain registration. You only point Northwest at Cloudflare’s nameservers so Cloudflare can serve DNS and the website.

## Current state (pre-cutover)

Before cutover, apex and `www` resolved to Northwest-style hosting (WordPress / openresty). Cutover replaces that origin with Cloudflare Pages.

## One-time setup

### 1. Add the zone in Cloudflare (dashboard)

Wrangler OAuth in this environment can deploy Pages but **cannot create zones** (`zone.create` permission missing). Do this in the dashboard:

1. Open [Add a site](https://dash.cloudflare.com/?to=/:account/add-site)
2. Enter `1devteam.com`
3. Choose a plan (Free is fine)
4. Select **Full** DNS setup (recommended)
5. Cloudflare shows **two nameservers**, e.g. `*.ns.cloudflare.com`
   Copy both exactly.

Optional: during scan, remove or ignore old WordPress A records — Pages will own the apex and `www` after custom domains are attached.

### 2. At Northwest: change nameservers only

In Northwest domain management for `1devteam.com`:

1. Find **Nameservers** / **DNS servers** (not “transfer domain”, not “web hosting”)
2. Switch from Northwest defaults to **custom nameservers**
3. Set the two Cloudflare nameservers from step 1
4. Save

Leave the domain registered at Northwest. Do not initiate a registrar transfer.

Propagation: often minutes to a few hours; can take up to ~48h in edge cases.

### 3. Deploy this site to Pages

From the project root (already authenticated via `wrangler login` if needed):

```bash
npm run build
npm run deploy
```

Project name: `1devteam`
Production branch: `main`
Build output: `dist`

Temporary URL after first deploy: `https://1devteam.pages.dev`

### 4. Attach custom domains

After the zone is **Active** in Cloudflare:

**Dashboard path**

1. Workers & Pages → `1devteam` → Custom domains
2. Add `1devteam.com`
3. Add `www.1devteam.com`
4. Cloudflare creates DNS + issues SSL automatically

**CLI (after zone is active)**

```bash
npx wrangler pages domain add 1devteam.com --project-name 1devteam
npx wrangler pages domain add www.1devteam.com --project-name 1devteam
```

### 5. DNS records (target end state)

Managed in **Cloudflare DNS** for zone `1devteam.com` (not Northwest):

| Type  | Name | Content                         | Proxy |
|-------|------|----------------------------------|-------|
| CNAME | `@`  | `1devteam.pages.dev`             | Proxied (orange cloud) |
| CNAME | `www`| `1devteam.pages.dev`             | Proxied |

Apex CNAME works on Cloudflare via CNAME flattening. Prefer letting Pages custom-domain UI create these records.

Optional later:

| Type | Name   | Purpose        |
|------|--------|----------------|
| TXT  | `@`    | SPF / domain verification |
| MX   | `@`    | Email (if not using CF Email Routing) |
| CNAME| `www`  | already covered |

If you keep email at Northwest or another provider, **copy MX/TXT records into Cloudflare DNS before or immediately after nameserver cutover**, or mail will break.

### 6. HTTPS and www policy

- Cloudflare issues Universal SSL for the zone
- Always Use HTTPS: On
- Optional redirect rule: `www` → apex (or reverse) via Redirect Rules / Bulk Redirects

SPA routing is covered by `public/_redirects` (`/* → /index.html 200`).

## Verify cutover

```bash
# Nameservers should be Cloudflare
nslookup -type=NS 1devteam.com 1.1.1.1

# Site should be Cloudflare + new app (not WordPress)
curl -sI https://1devteam.com | head -20
```

Expect:

- `server: cloudflare`
- HTML from this React app (no `wp-json` links)
- Valid HTTPS

## Ongoing ops

| Action | Where |
|--------|--------|
| Renew domain | Northwest |
| Change DNS records | Cloudflare DNS |
| Deploy site | `npm run deploy` or Git-connected Pages |
| SSL / CDN / WAF | Cloudflare |
| Registrar contact/WHOIS | Northwest |

## Rollback

If something fails after NS cutover:

1. In Northwest, restore previous Northwest nameservers
2. Wait for DNS to re-point at old hosting

Or keep Cloudflare NS and point apex A/CNAME back to the old host IP temporarily.

## Email warning

If `1devteam.com` mail uses Northwest DNS today, export **MX, SPF, DKIM, DMARC** records before nameserver change and recreate them in Cloudflare DNS.
