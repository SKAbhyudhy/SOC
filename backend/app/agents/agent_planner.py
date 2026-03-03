def plan_actions(incident: dict) -> dict:
    return {"incident_id": incident["id"], "plan": ["triage", "enrich", "contain"], "owner": "agent-planner"}
