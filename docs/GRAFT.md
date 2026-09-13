# G.R.A.F.T.+

**Graph Reasoning for Architecture, Fidelity & Traceability.**

Human-facing name: **G.R.A.F.T.+**. Repository and package identifier: `graft_plus`.
Related but distinct: **G.R.A.F.T.1st** (intended architecture before substantial implementation).
This lab is G.R.A.F.T.+ only.

Public prototype and user guide: [https://1devteam.com/wiki](https://1devteam.com/wiki)

## What it is

G.R.A.F.T.+ reconstructs an existing software system into a machine-readable graph and an evidence-linked fact packet. The reconstruction covers generated structure (files, modules, imports, tests) and, where modeled, overlay (ownership, policy, sagas, runtime authority).

A planner can consume the packet. G.R.A.F.T.+ does not write the plan, choose the correction, or authorize a merge.

- `implementsPlan` is always `false`
- `mergeAuthorization` remains `not-determined`
- residuals stay visible
- schema-valid is not proof of behavioral consumption

## What it is not

- Not a planner
- Not merge authority
- Not G.R.A.F.T.1st
- Not a substitute for repository inspection, tests, runtime traces, or human review
- An acknowledged finding is not a repair

## Using the public prototype

The `/wiki` page is the working reconstruction workbench plus this guide.

1. Open the prototype (`#graft-plus`).
2. Choose a subject: **Ajenda** (distilled) or **Omnipath v2** (source-backed at a captured SHA).
3. **Run** — disposition, residuals, blast radius, proof, adjudication.
4. **Truth** — inventory, negatives, gaps, contracts, proofs.
5. **Schema** — packet shape a planner can consume.
6. **Transfer** — checks that facts remain coherent across subjects.
7. **Records** — frozen R&D notes, not live conclusions.
8. Export the JSON fact packet.

Clear disposition does not mean merge. Unmapped changed files fail closed.

## Subjects on the public page

| Subject | Provenance | What it shows |
|---|---|---|
| Ajenda | Distilled reconstruction | Overlay facts, invariants, acknowledged residuals |
| Omnipath v2 | Source-backed at a captured commit | Factory, marketplace, governance; risk-tier consumption remains a visible gap |

Neither subject is a hosted product on `/wiki`. Both are reconstruction inputs.

This public page does **not** ingest an arbitrary GitHub repository. Prepared subjects are the inspectable surface.

## Packet boundary

Exported JSON includes graph, impact, proof, completeness, adjudication, decision, truth, and `plannerInput`. The packet repeats:

```text
product: G.R.A.F.T.+
role: fact-substrate
implementsPlan: false
mergeAuthorization: not-determined
```

## What the prototype demonstrates

Code-graph impact analysis, written facts, planner-ready input, visible residuals, transfer checks, and frozen records.

A production G.R.A.F.T.+ that can plan against an arbitrary repository still needs project ingestion, file/symbol/import/caller/callee indexing, durable plans and tasks, separated Architect / Dispatcher / Coder / Reviewer workflows, real browser evidence, secrets isolation, git/worktree integration, and a dashboard bound to durable state. Those internals are not claimed as shipping on 1devteam.com.

## Related references

- [PRIDE Protocol](https://1devteam.com/wiki/pride-protocol)
- [Snapshot](https://1devteam.com/wiki/snapshot)
- [Ajenda Architectural Graph](https://1devteam.com/wiki/architectural-graph)
- [R&D program](https://1devteam.com/research)
