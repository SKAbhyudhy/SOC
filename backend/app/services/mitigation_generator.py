def mitigation_options(analysis: dict) -> list[str]:
    return [
        f"Block IOC linked to {analysis['classification']}",
        "Quarantine host",
        "Reset impacted credentials",
    ]
