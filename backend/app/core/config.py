from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    DATABASE_URL: str = "sqlite:///./factory.db"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    READING_RETENTION_MINUTES: int = 120
    SIMULATION_TICK_SECONDS: float = 1.0
    SIMULATION_DEFAULT_SPEED: float = 1.0

    # Scoring & Intelligence weights
    WEIGHT_HEALTH_DEFICIT: float = 0.45
    WEIGHT_RATE_OF_CHANGE: float = 0.25
    WEIGHT_DOWNSTREAM_EXPOSURE: float = 0.20
    WEIGHT_LIFECYCLE_URGENCY: float = 0.10

    # Hysteresis ticks
    HYSTERESIS_UPGRADE_TICKS: int = 3
    HYSTERESIS_DOWNGRADE_TICKS: int = 10

    # Isolation Forest
    IF_MAX_PENALTY: float = 15.0
    IF_CONTAMINATION: float = 0.03

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]


settings = Settings()
