def query_virustotal(ioc: str) -> dict:
    score = 90 if ioc in {"1.2.3.4", "5.5.5.5"} else 20
    return {"engine": "VirusTotal", "malware_detection": score > 50, "score": score}
