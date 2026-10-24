from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    frontend_origin: str = "http://localhost:5173"
    max_upload_mb: int = 10


@lru_cache()
def get_settings() -> Settings:
    return Settings()
