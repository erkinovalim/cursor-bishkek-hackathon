from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    database_url: str = "sqlite:///./app.db"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_timezone: str = "UTC"
    daily_quest_hour: int = 0
    daily_quest_minute: int = 0


settings = Settings()
