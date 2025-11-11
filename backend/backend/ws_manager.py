import json
from typing import Dict, List

from fastapi import WebSocket
from loguru import logger


class ConnectionManager:
    """Tracks active WebSocket connections grouped by workflow instance."""

    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, workflow_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(workflow_id, []).append(websocket)
        logger.info("WebSocket connected", workflow_id=workflow_id)

    def disconnect(self, workflow_id: int, websocket: WebSocket):
        connections = self.active_connections.get(workflow_id, [])
        try:
            connections.remove(websocket)
        except ValueError:
            pass
        if not connections and workflow_id in self.active_connections:
            del self.active_connections[workflow_id]
        logger.info("WebSocket disconnected", workflow_id=workflow_id)

    async def broadcast(self, workflow_id: int, message: Dict):
        connections = self.active_connections.get(workflow_id)
        if not connections:
            return

        payload = json.dumps(message, default=str)
        for connection in connections[:]:
            try:
                await connection.send_text(payload)
            except Exception as exc:  # Connection already closed
                logger.warning("Failed to send WebSocket message", workflow_id=workflow_id, error=str(exc))
                self.disconnect(workflow_id, connection)


manager = ConnectionManager()
