from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel


class EventType(str, Enum):
    """WebSocket event types."""

    NODE_STATUS_UPDATED = "NODE_STATUS_UPDATED"
    WORKFLOW_STRUCTURE_UPDATED = "WORKFLOW_STRUCTURE_UPDATED"
    WORKFLOW_STATUS_UPDATED = "WORKFLOW_STATUS_UPDATED"


class EventPayload(BaseModel):
    """Standardized payload for WebSocket events."""

    event_type: EventType
    workflow_id: int
    node_id: Optional[int] = None
    data: Dict[str, Any]
