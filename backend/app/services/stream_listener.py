from app.services.siem_normalizer import normalize_alert


def ingest_stream_event(event: dict) -> dict:
    return normalize_alert(event)
