from datetime import datetime, timezone


class InMemoryStore:
    def __init__(self) -> None:
        self.users = {
            "admin": {
                "username": "admin",
                "hashed_password": "$2b$12$3VNAWL0LWYv6x9eSBfNNeekTxD9EUANaI3Wt3fEFD6M4d9XanvR7i",  # admin123
                "role": "Admin",
                "tenant_id": "default",
            }
        }
        self.incidents: list[dict] = []
        self.cases: list[dict] = []
        self.audit_logs: list[dict] = []
        self.agent_activity: list[dict] = []
        self.notifications: list[dict] = []
        self.tenants = {"default": {"name": "Default Tenant"}, "acme": {"name": "Acme Corp"}}
        self.siem_status = {"splunk": "connected", "wazuh": "connected"}

    def now(self) -> str:
        return datetime.now(timezone.utc).isoformat()


store = InMemoryStore()
