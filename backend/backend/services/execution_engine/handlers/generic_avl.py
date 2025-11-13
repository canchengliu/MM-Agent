"""Generic AVL handler used by multiple nodes."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.exceptions import InvalidStateException
from backend.models.user import HITLProfile
from backend.workflow.constants import (
    KEY_CRITIQUES,
    KEY_ID,
    KEY_PRIMARY_ARTIFACT,
    KEY_SCA_OUTPUT,
    KEY_SELECTED_ITEM,
)
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .base import NodeHandler
from .registry import register_handler


class GenericAVLHandler(NodeHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        prompt = self._build_prompt(feedback, adjudication_data, previous_output)
        artifact_content = await self.llm_client.generate_text(prompt)

        artifact: Dict[str, Any] = {
            "content": artifact_content,
            "data": "Generic AVL data output",
        }

        if self.behavior.get("variant") == "formulation":
            artifact.update(self._build_formulation_artifacts(inputs))

        critiques = self._critique(artifact, adjudication_data)
        output_data = {
            KEY_PRIMARY_ARTIFACT: artifact,
            KEY_CRITIQUES: critiques,
        }
        artifacts = {"generation_prompt": prompt}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)

    def validate_hitl_integrity(self, raw_output: Dict[str, Any], interaction_data: Optional[Dict[str, Any]]):
        critiques = raw_output.get(KEY_CRITIQUES, [])
        if not critiques:
            return
        if not interaction_data or "adjudication" not in interaction_data:
            raise InvalidStateException("AVL requires 'adjudication' data when critiques are present.")

        adjudication_data = interaction_data["adjudication"]
        if not isinstance(adjudication_data, list) or len(adjudication_data) != len(critiques):
            raise InvalidStateException("Adjudication data must cover every critique.")

        available_ids = {c.get(KEY_ID) for c in critiques if c.get(KEY_ID)}
        submitted_ids = {item.get("critique_id") for item in adjudication_data if item.get("critique_id")}
        if submitted_ids != available_ids:
            raise InvalidStateException("Mismatch between critiques and adjudication decisions.")

    def determine_final_output(
        self,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        if KEY_PRIMARY_ARTIFACT in raw_output:
            return raw_output[KEY_PRIMARY_ARTIFACT]
        return raw_output

    def _build_prompt(
        self,
        feedback: Optional[str],
        adjudication_data: Optional[List[Dict[str, Any]]],
        previous_output: Optional[Dict[str, Any]],
    ) -> str:
        if adjudication_data or feedback:
            context = adjudication_data if adjudication_data else feedback
            previous_artifact_content = "N/A"
            if previous_output and KEY_PRIMARY_ARTIFACT in previous_output:
                previous_artifact_content = previous_output[KEY_PRIMARY_ARTIFACT].get("content", "N/A")
            return f"Refine the AVL artifact with context: {context}. Previous content was: {previous_artifact_content}"
        return "Generate an initial AVL Artifact."

    def _build_formulation_artifacts(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        if not self.node.task_group_id:
            return {}

        upstream_211_id = f"{self.node.task_group_id}.2.1.1"
        input_211 = inputs.get(upstream_211_id, {})
        selected_model_name = "Unknown Model"
        sca_payload = input_211.get(KEY_SCA_OUTPUT) or {}
        selected_item = sca_payload.get(KEY_SELECTED_ITEM)
        if selected_item:
            selected_model_name = selected_item.get("name", selected_model_name)

        return {
            "math_formulation": f"Math formulation for {selected_model_name}.",
            "execution_blueprint": f"Blueprint for {selected_model_name}.",
        }

    def _critique(
        self,
        artifact: Dict[str, Any],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> List[Dict[str, Any]]:
        profile = self.config.hitl_profile

        if profile == HITLProfile.EXPERT:
            if adjudication_data:
                return []
            return [
                {
                    KEY_ID: "c_exp_1",
                    "critique": "Overall sound, but verify boundary conditions of the core assumption.",
                    "severity": "Medium",
                },
            ]

        if profile == HITLProfile.NOVICE:
            if adjudication_data:
                return [
                    {
                        KEY_ID: "c_nov_r1",
                        "critique": "Refinement improved clarity, but introduced a minor ambiguity in terminology.",
                        "severity": "Low",
                    }
                ]
            return [
                {
                    KEY_ID: "c_nov_1",
                    "critique": "The primary assumption lacks empirical justification. Consider alternative data sources.",
                    "severity": "High",
                },
                {
                    KEY_ID: "c_nov_2",
                    "critique": "Key terminology is used ambiguously. Define all central concepts clearly.",
                    "severity": "Medium",
                },
                {
                    KEY_ID: "c_nov_3",
                    "critique": "The scope appears overly broad. Narrow the focus for better analysis.",
                    "severity": "Medium",
                },
            ]

        if adjudication_data:
            return [
                {
                    KEY_ID: "c3",
                    "critique": "Refinement addressed major issues, but introduced a minor boundary condition error.",
                    "severity": "Low",
                }
            ]
        return [
            {KEY_ID: "c1", "critique": "The core assumption lacks justification.", "severity": "High"},
            {KEY_ID: "c2", "critique": "Terminology is ambiguous.", "severity": "Medium"},
        ]


register_handler(HandlerType.GENERIC_AVL, GenericAVLHandler)

