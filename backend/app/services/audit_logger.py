from app.core.store import store


def log_audit(event: str, actor: str, tenant_id: str, metadata: dict | None = None) -> None:
    store.audit_logs.append({
        "timestamp": store.now(),
        "event": event,
        "actor": actor,
        "tenant_id": tenant_id,
        "metadata": metadata or {},
    })
