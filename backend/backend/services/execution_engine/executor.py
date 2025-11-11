"""
Core Node Executor: Orchestrates LLM and Sandbox clients to run a node.

This contains the primary business logic for node execution, adapted from
the old `ExecutionSimulator`. It is initialized with clients (LLM, Sandbox)
that are pre-configured by the config resolver, ensuring that each execution
is isolated and uses the correct user resources.
"""

import asyncio
from typing import Any, Dict, List, Optional

from loguru import logger
from pydantic import BaseModel, Field

from backend.models.user import ThinkingDepth
from backend.models.workflow import NodeInstance
from backend.services.execution_engine.config_resolver import ExecutionConfig
from backend.services.execution_engine.llm_client import LLMClient
from backend.services.execution_engine.sandbox_client import SandboxClient
from backend.workflow_definition import (
    HITLMode,
    KEY_ANALYSIS,
    KEY_CANDIDATES,
    KEY_CRITIQUES,
    KEY_ID,
    KEY_PRIMARY_ARTIFACT,
    KEY_SCA_OUTPUT,
    KEY_SELECTED_ITEM,
)


class ExecutionResult(BaseModel):
    """Structured result from a node execution, including output and artifacts."""

    output_data: Dict[str, Any]
    artifacts: Dict[str, Any] = Field(default_factory=dict)


