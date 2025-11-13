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
