"""Generic SCA handler and shared SCA utilities."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.exceptions import InvalidStateException
from backend.models.user import ThinkingDepth
from backend.workflow.constants import (
    KEY_ANALYSIS,
    KEY_CANDIDATES,
    KEY_ID,
    KEY_SCA_OUTPUT,
    KEY_SELECTED_ITEM,
    KEY_SELECTED_ITEMS,
)
from backend.workflow.spec import HandlerType, SCASelectionMode

from ..results import ExecutionResult
from .base import NodeHandler
from .registry import register_handler


class BaseSCAHandler(NodeHandler):
    """Shared SCA validation and finalization logic."""

    def _selection_mode(self) -> SCASelectionMode:
        return self.node.sca_selection_mode or SCASelectionMode.SINGLE

    def validate_hitl_integrity(self, raw_output: Dict[str, Any], interaction_data: Optional[Dict[str, Any]]):
        if not interaction_data or "selected_ids" not in interaction_data:
            raise InvalidStateException("SCA requires 'selected_ids' in interaction_data.")
        selected_ids = interaction_data["selected_ids"]
        if not isinstance(selected_ids, list) or not selected_ids:
            raise InvalidStateException("SCA requires a non-empty list of selections.")

        selection_mode = self._selection_mode()
        if selection_mode == SCASelectionMode.SINGLE and len(selected_ids) != 1:
            raise InvalidStateException("This node requires exactly one selection.")

        candidates = raw_output.get(KEY_CANDIDATES, [])
        available_ids = {candidate.get(KEY_ID) for candidate in candidates if candidate.get(KEY_ID)}
        if not set(selected_ids).issubset(available_ids):
            raise InvalidStateException("Submitted 'selected_ids' contain invalid candidates.")

    def determine_final_output(
        self,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        if not interaction_data or "selected_ids" not in interaction_data:
            raise InvalidStateException("SCA output determination requires 'selected_ids'.")

        selected_ids = set(interaction_data["selected_ids"])
        candidates = raw_output.get(KEY_CANDIDATES, [])
        selected_items = [candidate for candidate in candidates if candidate.get(KEY_ID) in selected_ids]

        selection_mode = self._selection_mode()
        selected_item = None
        if selection_mode == SCASelectionMode.SINGLE:
            if len(selected_items) != 1:
                raise InvalidStateException(
                    f"Expected a single selection for node {self.node.definition_id}, found {len(selected_items)}."
                )
            selected_item = selected_items[0]

        sca_output_wrapper = {
            KEY_SELECTED_ITEM: selected_item,
            KEY_SELECTED_ITEMS: selected_items,
        }

        final_output: Dict[str, Any] = {}
        for key, value in raw_output.items():
            if key not in (KEY_CANDIDATES, KEY_ANALYSIS):
                final_output[key] = value

        final_output[KEY_SCA_OUTPUT] = sca_output_wrapper
        return final_output


class GenericSCAHandler(BaseSCAHandler):
    """Default SCA node handler with candidate generation and analysis."""

    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        variant = (self.behavior or {}).get("variant", "generic")
        output: Dict[str, Any] = {}
        base_candidates = self._build_candidates(variant)

        num_candidates_map = {
            ThinkingDepth.INSTANT: 2,
            ThinkingDepth.MEDIUM: 3,
            ThinkingDepth.HEAVY: 4,
        }
        num_to_generate = num_candidates_map.get(self.config.thinking_depth, 3)
        final_candidates = base_candidates[:num_to_generate]

        if feedback:
            final_candidates.append(
                {KEY_ID: "F1", "name": "Option based on feedback", "description": "Tailored option"}
            )

        analysis_prompt = f"Provide a comparative analysis of {len(final_candidates)} candidates."
        analysis = await self.llm_client.generate_text(analysis_prompt)

        output[KEY_CANDIDATES] = final_candidates
        output[KEY_ANALYSIS] = analysis

        if variant == "visualization":
            output["vv_report"] = f"V&V Report for {self.node.definition_id}"
            output["key_output_doc"] = f"Key outputs for {self.node.definition_id}"

        artifacts = {"analysis_prompt": analysis_prompt}
        return ExecutionResult(output_data=output, artifacts=artifacts)

    def _build_candidates(self, variant: str) -> List[Dict[str, Any]]:
        if variant == "visualization":
            return [
                {KEY_ID: "V1", "name": "Visualization Plot A", "type": "Plot"},
                {KEY_ID: "V2", "name": "Visualization Table B", "type": "Table"},
                {KEY_ID: "V3", "name": "Visualization Plot C (Extra)", "type": "Plot"},
            ]

        return [
            {KEY_ID: "C1", "name": "Model Option A", "description": "Explores constrained optimization."},
            {KEY_ID: "C2", "name": "Model Option B", "description": "Balances exploration vs. exploitation."},
            {KEY_ID: "C3", "name": "Model Option C", "description": "Focuses on stochastic regimes."},
            {KEY_ID: "C4", "name": "Model Option D", "description": "Targets multi-objective trade-offs."},
        ]


register_handler(HandlerType.GENERIC_SCA, GenericSCAHandler)

