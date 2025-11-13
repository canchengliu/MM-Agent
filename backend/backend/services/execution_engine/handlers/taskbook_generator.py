"""Handler for the taskbook generator node."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.exceptions import InvalidStateException
from backend.workflow.constants import KEY_ANALYSIS, KEY_CANDIDATES, KEY_ID, KEY_SCA_OUTPUT, KEY_SELECTED_ITEM
from backend.workflow.spec import HandlerType

from ..results import ExecutionResult
from .generic_sca import BaseSCAHandler
from .registry import register_handler


class TaskbookGeneratorHandler(BaseSCAHandler):
    async def execute(
        self,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        candidates = self._generate_taskbook_candidates()
        analysis_prompt = "Compare the generated taskbooks and highlight their trade-offs."
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
            raise InvalidStateException("Taskbook selection is required to proceed.")

        taskbook_result = dict(selected_item)
        taskbook_result[KEY_SCA_OUTPUT] = sca_wrapper
        return taskbook_result

    def _generate_taskbook_candidates(self) -> List[Dict[str, Any]]:
        task_a1 = {
            "task_id": "Task_A1",
            "task_name": "Define Objective",
            "io_interfaces": {"inputs": {"1.1.1": ["Formal Problem Restatement"]}, "outputs": ["Objective Function"]},
            "external_inputs": ["Problem Statement"],
        }
        task_a2 = {
            "task_id": "Task_A2",
            "task_name": "Solve Optimization",
            "io_interfaces": {"inputs": {"Task_A1": ["Objective Function"]}, "outputs": ["Optimal Solution"]},
            "external_inputs": ["Datasets"],
        }
        return [
            {
                KEY_ID: "OptA",
                "name": "Optimization Approach",
                "Structured Modeling Taskbook": {"tasks": [task_a1, task_a2]},
            },
            {
                KEY_ID: "OptB",
                "name": "Simulation Approach",
                "Structured Modeling Taskbook": {
                    "tasks": [
                        {"task_id": "Task_B1", "task_name": "Build Sim", "io_interfaces": {}, "external_inputs": []}
                    ]
                },
            },
        ]


register_handler(HandlerType.TASKBOOK_GENERATOR, TaskbookGeneratorHandler)

