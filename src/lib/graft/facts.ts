import type {
  Capability,
  EvidenceLink,
  FactKind,
  ProofClass,
  Provenance,
  TruthFact,
} from "./types.ts";

const OMNIPATH_SHA = "cd07968d3061e02147caba1ece40b4203f1acd51";
const AJENDA_SHA = "ea155f0";

function ev(
  path: string,
  note: string,
  proofClass: ProofClass,
  symbol?: string,
): EvidenceLink {
  return {
    path,
    note,
    proofClass,
    symbol,
    sha: proofClass === "distilled" ? undefined : OMNIPATH_SHA,
  };
}

function fact(partial: TruthFact): TruthFact {
  return partial;
}

function ajendaEv(path: string, note: string, proofClass: ProofClass, symbol?: string): EvidenceLink {
  return { path, note, proofClass, symbol, sha: proofClass === "distilled" ? undefined : AJENDA_SHA };
}

export const AJENDA_PROVENANCE: Provenance = {
  kind: "distilled",
  repo: "1devteam/ajenda-ai",
  sha: AJENDA_SHA,
  capturedAt: "2026-09-13",
  note: "Distilled from merged main at ea155f0. Not a full repository inventory. Not a planner.",
};

export const OMNIPATH_PROVENANCE: Provenance = {
  kind: "source-backed",
  repo: "1devteam/omnipath-v2",
  sha: OMNIPATH_SHA,
  capturedAt: "2026-09-13",
  note: "Read-only reconstruction at this SHA. Facts for a planner. Not a correction sequence.",
};

export const AJENDA_CAPABILITIES: Capability[] = [
  {
    id: "lease",
    label: "Lease lock",
    intent: "Exclusive state ownership for lease writes.",
    nodes: ["py:lease", "state:lease-lock", "job:hourly-lease-reaper", "table:leases"],
  },
  {
    id: "knowledge",
    label: "Knowledge store",
    intent: "Bound store whose behavioral consumption is not proven.",
    nodes: ["py:knowledge", "py:knowledge.store", "table:knowledge_records"],
  },
  {
    id: "egress",
    label: "Egress authority",
    intent: "Declared egress boundary. Consumption stays open.",
    nodes: ["py:runtime.guard", "py:egress", "bound:egress"],
  },
];

export const OMNIPATH_CAPABILITIES: Capability[] = [
  {
    id: "saga",
    label: "Saga compensation",
    intent: "Distributed mission steps compensate on failure via EventStore.",
    nodes: ["py:saga", "saga:mission-execution", "event:saga.compensated", "py:event_store", "test:saga"],
  },
  {
    id: "factory",
    label: "Agent factory",
    intent: "Creates specialized agents. PRIDE preamble is not imported here.",
    nodes: ["py:factory", "agent:factory", "py:pride", "agent:governance"],
  },
  {
    id: "marketplace",
    label: "Marketplace spend",
    intent: "Redis balances. Risk-tier pricing is not consumed.",
    nodes: ["py:marketplace", "state:redis-balance", "py:gov.economy", "policy:risk-tier"],
  },
  {
    id: "mission-runtime",
    label: "Mission executor",
    intent: "Redis mission hashes. Event bus field was removed.",
    nodes: ["py:mission.executor", "state:redis-mission", "py:nats", "event:mission.started"],
  },
  {
    id: "tenant-schema",
    label: "Tenant schema",
    intent: "tenant_id columns exist. RLS is not in the migration.",
    nodes: ["table:tenants", "table:agents", "bound:tenant-data"],
  },
];

