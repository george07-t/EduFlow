from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:george07@localhost:5432/eduflow"
    SECRET_KEY: str = "supersecretkey-change-this-in-production-must-be-32-chars-min"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    UPLOAD_DIR: str = "./uploads"
    BASE_URL: str = "http://localhost:8000"
    ENVIRONMENT: str = "development"

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
