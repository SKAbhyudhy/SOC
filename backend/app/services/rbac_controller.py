def authorize(required_roles: list[str], role: str) -> bool:
    return role in required_roles
