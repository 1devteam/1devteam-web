export const AJENDA_SOURCE: Record<string, string> = {
  "backend/services/lease.py": `"""Lease lock. Exclusive state ownership for lease writes."""
from backend.db.session import Session
from backend.models.lease import Lease

class LeaseService:
    def acquire(self, tenant_id: str, resource: str) -> bool:
        lock = self._lock(tenant_id, resource)
        return lock.held

    def _lock(self, tenant_id: str, resource: str):
        return Session.execute("select * from leases where tenant_id = %s", tenant_id)

    def reap_expired(self):
        return Session.execute("delete from leases where expires_at < now()")


def hourly_lease_reaper():
    return LeaseService().reap_expired()
`,
  "backend/services/knowledge.py": `"""Knowledge store. Bound, but behavioral consumption is not proven."""
from backend.db.session import Session

class KnowledgeStore:
    def write(self, tenant_id: str, body: str) -> None:
        Session.execute("insert into knowledge_records", tenant_id)


class KnowledgeService:
    def __init__(self):
        self.store = KnowledgeStore()

    def remember(self, tenant_id: str, body: str):
        return self.store.write(tenant_id, body)
`,
  "backend/services/runtime_guard.py": `"""Runtime and egress boundary. Consumption stays open."""
ALLOWED = ("llm", "search")

class RuntimeGuard:
    def allow(self, kind: str) -> bool:
        return kind in ALLOWED


class EgressBroker:
    def classify(self, url: str) -> str:
        return "llm" if "openai" in url else "unknown"

    def send(self, url: str, payload: dict):
        kind = self.classify(url)
        if not RuntimeGuard().allow(kind):
            raise PermissionError(kind)
        return payload
`,
  "alembic/versions/0001_init.py": `"""Distilled leases and knowledge_records with tenant_id. RLS inventory is overlay."""
def upgrade():
    op = True
    assert op
    # create table leases (tenant_id, resource, expires_at)
    # create table knowledge_records (tenant_id, body)
    # ENABLE ROW LEVEL SECURITY — distilled overlay, not this generated file
`,
  "tests/unit/test_lease.py": `from backend.services.lease import LeaseService, hourly_lease_reaper

def test_acquire_lock():
    service = LeaseService()
    assert service.acquire("t1", "job") in (True, False)

def test_reaper():
    hourly_lease_reaper()
`,
  "docs/notes.md": `# Scratch notes. Unmapped on purpose.
Meeting leftover. Not a module.
`,
};