class NodeExecutor:
    """Simulates node execution flows using configured clients."""

    def __init__(self, config: ExecutionConfig):
        self.config = config
        self.llm_client = LLMClient(
            model_name=config.llm_model_name,
            api_key=config.llm_api_key,
            base_url=config.llm_base_url,
        )
        self.sandbox_client = SandboxClient(api_key=config.e2b_api_key)
        logger.info("NodeExecutor initialized", thinking_depth=self.config.thinking_depth.value)

    async def execute_node(
        self,
        node: NodeInstance,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        await asyncio.sleep(1.0)
        logger.info(
            "Executing node with NodeExecutor",
            definition_id=node.definition_id,
            hitl_mode=node.hitl_mode.value,
            has_feedback=feedback is not None,
            has_adjudication=adjudication_data is not None,
        )

        if node.hitl_mode == HITLMode.SCA:
            return await self._execute_sca(node, inputs, feedback)
        if node.hitl_mode == HITLMode.AVL:
            return await self._execute_avl(node, inputs, feedback, previous_output, adjudication_data)
        return await self._execute_varl(node, inputs, feedback)

    async def _execute_varl(
        self, node: NodeInstance, inputs: Dict[str, Any], feedback: Optional[str]
    ) -> ExecutionResult:
        prompt = f"Generate a VARL artifact. Feedback: {feedback}"
        llm_response = await self.llm_client.generate_text(prompt)
        artifacts: Dict[str, Any] = {"prompt": prompt}

        artifact = {
            "content": llm_response,
            "data": "Generic VARL data output",
        }
        if node.definition_id == "3.1.2":
            artifact["Submission-Ready Paper"] = llm_response
        elif node.definition_id.endswith(".2.2.1"):
            code_to_run = f"# Python code generated for {node.definition_id}\nprint('Simulated execution')"
            artifacts["generated_code.py"] = code_to_run
            sandbox_result = await self.sandbox_client.execute_code(code_to_run)
            artifacts["execution.log"] = sandbox_result.get("stdout", "")
            if sandbox_result.get("stderr"):
                artifacts["error.log"] = sandbox_result.get("stderr", "")
            artifact["raw_results"] = sandbox_result.get("results", "Simulated Raw Data")
            artifact["vv_data"] = "Simulated V&V Data from sandbox"
            artifact["sensitivity_data"] = "Simulated Sensitivity Data from sandbox"

        output_data = {KEY_PRIMARY_ARTIFACT: artifact}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)

    async def _execute_sca(
        self, node: NodeInstance, inputs: Dict[str, Any], feedback: Optional[str]
    ) -> ExecutionResult:
        output: Dict[str, Any] = {}
        base_candidates: List[Dict[str, Any]] = []

        if node.definition_id == "1.1.2":
            base_candidates = self._generate_taskbook_candidates()
        elif node.definition_id == "3.1.1":
            base_candidates = self._generate_narrative_candidates()
        elif node.definition_id.endswith(".2.2.2"):
            output["vv_report"] = f"V&V Report for {node.definition_id}"
            output["key_output_doc"] = f"Key Outputs for {node.definition_id}"
            base_candidates = [
                {KEY_ID: "V1", "name": "Visualization Plot A", "type": "Plot"},
                {KEY_ID: "V2", "name": "Visualization Table B", "type": "Table"},
                {KEY_ID: "V3", "name": "Visualization Plot C (Extra)", "type": "Plot"},
            ]
        else:  # Default case
            base_candidates = [
                {KEY_ID: "C1", "name": "Model Option A", "description": "A_data"},
                {KEY_ID: "C2", "name": "Model Option B", "description": "B_data"},
                {KEY_ID: "C3", "name": "Model Option C", "description": "C_data"},
                {KEY_ID: "C4", "name": "Model Option D", "description": "D_data"},
            ]

        # Adjust candidate count based on thinking_depth, fulfilling R7.5.
        num_candidates_map = {
            ThinkingDepth.INSTANT: 2,
            ThinkingDepth.MEDIUM: 3,
            ThinkingDepth.HEAVY: 4,
        }
        num_to_generate = num_candidates_map.get(self.config.thinking_depth, 3)

        final_candidates = base_candidates[:num_to_generate]

        if feedback:
            final_candidates.append({KEY_ID: "F1", "name": "Option based on feedback", "description": "F_data"})

        analysis_prompt = f"Provide a comparative analysis of {len(final_candidates)} candidates."
        analysis = await self.llm_client.generate_text(analysis_prompt)

        output[KEY_CANDIDATES] = final_candidates
        output[KEY_ANALYSIS] = analysis
        artifacts = {"analysis_prompt": analysis_prompt}
        return ExecutionResult(output_data=output, artifacts=artifacts)

    def _generate_narrative_candidates(self) -> List[Dict[str, Any]]:
        # Static simulation, no LLM call needed to produce the options.
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

    def _generate_taskbook_candidates(self) -> List[Dict[str, Any]]:
        # This is also static simulation
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

    async def _execute_avl(
        self,
        node: NodeInstance,
        inputs: Dict[str, Any],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        if adjudication_data or feedback:
            context = adjudication_data if adjudication_data else feedback
            previous_artifact_content = "N/A"
            if previous_output and KEY_PRIMARY_ARTIFACT in previous_output:
                previous_artifact_content = previous_output[KEY_PRIMARY_ARTIFACT].get("content", "N/A")
            prompt = f"Refine the AVL artifact with context: {context}. Previous content was: {previous_artifact_content}"
        else:
            prompt = "Generate an initial AVL Artifact."

        artifact_content = await self.llm_client.generate_text(prompt)

        artifact = {
            "content": artifact_content,
            "data": "Generic AVL data output",
        }
        if node.definition_id == "1.1.1":
            artifact["Formal Problem Restatement"] = f"Restatement: {artifact_content[:100]}..."
            artifact["Global Assumption Framework"] = "Assumptions derived from artifact..."
        elif node.definition_id.endswith(".2.1.2"):
            input_211 = None
            if node.task_group_id:
                upstream_211_id = f"{node.task_group_id}.2.1.1"
                input_211 = inputs.get(upstream_211_id)

            selected_model_name = "Unknown"
            if input_211 and KEY_SCA_OUTPUT in input_211:
                selected_item = input_211[KEY_SCA_OUTPUT].get(KEY_SELECTED_ITEM)
                if selected_item:
                    selected_model_name = selected_item.get("name", "Unknown Model")

            artifact["math_formulation"] = f"Math formulation for {selected_model_name}."
            artifact["execution_blueprint"] = f"Blueprint for {selected_model_name}."

        critiques = await self._critique(node, artifact, adjudication_data)
        output_data = {
            KEY_PRIMARY_ARTIFACT: artifact,
            KEY_CRITIQUES: critiques,
        }
        artifacts = {"generation_prompt": prompt}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)

    async def _critique(
        self,
        node: NodeInstance,
        artifact: Dict[str, Any],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> List[Dict[str, Any]]:
        # This part simulates the critique, it can remain as is.
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
