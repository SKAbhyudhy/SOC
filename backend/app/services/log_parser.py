from typing import Any


def parse_log(raw_log: dict[str, Any]) -> dict[str, Any]:
    return {
        "source": raw_log.get("source", "manual"),
        "asset": raw_log.get("asset", "unknown"),
        "severity": raw_log.get("severity", 5),
        "message": raw_log.get("message", ""),
        "ioc": raw_log.get("ioc", ""),
        "tenant_id": raw_log.get("tenant_id", "default"),
        "timestamp": raw_log.get("timestamp"),
    }
