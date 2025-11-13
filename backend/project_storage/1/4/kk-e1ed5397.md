# Folder Structure of /Users/ann/Documents/projects/MM-Agent/backend/backend

## backend
 - __init__.py
 - alembic.ini
 - config.py
 - database.py
 - exceptions.py
 - logging_config.py
 - main.py
 - redis.py
 - task_names.py
 - worker.py
 - ws_manager.py

### __init__.py Content:

```py
"""Backend package for the O-Award Workflow Engine."""


```

### alembic.ini Content:

```ini
# A generic Alembic configuration file.
# https://alembic.sqlalchemy.org/en/latest/tutorial.html#create-a-config-file

[alembic]
# Path to the migration script directory.
# The path is relative to the location of this ini file.
script_location = alembic

# A file name for the log output, or 'stdout' to log to the console.
# logging_file_name = alembic.log

# The name of the alembic version table.
# version_table = alembic_version


[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S

```

### config.py Content:

```py
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
    ENCRYPTION_KEY: str
    # Use alias to match JWT_ALGORITHM in .env file
    ALGORITHM: str = Field(default="HS256", alias="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    @field_validator("ENCRYPTION_KEY")
    @classmethod
    def validate_encryption_key(cls, v: str) -> str:
        """Validate that the encryption key is 32 url-safe base64-encoded bytes."""
        if not v:
            raise ValueError("ENCRYPTION_KEY must be set in the environment variables (.env).")
        try:
            # The key must be 32 bytes after decoding.
            if len(base64.urlsafe_b64decode(v)) != 32:
                raise ValueError("Encryption key must be 32 url-safe base64-encoded bytes.")
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid ENCRYPTION_KEY format: {e}") from e
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
        
        # For password-only authentication (legacy mode), don't include username
        # Only include username if it's explicitly provided
        build_kwargs = {
            "scheme": self.REDIS_SCHEME,
            "password": self.REDIS_PASSWORD,
            "host": self.REDIS_HOST,
            "port": self.REDIS_PORT,
            "path": path,
        }
        
        # Only add username if it's explicitly set (not None)
        if self.REDIS_USERNAME is not None:
            build_kwargs["username"] = self.REDIS_USERNAME
        
        built_url = RedisDsn.build(**build_kwargs)

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

```

### database.py Content:

```py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


```

### exceptions.py Content:

```py
from typing import Any, Dict, Optional


class WorkflowException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        error_code: str = "WORKFLOW_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details


class NotFoundException(WorkflowException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=404, error_code="NOT_FOUND", details=details)


class InvalidStateException(WorkflowException):
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        error_code: str = "INVALID_STATE",
    ):
        super().__init__(message, status_code=409, error_code=error_code, details=details)


class ForbiddenException(WorkflowException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=403, error_code="FORBIDDEN", details=details)


class DependencyException(WorkflowException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=424, error_code="DEPENDENCY_FAILED", details=details)

```

### logging_config.py Content:

```py
import json
import logging
import sys

from loguru import logger

from backend.config import settings


class InterceptHandler(logging.Handler):
    """Redirect standard logging records to loguru."""

    def emit(self, record: logging.LogRecord):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def _json_formatter(record: dict) -> str:
    """Serialize log messages into structured JSON."""

    def serialize(log_record: dict) -> dict:
        payload = {
            "timestamp": log_record["time"].isoformat(),
            "level": log_record["level"].name,
            "message": log_record["message"],
            "name": log_record["name"],
        }
        payload.update(log_record["extra"])
        if log_record["exception"]:
            payload["exception"] = str(log_record["exception"])
        return payload

    record["extra"]["serialized"] = json.dumps(serialize(record))
    return "{extra[serialized]}\n"


def setup_logging() -> None:
    """Configure loguru sinks and intercept stdlib logging."""

    logger.remove()
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    if settings.LOG_FORMAT.lower() == "json":
        logger.add(
            sys.stdout,
            level=settings.LOG_LEVEL.upper(),
            format=_json_formatter,
            serialize=False,
        )
    else:
        logger.add(
            sys.stdout,
            colorize=True,
            level=settings.LOG_LEVEL.upper(),
            format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
            "<level>{message}</level>",
        )

    uvicorn_logger = logging.getLogger("uvicorn")
    uvicorn_logger.handlers = [InterceptHandler()]
    logging.getLogger("uvicorn.access").handlers = [InterceptHandler()]
    logging.getLogger("uvicorn.error").handlers = [InterceptHandler()]
    logger.info("Loguru logging configured.", log_format=settings.LOG_FORMAT, log_level=settings.LOG_LEVEL)

```

### main.py Content:

```py
import asyncio
import json
import os
from contextlib import asynccontextmanager

from arq.connections import ArqRedis
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from sqlalchemy.orm import Session
from sqlalchemy.sql import select

from backend.config import settings
from backend.database import get_db
from backend.exceptions import WorkflowException
from backend.logging_config import setup_logging
from backend.redis import close_redis_pool, get_redis_pool
from backend.routers import api_router
from backend.schemas.common import SystemInfo
from backend.schemas.error import ErrorResponse
from backend.utils.event_utils import broadcast_from_server

setup_logging()


async def redis_pubsub_listener():
    """Listen to Redis Pub/Sub and forward messages to WebSockets."""

    redis = await get_redis_pool()
    pubsub = redis.pubsub()
    await pubsub.subscribe(settings.WEBSOCKET_BROADCAST_CHANNEL)
    logger.info("Subscribed to Redis channel for workflow events", channel=settings.WEBSOCKET_BROADCAST_CHANNEL)
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if not message:
                await asyncio.sleep(0.05)
                continue
            if message.get("type") != "message":
                continue

            raw_data = message.get("data")
            if isinstance(raw_data, bytes):
                raw_data = raw_data.decode()

            try:
                payload = json.loads(raw_data)
            except json.JSONDecodeError:
                logger.error("Discarding malformed Redis payload", raw_data=raw_data)
                continue

            workflow_id = payload.get("workflow_id")
            if workflow_id is None:
                logger.warning("Dropping event without workflow_id", payload=payload)
                continue

            await broadcast_from_server(workflow_id, payload)
    except asyncio.CancelledError:
        logger.info("Redis listener task cancelled.")
        raise
    finally:
        try:
            await pubsub.unsubscribe(settings.WEBSOCKET_BROADCAST_CHANNEL)
        finally:
            await pubsub.close()
        logger.info("Redis Pub/Sub listener shut down cleanly.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure storage directory exists on startup
    logger.info("Ensuring storage directory exists...")
    os.makedirs(settings.STORAGE_BASE_PATH, exist_ok=True)

    # Database schema is now managed via Alembic migrations.
    logger.info("Skipping automatic table creation. Database schema is managed by Alembic.")
    listener_task = asyncio.create_task(redis_pubsub_listener())
    logger.info("Redis listener startup complete.")
    try:
        yield
    finally:
        listener_task.cancel()
        try:
            await listener_task
        except asyncio.CancelledError:
            logger.info("Redis listener task successfully cancelled.")

        await close_redis_pool()
        logger.info("Redis connection closed.")


app = FastAPI(
    title="O-Award Workflow Engine Backend - Optimized Implementation",
    version="2.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(WorkflowException)
async def workflow_exception_handler(request: Request, exc: WorkflowException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details,
        ).model_dump(exclude_none=True),
    )


# Include the API router which contains all routes with /api/v1 prefix
app.include_router(api_router)


@app.get("/", response_model=dict)
def read_root():
    return {"message": "Workflow Engine Backend (Optimized Version) is running."}


@app.get("/health", tags=["System"], response_model=dict)
async def health_check(
    db: Session = Depends(get_db),
    redis: ArqRedis = Depends(get_redis_pool),
):
    try:
        await redis.ping()
        db.execute(select(1))
        return {"status": "ok"}
    except Exception:
        logger.exception("Health check failed")
        raise HTTPException(status_code=503, detail="Service is unhealthy.")


@app.get("/system/info", tags=["System"], response_model=SystemInfo)
def system_info():
    return SystemInfo(app_version=app.version, llm_model_name=settings.LLM_MODEL_NAME)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

```

### redis.py Content:

```py
"""Redis/arq connection management utilities."""

from __future__ import annotations

from typing import Optional

from arq.connections import ArqRedis, RedisSettings, create_pool

from backend.config import settings

redis_pool: Optional[ArqRedis] = None


async def get_redis_pool() -> ArqRedis:
    """Return a lazily instantiated ArqRedis pool."""

    global redis_pool
    if redis_pool is None:
        # Use RedisSettings directly to have better control over authentication
        # This handles password-only authentication (legacy mode) correctly
        redis_settings = RedisSettings(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            database=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            username=settings.REDIS_USERNAME,  # None for password-only auth
        )
        redis_pool = await create_pool(redis_settings)
    return redis_pool


async def close_redis_pool() -> None:
    """Gracefully close the shared Redis pool if it exists."""

    global redis_pool
    if redis_pool is not None:
        await redis_pool.close()
        redis_pool = None

```

### task_names.py Content:

```py
"""Shared task name constants used by the worker/producer code."""

TASK_EXECUTE_NODE = "execute_node_task"

```

### worker.py Content:

```py
"""arq worker definition for executing node simulations."""

from __future__ import annotations

import asyncio
import traceback
from typing import Any, Dict

from arq.connections import RedisSettings
from loguru import logger
from sqlalchemy.orm import joinedload

from backend.config import settings
from backend.database import SessionLocal
from backend.logging_config import setup_logging
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, WorkflowInstance
from backend.schemas.events import EventType
from backend.schemas.node import NodeInstanceRead
from backend.services.node_service import NodeService
from backend.task_names import TASK_EXECUTE_NODE
from backend.utils.event_utils import broadcast_event

setup_logging()


async def execute_node_task(ctx: Dict[str, Any], node_id: int, **kwargs: Any) -> None:
    """arq background task that executes a node with resilient error handling."""

    with logger.contextualize(node_id=node_id, job_args=kwargs):
        logger.info("Worker received task to execute node")
        db = SessionLocal()
        try:
            node = (
                db.query(NodeInstance)
                .options(
                    joinedload(NodeInstance.workflow).joinedload(WorkflowInstance.project),
                    joinedload(NodeInstance.temporary_result),
                )
                .get(node_id)
            )
            if not node:
                logger.error("Node not found in database. Discarding job.")
                return

            if node.status != NodeStatus.EXECUTING:
                logger.warning(
                    "Worker picked up stale job for node. Discarding.",
                    node_status=node.status.value,
                )
                return

            node_service = NodeService(db)
            await node_service.execute_in_worker(node, **kwargs)

        except asyncio.CancelledError:
            logger.warning("Worker task aborted (cancelled by user).")
            db.close()
            await handle_cancellation(node_id)
            raise
        except Exception as exc:
            logger.exception("Worker task for node failed permanently.")
            fail_db = None
            try:
                fail_db = SessionLocal()
                node_to_fail = fail_db.query(NodeInstance).get(node_id)
                if node_to_fail and node_to_fail.status == NodeStatus.EXECUTING:
                    node_to_fail.status = NodeStatus.FAILED
                    node_to_fail.current_stage = ExecutionStage.FAILED
                    if node_to_fail.temporary_result:
                        node_to_fail.temporary_result.error_log = f"Worker Error: {exc}\n{traceback.format_exc()}"

                    fail_db.commit()
                    node_data = NodeInstanceRead.model_validate(node_to_fail).model_dump(mode="json")
                    await broadcast_event(
                        node_to_fail.workflow_instance_id,
                        EventType.NODE_STATUS_UPDATED,
                        node_data,
                        node_id=node_to_fail.id,
                    )
            except Exception:
                logger.exception(
                    "CRITICAL: Failed to update node status to FAILED after task error.",
                    failed_node_id=node_id,
                )
            finally:
                if fail_db:
                    fail_db.close()
        finally:
            db.close()
        logger.info("Worker finished task for node")


async def handle_cancellation(node_id: int):
    """Update the database state when a job is cancelled."""
    cleanup_db = None
    try:
        cleanup_db = SessionLocal()
        node_to_cancel = cleanup_db.query(NodeInstance).get(node_id)
        if node_to_cancel and node_to_cancel.status == NodeStatus.EXECUTING:
            node_to_cancel.status = NodeStatus.CANCELED
            node_to_cancel.current_stage = ExecutionStage.CANCELED
            if node_to_cancel.temporary_result:
                node_to_cancel.temporary_result.error_log = "Execution cancelled by user request (Job Aborted)."

            cleanup_db.commit()
            node_data = NodeInstanceRead.model_validate(node_to_cancel).model_dump(mode="json")
            await broadcast_event(
                node_to_cancel.workflow_instance_id,
                EventType.NODE_STATUS_UPDATED,
                node_data,
                node_id=node_to_cancel.id,
            )
        elif node_to_cancel:
            logger.info(
                "Job aborted but node {node_id} status was already {status}.",
                node_id=node_id,
                status=node_to_cancel.status.value,
            )
    except Exception:
        logger.exception(
            "CRITICAL: Failed to update node status after cancellation.",
            failed_node_id=node_id,
        )
        if cleanup_db:
            cleanup_db.rollback()
    finally:
        if cleanup_db:
            cleanup_db.close()


async def on_job_failure(ctx: Dict[str, Any], job: Any, exc: BaseException) -> None:
    """Log jobs that exhausted retries for easier inspection."""

    logger.error(
        "Job failed permanently after all retries.",
        job_function=job.function,
        job_args=job.args,
        exception=str(exc),
    )


class WorkerSettings:
    """arq worker configuration."""

    functions = [execute_node_task]
    # Use RedisSettings directly to handle password-only authentication correctly
    redis_settings = RedisSettings(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        database=settings.REDIS_DB,
        password=settings.REDIS_PASSWORD,
        username=settings.REDIS_USERNAME,  # None for password-only auth
    )
    job_timeout = 300  # 5 minutes
    on_job_failure = on_job_failure
    allow_abort_jobs = True


__all__ = ["WorkerSettings", "execute_node_task", "TASK_EXECUTE_NODE"]

```

### ws_manager.py Content:

```py
import json
from typing import Dict, List

from fastapi import WebSocket
from loguru import logger


class ConnectionManager:
    """
    Manages active WebSocket connections for the current process.

    This manager is designed to be process-local. It maintains a dictionary of active
    WebSocket connections, mapping a workflow_id to a list of clients interested in
    updates for that workflow.

    **Scalability in a Multi-Process Environment:**
    This approach is scalable when used with a message broker like Redis Pub/Sub.
    The overall architecture is as follows:
    1. An event occurs in the application (e.g., node status update).
    2. The application publishes this event to a shared Redis channel.
    3. Each running server process (e.g., each Gunicorn/Uvicorn worker) has a
       background task subscribed to this Redis channel.
    4. Upon receiving a message from Redis, the background task in each process
       calls this manager's `broadcast` method.
    5. This manager then sends the message to all WebSocket clients *connected to
       the current process*.

    This way, all clients receive the updates, regardless of which process they
    are connected to, without needing to share WebSocket objects across processes.
    The implementation in `main.py`'s `redis_pubsub_listener` follows this
    correct and scalable pattern.
    """

    def __init__(self):
        # This dictionary stores connections that exist *only* in the current process.
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, workflow_id: int, websocket: WebSocket):
        """Accepts a new WebSocket connection and adds it to the tracking dictionary."""
        await websocket.accept()
        self.active_connections.setdefault(workflow_id, []).append(websocket)
        logger.info(
            "WebSocket connected and registered for workflow_id={workflow_id}",
            workflow_id=workflow_id,
        )

    def disconnect(self, workflow_id: int, websocket: WebSocket):
        """Removes a WebSocket connection from the tracking dictionary."""
        connections = self.active_connections.get(workflow_id, [])
        try:
            connections.remove(websocket)
        except ValueError:
            # This can happen if the disconnect logic is called multiple times
            # or on a connection that was never fully registered. It's safe to ignore.
            pass

        # If no connections are left for this workflow, clean up the entry to save memory.
        if not connections and workflow_id in self.active_connections:
            del self.active_connections[workflow_id]

        logger.info(
            "WebSocket disconnected for workflow_id={workflow_id}",
            workflow_id=workflow_id,
        )

    async def broadcast(self, workflow_id: int, message: Dict):
        """
        Broadcasts a message to all clients connected to this process for a specific workflow.

        Note: This method only sends messages to clients managed by this specific
        server process. It relies on an external pub/sub system to be called in all
        processes for a full, application-wide broadcast.
        """
        connections = self.active_connections.get(workflow_id)
        if not connections:
            return

        payload = json.dumps(message, default=str)
        # Iterate over a copy of the list in case the list is modified during iteration
        # by a disconnect call, which would otherwise raise a RuntimeError.
        for connection in connections[:]:
            try:
                await connection.send_text(payload)
            except Exception as exc:  # Handles cases where the connection is already closed.
                logger.warning(
                    "Failed to send WebSocket message, disconnecting client.",
                    workflow_id=workflow_id,
                    error=str(exc),
                )
                self.disconnect(workflow_id, connection)


manager = ConnectionManager()
```

    ## auth
     - __init__.py
     - dependencies.py
     - security.py
     - service.py

### auth/__init__.py Content:

```py
"""
Authentication and Authorization (Auth) package.

This package encapsulates all logic related to user identity, access control,
and security primitives for the O-Award Modeling Platform. It will handle
user registration, login (JWT), password management, and API key encryption.
"""

```

### auth/dependencies.py Content:

```py
"""
FastAPI dependencies for authentication and authorization.

Provides reusable dependency functions that decode JWTs and ensure the
current user is active and verified before accessing protected endpoints.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError, jwt
from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.security import TokenType
from backend.config import settings
from backend.database import get_db
from backend.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Decode the JWT access token and fetch the corresponding user."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != TokenType.ACCESS.value:
            raise credentials_exception
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
    except JWTError:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except (TypeError, ValueError):
        raise credentials_exception

    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_verified_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensure the authenticated user is both active and verified.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account.")
    if not current_user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is not verified.")
    return current_user


async def get_user_from_token(token: str, db: Session) -> Optional[User]:
    """
    Decode a JWT specifically for WebSocket auth flows.

    Returns the user instance or None so callers can close the connection with a
    custom code instead of raising HTTPException.
    """
    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != TokenType.ACCESS.value:
            logger.warning("WebSocket auth failed: Invalid token type.")
            return None
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            logger.warning("WebSocket auth failed: 'sub' claim missing in token.")
            return None

        user_id = int(user_id_str)
        user = db.get(User, user_id)
        if user is None:
            logger.warning(
                "WebSocket auth failed: User ID {user_id} from token not found in DB.",
                user_id=user_id,
            )
            return None

        return user
    except ExpiredSignatureError:
        logger.info("WebSocket auth failed: Token has expired.")
        return None
    except (JWTError, ValueError, TypeError) as exc:
        logger.warning("WebSocket auth failed due to malformed token: {}", str(exc))
        return None

```

### auth/security.py Content:

```py
"""Core security utilities for password hashing, JWT, and BYOK encryption."""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Union

from cryptography.fernet import Fernet
from fastapi import HTTPException, status
from jose import ExpiredSignatureError, JWTError, jwt

from backend.config import settings

PASSWORD_SCHEME = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 390_000
PASSWORD_SALT_BYTES = 16

_fernet = Fernet(settings.ENCRYPTION_KEY)


class TokenType(str, Enum):
    """Defines the purpose of a JWT token."""

    ACCESS = "access"
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"


def _encode_bytes(raw: bytes) -> str:
    return base64.b64encode(raw).decode("utf-8")


def _decode_bytes(value: str) -> bytes:
    return base64.b64decode(value.encode("utf-8"))


def get_password_hash(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256.

    Returns a multi-part string containing the scheme, iterations, salt, and hash.
    """
    if not isinstance(password, str) or not password:
        raise ValueError("Password must be a non-empty string.")

    salt = secrets.token_bytes(PASSWORD_SALT_BYTES)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return f"{PASSWORD_SCHEME}${PASSWORD_ITERATIONS}${_encode_bytes(salt)}${_encode_bytes(derived)}"


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Compare a password to a stored PBKDF2 hash string.

    Returns True if the password matches, otherwise False.
    """
    try:
        scheme, iterations_str, salt_b64, hash_b64 = hashed_password.split("$")
        if scheme != PASSWORD_SCHEME:
            return False
        iterations = int(iterations_str)
        salt = _decode_bytes(salt_b64)
        stored_hash = _decode_bytes(hash_b64)
    except (ValueError, TypeError):
        return False

    new_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(new_hash, stored_hash)


def encrypt_data(value: Optional[Union[str, bytes]]) -> Optional[str]:
    """
    Encrypt arbitrary user-supplied data using the configured Fernet key.

    Returns the encrypted token as a string, or None if the input is falsy.
    """
    if value is None:
        return None

    raw_bytes = value if isinstance(value, bytes) else value.encode("utf-8")
    token = _fernet.encrypt(raw_bytes)
    return token.decode("utf-8")


def decrypt_data(value: Optional[Union[str, bytes]]) -> Optional[str]:
    """
    Decrypt previously encrypted data.

    Raises cryptography.fernet.InvalidToken if the value cannot be decrypted.
    """
    if value is None:
        return None

    token_bytes = value if isinstance(value, bytes) else value.encode("utf-8")
    plaintext = _fernet.decrypt(token_bytes)
    return plaintext.decode("utf-8")


def create_token(data: dict, token_type: TokenType, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT token for various purposes."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        if token_type == TokenType.ACCESS:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        elif token_type == TokenType.EMAIL_VERIFICATION:
            expire = datetime.utcnow() + timedelta(hours=24)
        elif token_type == TokenType.PASSWORD_RESET:
            expire = datetime.utcnow() + timedelta(minutes=15)
        else:
            raise ValueError("Unsupported token type")

    to_encode.update({"exp": expire, "type": token_type.value})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str, expected_type: TokenType) -> dict:
    """Decode and validate a JWT token, ensuring it matches the expected type."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != expected_type.value:
            raise JWTError("Invalid token type")
        return payload
    except ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        ) from exc
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate token: {exc}",
        ) from exc


def create_access_token(data: dict) -> str:
    """Create a signed JWT access token."""
    return create_token(data, TokenType.ACCESS)


__all__ = [
    "decrypt_data",
    "encrypt_data",
    "get_password_hash",
    "verify_password",
    "create_access_token",
    "create_token",
    "decode_token",
    "TokenType",
]

```

### auth/service.py Content:

