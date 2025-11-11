"""
Resolves and provides execution configuration from a project's snapshot.

This component's responsibility is to read the `configuration_snapshot` JSON blob
from a `Project` model. It will then provide a safe and structured interface for
the `NodeExecutor` to access the necessary credentials (API keys) and settings
for a given run.
"""

from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field, FieldValidationInfo, field_validator

from backend.config import settings
from backend.models.user import HITLProfile, ThinkingDepth


class ExecutionConfig(BaseModel):
    """
    Validated configuration derived from a project's snapshot.

    Defaults fall back to global settings so execution can proceed even when a
    project snapshot is missing or incomplete.
    """

    model_config = ConfigDict(extra="ignore")

    hitl_profile: HITLProfile = Field(default=HITLProfile.EXPERIENCED)
    thinking_depth: ThinkingDepth = Field(default=ThinkingDepth.MEDIUM)
    llm_model_name: str = Field(default_factory=lambda: settings.LLM_MODEL_NAME)
    llm_base_url: Optional[str] = Field(default_factory=lambda: settings.LLM_BASE_URL)
    llm_api_key: Optional[str] = Field(default_factory=lambda: settings.LLM_API_KEY)
    llm_provider: Optional[str] = Field(default_factory=lambda: settings.LLM_PROVIDER)
    e2b_api_key: Optional[str] = Field(default_factory=lambda: settings.E2B_API_KEY)

    @field_validator("llm_model_name", mode="before")
    @classmethod
    def _ensure_llm_model_name(cls, value: Optional[str]) -> str:
        """Treat null or empty values in snapshots as a request for the default model."""
        return cls._fallback_to_default(value, settings.LLM_MODEL_NAME)

    @field_validator("llm_base_url", "llm_api_key", "llm_provider", mode="before")
    @classmethod
    def _ensure_optional_defaults(cls, value: Optional[str], info: FieldValidationInfo) -> Optional[str]:
        defaults = {
            "llm_base_url": settings.LLM_BASE_URL,
            "llm_api_key": settings.LLM_API_KEY,
            "llm_provider": settings.LLM_PROVIDER,
        }
        return cls._fallback_to_default(value, defaults.get(info.field_name))

    @staticmethod
    def _fallback_to_default(value: Optional[str], default_value: Optional[str]) -> Optional[str]:
        if value is None:
            return default_value
        if isinstance(value, str) and not value.strip():
            return default_value
        return value


def resolve_config(project_snapshot: Optional[Dict[str, Any]]) -> ExecutionConfig:
    """
    Parse a project's configuration snapshot into a validated ExecutionConfig.

    Args:
        project_snapshot: The JSON blob stored on Project.configuration_snapshot.

    Returns:
        ExecutionConfig: ready-to-use configuration for node execution.
    """

    if not project_snapshot:
        return ExecutionConfig()

    return ExecutionConfig.model_validate(project_snapshot)
