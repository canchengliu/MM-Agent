"""
Pydantic Schemas Package.

This file exports the primary data transfer objects (DTOs) used throughout the
application's API layer, providing a centralized point of access and a clear
public interface for the schemas module.
"""

# Auth Schemas
from backend.schemas.auth import Token, TokenData

# Common Schemas
from backend.schemas.common import PaginatedResponse, SystemInfo

# Error Schema
from backend.schemas.error import ErrorResponse

# Event Schemas
from backend.schemas.events import EventPayload, EventType

# HITL Schemas
from backend.schemas.hitl import (
    Adjudication,
    AdjudicationDecision,
    ExecutionRequest,
    HITLActionType,
    HITLSubmission,
)

# Node Schemas
from backend.schemas.node import (
    ManualEditSubmission,
    NodeDetailView,
    NodeInstanceRead,
    NodeVersionRead,
    StalenessInfo,
    TemporaryExecutionRead,
    VersionData,
)

# Project Schemas
from backend.schemas.project import (
    HistoricalInitializationRequest,
    ProjectCreate,
    ProjectDetailRead,
    ProjectFileRead,
    ProjectSummaryRead,
    ProjectUpdate,
)

# User Schemas
from backend.schemas.user import UserCreate, UserRead, UserSettingsRead, UserSettingsUpdate

# Workflow Schemas
from backend.schemas.workflow import WorkflowCreate, WorkflowInstanceRead, WorkflowUpdate

__all__ = [
    # Auth
    "Token",
    "TokenData",
    # Common
    "PaginatedResponse",
    "SystemInfo",
    # Error
    "ErrorResponse",
    # Events
    "EventType",
    "EventPayload",
    # HITL
    "HITLActionType",
    "HITLSubmission",
    "ExecutionRequest",
    "AdjudicationDecision",
    "Adjudication",
    # Node
    "NodeInstanceRead",
    "NodeDetailView",
    "NodeVersionRead",
    "TemporaryExecutionRead",
    "VersionData",
    "StalenessInfo",
    "ManualEditSubmission",
    # Project
    "ProjectCreate",
    "ProjectUpdate",
    "HistoricalInitializationRequest",
    "ProjectFileRead",
    "ProjectSummaryRead",
    "ProjectDetailRead",
    # User
    "UserCreate",
    "UserRead",
    "UserSettingsUpdate",
    "UserSettingsRead",
    # Workflow
    "WorkflowCreate",
    "WorkflowUpdate",
    "WorkflowInstanceRead",
]
