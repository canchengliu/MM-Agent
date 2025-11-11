import base64
from pathlib import Path

from pydantic import AliasChoices, Field, RedisDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Define a base directory for the project
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """
    Runtime configuration for the O-Award Modeling Platform.
    Loads values from environment variables and a .env file.
    """

    # --- Core Application Settings ---
    DATABASE_URL: str
    REDIS_SCHEME: str = "redis"
    REDIS_HOST: str = "10.120.16.27"
    REDIS_PORT: int = 7379
    REDIS_DB: int = 0
    REDIS_USERNAME: str | None = None
    REDIS_PASSWORD: str = 'another_secure_password'
    REDIS_URL: RedisDsn = "redis://:another_secure_password@10.120.16.27:7379/0 "

    # --- Logging ---
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "console"  # Use "json" for structured logs

    # --- Security and Authentication (R1, R7.3) ---
    SECRET_KEY: str = "a_very_insecure_default_secret_key_for_jwt"
    ENCRYPTION_KEY: str = "R2JofR3Im5x4f8IinLcs3jJ5Hh2R90g6Z_u-d23o1oQ="  # Insecure default
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if v == "a_very_insecure_default_secret_key_for_jwt":
            print(  # Use print as logger might not be configured yet
                "WARNING: Using default insecure SECRET_KEY. "
                "Please set a strong, random key in your environment for production."
            )
        return v

    @field_validator("ENCRYPTION_KEY")
    @classmethod
    def validate_encryption_key(cls, v: str) -> str:
        """Validate that the encryption key is 32 url-safe base64-encoded bytes."""
        try:
            # The key must be 32 bytes after decoding.
            if len(base64.urlsafe_b64decode(v)) != 32:
                raise ValueError("Encryption key must be 32 url-safe base64-encoded bytes.")
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid ENCRYPTION_KEY: {e}") from e
        return v

    @model_validator(mode="after")
    def assemble_redis_url(self):
        """
        Build the Redis DSN from individual components if a full URL is not provided.

        This allows users to configure Redis via either REDIS_URL or the granular
        REDIS_* fields inside their environment (including .env files).
        """

        if "REDIS_URL" in self.model_fields_set:
            return self

        path = str(self.REDIS_DB or 0)
        built_url = RedisDsn.build(
            scheme=self.REDIS_SCHEME,
            username=self.REDIS_USERNAME,
            password=self.REDIS_PASSWORD,
            host=self.REDIS_HOST,
            port=self.REDIS_PORT,
            path=path,
        )

        # object.__setattr__(self, "REDIS_URL", RedisDsn(built_url))
        return self

    @model_validator(mode="after")
    def normalize_database_url(self):
        """Ensure SQLite URLs defined in .env resolve to absolute paths."""
        prefix = "sqlite:///"
        if self.DATABASE_URL.startswith(prefix) and not self.DATABASE_URL.startswith("sqlite:////"):
            relative_path = self.DATABASE_URL.replace(prefix, "", 1)
            absolute_path = (BASE_DIR / relative_path).resolve()
            object.__setattr__(self, "DATABASE_URL", f"sqlite:///{absolute_path}")

        if "+asyncpg" in self.DATABASE_URL:
            # Application code uses synchronous SQLAlchemy sessions, so ensure we do not
            # accidentally bind the asyncpg dialect which requires greenlet contexts.
            sync_url = self.DATABASE_URL.replace("+asyncpg", "+psycopg", 1)
            print(  # Use print because loggers might not yet exist
                "INFO: Converting DATABASE_URL to psycopg driver for compatibility with sync sessions."
            )
            object.__setattr__(self, "DATABASE_URL", sync_url)
        return self

    # --- File Storage (R3.2) ---
    # Use an absolute path for storage relative to the project root
    STORAGE_BASE_PATH: Path = BASE_DIR / "project_storage"

    # --- WebSocket ---
    WEBSOCKET_BROADCAST_CHANNEL: str = "workflow_events"

    # --- Legacy/Temporary Settings (to be refactored) ---
    EXTERNAL_DATA_DIR: str = str(BASE_DIR / "external_data_simulation")
    LLM_MODEL_NAME: str = Field(
        default="Qwen/Qwen3-VL-8B-Instruct",
        validation_alias=AliasChoices("LLM_MODEL_NAME", "MODEL_NAME"),
    )
    LLM_BASE_URL: str | None = Field(
        default="https://api.siliconflow.cn/v1",
        validation_alias=AliasChoices("LLM_BASE_URL", "BASE_URL"),
    )
    LLM_API_KEY: str | None = Field(
        default=None,
        validation_alias=AliasChoices("LLM_API_KEY", "API_KEY"),
    )
    LLM_PROVIDER: str = Field(
        default="openai",
        validation_alias=AliasChoices("LLM_PROVIDER", "PROVIDER"),
    )
    E2B_API_KEY: str | None = None
    DEFAULT_TEMPERATURE: float = 0.1

    model_config = SettingsConfigDict(
        env_file=f"{BASE_DIR}/.env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
