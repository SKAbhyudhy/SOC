def execute_actions(plan: dict) -> dict:
    return {"incident_id": plan["incident_id"], "steps": [{"step": x, "status": "done"} for x in plan["plan"]], "owner": "agent-executor"}
