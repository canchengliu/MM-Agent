"""Add stage metadata to node instances

Revision ID: c2d1e0f9ab12
Revises: b83f6d2e1c4a
Create Date: 2024-06-04 00:00:00.000000

"""
from enum import Enum

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column, select


# revision identifiers, used by Alembic.
revision = 'c2d1e0f9ab12'
down_revision = 'b83f6d2e1c4a'
branch_labels = None
depends_on = None


class _NodeType(str, Enum):
    STANDARD = "Standard"
    GENERATOR = "Generator"


class _HITLMode(str, Enum):
    VARL = "VARL"
    SCA = "SCA"
    AVL = "AVL"


KEY_STAGE_ID = "stage_id"
KEY_STAGE_NAME = "stage_name"
TERMINAL_NODE_SUFFIX = ".2.2.2"
PREVIOUS_IN_TASK = "__PREVIOUS_IN_TASK__"

WORKFLOW_DEFINITION = {
    "name": "O-Award Modeling Workflow",
    "structure": [
        {
            "id": "1.1.1",
            "name": "Problem Deconstruction and Mathematical Formulation",
            "phase": "Phase 1: Strategic Analysis & Macro Architecture",
            KEY_STAGE_ID: "1.1",
            KEY_STAGE_NAME: "Strategic Definition",
            "type": _NodeType.STANDARD,
            "hitl_mode": _HITLMode.AVL,
            "dependencies": {},
            "external_inputs": ["Problem Statement", "Datasets"],
        },
        {
            "id": "1.1.2",
            "name": "Architecture Design and Task Decomposition",
            "phase": "Phase 1: Strategic Analysis & Macro Architecture",
            KEY_STAGE_ID: "1.1",
            KEY_STAGE_NAME: "Strategic Definition",
            "type": _NodeType.GENERATOR,
            "hitl_mode": _HITLMode.SCA,
            "dependencies": {
                "1.1.1": {"required_fields": ["Formal Problem Restatement", "Global Assumption Framework"]}
            },
            "external_inputs": [],
        },
        {
            "id": "3.1.1",
            "name": "Global Logic Integration and Strategic Narrative Construction",
            "phase": "Phase 3: Global Synthesis & O-Award Paper Forging",
            KEY_STAGE_ID: "3.1",
            KEY_STAGE_NAME: "Global Logic & Narrative",
            "type": _NodeType.STANDARD,
            "hitl_mode": _HITLMode.SCA,
            "dependencies": {
                "1.1.1": {"required_fields": ["Formal Problem Restatement"]},
                "1.1.2": {"required_fields": ["Structured Modeling Taskbook"]},
            },
            "external_inputs": [],
        },
        {
            "id": "3.1.2",
            "name": "Paper Forging and Professional Optimization",
            "phase": "Phase 3: Global Synthesis & O-Award Paper Forging",
            KEY_STAGE_ID: "3.1",
            KEY_STAGE_NAME: "Global Logic & Narrative",
            "type": _NodeType.STANDARD,
            "hitl_mode": _HITLMode.VARL,
            "dependencies": {
                "3.1.1": {"required_fields": ["Thesis Statement", "Narrative Outline"]}
            },
            "external_inputs": [],
        },
    ],
}

