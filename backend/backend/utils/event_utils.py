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
