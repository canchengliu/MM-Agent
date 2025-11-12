from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from backend.models.workflow import ExecutionStage, NodeStatus, VersionSource
from backend.workflow_definition import HITLMode, NodeType


class NodeInstanceRead(BaseModel):
    id: int
    definition_id: str
    name: str
    status: NodeStatus
    current_stage: ExecutionStage
    node_type: NodeType
    hitl_mode: HITLMode
    order_index: int
    active_version_id: Optional[int]
    phase_id: str
    stage_id: str
    stage_name: str
    task_group_id: Optional[str] = None
    is_stale: bool = False

    class Config:
        from_attributes = True


class VersionData(BaseModel):
    source: VersionSource
    based_on_version_id: Optional[int]
    output_data: Optional[Dict[str, Any]]
    raw_generated_output: Optional[Dict[str, Any]]
    execution_artifacts: Optional[Dict[str, Any]]
    input_dependencies: Dict[int, int]
    hitl_history: List[Dict[str, Any]]
    llm_model_name: str
    temperature: float


class NodeVersionRead(VersionData):
    id: int
    version_number: int
    node_instance_id: int
    summary: str

    class Config:
        from_attributes = True


class TemporaryExecutionRead(BaseModel):
    output_data: Optional[Dict[str, Any]]
    execution_artifacts: Optional[Dict[str, Any]]
    accumulated_hitl_interactions: List[Dict[str, Any]]
    error_log: Optional[str]

    class Config:
        from_attributes = True


class StalenessInfo(BaseModel):
    """Detailed information about a stale dependency."""

    upstream_node_id: int
    upstream_definition_id: str
    consumed_version_id: int
    current_active_version_id: Optional[int]


class ManualEditSubmission(BaseModel):
    """Schema for submitting a manual edit to a node's output."""

    base_version_id: int
    edited_output_data: Dict[str, Any]
    summary: Optional[str] = None


class NodeDetailView(NodeInstanceRead):
    active_version: Optional[NodeVersionRead] = None
    pending_result: Optional[TemporaryExecutionRead] = None
    staleness_report: Optional[List[StalenessInfo]] = None
