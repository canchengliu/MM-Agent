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
