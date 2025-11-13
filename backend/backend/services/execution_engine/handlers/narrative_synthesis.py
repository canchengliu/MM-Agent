"""Handler for the strategic narrative synthesis node."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.exceptions import InvalidStateException
from backend.workflow.constants import KEY_ANALYSIS, KEY_CANDIDATES, KEY_ID, KEY_SCA_OUTPUT, KEY_SELECTED_ITEM
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .generic_sca import BaseSCAHandler
from .registry import register_handler


class NarrativeSynthesisHandler(BaseSCAHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        candidates = self._generate_narrative_candidates()
        analysis_prompt = "Compare the strategic narratives and recommend the strongest thesis."
        analysis = await self.llm_client.generate_text(analysis_prompt)

        output = {KEY_CANDIDATES: candidates, KEY_ANALYSIS: analysis}
        artifacts = {"analysis_prompt": analysis_prompt}
        return ExecutionResult(output_data=output, artifacts=artifacts)

    def determine_final_output(
        self,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        final_output = super().determine_final_output(raw_output, interaction_data)
        sca_wrapper = final_output.get(KEY_SCA_OUTPUT, {})
        selected_item = sca_wrapper.get(KEY_SELECTED_ITEM)
        if not selected_item:
            raise InvalidStateException("Narrative synthesis requires selecting a single narrative.")

        synthesized_result = dict(selected_item)
        synthesized_result[KEY_SCA_OUTPUT] = sca_wrapper
        return synthesized_result

    def _generate_narrative_candidates(self) -> List[Dict[str, Any]]:
        return [
            {
                KEY_ID: "N1",
                "Thesis Statement": "Thesis A",
                "Narrative Outline": "Outline A",
                "Global Assessment": "Assessment A",
            },
            {
                KEY_ID: "N2",
                "Thesis Statement": "Thesis B",
                "Narrative Outline": "Outline B",
                "Global Assessment": "Assessment B",
            },
        ]


register_handler(HandlerType.NARRATIVE_SYNTHESIS, NarrativeSynthesisHandler)