export const FACT_KINDS: { id: FactKind; label: string; meaning: string }[] = [
  { id: "inventory", label: "Inventory", meaning: "Files, symbols, routes, schemas, migrations, tests, handlers." },
  { id: "ownership", label: "Ownership", meaning: "Which file or service owns each contract, state transition, persistence, or policy." },
  { id: "dependency", label: "Dependencies", meaning: "Upstream inputs, downstream consumers, stores, buses, tests." },
  { id: "negative", label: "Negatives", meaning: "What a capability does not own and which paths must not be changed for it." },
  { id: "contract", label: "Contracts", meaning: "Declared schemas and manifests compared with observed code." },
  { id: "proof", label: "Proofs", meaning: "Unit, integration, migration, runtime, readback, or docs-only." },
  { id: "gap", label: "Gaps", meaning: "Missing, partial, stale, duplicated, simulated, or conflicting behavior." },
  { id: "runtime", label: "Runtime", meaning: "Links to execution, persistence, audit, and acceptance in code. Not live traces." },
  { id: "freshness", label: "Freshness", meaning: "Commit, capture date, and facts that may be stale." },
  { id: "reference", label: "Reference", meaning: "Observations from another system. Not implementation decisions." },
];

export const AJENDA_FACTS: TruthFact[] = [
  fact({
    id: "AJ-inv-lease",
    capability: "lease",
    kind: "inventory",
    claim: "lease.py is the distilled lease module, with lock state and hourly reaper.",
    nodes: ["py:lease", "state:lease-lock", "job:hourly-lease-reaper"],
    evidence: [ev("backend/services/lease.py", "Distilled lease surface.", "distilled", "lease.py")],
  }),
  fact({
    id: "AJ-own-lease-lock",
    capability: "lease",
    kind: "ownership",
    claim: "lease.py owns exclusive lease-lock state.",
    nodes: ["py:lease", "state:lease-lock"],
    owner: "py:lease",
    evidence: [ev("backend/services/lease.py", "state_ownership overlay on state:lease-lock.", "distilled")],
  }),
  fact({
    id: "AJ-dep-lease-table",
    capability: "lease",
    kind: "dependency",
    claim: "Lease writes depend on table:leases and the tenant-data boundary.",
    nodes: ["py:lease", "table:leases", "bound:tenant-data"],
    evidence: [ev("alembic/versions/0001_init.py", "Distilled leases table.", "distilled")],
  }),
  fact({
    id: "AJ-neg-lease-not-knowledge",
    capability: "lease",
    kind: "negative",
    claim: "Lease work does not own the knowledge store and must not treat knowledge consumption as in-slice.",
    nodes: ["py:lease", "py:knowledge"],
    notOwned: ["py:knowledge.store", "table:knowledge_records"],
    mustNotChange: ["backend/services/knowledge.py"],
    evidence: [ev("backend/services/lease.py", "No edge from lease cluster to knowledge store.", "distilled")],
  }),
  fact({
    id: "AJ-con-knowledge",
    capability: "knowledge",
    kind: "contract",
    claim: "Knowledge store is bound. Behavioral consumption is not declared as consumed.",
    nodes: ["py:knowledge", "py:knowledge.store"],
    declared: "owns py:knowledge.store",
    observed: "no consumes edge",
    relatedFindingIds: ["GF-knowledge-unconsumed"],
    evidence: [ev("backend/services/knowledge.py", "Owns store and table. No consumes witness.", "distilled")],
  }),
  fact({
    id: "AJ-prf-lease-unit",
    capability: "lease",
    kind: "proof",
    claim: "tests/unit/test_lease.py is the distilled proof mapping for lease.py.",
    nodes: ["test:lease", "py:lease"],
    evidence: [ev("tests/unit/test_lease.py", "tests edge onto py:lease.", "distilled")],
  }),
  fact({
    id: "AJ-gap-knowledge-consume",
    capability: "knowledge",
    kind: "gap",
    gapKind: "missing",
    claim: "Knowledge store consumption is missing. Acknowledgement is not a repair.",
    nodes: ["py:knowledge", "py:knowledge.store"],
    relatedFindingIds: ["GF-knowledge-unconsumed"],
    evidence: [ev("backend/services/knowledge.py", "Expected consumes edge is absent.", "distilled")],
  }),
  fact({
    id: "AJ-rt-lease-reaper",
    capability: "lease",
    kind: "runtime",
    claim: "Hourly lease reaper is the distilled runtime job. No live traces in this lab.",
    nodes: ["job:hourly-lease-reaper", "state:lease-lock"],
    evidence: [ev("backend/services/lease.py", "Runtime link is distilled, not a captured trace.", "distilled")],
  }),
  fact({
    id: "AJ-fresh-distilled",
    capability: "lease",
    kind: "freshness",
    claim: "Ajenda facts in this lab are distilled as of 2026-09-13. They are not a live repo extract.",
    nodes: ["py:lease"],
    stale: false,
    evidence: [ev("backend/services/lease.py", "Provenance kind=distilled.", "distilled")],
  }),
  fact({
    id: "AJ-ref-omnipath-pride",
    capability: "lease",
    kind: "reference",
    referenceOnly: true,
    claim: "Omnipath PRIDE preamble vs factory hooks is a second-subject observation. Not an Ajenda implementation decision.",
    nodes: [],
    evidence: [
      ev(
        "backend/agents/factory/agent_factory.py",
        "Reference only. Do not import into Ajenda lease work.",
        "source-symbol",
        "AgentFactory",
      ),
    ],
  }),
  fact({
    id: "AJ-inv-crm-acceptance",
    capability: "crm",
    kind: "inventory",
    claim: "Internal CRM persistence spans tenant-scoped record upserts, workflow projections, and mission-level acceptance checks.",
    nodes: ["py:crm.records", "py:crm.workflow", "py:mission.acceptance"],
    evidence: [
      ajendaEv("backend/services/light_crm/records.py", "LightCrmRecordService owns tenant-scoped CRM record writes and opportunity creation.", "source-symbol", "LightCrmRecordService"),
      ajendaEv("backend/services/light_crm/workflow.py", "CRM upsert completion projects contacts into opportunities and logs activity.", "source-symbol", "on_crm_upsert_completed"),
      ajendaEv("backend/services/mission_acceptance.py", "Mission acceptance evaluates persisted CRM records and projections.", "source-symbol", "evaluate_mission_acceptance"),
    ],
  }),
  fact({
    id: "AJ-con-crm-opportunity-projection",
    capability: "crm",
    kind: "contract",
    claim: "A CRM mission that requires internal persistence must produce an opportunity projection whose contact ID belongs to a persisted CRM record.",
    nodes: ["py:mission.acceptance", "py:crm.workflow", "py:crm.records"],
    declared: "internal_crm_opportunities_min",
    observed: "evaluate_mission_acceptance rejects missing or foreign contact projections",
    evidence: [
      ajendaEv("backend/services/mission_acceptance.py", "Acceptance filters projected contact IDs against persisted CRM record IDs.", "source-symbol", "evaluate_mission_acceptance"),
      ajendaEv("tests/unit/services/test_mission_acceptance.py", "Unit tests cover valid, missing, and foreign opportunity projections.", "unit-test", "test_acceptance_requires_internal_crm_opportunity_projection"),
    ],
  }),
  fact({
    id: "AJ-prf-crm-acceptance",
    capability: "crm",
    kind: "proof",
    claim: "The CRM opportunity acceptance contract is covered by focused unit tests; no live G.R.A.F.T. trace is asserted here.",
    nodes: ["test:crm.acceptance", "py:mission.acceptance"],
    evidence: [
      ajendaEv("tests/unit/services/test_mission_acceptance.py", "Focused acceptance tests exercise the persisted-record and opportunity-projection contract.", "unit-test", "test_acceptance_requires_internal_crm_opportunity_projection"),
      ajendaEv("tests/unit/services/test_light_crm.py", "Workflow tests cover opportunity creation after CRM upsert.", "unit-test", "test_on_crm_upsert_completed_creates_opportunity_for_contact"),
    ],
  }),
  fact({
    id: "AJ-fresh-crm-main",
    capability: "crm",
    kind: "freshness",
    claim: "CRM acceptance facts are aligned to Ajenda main ea155f0 as of 2026-09-13; they require refresh after later CRM contract changes.",
    nodes: ["py:mission.acceptance", "py:crm.workflow"],
    stale: false,
    evidence: [ajendaEv(".git", "Merged main revision recorded in subject provenance.", "distilled")],
  }),
];