```py
"""
Service layer for user authentication and lifecycle management.
Orchestrates user registration, credential verification (login), and
provides stubs for email verification and password reset flows.
"""
from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.security import (
    TokenType,
    create_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from backend.exceptions import ForbiddenException, InvalidStateException, WorkflowException
from backend.models.user import User, UserSettings
from backend.schemas.user import PasswordChange, UserCreate


class AuthService:
    """Service for user authentication and lifecycle management."""

    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Fetches a user by their email address."""
        return db.query(User).filter(User.email == email).first()

    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user by email and password.

        Args:
            db: The database session.
            email: The user's email.
            password: The user's plain-text password.

        Returns:
            The authenticated User object if credentials are valid, otherwise None.
        """
        user = self.get_user_by_email(db, email)
        if not user or not user.is_active:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    def register_user(self, db: Session, user_in: UserCreate) -> User:
        """
        Register a new user and create their default settings atomically.

        Args:
            db: The database session.
            user_in: A Pydantic model containing user creation data.

        Returns:
            The newly created User object.

        Raises:
            InvalidStateException: If a user with the email already exists.
        """
        if self.get_user_by_email(db, user_in.email):
            raise InvalidStateException(
                f"User with email '{user_in.email}' already exists.",
                error_code="USER_ALREADY_EXISTS",
            )

        hashed_password = get_password_hash(user_in.password)
        new_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            display_name=user_in.display_name or user_in.email.split("@")[0],
            is_active=True,
            is_verified=False,
        )
        new_user.settings = UserSettings()

        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            logger.info("New user registered successfully", user_id=new_user.id, email=new_user.email)
            return new_user
        except Exception:
            db.rollback()
            logger.exception("Failed to register new user. Transaction rolled back.", email=user_in.email)
            raise
    def change_password(self, db: Session, user: User, password_change: PasswordChange) -> None:
        """Change the password for an authenticated user."""
        if not verify_password(password_change.current_password, user.hashed_password):
            raise ForbiddenException("Incorrect current password.")

        new_hashed_password = get_password_hash(password_change.new_password)
        user.hashed_password = new_hashed_password
        db.commit()
        logger.info("Password changed successfully for user {}", user.id)

    def send_verification_email(self, db: Session, user: User) -> None:
        """Generate a verification token and simulate sending an email."""
        if user.is_verified:
            return

        token = create_token(data={"sub": str(user.id)}, token_type=TokenType.EMAIL_VERIFICATION)
        logger.info("SIMULATION: Sending verification email to {}", user.email)
        print(f"SIMULATION: Verification Token for {user.email}: {token}")

    def handle_resend_verification(self, db: Session, email: str) -> None:
        """Handles the request to resend verification."""
        user = self.get_user_by_email(db, email)
        if user:
            self.send_verification_email(db, user)
        else:
            logger.info("Resend verification requested for unknown email: {}", email)

    def verify_email(self, db: Session, token: str) -> User:
        """Verify the user's email using the provided token."""
        payload = decode_token(token, TokenType.EMAIL_VERIFICATION)
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise WorkflowException("Invalid token payload.", status_code=400)

        try:
            user_id = int(user_id_str)
        except ValueError as exc:
            raise WorkflowException("Invalid user ID in token.", status_code=400) from exc

        user = db.get(User, user_id)
        if not user:
            raise WorkflowException("User not found.", status_code=404)

        if user.is_verified:
            return user

        user.is_verified = True
        db.commit()
        db.refresh(user)
        logger.info("Email verified successfully for user {}", user.id)
        return user

    def initiate_password_reset(self, db: Session, email: str) -> None:
        """Generate a password reset token and simulate sending an email (R1.3)."""
        user = self.get_user_by_email(db, email)

        if user and user.is_active:
            token = create_token(data={"sub": str(user.id)}, token_type=TokenType.PASSWORD_RESET)
            logger.info("SIMULATION: Sending password reset email to {}", user.email)
            print(f"SIMULATION: Password Reset Token for {user.email}: {token}")
        else:
            logger.info("Password reset requested for email: {}. Silently handling.", email)

    def complete_password_reset(self, db: Session, token: str, new_password: str) -> None:
        """Verify the reset token and update the user's password (R1.3)."""
        payload = decode_token(token, TokenType.PASSWORD_RESET)
        user_id_str = payload.get("sub")

        if not user_id_str:
            raise WorkflowException("Invalid token payload.", status_code=400)

        try:
            user_id = int(user_id_str)
            user = db.get(User, user_id)
        except (ValueError, TypeError):
            raise WorkflowException("Invalid or expired token.", status_code=400)

        if not user:
            raise WorkflowException("Invalid or expired token.", status_code=400)

        if not user.is_active:
            raise ForbiddenException("Cannot reset password for an inactive account.")

        user.hashed_password = get_password_hash(new_password)
        db.commit()
        logger.info("Password reset successfully completed for user {}", user.id)

```

    ## data

        ## workflows
         - o_award_v1.yaml

### data/workflows/o_award_v1.yaml Content:

```yaml
id: o_award_v1
name: O-Award Modeling Workflow
terminal_node_suffix: ".2.2.2"

dynamic_task_templates:
  ".2.1.1":
    name_prefix: "Data Insights and Candidate Model Generation"
    stage_name_prefix: "Data & Model Generation"
    type: Standard
    hitl_mode: SCA
    inputs: {}
    outputs:
      - sca_output_wrapper
    inherits_external_inputs: true
    handler_type: GenericSCAHandler
    sca_selection_mode: Single
    export_config:
      handler: intermediate_json
      behavior:
        variant: model_candidates

  ".2.1.2":
    name_prefix: "Mathematical Formulation and Computational Design"
    stage_name_prefix: "Data & Model Generation"
    type: Standard
    hitl_mode: AVL
    inputs:
      __PREVIOUS_IN_TASK__:
        - sca_output_wrapper
    outputs:
      - math_formulation
      - execution_blueprint
    inherits_external_inputs: false
    handler_type: GenericAVLHandler
    export_config:
      handler: intermediate_json
      behavior:
        variant: formulation

  ".2.2.1":
    name_prefix: "Code Generation and Automatic Execution"
    stage_name_prefix: "Code & Execution"
    type: Standard
    hitl_mode: VARL
    inputs:
      __PREVIOUS_IN_TASK__:
        - execution_blueprint
    outputs:
      - raw_results
      - vv_data
      - sensitivity_data
    inherits_external_inputs: true
    handler_type: CodeExecutionHandler
    export_config:
      handler: code_artifacts
      code_keys:
        - generated_code.py
        - execution.log
        - error.log
      behavior:
        include_vv_data: true

  ".2.2.2":
    name_prefix: "Robustness Analysis and Strategic Visualization"
    stage_name_prefix: "Code & Execution"
    type: Standard
    hitl_mode: SCA
    inputs:
      __PREVIOUS_IN_TASK__:
        - raw_results
        - vv_data
        - sensitivity_data
    outputs:
      - sca_output_wrapper
      - vv_report
      - key_output_doc
    inherits_external_inputs: false
    handler_type: GenericSCAHandler
    sca_selection_mode: Multiple
    export_config:
      handler: intermediate_json
      behavior:
        variant: visualization
        visualization_candidates: true

structure:
  - id: "1.1.1"
    name: "Problem Deconstruction and Mathematical Formulation"
    phase: "Phase 1: Strategic Analysis & Macro Architecture"
    stage_id: "1.1"
    stage_name: "Strategic Definition"
    type: Standard
    hitl_mode: AVL
    dependencies: {}
    external_inputs:
      - Problem Statement
      - Datasets
    handler_type: GenericAVLHandler
    export_config:
      handler: intermediate_json

  - id: "1.1.2"
    name: "Architecture Design and Task Decomposition"
    phase: "Phase 1: Strategic Analysis & Macro Architecture"
    stage_id: "1.1"
    stage_name: "Strategic Definition"
    type: Generator
    hitl_mode: SCA
    dependencies:
      "1.1.1":
        required_fields:
          - Formal Problem Restatement
          - Global Assumption Framework
    external_inputs: []
    handler_type: TaskbookGeneratorHandler
    sca_selection_mode: Single
    export_config:
      handler: intermediate_json
      behavior:
        variant: taskbook
    generates_task_id_from: "Structured Modeling Taskbook"

  - id: "3.1.1"
    name: "Global Logic Integration and Strategic Narrative Construction"
    phase: "Phase 3: Global Synthesis & O-Award Paper Forging"
    stage_id: "3.1"
    stage_name: "Global Logic & Narrative"
    type: Standard
    hitl_mode: SCA
    dependencies:
      "1.1.1":
        required_fields:
          - Formal Problem Restatement
      "1.1.2":
        required_fields:
          - Structured Modeling Taskbook
    external_inputs: []
    handler_type: NarrativeSynthesisHandler
    sca_selection_mode: Single
    export_config:
      handler: intermediate_json

  - id: "3.1.2"
    name: "Paper Forging and Professional Optimization"
    phase: "Phase 3: Global Synthesis & O-Award Paper Forging"
    stage_id: "3.1"
    stage_name: "Global Logic & Narrative"
    type: Standard
    hitl_mode: VARL
    dependencies:
      "3.1.1":
        required_fields:
          - Thesis Statement
          - Narrative Outline
    external_inputs: []
    handler_type: FinalPaperHandler
    export_config:
      handler: final_paper
      paper_key: "Submission-Ready Paper"
      filename: "O-Award Paper.md"

```

    ## models
     - __init__.py
     - enum_utils.py
     - project.py
     - user.py
     - workflow.py

### models/__init__.py Content:

```py
"""
SQLAlchemy Models Package.

This file provides a centralized export of all data models and their associated enums,
making them easily importable from a single location (e.g., `from backend.models import User`).
"""

# Project Models
from backend.models.project import (
    FileRole,
    HistoricalProblem,
    ProblemType,
    Project,
    ProjectFile,
    ProjectStatus,
)

# User Models
from backend.models.user import (
    HITLProfile,
    InterfaceTheme,
    SupportedLanguage,
    ThinkingDepth,
    User,
    UserSettings,
)

# Workflow Models
from backend.models.workflow import (
    ExecutionStage,
    NodeInstance,
    NodeStatus,
    NodeVersion,
    TemporaryExecutionResult,
    VersionSource,
    WorkflowInstance,
    WorkflowStatus,
)

__all__ = [
    # Project
    "Project",
    "ProjectFile",
    "HistoricalProblem",
    "ProjectStatus",
    "ProblemType",
    "FileRole",
    # User
    "User",
    "UserSettings",
    "SupportedLanguage",
    "InterfaceTheme",
    "HITLProfile",
    "ThinkingDepth",
    # Workflow
    "WorkflowInstance",
    "NodeInstance",
    "NodeVersion",
    "TemporaryExecutionResult",
    "WorkflowStatus",
    "NodeStatus",
    "ExecutionStage",
    "VersionSource",
]

```

### models/enum_utils.py Content:

```py
"""Shared helpers for SQLAlchemy Enum columns."""

from enum import Enum
from typing import Type


def enum_values(enum_cls: Type[Enum]) -> list[str]:
    """Return Enum member values for consistent SAEnum value storage."""

    return [member.value for member in enum_cls]


__all__ = ["enum_values"]

```

### models/project.py Content:

```py
import datetime
from enum import Enum

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import relationship

from backend.database import Base
from backend.models.enum_utils import enum_values


class ProjectStatus(str, Enum):
    """Defines the lifecycle status of a Project (R2.3)."""

    CONFIGURING = "Configuring"
    RUNNING = "Running"
    COMPLETED = "Completed"


class ProblemType(str, Enum):
    """Defines the competition problem type classification (R3.4)."""

    A = "A"
    B = "B"
    C = "C"
    D = "D"
    E = "E"
    F = "F"
    UNKNOWN = "-"


class FileRole(str, Enum):
    """Defines the role of an uploaded file within a project (R3.2.2)."""

    PROBLEM_DESCRIPTION = "Problem Description"
    DATASET = "Dataset"
    REFERENCE_MATERIAL = "Reference Material"


class Project(Base):
    """
    Project model, the central organizational unit for a modeling task.
    Belongs to a User and contains all related assets and configurations.
    """

    __tablename__ = "projects"
    __table_args__ = (UniqueConstraint("user_id", "name", name="_user_project_name_uc"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(
        SAEnum(ProjectStatus, name="projectstatus", values_callable=enum_values),
        default=ProjectStatus.CONFIGURING,
        nullable=False,
    )
    problem_type = Column(
        SAEnum(ProblemType, name="problemtype", values_callable=enum_values),
        default=ProblemType.UNKNOWN,
        nullable=False,
    )

    # A JSON blob storing the decrypted UserSettings snapshot at the time of workflow
    # start, ensuring reproducible executions with user-specific keys (BYOK) (R7.3).
    configuration_snapshot = Column(MutableDict.as_mutable(JSON), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    historical_problem_id = Column(Integer, ForeignKey("historical_problems.id"), nullable=True)

    user = relationship("User", back_populates="projects")
    historical_problem = relationship("HistoricalProblem")
    files = relationship("ProjectFile", back_populates="project", cascade="all, delete-orphan")
    workflow_instance = relationship(
        "WorkflowInstance", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name='{self.name}', user_id={self.user_id})>"

    @property
    def workflow_instance_id(self) -> int | None:
        """
        Expose the associated workflow id for Pydantic serializers.

        The schema expects this attribute even though the database keeps the
        one-to-one relation on the WorkflowInstance side.
        """
        if self.workflow_instance:
            return self.workflow_instance.id
        return None


class ProjectFile(Base):
    """
    Tracks uploaded files associated with a project (R3.2).
    """

    __tablename__ = "project_files"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)

    # user_id is denormalized here for faster, direct authorization checks on files,
    # avoiding a join with the projects table for simple ownership verification (R1.4).
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    filename = Column(String, nullable=False)
    role = Column(SAEnum(FileRole, name="filerole", values_callable=enum_values), nullable=False)
    storage_path = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="files")
    user = relationship("User")

    def __repr__(self) -> str:
        return f"<ProjectFile(id={self.id}, filename='{self.filename}', project_id={self.project_id})>"


class HistoricalProblem(Base):
    """
    Catalogs past competition problems for quick project initialization (R3.3).
    This is a read-only lookup table for the application.
    """

    __tablename__ = "historical_problems"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    type = Column(SAEnum(ProblemType, name="problemtype", values_callable=enum_values), nullable=False)
    name = Column(String, nullable=False)
    description_path = Column(String, nullable=False)
    dataset_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self) -> str:
        return f"<HistoricalProblem(id={self.id}, name='{self.name}', year={self.year})>"

```

### models/user.py Content:

```py
"""User and UserSettings models (Task 4)."""

import datetime
from enum import Enum

from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.database import Base
from backend.models.enum_utils import enum_values


class SupportedLanguage(str, Enum):
    EN = "en"
    ZH = "zh"


class InterfaceTheme(str, Enum):
    LIGHT = "light"
    DARK = "dark"


class HITLProfile(str, Enum):
    NOVICE = "Novice"
    EXPERIENCED = "Experienced"
    EXPERT = "Expert"


class ThinkingDepth(str, Enum):
    INSTANT = "Instant"
    MEDIUM = "Medium"
    HEAVY = "Heavy"


class User(Base):
    """User model for authentication and ownership."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    settings = relationship(
        "UserSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    # Relationship to Project model, with cascading delete.
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    workflows = relationship("WorkflowInstance", back_populates="user", cascade="all, delete-orphan")
    nodes = relationship("NodeInstance", back_populates="user")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"


class UserSettings(Base):
    """User-specific settings for interface, behavior, and BYOK configuration."""

    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    language = Column(
        SAEnum(SupportedLanguage, name="supportedlanguage", values_callable=enum_values),
        default=SupportedLanguage.EN,
        nullable=False,
    )
    theme = Column(
        SAEnum(InterfaceTheme, name="interfacetheme", values_callable=enum_values),
        default=InterfaceTheme.LIGHT,
        nullable=False,
    )

    hitl_profile = Column(
        SAEnum(HITLProfile, name="hitlprofile", values_callable=enum_values),
        default=HITLProfile.EXPERIENCED,
        nullable=False,
    )
    thinking_depth = Column(
        SAEnum(ThinkingDepth, name="thinkingdepth", values_callable=enum_values),
        default=ThinkingDepth.MEDIUM,
        nullable=False,
    )

    llm_model_name = Column(String, nullable=True)
    llm_base_url = Column(String, nullable=True)
    llm_api_key_encrypted = Column(String, nullable=True)
    e2b_api_key_encrypted = Column(String, nullable=True)

    user = relationship("User", back_populates="settings")

    def __repr__(self) -> str:
        return f"<UserSettings(id={self.id}, user_id={self.user_id})>"

```

### models/workflow.py Content:

```py
import datetime
from enum import Enum

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.ext.mutable import MutableDict, MutableList
from sqlalchemy.orm import relationship

from backend.database import Base
from backend.models.enum_utils import enum_values
from backend.workflow.spec import HandlerType, HITLMode, NodeType, SCASelectionMode


class WorkflowStatus(str, Enum):
    RUNNING = "Running"
    COMPLETED = "Completed"


class VersionSource(str, Enum):
    """(R4.3) Defines the origin of a node version."""

    AI_GENERATED = "AI_GENERATED"
    MANUALLY_EDITED = "MANUALLY_EDITED"


class WorkflowInstance(Base):
    __tablename__ = "workflow_instances"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(
        SAEnum(WorkflowStatus, name="workflowstatus", values_callable=enum_values),
        default=WorkflowStatus.RUNNING,
    )
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    # external_data_refs removed in favor of Project-based file resolution.
    # project_id and user_id are non-nullable to enforce multi-tenancy.
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    nodes = relationship(
        "NodeInstance",
        back_populates="workflow",
        cascade="all, delete-orphan",
        order_by="NodeInstance.order_index",
    )
    project = relationship("Project", back_populates="workflow_instance", uselist=False)
    # The `back_populates` assumes a 'workflows' relationship on the User model.
    user = relationship("User", back_populates="workflows")


class NodeStatus(str, Enum):
    NOT_STARTED = "Not Started"
    EXECUTING = "Executing"
    AWAITING_HITL_APPROVAL = "Awaiting HITL Approval"
    COMPLETED = "Completed"
    FAILED = "Failed"
    CANCELED = "Canceled"


class ExecutionStage(str, Enum):
    """Represents granular execution progress for nodes (R4.3)."""

    NOT_STARTED = "Not Started"
    INITIALIZING = "Initializing"
    PROCESSING = "Processing"
    GENERATING_OUTPUTS = "Generating Outputs"
    AWAITING_REVIEW = "Awaiting Review"
    COMPLETED = "Completed"
    FAILED = "Failed"
    CANCELED = "Canceled"


class NodeInstance(Base):
    __tablename__ = "node_instances"

    id = Column(Integer, primary_key=True, index=True)
    workflow_instance_id = Column(Integer, ForeignKey("workflow_instances.id"), nullable=False)
    # user_id is non-nullable and denormalized for efficient auth checks.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    definition_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    node_type = Column(SAEnum(NodeType, name="nodetype", values_callable=enum_values), nullable=False)
    hitl_mode = Column(SAEnum(HITLMode, name="hitlmode", values_callable=enum_values), nullable=False)
    handler_type = Column(
        SAEnum(HandlerType, name="handlertype", values_callable=enum_values),
        nullable=False,
    )
    sca_selection_mode = Column(
        SAEnum(SCASelectionMode, name="scaselectionmode", values_callable=enum_values),
        nullable=True,
    )
    export_config = Column(MutableDict.as_mutable(JSON), nullable=True)
    status = Column(SAEnum(NodeStatus, name="nodestatus", values_callable=enum_values), default=NodeStatus.NOT_STARTED)
    current_stage = Column(
        SAEnum(ExecutionStage, name="executionstage", values_callable=enum_values),
        default=ExecutionStage.NOT_STARTED,
    )
    order_index = Column(Integer, nullable=False)
    active_version_id = Column(Integer, ForeignKey("node_versions.id"), nullable=True)
    dependencies = Column(MutableDict.as_mutable(JSON), nullable=True)
    external_inputs = Column(MutableList.as_mutable(JSON), nullable=True)
    phase_id = Column(String, nullable=False, index=True)
    stage_id = Column(String, nullable=False, index=True)
    stage_name = Column(String, nullable=False)
    task_group_id = Column(String, nullable=True, index=True)

    workflow = relationship("WorkflowInstance", back_populates="nodes")
    # The `back_populates` assumes a 'nodes' relationship on the User model.
    user = relationship("User", back_populates="nodes")
    versions = relationship(
        "NodeVersion",
        back_populates="node_instance",
        # Use Column object for robust foreign_keys definition.
        foreign_keys="NodeVersion.node_instance_id",
        cascade="all, delete-orphan",
    )
    active_version = relationship("NodeVersion", foreign_keys=[active_version_id], post_update=True)
    temporary_result = relationship(
        "TemporaryExecutionResult",
        back_populates="node_instance",
        uselist=False,
        cascade="all, delete-orphan",
    )


class NodeVersion(Base):
    __tablename__ = "node_versions"

    id = Column(Integer, primary_key=True, index=True)
    node_instance_id = Column(Integer, ForeignKey("node_instances.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    version_number = Column(Integer, nullable=False)
    # (R4.3) Fields for tracking manual editing.
    source = Column(
        SAEnum(VersionSource, name="versionsource", values_callable=enum_values),
        nullable=False,
        default=VersionSource.AI_GENERATED,
    )
    based_on_version_id = Column(Integer, ForeignKey("node_versions.id"), nullable=True)
    output_data = Column(MutableDict.as_mutable(JSON), nullable=True)
    raw_generated_output = Column(MutableDict.as_mutable(JSON), nullable=True)
    execution_artifacts = Column(MutableDict.as_mutable(JSON), nullable=True)
    # Stores Dict[int, int] (NodeID -> VersionID); MutableDict preserves integer keys.
    input_dependencies = Column(MutableDict.as_mutable(JSON), nullable=False)
    hitl_history = Column(MutableList.as_mutable(JSON), nullable=False)
    llm_model_name = Column(String, nullable=False)
    temperature = Column(Float, nullable=False)
    summary = Column(String(512), nullable=False, default="Version created")

    node_instance = relationship("NodeInstance", back_populates="versions", foreign_keys=[node_instance_id])
    based_on_version = relationship("NodeVersion", remote_side=[id], foreign_keys=[based_on_version_id])

    __table_args__ = (UniqueConstraint("node_instance_id", "version_number", name="_node_version_uc"),)


class TemporaryExecutionResult(Base):
    __tablename__ = "temporary_execution_results"

    id = Column(Integer, primary_key=True, index=True)
    node_instance_id = Column(Integer, ForeignKey("node_instances.id"), unique=True, nullable=False)
    output_data = Column(MutableDict.as_mutable(JSON), nullable=True)
    execution_artifacts = Column(MutableDict.as_mutable(JSON), nullable=True)
    # Stores Dict[int, int] for live execution context.
    input_dependencies = Column(MutableDict.as_mutable(JSON), nullable=False)
    accumulated_hitl_interactions = Column(MutableList.as_mutable(JSON), nullable=False)
    llm_model_name = Column(String, nullable=False)
    temperature = Column(Float, nullable=False)
    error_log = Column(Text, nullable=True)

    node_instance = relationship("NodeInstance", back_populates="temporary_result")

```

    ## repositories
     - __init__.py
     - base.py
     - project_repository.py

### repositories/__init__.py Content:

```py
"""Repository layer for encapsulating database access patterns."""

from .project_repository import ProjectRepository

__all__ = ["ProjectRepository"]

```

### repositories/base.py Content:

```py
"""
Base repository abstractions to keep SQLAlchemy session handling centralized.
"""
from __future__ import annotations

from typing import Generic, Type, TypeVar

from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    """Basic CRUD helpers shared by repositories."""

    def __init__(self, db: Session, model: Type[ModelType]):
        self.db = db
        self.model = model

    def get(self, pk: int) -> ModelType | None:
        """Return a single record by primary key."""
        return self.db.get(self.model, pk)


__all__ = ["BaseRepository"]

```

### repositories/project_repository.py Content:

```py
"""
Data-access helpers for Project entities.
"""
from __future__ import annotations

from typing import Tuple

from sqlalchemy.orm import Session, selectinload

from backend.models.project import Project
from backend.models.user import User

from .base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    """Encapsulates complex project queries."""

    def __init__(self, db: Session):
        super().__init__(db, Project)

    def find_by_name_for_user(self, name: str, user: User) -> Project | None:
        return (
            self.db.query(self.model)
            .filter(self.model.user_id == user.id, self.model.name == name)
            .first()
        )

    def list_paginated_for_user(self, user: User, skip: int, limit: int) -> Tuple[int, list[Project]]:
        query = self.db.query(self.model).filter(self.model.user_id == user.id)
        total = query.count()
        items = (
            query.options(selectinload(Project.workflow_instance))
            .order_by(self.model.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return total, items

    def get_with_details(self, project_id: int) -> Project | None:
        return (
            self.db.query(self.model)
            .options(
                selectinload(Project.files),
                selectinload(Project.workflow_instance),
            )
            .filter(self.model.id == project_id)
            .first()
        )


__all__ = ["ProjectRepository"]

```

    ## routers
     - __init__.py
     - auth.py
     - nodes.py
     - projects.py
     - users.py
     - workflows.py

### routers/__init__.py Content:

```py
from fastapi import APIRouter

from backend.routers.auth import router as auth_router
from backend.routers.nodes import router as nodes_router
from backend.routers.projects import library_router, router as projects_router
from backend.routers.users import router as users_router
from backend.routers.workflows import router as workflows_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(projects_router)
api_router.include_router(library_router)
api_router.include_router(workflows_router)
api_router.include_router(nodes_router)

__all__ = [
    "api_router",
    "auth_router",
    "nodes_router",
    "projects_router",
    "users_router",
    "workflows_router",
    "library_router",
]

```

### routers/auth.py Content:

