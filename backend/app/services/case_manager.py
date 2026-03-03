from app.core.store import store


def create_case(incident: dict) -> dict:
    case_id = len(store.cases) + 1
    case = {
        "id": case_id,
        "incident_id": incident["id"],
        "tenant_id": incident["tenant_id"],
        "status": "Open",
        "assigned_analyst": "tier1@noc.local",
        "notes": ["Case auto-created by pipeline"],
        "evidence": [incident["analysis"]["reasoning"]],
    }
    store.cases.append(case)
    return case
