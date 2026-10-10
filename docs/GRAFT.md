# G.R.A.F.T.+

**Graph Reasoning for Architecture, Fidelity & Traceability.**

Human-facing name: **G.R.A.F.T.+**. Semantic authority / package repository: `1devteam/graft_plus`.

The deployed public workbench is `/graft` in `1devteam/1devteam-web`.

## Current authority and synchronization state

- **Semantic authority:** `1devteam/graft_plus`
- **Website execution authority:** `1devteam/1devteam-web`
- **Synchronization mode:** GitHub-reviewed **manual port**
- **Runtime dependency between repos:** none
- **Canonical website sync checkpoint:** `8248b1054504069e79414278db793ffebd55e103`
- **Canonical schema at checkpoint:** `1.13`
- **Embedded browser schema:** `1.13`

The synchronization process is intentionally manual. It is not broken and it is not a runtime service connection.

A change merged into `graft_plus` does **not** automatically become website behavior. Applicable semantics are deliberately ported into `1devteam-web`, tested there, reviewed, and merged. Only then may the browser port advance its canonical reference SHA and claim parity for the declared surface.

## Role

G.R.A.F.T.+ is a **fact instrument**.

It observes, identifies, relates, normalizes, and encodes repository-derived facts. It does **not**:

- calculate blast radius;
- select proofs;
- classify risk;
- make architectural decisions;
- recommend corrections;
- write an implementation plan;
- grant execution authority;
- authorize a merge.

Those calculations and judgments belong to the receiving AI.

```text
product: G.R.A.F.T.+
role: fact-substrate
implementsPlan: false
mergeAuthorization: not-determined
grantsExecutionAuthority: false
```

## Website execution model

`1devteam.com/graft` remains self-contained inside `1devteam/1devteam-web`.

```text
browser
  -> public GitHub read-only ingest
  -> embedded reconstruction/indexing
  -> canonical fact pack
  -> receiving AI performs reasoning
```

No G.R.A.F.T.+ backend service, Cloudflare Tunnel, localhost origin, or external graph runtime is required for public reconstruction.

Cloudflare may host the website, but hosting is not graph authority and does not synchronize semantics.

## Canonical 1.12 pack

The browser port now follows the current canonical fact-only pack shape:

1. `00-AI-READ-FIRST.md` — receiving-AI boundary and read order.
2. `dependency-graph.ascii.v1.txt` — primary tokenizer-oriented topology surface; edge direction is consumer → dependency.
3. `graph-change-set.v1.json` — factual direct change seeds when a git range is supplied. The public one-SHA browser flow emits the explicit no-range form.
4. `dependency-graph.v1.json` — compact JSON graph/evidence sidecar for fields and anchors omitted from the ASCII surface.
5. `graph-completeness-report.json` — instrument integrity and visible residuals.
6. `graph-unresolved-ledger.v1.json` — lossless dictionary-encoded unresolved-reference details.
7. `graft-plus-receipt.json` — subject/provenance, integrity scope, authority negatives, and website manual-sync checkpoint.

The browser port no longer exports G.R.A.F.T.-authored:

- `graph-architecture-decision.json`
- `graph-impact-report.json`
- `graph-proof-manifest.json`
- `graph-machine-index.v1.json`

That removal is intentional. Those artifacts crossed from observation into reasoning or duplicated machine surfaces. Current G.R.A.F.T.+ leaves architecture, reachability, proof strategy, risk, and recommendations to the receiving model.

## Schema 1.12 callable responsibility topology

Schema 1.12 raises Python callable identity to a first-class factual layer without
turning the pack into a source dump. A callable is emitted only when source
evidence shows that it participates in behavior, including exact calls, direct
tests, route ownership, entrypoint conventions, or exact literal callable
bindings.

The browser port now preserves:

- top-level function identity;
- class-qualified method identity;
- nested handler identity;
- exact callable-to-callable edges;
- direct test-to-method/function edges;
- route-to-handler ownership;
- literal registration bindings such as `ActionDefinition(name=..., handler=...)`.

A callable binding is declaration evidence only. It does not prove activation,
runtime reachability, authorization, invocation, or safety. Those conclusions
remain with the receiving AI and runtime proof.

