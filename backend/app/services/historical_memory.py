from app.core.store import store


def recent_incidents(limit: int = 20) -> list[dict]:
    return store.incidents[-limit:]
