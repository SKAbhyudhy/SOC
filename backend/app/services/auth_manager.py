from app.core.store import store
from app.core.security import verify_password, create_access_token


def login(username: str, password: str) -> dict | None:
    user = store.users.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    token = create_access_token(username)
    return {"access_token": token, "token_type": "bearer", "role": user["role"], "tenant_id": user["tenant_id"]}
