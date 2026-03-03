KB = {
    "malware": ["ATT&CK T1059", "CVE-2024-3094", "Contain host and scan memory"],
    "phishing": ["ATT&CK T1566", "User mailbox compromise patterns", "Reset credentials and enforce MFA"],
    "anomaly": ["Baseline deviation from SIEM event volume", "Investigate with endpoint telemetry"],
}


def knowledge_lookup(topic: str) -> list[str]:
    return KB.get(topic, KB["anomaly"])
