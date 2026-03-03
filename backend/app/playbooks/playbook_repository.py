playbook_store: list[dict] = []


def save_playbook(playbook: dict) -> None:
    playbook_store.append(playbook)
