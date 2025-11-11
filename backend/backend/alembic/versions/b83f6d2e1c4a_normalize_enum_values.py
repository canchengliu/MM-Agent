"""Normalize stored ENUM values to match application definitions.

This migration rebuilds PostgreSQL ENUM types so their labels align with the
human-readable values defined in the application layer. It also backfills
existing data to the new representations.
"""

from collections.abc import Iterable
from typing import Dict, List, Sequence, Tuple

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "b83f6d2e1c4a"
down_revision = "3a5b6c7d8e9f"
branch_labels = None
depends_on = None


EnumSpec = Dict[str, object]


ENUM_SPECS: List[EnumSpec] = [
    {
        "name": "projectstatus",
        "columns": [("projects", "status")],
        "upgrade": {
            "values": ["Configuring", "Running", "Completed"],
            "map": {
                "CONFIGURING": "Configuring",
                "RUNNING": "Running",
                "COMPLETED": "Completed",
                "Configuring": "Configuring",
                "Running": "Running",
                "Completed": "Completed",
            },
        },
        "downgrade": {
            "values": ["CONFIGURING", "RUNNING", "COMPLETED"],
            "map": {
                "Configuring": "CONFIGURING",
                "Running": "RUNNING",
                "Completed": "COMPLETED",
                "CONFIGURING": "CONFIGURING",
                "RUNNING": "RUNNING",
                "COMPLETED": "COMPLETED",
            },
        },
    },
    {
        "name": "workflowstatus",
        "columns": [("workflow_instances", "status")],
        "upgrade": {
            "values": ["Running", "Completed"],
            "map": {
                "RUNNING": "Running",
                "COMPLETED": "Completed",
                "Running": "Running",
                "Completed": "Completed",
            },
        },
        "downgrade": {
            "values": ["RUNNING", "COMPLETED"],
            "map": {
                "Running": "RUNNING",
                "Completed": "COMPLETED",
                "RUNNING": "RUNNING",
                "COMPLETED": "COMPLETED",
            },
        },
    },
    {
        "name": "nodetype",
        "columns": [("node_instances", "node_type")],
        "upgrade": {
            "values": ["Standard", "Generator"],
            "map": {
                "STANDARD": "Standard",
                "GENERATOR": "Generator",
                "Standard": "Standard",
                "Generator": "Generator",
            },
        },
        "downgrade": {
            "values": ["STANDARD", "GENERATOR"],
            "map": {
                "Standard": "STANDARD",
                "Generator": "GENERATOR",
                "STANDARD": "STANDARD",
                "GENERATOR": "GENERATOR",
            },
        },
    },
    {
        "name": "nodestatus",
        "columns": [("node_instances", "status")],
        "upgrade": {
            "values": [
                "Not Started",
                "Executing",
                "Awaiting HITL Approval",
                "Completed",
                "Failed",
            ],
            "map": {
                "NOT_STARTED": "Not Started",
                "EXECUTING": "Executing",
                "AWAITING_HITL_APPROVAL": "Awaiting HITL Approval",
                "COMPLETED": "Completed",
                "FAILED": "Failed",
                "Not Started": "Not Started",
                "Executing": "Executing",
                "Awaiting HITL Approval": "Awaiting HITL Approval",
                "Completed": "Completed",
                "Failed": "Failed",
            },
        },
        "downgrade": {
            "values": [
                "NOT_STARTED",
                "EXECUTING",
                "AWAITING_HITL_APPROVAL",
                "COMPLETED",
                "FAILED",
            ],
            "map": {
                "Not Started": "NOT_STARTED",
                "Executing": "EXECUTING",
                "Awaiting HITL Approval": "AWAITING_HITL_APPROVAL",
                "Completed": "COMPLETED",
                "Failed": "FAILED",
                "NOT_STARTED": "NOT_STARTED",
                "EXECUTING": "EXECUTING",
                "AWAITING_HITL_APPROVAL": "AWAITING_HITL_APPROVAL",
            },
        },
    },
    {
        "name": "executionstage",
        "columns": [("node_instances", "current_stage")],
        "upgrade": {
            "values": [
                "Not Started",
                "Initializing",
                "Processing",
                "Generating Outputs",
                "Awaiting Review",
                "Completed",
                "Failed",
            ],
            "map": {
                "NOT_STARTED": "Not Started",
                "INITIALIZING": "Initializing",
                "PROCESSING": "Processing",
                "GENERATING_OUTPUTS": "Generating Outputs",
                "AWAITING_REVIEW": "Awaiting Review",
                "COMPLETED": "Completed",
                "FAILED": "Failed",
                "Not Started": "Not Started",
                "Initializing": "Initializing",
                "Processing": "Processing",
                "Generating Outputs": "Generating Outputs",
                "Awaiting Review": "Awaiting Review",
                "Completed": "Completed",
                "Failed": "Failed",
            },
        },
        "downgrade": {
            "values": [
                "NOT_STARTED",
                "INITIALIZING",
                "PROCESSING",
                "GENERATING_OUTPUTS",
                "AWAITING_REVIEW",
                "COMPLETED",
                "FAILED",
            ],
            "map": {
                "Not Started": "NOT_STARTED",
                "Initializing": "INITIALIZING",
                "Processing": "PROCESSING",
                "Generating Outputs": "GENERATING_OUTPUTS",
                "Awaiting Review": "AWAITING_REVIEW",
                "Completed": "COMPLETED",
                "Failed": "FAILED",
            },
        },
    },
    {
        "name": "supportedlanguage",
        "columns": [("user_settings", "language")],
        "upgrade": {
            "values": ["en", "zh"],
            "map": {"EN": "en", "ZH": "zh", "en": "en", "zh": "zh"},
        },
        "downgrade": {
            "values": ["EN", "ZH"],
            "map": {"en": "EN", "zh": "ZH", "EN": "EN", "ZH": "ZH"},
        },
    },
    {
        "name": "interfacetheme",
        "columns": [("user_settings", "theme")],
        "upgrade": {
            "values": ["light", "dark"],
            "map": {"LIGHT": "light", "DARK": "dark", "light": "light", "dark": "dark"},
        },
        "downgrade": {
            "values": ["LIGHT", "DARK"],
            "map": {"light": "LIGHT", "dark": "DARK", "LIGHT": "LIGHT", "DARK": "DARK"},
        },
    },
    {
        "name": "hitlprofile",
        "columns": [("user_settings", "hitl_profile")],
        "upgrade": {
            "values": ["Novice", "Experienced", "Expert"],
            "map": {
                "NOVICE": "Novice",
                "EXPERIENCED": "Experienced",
                "EXPERT": "Expert",
                "Novice": "Novice",
                "Experienced": "Experienced",
                "Expert": "Expert",
            },
        },
        "downgrade": {
            "values": ["NOVICE", "EXPERIENCED", "EXPERT"],
            "map": {
                "Novice": "NOVICE",
                "Experienced": "EXPERIENCED",
                "Expert": "EXPERT",
            },
        },
    },
    {
        "name": "thinkingdepth",
        "columns": [("user_settings", "thinking_depth")],
        "upgrade": {
            "values": ["Instant", "Medium", "Heavy"],
            "map": {
                "INSTANT": "Instant",
                "MEDIUM": "Medium",
                "HEAVY": "Heavy",
                "Instant": "Instant",
                "Medium": "Medium",
                "Heavy": "Heavy",
            },
        },
        "downgrade": {
            "values": ["INSTANT", "MEDIUM", "HEAVY"],
            "map": {
                "Instant": "INSTANT",
                "Medium": "MEDIUM",
                "Heavy": "HEAVY",
            },
        },
    },
]


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return

    for spec in ENUM_SPECS:
        _redefine_enum(
            type_name=spec["name"],
            new_values=spec["upgrade"]["values"],
            columns=spec["columns"],
            value_map=spec["upgrade"]["map"],
            bind=bind,
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return

    # Apply in reverse order to avoid dependency issues.
    for spec in reversed(ENUM_SPECS):
        _redefine_enum(
            type_name=spec["name"],
            new_values=spec["downgrade"]["values"],
            columns=spec["columns"],
            value_map=spec["downgrade"]["map"],
            bind=bind,
        )


def _redefine_enum(
    *,
    type_name: str,
    new_values: Sequence[str],
    columns: Iterable[Tuple[str, str]],
    value_map: Dict[str, str],
    bind,
) -> None:
    """Rebuild a PostgreSQL ENUM type and migrate data."""

    op.execute(f"ALTER TYPE {type_name} RENAME TO {type_name}_old")
    sa.Enum(*new_values, name=type_name).create(bind, checkfirst=False)

    for table_name, column_name in columns:
        case_sql = _build_case_expression(column_name, value_map)
        op.execute(
            f"""
            ALTER TABLE {table_name}
            ALTER COLUMN "{column_name}" TYPE {type_name}
            USING ({case_sql})::{type_name}
            """
        )

    op.execute(f"DROP TYPE {type_name}_old")


def _build_case_expression(column_name: str, value_map: Dict[str, str]) -> str:
    column_expr = f'"{column_name}"'
    parts = [f"WHEN {column_expr}::text = '{old}' THEN '{new}'" for old, new in value_map.items()]
    parts.insert(0, f"WHEN {column_expr} IS NULL THEN NULL")
    parts.append(f"ELSE {column_expr}::text")
    return f"(CASE {' '.join(parts)} END)"
