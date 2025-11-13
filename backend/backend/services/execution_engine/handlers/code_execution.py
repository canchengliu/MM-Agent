"""Handler for automatic code generation and sandbox execution."""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from backend.workflow.constants import KEY_PRIMARY_ARTIFACT
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .base import NodeHandler
from .registry import register_handler


class CodeExecutionHandler(NodeHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        code_to_run = f"# Python code generated for {self.node.definition_id}\\nprint('Simulated execution')"
        sandbox_result = await self.sandbox_client.execute_code(code_to_run)

        artifacts: Dict[str, Any] = {"generated_code.py": code_to_run, "execution.log": sandbox_result.get("stdout", "")}
        if sandbox_result.get("stderr"):
            artifacts["error.log"] = sandbox_result.get("stderr")

        artifact = {
            "raw_results": sandbox_result.get("results", "Simulated Raw Data"),
        }
        if (self.behavior or {}).get("include_vv_data"):
            artifact["vv_data"] = "Simulated V&V Data from sandbox"
            artifact["sensitivity_data"] = "Simulated Sensitivity Data from sandbox"

        output_data = {KEY_PRIMARY_ARTIFACT: artifact}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)

    def format_export(
        self,
        zf,
        output_data: Dict[str, Any],
        base_path: str,
        execution_artifacts: Optional[Dict[str, Any]] = None,
    ):
        export_config = self.node.export_config or {}
        code_keys = export_config.get("code_keys", [])
        if execution_artifacts:
            for key in code_keys:
                if key in execution_artifacts:
                    zf.writestr(f"{base_path}{key}", execution_artifacts[key])

        attachments = ["raw_results", "vv_data", "sensitivity_data"]
        for key in attachments:
            if key in output_data:
                path = f"{base_path}{key}.json"
                zf.writestr(path, json.dumps(output_data[key], indent=2, default=str).encode("utf-8"))


register_handler(HandlerType.CODE_EXECUTION, CodeExecutionHandler)

