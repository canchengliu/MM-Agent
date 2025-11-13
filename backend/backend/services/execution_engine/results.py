"""Shared execution engine data structures."""

from typing import Any, Dict

from pydantic import BaseModel, Field


class ExecutionResult(BaseModel):
    """Structured result from a node execution, including output and artifacts."""

    output_data: Dict[str, Any]
    artifacts: Dict[str, Any] = Field(default_factory=dict)


__all__ = ["ExecutionResult"]

