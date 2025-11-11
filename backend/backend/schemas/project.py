"""Pydantic schemas for project-related API operations."""

import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from backend.models.project import FileRole, ProblemType, ProjectStatus


class ProjectBase(BaseModel):
    """Shared base attributes for project operations."""

    name: str
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        """Ensure project names are non-empty after trimming whitespace."""
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Project name cannot be empty.")
        return cleaned


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating mutable project fields. Forbids extra fields."""

    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = None
    description: Optional[str] = None
    problem_type: Optional[ProblemType] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        """Validate name for update operations, allowing it to be omitted."""
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Project name cannot be empty.")
        return cleaned


class HistoricalInitializationRequest(BaseModel):
    """Schema for requesting project initialization from the historical library."""

    historical_problem_id: int


class ProjectFileRead(BaseModel):
    """Schema for reading project file data."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    role: FileRole
    created_at: datetime.datetime


class ProjectSummaryRead(BaseModel):
    """A lightweight schema for listing projects on a dashboard."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    status: ProjectStatus
    problem_type: ProblemType
    created_at: datetime.datetime
    updated_at: datetime.datetime
    workflow_instance_id: Optional[int] = None


class ProjectDetailRead(ProjectSummaryRead):
    """A detailed schema for a single project view, including files and description."""

    model_config = ConfigDict(from_attributes=True)

    description: Optional[str] = None
    files: List[ProjectFileRead] = Field(default_factory=list)
    historical_problem_id: Optional[int] = None