```py
"""API endpoints for user authentication and registration."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.auth.security import create_access_token
from backend.auth.service import AuthService
from backend.database import get_db
from backend.exceptions import InvalidStateException
from backend.schemas.auth import (
    EmailVerificationRequest,
    PasswordResetCompletion,
    PasswordResetRequest,
    ResendVerificationRequest,
    Token,
)
from backend.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_auth_service() -> AuthService:
    """Provide an AuthService instance for request-scoped dependencies."""
    return AuthService()


@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Authenticate user credentials and return a JWT access token."""
    user = auth_service.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not verified. Please check your email.",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Register a new user account."""
    try:
        new_user = auth_service.register_user(db, user_in=user_in)
        auth_service.send_verification_email(db, new_user)
        return new_user
    except InvalidStateException as exc:
        raise exc


@router.post("/verify-email", response_model=UserRead)
def verify_email(
    request: EmailVerificationRequest,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Verify the user's email address using the provided token."""
    return auth_service.verify_email(db, request.token)


@router.post("/resend-verification-email", status_code=status.HTTP_202_ACCEPTED)
def resend_verification_email(
    request: ResendVerificationRequest,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Resend the verification email."""
    auth_service.handle_resend_verification(db, request.email)
    return {"message": "If the account exists and is not verified, a verification email has been sent."}


@router.post("/request-password-reset", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Initiate the password reset flow."""
    auth_service.initiate_password_reset(db, request.email)
    return {"message": "If an account with this email exists, a password reset link has been sent."}


@router.post("/complete-password-reset", status_code=status.HTTP_200_OK)
async def complete_password_reset(
    request: PasswordResetCompletion,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Complete the password reset using the token provided via email."""
    auth_service.complete_password_reset(db, request.token, request.new_password)
    return {"message": "Password has been reset successfully."}

```

### routers/nodes.py Content:

```py
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user
from backend.database import get_db
from backend.models.user import User
from backend.schemas.hitl import ExecutionRequest, HITLSubmission
from backend.schemas.node import ManualEditSubmission, NodeDetailView, NodeInstanceRead, NodeVersionRead
from backend.services.hitl_service import HITLService
from backend.services.node_service import NodeService

router = APIRouter(prefix="/nodes", tags=["Nodes"])


def get_node_service(db: Session = Depends(get_db)) -> NodeService:
    return NodeService(db)


def get_hitl_service(
    db: Session = Depends(get_db),
    node_service: NodeService = Depends(get_node_service),
) -> HITLService:
    return HITLService(db, node_service)


@router.get("/{node_id}", response_model=NodeDetailView)
def get_node_details(
    node_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_node_detail_view(node_id, current_user)


@router.post(
    "/{node_id}/cancel",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=Dict[str, Any],
    summary="Cancel an EXECUTING node",
)
async def cancel_node_execution(
    node_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> Dict[str, Any]:
    """
    Request cancellation of an ongoing node execution.
    This sends an abort signal to the worker processing the task.
    """
    return await service.cancel_execution(node_id, current_user)


@router.post(
    "/{node_id}/re-execute",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=Dict[str, Any],
    summary="Re-execute a COMPLETED node",
)
async def re_execute_node(
    node_id: int,
    request: ExecutionRequest,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    await service.enqueue_re_execution(
        node_id,
        current_user,
        user_feedback=request.modification_comments,
        base_version_id=request.base_version_id,
    )
    return {"message": "Node re-execution has been accepted for processing.", "node_id": node_id}


@router.post(
    "/{node_id}/retry",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=Dict[str, Any],
    summary="Retry a FAILED node",
)
async def retry_node(
    node_id: int,
    request: ExecutionRequest,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    await service.enqueue_retry(
        node_id,
        current_user,
        user_feedback=request.modification_comments,
    )
    return {"message": "Node retry has been accepted for processing.", "node_id": node_id}


@router.post("/{node_id}/hitl", response_model=Dict[str, Any])
async def submit_hitl_action(
    node_id: int,
    submission: HITLSubmission,
    service: HITLService = Depends(get_hitl_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return await service.process_submission(node_id, submission, current_user)


@router.post(
    "/{node_id}/manual-edit",
    response_model=NodeInstanceRead,
    summary="Submit a manual edit for a node's output (R4)",
    description="""
Manually edit a node's output, creating a new version (R4).

This action creates a new 'Manually Edited' version based on a specified
base version, sets it as the active version, and marks the node as 'Completed'.
If the node was awaiting HITL approval, this serves as an override.
This action will trigger a staleness check on downstream nodes and advance the workflow.
    """,
)
async def submit_manual_edit(
    node_id: int,
    submission: ManualEditSubmission,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    updated_node = await service.submit_manual_edit(node_id, current_user, submission)
    return updated_node


@router.get("/{node_id}/versions", response_model=List[NodeVersionRead])
def get_node_versions(
    node_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_versions(node_id, current_user)


@router.get("/{node_id}/versions/{version_id}", response_model=NodeVersionRead)
def get_node_version_details(
    node_id: int,
    version_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_version_details(node_id, version_id, current_user)


@router.post("/{node_id}/versions/{version_id}/activate", response_model=NodeInstanceRead)
async def activate_version(
    node_id: int,
    version_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return await service.switch_active_version(node_id, version_id, current_user)

```

### routers/projects.py Content:

```py
"""API endpoints for project management, file uploads, and workflow initiation."""

import re
from typing import List
from urllib.parse import quote

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user
from backend.database import get_db
from backend.models.project import FileRole
from backend.models.user import User
from backend.schemas.common import PaginatedResponse
from backend.schemas.node import NodeInstanceRead
from backend.schemas.project import (
    HistoricalInitializationRequest,
    HistoricalProblemRead,
    ProjectCreate,
    ProjectDetailRead,
    ProjectFileRead,
    ProjectSummaryRead,
    ProjectUpdate,
)
from backend.services.export_service import ExportService
from backend.services.project_service import ProjectService

library_router = APIRouter(prefix="/library", tags=["Problem Library"])
router = APIRouter(prefix="/projects", tags=["Projects"])


def get_project_service(db: Session = Depends(get_db)) -> ProjectService:
    """Dependency injector for the ProjectService."""
    return ProjectService(db)


def get_export_service(db: Session = Depends(get_db)) -> ExportService:
    """Dependency injector for the ExportService."""
    return ExportService(db)


@library_router.get("/historical-problems", response_model=List[HistoricalProblemRead])
def list_historical_problems(
    service: ProjectService = Depends(get_project_service),
) -> List[HistoricalProblemRead]:
    """List all available historical problems from the library (R3.3)."""
    problems = service.get_historical_problems()
    return [HistoricalProblemRead.model_validate(problem) for problem in problems]


@router.post("/", response_model=ProjectDetailRead, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Create a new project for the authenticated user."""
    return service.create_project(project_data, current_user)


@router.get("/", response_model=PaginatedResponse[ProjectSummaryRead])
def list_projects(
    skip: int = 0,
    limit: int = 20,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> PaginatedResponse[ProjectSummaryRead]:
    """List all projects for the authenticated user with lightweight pagination."""
    total, items = service.get_projects_paginated(current_user, skip, limit)
    return PaginatedResponse(total=total, items=items)


@router.get("/{project_id}", response_model=ProjectDetailRead)
def get_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Retrieve full details for a specific project owned by the user."""
    return service.get_project_details(project_id, current_user)


@router.patch("/{project_id}", response_model=ProjectDetailRead)
def update_project(
    project_id: int,
    update_data: ProjectUpdate,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Update a project's name, description, or problem type."""
    return service.update_project(project_id, update_data, current_user)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> None:
    """Delete a project and all its associated data."""
    service.delete_project(project_id, current_user)
    return None


@router.post("/{project_id}/files", response_model=ProjectFileRead, status_code=status.HTTP_201_CREATED)
async def upload_project_file(
    project_id: int,
    file: UploadFile = File(...),
    role: FileRole = Form(...),
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectFileRead:
    """Upload a file (e.g., Problem Description, Dataset) to a project."""
    return await service.upload_file(project_id, current_user, file, role)


@router.post("/{project_id}/initialize-from-historical", response_model=ProjectDetailRead)
def initialize_from_historical_problem(
    project_id: int,
    request: HistoricalInitializationRequest,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Initialize a project with data from the historical problem library (R3.3)."""
    return service.initialize_from_historical(project_id, request.historical_problem_id, current_user)


@router.post("/{project_id}/start", response_model=NodeInstanceRead, status_code=status.HTTP_202_ACCEPTED)
async def start_project_workflow(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> NodeInstanceRead:
    """
    Start the modeling workflow for a configured project (R3.5).

    This action snapshots the user's settings, creates the workflow instance,
    and enqueues the first node for execution.
    """
    return await service.start_workflow(project_id, current_user)


@router.get("/{project_id}/export", response_class=Response)
async def export_project(
    project_id: int,
    project_service: ProjectService = Depends(get_project_service),
    export_service: ExportService = Depends(get_export_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> Response:
    """
    Export the project's results as a ZIP archive (R6).

    Compiles all node outputs, uploaded inputs, and a manifest into a single archive.
    """
    project = project_service.get_project_details(project_id, current_user)
    if not project.workflow_instance:
        raise HTTPException(status_code=404, detail="No workflow has been started for this project to export.")

    zip_bytes = export_service.export_project_to_zip(project)

    sanitized_name = re.sub(r'[\\/*?:"<>|]', "", project.name).strip() or "untitled_project"
    filename = f"{sanitized_name}_export.zip"
    ascii_filename = filename.encode("ascii", "ignore").decode() or "project_export.zip"
    if ascii_filename == filename:
        content_disposition = f'attachment; filename="{ascii_filename}"'
    else:
        encoded_filename = quote(filename)
        content_disposition = (
            f'attachment; filename="{ascii_filename}"; filename*=UTF-8\'\'{encoded_filename}'
        )

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": content_disposition},
    )

```

### routers/users.py Content:

```py
"""API endpoints for managing the current user's profile and settings."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user
from backend.auth.service import AuthService
from backend.database import get_db
from backend.models.user import User
from backend.schemas.user import PasswordChange, UserRead, UserSettingsRead, UserSettingsUpdate
from backend.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service() -> UserService:
    """Provide a UserService instance for request-scoped dependencies."""
    return UserService()


def get_auth_service() -> AuthService:
    """Provide an AuthService instance."""
    return AuthService()


@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_active_verified_user)):
    """Return the authenticated user's profile."""
    return current_user


@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    password_change: PasswordChange,
    current_user: User = Depends(get_current_active_verified_user),
    auth_service: AuthService = Depends(get_auth_service),
    db: Session = Depends(get_db),
):
    """Change the authenticated user's password."""
    auth_service.change_password(db, current_user, password_change)
    return None


@router.get("/me/settings", response_model=UserSettingsRead)
async def read_user_settings(
    current_user: User = Depends(get_current_active_verified_user),
    user_service: UserService = Depends(get_user_service),
    db: Session = Depends(get_db),
):
    """Fetch the authenticated user's settings."""
    # The service now directly returns the response model.
    return user_service.get_settings(db, user=current_user)


@router.patch("/me/settings", response_model=UserSettingsRead)
async def update_user_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_verified_user),
    user_service: UserService = Depends(get_user_service),
    db: Session = Depends(get_db),
):
    """Update the authenticated user's settings."""
    # The service now handles the update and returns the response model directly.
    return user_service.update_settings(db, user=current_user, settings_in=settings_in)

```

### routers/workflows.py Content:

```py
from typing import Dict, List

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user, get_user_from_token
from backend.database import get_db
from backend.models.user import User
from backend.models.workflow import WorkflowInstance
from backend.schemas.common import PaginatedResponse
from backend.schemas.node import NodeInstanceRead, StalenessInfo
from backend.schemas.workflow import WorkflowCreate, WorkflowInstanceRead, WorkflowUpdate
from backend.services.workflow_service import WorkflowService
from backend.ws_manager import manager as ws_manager

router = APIRouter(prefix="/workflows", tags=["Workflows"])


def get_workflow_service(db: Session = Depends(get_db)) -> WorkflowService:
    return WorkflowService(db)


@router.post("/", response_model=WorkflowInstanceRead, status_code=status.HTTP_201_CREATED)
def create_workflow(
    workflow_data: WorkflowCreate,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    workflow = service.create_workflow(workflow_data, current_user)
    return service.get_workflow_instance(workflow.id, current_user)


@router.get("/", response_model=PaginatedResponse[WorkflowInstanceRead])
def list_workflows(
    skip: int = 0,
    limit: int = 20,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_workflows_paginated(current_user, skip, limit)


@router.get("/{workflow_id}", response_model=WorkflowInstanceRead)
def get_workflow(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    workflow = service.get_workflow_instance(workflow_id, current_user)
    return workflow


@router.patch("/{workflow_id}", response_model=WorkflowInstanceRead)
def update_workflow(
    workflow_id: int,
    update_data: WorkflowUpdate,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    service.update_workflow(workflow_id, update_data, current_user)
    return service.get_workflow_instance(workflow_id, current_user)


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    service.delete_workflow(workflow_id, current_user)
    return None


@router.post("/{workflow_id}/start", response_model=NodeInstanceRead)
async def start_workflow(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return await service.start_workflow(workflow_id, current_user)


@router.get("/{workflow_id}/staleness", response_model=Dict[int, List[StalenessInfo]])
def get_workflow_staleness(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.calculate_bulk_staleness(workflow_id, current_user)


@router.websocket("/{workflow_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    workflow_id: int,
    token: str = Query(..., description="JWT access token for authentication"),
    db: Session = Depends(get_db),
):
    """
    WebSocket endpoint for streaming real-time workflow updates.
    """
    user = await get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4001, reason="Authentication failed: Invalid or expired token")
        return

    workflow = db.get(WorkflowInstance, workflow_id)
    if not workflow or workflow.user_id != user.id:
        logger.warning(
            "WebSocket authorization failed for user {user_id} on workflow {workflow_id}",
            user_id=user.id,
            workflow_id=workflow_id,
        )
        await websocket.close(code=4003, reason="Authorization failed: Access denied")
        return

    await ws_manager.connect(workflow_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(workflow_id, websocket)
    except Exception:
        logger.exception("Unexpected WebSocket error", workflow_id=workflow_id)
        ws_manager.disconnect(workflow_id, websocket)

```

    ## schemas
     - __init__.py
     - auth.py
     - common.py
     - error.py
     - events.py
     - hitl.py
     - node.py
     - project.py
     - user.py
     - workflow.py

### schemas/__init__.py Content:

```py
"""
Pydantic Schemas Package.

This file exports the primary data transfer objects (DTOs) used throughout the
application's API layer, providing a centralized point of access and a clear
public interface for the schemas module.
"""

# Auth Schemas
from backend.schemas.auth import Token, TokenData

# Common Schemas
from backend.schemas.common import PaginatedResponse, SystemInfo

# Error Schema
from backend.schemas.error import ErrorResponse

# Event Schemas
from backend.schemas.events import EventPayload, EventType

# HITL Schemas
from backend.schemas.hitl import (
    Adjudication,
    AdjudicationDecision,
    ExecutionRequest,
    HITLActionType,
    HITLSubmission,
)

# Node Schemas
from backend.schemas.node import (
    ManualEditSubmission,
    NodeDetailView,
    NodeInstanceRead,
    NodeVersionRead,
    StalenessInfo,
    TemporaryExecutionRead,
    VersionData,
)

# Project Schemas
from backend.schemas.project import (
    HistoricalInitializationRequest,
    ProjectCreate,
    ProjectDetailRead,
    ProjectFileRead,
    ProjectSummaryRead,
    ProjectUpdate,
)

# User Schemas
from backend.schemas.user import UserCreate, UserRead, UserSettingsRead, UserSettingsUpdate

# Workflow Schemas
from backend.schemas.workflow import PhaseRead, StageRead, WorkflowCreate, WorkflowInstanceRead, WorkflowUpdate

__all__ = [
    # Auth
    "Token",
    "TokenData",
    # Common
    "PaginatedResponse",
    "SystemInfo",
    # Error
    "ErrorResponse",
    # Events
    "EventType",
    "EventPayload",
    # HITL
    "HITLActionType",
    "HITLSubmission",
    "ExecutionRequest",
    "AdjudicationDecision",
    "Adjudication",
    # Node
    "NodeInstanceRead",
    "NodeDetailView",
    "NodeVersionRead",
    "TemporaryExecutionRead",
    "VersionData",
    "StalenessInfo",
    "ManualEditSubmission",
    # Project
    "ProjectCreate",
    "ProjectUpdate",
    "HistoricalInitializationRequest",
    "ProjectFileRead",
    "ProjectSummaryRead",
    "ProjectDetailRead",
    # User
    "UserCreate",
    "UserRead",
    "UserSettingsUpdate",
    "UserSettingsRead",
    # Workflow
    "WorkflowCreate",
    "WorkflowUpdate",
    "WorkflowInstanceRead",
    "PhaseRead",
    "StageRead",
]

```

### schemas/auth.py Content:

```py
"""Pydantic schemas for authentication flows."""

from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


class Token(BaseModel):
    """Schema for the JWT access token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for the data encoded within the JWT."""

    # The 'sub' (subject) claim will hold the user ID.
    sub: Optional[str] = None


class EmailVerificationRequest(BaseModel):
    """Schema for verifying email."""

    token: str


class ResendVerificationRequest(BaseModel):
    """Schema for requesting a new verification email."""

    email: EmailStr


class PasswordResetRequest(BaseModel):
    """Schema for initiating password reset."""

    email: EmailStr


class PasswordResetCompletion(BaseModel):
    """Schema for completing the password reset process."""

    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, value: str) -> str:
        from backend.schemas.user import _validate_password_strength

        return _validate_password_strength(value)

```

### schemas/common.py Content:

```py
from typing import Generic, List, TypeVar

from pydantic import BaseModel

DataType = TypeVar("DataType")


class PaginatedResponse(BaseModel, Generic[DataType]):
    """Generic schema for paginated collections."""

    total: int
    items: List[DataType]


class SystemInfo(BaseModel):
    """Schema exposed by the system information endpoint."""

    app_version: str
    llm_model_name: str

```

### schemas/error.py Content:

```py
from typing import Any, Dict, Optional

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response for API exceptions."""

    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None

```

### schemas/events.py Content:

```py
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel


class EventType(str, Enum):
    """WebSocket event types."""

    NODE_STATUS_UPDATED = "NODE_STATUS_UPDATED"
    NODE_ACTIVE_VERSION_CHANGED = "NODE_ACTIVE_VERSION_CHANGED"
    WORKFLOW_STRUCTURE_UPDATED = "WORKFLOW_STRUCTURE_UPDATED"
    WORKFLOW_STATUS_UPDATED = "WORKFLOW_STATUS_UPDATED"


class EventPayload(BaseModel):
    """Standardized payload for WebSocket events."""

    event_type: EventType
    workflow_id: int
    node_id: Optional[int] = None
    data: Dict[str, Any]

```

### schemas/hitl.py Content:

```py
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class HITLActionType(str, Enum):
    CONTINUE = "Continue"
    REJECT_WITH_FEEDBACK = "RejectAndProvideModificationComments"
    DISCARD = "Discard"


class AdjudicationDecision(str, Enum):
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"


class Adjudication(BaseModel):
    critique_id: str
    decision: AdjudicationDecision
    comment: Optional[str] = None


class HITLSubmission(BaseModel):
    action: HITLActionType
    feedback_comment: Optional[str] = None
    interaction_data: Optional[Dict[str, Any]] = None


class ExecutionRequest(BaseModel):
    modification_comments: Optional[str] = None
    base_version_id: Optional[int] = None


```

### schemas/node.py Content:

```py
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from backend.models.workflow import ExecutionStage, NodeStatus, VersionSource
from backend.workflow.spec import HandlerType, HITLMode, NodeType, SCASelectionMode


class NodeInstanceRead(BaseModel):
    id: int
    definition_id: str
    name: str
    status: NodeStatus
    current_stage: ExecutionStage
    node_type: NodeType
    hitl_mode: HITLMode
    handler_type: HandlerType
    sca_selection_mode: Optional[SCASelectionMode] = None
    export_config: Optional[Dict[str, Any]] = None
    order_index: int
    active_version_id: Optional[int]
    phase_id: str
    stage_id: str
    stage_name: str
    task_group_id: Optional[str] = None
    is_stale: bool = False

    class Config:
        from_attributes = True


class VersionData(BaseModel):
    source: VersionSource
    based_on_version_id: Optional[int]
    output_data: Optional[Dict[str, Any]]
    raw_generated_output: Optional[Dict[str, Any]]
    execution_artifacts: Optional[Dict[str, Any]]
    input_dependencies: Dict[int, int]
    hitl_history: List[Dict[str, Any]]
    llm_model_name: str
    temperature: float


class NodeVersionRead(VersionData):
    id: int
    version_number: int
    node_instance_id: int
    summary: str

    class Config:
        from_attributes = True


class TemporaryExecutionRead(BaseModel):
    output_data: Optional[Dict[str, Any]]
    execution_artifacts: Optional[Dict[str, Any]]
    accumulated_hitl_interactions: List[Dict[str, Any]]
    error_log: Optional[str]

    class Config:
        from_attributes = True


class StalenessInfo(BaseModel):
    """Detailed information about a stale dependency."""

    upstream_node_id: int
    upstream_definition_id: str
    consumed_version_id: int
    current_active_version_id: Optional[int]


class ManualEditSubmission(BaseModel):
    """Schema for submitting a manual edit to a node's output."""

    base_version_id: int
    edited_output_data: Dict[str, Any]
    summary: Optional[str] = None


class NodeDetailView(NodeInstanceRead):
    active_version: Optional[NodeVersionRead] = None
    pending_result: Optional[TemporaryExecutionRead] = None
    staleness_report: Optional[List[StalenessInfo]] = None

```

### schemas/project.py Content:

```py
"""Pydantic schemas for project-related API operations."""

import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from backend.models.project import FileRole, ProblemType, ProjectStatus


class ProjectBase(BaseModel):
    """Shared base attributes for project operations."""

    name: str
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        """Ensure project names are non-empty after trimming whitespace."""
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Project name cannot be empty.")
        return cleaned


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating mutable project fields. Forbids extra fields."""

    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = None
    description: Optional[str] = None
    problem_type: Optional[ProblemType] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        """Validate name for update operations, allowing it to be omitted."""
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Project name cannot be empty.")
        return cleaned


class HistoricalInitializationRequest(BaseModel):
    """Schema for requesting project initialization from the historical library."""

    historical_problem_id: int


class HistoricalProblemRead(BaseModel):
    """Schema for reading historical problem data from the library (R3.3)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    year: int
    type: ProblemType
    name: str
    has_description: bool = Field(..., validation_alias="description_path")
    has_dataset: bool = Field(..., validation_alias="dataset_path")

    @field_validator("has_description", "has_dataset", mode="before")
    @classmethod
    def check_path_exists(cls, value):
        return bool(value)


class ProjectFileRead(BaseModel):
    """Schema for reading project file data."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    role: FileRole
    created_at: datetime.datetime


class ProjectSummaryRead(BaseModel):
    """A lightweight schema for listing projects on a dashboard."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    status: ProjectStatus
    problem_type: ProblemType
    created_at: datetime.datetime
    updated_at: datetime.datetime
    workflow_instance_id: Optional[int] = None


class ProjectDetailRead(ProjectSummaryRead):
    """A detailed schema for a single project view, including files and description."""

    model_config = ConfigDict(from_attributes=True)

    description: Optional[str] = None
    files: List[ProjectFileRead] = Field(default_factory=list)
    historical_problem_id: Optional[int] = None

```

### schemas/user.py Content:

```py
"""Pydantic schemas for user creation and settings updates."""

from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from backend.models.user import HITLProfile, InterfaceTheme, SupportedLanguage, ThinkingDepth


def _validate_password_strength(value: str) -> str:
    """Enforce minimum password requirements per FRS 1.1."""
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    return value


class UserCreate(BaseModel):
    """Schema for creating a new user."""

    email: EmailStr
    password: str
    display_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        return _validate_password_strength(value)


class PasswordChange(BaseModel):
    """Schema for changing the user's password."""

    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return _validate_password_strength(value)


class UserSettingsUpdate(BaseModel):
    """
    Schema for updating user settings. All fields are optional.
    API keys are received in plaintext and encrypted by the service.
    """

    language: Optional[SupportedLanguage] = None
    theme: Optional[InterfaceTheme] = None
    hitl_profile: Optional[HITLProfile] = None
    thinking_depth: Optional[ThinkingDepth] = None
    llm_model_name: Optional[str] = None
    llm_base_url: Optional[str] = None
    llm_api_key: Optional[str] = None  # Plaintext for input
    e2b_api_key: Optional[str] = None  # Plaintext for input


class UserRead(BaseModel):
    """Schema for reading user profile data, excluding sensitive info."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    display_name: Optional[str] = None
    is_active: bool
    is_verified: bool


class UserSettingsRead(BaseModel):
    """Schema for reading user settings, excluding sensitive info."""

    model_config = ConfigDict(from_attributes=True)

    language: SupportedLanguage
    theme: InterfaceTheme
    hitl_profile: HITLProfile
    thinking_depth: ThinkingDepth
    llm_model_name: Optional[str] = None
    llm_base_url: Optional[str] = None
    has_llm_api_key: bool
    has_e2b_api_key: bool

```