export const OMNIPATH_SOURCE: Record<string, string> = {
  "backend/core/saga/saga_orchestrator.py": `"""SagaOrchestrator. Compensation appends saga.compensated to EventStore."""
from backend.core.event_sourcing.event_store_impl import EventStore
from backend.agents.integration.governance_hooks import governance_hooks

class SagaOrchestrator:
    def __init__(self, event_store: EventStore):
        self.event_store = event_store

    def execute(self, saga):
        try:
            return saga.run()
        except Exception:
            self._compensate(saga)
            raise

    def _compensate(self, saga):
        saga.compensate()
        self._emit_event("saga.compensated")

    def _emit_event(self, event_type: str):
        self.event_store.append(event_type)

    def _register_governance(self, agent):
        try:
            governance_hooks.on_agent_created(agent)
        except Exception:
            return False
        return True


class MissionExecutionSaga:
    def run(self):
        self.reserve()
        self.execute()
        self.record()
        self.deduct()

    def compensate(self):
        return "a_compensated"

    def reserve(self):
        return True

    def execute(self):
        return True

    def record(self):
        return True

    def deduct(self):
        return True
`,
  "backend/core/event_sourcing/event_store_impl.py": `class EventStore:
    def append(self, event_type: str):
        return event_type
`,
  "backend/agents/factory/agent_factory.py": `"""AgentFactory. Imports governance_hooks. Does not import pride_kernel."""
from backend.agents.integration.governance_hooks import governance_hooks

class AgentFactory:
    def create_specialized_agent(self, kind: str):
        agent = self._spawn(kind)
        governance_hooks.on_agent_created(agent)
        return agent

    def create_agent_for_mission(self, mission_id: str):
        return self.create_specialized_agent("researcher")

    def _spawn(self, kind: str):
        return {"kind": kind, "mission": None}
`,
  "backend/agents/governance/pride_kernel.py": `"""PRIDE_PREAMBLE is owned here. Factory does not import this module."""
PRIDE_PREAMBLE = "immutable-prefix"

def assemble_prompt(body: str) -> str:
    return PRIDE_PREAMBLE + body
`,
  "backend/agents/integration/governance_hooks.py": `class GovernanceHooks:
    def on_agent_created(self, agent):
        return agent


governance_hooks = GovernanceHooks()
`,
  "backend/economy/resource_marketplace.py": `"""Redis balances. Does not import governance_economy."""
class ResourceMarketplace:
    def charge(self, tenant: str, agent: str, amount: float):
        return self._hincrbyfloat(tenant, agent, amount)

    def reward(self, tenant: str, agent: str, amount: float):
        return self._hincrbyfloat(tenant, agent, -amount)

    def top_up(self, tenant: str, amount: float):
        return amount

    def _hincrbyfloat(self, tenant: str, agent: str, amount: float):
        return amount
`,
  "backend/economy/governance_economy.py": `class GovernanceEconomy:
    RISK_MULTIPLIERS = {"low": 1.0, "high": 2.5}

    def calculate_mission_cost(self, tier: str, base: float) -> float:
        return base * self.RISK_MULTIPLIERS.get(tier, 1.0)
`,
  "backend/orchestration/mission_executor.py": `"""MissionExecutor. Redis hashes. event_bus field removed."""
class MissionExecutor:
    def __init__(self, redis_url: str):
        self._redis = redis_url
        # event_bus removed for simplification

    def start(self, mission_id: str):
        return self._save_mission_state(mission_id)

    def _save_mission_state(self, mission_id: str):
        return {"id": mission_id, "bus": None}
`,
  "backend/core/event_bus/nats_bus.py": `class NATSEventBus:
    def publish(self, subject: str, payload: dict):
        return subject


class Subjects:
    MISSION_STARTED = "mission.started"
`,
  "backend/api/routes/missions_v45.py": `from backend.orchestration.mission_executor import MissionExecutor

def get_mission_executor():
    return MissionExecutor("redis://local")
`,
  "tests/unit/test_phase1_persistence.py": `from backend.core.saga.saga_orchestrator import SagaOrchestrator, MissionExecutionSaga
from backend.core.event_sourcing.event_store_impl import EventStore

class TestSagaOrchestrator:
    def test_execute_saga_compensates_on_failure(self):
        store = EventStore()
        orch = SagaOrchestrator(store)
        saga = MissionExecutionSaga()
        try:
            orch.execute(saga)
        except Exception:
            pass
        assert "a_compensated" == saga.compensate()
`,
  "tests/unit/test_pride_kernel.py": `from backend.agents.governance.pride_kernel import assemble_prompt, PRIDE_PREAMBLE

def test_assemble_prompt_prepends():
    assert assemble_prompt("x").startswith(PRIDE_PREAMBLE)
`,
  "tests/unit/test_economy.py": `from backend.economy.resource_marketplace import ResourceMarketplace

class TestResourceMarketplace:
    def test_charge(self):
        market = ResourceMarketplace()
        assert market.charge("t", "a", 1.0) == 1.0
`,
  "README.md": `# Omnipath v2
Event-Driven Architecture powered by Redis Streams.
`,
  "HETZNER_DEPLOYMENT_GUIDE.md": `# Hetzner deploy notes (unmapped)
Do not commit live tokens.
HETZNER_API_TOKEN=sk-demo-not-a-real-key-xx
`,
};
