def audit_actions(execution: dict) -> dict:
    ok = all(step["status"] == "done" for step in execution["steps"])
    return {"incident_id": execution["incident_id"], "validated": ok, "owner": "agent-auditor"}