### schemas/workflow.py Content:

```py
from typing import List, Optional

from pydantic import BaseModel

from backend.models.workflow import WorkflowStatus
from backend.schemas.node import NodeInstanceRead


class WorkflowCreate(BaseModel):
    """Payload for creating a workflow; user inferred from auth context."""

    name: str
    project_id: int


class WorkflowUpdate(BaseModel):
    """Mutable fields for workflow updates."""

    name: Optional[str] = None


class StageRead(BaseModel):
    id: str
    name: str
    nodes: List[NodeInstanceRead]


class PhaseRead(BaseModel):
    name: str
    stages: List[StageRead]


class WorkflowInstanceRead(BaseModel):
    id: int
    name: str
    status: WorkflowStatus
    project_id: int
    user_id: int
    phases: List[PhaseRead]

    class Config:
        from_attributes = True

```

    ## services
     - __init__.py
     - export_service.py
     - hitl_service.py
     - node_service.py
     - project_service.py
     - storage_service.py
     - user_service.py
     - workflow_service.py

### services/__init__.py Content:

```py
"""Service layer package."""


```

### services/export_service.py Content:

```py
"""
Service for exporting project results into a standardized archive format.
This service fulfills requirements described in FRS R6.
"""

import datetime
import io
import json
import re
import zipfile
from typing import Any, Dict, List

from loguru import logger
from sqlalchemy.orm import Session, joinedload

from backend.models import NodeInstance, Project, ProjectFile
from backend.services.execution_engine.config_resolver import resolve_config
from backend.services.execution_engine.executor import NodeExecutor
from backend.services.execution_engine.handlers.registry import get_handler_class
from backend.services.storage_service import storage_service


def _sanitize_filename(name: str) -> str:
    """Return a filesystem-safe filename fragment."""
    cleaned = re.sub(r'[<>:"/\\|?*]', "_", name or "")
    cleaned = re.sub(r"[\x00-\x1f\x7f]", "", cleaned)
    return cleaned.strip() or "untitled"


class ExportService:
    """Service to handle the project export feature (R6)."""

    def __init__(self, db: Session):
        self.db = db

    def export_project_to_zip(self, project: Project) -> bytes:
        """Compile all project artifacts into a single ZIP archive."""
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            logger.info("Starting export for project '{}'", project.name)
            self._add_original_inputs(zf, project)
            node_data = self._get_node_outputs_with_instances(project)
            self._add_structured_outputs(zf, project, node_data)
            self._add_project_manifest(zf, project, node_data)
            logger.info("Project export completed for '{}'", project.name)

        zip_buffer.seek(0)
        return zip_buffer.read()

    def _get_node_outputs_with_instances(self, project: Project) -> List[Dict[str, Any]]:
        """Retrieve node instances alongside their active version outputs and artifacts."""
        if not project.workflow_instance:
            return []

        nodes_with_active_versions: List[NodeInstance] = (
            self.db.query(NodeInstance)
            .filter(
                NodeInstance.workflow_instance_id == project.workflow_instance.id,
                NodeInstance.active_version_id.isnot(None),
            )
            .options(joinedload(NodeInstance.active_version))
            .order_by(NodeInstance.order_index)
            .all()
        )

        nodes: List[Dict[str, Any]] = []
        for node in nodes_with_active_versions:
            if not node.active_version or node.active_version.output_data is None:
                continue
            nodes.append(
                {
                    "node_instance": node,
                    "output_data": node.active_version.output_data,
                    "execution_artifacts": node.active_version.execution_artifacts,
                    "version_number": node.active_version.version_number,
                }
            )

        logger.debug("Gathered outputs for {} nodes.", len(nodes))
        return nodes

    def _write_content_to_zip(self, zf: zipfile.ZipFile, path: str, data: Any):
        """Serialize content to bytes (if needed) and write it into the archive."""
        if isinstance(data, bytes):
            content_bytes = data
        elif isinstance(data, (dict, list)):
            content_bytes = json.dumps(data, indent=2, default=str).encode("utf-8")
        else:
            content_bytes = str(data).encode("utf-8")
        zf.writestr(path, content_bytes)

    def _add_original_inputs(self, zf: zipfile.ZipFile, project: Project):
        """Add the project's original uploaded files to the archive."""
        project_files: List[ProjectFile] = (
            self.db.query(ProjectFile).filter(ProjectFile.project_id == project.id).all()
        )
        if not project_files:
            return

        for p_file in project_files:
            try:
                content = storage_service.get_file_content(p_file.storage_path)
                role_folder = _sanitize_filename(p_file.role.value)
                path = f"Original Inputs/{role_folder}/{p_file.filename}"
                self._write_content_to_zip(zf, path, content)
            except Exception as exc:
                logger.error("Failed to add original input '{}' to export: {}", p_file.filename, exc)
                error_info = f"Error reading file: {p_file.filename}\n{exc}"
                zf.writestr(f"Original Inputs/{p_file.filename}.error.txt", error_info)

    def _add_structured_outputs(
        self,
        zf: zipfile.ZipFile,
        project: Project,
        node_data_list: List[Dict[str, Any]],
    ):
        """Delegate export formatting to node handlers."""
        if not node_data_list:
            return

        config = resolve_config(project.configuration_snapshot)
        temp_executor = NodeExecutor(config=config)

        for data in node_data_list:
            node_instance: NodeInstance = data["node_instance"]
            output_data = data.get("output_data")
            if not output_data:
                continue

            handler_cls = get_handler_class(node_instance.handler_type)
            handler = handler_cls(temp_executor, node_instance)

            order_index = node_instance.order_index
            node_name = _sanitize_filename(node_instance.name)
            base_path = f"Results/{order_index:02d}_{node_name}/"

            handler.format_export(zf, output_data, base_path, data.get("execution_artifacts"))

    def _add_project_manifest(
        self, zf: zipfile.ZipFile, project: Project, node_data_list: List[Dict[str, Any]]
    ):
        """Generate the project manifest detailing exported artifacts."""
        exported_nodes_summary = [
            {
                "definition_id": data["node_instance"].definition_id,
                "name": data["node_instance"].name,
                "order_index": data["node_instance"].order_index,
                "exported_version": data["version_number"],
            }
            for data in sorted(node_data_list, key=lambda item: item["node_instance"].order_index)
        ]

        manifest = {
            "project_details": {
                "name": project.name,
                "description": project.description,
                "status": project.status.value,
                "problem_type": project.problem_type.value,
                "created_at": project.created_at,
                "export_date": datetime.datetime.utcnow(),
            },
            "workflow_details": {
                "name": project.workflow_instance.name if project.workflow_instance else "N/A",
                "status": project.workflow_instance.status.value if project.workflow_instance else "N/A",
            },
            "exported_nodes": exported_nodes_summary,
            "configuration_snapshot": project.configuration_snapshot,
        }

        self._write_content_to_zip(zf, "Project Manifest.json", manifest)

```

### services/hitl_service.py Content:

```py
import datetime
from typing import Any, Dict, List, Optional

from loguru import logger
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.exceptions import InvalidStateException
from backend.models.user import User
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, NodeVersion, VersionSource, WorkflowStatus
from backend.schemas.hitl import (
    AdjudicationDecision,
    HITLActionType,
    HITLSubmission,
)
from backend.services.execution_engine.handlers.registry import get_handler_class
from backend.services.node_service import NodeService
from backend.workflow.spec import HITLMode

class HITLService:
    def __init__(self, db: Session, node_service: NodeService):
        self.db = db
        self.node_service = node_service

    def _get_handler_for_node(self, node: NodeInstance):
        handler_cls = get_handler_class(node.handler_type)
        return handler_cls(None, node)

    async def process_submission(
        self, node_id: int, submission: HITLSubmission, user: User
    ) -> Dict[str, Any]:
        """Process a HITL submission, with an ownership check."""
        node = self.node_service.get_node_instance(node_id, user=user)

        if submission.action == HITLActionType.DISCARD:
            if node.status in [NodeStatus.AWAITING_HITL_APPROVAL, NodeStatus.FAILED, NodeStatus.CANCELED]:
                return await self._discard_execution(node)
            raise InvalidStateException(f"Cannot discard execution in status {node.status}.")

        if node.status != NodeStatus.AWAITING_HITL_APPROVAL:
            raise InvalidStateException(f"Cannot process HITL submission in status {node.status}.")

        if submission.action == HITLActionType.CONTINUE:
            return await self._handle_approval_or_loop(node, submission.interaction_data or {}, user)
        if submission.action == HITLActionType.REJECT_WITH_FEEDBACK:
            return await self._reject_and_retry(node, submission.feedback_comment, user)

        raise InvalidStateException("Unsupported HITL action.")

    async def _handle_approval_or_loop(
        self, node: NodeInstance, interaction_data: Optional[Dict[str, Any]], user: User
    ):
        self._validate_hitl_integrity(node, interaction_data)

        if node.hitl_mode == HITLMode.AVL:
            adjudication_data_list = (interaction_data or {}).get("adjudication", [])
            if any(item.get("decision") == AdjudicationDecision.ACCEPTED for item in adjudication_data_list):
                self._record_interaction(node, "AVLAdjudication", interaction_data)
                await self.node_service.enqueue_hitl_action(
                    node.id, user=user, adjudication_data=adjudication_data_list
                )
                return {
                    "message": "Adjudication received. Starting AVL refinement iteration.",
                    "node_id": node.id,
                    "action": "AVLLoop",
                }
        return await self._approve_and_proceed(node, interaction_data, user)

    async def _approve_and_proceed(
        self, node: NodeInstance, interaction_data: Optional[Dict[str, Any]], user: User
    ):
        """
        Approves the node, finalizes the version, and advances the workflow atomically (R5.3).
        """
        raw_output = node.temporary_result.output_data
        final_output = self._determine_final_output(node, raw_output, interaction_data)

        try:
            new_version = self._create_version_from_temporary(node, final_output, raw_output, interaction_data)
            await self.node_service._finalize_node_completion_and_advance(
                node,
                user,
                new_version,
                final_output,
            )
        except Exception:
            logger.exception("Failed during HITL approval process for node", node_id=node.id)
            raise

        if node.workflow:
            self.db.refresh(node.workflow)

        next_node = (
            self.db.query(NodeInstance)
            .filter_by(
                workflow_instance_id=node.workflow_instance_id,
                order_index=node.order_index + 1,
            )
            .first()
        )

        if node.workflow and node.workflow.status == WorkflowStatus.COMPLETED:
            return {"message": "Workflow completed successfully.", "next_node_id": None, "action": "Completed"}

        if not next_node:
            raise InvalidStateException("Internal Error: Workflow is not complete, but failed to find the next node.")

        execute_next = next_node.status == NodeStatus.NOT_STARTED
        if execute_next:
            return {
                "message": f"Node approved. Starting next node {next_node.definition_id}.",
                "next_node_id": next_node.id,
                "action": "ExecuteNext",
            }

        return {
            "message": f"Node approved. Navigating to review next node {next_node.definition_id}.",
            "next_node_id": next_node.id,
            "action": "NavigateNext",
        }

    def _validate_hitl_integrity(self, node: NodeInstance, interaction_data: Optional[Dict[str, Any]]):
        raw_output = node.temporary_result.output_data
        handler = self._get_handler_for_node(node)
        handler.validate_hitl_integrity(raw_output, interaction_data)

    def _determine_final_output(
        self,
        node: NodeInstance,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        handler = self._get_handler_for_node(node)
        return handler.determine_final_output(raw_output, interaction_data)

    async def _reject_and_retry(self, node: NodeInstance, feedback: Optional[str], user: User):
        if not feedback:
            raise InvalidStateException("Feedback comment is required for rejection.")
        self._record_interaction(node, "RejectionFeedback", {"comment": feedback})
        await self.node_service.enqueue_hitl_action(node.id, user=user, user_feedback=feedback)
        return {"message": "Feedback received. Re-executing node.", "node_id": node.id, "action": "ReExecute"}

    def _record_interaction(self, node: NodeInstance, interaction_type: str, data: Dict[str, Any]):
        temp_result = node.temporary_result
        interactions = temp_result.accumulated_hitl_interactions or []
        interaction = {
            "type": interaction_type,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "data": data,
        }
        interactions.append(interaction)
        temp_result.accumulated_hitl_interactions = interactions[:]  # copy for SQLAlchemy change tracking
        self.db.commit()

    async def _discard_execution(self, node: NodeInstance) -> Dict[str, Any]:
        if node.status not in [NodeStatus.AWAITING_HITL_APPROVAL, NodeStatus.FAILED, NodeStatus.CANCELED]:
            raise InvalidStateException(f"Cannot discard execution in status {node.status}.")

        if node.temporary_result:
            self.db.delete(node.temporary_result)

        if node.active_version_id:
            node.status = NodeStatus.COMPLETED
            node.current_stage = ExecutionStage.COMPLETED
        else:
            node.status = NodeStatus.NOT_STARTED
            node.current_stage = ExecutionStage.NOT_STARTED

        self.db.commit()
        self.db.refresh(node)
        await self.node_service._broadcast_node_update(node)
        return {"message": "Execution attempt discarded. Status reverted.", "node_id": node.id, "action": "Discarded"}

    def _generate_version_summary(self, interactions: List[Dict[str, Any]]) -> str:
        """Create a concise, context-aware explanation for the version."""

        if not interactions:
            return "Initial version approved."

        for interaction in reversed(interactions):
            interaction_type = interaction.get("type")
            data = interaction.get("data", {})

            if interaction_type == "AVLAdjudication":
                adjudications = data.get("adjudication", [])
                accepted_count = sum(1 for item in adjudications if item.get("decision") == AdjudicationDecision.ACCEPTED)
                if accepted_count > 0:
                    first_comment = next(
                        (
                            item.get("comment")
                            for item in adjudications
                            if item.get("decision") == AdjudicationDecision.ACCEPTED and item.get("comment")
                        ),
                        None,
                    )
                    summary = f"Refined (Accepted {accepted_count} critiques)."
                    if first_comment:
                        summary += f" Context: '{first_comment[:60]}...'"
                    return summary
                return "Approved (Rejected all critiques)."

            if interaction_type in ["RejectionFeedback", "InitialModificationComment", "RetryModificationComment"]:
                comment = data.get("comment")
                if comment:
                    if interaction_type == "InitialModificationComment":
                        prefix = "Re-executed"
                    elif interaction_type == "RetryModificationComment":
                        prefix = "Retried"
                    else:
                        prefix = "Refined"
                    return f"{prefix} based on feedback: '{comment[:80]}...'"

        return "Version approved."

    def _create_version_from_temporary(
        self,
        node: NodeInstance,
        final_output: Dict[str, Any],
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> NodeVersion:
        temp_result = node.temporary_result
        with self.db.begin_nested():
            self.db.query(NodeInstance).filter_by(id=node.id).with_for_update().one_or_none()
            max_version = (
                self.db.query(func.max(NodeVersion.version_number))
                .filter_by(node_instance_id=node.id)
                .scalar()
            )
            next_version_number = (max_version or 0) + 1
            summary = self._generate_version_summary(temp_result.accumulated_hitl_interactions)
            final_interactions = temp_result.accumulated_hitl_interactions[:]
            final_interactions.append(
                {
                    "type": "Approval",
                    "interaction_data": interaction_data,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                }
            )
            version_source = self._determine_version_source(final_interactions)
            base_version_id = node.active_version_id
            execution_artifacts = temp_result.execution_artifacts

            new_version = NodeVersion(
                node_instance_id=node.id,
                version_number=next_version_number,
                source=version_source,
                based_on_version_id=base_version_id,
                output_data=final_output,
                raw_generated_output=raw_output,
                execution_artifacts=execution_artifacts,
                input_dependencies=temp_result.input_dependencies,
                hitl_history=final_interactions,
                llm_model_name=temp_result.llm_model_name,
                temperature=temp_result.temperature,
                summary=summary,
            )
            self.db.add(new_version)
            self.db.flush()
        return new_version

    def _determine_version_source(self, interactions: List[Dict[str, Any]]) -> VersionSource:
        if not interactions:
            return VersionSource.AI_GENERATED

        manual_markers = {
            "InitialModificationComment",
            "RetryModificationComment",
            "RejectionFeedback",
            "AVLAdjudication",
        }
        if any(entry.get("type") in manual_markers for entry in interactions):
            return VersionSource.MANUALLY_EDITED
        return VersionSource.AI_GENERATED

```

### services/node_service.py Content:

