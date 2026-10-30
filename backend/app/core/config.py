import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "BiblioBox — Movie & Book Library"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"

    # PostgreSQL Database URL
    # Can be configured via environment variable DATABASE_URL
    # Supports postgresql:// or postgresql+psycopg2://
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./library.db" # Default local fallback if cloud PostgreSQL isn't configured yet
    )

    # JWT Authentication Configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "athenaeum_super_secure_jwt_secret_change_in_production_key_2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def normalized_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url


settings = Settings()
