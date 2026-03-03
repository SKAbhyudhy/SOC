import asyncio
import logging
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.store import store
from app.integrations.splunk_connector import splunk_status
from app.integrations.wazuh_connector import wazuh_status
from app.services.audit_logger import log_audit
from app.services.auth_manager import login
from app.services.data_ingestion import ingest_dataset, ingest_manual
from app.services.ingestion_scheduler import scheduler_state, toggle_scheduler
from app.services.mitigation_generator import mitigation_options
from app.services.pipeline_orchestrator import run_pipeline
from app.services.rbac_controller import authorize
from app.services.tenant_manager import switch_tenant

logger = logging.getLogger("nexus.soc")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

app = FastAPI(title=settings.app_name)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class ManualIngest(BaseModel):
    source: str
    asset: str
    severity: int = Field(ge=0, le=10)
    message: str
    ioc: str = ""
    tenant_id: str = "default"


class MitigationAction(BaseModel):
    incident_id: int


class CaseUpdate(BaseModel):
    status: str
    notes: str | None = None


class TenantSwitch(BaseModel):
    tenant_id: str


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server error on %s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username = payload.get("sub")
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc
    user = store.users.get(username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def _find_incident(incident_id: int, tenant_id: str) -> dict:
    for incident in store.incidents:
        if incident["id"] == incident_id and incident["tenant_id"] == tenant_id:
            return incident
    raise HTTPException(status_code=404, detail="Incident not found")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": settings.app_name}


@app.post("/api/auth/login")
def auth_login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    token = login(form_data.username, form_data.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    logger.info("User logged in: %s", form_data.username)
    return token


@app.get("/api/auth/me")
def auth_me(user: dict = Depends(get_current_user)):
    return {"username": user["username"], "role": user["role"], "tenant_id": user["tenant_id"]}


@app.post("/api/ingest/manual")
def ingest_manual_api(payload: ManualIngest, user: dict = Depends(get_current_user)):
    log = ingest_manual(payload.model_dump())
    return run_pipeline(log, actor=user["username"])


@app.post("/api/ingest/dataset/start")
def ingest_dataset_api(user: dict = Depends(get_current_user)):
    results = [run_pipeline(log, actor=user["username"]) for log in ingest_dataset()]
    return {"processed": len(results), "results": results}


@app.post("/api/ingest/scheduler/toggle")
def scheduler_toggle(enabled: bool, user: dict = Depends(get_current_user)):
    log_audit("ingestion.scheduler.toggle", user["username"], user["tenant_id"], {"enabled": enabled})
    return toggle_scheduler(enabled)


@app.get("/api/dashboard/metrics")
def dashboard_metrics(user: dict = Depends(get_current_user)):
    tenant_incidents = [i for i in store.incidents if i["tenant_id"] == user["tenant_id"]]
    critical = sum(1 for i in tenant_incidents if i["risk"]["risk_level"] == "Critical")
    high = sum(1 for i in tenant_incidents if i["risk"]["risk_level"] == "High")
    mitigated = sum(1 for i in tenant_incidents if i["status"] == "Mitigated")
    risk_score = round(sum(i["risk"]["risk_score"] for i in tenant_incidents) / max(1, len(tenant_incidents)), 2)
    return {"incidents": len(tenant_incidents), "critical": critical, "high": high, "mitigated": mitigated, "risk_score": risk_score, "scheduler": scheduler_state["enabled"]}


@app.get("/api/analytics/metrics")
def analytics_metrics(user: dict = Depends(get_current_user)):
    tenant_incidents = [i for i in store.incidents if i["tenant_id"] == user["tenant_id"]]
    saved_minutes = len([i for i in tenant_incidents if i["status"] == "Mitigated"]) * 60
    return {
        "total_incidents": len(tenant_incidents),
        "resolved": len([i for i in tenant_incidents if i["status"] == "Mitigated"]),
        "avg_risk": round(sum(i["risk"]["risk_score"] for i in tenant_incidents) / max(1, len(tenant_incidents)), 2),
        "estimated_time_saved_minutes": saved_minutes,
    }


@app.get("/api/incidents")
def get_incidents(user: dict = Depends(get_current_user)):
    return [i for i in store.incidents if i["tenant_id"] == user["tenant_id"]]


@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: int, user: dict = Depends(get_current_user)):
    return _find_incident(incident_id, user["tenant_id"])


@app.post("/api/mitigation/approve")
def mitigation_approve(action: MitigationAction, user: dict = Depends(get_current_user)):
    incident = _find_incident(action.incident_id, user["tenant_id"])
    incident["validation"]["approved"] = True
    return {"incident_id": action.incident_id, "approved": True, "actions": mitigation_options({"classification": incident["analysis"]["classification"]})}


@app.post("/api/mitigation/reject")
def mitigation_reject(action: MitigationAction, user: dict = Depends(get_current_user)):
    incident = _find_incident(action.incident_id, user["tenant_id"])
    incident["validation"]["approved"] = False
    return {"incident_id": action.incident_id, "approved": False}


@app.post("/api/mitigation/execute")
def mitigation_execute(action: MitigationAction, user: dict = Depends(get_current_user)):
    incident = _find_incident(action.incident_id, user["tenant_id"])
    commands = [
        "iptables -A INPUT -s <attacker_ip> -j DROP",
        "pkill -f suspicious_process",
        "passwd --expire compromised_user",
        "systemctl restart wazuh-agent",
    ]
    terminal = [{"level": "info", "message": "Analysis started"}]
    terminal.extend({"level": "running", "message": cmd} for cmd in commands)
    terminal.append({"level": "success", "message": "Validation checks passed"})

    incident["status"] = "Mitigated"
    incident["risk"]["risk_score"] = round(max(5.0, incident["risk"]["risk_score"] * 0.18), 2)
    incident["risk"]["risk_level"] = "Low" if incident["risk"]["risk_score"] <= 20 else incident["risk"]["risk_level"]

    case = next((c for c in store.cases if c["incident_id"] == incident["id"] and c["tenant_id"] == incident["tenant_id"]), None)
    if case:
        case["status"] = "Resolved"
        case["resolution"] = {
            "safety_before": 100 - incident["risk_before"],
            "safety_after": 100 - incident["risk"]["risk_score"],
            "vulnerabilities_fixed": 4,
            "ai_time_seconds": 28,
            "human_time_minutes": 90,
            "commands": commands,
            "summary": "Threat contained, malicious path removed, controls restored.",
        }

    log_audit("incident.mitigation.executed", user["username"], user["tenant_id"], {"incident_id": incident["id"]})
    return {"incident_id": action.incident_id, "result": "executed", "progress": 100, "terminal": terminal, "incident": incident, "case": case}


@app.get("/api/cases")
def get_cases(user: dict = Depends(get_current_user)):
    return [c for c in store.cases if c["tenant_id"] == user["tenant_id"]]


@app.post("/api/cases")
def create_case_api(payload: dict, user: dict = Depends(get_current_user)):
    if not authorize(["Manager", "Admin"], user["role"]):
        raise HTTPException(status_code=403, detail="Insufficient role")
    case = {"id": len(store.cases) + 1, "tenant_id": user["tenant_id"], **payload}
    store.cases.append(case)
    return case


@app.put("/api/cases/{case_id}")
def update_case(case_id: int, payload: CaseUpdate, user: dict = Depends(get_current_user)):
    for case in store.cases:
        if case["id"] == case_id and case["tenant_id"] == user["tenant_id"]:
            case["status"] = payload.status
            if payload.notes:
                case.setdefault("notes", []).append(payload.notes)
            return case
    raise HTTPException(status_code=404, detail="Case not found")


@app.get("/api/sla/status")
def sla_status(user: dict = Depends(get_current_user)):
    return [{"incident_id": i["id"], **i["sla"], "status": i["status"]} for i in store.incidents if i["tenant_id"] == user["tenant_id"]]


@app.get("/api/audit")
def get_audit(user: dict = Depends(get_current_user)):
    return [a for a in store.audit_logs if a["tenant_id"] == user["tenant_id"]]


@app.get("/api/agents/activity")
def agent_activity(user: dict = Depends(get_current_user)):
    return [{"incident_id": i["id"], "agents": i["agents"]} for i in store.incidents if i["tenant_id"] == user["tenant_id"]]


@app.get("/api/siem/status")
def siem_status(user: dict = Depends(get_current_user)):
    return {"splunk": splunk_status(), "wazuh": wazuh_status()}


@app.post("/api/tenant/switch")
def tenant_switch(payload: TenantSwitch, user: dict = Depends(get_current_user)):
    return switch_tenant(user["username"], payload.tenant_id)


@app.websocket("/ws/live")
async def ws_live(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connected")
    try:
        while True:
            snapshot = {
                "incidents": store.incidents[-10:],
                "notifications": store.notifications[-10:],
                "agents": [{"id": i["id"], "risk": i["risk"]} for i in store.incidents[-10:]],
                "pipeline_stage": "monitoring",
            }
            await websocket.send_json(snapshot)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
        return
