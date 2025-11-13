"""Shared workflow constants and keys used across the application."""

# Standardized Keys for Raw Generation
KEY_PRIMARY_ARTIFACT = "primary_artifact"
KEY_CANDIDATES = "candidates"
KEY_ANALYSIS = "comparative_analysis"
KEY_CRITIQUES = "critiques"
KEY_ID = "id"

# Standardized keys for final HITL outputs
KEY_SCA_OUTPUT = "sca_output_wrapper"
KEY_SELECTED_ITEM = "selected_item"
KEY_SELECTED_ITEMS = "selected_items"

# Stage metadata keys
KEY_STAGE_ID = "stage_id"
KEY_STAGE_NAME = "stage_name"

# Workflow structure constants
PREVIOUS_IN_TASK = "__PREVIOUS_IN_TASK__"

# Default workflow specification identifier
DEFAULT_WORKFLOW_SPEC_ID = "o_award_v1"

__all__ = [
    "DEFAULT_WORKFLOW_SPEC_ID",
    "KEY_ANALYSIS",
    "KEY_CANDIDATES",
    "KEY_CRITIQUES",
    "KEY_ID",
    "KEY_PRIMARY_ARTIFACT",
    "KEY_SCA_OUTPUT",
    "KEY_SELECTED_ITEM",
    "KEY_SELECTED_ITEMS",
    "KEY_STAGE_ID",
    "KEY_STAGE_NAME",
    "PREVIOUS_IN_TASK",
]

