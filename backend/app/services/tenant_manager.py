from app.core.store import store


def switch_tenant(username: str, tenant_id: str) -> dict:
    if tenant_id not in store.tenants:
        raise ValueError("tenant not found")
    store.users[username]["tenant_id"] = tenant_id
    return {"username": username, "tenant_id": tenant_id}
