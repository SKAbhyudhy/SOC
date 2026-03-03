def detect_threat(parsed_log: dict) -> dict:
    severity = parsed_log["severity"]
    message = parsed_log["message"].lower()
    category = "phishing" if "credential" in message else "malware" if "powershell" in message else "anomaly"
    return {
        "detected": severity >= 5,
        "category": category,
        "severity": severity,
        "signal_strength": min(1.0, severity / 10),
    }
