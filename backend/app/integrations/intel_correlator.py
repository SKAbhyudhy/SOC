def correlate_intel(vt: dict, abuse: dict) -> dict:
    reputation = round((vt["score"] + abuse["abuse_confidence"]) / 2, 2)
    actors = ["APT-NEXUS"] if reputation > 70 else ["Unknown"]
    cves = ["CVE-2024-3094"] if vt["malware_detection"] else []
    return {"reputation_score": reputation, "threat_actors": actors, "cves": cves}