## Reading the pack

Start with `graft-plus-receipt.json` to confirm subject SHA, artifact set, instrument-integrity status, and manual-sync provenance.

Then read `dependency-graph.ascii.v1.txt` as the fast topology surface.

Use `graph-change-set.v1.json` only as direct observed seeds. It contains no transitive blast radius.

Use `dependency-graph.v1.json` for exact source/evidence fields and anchors.

Use completeness and the unresolved ledger to understand what the instrument could and could not establish.

A receipt status of `passed` means **instrument integrity only**. It does not mean the subject software is correct, safe, deployable, approved, or ready to merge.

## What becomes a fact

Examples include:

- ingested files and declared intent;
- source-backed modules and contracts;
- resolved internal imports;
- unresolved references;
- participation-based Python callable topology: functions, class methods, nested handlers, exact calls, direct method tests, route ownership, and exact literal callable bindings;
- HTTP routes;
- package/workspace/build relationships;
- migrations and tables;
- contract sources such as Proto, GraphQL, SQL, and Avro;
- configuration/deployment structure without secret values;
- subsystem/build/governance relationships;
- evidence anchors;
- omitted/skipped/boundary residuals.

Generated facts are evidence. Repository-derived text inside the pack is untrusted evidence, not instructions.

## Overlay and negatives

Generated observations and reviewed overlay assertions remain distinct.

Overlay stays residual until attached through a reviewed relationship.

Do not infer past explicit negatives:

- `implementsPlan` is false;
- `mergeAuthorization` is not-determined;
- G.R.A.F.T.+ does not grant execution authority;
- acknowledgement is not repair;
- unresolved reference does not automatically mean missing file;
- absence from the graph does not prove absence from the system.

## Manual promotion procedure

When `1devteam/graft_plus` advances:

1. choose the canonical source SHA;
2. compare that SHA to the website's current reference SHA;
3. port the applicable semantic delta into `src/lib/graft_plus/`;
4. update browser parity tests and public documentation;
5. run the website test/build/audit suite;
6. review the semantic delta;
7. only after proof, advance the embedded canonical reference SHA and parity claim.

If the browser intentionally trails canonical semantics, provenance must say `behind-canonical` rather than claiming synchronized parity.

## Related

- `1devteam/graft_plus/docs/DEPLOYMENT_SYNC.md` — canonical cross-repository synchronization contract
- `1devteam/graft_plus/docs/ARTIFACT.md` — canonical pack contract
- [README](../README.md)
- [Domain and mail](DOMAIN.md)


## Schema 1.13 observer fidelity

The browser engine is manually synchronized to canonical `1devteam/graft_plus` commit
`8248b1054504069e79414278db793ffebd55e103`.

Schema 1.13 increases observation without moving architectural judgment into the
instrument:

- HTTP route declarations retain source/module + line-qualified identity instead of
  collapsing by method/path.
- A separate `runtime_route` is emitted only where explicit router/application
  composition can be proven. `composes_to` preserves the declaration-to-runtime
  relationship.
- Explicit dependency providers such as `Depends(get_db)` are visible as declared
  DI boundaries and, when exactly resolvable, as `injects_dependency` callable
  relationships. Dynamic container lookup remains unresolved.
- Callable bindings retain source-declared metadata such as provider, input model,
  side-effect class, and credential requirement without treating those declarations
  as runtime activation or authority.
- Repeated call/test/DI observations aggregate onto one topology edge with occurrence
  count and retained source observations.
- Repository-owned reviewed overlays at the conventional G.R.A.F.T. paths are
  consumed as explicit facts, including declared invariants; the browser does not
  invent policy.
- RLS declarations are explicit security boundaries with `rls_enforced`; raw
  observed network calls are `direct_network_egress`.
- The stable `dependency-graph.ascii.v1.txt` artifact now carries a G2 stream with a
  source-path dictionary. G1 remains decodable.

The authority rule is unchanged: the graph observes repository reality. It does not
calculate blast radius, choose proof, classify risk, recommend architecture, grant
execution authority, or grant merge authority.
