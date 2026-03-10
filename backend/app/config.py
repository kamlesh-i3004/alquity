from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Security / JWT
    SECRET_KEY: str = "change_me_to_a_long_random_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    DATABASE_URL: str = "sqlite:///./aiquity.db"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # External APIs
    NEWS_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # App
    DEBUG: bool = True


settings = Settings()
