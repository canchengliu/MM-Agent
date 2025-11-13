"""In-process WebSocket client helpers for talking to the FastAPI app."""

from __future__ import annotations

import asyncio
import json
from typing import Any, Awaitable, Callable, Dict, Optional

from starlette.websockets import WebSocketDisconnect


class InProcessWebSocket:
    """Minimal ASGI WebSocket client that runs entirely in-process."""

    def __init__(self, app, path: str, headers: Optional[Dict[str, str]] = None):
        self._app = app
        self._path = path
        self._headers = headers or {}
        self._receive_queue: "asyncio.Queue[dict[str, Any]]" = asyncio.Queue()
        self._message_queue: "asyncio.Queue[dict[str, Any]]" = asyncio.Queue()
        self._accepted = asyncio.Event()
        self._closed = asyncio.Event()
        self._task: Optional[asyncio.Task[Any]] = None

    async def connect(self):
        scope = {
            "type": "websocket",
            "asgi": {"version": "3.0"},
            "scheme": "ws",
            "path": self._path.split("?")[0],
            "raw_path": self._path.encode("ascii"),
            "query_string": self._extract_query().encode("ascii"),
            "headers": [(k.lower().encode("latin-1"), v.encode("latin-1")) for k, v in self._headers.items()],
            "client": ("testclient", 50000),
            "server": ("testserver", 80),
            "root_path": "",
            "subprotocols": [],
        }
        self._task = asyncio.create_task(self._app(scope, self._asgi_receive, self._asgi_send))
        await self._receive_queue.put({"type": "websocket.connect"})
        await self._accepted.wait()

    def _extract_query(self) -> str:
        if "?" not in self._path:
            return ""
        return self._path.split("?", 1)[1]

    async def _asgi_receive(self):
        return await self._receive_queue.get()

    async def _asgi_send(self, message: dict):
        msg_type = message["type"]
        if msg_type == "websocket.accept":
            self._accepted.set()
        elif msg_type == "websocket.send":
            await self._message_queue.put(message)
        elif msg_type == "websocket.close":
            await self._message_queue.put(message)
            self._closed.set()

    async def receive_text(self) -> str:
        while True:
            message = await self._message_queue.get()
            msg_type = message["type"]
            if msg_type == "websocket.send":
                if "text" in message:
                    return message["text"]
                if "bytes" in message:
                    return message["bytes"].decode("utf-8")
            elif msg_type == "websocket.close":
                raise WebSocketDisconnect(message.get("code", 1000))

    async def close(self, code: int = 1000):
        if self._closed.is_set():
            return
        await self._receive_queue.put({"type": "websocket.disconnect", "code": code})
        await self._closed.wait()
        if self._task:
            await self._task
            self._task = None


class WebSocketListener:
    """Utility that buffers workflow events from the WS endpoint."""

    def __init__(self, app, path: str):
        self._ws = InProcessWebSocket(app, path)
        self._queue: "asyncio.Queue[dict[str, Any]]" = asyncio.Queue()
        self._pump: Optional[asyncio.Task[Any]] = None

    async def start(self):
        await self._ws.connect()
        self._pump = asyncio.create_task(self._listen())

    async def _listen(self):
        while True:
            try:
                text = await self._ws.receive_text()
            except WebSocketDisconnect:
                break
            payload = json.loads(text)
            await self._queue.put(payload)

    async def wait_for_event(
        self,
        event_type: str,
        predicate: Optional[Callable[[dict[str, Any]], bool]] = None,
        timeout: float = 30.0,
    ):
        while True:
            try:
                event = await asyncio.wait_for(self._queue.get(), timeout)
            except asyncio.TimeoutError as exc:
                raise AssertionError(f"Timeout while waiting for event {event_type}") from exc
            if event.get("event_type") != event_type:
                continue
            if predicate and not predicate(event):
                continue
            return event

    async def stop(self):
        if self._pump:
            self._pump.cancel()
            try:
                await self._pump
            except asyncio.CancelledError:
                pass
            self._pump = None
        await self._ws.close()

    async def __aenter__(self):
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.stop()
