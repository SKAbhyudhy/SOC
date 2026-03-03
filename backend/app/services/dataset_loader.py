SAMPLE_DATASET = [
    {"source": "wazuh", "asset": "srv-01", "severity": 9, "message": "Suspicious PowerShell execution", "ioc": "1.2.3.4"},
    {"source": "splunk", "asset": "db-01", "severity": 7, "message": "Credential stuffing attempts", "ioc": "8.8.8.8"},
]


def load_dataset() -> list[dict]:
    return SAMPLE_DATASET
