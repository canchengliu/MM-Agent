"""Deterministic planner for NodeExecutor.execute_node outcomes."""

from __future__ import annotations

import asyncio
from collections import deque
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Deque, Dict, Optional

from backend.services.execution_engine.results import ExecutionResult


DispatchCallable = Callable[..., Awaitable[ExecutionResult] | ExecutionResult]


@dataclass
class PlannedExecution:
    result: Optional[ExecutionResult] = None
    delay: float = 0.0
    exception: Optional[Exception] = None
    callable: Optional[DispatchCallable] = None


class ExecutionMocker:
    """Scenario-aware harness that replaces NodeExecutor.execute_node."""

    def __init__(self):
        self._plans: Dict[str, Deque[PlannedExecution]] = {}

    def plan(self, node_definition_id: str, *entries: PlannedExecution | ExecutionResult | Exception | DispatchCallable):
        """Register one or more sequential behaviors for a node."""
        queue: Deque[PlannedExecution] = deque()
        for entry in entries or ():
            queue.append(self._normalize(entry))
        if not queue:
            queue.append(PlannedExecution(result=ExecutionResult(output_data={}, artifacts={})))
        self._plans[node_definition_id] = queue

    def clear(self):
        self._plans.clear()

    async def dispatch(
        self,
        node,
        inputs,
        history,
        feedback,
        previous_output,
        adjudication_data,
    ) -> ExecutionResult:
        queue = self._plans.get(node.definition_id)
        if not queue:
            return ExecutionResult(output_data={}, artifacts={})

        execution = queue[0] if len(queue) == 1 else queue.popleft()
        if execution.delay:
            await asyncio.sleep(execution.delay)
        if execution.exception:
            raise execution.exception
        if execution.callable:
            result = execution.callable(
                node=node,
                inputs=inputs,
                history=history,
                feedback=feedback,
                previous_output=previous_output,
                adjudication_data=adjudication_data,
            )
            if asyncio.iscoroutine(result):
                return await result
            return result
        if execution.result:
            return execution.result
        return ExecutionResult(output_data={}, artifacts={})

    def _normalize(self, entry) -> PlannedExecution:
        if isinstance(entry, PlannedExecution):
            return entry
        if isinstance(entry, ExecutionResult):
            return PlannedExecution(result=entry)
        if isinstance(entry, Exception):
            return PlannedExecution(exception=entry)
        if callable(entry):
            return PlannedExecution(callable=entry)
        raise TypeError(f"Unsupported execution plan entry: {entry!r}")


def planned_result(*, output: Dict[str, Any], artifacts: Optional[Dict[str, Any]] = None, delay: float = 0.0) -> PlannedExecution:
    """Convenience helper for building PlannedExecution entries."""
    return PlannedExecution(result=ExecutionResult(output_data=output, artifacts=artifacts or {}), delay=delay)
