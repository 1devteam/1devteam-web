# G.R.A.F.T.+

**Graph Reasoning for Architecture, Fidelity & Traceability.**

Human-facing name: **G.R.A.F.T.+**. Canonical engine / package / repository: `1devteam/graft_plus`.
Related but distinct: **G.R.A.F.T.1st**.

The public workbench is `/graft`, but the website is no longer a second implementation of G.R.A.F.T.+. It is a delivery client for the canonical `graft_plus` HTTP boundary.

## Authority

`1devteam/graft_plus` owns reconstruction semantics, graph schemas, evidence rules, assurance, architecture decision logic, repository materialization, and pack generation.

`1devteam/1devteam-web` owns presentation and transport only.

```text
browser
  -> POST /api/graft
  -> 1devteam.com Pages proxy
  -> canonical graft_plus POST /v1/reconstruct
  -> canonical G.R.A.F.T.+ ZIP
  -> browser download
```

The site must not recreate, translate, or independently evolve G.R.A.F.T.+ semantics. If the canonical service is unavailable or unconfigured, `/graft` fails closed instead of substituting the retired browser-side reconstruction path.

## Deployment contract

The Cloudflare Pages runtime requires:

```text
GRAFT_API_ORIGIN=https://<canonical-graft-service-host>
```

`functions/api/graft.ts` accepts only same-site POST traffic, forwards JSON to `${GRAFT_API_ORIGIN}/v1/reconstruct`, and returns the canonical response. It preserves only the artifact and provenance headers needed by the browser:

- `content-disposition`
- `x-graft-checksum`
- `x-graft-subject-sha`
- `x-graft-node-count`
- `x-graft-edge-count`

The proxy does not implement reconstruction and does not contain a fallback engine.

## Canonical service contract

The service is defined in `1devteam/graft_plus/src/graft_plus/service.py`.

`POST /v1/reconstruct` accepts:

```json
{
  "repository": "owner/repo",
  "ref": "optional branch, tag, or reachable commit SHA"
}
```

It runs the same canonical engine used by the CLI and returns a ZIP containing the canonical decipher pack. The current engine explicitly does not grant execution authority or merge authorization.

The service retains its bounded public-materialization envelope. Large study subjects such as Chromium remain local/offline reconstruction subjects rather than a reason to weaken the public-service safety boundary.

## Update behavior

Once production `GRAFT_API_ORIGIN` points to the deployed canonical service, engine upgrades do **not** require a semantic port into this website. Updating the deployed `graft_plus` service updates what `/graft` executes because the website contains no reconstruction implementation on the active route.

Changes to the HTTP contract itself still require coordinated compatibility work. Contract drift must fail visibly; it must not be hidden by a local fallback.

## Historical embedded implementations

The repository still contains older browser-side G.R.A.F.T./product modules for historical provenance and other development surfaces. They are **not** the authoritative engine and are not invoked by the public `/graft` reconstruction route after this cutover.

They must not be described as `graft_plus`, and future G.R.A.F.T.+ algorithm changes belong in `1devteam/graft_plus`, not here.

## Public workbench behavior

1. Enter a public GitHub repository.
2. Optionally enter a branch, tag, or exact reachable commit SHA.
3. The site sends the request to the canonical service.
4. The browser downloads the canonical G.R.A.F.T.+ pack returned by that service.
5. Provenance headers show the resolved subject SHA, graph node/edge counts, and ZIP checksum when reconstruction succeeds.

## Failure behavior

- canonical service not configured: HTTP `503`, visible unavailable state
- service cannot be reached: HTTP `502`, visible unavailable state
- canonical request/reconstruction/limit failures: upstream status and error are surfaced
- no stale browser reconstruction fallback

## Related

- [README](../README.md)
- [Domain and mail](DOMAIN.md)
- Canonical engine: `1devteam/graft_plus`
- Mail contract: [`email-routing.json`](../email-routing.json)
