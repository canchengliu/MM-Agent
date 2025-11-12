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