def generate_playbook(analysis: dict, intel: dict) -> dict:
    actions = [
        "Contain affected endpoint",
        "Isolate host from network",
        "Block malicious IOC on firewall",
        "Recover credentials and enforce MFA",
        "Collect forensic memory dump",
    ]
    return {"strategy": analysis["classification"], "actions": actions, "intel": intel["reputation_score"]}