```py
import datetime
import traceback
from collections import defaultdict
from typing import Any, Callable, Dict, List, Optional, Tuple

from arq.jobs import Job, JobStatus
from loguru import logger
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from backend.config import settings
from backend.exceptions import (
    DependencyException,
    ForbiddenException,
    InvalidStateException,
    NotFoundException,
    WorkflowException,
)
from backend.models.project import FileRole, ProjectFile
from backend.models.user import User
from backend.models.workflow import (
    ExecutionStage,
    NodeInstance,
    NodeStatus,
    NodeVersion,
    TemporaryExecutionResult,
    VersionSource,
    WorkflowInstance,
)
from backend.redis import get_redis_pool
from backend.schemas.events import EventType
from backend.schemas.node import (
    ManualEditSubmission,
    NodeDetailView,
    NodeInstanceRead,
    NodeVersionRead,
    StalenessInfo,
    TemporaryExecutionRead,
)
from backend.services.execution_engine.config_resolver import resolve_config
from backend.services.execution_engine.executor import NodeExecutor
from backend.services.execution_engine.results import ExecutionResult
from backend.services.storage_service import storage_service
from backend.task_names import TASK_EXECUTE_NODE
from backend.utils.event_utils import broadcast_event
from backend.workflow.spec import HITLMode, NodeType


_INPUT_KEY_TO_ROLE_MAP = {
    "Problem Statement": FileRole.PROBLEM_DESCRIPTION,
    "Datasets": FileRole.DATASET,
    "Reference Material": FileRole.REFERENCE_MATERIAL,
}


class NodeService:
    def __init__(self, db: Session):
        self.db = db

    def get_node_instance(self, node_id: int, user: Optional[User] = None) -> NodeInstance:
        """
        Get a node instance, with an optional ownership check.
        If a user is provided, enforces that the user owns the node.
        """
        node = self.db.query(NodeInstance).get(node_id)
        if not node:
            raise NotFoundException(f"NodeInstance with id {node_id} not found.")
        if user and node.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this node.")
        return node

    async def _enqueue_job(self, node: NodeInstance, **kwargs) -> Job:
        """Internal helper to enqueue a worker job. Assumes DB state is updated and committed."""
        redis = await get_redis_pool()
        node_id = node.id
        job_key = f"executing_node:{node_id}"

        try:
            job = await redis.enqueue_job(TASK_EXECUTE_NODE, node_id=node_id, _job_id=job_key, **kwargs)
            logger.info(
                "Enqueued job {job_id} (Key: {job_key}) for node {node_id}",
                job_id=job.job_id,
                job_key=job_key,
                node_id=node_id,
            )
            return job
        except Exception as exc:
            logger.error(
                "Failed to enqueue job for node {node_id}. Job might already be running or queue unavailable.",
                node_id=node_id,
                error=str(exc),
            )
            raise InvalidStateException(
                f"Failed to start execution for node {node_id}. An execution might already be in progress or the queue is unavailable."
            ) from exc

    async def _prepare_and_enqueue(
        self,
        node: NodeInstance,
        validation_func: Callable[
            [NodeInstance, Optional[str], bool, Optional[int], Optional[List[Dict[str, Any]]]],
            None,
        ],
        user_feedback: Optional[str],
        is_retry_from_hitl: bool,
        base_version_id: Optional[int],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> NodeInstance:
        """Centralized logic for validation, status updates, broadcasting, and enqueueing."""
        previous_status_enum = node.status
        previous_stage = node.current_stage
        previous_status_value = node.status.value

        validation_func(node, user_feedback, is_retry_from_hitl, base_version_id, adjudication_data)

        status_changed = False
        if node.status != NodeStatus.EXECUTING:
            try:
                node.status = NodeStatus.EXECUTING
                node.current_stage = ExecutionStage.INITIALIZING
                self.db.commit()
                self.db.refresh(node)
                status_changed = True
                await self._broadcast_node_update(node)
            except Exception:
                self.db.rollback()
                logger.exception("Failed to update node status to EXECUTING before enqueueing.", node_id=node.id)
                raise InvalidStateException("Failed to prepare node for execution due to database error.")

        try:
            await self._enqueue_job(
                node,
                user_feedback=user_feedback,
                is_retry_from_hitl=is_retry_from_hitl,
                base_version_id=base_version_id,
                adjudication_data=adjudication_data,
                previous_status=previous_status_value,
            )
        except InvalidStateException:
            if status_changed:
                logger.warning("Reverting node status due to enqueue failure.", node_id=node.id)
                try:
                    self.db.refresh(node)
                    if node.status == NodeStatus.EXECUTING:
                        node.status = previous_status_enum
                        node.current_stage = previous_stage
                        self.db.commit()
                        await self._broadcast_node_update(node)
                    else:
                        logger.info(
                            "Node status changed concurrently, skipping reversion.",
                            node_id=node.id,
                            current_status=node.status.value,
                        )
                except Exception:
                    logger.exception(
                        "CRITICAL: Failed to revert node status after enqueue failure. DB state may be inconsistent.",
                        node_id=node.id,
                    )
            raise
        return node

    async def enqueue_initial_execution(self, node_id: int, user: User) -> NodeInstance:
        """Start the first execution for a not-started node, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.NOT_STARTED:
            raise InvalidStateException(
                "Initial execution is only allowed for nodes that have not started.",
                details={"node_id": node.id, "current_status": node.status.value},
            )
        return await self._prepare_and_enqueue(
            node,
            self._validate_execution_request,
            None,
            False,
            None,
            None,
        )

    async def enqueue_re_execution(
        self,
        node_id: int,
        user: User,
        user_feedback: Optional[str] = None,
        base_version_id: Optional[int] = None,
    ) -> NodeInstance:
        """Re-run a completed node, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.COMPLETED:
            raise InvalidStateException(
                f"Node must be 'Completed' to re-execute; current status is '{node.status.value}'.",
                details={"node_id": node.id, "current_status": node.status.value},
            )
        return await self._prepare_and_enqueue(
            node,
            self._validate_execution_request,
            user_feedback,
            False,
            base_version_id,
            None,
        )

    async def enqueue_retry(
        self, node_id: int, user: User, user_feedback: Optional[str] = None
    ) -> NodeInstance:
        """Retry a failed or canceled node, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status not in [NodeStatus.FAILED, NodeStatus.CANCELED]:
            raise InvalidStateException(
                f"Node must be 'Failed' or 'Canceled' to retry; current status is '{node.status.value}'.",
                details={"node_id": node.id, "current_status": node.status.value},
            )
        return await self._prepare_and_enqueue(
            node,
            self._validate_execution_request,
            user_feedback,
            False,
            None,
            None,
        )

    async def enqueue_hitl_action(
        self,
        node_id: int,
        user: User,
        user_feedback: Optional[str] = None,
        adjudication_data: Optional[List[Dict[str, Any]]] = None,
    ) -> NodeInstance:
        """Enqueue a HITL action, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.AWAITING_HITL_APPROVAL:
            raise InvalidStateException(f"Cannot enqueue HITL action for node in status {node.status}")

        is_retry = bool(user_feedback)
        return await self._prepare_and_enqueue(
            node,
            self._validate_execution_request,
            user_feedback,
            is_retry,
            None,
            adjudication_data,
        )

    async def cancel_execution(self, node_id: int, user: User) -> Dict[str, str]:
        """Attempt to cancel an ongoing execution for a node."""
        node = self.get_node_instance(node_id, user=user)

        if node.status != NodeStatus.EXECUTING:
            raise InvalidStateException(f"Node is not currently executing. Status: {node.status.value}")

        redis = await get_redis_pool()
        job_key = f"executing_node:{node_id}"
        job = Job(job_key, redis)

        try:
            aborted = await job.abort()
            if aborted:
                logger.info("Cancellation signal sent for job {job_key}", job_key=job_key)
                return {"message": "Cancellation request sent. The node will transition to 'Canceled' shortly."}

            job_status = await job.status()
            if job_status == JobStatus.not_found:
                logger.warning("Job {job_key} not found in Redis during cancellation attempt.", job_key=job_key)
                self.db.refresh(node)
                if node.status == NodeStatus.EXECUTING:
                    logger.error(
                        "Inconsistent state detected for Node {node_id}. Forcing status correction.", node_id=node_id
                    )
                    node.status = NodeStatus.FAILED
                    node.current_stage = ExecutionStage.FAILED
                    if node.temporary_result:
                        node.temporary_result.error_log = (
                            "Execution state inconsistent (Job lost). Automatically marked as failed."
                        )
                    self.db.commit()
                    await self._broadcast_node_update(node)
                    return {"message": "Execution not found, but node status was inconsistent. Marked as Failed."}
                return {"message": f"Execution not found. Current status: {node.status.value}"}

            logger.warning("Could not send cancellation signal for job {job_key}.", job_key=job_key)
            self.db.refresh(node)
            if node.status != NodeStatus.EXECUTING:
                return {
                    "message": f"Execution could not be cancelled as it already completed or failed. Current status: {node.status.value}"
                }
            raise WorkflowException("Failed to cancel execution. The task might be unresponsive.", status_code=500)
        except Exception as exc:
            logger.exception("An unexpected error occurred during cancellation attempt for Node {node_id}.", node_id=node_id)
            raise WorkflowException(f"An error occurred during cancellation: {exc}", status_code=500) from exc

    async def execute_in_worker(
        self,
        node: NodeInstance,
        user_feedback: Optional[str] = None,
        is_retry_from_hitl: bool = False,
        base_version_id: Optional[int] = None,
        adjudication_data: Optional[List[Dict[str, Any]]] = None,
        previous_status: Optional[str] = None,
    ) -> NodeInstance:
        node_id = node.id
        original_status = NodeStatus(previous_status) if previous_status else node.status

        resolved_inputs: Dict[str, Any] = {}
        input_dependency_map: Dict[int, int] = {}
        previous_hitl_history: List[Dict[str, Any]] = []
        previous_output: Optional[Dict[str, Any]] = None
        executor_feedback = user_feedback
        temp_result: Optional[TemporaryExecutionResult] = None

        try:
            if is_retry_from_hitl or adjudication_data:
                resolved_inputs, input_dependency_map, previous_hitl_history, previous_output = self._prepare_hitl_loop_context(
                    node
                )
                temp_result = node.temporary_result
            else:
                resolved_inputs, input_dependency_map = self._resolve_dependencies(node)

                if original_status == NodeStatus.FAILED and node.temporary_result:
                    temp_result = self._prepare_failed_retry_context(node, input_dependency_map, user_feedback)
                    previous_hitl_history = temp_result.accumulated_hitl_interactions or []
                else:
                    base_history = self._get_base_history(node, base_version_id)
                    temp_result = self._create_fresh_temporary_result(
                        node,
                        input_dependency_map,
                        base_history,
                        user_feedback,
                    )
                    previous_hitl_history = temp_result.accumulated_hitl_interactions or []

                previous_output = None
        except Exception:
            logger.exception("Failed during execution preparation for node", node_id=node_id)
            self.db.rollback()
            raise

        if not temp_result:
            raise InvalidStateException("Internal Error: Failed to establish temporary execution context.")

        temp_result.error_log = None
        self.db.flush()

        project_snapshot = None
        if node.workflow and node.workflow.project:
            project_snapshot = node.workflow.project.configuration_snapshot

        executor = NodeExecutor(config=resolve_config(project_snapshot))

        try:
            node.current_stage = ExecutionStage.PROCESSING
            self.db.commit()
            await self._broadcast_node_update(node)

            execution_result: ExecutionResult = await executor.execute_node(
                node,
                resolved_inputs,
                previous_hitl_history,
                executor_feedback,
                previous_output,
                adjudication_data,
            )

            node.current_stage = ExecutionStage.GENERATING_OUTPUTS
            self.db.commit()
            await self._broadcast_node_update(node)

            temp_result.output_data = execution_result.output_data
            temp_result.execution_artifacts = execution_result.artifacts
            temp_result.error_log = None
            node.status = NodeStatus.AWAITING_HITL_APPROVAL
            node.current_stage = ExecutionStage.AWAITING_REVIEW
        except Exception as exc:
            logger.exception("Execution failed for node", node_id=node.id)
            temp_result.error_log = f"Error: {exc}\nTraceback:\n{traceback.format_exc()}"
            temp_result.output_data = None
            node.status = NodeStatus.FAILED
            node.current_stage = ExecutionStage.FAILED

        self.db.commit()
        self.db.refresh(node)
        await self._broadcast_node_update(node)
        return node

    # --- Execution Preparation Helper Methods ---

    def _prepare_hitl_loop_context(
        self, node: NodeInstance
    ) -> Tuple[Dict[str, Any], Dict[int, int], List[Dict[str, Any]], Optional[Dict[str, Any]]]:
        temp_result = node.temporary_result
        if not temp_result:
            raise InvalidStateException("Temporary execution context missing for HITL loop.")

        resolved_inputs, dependency_map = self._resolve_dependencies_from_map(node, temp_result.input_dependencies)
        history = temp_result.accumulated_hitl_interactions or []
        previous_output = temp_result.output_data
        return resolved_inputs, dependency_map, history, previous_output

    def _prepare_failed_retry_context(
        self,
        node: NodeInstance,
        input_dependency_map: Dict[int, int],
        user_feedback: Optional[str],
    ) -> TemporaryExecutionResult:
        if not node.temporary_result:
            raise InvalidStateException("Cannot retry FAILED node without a temporary execution result.")

        temp_result = node.temporary_result
        temp_result.error_log = None
        temp_result.input_dependencies = input_dependency_map

        interactions = temp_result.accumulated_hitl_interactions or []
        if user_feedback:
            interactions.append(
                {
                    "type": "RetryModificationComment",
                    "data": {"comment": user_feedback},
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                }
            )
        temp_result.accumulated_hitl_interactions = interactions[:]
        return temp_result

    def _get_base_history(self, node: NodeInstance, base_version_id: Optional[int]) -> List[Dict[str, Any]]:
        version_to_use_id = base_version_id if base_version_id is not None else node.active_version_id
        if not version_to_use_id:
            return []

        base_version = (
            self.db.query(NodeVersion)
            .filter_by(id=version_to_use_id, node_instance_id=node.id)
            .first()
        )
        if not base_version:
            raise InvalidStateException(
                f"Base version id {version_to_use_id} does not exist or does not belong to node {node.id}."
            )
        return base_version.hitl_history or []

    def _create_fresh_temporary_result(
        self,
        node: NodeInstance,
        input_map: Dict[int, int],
        history: List[Dict[str, Any]],
        initial_feedback: Optional[str],
    ) -> TemporaryExecutionResult:
        if node.temporary_result:
            self.db.delete(node.temporary_result)
            self.db.flush()

        interactions = history[:]
        if initial_feedback:
            interactions.append(
                {
                    "type": "InitialModificationComment",
                    "data": {"comment": initial_feedback},
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                }
            )

        temp_result = TemporaryExecutionResult(
            node_instance_id=node.id,
            input_dependencies=input_map,
            accumulated_hitl_interactions=interactions,
            execution_artifacts={},
            llm_model_name=settings.LLM_MODEL_NAME,
            temperature=settings.DEFAULT_TEMPERATURE,
        )
        self.db.add(temp_result)
        self.db.flush()
        return temp_result

    def _validate_execution_request(
        self,
        node: NodeInstance,
        user_feedback: Optional[str],
        is_retry_from_hitl: bool,
        base_version_id: Optional[int],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ):
        if adjudication_data:
            if node.hitl_mode != HITLMode.AVL:
                raise InvalidStateException("Adjudication data can only be provided for AVL nodes.")
            if node.status != NodeStatus.AWAITING_HITL_APPROVAL or not node.temporary_result:
                raise InvalidStateException(
                    "Cannot continue AVL loop unless status is AWAITING_HITL_APPROVAL with pending results."
                )
            if is_retry_from_hitl or user_feedback or base_version_id is not None:
                raise InvalidStateException("Conflicting parameters provided for AVL loop continuation.")
            return

        if is_retry_from_hitl:
            if node.status != NodeStatus.AWAITING_HITL_APPROVAL or not node.temporary_result:
                raise InvalidStateException(
                    "Cannot retry from HITL unless status is AWAITING_HITL_APPROVAL with temporary results."
                )
            if not user_feedback:
                raise InvalidStateException("Feedback must be provided for HITL retry.")
            if base_version_id is not None:
                raise InvalidStateException("base_version_id cannot be specified during a HITL retry loop.")
            return

        if node.node_type == NodeType.GENERATOR and node.status == NodeStatus.COMPLETED:
            raise ForbiddenException("Generator nodes cannot be re-executed once completed (R2.3).")

        if base_version_id is not None:
            exists = (
                self.db.query(NodeVersion.id)
                .filter_by(id=base_version_id, node_instance_id=node.id)
                .scalar()
                is not None
            )
            if not exists:
                raise InvalidStateException(
                    f"Base version id {base_version_id} does not exist or does not belong to node {node.id}."
                )

    def _resolve_external_inputs(self, node: NodeInstance) -> Dict[str, Any]:
        """
        Resolve external data dependencies by querying ProjectFile records once and
        loading the referenced blobs from storage.
        """
        resolved_external: Dict[str, Any] = {}
        if not node.external_inputs:
            return resolved_external

        def get_role_from_key(key: str) -> FileRole:
            if key in _INPUT_KEY_TO_ROLE_MAP:
                return _INPUT_KEY_TO_ROLE_MAP[key]
            try:
                return FileRole(key)
            except ValueError as exc:
                raise DependencyException(
                    f"Unknown external input key '{key}' defined in workflow. No matching FileRole found."
                ) from exc

        workflow = self.db.query(WorkflowInstance).get(node.workflow_instance_id)
        if not workflow or not workflow.project_id:
            raise DependencyException(
                "Node requires external inputs but is not linked to a valid project.",
                details={"node_id": node.id, "workflow_id": node.workflow_instance_id},
            )

        project_id = workflow.project_id
        logger.info("Resolving external inputs for project_id={project_id}", project_id=project_id)

        required_roles = {get_role_from_key(key) for key in node.external_inputs}
        project_files = (
            self.db.query(ProjectFile)
            .filter(
                ProjectFile.project_id == project_id,
                ProjectFile.role.in_(list(required_roles)),
            )
            .all()
        )

        files_by_role: Dict[FileRole, List[ProjectFile]] = defaultdict(list)
        for project_file in project_files:
            files_by_role[project_file.role].append(project_file)

        for input_key in node.external_inputs:
            role_to_find = get_role_from_key(input_key)
            matching_files = files_by_role.get(role_to_find, [])

            if not matching_files:
                raise DependencyException(
                    f"Required file with role '{role_to_find.value}' not found for project {project_id}.",
                    details={"project_id": project_id, "required_role": role_to_find.value},
                )

            if len(matching_files) > 1:
                raise DependencyException(
                    f"Ambiguous dependency: Found {len(matching_files)} files with role '{role_to_find.value}' for project {project_id}. Expected 1.",
                    details={
                        "project_id": project_id,
                        "ambiguous_role": role_to_find.value,
                        "file_ids": [f.id for f in matching_files],
                    },
                )

            project_file = matching_files[0]

            try:
                content_bytes = storage_service.get_file_content(project_file.storage_path)
                resolved_external[input_key] = content_bytes.decode("utf-8")
                logger.debug(
                    "Resolved external input '{key}' using file '{filename}'",
                    key=input_key,
                    filename=project_file.filename,
                )
            except FileNotFoundError as exc:
                logger.error(
                    "Data integrity issue: DB record for file '{path}' exists but file is missing from storage.",
                    path=project_file.storage_path,
                )
                raise DependencyException(
                    f"File not found in storage for role '{role_to_find.value}' at path '{project_file.storage_path}'."
                ) from exc
            except Exception as exc:
                logger.exception("Failed to read or decode file content for role '{role}'", role=role_to_find.value)
                raise DependencyException(f"Error processing file for role '{role_to_find.value}': {exc}") from exc

        return resolved_external

    def _resolve_dependencies(self, node: NodeInstance) -> Tuple[Dict[str, Any], Dict[int, int]]:
        input_dependency_map: Dict[int, int] = {}
        resolved_inputs = self._resolve_external_inputs(node)

        if not node.dependencies:
            return resolved_inputs, input_dependency_map

        upstream_definition_ids = list(node.dependencies.keys())
        upstream_nodes = (
            self.db.query(NodeInstance)
            .filter(
                NodeInstance.workflow_instance_id == node.workflow_instance_id,
                NodeInstance.definition_id.in_(upstream_definition_ids),
            )
            .options(joinedload(NodeInstance.active_version))
            .all()
        )

        found_definition_ids = set()
        for upstream in upstream_nodes:
            definition_id = upstream.definition_id
            found_definition_ids.add(definition_id)
            if upstream.status != NodeStatus.COMPLETED or not upstream.active_version:
                raise DependencyException(f"Upstream dependency '{definition_id}' is not completed.")

            upstream_output = upstream.active_version.output_data or {}
            dependency_spec = node.dependencies.get(definition_id, {})
            required_fields = dependency_spec.get("required_fields", [])

            if required_fields:
                missing_fields = [field for field in required_fields if field not in upstream_output]
                if missing_fields:
                    raise DependencyException(f"Upstream dependency '{definition_id}' is missing fields: {missing_fields}")

            upstream_input_data: Dict[str, Any] = {}
            if required_fields:
                for field in required_fields:
                    upstream_input_data[field] = upstream_output[field]
            resolved_inputs[definition_id] = upstream_input_data
            input_dependency_map[upstream.id] = upstream.active_version_id

        if len(found_definition_ids) != len(upstream_definition_ids):
            missing = set(upstream_definition_ids) - found_definition_ids
            raise DependencyException(f"Could not resolve dependencies: {missing}")
        return resolved_inputs, input_dependency_map

    def _resolve_dependencies_from_map(
        self,
        node: NodeInstance,
        dependency_map: Dict[int, int],
        db_session: Optional[Session] = None,
    ) -> Tuple[Dict[str, Any], Dict[int, int]]:
        db = db_session or self.db
        dependency_map = dependency_map or {}
        try:
            resolved_inputs = self._resolve_external_inputs(node)
        except DependencyException:
            logger.exception("Fatal: Failed to re-resolve external inputs during retry", node_id=node.id)
            raise

        version_ids = list(dependency_map.values())
        if not version_ids:
            return resolved_inputs, dependency_map

        versions = db.query(NodeVersion).filter(NodeVersion.id.in_(version_ids)).options(
            joinedload(NodeVersion.node_instance)
        ).all()
        version_lookup = {version.id: version for version in versions}

        for node_id_value, version_id in dependency_map.items():
            version = version_lookup.get(version_id)
            if not version:
                raise NotFoundException(f"Dependency version {version_id} not found.")

            definition_id = version.node_instance.definition_id
            upstream_output = version.output_data or {}
            dependency_spec = node.dependencies.get(definition_id, {}) if node.dependencies else {}
            required_fields = dependency_spec.get("required_fields", [])

            if required_fields:
                missing_fields = [field for field in required_fields if field not in upstream_output]
                if missing_fields:
                    raise DependencyException(
                        f"Upstream dependency '{definition_id}' is missing fields: {missing_fields}"
                    )

            upstream_input_data: Dict[str, Any] = {}
            if required_fields:
                for field in required_fields:
                    upstream_input_data[field] = upstream_output[field]
            resolved_inputs[definition_id] = upstream_input_data

        return resolved_inputs, dependency_map

    def get_node_detail_view(self, node_id: int, user: User) -> NodeDetailView:
        """Get the detailed view for a node, with an ownership check and optimized query."""
        node = (
            self.db.query(NodeInstance)
            .options(joinedload(NodeInstance.active_version), joinedload(NodeInstance.temporary_result))
            .get(node_id)
        )
        if not node:
            raise NotFoundException(f"NodeInstance with id {node_id} not found.")
        if node.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this node.")

        if node.status == NodeStatus.NOT_STARTED:
            max_executed_index = (
                self.db.query(func.max(NodeInstance.order_index))
                .filter(
                    NodeInstance.workflow_instance_id == node.workflow_instance_id,
                    NodeInstance.status != NodeStatus.NOT_STARTED,
                )
                .scalar()
            )

            execution_frontier = 0 if max_executed_index is None else max_executed_index + 1
            if node.order_index > execution_frontier:
                raise ForbiddenException(
                    f"Cannot jump ahead (R5.2). Node {node.definition_id} (Index {node.order_index}) "
                    f"is beyond the execution frontier (Index {execution_frontier})."
                )

        view = NodeDetailView.model_validate(node)
        if node.active_version:
            view.active_version = NodeVersionRead.model_validate(node.active_version)
        if node.temporary_result:
            view.pending_result = TemporaryExecutionRead.model_validate(node.temporary_result)

        inputs_to_check = None
        if node.status == NodeStatus.COMPLETED and node.active_version:
            inputs_to_check = node.active_version.input_dependencies
        elif node.temporary_result:
            inputs_to_check = node.temporary_result.input_dependencies

        if inputs_to_check:
            staleness_report = self._check_staleness(inputs_to_check)
            view.staleness_report = staleness_report or None

        return view

    def _check_staleness(self, input_map: Dict[int, int]) -> List[StalenessInfo]:
        if not input_map:
            return []

        staleness_report: List[StalenessInfo] = []
        upstream_node_ids = list(input_map.keys())
        upstream_nodes = self.db.query(NodeInstance).filter(NodeInstance.id.in_(upstream_node_ids)).all()

        for upstream in upstream_nodes:
            consumed_version_id = input_map.get(upstream.id)
            if upstream.active_version_id != consumed_version_id:
                staleness_report.append(
                    StalenessInfo(
                        upstream_node_id=upstream.id,
                        upstream_definition_id=upstream.definition_id,
                        consumed_version_id=consumed_version_id,
                        current_active_version_id=upstream.active_version_id,
                    )
                )
        return staleness_report

    def _create_manual_version(
        self,
        node: NodeInstance,
        base_version: NodeVersion,
        submission: ManualEditSubmission,
    ) -> NodeVersion:
        """Create a new NodeVersion record based on a manual edit submission."""
        with self.db.begin_nested():
            (
                self.db.query(NodeInstance)
                .filter_by(id=node.id)
                .with_for_update()
                .one()
            )

            max_version = (
                self.db.query(func.max(NodeVersion.version_number))
                .filter_by(node_instance_id=node.id)
                .scalar()
            )
            next_version_number = (max_version or 0) + 1

            history = list(base_version.hitl_history or [])
            history.append(
                {
                    "type": "ManualEdit",
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "data": {"summary": submission.summary},
                }
            )

            new_version = NodeVersion(
                node_instance_id=node.id,
                version_number=next_version_number,
                source=VersionSource.MANUALLY_EDITED,
                based_on_version_id=base_version.id,
                output_data=submission.edited_output_data,
                raw_generated_output=base_version.raw_generated_output,
                execution_artifacts=base_version.execution_artifacts,
                input_dependencies=base_version.input_dependencies,
                hitl_history=history,
                llm_model_name=base_version.llm_model_name,
                temperature=base_version.temperature,
                summary=submission.summary or f"Manual edit based on v{base_version.version_number}",
            )
            self.db.add(new_version)
            self.db.flush()

        return new_version

    async def _finalize_node_completion_and_advance(
        self,
        node: NodeInstance,
        user: User,
        new_version: NodeVersion,
        final_output: Dict[str, Any],
    ):
        """
        Centralized helper to finalize node completion, update workflow state, and advance execution.
        """
        from backend.services.workflow_service import WorkflowService

        workflow_service = WorkflowService(self.db)
        next_node: Optional[NodeInstance] = None
        structure_changed = False
        workflow_completed = False
        old_version_id = node.active_version_id

        try:
            node.active_version_id = new_version.id
            node.status = NodeStatus.COMPLETED
            node.current_stage = ExecutionStage.COMPLETED

            if node.temporary_result:
                self.db.delete(node.temporary_result)

            self.db.flush()

            if node.node_type == NodeType.GENERATOR:
                structure_changed = workflow_service.handle_generator_node_completion(node, final_output)

            next_node = workflow_service.get_next_node(node)

            if not next_node:
                workflow_service.complete_workflow(node.workflow_instance_id, user=user)
                workflow_completed = True

            self.db.commit()
        except Exception:
            self.db.rollback()
            logger.exception(
                "Transaction failed during node finalization and workflow advancement",
                node_id=node.id,
            )
            raise InvalidStateException("Failed to finalize node completion due to an internal error.")

        self.db.refresh(node)
        await self._broadcast_node_update(node)
        if old_version_id != new_version.id:
            await self._broadcast_version_change(node)

        if structure_changed:
            await workflow_service.broadcast_structure_update(node.workflow_instance_id)

        if workflow_completed:
            workflow_read = workflow_service.get_workflow_instance(node.workflow_instance_id, user=user)
            await workflow_service._broadcast_workflow_update(workflow_read)

        if next_node and next_node.status == NodeStatus.NOT_STARTED:
            await self.enqueue_initial_execution(next_node.id, user=user)

    async def submit_manual_edit(
        self,
        node_id: int,
        user: User,
        submission: ManualEditSubmission,
    ) -> NodeInstance:
        """
        Process a manual edit submission, creating a new version and advancing the workflow (FRS R4).
        """
        node = self.get_node_instance(node_id, user=user)

        if node.status == NodeStatus.COMPLETED and node.node_type == NodeType.GENERATOR:
            raise ForbiddenException("Cannot edit a completed Generator node as it would alter the workflow structure.")

        base_version = (
            self.db.query(NodeVersion)
            .filter_by(id=submission.base_version_id, node_instance_id=node.id)
            .first()
        )
        if not base_version:
            raise InvalidStateException(f"Base version {submission.base_version_id} not found for this node.")

        try:
            new_version = self._create_manual_version(node, base_version, submission)
            await self._finalize_node_completion_and_advance(
                node,
                user,
                new_version,
                final_output=submission.edited_output_data,
            )
        except Exception:
            logger.exception("Failed to process manual edit for node", node_id=node_id)
            raise

        return node

    async def switch_active_version(self, node_id: int, version_id: int, user: User) -> NodeInstance:
        """Switch a node's active version, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        version = self.db.query(NodeVersion).filter_by(id=version_id, node_instance_id=node_id).first()
        if not version:
            raise InvalidStateException(f"Version {version_id} does not belong to node {node_id}.")
        if node.node_type == NodeType.GENERATOR:
            raise ForbiddenException("Switching versions on Generator nodes is forbidden.")
        node.active_version_id = version_id
        status_changed = False
        if node.status not in [NodeStatus.EXECUTING, NodeStatus.AWAITING_HITL_APPROVAL]:
            if node.status != NodeStatus.COMPLETED:
                node.status = NodeStatus.COMPLETED
                node.current_stage = ExecutionStage.COMPLETED
                status_changed = True
        self.db.commit()
        self.db.refresh(node)

        if status_changed:
            await self._broadcast_node_update(node)

        await self._broadcast_version_change(node)
        return node

    async def _broadcast_node_update(self, node: NodeInstance):
        """Broadcasts a standardized node update event."""

        node_data = NodeInstanceRead.model_validate(node).model_dump(mode="json")
        await broadcast_event(node.workflow_instance_id, EventType.NODE_STATUS_UPDATED, node_data, node_id=node.id)

    async def _broadcast_version_change(self, node: NodeInstance):
        """Broadcasts that the active version has changed."""
        node_data = NodeInstanceRead.model_validate(node).model_dump(mode="json")
        await broadcast_event(
            node.workflow_instance_id,
            EventType.NODE_ACTIVE_VERSION_CHANGED,
            node_data,
            node_id=node.id,
        )

    def get_versions(self, node_id: int, user: User) -> List[NodeVersion]:
        """Get all versions for a node, with an ownership check."""
        self.get_node_instance(node_id, user=user)
        return (
            self.db.query(NodeVersion)
            .filter(NodeVersion.node_instance_id == node_id)
            .order_by(NodeVersion.version_number.desc())
            .all()
        )

    def get_version_details(self, node_id: int, version_id: int, user: User) -> NodeVersionRead:
        """Get details for a specific version, with an ownership check."""
        self.get_node_instance(node_id, user=user)
        version = self.db.query(NodeVersion).filter_by(id=version_id, node_instance_id=node_id).first()
        if not version:
            raise NotFoundException(f"Version {version_id} for Node {node_id} not found.")
        return NodeVersionRead.model_validate(version)

```

