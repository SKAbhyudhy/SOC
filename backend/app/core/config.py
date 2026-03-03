from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "NEXUS SOC Command Center"
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    redis_url: str = "redis://redis:6379/0"
    ollama_url: str = "http://ollama:11434"
    ollama_model: str = "mistral:7b"
    virustotal_api_key: str = ""
    abuseipdb_api_key: str = ""
    otx_api_key: str = ""


settings = Settings()
