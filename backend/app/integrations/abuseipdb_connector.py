def query_abuseipdb(ioc: str) -> dict:
    confidence = 85 if ioc in {"1.2.3.4", "8.8.8.8"} else 15
    return {"engine": "AbuseIPDB", "abuse_confidence": confidence}
