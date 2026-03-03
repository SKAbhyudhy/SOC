from app.agents.agent_planner import plan_actions
from app.agents.agent_executor import execute_actions
from app.agents.agent_auditor import audit_actions


def run_agents(incident: dict) -> dict:
    plan = plan_actions(incident)
    execution = execute_actions(plan)
    audit = audit_actions(execution)
    return {"plan": plan, "execution": execution, "audit": audit}
