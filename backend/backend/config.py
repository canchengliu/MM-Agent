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
    # Redis settings are now loaded from the .env file instead of being hardcoded.
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_DB: int
    REDIS_USERNAME: str | None = None
    REDIS_PASSWORD: str | None = None
    # REDIS_URL will be assembled by the model_validator below if not provided directly.
    REDIS_URL: RedisDsn | None = None

    # --- Logging ---
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "console"  # Use "json" for structured logs

    # --- Security and Authentication (R1, R7.3) ---
    # Security settings are now loaded from the .env file.
    SECRET_KEY: str
    ENCRYPTION_KEY: str = "R2JofR3Im5x4f8IinLcs3jJ5Hh2R90g6Z_u-d23o1oQ="  # Default for dev if not in .env
    # Use alias to match JWT_ALGORITHM in .env file
    ALGORITHM: str = Field(default="HS256", alias="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int

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

        # If REDIS_URL is explicitly set in the environment, use it.
        if self.REDIS_URL and "REDIS_URL" in self.model_fields_set:
            return self

        # Otherwise, build it from the component parts.
        path = str(self.REDIS_DB or 0)
        built_url = RedisDsn.build(
            scheme=self.REDIS_SCHEME,
            username=self.REDIS_USERNAME,
            password=self.REDIS_PASSWORD,
            host=self.REDIS_HOST,
            port=self.REDIS_PORT,
            path=path,
        )

        # Set the assembled URL on the settings object.
        self.REDIS_URL = built_url
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
    # These settings correctly use aliases to load from the .env file,
    # overriding the defaults if present.
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