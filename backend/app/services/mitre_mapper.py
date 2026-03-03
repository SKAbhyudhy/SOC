MAP = {
    "malware": {"tactic": "Execution", "technique_id": "T1059", "description": "Command and Scripting Interpreter"},
    "phishing": {"tactic": "Initial Access", "technique_id": "T1566", "description": "Phishing"},
    "anomaly": {"tactic": "Discovery", "technique_id": "T1087", "description": "Account Discovery"},
}


def map_to_mitre(classification: str) -> dict:
    return MAP.get(classification, MAP["anomaly"])