### services/project_service.py Content:

```py
"""
Service for managing the project lifecycle and workflow orchestration.
"""
from pathlib import Path
from typing import List, Optional, Tuple

from fastapi import UploadFile
from loguru import logger
from sqlalchemy.orm import Session

from backend.config import settings
from backend.exceptions import DependencyException, ForbiddenException, InvalidStateException, NotFoundException
from backend.models.project import FileRole, HistoricalProblem, Project, ProjectFile, ProjectStatus, ProblemType
from backend.models.user import User
from backend.models.workflow import NodeInstance, WorkflowInstance
from backend.repositories import ProjectRepository
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.services.storage_service import storage_service
from backend.services.user_service import UserService
from backend.services.workflow_service import WorkflowService


class ProjectService:
    """Service for managing the project lifecycle and configuration."""

    def __init__(
        self,
        db: Session,
        user_service: Optional[UserService] = None,
        workflow_service: Optional[WorkflowService] = None,
    ):
        """
        Initialize service dependencies, allowing overrides for testability.
        """
        self.db = db
        self.user_service = user_service or UserService()
        self.workflow_service = workflow_service or WorkflowService(db)
        self.project_repo = ProjectRepository(db)

    def _get_project_for_user(self, project_id: int, user: User) -> Project:
        """Retrieve a project and enforce ownership."""
        project = self.project_repo.get(project_id)
        if not project:
            raise NotFoundException(f"Project with id {project_id} not found.")
        if project.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this project.")
        return project

    def create_project(self, project_data: ProjectCreate, user: User) -> Project:
        """Create a new project for the given user."""
        existing_project = self.project_repo.find_by_name_for_user(project_data.name, user)
        if existing_project:
            raise InvalidStateException(
                f"Project with name '{project_data.name}' already exists.",
                error_code="PROJECT_NAME_EXISTS",
            )

        new_project = Project(
            user_id=user.id,
            name=project_data.name,
            description=project_data.description,
            status=ProjectStatus.CONFIGURING,
        )
        self.db.add(new_project)
        self.db.commit()
        self.db.refresh(new_project)
        logger.info("Created new project '{}' for user {}", new_project.name, user.id)
        return new_project

    def get_projects_paginated(self, user: User, skip: int, limit: int) -> Tuple[int, List[Project]]:
        """Return a user's projects along with a total count for pagination."""
        return self.project_repo.list_paginated_for_user(user, skip, limit)

    def get_historical_problems(self) -> List[HistoricalProblem]:
        """Retrieve the list of available historical problems (R3.3)."""
        return (
            self.db.query(HistoricalProblem)
            .order_by(HistoricalProblem.year.desc(), HistoricalProblem.type)
            .all()
        )

    def get_project_details(self, project_id: int, user: User) -> Project:
        """Return project details after verifying ownership."""
        project = self.project_repo.get_with_details(project_id)
        if not project:
            raise NotFoundException(f"Project with id {project_id} not found.")
        if project.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this project.")
        return project

    def update_project(self, project_id: int, update_data: ProjectUpdate, user: User) -> Project:
        """Update mutable project fields."""
        project = self._get_project_for_user(project_id, user)
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(project, key, value)
        self.db.commit()
        self.db.refresh(project)
        logger.info("Updated project {}", project_id)
        return project

    def delete_project(self, project_id: int, user: User) -> None:
        """Delete a project and its stored files."""
        project = self.project_repo.get_with_details(project_id)
        if not project:
            raise NotFoundException(f"Project with id {project_id} not found.")
        if project.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this project.")

        files_to_delete = list(project.files)
        try:
            for file_record in files_to_delete:
                storage_service.delete_file(file_record.storage_path)
            logger.info("Deleted stored files for project {}", project_id)
        except Exception as exc:
            logger.exception("Failed to delete stored files for project {}, aborting.", project_id)
            raise DependencyException(f"Could not delete associated files for project {project_id}") from exc

        self.db.delete(project)
        self.db.commit()
        logger.info("Deleted project {} from database for user {}", project_id, user.id)

    async def upload_file(self, project_id: int, user: User, file: UploadFile, role: FileRole) -> ProjectFile:
        """Upload and associate a file with the project."""
        project = self._get_project_for_user(project_id, user)
        content = await file.read()
        new_file = self._create_and_store_file(project, user, file.filename, role, content)
        self.db.commit()
        self.db.refresh(new_file)
        logger.info("Uploaded file '{}' for project {}", file.filename, project_id)
        return new_file

    def _create_and_store_file(
        self,
        project: Project,
        user: User,
        filename: str,
        role: FileRole,
        content: bytes,
    ) -> ProjectFile:
        """Persist content to storage and return the ProjectFile record."""
        storage_path = storage_service.save_file(
            user_id=user.id,
            project_id=project.id,
            filename=filename,
            content=content,
        )
        new_file = ProjectFile(
            project_id=project.id,
            user_id=user.id,
            filename=filename,
            role=role,
            storage_path=storage_path,
        )
        self.db.add(new_file)
        return new_file

    def initialize_from_historical(self, project_id: int, historical_problem_id: int, user: User) -> Project:
        """Configure a project using assets from the historical library."""
        project = self._get_project_for_user(project_id, user)
        historical_problem = self.db.query(HistoricalProblem).get(historical_problem_id)
        if not historical_problem:
            raise NotFoundException(f"HistoricalProblem with id {historical_problem_id} not found.")

        historical_data_base_path = Path(settings.EXTERNAL_DATA_DIR)
        try:
            desc_path = historical_data_base_path / historical_problem.description_path
            desc_content = desc_path.read_bytes()
            self._create_and_store_file(project, user, desc_path.name, FileRole.PROBLEM_DESCRIPTION, desc_content)

            if historical_problem.dataset_path:
                dataset_path = historical_data_base_path / historical_problem.dataset_path
                dataset_content = dataset_path.read_bytes()
                self._create_and_store_file(project, user, dataset_path.name, FileRole.DATASET, dataset_content)

            project.historical_problem_id = historical_problem.id
            project.problem_type = historical_problem.type
            self.db.commit()
            self.db.refresh(project)
            logger.info("Initialized project {} from historical problem {}", project_id, historical_problem_id)
            return project
        except FileNotFoundError as exc:
            self.db.rollback()
            logger.error("Failed to find historical problem file: {}", exc)
            raise DependencyException(f"A file for '{historical_problem.name}' was not found on the server.") from exc
        except Exception:
            self.db.rollback()
            logger.exception("Failed during historical problem initialization for project {}", project_id)
            raise

    def _create_workflow_for_project(self, project: Project) -> WorkflowInstance:
        """Create and initialize a workflow (and its nodes) for the project."""
        workflow = WorkflowInstance(
            name=f"Workflow for '{project.name}'",
            project_id=project.id,
            user_id=project.user_id,
        )
        self.db.add(workflow)
        self.db.flush()
        self.workflow_service._initialize_nodes(workflow)
        return workflow

    async def start_workflow(self, project_id: int, user: User) -> NodeInstance:
        """Start the workflow for a configured project."""
        project = self._get_project_for_user(project_id, user)

        if project.status != ProjectStatus.CONFIGURING:
            raise InvalidStateException("Project must be in 'Configuring' status to start a workflow.")
        if project.problem_type == ProblemType.UNKNOWN:
            raise InvalidStateException("Problem Type must be set before starting.")
        has_problem_description = (
            self.db.query(ProjectFile)
            .filter_by(project_id=project.id, role=FileRole.PROBLEM_DESCRIPTION)
            .first()
        )
        if not has_problem_description:
            raise InvalidStateException("A 'Problem Description' file must be uploaded before starting.")
        if project.workflow_instance:
            raise InvalidStateException("A workflow has already been started for this project.")

        try:
            decrypted_settings = self.user_service.get_decrypted_settings(self.db, user)
            project.configuration_snapshot = decrypted_settings
            project.status = ProjectStatus.RUNNING

            workflow = self._create_workflow_for_project(project)
            self.db.commit()
            logger.info(
                "Snapshot created, project {} status set to RUNNING. Workflow {} created.",
                project.id,
                workflow.id,
            )

            first_node = await self.workflow_service.start_workflow(workflow.id, user)
            logger.info("Successfully started workflow {} for project {}.", workflow.id, project.id)
            return first_node
        except Exception:
            self.db.rollback()
            logger.exception("Failed to start workflow for project {}", project_id)
            raise

```

### services/storage_service.py Content:

```py
"""
Service for securely managing file storage and retrieval with tenant isolation.
This service abstracts file system operations and enforces security policies to
prevent unauthorized file access.
"""

import os
import uuid
from pathlib import Path

from loguru import logger

from backend.config import settings
from backend.exceptions import ForbiddenException, NotFoundException


class StorageService:
    """
    Manages file storage and retrieval with tenant isolation.
    Ensures that files are stored in a structured way (e.g., base_path/user_id/project_id/)
    and prevents path traversal attacks.
    """

    def __init__(self, base_path: Path):
        self.base_path = base_path.resolve()  # Use absolute path for security checks
        # Ensure the base directory exists
        os.makedirs(self.base_path, exist_ok=True)
        logger.info("StorageService initialized with base path: {}", self.base_path)

    def _get_project_dir(self, user_id: int, project_id: int) -> Path:
        """Constructs and returns the directory path for a specific project."""
        return self.base_path / str(user_id) / str(project_id)

    def _get_and_validate_path(self, storage_path: str) -> Path:
        """
        Constructs a full, absolute path from a relative storage path and validates it.
        Raises:
            ForbiddenException: If the path is invalid or outside the storage root.
        """
        # Prevent any path traversal characters in the relative path.
        if ".." in Path(storage_path).parts:
            logger.warning("Path traversal attempt detected in storage path: {}", storage_path)
            raise ForbiddenException("Invalid storage path format.")

        full_path = (self.base_path / storage_path).resolve()

        # Security Check: Ensure the resolved path is within the base storage directory.
        try:
            if not full_path.is_relative_to(self.base_path):
                raise ForbiddenException("Access to this file path is forbidden.")
        except AttributeError:  # Fallback for Python < 3.9
            if not str(full_path).startswith(str(self.base_path)):
                raise ForbiddenException("Access to this file path is forbidden.")

        return full_path

    def save_file(self, user_id: int, project_id: int, filename: str, content: bytes) -> str:
        """
        Saves file content to a user- and project-specific directory with a unique name.
        Args:
            user_id: The ID of the user owning the project.
            project_id: The ID of the project.
            filename: The original name of the file to save.
            content: The binary content of the file.
        Returns:
            The unique, relative storage path to be saved in the database.
        """
        project_dir = self._get_project_dir(user_id, project_id)
        os.makedirs(project_dir, exist_ok=True)

        original_path = Path(filename)
        # Sanitize filename to prevent security issues (e.g., path traversal in filename itself)
        safe_stem = Path(original_path.stem).name
        if not safe_stem:
            raise ValueError("A valid filename must be provided.")

        # Optimization: Generate a unique filename to prevent overwrites.
        unique_id = uuid.uuid4().hex[:8]
        unique_filename = f"{safe_stem}-{unique_id}{original_path.suffix}"

        file_path = project_dir / unique_filename
        file_path.write_bytes(content)

        relative_path = str(file_path.relative_to(self.base_path))
        logger.info("File saved successfully. Original: '{}', Stored As: '{}'", filename, relative_path)
        return relative_path

    def get_file_content(self, storage_path: str) -> bytes:
        """
        Retrieves the content of a file given its relative storage path.
        Args:
            storage_path: The relative path from the database.
        Returns:
            The binary content of the file.
        """
        full_path = self._get_and_validate_path(storage_path)

        if not full_path.is_file():
            raise NotFoundException(f"File not found at storage path: {storage_path}")

        logger.debug("Reading file content from: {}", full_path)
        return full_path.read_bytes()

    def delete_file(self, storage_path: str) -> None:
        """
        Deletes a file given its relative storage path. Is idempotent.
        Args:
            storage_path: The relative path from the database.
        """
        try:
            full_path = self._get_and_validate_path(storage_path)

            if full_path.is_file():
                os.remove(full_path)
                logger.info("File deleted successfully: {}", full_path)
            else:
                logger.warning("Attempted to delete a non-existent file, operation skipped: {}", storage_path)
        except (NotFoundException, ForbiddenException) as e:
            # If path is invalid or not found, we can consider the "delete" successful.
            logger.warning("Skipped deleting file due to path validation issue: {}. Message: {}", storage_path, e)


# Instantiate a singleton for the service, making it easily accessible.
storage_service = StorageService(base_path=settings.STORAGE_BASE_PATH)

```

### services/user_service.py Content:

```py
"""Service for managing user-specific settings, including BYOK credentials."""

from typing import Any, Dict

from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.security import decrypt_data, encrypt_data
from backend.config import settings
from backend.models.user import User, UserSettings
from backend.schemas.user import UserSettingsRead, UserSettingsUpdate


class UserService:
    """Service for managing user-specific settings."""

    def get_settings(self, db: Session, user: User) -> UserSettingsRead:
        """
        Retrieve settings for a given user and return them as a Pydantic schema.

        Args:
            db: The database session.
            user: The user object.

        Returns:
            The UserSettingsRead schema object with sensitive data appropriately represented.
        """
        user_settings_orm = user.settings
        if not user_settings_orm:
            logger.critical(
                "Data integrity error: UserSettings not found for an existing user. "
                "This should not happen as they are created during registration.",
                user_id=user.id,
            )
            raise Exception(f"CRITICAL: No settings found for user {user.id}")

        return UserSettingsRead(
            language=user_settings_orm.language,
            theme=user_settings_orm.theme,
            hitl_profile=user_settings_orm.hitl_profile,
            thinking_depth=user_settings_orm.thinking_depth,
            llm_model_name=user_settings_orm.llm_model_name,
            llm_base_url=user_settings_orm.llm_base_url,
            has_llm_api_key=bool(user_settings_orm.llm_api_key_encrypted),
            has_e2b_api_key=bool(user_settings_orm.e2b_api_key_encrypted),
        )

    def update_settings(self, db: Session, user: User, settings_in: UserSettingsUpdate) -> UserSettingsRead:
        """
        Update user settings, securely encrypting API keys before storage,
        and return the updated settings as a Pydantic schema.

        Args:
            db: The database session.
            user: The user whose settings are being updated.
            settings_in: A Pydantic model with optional fields to update.

        Returns:
            The updated UserSettingsRead schema object.
        """
        user_settings_orm = user.settings
        if not user_settings_orm:
            # This check is defensive; in practice, user.settings should always exist.
            logger.critical("Data integrity error: UserSettings not found for user {}.", user.id)
            raise Exception(f"CRITICAL: No settings found for user {user.id}")

        update_data = settings_in.model_dump(exclude_unset=True)

        try:
            for key, value in update_data.items():
                if key == "llm_api_key":
                    user_settings_orm.llm_api_key_encrypted = encrypt_data(value) if value else None
                elif key == "e2b_api_key":
                    user_settings_orm.e2b_api_key_encrypted = encrypt_data(value) if value else None
                elif hasattr(user_settings_orm, key):
                    setattr(user_settings_orm, key, value)

            db.commit()
            db.refresh(user_settings_orm)
            logger.info("User settings updated successfully.", user_id=user.id)

            # Convert the updated ORM model to the response schema before returning.
            return self.get_settings(db, user)
        except Exception:
            db.rollback()
            logger.exception("Failed to update user settings.", user_id=user.id)
            raise

    def get_decrypted_settings(self, db: Session, user: User) -> Dict[str, Any]:
        """
        Retrieve user settings with sensitive values decrypted for internal use.
        This is critical for creating the project's configuration snapshot.
        This method is unchanged as it serves a different internal purpose.

        Args:
            db: The database session.
            user: The user object.

        Returns:
            A dictionary of settings with decrypted API keys.
        """
        user_settings = user.settings
        if not user_settings:
            logger.critical("Data integrity error: UserSettings not found for user {}", user.id)
            raise Exception(f"CRITICAL: No settings found for user {user.id}")


        # Explicitly construct the dictionary to avoid accidentally exposing
        # internal fields (like id, user_id) and to provide a stable contract.
        decrypted_settings = {
            "language": user_settings.language.value,
            "theme": user_settings.theme.value,
            "hitl_profile": user_settings.hitl_profile.value,
            "thinking_depth": user_settings.thinking_depth.value,
            "llm_model_name": user_settings.llm_model_name or settings.LLM_MODEL_NAME,
            "llm_base_url": user_settings.llm_base_url or settings.LLM_BASE_URL,
            "llm_provider": settings.LLM_PROVIDER,
            "llm_api_key": settings.LLM_API_KEY,
            "e2b_api_key": settings.E2B_API_KEY,
        }

        try:
            if user_settings.llm_api_key_encrypted:
                decrypted_settings["llm_api_key"] = decrypt_data(user_settings.llm_api_key_encrypted)
        except Exception:
            logger.warning(
                "Failed to decrypt LLM API key for user. Falling back to default.", user_id=user.id
            )
            decrypted_settings["llm_api_key"] = decrypted_settings.get("llm_api_key") or settings.LLM_API_KEY

        try:
            if user_settings.e2b_api_key_encrypted:
                decrypted_settings["e2b_api_key"] = decrypt_data(user_settings.e2b_api_key_encrypted)
        except Exception:
            logger.warning("Failed to decrypt E2B API key for user. Proceeding without it.", user_id=user.id)
            decrypted_settings["e2b_api_key"] = decrypted_settings.get("e2b_api_key")

        return decrypted_settings
```

### services/workflow_service.py Content:

