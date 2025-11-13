"""Workflow specification package."""

from .constants import DEFAULT_WORKFLOW_SPEC_ID
from .loader import load_workflow_spec

__all__ = ["DEFAULT_WORKFLOW_SPEC_ID", "load_workflow_spec"]

