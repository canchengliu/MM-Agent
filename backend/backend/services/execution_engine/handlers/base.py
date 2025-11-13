"""Base classes and helpers for node execution handlers."""

from __future__ import annotations

import json
import zipfile
from typing import Any, Dict, List, Optional, TYPE_CHECKING

from backend.models.workflow import NodeInstance
from backend.services.execution_engine.results import ExecutionResult

if TYPE_CHECKING:
    from backend.services.execution_engine.executor import NodeExecutor


class NodeHandler:
    """Base class for encapsulating node execution, HITL, and export behavior."""

    def __init__(self, executor: Optional["NodeExecutor"], node: NodeInstance):
        self.executor = executor
        self.node = node

    @property
    def behavior(self) -> Dict[str, Any]:
        export_config = self.node.export_config or {}
        return export_config.get("behavior", {})

    @property
    def config(self):
        if not self.executor:
            raise RuntimeError("Execution config is not available outside of runtime execution.")
        return self.executor.config

    @property
    def llm_client(self):
        if not self.executor:
            raise RuntimeError("LLM client is not available outside of runtime execution.")
        return self.executor.llm_client

    @property
    def sandbox_client(self):
        if not self.executor:
            raise RuntimeError("Sandbox client is not available outside of runtime execution.")
        return self.executor.sandbox_client

    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        raise NotImplementedError

    def validate_hitl_integrity(self, raw_output: Dict[str, Any], interaction_data: Optional[Dict[str, Any]]):
        """Override to enforce handler-specific HITL submission requirements."""

    def determine_final_output(
        self,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Override to transform raw execution output into a finalized payload."""
        return raw_output

    def format_export(
        self,
        zf: zipfile.ZipFile,
        output_data: Dict[str, Any],
        base_path: str,
        execution_artifacts: Optional[Dict[str, Any]] = None,
    ):
        """Default export implementation writes the node output as JSON."""
        if not output_data:
            return
        path = f"{base_path}output.json"
        serialized = json.dumps(output_data, indent=2, default=str).encode("utf-8")
        zf.writestr(path, serialized)