```py
from collections import OrderedDict
from typing import Any, Dict, List, Optional, Set

from loguru import logger
from sqlalchemy.orm import Session, joinedload

from backend.exceptions import ForbiddenException, InvalidStateException, NotFoundException
from backend.models.project import Project
from backend.models.user import User
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, WorkflowInstance, WorkflowStatus
from backend.schemas.common import PaginatedResponse
from backend.schemas.events import EventType
from backend.schemas.node import NodeInstanceRead, StalenessInfo
from backend.schemas.workflow import (
    PhaseRead,
    StageRead,
    WorkflowCreate,
    WorkflowInstanceRead,
    WorkflowUpdate,
)
from backend.utils.event_utils import broadcast_event
from backend.workflow import DEFAULT_WORKFLOW_SPEC_ID, load_workflow_spec
from backend.workflow.constants import PREVIOUS_IN_TASK
from backend.workflow.spec import NodeType, WorkflowSpec


def _merge_dependencies(
    base_deps: Optional[Dict[str, Dict[str, List[str]]]],
    overlay_deps: Optional[Dict[str, List[str]]],
) -> Dict[str, Dict[str, List[str]]]:
    """
    Merge overlay dependencies into the base dependencies while keeping required_fields unique.
    """
    merged: Dict[str, Dict[str, List[str]]] = {}
    if base_deps:
        for upstream_id, metadata in base_deps.items():
            fields = metadata.get("required_fields", [])
            merged[upstream_id] = {"required_fields": list(fields)}

    if not overlay_deps:
        return merged

    for upstream_id, required_fields_list in overlay_deps.items():
        if not isinstance(required_fields_list, list):
            logger.warning(
                "Skipping malformed dependency requirement",
                upstream_id=upstream_id,
                field_type=type(required_fields_list),
            )
            continue

        existing_fields = set(merged.get(upstream_id, {}).get("required_fields", []))
        existing_fields.update(required_fields_list)
        merged[upstream_id] = {"required_fields": sorted(existing_fields)}

    return merged


class WorkflowService:
    def __init__(self, db: Session):
        self.db = db
        self._workflow_spec: Optional[WorkflowSpec] = None

    def _get_workflow_spec(self) -> WorkflowSpec:
        if not self._workflow_spec:
            self._workflow_spec = load_workflow_spec(DEFAULT_WORKFLOW_SPEC_ID)
        return self._workflow_spec

    def _get_workflow_for_user(self, workflow_id: int, user: User) -> WorkflowInstance:
        """Retrieve a workflow and enforce ownership."""
        workflow = self.db.query(WorkflowInstance).get(workflow_id)
        if not workflow:
            raise NotFoundException(f"WorkflowInstance {workflow_id} not found.")
        if workflow.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this workflow.")
        return workflow

    def _calculate_staleness_flags(self, workflow: WorkflowInstance) -> Dict[int, bool]:
        """Calculates the boolean staleness flag for all nodes in the workflow."""
        if not workflow.nodes:
            return {}

        nodes = workflow.nodes
        active_version_map: Dict[int, Optional[int]] = {node.id: node.active_version_id for node in nodes}
        staleness_flags: Dict[int, bool] = {}

        for node in nodes:
            is_stale = False
            if node.status == NodeStatus.COMPLETED and node.active_version:
                input_dependencies = node.active_version.input_dependencies or {}
                for upstream_node_id, consumed_version_id in input_dependencies.items():
                    current_active_version_id = active_version_map.get(upstream_node_id)
                    if current_active_version_id != consumed_version_id:
                        is_stale = True
                        break
            staleness_flags[node.id] = is_stale

        return staleness_flags

    def _build_hierarchical_phases(
        self, nodes: List[NodeInstance], staleness_flags: Dict[int, bool]
    ) -> List[PhaseRead]:
        """Convert node instances into a Phase -> Stage -> Node hierarchy."""
        phases: "OrderedDict[str, PhaseRead]" = OrderedDict()
        sorted_nodes = sorted(nodes or [], key=lambda n: n.order_index)

        for node in sorted_nodes:
            phase_name = node.phase_id
            if phase_name not in phases:
                phases[phase_name] = PhaseRead(name=phase_name, stages=[])
            phase = phases[phase_name]

            stage = next((s for s in phase.stages if s.id == node.stage_id), None)
            if not stage:
                stage = StageRead(id=node.stage_id, name=node.stage_name, nodes=[])
                phase.stages.append(stage)

            node_read = NodeInstanceRead.model_validate(node)
            node_read.is_stale = staleness_flags.get(node.id, False)
            stage.nodes.append(node_read)

        return list(phases.values())

    def _serialize_workflow(self, workflow: WorkflowInstance) -> WorkflowInstanceRead:
        """Build a WorkflowInstanceRead with hierarchical phase data."""
        if not workflow.nodes:
            self.db.refresh(workflow, ["nodes"])
        staleness_flags = self._calculate_staleness_flags(workflow)
        hierarchical_phases = self._build_hierarchical_phases(workflow.nodes or [], staleness_flags)
        return WorkflowInstanceRead(
            id=workflow.id,
            name=workflow.name,
            status=workflow.status,
            project_id=workflow.project_id,
            user_id=workflow.user_id,
            phases=hierarchical_phases,
        )

    def get_workflows_paginated(
        self, user: User, skip: int, limit: int
    ) -> PaginatedResponse[WorkflowInstanceRead]:
        """Return a user's workflows ordered by creation date with pagination and staleness info."""
        query = self.db.query(WorkflowInstance).filter(WorkflowInstance.user_id == user.id)
        total = query.count()
        workflows = (
            query.options(joinedload(WorkflowInstance.nodes).joinedload(NodeInstance.active_version))
            .order_by(WorkflowInstance.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        serialized_items = [self._serialize_workflow(workflow) for workflow in workflows]
        return PaginatedResponse(total=total, items=serialized_items)

    def get_workflow_instance(self, workflow_id: int, user: User) -> WorkflowInstanceRead:
        """Get a workflow instance with ownership check and staleness calculation."""
        workflow = (
            self.db.query(WorkflowInstance)
            .options(joinedload(WorkflowInstance.nodes).joinedload(NodeInstance.active_version))
            .get(workflow_id)
        )
        if not workflow:
            raise NotFoundException(f"WorkflowInstance {workflow_id} not found.")
        if workflow.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this workflow.")

        return self._serialize_workflow(workflow)

    def create_workflow(self, create_data: WorkflowCreate, user: User) -> WorkflowInstance:
        project = self.db.query(Project).get(create_data.project_id)
        if not project:
            raise NotFoundException(f"Project {create_data.project_id} not found.")
        if project.user_id != user.id:
            raise ForbiddenException("You do not have permission to modify this project.")
        if project.workflow_instance:
            raise InvalidStateException("A workflow already exists for this project.")

        workflow = WorkflowInstance(
            name=create_data.name,
            project_id=project.id,
            user_id=user.id,
        )
        self.db.add(workflow)
        self.db.flush()
        spec = self._get_workflow_spec()
        if not spec.dynamic_task_templates:
            logger.warning("Workflow spec has no dynamic templates. Skipping insertion.", workflow_id=node.workflow_instance_id)
            return False
        self._initialize_nodes(workflow, spec)
        self.db.commit()
        self.db.refresh(workflow)
        return workflow

    def update_workflow(
        self, workflow_id: int, update_data: WorkflowUpdate, user: User
    ) -> WorkflowInstance:
        """Update mutable workflow fields."""
        workflow = self._get_workflow_for_user(workflow_id, user)
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(workflow, key, value)
        self.db.commit()
        self.db.refresh(workflow)
        return workflow

    def delete_workflow(self, workflow_id: int, user: User) -> None:
        """Delete a workflow and all related nodes/versions."""
        workflow = self._get_workflow_for_user(workflow_id, user)
        self.db.delete(workflow)
        self.db.commit()
        logger.info("Deleted workflow and associated data", workflow_id=workflow_id)

    def _initialize_nodes(self, workflow: WorkflowInstance, spec: Optional[WorkflowSpec] = None):
        spec = spec or self._get_workflow_spec()
        order_index = 0
        for node_spec in spec.structure:
            stage_id = node_spec.stage_id or node_spec.id.rsplit(".", 1)[0]
            stage_name = node_spec.stage_name or node_spec.name
            node = NodeInstance(
                workflow_instance_id=workflow.id,
                user_id=workflow.user_id,
                definition_id=node_spec.id,
                name=node_spec.name,
                node_type=node_spec.type,
                hitl_mode=node_spec.hitl_mode,
                handler_type=node_spec.handler_type,
                sca_selection_mode=node_spec.sca_selection_mode,
                export_config=dict(node_spec.export_config or {}),
                dependencies=dict(node_spec.dependencies or {}),
                external_inputs=list(node_spec.external_inputs or []),
                order_index=order_index,
                phase_id=node_spec.phase,
                stage_id=stage_id,
                stage_name=stage_name,
                task_group_id=node_spec.task_group_id,
                current_stage=ExecutionStage.NOT_STARTED,
            )
            self.db.add(node)
            order_index += 1

    async def start_workflow(self, workflow_id: int, user: User) -> NodeInstance:
        """Starts or resumes a workflow, with an ownership check."""
        from backend.services.node_service import NodeService
        workflow = self._get_workflow_for_user(workflow_id, user)
        first_node = (
            self.db.query(NodeInstance)
            .filter_by(workflow_instance_id=workflow_id, order_index=0)
            .first()
        )
        if not first_node:
            raise InvalidStateException("Workflow has no nodes.")
        if first_node.status != NodeStatus.NOT_STARTED:
            if first_node.status != NodeStatus.FAILED or first_node.active_version_id is not None:
                raise InvalidStateException("Workflow has already been started.")
        if workflow.status != WorkflowStatus.RUNNING:
            workflow.status = WorkflowStatus.RUNNING
            self.db.commit()
            await self._broadcast_workflow_update(self.get_workflow_instance(workflow_id, user))

        node_service = NodeService(self.db)
        return await node_service.enqueue_initial_execution(first_node.id, user)

    def get_next_node(self, current_node: NodeInstance) -> Optional[NodeInstance]:
        return (
            self.db.query(NodeInstance)
            .filter_by(
                workflow_instance_id=current_node.workflow_instance_id,
                order_index=current_node.order_index + 1,
            )
            .first()
        )

    def handle_generator_node_completion(self, node: NodeInstance, output: Dict[str, Any]) -> bool:
        """
        Handles dynamic task generation for Generator nodes while relying on the caller's transaction.
        Returns True if the workflow structure changed, False otherwise.
        """
        if node.node_type != NodeType.GENERATOR:
            return False

        taskbook_data = output.get("Structured Modeling Taskbook", {})
        taskbook = taskbook_data.get("tasks")
        if not taskbook:
            logger.warning(
                "Generator node completed without a valid 'Structured Modeling Taskbook'. No dynamic nodes created.",
                node_id=node.id,
            )
            return False

        spec = self._get_workflow_spec()
        insertion_index = node.order_index + 1
        total_nodes_to_insert = len(taskbook) * len(spec.dynamic_task_templates)
        self._shift_subsequent_nodes(node.workflow_instance_id, insertion_index, total_nodes_to_insert)
        new_phase2_nodes = self._insert_dynamic_tasks(node.workflow_instance_id, insertion_index, taskbook, spec)
        self._update_phase3_dependencies(node.workflow_instance_id, new_phase2_nodes, spec)
        self.db.flush()

        return True

    def _shift_subsequent_nodes(self, workflow_id: int, start_index: int, shift_amount: int):
        (
            self.db.query(NodeInstance)
            .filter(NodeInstance.workflow_instance_id == workflow_id, NodeInstance.order_index >= start_index)
            .update({NodeInstance.order_index: NodeInstance.order_index + shift_amount}, synchronize_session=False)
        )

    def _insert_dynamic_tasks(
        self,
        workflow_id: int,
        start_index: int,
        taskbook: List[Dict[str, Any]],
        spec: WorkflowSpec,
    ) -> List[NodeInstance]:
        workflow = self.db.query(WorkflowInstance).get(workflow_id)
        if not workflow:
            raise NotFoundException(f"WorkflowInstance {workflow_id} not found during dynamic task insertion.")

        current_index = start_index
        all_new_nodes: List[NodeInstance] = []
        phase_2_name = "Phase 2: Cyclic Sub-problem Execution"
        defined_task_ids: Set[str] = {task["task_id"] for task in taskbook}

        for task in taskbook:
            task_id = task["task_id"]
            io_interfaces = task.get("io_interfaces", {})
            raw_task_specific_inputs = io_interfaces.get("inputs") or {}
            task_external_inputs = task.get("external_inputs") or []
            previous_node_in_task_def_id: Optional[str] = None
            resolved_task_specific_inputs: Dict[str, List[str]] = {}

            for upstream_id, required_fields in raw_task_specific_inputs.items():
                fields_list = required_fields if isinstance(required_fields, list) else [required_fields]

                if upstream_id in defined_task_ids:
                    resolved_id = f"{upstream_id}{spec.terminal_node_suffix}"
                    resolved_task_specific_inputs[resolved_id] = list(fields_list)
                else:
                    resolved_task_specific_inputs[upstream_id] = list(fields_list)

            for id_suffix, template in spec.dynamic_task_templates.items():
                definition_id = f"{task_id}{id_suffix}"
                name = f"[{task_id}] {template.name_prefix}"
                stage_suffix = id_suffix.rsplit(".", 1)[0] if "." in id_suffix else id_suffix
                stage_id = f"{task_id}{stage_suffix}"
                stage_name_prefix = template.stage_name_prefix or "Execution"
                stage_name = f"[{task_id}] {stage_name_prefix}"
                dependencies = {
                    "1.1.1": {"required_fields": ["Formal Problem Restatement"]},
                    "1.1.2": {"required_fields": ["Structured Modeling Taskbook"]},
                }

                dependencies = _merge_dependencies(dependencies, resolved_task_specific_inputs)

                template_inputs = template.inputs or {}
                intra_task_deps: Dict[str, List[str]] = {}
                for upstream_def_id, required_fields in template_inputs.items():
                    fields_list = list(required_fields)
                    if upstream_def_id == PREVIOUS_IN_TASK:
                        if previous_node_in_task_def_id:
                            intra_task_deps[previous_node_in_task_def_id] = fields_list
                    else:
                        intra_task_deps[upstream_def_id] = fields_list

                dependencies = _merge_dependencies(dependencies, intra_task_deps)

                node_external_inputs: List[str] = []
                if template.inherits_external_inputs:
                    node_external_inputs = list(task_external_inputs)

                new_node = NodeInstance(
                    workflow_instance_id=workflow_id,
                    user_id=workflow.user_id,
                    definition_id=definition_id,
                    name=name,
                    node_type=template.type,
                    hitl_mode=template.hitl_mode,
                    handler_type=template.handler_type,
                    sca_selection_mode=template.sca_selection_mode,
                    export_config=dict(template.export_config or {}),
                    dependencies=dependencies,
                    external_inputs=node_external_inputs,
                    order_index=current_index,
                    phase_id=phase_2_name,
                    stage_id=stage_id,
                    stage_name=stage_name,
                    task_group_id=task_id,
                    current_stage=ExecutionStage.NOT_STARTED,
                )
                self.db.add(new_node)
                all_new_nodes.append(new_node)
                current_index += 1
                previous_node_in_task_def_id = definition_id

        self.db.flush()
        return all_new_nodes

    def _update_phase3_dependencies(self, workflow_id: int, phase2_nodes: List[NodeInstance], spec: WorkflowSpec):
        """Ensure node 3.1.1 depends on outputs from each Phase 2 robustness node."""
        node_311 = (
            self.db.query(NodeInstance)
            .filter_by(workflow_instance_id=workflow_id, definition_id="3.1.1")
            .first()
        )
        if not node_311:
            return
        current_deps = node_311.dependencies or {}
        new_deps_to_merge: Dict[str, List[str]] = {}
        terminal_template = spec.dynamic_task_templates.get(spec.terminal_node_suffix)
        if not terminal_template:
            logger.error(
                "Terminal node template not found in PHASE_2_TEMPLATE",
                terminal_suffix=spec.terminal_node_suffix,
            )
            return

        for p2_node in phase2_nodes:
            if p2_node.definition_id.endswith(spec.terminal_node_suffix):
                required_fields = list(terminal_template.outputs or [])
                new_deps_to_merge[p2_node.definition_id] = required_fields

        node_311.dependencies = _merge_dependencies(current_deps, new_deps_to_merge)

    def complete_workflow(self, workflow_id: int, user: User):
        """Marks a workflow as completed, with an ownership check."""
        workflow = self._get_workflow_for_user(workflow_id, user)
        workflow.status = WorkflowStatus.COMPLETED
        self.db.flush()

    def calculate_bulk_staleness(self, workflow_id: int, user: User) -> Dict[int, List[StalenessInfo]]:
        """Returns detailed staleness reports for all workflow nodes, with an ownership check."""

        self._get_workflow_for_user(workflow_id, user)
        nodes = (
            self.db.query(NodeInstance)
            .filter(NodeInstance.workflow_instance_id == workflow_id)
            .options(joinedload(NodeInstance.active_version))
            .all()
        )

        active_version_map: Dict[int, Optional[int]] = {node.id: node.active_version_id for node in nodes}
        definition_id_map: Dict[int, str] = {node.id: node.definition_id for node in nodes}

        bulk_report: Dict[int, List[StalenessInfo]] = {}
        for node in nodes:
            if node.status == NodeStatus.COMPLETED and node.active_version:
                input_dependencies = node.active_version.input_dependencies or {}
                node_staleness: List[StalenessInfo] = []

                for upstream_node_id, consumed_version_id in input_dependencies.items():
                    current_active_version_id = active_version_map.get(upstream_node_id)
                    if current_active_version_id != consumed_version_id:
                        node_staleness.append(
                            StalenessInfo(
                                upstream_node_id=upstream_node_id,
                                upstream_definition_id=definition_id_map.get(upstream_node_id, "N/A"),
                                consumed_version_id=consumed_version_id,
                                current_active_version_id=current_active_version_id,
                            )
                        )

                if node_staleness:
                    bulk_report[node.id] = node_staleness

        return bulk_report

    async def broadcast_structure_update(self, workflow_id: int):
        await self._broadcast_structure_update(workflow_id)

    async def _broadcast_structure_update(self, workflow_id: int):
        workflow = (
            self.db.query(WorkflowInstance)
            .options(joinedload(WorkflowInstance.nodes).joinedload(NodeInstance.active_version))
            .get(workflow_id)
        )
        if workflow:
            workflow_data = self._serialize_workflow(workflow).model_dump(mode="json")
            await broadcast_event(workflow_id, EventType.WORKFLOW_STRUCTURE_UPDATED, workflow_data)

    async def _broadcast_workflow_update(self, workflow_data: WorkflowInstanceRead | WorkflowInstance):
        if isinstance(workflow_data, WorkflowInstance):
            workflow_id = workflow_data.id
            workflow_obj = (
                self.db.query(WorkflowInstance)
                .options(joinedload(WorkflowInstance.nodes).joinedload(NodeInstance.active_version))
                .get(workflow_id)
            )
            if not workflow_obj:
                logger.warning("Workflow {} not found for broadcast.", workflow_id)
                return
            serialized_data = self._serialize_workflow(workflow_obj).model_dump(mode="json")
        else:
            serialized_data = workflow_data.model_dump(mode="json")
            workflow_id = workflow_data.id

        await broadcast_event(workflow_id, EventType.WORKFLOW_STATUS_UPDATED, serialized_data)

```

        ## execution_engine
         - __init__.py
         - config_resolver.py
         - executor.py
         - llm_client.py
         - results.py
         - sandbox_client.py

### services/execution_engine/__init__.py Content:

```py
"""
Modular Execution Engine for running workflow nodes.

This package replaces the monolithic `ExecutionSimulator`. It provides a structured
and configurable approach to node execution, designed to support Bring-Your-Own-Key
(BYOK) functionality by isolating user-specific clients (LLM, Sandbox) based
on a project's configuration snapshot.
"""

from .config_resolver import ExecutionConfig, resolve_config
from .executor import NodeExecutor

__all__ = ["NodeExecutor", "ExecutionConfig", "resolve_config"]

```

### services/execution_engine/config_resolver.py Content:

```py
"""
Resolves and provides execution configuration from a project's snapshot.

This component's responsibility is to read the `configuration_snapshot` JSON blob
from a `Project` model. It will then provide a safe and structured interface for
the `NodeExecutor` to access the necessary credentials (API keys) and settings
for a given run.
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field, FieldValidationInfo, field_validator

from backend.config import settings
from backend.models.user import HITLProfile, ThinkingDepth


class ExecutionConfig(BaseModel):
    """
    Validated configuration derived from a project's snapshot.

    Defaults fall back to global settings so execution can proceed even when a
    project snapshot is missing or incomplete.
    """

    model_config = ConfigDict(extra="ignore")

    hitl_profile: HITLProfile = Field(default=HITLProfile.EXPERIENCED)
    thinking_depth: ThinkingDepth = Field(default=ThinkingDepth.MEDIUM)
    llm_model_name: str = Field(default_factory=lambda: settings.LLM_MODEL_NAME)
    llm_base_url: Optional[str] = Field(default_factory=lambda: settings.LLM_BASE_URL)
    llm_api_key: Optional[str] = Field(default_factory=lambda: settings.LLM_API_KEY)
    llm_provider: Optional[str] = Field(default_factory=lambda: settings.LLM_PROVIDER)
    e2b_api_key: Optional[str] = Field(default_factory=lambda: settings.E2B_API_KEY)

    @field_validator("llm_model_name", mode="before")
    @classmethod
    def _ensure_llm_model_name(cls, value: Optional[str]) -> str:
        """Treat null or empty values in snapshots as a request for the default model."""
        return cls._fallback_to_default(value, settings.LLM_MODEL_NAME)

    @field_validator("llm_base_url", "llm_api_key", "llm_provider", mode="before")
    @classmethod
    def _ensure_optional_defaults(cls, value: Optional[str], info: FieldValidationInfo) -> Optional[str]:
        defaults = {
            "llm_base_url": settings.LLM_BASE_URL,
            "llm_api_key": settings.LLM_API_KEY,
            "llm_provider": settings.LLM_PROVIDER,
        }
        return cls._fallback_to_default(value, defaults.get(info.field_name))

    @staticmethod
    def _fallback_to_default(value: Optional[str], default_value: Optional[str]) -> Optional[str]:
        if value is None:
            return default_value
        if isinstance(value, str) and not value.strip():
            return default_value
        return value


def resolve_config(project_snapshot: Optional[Dict[str, Any]]) -> ExecutionConfig:
    """
    Parse a project's configuration snapshot into a validated ExecutionConfig.

    Args:
        project_snapshot: The JSON blob stored on Project.configuration_snapshot.

    Returns:
        ExecutionConfig: ready-to-use configuration for node execution.
    """

    if not project_snapshot:
        return ExecutionConfig()

    return ExecutionConfig.model_validate(project_snapshot)

```

### services/execution_engine/executor.py Content:

```py
"""Core Node Executor: orchestrates handler dispatch for node execution."""

import asyncio
from typing import Any, Dict, List, Optional

from loguru import logger

from backend.models.workflow import NodeInstance
from backend.services.execution_engine.config_resolver import ExecutionConfig
from backend.services.execution_engine.handlers.registry import get_handler_class
from backend.services.execution_engine.llm_client import LLMClient
from backend.services.execution_engine.results import ExecutionResult
from backend.services.execution_engine.sandbox_client import SandboxClient


class NodeExecutor:
    """Executes nodes by delegating to handler implementations."""

    def __init__(self, config: ExecutionConfig):
        self.config = config
        self.llm_client = LLMClient(
            model_name=config.llm_model_name,
            api_key=config.llm_api_key,
            base_url=config.llm_base_url,
        )
        self.sandbox_client = SandboxClient(api_key=config.e2b_api_key)
        logger.info("NodeExecutor initialized", thinking_depth=self.config.thinking_depth.value)

    async def execute_node(
        self,
        node: NodeInstance,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        await asyncio.sleep(1.0)
        logger.info(
            "Dispatching node execution",
            definition_id=node.definition_id,
            handler_type=node.handler_type.value,
        )

        handler_cls = get_handler_class(node.handler_type)
        handler = handler_cls(self, node)
        return await handler.execute(inputs, history, feedback, previous_output, adjudication_data)

```

### services/execution_engine/llm_client.py Content:

```py
"""
Client for interacting with Large Language Models (LLMs).

This client is a dedicated interface for making API calls to LLMs.
It is instantiated with user-specific credentials (model name, API key,
base URL) retrieved from the project's configuration snapshot, enabling the
BYOK (Bring-Your-Own-Key) feature.
"""

from typing import Any, Dict, Optional

from loguru import logger


class LLMClient:
    """
    A client for making simulated requests to an LLM provider.
    This is a stub for BYOK integration.
    """

    def __init__(
        self,
        model_name: str,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
    ):
        self.model_name = model_name
        self.has_api_key = bool(api_key)
        self.base_url = base_url
        logger.debug(
            "LLMClient initialized",
            model_name=self.model_name,
            has_api_key=self.has_api_key,
            base_url=self.base_url,
        )

    async def generate_text(self, prompt: str, **kwargs: Any) -> str:
        """Simulates generating text from a prompt."""
        logger.info(
            "Simulating LLM text generation",
            model=self.model_name,
            prompt_start=f"{prompt[:50]}...",
            kwargs=kwargs,
        )
        return f"Simulated LLM output using model '{self.model_name}' for prompt: '{prompt[:30]}...'"

    async def generate_structured_output(self, prompt: str, **kwargs: Any) -> Dict[str, Any]:
        """Simulates generating structured JSON output."""
        logger.info(
            "Simulating LLM structured output generation",
            model=self.model_name,
            prompt_start=f"{prompt[:50]}...",
            kwargs=kwargs,
        )
        return {
            "model": self.model_name,
            "simulated_output": "This is a structured response.",
            "prompt_received": prompt,
        }

```

### services/execution_engine/results.py Content:

```py
"""Shared execution engine data structures."""

from typing import Any, Dict

from pydantic import BaseModel, Field


class ExecutionResult(BaseModel):
    """Structured result from a node execution, including output and artifacts."""

    output_data: Dict[str, Any]
    artifacts: Dict[str, Any] = Field(default_factory=dict)


__all__ = ["ExecutionResult"]


```

### services/execution_engine/sandbox_client.py Content:

```py
"""
Client for securely executing code in a sandboxed environment (e.g., E2B).

This client manages interactions with a secure code execution service.
Like the LLM client, it is initialized with user-specific API keys from the
project's configuration snapshot, ensuring code runs in an isolated context
using the user's own sandbox resources.
"""

from typing import Dict, Optional

from loguru import logger


class SandboxClient:
    """
    A client for making simulated requests to a code execution sandbox.
    This is a stub for BYOK integration.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.has_api_key = bool(api_key)
        logger.debug("SandboxClient initialized", has_api_key=self.has_api_key)

    async def execute_code(self, code: str) -> Dict[str, str]:
        """Simulates executing a piece of code and returning the result."""
        logger.info("Simulating sandboxed code execution", code_snippet=f"{code[:100]}...")
        return {
            "stdout": "Simulated standard output from code execution.",
            "stderr": "",
            "results": "Simulated artifacts or results from execution.",
        }

```

            ## handlers
             - __init__.py
             - base.py
             - code_execution.py
             - final_paper.py
             - generic_avl.py
             - generic_sca.py
             - generic_varl.py
             - narrative_synthesis.py
             - registry.py
             - taskbook_generator.py

### services/execution_engine/handlers/__init__.py Content:

```py
"""Node execution handler registry."""

from .base import NodeHandler
from .registry import get_handler_class, register_handler

__all__ = ["NodeHandler", "get_handler_class", "register_handler"]


```

### services/execution_engine/handlers/base.py Content:

```py
"""Base classes and helpers for node execution handlers."""

from __future__ import annotations

import json
import zipfile
from typing import Any, Dict, List, Optional, TYPE_CHECKING

from backend.models.workflow import NodeInstance
from backend.services.execution_engine.results import ExecutionResult

if TYPE_CHECKING:
    from backend.services.execution_engine.executor import NodeExecutor


class NodeHandler:
    """Base class for encapsulating node execution, HITL, and export behavior."""

    def __init__(self, executor: Optional["NodeExecutor"], node: NodeInstance):
        self.executor = executor
        self.node = node

    @property
    def behavior(self) -> Dict[str, Any]:
        export_config = self.node.export_config or {}
        return export_config.get("behavior", {})

    @property
    def config(self):
        if not self.executor:
            raise RuntimeError("Execution config is not available outside of runtime execution.")
        return self.executor.config

    @property
    def llm_client(self):
        if not self.executor:
            raise RuntimeError("LLM client is not available outside of runtime execution.")
        return self.executor.llm_client

    @property
    def sandbox_client(self):
        if not self.executor:
            raise RuntimeError("Sandbox client is not available outside of runtime execution.")
        return self.executor.sandbox_client

    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        raise NotImplementedError

    def validate_hitl_integrity(self, raw_output: Dict[str, Any], interaction_data: Optional[Dict[str, Any]]):
        """Override to enforce handler-specific HITL submission requirements."""

    def determine_final_output(
        self,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Override to transform raw execution output into a finalized payload."""
        return raw_output

    def format_export(
        self,
        zf: zipfile.ZipFile,
        output_data: Dict[str, Any],
        base_path: str,
        execution_artifacts: Optional[Dict[str, Any]] = None,
    ):
        """Default export implementation writes the node output as JSON."""
        if not output_data:
            return
        path = f"{base_path}output.json"
        serialized = json.dumps(output_data, indent=2, default=str).encode("utf-8")
        zf.writestr(path, serialized)

```

### services/execution_engine/handlers/code_execution.py Content:

