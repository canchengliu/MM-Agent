"""Add execution_artifacts to NodeVersion and TemporaryExecutionResult

Revision ID: f1a2b3c4d5e6
Revises: c2d1e0f9ab12
Create Date: 2025-11-11 06:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.ext.mutable import MutableDict


# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = 'c2d1e0f9ab12'
branch_labels = None
depends_on = None


def upgrade() -> None:
    json_type = MutableDict.as_mutable(sa.JSON())

    with op.batch_alter_table('node_versions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('execution_artifacts', json_type, nullable=True))

    with op.batch_alter_table('temporary_execution_results', schema=None) as batch_op:
        batch_op.add_column(sa.Column('execution_artifacts', json_type, nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('temporary_execution_results', schema=None) as batch_op:
        batch_op.drop_column('execution_artifacts')

    with op.batch_alter_table('node_versions', schema=None) as batch_op:
        batch_op.drop_column('execution_artifacts')
