"""
Modular Execution Engine for running workflow nodes.

This package replaces the monolithic `ExecutionSimulator`. It provides a structured
and configurable approach to node execution, designed to support Bring-Your-Own-Key
(BYOK) functionality by isolating user-specific clients (LLM, Sandbox) based
on a project's configuration snapshot.
"""

from .config_resolver import ExecutionConfig, resolve_config
from .executor import NodeExecutor

__all__ = ["NodeExecutor", "ExecutionConfig", "resolve_config"]