export const OMNIPATH_FACTS: TruthFact[] = [
  fact({
    id: "OP-inv-saga",
    capability: "saga",
    kind: "inventory",
    claim: "saga_orchestrator.py implements SagaOrchestrator, MissionExecutionSaga, compensation, and EventStore.append of saga.compensated.",
    nodes: ["py:saga", "saga:mission-execution", "event:saga.compensated"],
    evidence: [
      ev("backend/core/saga/saga_orchestrator.py", "SagaOrchestrator.execute / _compensate / _emit_event.", "source-symbol", "SagaOrchestrator"),
      ev("backend/core/saga/saga_orchestrator.py", "MissionExecutionSaga with reserve/execute/record/deduct compensations.", "source-symbol", "MissionExecutionSaga"),
    ],
  }),
  fact({
    id: "OP-inv-factory",
    capability: "factory",
    kind: "inventory",
    claim: "agent_factory.py implements AgentFactory.create_specialized_agent and create_agent_for_mission. Imports governance_hooks, not pride_kernel.",
    nodes: ["py:factory", "agent:factory"],
    evidence: [
      ev("backend/agents/factory/agent_factory.py", "create_specialized_agent instantiates Researcher/Analyst/Developer.", "source-symbol", "AgentFactory.create_specialized_agent"),
      ev("backend/agents/integration/governance_hooks.py", "governance_hooks.on_agent_created is called from the factory.", "source-symbol", "governance_hooks"),
    ],
  }),
  fact({
    id: "OP-inv-marketplace",
    capability: "marketplace",
    kind: "inventory",
    claim: "resource_marketplace.py implements ResourceMarketplace with Redis charge, reward, top_up, and tenant balances.",
    nodes: ["py:marketplace", "state:redis-balance"],
    evidence: [
      ev("backend/economy/resource_marketplace.py", "charge uses Redis HINCRBYFLOAT on economy:balance keys.", "source-symbol", "ResourceMarketplace.charge"),
    ],
  }),
  fact({
    id: "OP-inv-executor",
    capability: "mission-runtime",
    kind: "inventory",
    claim: "mission_executor.py implements MissionExecutor with Redis hashes. event_bus field is commented removed.",
    nodes: ["py:mission.executor", "state:redis-mission"],
    evidence: [
      ev("backend/orchestration/mission_executor.py", "self._redis = redis.from_url(settings.REDIS_URL).", "source-symbol", "MissionExecutor"),
      ev("backend/api/routes/missions_v45.py", "missions_v45 imports MissionExecutor.", "source-symbol", "get_mission_executor"),
    ],
  }),
  fact({
    id: "OP-inv-nats",
    capability: "mission-runtime",
    kind: "inventory",
    claim: "nats_bus.py implements NATSEventBus and Subjects.MISSION_STARTED. Not imported by mission_executor.py.",
    nodes: ["py:nats", "event:mission.started"],
    evidence: [
      ev("backend/core/event_bus/nats_bus.py", "class NATSEventBus and Subjects enum.", "source-symbol", "NATSEventBus"),
      ev("tests/integration/test_specialized_agents.py", "Test imports NATSEventBus; executor does not.", "integration-test"),
    ],
  }),
  fact({
    id: "OP-inv-schema",
    capability: "tenant-schema",
    kind: "inventory",
    claim: "Initial Alembic revision creates tenants, agents, users, missions with tenant_id columns and indexes. No RLS statements.",
    nodes: ["table:tenants", "table:agents", "bound:tenant-data"],
    evidence: [
      ev(
        "alembic/versions/3d39706f076f_initial_schema_with_users_tenants_.py",
        "tenant_id columns and foreign keys. No ENABLE ROW LEVEL SECURITY.",
        "migration",
      ),
    ],
  }),
  fact({
    id: "OP-own-saga-events",
    capability: "saga",
    kind: "ownership",
    claim: "SagaOrchestrator owns saga status transitions and EventStore.append of saga event types.",
    nodes: ["py:saga", "event:saga.compensated", "py:event_store"],
    owner: "py:saga",
    evidence: [
      ev("backend/core/saga/saga_orchestrator.py", "_emit_event appends to EventStore with aggregate_type saga.", "source-symbol", "_emit_event"),
    ],
  }),
  fact({
    id: "OP-own-pride",
    capability: "factory",
    kind: "ownership",
    claim: "pride_kernel.py owns PRIDE_PREAMBLE and assemble_prompt. The factory does not own the preamble.",
    nodes: ["py:pride", "agent:governance"],
    owner: "py:pride",
    evidence: [
      ev("backend/agents/governance/pride_kernel.py", "PRIDE_PREAMBLE is a module constant. assemble_prompt prepends it.", "source-symbol", "PRIDE_PREAMBLE"),
    ],
  }),
  fact({
    id: "OP-own-risk",
    capability: "marketplace",
    kind: "ownership",
    claim: "GovernanceEconomy owns RISK_MULTIPLIERS. ResourceMarketplace owns Redis balances, not that policy.",
    nodes: ["py:gov.economy", "policy:risk-tier", "py:marketplace"],
    owner: "py:gov.economy",
    evidence: [
      ev("backend/economy/governance_economy.py", "RISK_MULTIPLIERS on GovernanceEconomy.", "source-symbol", "RISK_MULTIPLIERS"),
    ],
  }),
  fact({
    id: "OP-own-mission-redis",
    capability: "mission-runtime",
    kind: "ownership",
    claim: "MissionExecutor owns Redis mission hashes and tenant mission sets.",
    nodes: ["py:mission.executor", "state:redis-mission"],
    owner: "py:mission.executor",
    evidence: [
      ev("backend/orchestration/mission_executor.py", "_save_mission_state uses pipeline hset/sadd/expire.", "source-symbol", "_save_mission_state"),
    ],
  }),
  fact({
    id: "OP-dep-saga-store",
    capability: "saga",
    kind: "dependency",
    claim: "SagaOrchestrator depends on EventStore. Tests depend on SagaOrchestrator.",
    nodes: ["py:saga", "py:event_store", "test:saga"],
    evidence: [
      ev("backend/core/saga/saga_orchestrator.py", "from backend.core.event_sourcing.event_store_impl import EventStore", "source-symbol"),
      ev("tests/unit/test_phase1_persistence.py", "test_execute_saga_compensates_on_failure", "unit-test", "TestSagaOrchestrator"),
    ],
  }),
  fact({
    id: "OP-dep-factory-hooks",
    capability: "factory",
    kind: "dependency",
    claim: "AgentFactory imports governance_hooks. It does not import pride_kernel.",
    nodes: ["py:factory", "py:hooks", "py:pride"],
    evidence: [
      ev("backend/agents/factory/agent_factory.py", "from backend.agents.integration.governance_hooks import governance_hooks", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-dep-v45-executor",
    capability: "mission-runtime",
    kind: "dependency",
    claim: "missions_v45.py is the route consumer of MissionExecutor. missions.py is not.",
    nodes: ["py:missions.v45", "py:mission.executor"],
    evidence: [
      ev("backend/api/routes/missions_v45.py", "from backend.orchestration.mission_executor import MissionExecutor", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-neg-factory-not-pride",
    capability: "factory",
    kind: "negative",
    claim: "Factory does not own PRIDE_PREAMBLE. Factory work must not treat pride_kernel.py as in-scope to rewrite.",
    nodes: ["py:factory", "py:pride"],
    notOwned: ["PRIDE_PREAMBLE", "assemble_prompt"],
    mustNotChange: ["backend/agents/governance/pride_kernel.py"],
    relatedFindingIds: ["OP-pride-unconsumed"],
    evidence: [
      ev("backend/agents/factory/agent_factory.py", "No pride_kernel import.", "source-symbol"),
      ev("backend/agents/integration/governance_hooks.py", "Hooks do not import pride_kernel.", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-neg-market-not-pricing",
    capability: "marketplace",
    kind: "negative",
    claim: "Marketplace does not own risk-tier pricing and does not consume it.",
    nodes: ["py:marketplace", "policy:risk-tier"],
    notOwned: ["RISK_MULTIPLIERS", "GovernanceEconomy.calculate_mission_cost"],
    mustNotChange: ["backend/economy/governance_economy.py"],
    relatedFindingIds: ["OP-marketplace-unconsumed"],
    evidence: [
      ev("backend/economy/resource_marketplace.py", "Redis only. No import of governance_economy.", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-neg-executor-not-nats",
    capability: "mission-runtime",
    kind: "negative",
    claim: "MissionExecutor does not own NATSEventBus. Saga compensation must not be rewritten to satisfy the README Redis Streams claim.",
    nodes: ["py:mission.executor", "py:nats", "py:saga"],
    notOwned: ["NATSEventBus", "Subjects"],
    mustNotChange: ["backend/core/event_bus/nats_bus.py", "backend/core/saga/saga_orchestrator.py"],
    relatedFindingIds: ["OP-bus-drift"],
    evidence: [
      ev("backend/orchestration/mission_executor.py", "event_bus field removed for simplification.", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-neg-not-ajenda-rls",
    capability: "tenant-schema",
    kind: "negative",
    claim: "This reconstruction does not authorize adding Ajenda RLS to Omnipath tenant tables.",
    nodes: ["table:agents", "bound:tenant-data"],
    notOwned: ["rls_enforced"],
    mustNotChange: ["alembic/versions/3d39706f076f_initial_schema_with_users_tenants_.py"],
    evidence: [
      ev(
        "alembic/versions/3d39706f076f_initial_schema_with_users_tenants_.py",
        "tenant_id without RLS. Ajenda RLS is a reference fact, not a change order.",
        "migration",
      ),
    ],
  }),
  fact({
    id: "OP-con-readme-bus",
    capability: "mission-runtime",
    kind: "contract",
    claim: "README declares Redis Streams as the event bus. Observed: nats_bus.py exists; executor uses Redis hashes; event_bus removed.",
    nodes: ["py:nats", "py:mission.executor"],
    declared: "README: Messaging = Redis Streams",
    observed: "NATSEventBus present; MissionExecutor Redis hashes; event_bus removed",
    stale: true,
    relatedFindingIds: ["OP-bus-drift"],
    evidence: [
      ev("README.md", "Event-Driven Architecture powered by Redis Streams.", "docs-only"),
      ev("backend/core/event_bus/nats_bus.py", "NATS implementation.", "source-symbol", "NATSEventBus"),
      ev("backend/orchestration/mission_executor.py", "event_bus removed; Redis hashes remain.", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-con-pride",
    capability: "factory",
    kind: "contract",
    claim: "pride_kernel declares an immutable preamble for every agent. Factory and hooks do not import it.",
    nodes: ["py:pride", "py:factory"],
    declared: "PRIDE_PREAMBLE prepended for every agent",
    observed: "AgentFactory does not import pride_kernel",
    relatedFindingIds: ["OP-pride-unconsumed"],
    evidence: [
      ev("backend/agents/governance/pride_kernel.py", "Docstring: non-bypassable prefix for every agent.", "source-symbol"),
      ev("backend/agents/factory/agent_factory.py", "No assemble_prompt call.", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-con-tenant",
    capability: "tenant-schema",
    kind: "contract",
    claim: "Multi-tenancy is declared via tenant_id columns. RLS is not present in the initial migration.",
    nodes: ["table:tenants", "table:agents", "bound:tenant-data"],
    declared: "tenant_id foreign keys",
    observed: "no ENABLE ROW LEVEL SECURITY",
    evidence: [
      ev(
        "alembic/versions/3d39706f076f_initial_schema_with_users_tenants_.py",
        "Columns and indexes only.",
        "migration",
      ),
    ],
  }),
  fact({
    id: "OP-prf-saga-unit",
    capability: "saga",
    kind: "proof",
    claim: "test_execute_saga_compensates_on_failure proves compensate-on-failure on SagaOrchestrator.",
    nodes: ["test:saga", "py:saga", "event:saga.compensated"],
    relatedFindingIds: ["OP-saga-compensation"],
    evidence: [
      ev("tests/unit/test_phase1_persistence.py", "Unit test appends compensation and asserts a_compensated.", "unit-test", "test_execute_saga_compensates_on_failure"),
    ],
  }),
  fact({
    id: "OP-prf-economy-unit",
    capability: "marketplace",
    kind: "proof",
    claim: "tests/unit/test_economy.py covers ResourceMarketplace balances and charges. It does not prove risk-tier consumption.",
    nodes: ["test:economy", "py:marketplace"],
    evidence: [
      ev("tests/unit/test_economy.py", "TestResourceMarketplace. Risk-tier policy is out of this test.", "unit-test"),
    ],
  }),
  fact({
    id: "OP-prf-pride-unit",
    capability: "factory",
    kind: "proof",
    claim: "test_pride_kernel.py proves assemble_prompt prepends the preamble. It does not prove the factory calls it.",
    nodes: ["test:pride", "py:pride"],
    relatedFindingIds: ["OP-pride-unconsumed"],
    evidence: [
      ev("tests/unit/test_pride_kernel.py", "Kernel unit tests. No factory mapping.", "unit-test"),
    ],
  }),
  fact({
    id: "OP-prf-no-runtime-trace",
    capability: "saga",
    kind: "proof",
    claim: "This reconstruction has no captured runtime traces, worker leases, or readbacks. Runtime links are source paths only.",
    nodes: ["py:saga"],
    evidence: [
      ev("backend/core/saga/saga_orchestrator.py", "Unproven as a live trace. Proof class remains unproven for runtime.", "unproven"),
    ],
  }),
  fact({
    id: "OP-gap-pride-factory",
    capability: "factory",
    kind: "gap",
    gapKind: "missing",
    claim: "Factory → pride_kernel import is missing. Consumption of the preamble at agent creation is INDETERMINATE.",
    nodes: ["py:factory", "py:pride"],
    relatedFindingIds: ["OP-pride-unconsumed"],
    evidence: [
      ev("backend/agents/factory/agent_factory.py", "Expected imports edge is absent.", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-gap-risk-consume",
    capability: "marketplace",
    kind: "gap",
    gapKind: "missing",
    claim: "Marketplace does not consume RISK_MULTIPLIERS. Acknowledgement is not a repair.",
    nodes: ["py:marketplace", "policy:risk-tier"],
    relatedFindingIds: ["OP-marketplace-unconsumed"],
    evidence: [
      ev("backend/economy/resource_marketplace.py", "No consumes edge onto policy:risk-tier.", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-gap-bus-conflict",
    capability: "mission-runtime",
    kind: "gap",
    gapKind: "conflicting",
    claim: "Event bus authority conflicts across README (Redis Streams), nats_bus.py (NATS), and MissionExecutor (Redis hashes, bus removed).",
    nodes: ["py:nats", "py:mission.executor"],
    stale: true,
    relatedFindingIds: ["OP-bus-drift"],
    evidence: [
      ev("README.md", "Declared Redis Streams.", "docs-only"),
      ev("backend/core/event_bus/nats_bus.py", "Implemented NATS.", "source-symbol"),
      ev("backend/orchestration/mission_executor.py", "Bus removed.", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-gap-risk-dupe",
    capability: "marketplace",
    kind: "gap",
    gapKind: "duplicated",
    claim: "RISK_MULTIPLIERS is also defined on the rate-limit middleware, separate from GovernanceEconomy.",
    nodes: ["py:gov.economy", "policy:risk-tier"],
    evidence: [
      ev("backend/economy/governance_economy.py", "GovernanceEconomy.RISK_MULTIPLIERS", "source-symbol"),
      ev("backend/middleware/governance_rate_limit.py", "Local RISK_MULTIPLIERS on the middleware.", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-gap-factory-test",
    capability: "factory",
    kind: "gap",
    gapKind: "missing",
    claim: "No test module maps onto agent_factory.py in this graph.",
    nodes: ["py:factory"],
    evidence: [
      ev("backend/agents/factory/agent_factory.py", "selectProof reports missing-test-mapping on this slice.", "unproven"),
    ],
  }),
  fact({
    id: "OP-rt-saga-append",
    capability: "saga",
    kind: "runtime",
    claim: "Runtime acceptance for compensation is EventStore.append of saga.compensated. Not a captured worker lease.",
    nodes: ["py:saga", "event:saga.compensated", "py:event_store"],
    evidence: [
      ev("backend/core/saga/saga_orchestrator.py", "_emit_event → event_store.append event_type saga.compensated", "source-symbol", "_emit_event"),
    ],
  }),
  fact({
    id: "OP-rt-market-charge",
    capability: "marketplace",
    kind: "runtime",
    claim: "Runtime spend is Redis HINCRBYFLOAT on economy:balance:{tenant}:{agent}. No risk-tier audit on that path.",
    nodes: ["py:marketplace", "state:redis-balance"],
    evidence: [
      ev("backend/economy/resource_marketplace.py", "charge pipeline hincrbyfloat balance and total_spent.", "source-symbol", "charge"),
    ],
  }),
  fact({
    id: "OP-rt-hooks-nonfatal",
    capability: "factory",
    kind: "runtime",
    claim: "AgentCreationSaga treats governance registration failure as non-fatal.",
    nodes: ["py:saga", "py:hooks"],
    evidence: [
      ev("backend/core/saga/saga_orchestrator.py", "_register_governance catches Exception and logs a warning.", "source-symbol", "_register_governance"),
    ],
  }),
  fact({
    id: "OP-fresh-sha",
    capability: "saga",
    kind: "freshness",
    claim: "Facts are pinned to 1devteam/omnipath-v2@cd07968d3061e02147caba1ece40b4203f1acd51, captured 2026-09-13.",
    nodes: ["py:saga"],
    stale: false,
    evidence: [
      ev("backend/core/saga/saga_orchestrator.py", "Source-backed SHA lock. Later commits are out of this graph.", "source-symbol"),
    ],
  }),
  fact({
    id: "OP-fresh-readme",
    capability: "mission-runtime",
    kind: "freshness",
    claim: "README event-bus claim may be stale relative to nats_bus.py and the executor change that removed event_bus.",
    nodes: ["py:nats", "py:mission.executor"],
    stale: true,
    relatedFindingIds: ["OP-bus-drift"],
    evidence: [
      ev("README.md", "Docs-only messaging row still says Redis Streams.", "docs-only"),
    ],
  }),
  fact({
    id: "OP-ref-ajenda-rls",
    capability: "tenant-schema",
    kind: "reference",
    referenceOnly: true,
    claim: "Ajenda RLS inventory is a reference observation. It is not an Omnipath implementation decision.",
    nodes: [],
    evidence: [
      ev("alembic/versions/0001_init.py", "Ajenda distilled tenant-data boundary. Reference only.", "distilled"),
    ],
  }),
  fact({
    id: "OP-ref-ajenda-lease",
    capability: "mission-runtime",
    kind: "reference",
    referenceOnly: true,
    claim: "Ajenda lease-lock / hourly reaper is a reference observation. Omnipath mission state is Redis hashes, not that lease model.",
    nodes: [],
    evidence: [
      ev("backend/services/lease.py", "Reference only. Do not treat as an Omnipath worker-lease requirement.", "distilled"),
    ],
  }),
  fact({
    id: "OP-ref-ajenda-egress",
    capability: "factory",
    kind: "reference",
    referenceOnly: true,
    claim: "Ajenda egress classes are examples from the longitudinal subject. Not Omnipath policy.",
    nodes: [],
    evidence: [
      ev("backend/services/runtime_guard.py", "Reference only.", "distilled"),
    ],
  }),
];

export const PLANNER_NOTE =
  "These facts are inputs to a planner. G.R.A.F.T.+ does not choose corrections, additions, or merge authority.";

const KINDS: FactKind[] = [
  "inventory",
  "ownership",
  "dependency",
  "negative",
  "contract",
  "proof",
  "gap",
  "runtime",
  "freshness",
  "reference",
];

export function emptyKindIndex(): Record<FactKind, import("./types.ts").SlicedFact[]> {
  return {
    inventory: [],
    ownership: [],
    dependency: [],
    negative: [],
    contract: [],
    proof: [],
    gap: [],
    runtime: [],
    freshness: [],
    reference: [],
  };
}

export function indexByKind(facts: import("./types.ts").SlicedFact[]) {
  const index = emptyKindIndex();
  for (const item of facts) {
    index[item.kind].push(item);
  }
  return index;
}

export { KINDS as TRUTH_KIND_ORDER };
