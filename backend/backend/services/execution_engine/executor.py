"""Core Node Executor: orchestrates handler dispatch for node execution."""

import asyncio
from typing import Any, Dict, List, Optional

from loguru import logger

from backend.models.workflow import NodeInstance
from backend.services.execution_engine.config_resolver import ExecutionConfig
from backend.services.execution_engine.handlers.registry import get_handler_class
from backend.services.execution_engine.llm_client import LLMClient
from backend.services.execution_engine.results import ExecutionResult
from backend.services.execution_engine.sandbox_client import SandboxClient


class NodeExecutor:
    """Executes nodes by delegating to handler implementations."""

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
            "Dispatching node execution",
            definition_id=node.definition_id,
            handler_type=node.handler_type.value,
        )

        handler_cls = get_handler_class(node.handler_type)
        handler = handler_cls(self, node)
        return await handler.execute(inputs, history, feedback, previous_output, adjudication_data)
