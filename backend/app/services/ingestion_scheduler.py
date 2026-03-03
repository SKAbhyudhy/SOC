scheduler_state = {"enabled": False}


def toggle_scheduler(enabled: bool) -> dict:
    scheduler_state["enabled"] = enabled
    return scheduler_state
