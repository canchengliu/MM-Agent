"""Helpers for loading workflow specifications from YAML files."""

from functools import lru_cache
from pathlib import Path

import yaml

from backend.workflow.spec import WorkflowSpec


@lru_cache(maxsize=10)
def load_workflow_spec(spec_id: str) -> WorkflowSpec:
    """Load and validate a workflow specification from disk."""
    spec_path = Path(__file__).parent.parent / "data" / "workflows" / f"{spec_id}.yaml"
    if not spec_path.exists():
        raise FileNotFoundError(f"Workflow specification '{spec_id}' not found at {spec_path}")

    with spec_path.open("r", encoding="utf-8") as spec_file:
        data = yaml.safe_load(spec_file)

    return WorkflowSpec.model_validate(data)


__all__ = ["load_workflow_spec"]

