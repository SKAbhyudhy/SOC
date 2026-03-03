from app.core.store import store
from app.services.detector import detect_threat
from app.services.llm_engine import analyze_incident
from app.services.mitre_mapper import map_to_mitre
from app.services.threat_intel_fetcher import enrich_threat
from app.services.risk_scoring_engine import score_risk
from app.playbooks.playbook_generator import generate_playbook
from app.playbooks.playbook_executor import execute_playbook
from app.playbooks.playbook_repository import save_playbook
from app.services.case_manager import create_case
from app.services.sla_tracker import calculate_sla
from app.services.audit_logger import log_audit
from app.agents.agent_orchestrator import run_agents
from app.services.redis_client import redis_stream


def run_pipeline(log: dict, actor: str = "system") -> dict:
    detection = detect_threat(log)
    if not detection["detected"]:
        return {"status": "ignored", "reason": "below threshold"}
    analysis = analyze_incident(detection, log)
    mitre = map_to_mitre(analysis["classification"])
    intel = enrich_threat(log.get("ioc", ""))
    risk = score_risk(detection["severity"], analysis["confidence"], 1.2)
    playbook = generate_playbook(analysis, intel)
    save_playbook(playbook)
    execution = execute_playbook(playbook)

    incident_id = len(store.incidents) + 1
    incident = {
        "id": incident_id,
        "tenant_id": log["tenant_id"],
        "created_at": store.now(),
        "attack_name": analysis["classification"].title(),
        "source_ip": log.get("ioc") or "unknown",
        "log": log,
        "detection": detection,
        "analysis": analysis,
        "mitre": mitre,
        "intel": intel,
        "risk": risk,
        "risk_before": risk["risk_score"],
        "playbook": playbook,
        "validation": {"approved": True},
        "sandbox_execution": execution,
        "status": "Active",
    }
    incident["sla"] = calculate_sla(risk["risk_level"], incident["created_at"])
    incident["agents"] = run_agents(incident)
    store.incidents.append(incident)
    case = create_case(incident)
    log_audit("incident.pipeline.completed", actor, log["tenant_id"], {"incident_id": incident_id, "case_id": case["id"]})

    redis_stream.publish("soc_events", {"type": "incident", "incident_id": incident_id, "risk": risk["risk_level"]})
    return {"incident": incident, "case": case}
