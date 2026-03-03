def score_risk(severity: int, confidence_pct: float, asset_criticality: float = 1.0) -> dict:
    raw = severity * confidence_pct * asset_criticality
    risk = round(min(100.0, raw / 10), 2)
    if risk >= 81:
        level = "Critical"
    elif risk >= 61:
        level = "High"
    elif risk >= 31:
        level = "Medium"
    else:
        level = "Low"
    return {"risk_score": risk, "risk_level": level}
