def normalize_alert(alert: dict) -> dict:
    return {
        "source": alert.get("source", "siem"),
        "message": alert.get("message", ""),
        "severity": int(alert.get("severity", 5)),
        "asset": alert.get("asset", "unknown"),
        "ioc": alert.get("ioc", ""),
        "tenant_id": alert.get("tenant_id", "default"),
    }
