from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:change-me-db-password@localhost:5432/eduflow"
    SECRET_KEY: str = "replace-with-a-strong-32+char-secret"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    UPLOAD_DIR: str = "./uploads"
    BASE_URL: str = "http://localhost:8000"
    ENVIRONMENT: str = "development"

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    def validate_runtime(self) -> None:
        if self.ENVIRONMENT != "production":
            return

        if len(self.SECRET_KEY) < 32 or "change-this" in self.SECRET_KEY:
            raise ValueError("SECRET_KEY must be set to a strong value in production")

        if "localhost" in self.BASE_URL:
            raise ValueError("BASE_URL must be a public HTTPS URL in production")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
