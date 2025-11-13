"""In-memory stand-in for Redis + arq primitives used by the tests."""

from __future__ import annotations

import asyncio
import itertools
from dataclasses import dataclass, field
from types import SimpleNamespace
from typing import Any, Dict, Optional


class FakeJobStatus(str):
    """Minimal subset of arq.jobs.JobStatus used by the application."""

    not_found = "not_found"
    queued = "queued"
    running = "running"


@dataclass
class FakeQueuedJob:
    job_id: str
    function: str
    node_id: int
    kwargs: Dict[str, Any]
    state: str = FakeJobStatus.queued
    aborted: bool = False
    task: Optional[asyncio.Task[Any]] = None


class FakeJob:
    """Drop-in replacement for arq.jobs.Job used by NodeService."""

    def __init__(self, job_id: str, redis: "FakeArqRedis"):
        self.job_id = job_id
        self._redis = redis

    async def abort(self) -> bool:
        return await self._redis.abort_job(self.job_id)

    async def status(self) -> str:
        return self._redis.job_status(self.job_id)


class FakePubSub:
    """Simple pub/sub queue used by the redis listener."""

    def __init__(self, queue: "asyncio.Queue[dict[str, Any]]"):
        self._queue = queue
        self._subscribed = False

    async def subscribe(self, _channel: str):
        self._subscribed = True

    async def unsubscribe(self, _channel: str):
        self._subscribed = False

    async def get_message(self, ignore_subscribe_messages: bool = True, timeout: float = 1.0):
        if not self._subscribed:
            return None
        try:
            return await asyncio.wait_for(self._queue.get(), timeout)
        except asyncio.TimeoutError:
            return None

    async def close(self):
        self._subscribed = False


class FakeArqRedis:
    """Naive async queue that mimics the subset of arq Redis APIs used by the app."""

    def __init__(self):
        self.job_queue: "asyncio.Queue[Optional[FakeQueuedJob]]" = asyncio.Queue()
        self._jobs: Dict[str, FakeQueuedJob] = {}
        self._job_counter = itertools.count(1)
        self._pubsub_queue: "asyncio.Queue[dict[str, Any]]" = asyncio.Queue()
        self._closed = False

    async def enqueue_job(self, function: str, *, node_id: int, _job_id: Optional[str] = None, **kwargs: Any):
        job_id = _job_id or f"fake-job-{next(self._job_counter)}"
        job = FakeQueuedJob(job_id=job_id, function=function, node_id=node_id, kwargs=kwargs)
        self._jobs[job_id] = job
        await self.job_queue.put(job)
        return SimpleNamespace(job_id=job_id)

    async def abort_job(self, job_id: str) -> bool:
        job = self._jobs.get(job_id)
        if not job:
            return False
        job.aborted = True
        if job.task and not job.task.done():
            job.task.cancel()
        return True

    def job_status(self, job_id: str) -> str:
        return FakeJobStatus.not_found if job_id not in self._jobs else FakeJobStatus.queued

    def mark_job_finished(self, job_id: str):
        self._jobs.pop(job_id, None)

    async def publish(self, channel: str, data: str):
        await self._pubsub_queue.put({"type": "message", "channel": channel, "data": data})

    def pubsub(self) -> FakePubSub:
        return FakePubSub(self._pubsub_queue)

    async def ping(self) -> str:
        return "PONG"

    async def close(self):
        self._closed = True
        await self.reset()

    async def reset(self):
        while not self.job_queue.empty():
            try:
                self.job_queue.get_nowait()
            except asyncio.QueueEmpty:
                break
        self._jobs.clear()
        while not self._pubsub_queue.empty():
            try:
                self._pubsub_queue.get_nowait()
            except asyncio.QueueEmpty:
                break


class ArqWorkerHarness:
    """Background consumer that invokes execute_node_task for queued jobs."""

    def __init__(self, redis: FakeArqRedis, handler):
        self.redis = redis
        self._handler = handler
        self._task: Optional[asyncio.Task[Any]] = None
        self._running = asyncio.Event()

    async def start(self):
        if self._task:
            return
        self._running.set()
        self._task = asyncio.create_task(self._run())

    async def _run(self):
        while self._running.is_set():
            job = await self.redis.job_queue.get()
            if job is None:
                continue
            if job.aborted:
                self.redis.mark_job_finished(job.job_id)
                continue
            job.state = FakeJobStatus.running
            context = {"redis": self.redis}
            job.task = asyncio.create_task(self._handler(context, job.node_id, **job.kwargs))
            try:
                await job.task
            except asyncio.CancelledError:
                pass
            finally:
                self.redis.mark_job_finished(job.job_id)

    async def stop(self):
        self._running.clear()
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None
        await self.redis.reset()
