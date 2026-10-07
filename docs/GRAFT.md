# G.R.A.F.T.+

**Graph Reasoning for Architecture, Fidelity & Traceability.**

Human-facing name: **G.R.A.F.T.+**. Package / reference repo: `1devteam/graft_plus`.
Related but distinct: **G.R.A.F.T.1st**.

The public workbench is `/graft`. It runs the website's embedded G.R.A.F.T.+ reconstruction against a public GitHub repository and produces the architecture pack in the browser/session workflow that has historically powered 1devteam.com.

## Role

G.R.A.F.T.+ is a fact substrate for one git revision.

It reconstructs inventory, contracts, inner dependencies, unresolved imports, routes, wiring, commits, README claimed intent, and structural surfaces. It writes one pack. A planner may consume that pack. G.R.A.F.T.+ does not write the plan, choose the correction, or authorize a merge.

```text
product: G.R.A.F.T.+
role: fact-substrate
implementsPlan: false
mergeAuthorization: not-determined
```

## Authority contract

The public workbench keeps two authorities deliberately separate:

- **Semantic authority:** `1devteam/graft_plus` defines the canonical research and reconstruction semantics.
- **Execution authority:** `1devteam/1devteam-web` owns the deployed browser execution loop at `/graft`.

The website must not become a thin client of a required G.R.A.F.T.+ backend. Cloudflare may host the static site, but it does not supervise graph execution, proxy reconstruction, or determine graph semantics. No Cloudflare Worker, tunnel, localhost service, or external graph runtime is required for `/graft` to reconstruct a public repository.

Semantic updates move between the repositories through GitHub-reviewed changes. A canonical G.R.A.F.T.+ revision may be proposed for the website, but it becomes deployed website behavior only after the applicable semantics are ported into `1devteam-web`, validated there, and merged there.

## Website execution model

`1devteam.com/graft` remains self-contained inside `1devteam/1devteam-web`.

```text
browser
  -> public GitHub read-only ingest
  -> embedded reconstruction/indexing
  -> session workspace
  -> downloadable G.R.A.F.T.+ pack
```

There is no required G.R.A.F.T.+ backend service, Cloudflare Tunnel, localhost origin, or `GRAFT_API_ORIGIN` dependency for the public workbench.

The website build also carries no `wrangler` runtime/tooling dependency for G.R.A.F.T.+ execution; Cloudflare Pages hosting is deployment infrastructure only.

## Update policy

`1devteam/graft_plus` remains the development/reference implementation for newer G.R.A.F.T.+ reconstruction semantics and research work.

The public website does **not** automatically track that repository. Synchronization is a GitHub provenance and review operation, not a runtime service call. When a newer G.R.A.F.T.+ behavior is approved for the site, the applicable semantics are deliberately ported into the existing browser-side implementation, validated in `1devteam-web`, and merged through review.

Every downloadable website pack must identify the embedded engine, embedded schema version, semantic authority repository, execution authority repository, synchronization mode, and the canonical reference revision observed by the port. A reference revision is provenance only; it must never claim semantic parity when the embedded implementation is behind the canonical engine.

Updating G.R.A.F.T.+ must not silently replace the website's execution model or introduce a new hosting dependency. Changes to how `/graft` is hosted or executed are separate architecture decisions.

## How to use the workbench

1. Paste a public GitHub repository (`owner/repo`, URL, or git SSH).
2. Reconstruct. The map is session-only: it lives in this tab until download or leave.
3. Download the pack and hand it to an AI for architectural reasoning.
4. Refresh a repository when you want to reconstruct a newer revision and inspect the round delta.

Run the same SHA again for the same facts. Overlay stays residual until a reviewed relationship is attached.

Ajenda and Omnipath are derivation records. They are not subjects on this workbench.

## What becomes a fact

- Every ingested path
- Declared contracts (functions, classes, and language equivalents)
- Resolved inner imports (`from` → path in this tree)
- Unresolved imports (`from` → specifier not in this tree). These are facts, not gaps
- HTTP routes where the indexer can read them
- Wiring (imports, calls, tests)
- Docker and CI file paths
- Named omissions and skip directories

Languages with contracts and imports include Python, JavaScript/TypeScript, Go, Rust, Java/Kotlin, Ruby, PHP, C#, Swift, C/C++, Scala, Elixir, and Lua.

## What stays out, and how it is named

Skip directories are not source: `node_modules`, `.git`, `dist`, `build`, `.next`, `coverage`, `__pycache__`, `.venv`, `venv`, `vendor`, `.turbo`, `.cache`, `target`. They are listed on the map so they are not a blind spot.

Binary blobs and files above the workbench ingestion limit are omitted with a reason. `.env` files are skipped; `.env.example` is not. Secrets in ingested text are isolated before the pack is written.

## Overlay

Generated layer (files, contracts, wiring) is overwritten on reconstruct.

Overlay (policy, saga, ownership, runtime authority) is residual until a reviewed relationship is attached. Refresh of the generated layer does not invent overlay and does not drop reviewed overlay.

## Negatives

Honor these. Do not invent past them.

- Overlay is not modeled for a generated-only ingest
- `implementsPlan` is false
- `mergeAuthorization` is not-determined
- An acknowledgement is not a repair
- Unresolved imports are not missing files

## Internals

| Area | Where |
|---|---|
| GitHub read-only ingest | `src/lib/product/github.ts` |
| Index (symbols, imports, routes, calls) | `src/lib/product/indexer.ts` |
| Generated profile | `src/lib/product/ingest.ts` |
| Pack + reader protocol | `src/lib/product/artifact.ts` |
| Zip | `src/lib/product/zip.ts` |
| Core packet | `src/lib/graft/` |
| Workbench UI | `src/components/product/` |

Coverage for packages, bodies, pack zip, languages, skip dirs, and binary notes: `src/lib/product/coverage.test.ts`.

## Related

- [README](../README.md)
- [Domain and mail](DOMAIN.md)
- G.R.A.F.T.+ reference/development repo: `1devteam/graft_plus`
- Mail contract: [`email-routing.json`](../email-routing.json)
