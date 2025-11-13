"""Add handler configuration columns to node instances

Revision ID: e4f5a6b7c8d9
Revises: c2d1e0f9ab12
Create Date: 2024-11-15 00:00:00.000000
"""

from enum import Enum
from typing import Any, Dict, Optional

import sqlalchemy as sa
from alembic import op
from sqlalchemy.sql import column, select, table


# revision identifiers, used by Alembic.
revision = "e4f5a6b7c8d9"
down_revision = "c2d1e0f9ab12"
branch_labels = None
depends_on = None


class _NodeType(str, Enum):
    STANDARD = "Standard"
    GENERATOR = "Generator"


class _HITLMode(str, Enum):
    VARL = "VARL"
    SCA = "SCA"
    AVL = "AVL"


class _SCASelectionMode(str, Enum):
    SINGLE = "Single"
    MULTIPLE = "Multiple"


class _HandlerType(str, Enum):
    GENERIC_SCA = "GenericSCAHandler"
    GENERIC_AVL = "GenericAVLHandler"
    GENERIC_VARL = "GenericVARLHandler"
    TASKBOOK_GENERATOR = "TaskbookGeneratorHandler"
    CODE_EXECUTION = "CodeExecutionHandler"
    NARRATIVE_SYNTHESIS = "NarrativeSynthesisHandler"
    FINAL_PAPER = "FinalPaperHandler"


handler_type_enum = sa.Enum(_HandlerType, name="handlertype")
sca_selection_mode_enum = sa.Enum(_SCASelectionMode, name="scaselectionmode")


def _value(enum_member: Optional[Enum]) -> Optional[str]:
    if enum_member is None:
        return None
    return enum_member.value


def _normalize(raw: Any) -> Optional[str]:
    if raw is None:
        return None
    if isinstance(raw, Enum):
        return raw.value
    return str(raw)


def _infer_handler_type(definition_id: str, node_type: Optional[str], hitl_mode: Optional[str]) -> _HandlerType:
    if node_type == _NodeType.GENERATOR.value:
        return _HandlerType.TASKBOOK_GENERATOR
    if definition_id == "3.1.1":
        return _HandlerType.NARRATIVE_SYNTHESIS
    if definition_id == "3.1.2":
        return _HandlerType.FINAL_PAPER
    if definition_id.endswith(".2.2.1"):
        return _HandlerType.CODE_EXECUTION
    if hitl_mode == _HITLMode.SCA.value:
        return _HandlerType.GENERIC_SCA
    if hitl_mode == _HITLMode.AVL.value:
        return _HandlerType.GENERIC_AVL
    return _HandlerType.GENERIC_VARL


def _infer_sca_mode(definition_id: str, hitl_mode: Optional[str]) -> Optional[_SCASelectionMode]:
    if hitl_mode != _HITLMode.SCA.value:
        return None
    if definition_id.endswith(".2.2.2"):
        return _SCASelectionMode.MULTIPLE
    return _SCASelectionMode.SINGLE


def _infer_export_config(handler_type: _HandlerType, definition_id: str) -> Dict[str, Any]:
    if handler_type == _HandlerType.CODE_EXECUTION:
        return {
            "handler": "code_artifacts",
            "code_keys": ["generated_code.py", "execution.log", "error.log"],
        }
    if handler_type == _HandlerType.FINAL_PAPER:
        return {
            "handler": "final_paper",
            "paper_key": "Submission-Ready Paper",
            "filename": "O-Award Paper.md",
        }
    return {"handler": "intermediate_json"}


def _backfill_behavior_columns():
    bind = op.get_bind()
    node_table = table(
        "node_instances",
        column("id", sa.Integer),
        column("definition_id", sa.String),
        column("node_type", sa.String),
        column("hitl_mode", sa.String),
    )
    rows = bind.execute(
        select(
            node_table.c.id,
            node_table.c.definition_id,
            node_table.c.node_type,
            node_table.c.hitl_mode,
        )
    ).all()

    for row in rows:
        definition_id = row.definition_id or ""
        node_type = _normalize(row.node_type)
        hitl_mode = _normalize(row.hitl_mode)
        handler_type = _infer_handler_type(definition_id, node_type, hitl_mode)
        sca_mode = _infer_sca_mode(definition_id, hitl_mode)
        export_config = _infer_export_config(handler_type, definition_id)

        bind.execute(
            node_table.update()
            .where(node_table.c.id == row.id)
            .values(
                handler_type=_value(handler_type),
                sca_selection_mode=_value(sca_mode),
                export_config=export_config,
            )
        )


def upgrade() -> None:
    bind = op.get_bind()
    handler_type_enum.create(bind, checkfirst=True)
    sca_selection_mode_enum.create(bind, checkfirst=True)

    with op.batch_alter_table("node_instances", schema=None) as batch_op:
        batch_op.add_column(sa.Column("handler_type", handler_type_enum, nullable=True))
        batch_op.add_column(sa.Column("sca_selection_mode", sca_selection_mode_enum, nullable=True))
        batch_op.add_column(sa.Column("export_config", sa.JSON(), nullable=True))

    _backfill_behavior_columns()

    with op.batch_alter_table("node_instances", schema=None) as batch_op:
        batch_op.alter_column("handler_type", existing_type=handler_type_enum, nullable=False)


def downgrade() -> None:
    bind = op.get_bind()
    with op.batch_alter_table("node_instances", schema=None) as batch_op:
        batch_op.drop_column("export_config")
        batch_op.drop_column("sca_selection_mode")
        batch_op.drop_column("handler_type")

    sca_selection_mode_enum.drop(bind, checkfirst=True)
    handler_type_enum.drop(bind, checkfirst=True)
