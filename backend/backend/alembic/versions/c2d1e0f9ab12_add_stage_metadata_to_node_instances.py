"""Add stage metadata to node instances

Revision ID: c2d1e0f9ab12
Revises: b83f6d2e1c4a
Create Date: 2024-06-04 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column, select

from backend.workflow_definition import (
    KEY_STAGE_ID,
    KEY_STAGE_NAME,
    PHASE_2_TEMPLATE,
    WORKFLOW_DEFINITION,
)


# revision identifiers, used by Alembic.
revision = 'c2d1e0f9ab12'
down_revision = 'b83f6d2e1c4a'
branch_labels = None
depends_on = None


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
