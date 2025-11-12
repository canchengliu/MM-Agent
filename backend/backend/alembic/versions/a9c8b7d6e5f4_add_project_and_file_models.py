"""Add Project, ProjectFile, and HistoricalProblem models

Revision ID: a9c8b7d6e5f4
Revises: d78b8a3e7d5e
Create Date: 2024-05-22 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.ext.mutable import MutableDict


# revision identifiers, used by Alembic.
revision = "a9c8b7d6e5f4"
down_revision = "d78b8a3e7d5e"
branch_labels = None
depends_on = None


project_status_enum = sa.Enum("Configuring", "Running", "Completed", name="projectstatus")
problem_type_enum = sa.Enum("A", "B", "C", "D", "E", "F", "-", name="problemtype")
file_role_enum = sa.Enum("Problem Description", "Dataset", "Reference Material", name="filerole")


def upgrade() -> None:
    problem_type_enum_for_projects = problem_type_enum.copy()

    op.create_table(
        "historical_problems",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("type", problem_type_enum, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description_path", sa.String(), nullable=False),
        sa.Column("dataset_path", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("historical_problems", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_historical_problems_id"), ["id"], unique=False)

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", project_status_enum, nullable=False),
        sa.Column("problem_type", problem_type_enum_for_projects, nullable=False),
        sa.Column("configuration_snapshot", MutableDict.as_mutable(sa.JSON()), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("historical_problem_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["historical_problem_id"], ["historical_problems.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "name", name="_user_project_name_uc"),
    )
    with op.batch_alter_table("projects", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_projects_id"), ["id"], unique=False)
        batch_op.create_index(batch_op.f("ix_projects_name"), ["name"], unique=False)
        batch_op.create_index(batch_op.f("ix_projects_user_id"), ["user_id"], unique=False)

    op.create_table(
        "project_files",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("filename", sa.String(), nullable=False),
        sa.Column("role", file_role_enum, nullable=False),
        sa.Column("storage_path", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("storage_path"),
    )
    with op.batch_alter_table("project_files", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_project_files_id"), ["id"], unique=False)
        batch_op.create_index(batch_op.f("ix_project_files_project_id"), ["project_id"], unique=False)
        batch_op.create_index(batch_op.f("ix_project_files_user_id"), ["user_id"], unique=False)

    with op.batch_alter_table("workflow_instances", schema=None) as batch_op:
        batch_op.add_column(sa.Column("project_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            batch_op.f("fk_workflow_instances_project_id"),
            "projects",
            ["project_id"],
            ["id"],
        )
        batch_op.create_unique_constraint(
            batch_op.f("uq_workflow_instances_project_id"), ["project_id"]
        )


def downgrade() -> None:
    with op.batch_alter_table("workflow_instances", schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f("uq_workflow_instances_project_id"), type_="unique")
        batch_op.drop_constraint(batch_op.f("fk_workflow_instances_project_id"), type_="foreignkey")
        batch_op.drop_column("project_id")

    with op.batch_alter_table("project_files", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_project_files_user_id"))
        batch_op.drop_index(batch_op.f("ix_project_files_project_id"))
        batch_op.drop_index(batch_op.f("ix_project_files_id"))
    op.drop_table("project_files")

    with op.batch_alter_table("projects", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_projects_user_id"))
        batch_op.drop_index(batch_op.f("ix_projects_name"))
        batch_op.drop_index(batch_op.f("ix_projects_id"))
    op.drop_table("projects")

    with op.batch_alter_table("historical_problems", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_historical_problems_id"))
    op.drop_table("historical_problems")

    file_role_enum.drop(op.get_bind(), checkfirst=False)
    project_status_enum.drop(op.get_bind(), checkfirst=False)
    problem_type_enum.drop(op.get_bind(), checkfirst=False)