```py
"""Handler for automatic code generation and sandbox execution."""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from backend.workflow.constants import KEY_PRIMARY_ARTIFACT
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .base import NodeHandler
from .registry import register_handler


class CodeExecutionHandler(NodeHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        code_to_run = f"# Python code generated for {self.node.definition_id}\\nprint('Simulated execution')"
        sandbox_result = await self.sandbox_client.execute_code(code_to_run)

        artifacts: Dict[str, Any] = {"generated_code.py": code_to_run, "execution.log": sandbox_result.get("stdout", "")}
        if sandbox_result.get("stderr"):
            artifacts["error.log"] = sandbox_result.get("stderr")

        artifact = {
            "raw_results": sandbox_result.get("results", "Simulated Raw Data"),
        }
        if (self.behavior or {}).get("include_vv_data"):
            artifact["vv_data"] = "Simulated V&V Data from sandbox"
            artifact["sensitivity_data"] = "Simulated Sensitivity Data from sandbox"

        output_data = {KEY_PRIMARY_ARTIFACT: artifact}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)

    def format_export(
        self,
        zf,
        output_data: Dict[str, Any],
        base_path: str,
        execution_artifacts: Optional[Dict[str, Any]] = None,
    ):
        export_config = self.node.export_config or {}
        code_keys = export_config.get("code_keys", [])
        if execution_artifacts:
            for key in code_keys:
                if key in execution_artifacts:
                    zf.writestr(f"{base_path}{key}", execution_artifacts[key])

        attachments = ["raw_results", "vv_data", "sensitivity_data"]
        for key in attachments:
            if key in output_data:
                path = f"{base_path}{key}.json"
                zf.writestr(path, json.dumps(output_data[key], indent=2, default=str).encode("utf-8"))


register_handler(HandlerType.CODE_EXECUTION, CodeExecutionHandler)


```

### services/execution_engine/handlers/final_paper.py Content:

```py
"""Handler responsible for generating the final O-Award paper."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.workflow.constants import KEY_PRIMARY_ARTIFACT
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .base import NodeHandler
from .registry import register_handler


class FinalPaperHandler(NodeHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        prompt = "Forge the final O-Award submission-ready paper summarizing all findings."
        if feedback:
            prompt += f" Incorporate reviewer feedback: {feedback}."
        llm_response = await self.llm_client.generate_text(prompt)

        artifact = {
            "Submission-Ready Paper": llm_response,
            "content": llm_response,
        }
        output_data = {KEY_PRIMARY_ARTIFACT: artifact}
        artifacts = {"prompt": prompt}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)

    def format_export(
        self,
        zf,
        output_data: Dict[str, Any],
        base_path: str,
        execution_artifacts: Optional[Dict[str, Any]] = None,
    ):
        export_config = self.node.export_config or {}
        paper_key = export_config.get("paper_key", "Submission-Ready Paper")
        filename = export_config.get("filename", "FinalPaper.md")

        content = output_data.get(paper_key)
        if content:
            zf.writestr(f"{base_path}{filename}", content)


register_handler(HandlerType.FINAL_PAPER, FinalPaperHandler)


```

### services/execution_engine/handlers/generic_avl.py Content:

```py
"""Generic AVL handler used by multiple nodes."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.exceptions import InvalidStateException
from backend.models.user import HITLProfile
from backend.workflow.constants import (
    KEY_CRITIQUES,
    KEY_ID,
    KEY_PRIMARY_ARTIFACT,
    KEY_SCA_OUTPUT,
    KEY_SELECTED_ITEM,
)
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .base import NodeHandler
from .registry import register_handler


class GenericAVLHandler(NodeHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        prompt = self._build_prompt(feedback, adjudication_data, previous_output)
        artifact_content = await self.llm_client.generate_text(prompt)

        artifact: Dict[str, Any] = {
            "content": artifact_content,
            "data": "Generic AVL data output",
        }

        if self.behavior.get("variant") == "formulation":
            artifact.update(self._build_formulation_artifacts(inputs))

        critiques = self._critique(artifact, adjudication_data)
        output_data = {
            KEY_PRIMARY_ARTIFACT: artifact,
            KEY_CRITIQUES: critiques,
        }
        artifacts = {"generation_prompt": prompt}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)

    def validate_hitl_integrity(self, raw_output: Dict[str, Any], interaction_data: Optional[Dict[str, Any]]):
        critiques = raw_output.get(KEY_CRITIQUES, [])
        if not critiques:
            return
        if not interaction_data or "adjudication" not in interaction_data:
            raise InvalidStateException("AVL requires 'adjudication' data when critiques are present.")

        adjudication_data = interaction_data["adjudication"]
        if not isinstance(adjudication_data, list) or len(adjudication_data) != len(critiques):
            raise InvalidStateException("Adjudication data must cover every critique.")

        available_ids = {c.get(KEY_ID) for c in critiques if c.get(KEY_ID)}
        submitted_ids = {item.get("critique_id") for item in adjudication_data if item.get("critique_id")}
        if submitted_ids != available_ids:
            raise InvalidStateException("Mismatch between critiques and adjudication decisions.")

    def determine_final_output(
        self,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        if KEY_PRIMARY_ARTIFACT in raw_output:
            return raw_output[KEY_PRIMARY_ARTIFACT]
        return raw_output

    def _build_prompt(
        self,
        feedback: Optional[str],
        adjudication_data: Optional[List[Dict[str, Any]]],
        previous_output: Optional[Dict[str, Any]],
    ) -> str:
        if adjudication_data or feedback:
            context = adjudication_data if adjudication_data else feedback
            previous_artifact_content = "N/A"
            if previous_output and KEY_PRIMARY_ARTIFACT in previous_output:
                previous_artifact_content = previous_output[KEY_PRIMARY_ARTIFACT].get("content", "N/A")
            return f"Refine the AVL artifact with context: {context}. Previous content was: {previous_artifact_content}"
        return "Generate an initial AVL Artifact."

    def _build_formulation_artifacts(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        if not self.node.task_group_id:
            return {}

        upstream_211_id = f"{self.node.task_group_id}.2.1.1"
        input_211 = inputs.get(upstream_211_id, {})
        selected_model_name = "Unknown Model"
        sca_payload = input_211.get(KEY_SCA_OUTPUT) or {}
        selected_item = sca_payload.get(KEY_SELECTED_ITEM)
        if selected_item:
            selected_model_name = selected_item.get("name", selected_model_name)

        return {
            "math_formulation": f"Math formulation for {selected_model_name}.",
            "execution_blueprint": f"Blueprint for {selected_model_name}.",
        }

    def _critique(
        self,
        artifact: Dict[str, Any],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> List[Dict[str, Any]]:
        profile = self.config.hitl_profile

        if profile == HITLProfile.EXPERT:
            if adjudication_data:
                return []
            return [
                {
                    KEY_ID: "c_exp_1",
                    "critique": "Overall sound, but verify boundary conditions of the core assumption.",
                    "severity": "Medium",
                },
            ]

        if profile == HITLProfile.NOVICE:
            if adjudication_data:
                return [
                    {
                        KEY_ID: "c_nov_r1",
                        "critique": "Refinement improved clarity, but introduced a minor ambiguity in terminology.",
                        "severity": "Low",
                    }
                ]
            return [
                {
                    KEY_ID: "c_nov_1",
                    "critique": "The primary assumption lacks empirical justification. Consider alternative data sources.",
                    "severity": "High",
                },
                {
                    KEY_ID: "c_nov_2",
                    "critique": "Key terminology is used ambiguously. Define all central concepts clearly.",
                    "severity": "Medium",
                },
                {
                    KEY_ID: "c_nov_3",
                    "critique": "The scope appears overly broad. Narrow the focus for better analysis.",
                    "severity": "Medium",
                },
            ]

        if adjudication_data:
            return [
                {
                    KEY_ID: "c3",
                    "critique": "Refinement addressed major issues, but introduced a minor boundary condition error.",
                    "severity": "Low",
                }
            ]
        return [
            {KEY_ID: "c1", "critique": "The core assumption lacks justification.", "severity": "High"},
            {KEY_ID: "c2", "critique": "Terminology is ambiguous.", "severity": "Medium"},
        ]


register_handler(HandlerType.GENERIC_AVL, GenericAVLHandler)


```

### services/execution_engine/handlers/generic_sca.py Content:

```py
"""Generic SCA handler and shared SCA utilities."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.exceptions import InvalidStateException
from backend.models.user import ThinkingDepth
from backend.workflow.constants import (
    KEY_ANALYSIS,
    KEY_CANDIDATES,
    KEY_ID,
    KEY_SCA_OUTPUT,
    KEY_SELECTED_ITEM,
    KEY_SELECTED_ITEMS,
)
from backend.workflow.spec import HandlerType, SCASelectionMode

from ..results import ExecutionResult
from .base import NodeHandler
from .registry import register_handler


class BaseSCAHandler(NodeHandler):
    """Shared SCA validation and finalization logic."""

    def _selection_mode(self) -> SCASelectionMode:
        return self.node.sca_selection_mode or SCASelectionMode.SINGLE

    def validate_hitl_integrity(self, raw_output: Dict[str, Any], interaction_data: Optional[Dict[str, Any]]):
        if not interaction_data or "selected_ids" not in interaction_data:
            raise InvalidStateException("SCA requires 'selected_ids' in interaction_data.")
        selected_ids = interaction_data["selected_ids"]
        if not isinstance(selected_ids, list) or not selected_ids:
            raise InvalidStateException("SCA requires a non-empty list of selections.")

        selection_mode = self._selection_mode()
        if selection_mode == SCASelectionMode.SINGLE and len(selected_ids) != 1:
            raise InvalidStateException("This node requires exactly one selection.")

        candidates = raw_output.get(KEY_CANDIDATES, [])
        available_ids = {candidate.get(KEY_ID) for candidate in candidates if candidate.get(KEY_ID)}
        if not set(selected_ids).issubset(available_ids):
            raise InvalidStateException("Submitted 'selected_ids' contain invalid candidates.")

    def determine_final_output(
        self,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        if not interaction_data or "selected_ids" not in interaction_data:
            raise InvalidStateException("SCA output determination requires 'selected_ids'.")

        selected_ids = set(interaction_data["selected_ids"])
        candidates = raw_output.get(KEY_CANDIDATES, [])
        selected_items = [candidate for candidate in candidates if candidate.get(KEY_ID) in selected_ids]

        selection_mode = self._selection_mode()
        selected_item = None
        if selection_mode == SCASelectionMode.SINGLE:
            if len(selected_items) != 1:
                raise InvalidStateException(
                    f"Expected a single selection for node {self.node.definition_id}, found {len(selected_items)}."
                )
            selected_item = selected_items[0]

        sca_output_wrapper = {
            KEY_SELECTED_ITEM: selected_item,
            KEY_SELECTED_ITEMS: selected_items,
        }

        final_output: Dict[str, Any] = {}
        for key, value in raw_output.items():
            if key not in (KEY_CANDIDATES, KEY_ANALYSIS):
                final_output[key] = value

        final_output[KEY_SCA_OUTPUT] = sca_output_wrapper
        return final_output


class GenericSCAHandler(BaseSCAHandler):
    """Default SCA node handler with candidate generation and analysis."""

    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        variant = (self.behavior or {}).get("variant", "generic")
        output: Dict[str, Any] = {}
        base_candidates = self._build_candidates(variant)

        num_candidates_map = {
            ThinkingDepth.INSTANT: 2,
            ThinkingDepth.MEDIUM: 3,
            ThinkingDepth.HEAVY: 4,
        }
        num_to_generate = num_candidates_map.get(self.config.thinking_depth, 3)
        final_candidates = base_candidates[:num_to_generate]

        if feedback:
            final_candidates.append(
                {KEY_ID: "F1", "name": "Option based on feedback", "description": "Tailored option"}
            )

        analysis_prompt = f"Provide a comparative analysis of {len(final_candidates)} candidates."
        analysis = await self.llm_client.generate_text(analysis_prompt)

        output[KEY_CANDIDATES] = final_candidates
        output[KEY_ANALYSIS] = analysis

        if variant == "visualization":
            output["vv_report"] = f"V&V Report for {self.node.definition_id}"
            output["key_output_doc"] = f"Key outputs for {self.node.definition_id}"

        artifacts = {"analysis_prompt": analysis_prompt}
        return ExecutionResult(output_data=output, artifacts=artifacts)

    def _build_candidates(self, variant: str) -> List[Dict[str, Any]]:
        if variant == "visualization":
            return [
                {KEY_ID: "V1", "name": "Visualization Plot A", "type": "Plot"},
                {KEY_ID: "V2", "name": "Visualization Table B", "type": "Table"},
                {KEY_ID: "V3", "name": "Visualization Plot C (Extra)", "type": "Plot"},
            ]

        return [
            {KEY_ID: "C1", "name": "Model Option A", "description": "Explores constrained optimization."},
            {KEY_ID: "C2", "name": "Model Option B", "description": "Balances exploration vs. exploitation."},
            {KEY_ID: "C3", "name": "Model Option C", "description": "Focuses on stochastic regimes."},
            {KEY_ID: "C4", "name": "Model Option D", "description": "Targets multi-objective trade-offs."},
        ]


register_handler(HandlerType.GENERIC_SCA, GenericSCAHandler)


```

### services/execution_engine/handlers/generic_varl.py Content:

```py
"""Generic VARL handler for non-specialized nodes."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.workflow.constants import KEY_PRIMARY_ARTIFACT
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .base import NodeHandler
from .registry import register_handler


class GenericVARLHandler(NodeHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        context = f" Feedback: {feedback}" if feedback else ""
        prompt = f"Generate a VARL artifact for node {self.node.definition_id}.{context}"
        llm_response = await self.llm_client.generate_text(prompt)

        artifact = {
            "content": llm_response,
            "data": "Generic VARL data output",
        }
        output_data = {KEY_PRIMARY_ARTIFACT: artifact}
        artifacts = {"prompt": prompt}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)


register_handler(HandlerType.GENERIC_VARL, GenericVARLHandler)


```

### services/execution_engine/handlers/narrative_synthesis.py Content:

```py
"""Handler for the strategic narrative synthesis node."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.exceptions import InvalidStateException
from backend.workflow.constants import KEY_ANALYSIS, KEY_CANDIDATES, KEY_ID, KEY_SCA_OUTPUT, KEY_SELECTED_ITEM
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .generic_sca import BaseSCAHandler
from .registry import register_handler


class NarrativeSynthesisHandler(BaseSCAHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        candidates = self._generate_narrative_candidates()
        analysis_prompt = "Compare the strategic narratives and recommend the strongest thesis."
        analysis = await self.llm_client.generate_text(analysis_prompt)

        output = {KEY_CANDIDATES: candidates, KEY_ANALYSIS: analysis}
        artifacts = {"analysis_prompt": analysis_prompt}
        return ExecutionResult(output_data=output, artifacts=artifacts)

    def determine_final_output(
        self,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        final_output = super().determine_final_output(raw_output, interaction_data)
        sca_wrapper = final_output.get(KEY_SCA_OUTPUT, {})
        selected_item = sca_wrapper.get(KEY_SELECTED_ITEM)
        if not selected_item:
            raise InvalidStateException("Narrative synthesis requires selecting a single narrative.")

        synthesized_result = dict(selected_item)
        synthesized_result[KEY_SCA_OUTPUT] = sca_wrapper
        return synthesized_result

    def _generate_narrative_candidates(self) -> List[Dict[str, Any]]:
        return [
            {
                KEY_ID: "N1",
                "Thesis Statement": "Thesis A",
                "Narrative Outline": "Outline A",
                "Global Assessment": "Assessment A",
            },
            {
                KEY_ID: "N2",
                "Thesis Statement": "Thesis B",
                "Narrative Outline": "Outline B",
                "Global Assessment": "Assessment B",
            },
        ]


register_handler(HandlerType.NARRATIVE_SYNTHESIS, NarrativeSynthesisHandler)


```

### services/execution_engine/handlers/registry.py Content:

```py
"""Registry mapping handler types to concrete implementations."""

from typing import Dict, Type

from backend.exceptions import InvalidStateException
from backend.workflow.spec import HandlerType

from .base import NodeHandler

_HANDLER_REGISTRY: Dict[HandlerType, Type[NodeHandler]] = {}


def register_handler(handler_type: HandlerType, handler_cls: Type[NodeHandler]):
    _HANDLER_REGISTRY[handler_type] = handler_cls


def get_handler_class(handler_type: HandlerType) -> Type[NodeHandler]:
    handler_cls = _HANDLER_REGISTRY.get(handler_type)
    if not handler_cls:
        raise InvalidStateException(f"No handler registered for handler_type={handler_type}")
    return handler_cls


# Import handler modules to trigger registration side effects.
from . import code_execution, final_paper, generic_avl, generic_sca, generic_varl, narrative_synthesis, taskbook_generator  # noqa: E402,F401


```

### services/execution_engine/handlers/taskbook_generator.py Content:

```py
"""Handler for the taskbook generator node."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.exceptions import InvalidStateException
from backend.workflow.constants import KEY_ANALYSIS, KEY_CANDIDATES, KEY_ID, KEY_SCA_OUTPUT, KEY_SELECTED_ITEM
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .generic_sca import BaseSCAHandler
from .registry import register_handler


class TaskbookGeneratorHandler(BaseSCAHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        candidates = self._generate_taskbook_candidates()
        analysis_prompt = "Compare the generated taskbooks and highlight their trade-offs."
        analysis = await self.llm_client.generate_text(analysis_prompt)

        output = {KEY_CANDIDATES: candidates, KEY_ANALYSIS: analysis}
        artifacts = {"analysis_prompt": analysis_prompt}
        return ExecutionResult(output_data=output, artifacts=artifacts)

    def determine_final_output(
        self,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        final_output = super().determine_final_output(raw_output, interaction_data)
        sca_wrapper = final_output.get(KEY_SCA_OUTPUT, {})
        selected_item = sca_wrapper.get(KEY_SELECTED_ITEM)
        if not selected_item:
            raise InvalidStateException("Taskbook selection is required to proceed.")

        taskbook_result = dict(selected_item)
        taskbook_result[KEY_SCA_OUTPUT] = sca_wrapper
        return taskbook_result

    def _generate_taskbook_candidates(self) -> List[Dict[str, Any]]:
        task_a1 = {
            "task_id": "Task_A1",
            "task_name": "Define Objective",
            "io_interfaces": {"inputs": {"1.1.1": ["Formal Problem Restatement"]}, "outputs": ["Objective Function"]},
            "external_inputs": ["Problem Statement"],
        }
        task_a2 = {
            "task_id": "Task_A2",
            "task_name": "Solve Optimization",
            "io_interfaces": {"inputs": {"Task_A1": ["Objective Function"]}, "outputs": ["Optimal Solution"]},
            "external_inputs": ["Datasets"],
        }
        return [
            {
                KEY_ID: "OptA",
                "name": "Optimization Approach",
                "Structured Modeling Taskbook": {"tasks": [task_a1, task_a2]},
            },
            {
                KEY_ID: "OptB",
                "name": "Simulation Approach",
                "Structured Modeling Taskbook": {
                    "tasks": [
                        {"task_id": "Task_B1", "task_name": "Build Sim", "io_interfaces": {}, "external_inputs": []}
                    ]
                },
            },
        ]


register_handler(HandlerType.TASKBOOK_GENERATOR, TaskbookGeneratorHandler)


```

    ## utils
     - __init__.py
     - event_utils.py

### utils/__init__.py Content:

```py
"""Utility helpers for the backend package."""

```

### utils/event_utils.py Content:

```py
from typing import Optional

from backend.config import settings
from backend.redis import get_redis_pool
from backend.schemas.events import EventPayload, EventType
from backend.ws_manager import manager


async def broadcast_event(workflow_id: int, event_type: EventType, data: dict, node_id: Optional[int] = None) -> None:
    """Publish standardized workflow events via Redis Pub/Sub."""

    payload = EventPayload(event_type=event_type, workflow_id=workflow_id, node_id=node_id, data=data)
    redis = await get_redis_pool()
    await redis.publish(settings.WEBSOCKET_BROADCAST_CHANNEL, payload.model_dump_json())


async def broadcast_from_server(workflow_id: int, message: dict) -> None:
    """Directly broadcast a message from this process to WebSocket clients."""

    await manager.broadcast(workflow_id, message)

```

    ## workflow
     - __init__.py
     - constants.py
     - loader.py
     - spec.py

### workflow/__init__.py Content:

```py
"""Workflow specification package."""

from .constants import DEFAULT_WORKFLOW_SPEC_ID
from .loader import load_workflow_spec

__all__ = ["DEFAULT_WORKFLOW_SPEC_ID", "load_workflow_spec"]


```

### workflow/constants.py Content:

```py
"""Shared workflow constants and keys used across the application."""

# Standardized Keys for Raw Generation
KEY_PRIMARY_ARTIFACT = "primary_artifact"
KEY_CANDIDATES = "candidates"
KEY_ANALYSIS = "comparative_analysis"
KEY_CRITIQUES = "critiques"
KEY_ID = "id"

# Standardized keys for final HITL outputs
KEY_SCA_OUTPUT = "sca_output_wrapper"
KEY_SELECTED_ITEM = "selected_item"
KEY_SELECTED_ITEMS = "selected_items"

# Stage metadata keys
KEY_STAGE_ID = "stage_id"
KEY_STAGE_NAME = "stage_name"

# Workflow structure constants
PREVIOUS_IN_TASK = "__PREVIOUS_IN_TASK__"

# Default workflow specification identifier
DEFAULT_WORKFLOW_SPEC_ID = "o_award_v1"

__all__ = [
    "DEFAULT_WORKFLOW_SPEC_ID",
    "KEY_ANALYSIS",
    "KEY_CANDIDATES",
    "KEY_CRITIQUES",
    "KEY_ID",
    "KEY_PRIMARY_ARTIFACT",
    "KEY_SCA_OUTPUT",
    "KEY_SELECTED_ITEM",
    "KEY_SELECTED_ITEMS",
    "KEY_STAGE_ID",
    "KEY_STAGE_NAME",
    "PREVIOUS_IN_TASK",
]


```

### workflow/loader.py Content:

```py
"""Helpers for loading workflow specifications from YAML files."""

from functools import lru_cache
from pathlib import Path

import yaml

from backend.workflow.spec import WorkflowSpec


@lru_cache(maxsize=10)
def load_workflow_spec(spec_id: str) -> WorkflowSpec:
    """Load and validate a workflow specification from disk."""
    spec_path = Path(__file__).parent.parent / "data" / "workflows" / f"{spec_id}.yaml"
    if not spec_path.exists():
        raise FileNotFoundError(f"Workflow specification '{spec_id}' not found at {spec_path}")

    with spec_path.open("r", encoding="utf-8") as spec_file:
        data = yaml.safe_load(spec_file)

    return WorkflowSpec.model_validate(data)


__all__ = ["load_workflow_spec"]


```

### workflow/spec.py Content:

```py
"""Pydantic models describing declarative workflow specifications."""

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class NodeType(str, Enum):
    STANDARD = "Standard"
    GENERATOR = "Generator"


class HITLMode(str, Enum):
    VARL = "VARL"
    SCA = "SCA"
    AVL = "AVL"


class SCASelectionMode(str, Enum):
    SINGLE = "Single"
    MULTIPLE = "Multiple"


class HandlerType(str, Enum):
    GENERIC_SCA = "GenericSCAHandler"
    GENERIC_AVL = "GenericAVLHandler"
    GENERIC_VARL = "GenericVARLHandler"
    TASKBOOK_GENERATOR = "TaskbookGeneratorHandler"
    CODE_EXECUTION = "CodeExecutionHandler"
    NARRATIVE_SYNTHESIS = "NarrativeSynthesisHandler"
    FINAL_PAPER = "FinalPaperHandler"


class NodeSpec(BaseModel):
    id: str
    name: str
    phase: str
    stage_id: str
    stage_name: str
    type: NodeType
    hitl_mode: HITLMode
    dependencies: Dict[str, Dict[str, List[str]]] = Field(default_factory=dict)
    external_inputs: List[str] = Field(default_factory=list)
    task_group_id: Optional[str] = None

    handler_type: HandlerType
    sca_selection_mode: Optional[SCASelectionMode] = None
    export_config: Dict[str, Any] = Field(default_factory=dict)
    generates_task_id_from: Optional[str] = None


class DynamicTaskTemplateSpec(BaseModel):
    name_prefix: str
    stage_name_prefix: str
    type: NodeType
    hitl_mode: HITLMode
    inputs: Dict[str, List[str]] = Field(default_factory=dict)
    outputs: List[str] = Field(default_factory=list)
    inherits_external_inputs: bool = False

    handler_type: HandlerType
    sca_selection_mode: Optional[SCASelectionMode] = None
    export_config: Dict[str, Any] = Field(default_factory=dict)


class WorkflowSpec(BaseModel):
    id: str
    name: str
    structure: List[NodeSpec]
    dynamic_task_templates: Dict[str, DynamicTaskTemplateSpec] = Field(default_factory=dict)
    terminal_node_suffix: str


__all__ = [
    "DynamicTaskTemplateSpec",
    "HITLMode",
    "HandlerType",
    "NodeSpec",
    "NodeType",
    "SCASelectionMode",
    "WorkflowSpec",
]

```

