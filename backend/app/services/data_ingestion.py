from app.services.log_parser import parse_log
from app.services.dataset_loader import load_dataset


def ingest_manual(payload: dict) -> dict:
    return parse_log(payload)


def ingest_dataset() -> list[dict]:
    return [parse_log(item) for item in load_dataset()]
