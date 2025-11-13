"""Handler responsible for generating the final O-Award paper."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.workflow.constants import KEY_PRIMARY_ARTIFACT
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .base import NodeHandler
from .registry import register_handler


class FinalPaperHandler(NodeHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        prompt = "Forge the final O-Award submission-ready paper summarizing all findings."
        if feedback:
            prompt += f" Incorporate reviewer feedback: {feedback}."
        llm_response = await self.llm_client.generate_text(prompt)

        artifact = {
            "Submission-Ready Paper": llm_response,
            "content": llm_response,
        }
        output_data = {KEY_PRIMARY_ARTIFACT: artifact}
        artifacts = {"prompt": prompt}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)

    def format_export(
        self,
        zf,
        output_data: Dict[str, Any],
        base_path: str,
        execution_artifacts: Optional[Dict[str, Any]] = None,
    ):
        export_config = self.node.export_config or {}
        paper_key = export_config.get("paper_key", "Submission-Ready Paper")
        filename = export_config.get("filename", "FinalPaper.md")

        content = output_data.get(paper_key)
        if content:
            zf.writestr(f"{base_path}{filename}", content)


register_handler(HandlerType.FINAL_PAPER, FinalPaperHandler)

