# Domain: 1devteam.com

**Registrar:** Northwest (unchanged — do not transfer)
**Authoritative DNS + CDN + SSL:** Cloudflare
**App hosting:** Cloudflare Pages project `1devteam`
**Production source:** `1devteam/1devteam-web`, branch `main`

## Current delivery model

```
Northwest (registrar only)
        │  nameservers
        ▼
Cloudflare (authoritative DNS + proxy + SSL)
        │  custom domains
        ▼
Cloudflare Pages Git integration
        │  source: 1devteam/1devteam-web @ main
        │  build: npm run build
        │  output: dist
        ▼
1devteam.com / www.1devteam.com
```

The domain remains registered at Northwest. Cloudflare is authoritative for DNS and website delivery.

## Production deployment authority

Production deployment is controlled by the **Cloudflare Pages Git integration**. A reviewed merge to `main` is the normal production release path.

Current settings:

- Repository: `1devteam/1devteam-web`
- Production branch: `main`
- Build command: `npm run build`
- Build output: `dist`
- Pages project: `1devteam`
- Pages URL: `https://1devteam-dgr.pages.dev`
- Custom domains: `1devteam.com`, `www.1devteam.com`

Do **not** treat local Wrangler commands or historical Workers-oriented deployment instructions as production release authority. If the deployment architecture changes, make that a separate reviewed infrastructure change and update this document and the repository README together.

## DNS and custom-domain administration

DNS records are administered in Cloudflare for the `1devteam.com` zone. Domain registration remains at Northwest.

For custom-domain changes, use the Cloudflare dashboard for the `1devteam` Pages project. Prefer Pages-managed custom-domain records instead of manually reproducing an assumed DNS target.

If email is hosted by Northwest or another provider, preserve the required MX, SPF, DKIM, DMARC, and verification records when changing DNS. Website changes must not disturb mail routing.

## HTTPS and canonical-host policy

- Cloudflare terminates HTTPS for the site.
- Keep HTTPS enforcement enabled.
- If a canonical-host redirect between apex and `www` is desired, configure it deliberately in Cloudflare and verify both hosts afterward.
- SPA routing is provided by the repository's Cloudflare Pages routing/fallback configuration; do not replace that behavior as part of an unrelated domain change.

## Release verification

After a production merge, verify both deployment provenance and live behavior:

1. Confirm the successful Cloudflare Pages production deployment is sourced from the expected merged `main` commit.
2. Confirm `https://1devteam.com` and `https://www.1devteam.com` serve valid HTTPS.
3. Confirm the expected site content is live on the routes changed by the release.
4. Confirm DNS/email behavior remains intact when the release included domain or DNS changes.

Useful network checks when needed:

```bash
nslookup -type=NS 1devteam.com 1.1.1.1
curl -sI https://1devteam.com | head -20
```

## Ongoing operations

| Action | Authority |
|--------|-----------|
| Renew domain | Northwest |
| Change authoritative DNS records | Cloudflare DNS |
| Release website | Reviewed merge to `main` → Cloudflare Pages Git integration |
| Review branch deployment | Cloudflare Pages preview generated from the PR branch |
| SSL / CDN / WAF | Cloudflare |
| Registrar contact / WHOIS | Northwest |

## Rollback

For an application regression, correct or revert the website change through the repository and let Cloudflare Pages deploy the corrected `main` state. Do not change nameservers to roll back an ordinary application release.

For a DNS-specific incident, restore the last known-good Cloudflare DNS configuration. Registrar nameserver changes are a higher-impact recovery action and should be used only when the Cloudflare zone itself must be abandoned or replaced.

## Historical cutover note

Earlier setup instructions in this repository described manual Wrangler deployment and the original Northwest-to-Cloudflare cutover. That setup work is historical. The active operating model is the Git-connected Cloudflare Pages path documented above.
