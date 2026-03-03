from datetime import datetime, timezone, timedelta

POLICIES = {"Critical": 1, "High": 4, "Medium": 24, "Low": 72}


def calculate_sla(risk_level: str, created_at: str) -> dict:
    hours = POLICIES.get(risk_level, 72)
    created = datetime.fromisoformat(created_at)
    deadline = created + timedelta(hours=hours)
    remaining = deadline - datetime.now(timezone.utc)
    return {
        "policy_hours": hours,
        "deadline": deadline.isoformat(),
        "remaining_minutes": max(0, int(remaining.total_seconds() // 60)),
    }
