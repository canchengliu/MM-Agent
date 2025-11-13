"""Generic VARL handler for non-specialized nodes."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.workflow.constants import KEY_PRIMARY_ARTIFACT
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .base import NodeHandler
from .registry import register_handler


class GenericVARLHandler(NodeHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        context = f" Feedback: {feedback}" if feedback else ""
        prompt = f"Generate a VARL artifact for node {self.node.definition_id}.{context}"
        llm_response = await self.llm_client.generate_text(prompt)

        artifact = {
            "content": llm_response,
            "data": "Generic VARL data output",
        }
        output_data = {KEY_PRIMARY_ARTIFACT: artifact}
        artifacts = {"prompt": prompt}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)


register_handler(HandlerType.GENERIC_VARL, GenericVARLHandler)

