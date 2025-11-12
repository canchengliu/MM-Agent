"""
SQLAlchemy Models Package.

This file provides a centralized export of all data models and their associated enums,
making them easily importable from a single location (e.g., `from backend.models import User`).
"""

# Project Models
from backend.models.project import (
    FileRole,
    HistoricalProblem,
    ProblemType,
    Project,
    ProjectFile,
    ProjectStatus,
)

# User Models
from backend.models.user import (
    HITLProfile,
    InterfaceTheme,
    SupportedLanguage,
    ThinkingDepth,
    User,
    UserSettings,
)

# Workflow Models
from backend.models.workflow import (
    ExecutionStage,
    NodeInstance,
    NodeStatus,
    NodeVersion,
    TemporaryExecutionResult,
    VersionSource,
    WorkflowInstance,
    WorkflowStatus,
)

__all__ = [
    # Project
    "Project",
    "ProjectFile",
    "HistoricalProblem",
    "ProjectStatus",
    "ProblemType",
    "FileRole",
    # User
    "User",
    "UserSettings",
    "SupportedLanguage",
    "InterfaceTheme",
    "HITLProfile",
    "ThinkingDepth",
    # Workflow
    "WorkflowInstance",
    "NodeInstance",
    "NodeVersion",
    "TemporaryExecutionResult",
    "WorkflowStatus",
    "NodeStatus",
    "ExecutionStage",
    "VersionSource",
]