PHASE_2_TEMPLATE = {
    ".2.1.1": {
        "stage_name_prefix": "Data & Model Generation",
        "name_prefix": "Data Insights and Candidate Model Generation",
        "type": _NodeType.STANDARD,
        "hitl_mode": _HITLMode.SCA,
        "inputs": {},
        "outputs": ["sca_output_wrapper"],
        "inherits_external_inputs": True,
    },
    ".2.1.2": {
        "stage_name_prefix": "Data & Model Generation",
        "name_prefix": "Mathematical Formulation and Computational Design",
        "type": _NodeType.STANDARD,
        "hitl_mode": _HITLMode.AVL,
        "inputs": {PREVIOUS_IN_TASK: ["sca_output_wrapper"]},
        "outputs": [
            "math_formulation",
            "execution_blueprint",
        ],
        "inherits_external_inputs": False,
    },
    ".2.2.1": {
        "stage_name_prefix": "Code & Execution",
        "name_prefix": "Code Generation and Automatic Execution",
        "type": _NodeType.STANDARD,
        "hitl_mode": _HITLMode.VARL,
        "inputs": {PREVIOUS_IN_TASK: ["execution_blueprint"]},
        "outputs": [
            "raw_results",
            "vv_data",
            "sensitivity_data",
        ],
        "inherits_external_inputs": True,
    },
    TERMINAL_NODE_SUFFIX: {
        "stage_name_prefix": "Code & Execution",
        "name_prefix": "Robustness Analysis and Strategic Visualization",
        "type": _NodeType.STANDARD,
        "hitl_mode": _HITLMode.SCA,
        "inputs": {
            PREVIOUS_IN_TASK: [
                "raw_results",
                "vv_data",
                "sensitivity_data",
            ]
        },
        "outputs": [
            "sca_output_wrapper",
            "vv_report",
            "key_output_doc",
        ],
        "inherits_external_inputs": False,
    },
}


STATIC_STAGE_MAP = {
    node_def["id"]: (
        node_def.get(KEY_STAGE_ID),
        node_def.get(KEY_STAGE_NAME),
    )
    for node_def in WORKFLOW_DEFINITION.get("structure", [])
}


def _resolve_stage_metadata(definition_id: str, node_name: str) -> tuple[str, str]:
    """Derive stage metadata for existing node instances."""
    stage_meta = STATIC_STAGE_MAP.get(definition_id)
    if stage_meta and all(stage_meta):
        return stage_meta

    for suffix, template in PHASE_2_TEMPLATE.items():
        if definition_id.endswith(suffix):
            base_id = definition_id[: -len(suffix)] or definition_id
            stage_suffix = suffix.rsplit(".", 1)[0] if "." in suffix else suffix
            stage_id = f"{base_id}{stage_suffix}"
            stage_prefix = template.get("stage_name_prefix") or template.get("name_prefix") or "Execution"
            stage_name = f"[{base_id}] {stage_prefix}"
            return stage_id, stage_name

    fallback_stage_id = definition_id.rsplit(".", 1)[0] if "." in definition_id else definition_id
    fallback_stage_id = fallback_stage_id or definition_id
    fallback_stage_name = node_name or fallback_stage_id
    return fallback_stage_id, fallback_stage_name


def _populate_stage_metadata():
    bind = op.get_bind()
    node_table = table(
        "node_instances",
        column("id", sa.Integer),
        column("definition_id", sa.String),
        column("name", sa.String),
        column("stage_id", sa.String),
        column("stage_name", sa.String),
    )
    rows = bind.execute(select(node_table.c.id, node_table.c.definition_id, node_table.c.name)).all()
    for node_id, definition_id, node_name in rows:
        stage_id, stage_name = _resolve_stage_metadata(definition_id or "", node_name or "")
        bind.execute(
            node_table.update()
            .where(node_table.c.id == node_id)
            .values(stage_id=stage_id, stage_name=stage_name)
        )


def upgrade() -> None:
    with op.batch_alter_table('node_instances', schema=None) as batch_op:
        batch_op.add_column(sa.Column('stage_id', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('stage_name', sa.String(), nullable=True))
        batch_op.create_index(batch_op.f('ix_node_instances_stage_id'), ['stage_id'], unique=False)

    _populate_stage_metadata()

    with op.batch_alter_table('node_instances', schema=None) as batch_op:
        batch_op.alter_column('stage_id', existing_type=sa.String(), nullable=False)
        batch_op.alter_column('stage_name', existing_type=sa.String(), nullable=False)


def downgrade() -> None:
    with op.batch_alter_table('node_instances', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_node_instances_stage_id'))
        batch_op.drop_column('stage_name')
        batch_op.drop_column('stage_id')
