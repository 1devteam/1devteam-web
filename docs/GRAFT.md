# G.R.A.F.T.+

**Graph Reasoning for Architecture, Fidelity & Traceability.**

Human-facing name: **G.R.A.F.T.+**. Package / repo: `graft_plus`.
Related but distinct: **G.R.A.F.T.1st**.

This document is the reconstruction contract. The public workbench is `/graft`. `/wiki` is the same workbench and canonicalizes to `/graft`. There is no glossary-as-product.

## Role

G.R.A.F.T.+ is a fact substrate for one git revision.

It reconstructs inventory, contracts, inner dependencies, unresolved imports, routes, wiring, commits, README claimed intent, and structural surfaces. It writes one pack. A planner may consume that pack. G.R.A.F.T.+ does not write the plan, choose the correction, or authorize a merge.

```text
product: G.R.A.F.T.+
role: fact-substrate
schema: graft-pack-1
implementsPlan: false
mergeAuthorization: not-determined
```

## How to use the workbench

1. Paste a public GitHub repository (`owner/repo`, URL, or git SSH).
2. Reconstruct. The map is session-only: it lives in this tab until download or leave.
3. Download the pack. Feed `GRAFT-MAP.md` or `GRAFT-PACK.json` to an AI.
4. If a model truncates the markdown, open `GRAFT-PACK.json` and `tree/` in the same zip. They are the same SHA, complete.

Run the same SHA again for the same facts. Overlay stays residual until a reviewed relationship is attached.

Ajenda and Omnipath are derivation records. They are not subjects on this workbench.

## The pack

One zip named `GRAFT-PACK-{owner}-{repo}-{sha8}.zip`.

| Entry | What it holds |
|---|---|
| `GRAFT-MAP.md` | Reader protocol, joints first, then source for every ingested file |
| `GRAFT-PACK.json` | Machine record: origin, facts, index, file bodies |
| `tree/` | Ingested files at that SHA |

Joints in the markdown, in order:

- Provenance (repo, ref, SHA, captured time)
- Recent commits
- README claimed intent
- Reconstruction counts
- Named misses (binary, oversize, unreadable)
- Skipped directories
- Surfaces (structural intent from the tree)
- Unresolved package roots (`stripe`, `fastapi`, `django`, …)
- Unresolved imports (file → specifier, not in this tree)
- Inventory (every ingested path)
- Contracts, routes, inner dependencies, wiring
- Docker and CI paths
- Overlay (residual unless evidenced)
- Negatives and honesty
- Files: each path with its contracts, dependencies, routes, and source

The reader protocol is baked into every map so a downstream AI does not need a second briefing.

## What becomes a fact

- Every ingested path
- Declared contracts (functions, classes, and language equivalents)
- Resolved inner imports (`from` → path in this tree)
- Unresolved imports (`from` → specifier not in this tree). These are facts, not gaps
- HTTP routes where the indexer can read them
- Wiring (imports, calls, tests)
- Docker and CI file paths
- Named omissions and skip directories

Languages with contracts and imports: Python, JavaScript/TypeScript, Go, Rust, Java/Kotlin, Ruby, PHP, C#, Swift, C/C++, Scala, Elixir, Lua.

## What stays out, and how it is named

Skip directories are not source: `node_modules`, `.git`, `dist`, `build`, `.next`, `coverage`, `__pycache__`, `.venv`, `venv`, `vendor`, `.turbo`, `.cache`, `target`. They are listed on the map so they are not a blind spot.

Binary blobs (including a PNG stored as `.txt`) and files over 2 MB of text are omitted with a reason: `path (binary)`, `path (oversize)`, `path (unreadable)`.

`.env` files are skipped. `.env.example` is not.

Secrets in ingested text are isolated before the pack is written.

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
- Mail contract: [`email-routing.json`](../email-routing.json)
