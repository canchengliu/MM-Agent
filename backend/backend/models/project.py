import datetime
from enum import Enum

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import relationship

from backend.database import Base
from backend.models.enum_utils import enum_values


class ProjectStatus(str, Enum):
    """Defines the lifecycle status of a Project (R2.3)."""

    CONFIGURING = "Configuring"
    RUNNING = "Running"
    COMPLETED = "Completed"


class ProblemType(str, Enum):
    """Defines the competition problem type classification (R3.4)."""

    A = "A"
    B = "B"
    C = "C"
    D = "D"
    E = "E"
    F = "F"
    UNKNOWN = "-"


class FileRole(str, Enum):
    """Defines the role of an uploaded file within a project (R3.2.2)."""

    PROBLEM_DESCRIPTION = "Problem Description"
    DATASET = "Dataset"
    REFERENCE_MATERIAL = "Reference Material"


class Project(Base):
    """
    Project model, the central organizational unit for a modeling task.
    Belongs to a User and contains all related assets and configurations.
    """

    __tablename__ = "projects"
    __table_args__ = (UniqueConstraint("user_id", "name", name="_user_project_name_uc"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(
        SAEnum(ProjectStatus, name="projectstatus", values_callable=enum_values),
        default=ProjectStatus.CONFIGURING,
        nullable=False,
    )
    problem_type = Column(
        SAEnum(ProblemType, name="problemtype", values_callable=enum_values),
        default=ProblemType.UNKNOWN,
        nullable=False,
    )

    # A JSON blob storing the decrypted UserSettings snapshot at the time of workflow
    # start, ensuring reproducible executions with user-specific keys (BYOK) (R7.3).
    configuration_snapshot = Column(MutableDict.as_mutable(JSON), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    historical_problem_id = Column(Integer, ForeignKey("historical_problems.id"), nullable=True)

    user = relationship("User", back_populates="projects")
    historical_problem = relationship("HistoricalProblem")
    files = relationship("ProjectFile", back_populates="project", cascade="all, delete-orphan")
    workflow_instance = relationship(
        "WorkflowInstance", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name='{self.name}', user_id={self.user_id})>"

    @property
    def workflow_instance_id(self) -> int | None:
        """
        Expose the associated workflow id for Pydantic serializers.

        The schema expects this attribute even though the database keeps the
        one-to-one relation on the WorkflowInstance side.
        """
        if self.workflow_instance:
            return self.workflow_instance.id
        return None


class ProjectFile(Base):
    """
    Tracks uploaded files associated with a project (R3.2).
    """

    __tablename__ = "project_files"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)

    # user_id is denormalized here for faster, direct authorization checks on files,
    # avoiding a join with the projects table for simple ownership verification (R1.4).
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    filename = Column(String, nullable=False)
    role = Column(SAEnum(FileRole, name="filerole", values_callable=enum_values), nullable=False)
    storage_path = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="files")
    user = relationship("User")

    def __repr__(self) -> str:
        return f"<ProjectFile(id={self.id}, filename='{self.filename}', project_id={self.project_id})>"


class HistoricalProblem(Base):
    """
    Catalogs past competition problems for quick project initialization (R3.3).
    This is a read-only lookup table for the application.
    """

    __tablename__ = "historical_problems"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    type = Column(SAEnum(ProblemType, name="problemtype", values_callable=enum_values), nullable=False)
    name = Column(String, nullable=False)
    description_path = Column(String, nullable=False)
    dataset_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self) -> str:
        return f"<HistoricalProblem(id={self.id}, name='{self.name}', year={self.year})>"
