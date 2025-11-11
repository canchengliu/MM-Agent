from typing import List, Optional

from pydantic import BaseModel

from backend.models.workflow import WorkflowStatus
from backend.schemas.node import NodeInstanceRead


class WorkflowCreate(BaseModel):
    """Payload for creating a workflow; user inferred from auth context."""

    name: str
    project_id: int


class WorkflowUpdate(BaseModel):
    """Mutable fields for workflow updates."""

    name: Optional[str] = None


class WorkflowInstanceRead(BaseModel):
    id: int
    name: str
    status: WorkflowStatus
    project_id: int
    user_id: int
    nodes: List[NodeInstanceRead]

    class Config:
        from_attributes = True
