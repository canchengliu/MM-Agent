import datetime
from enum import Enum

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.ext.mutable import MutableDict, MutableList
from sqlalchemy.orm import relationship

from backend.database import Base
from backend.models.enum_utils import enum_values
from backend.workflow.spec import HandlerType, HITLMode, NodeType, SCASelectionMode


class WorkflowStatus(str, Enum):
    RUNNING = "Running"
    COMPLETED = "Completed"


class VersionSource(str, Enum):
    """(R4.3) Defines the origin of a node version."""

    AI_GENERATED = "AI_GENERATED"
    MANUALLY_EDITED = "MANUALLY_EDITED"


class WorkflowInstance(Base):
    __tablename__ = "workflow_instances"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(
        SAEnum(WorkflowStatus, name="workflowstatus", values_callable=enum_values),
        default=WorkflowStatus.RUNNING,
    )
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    # external_data_refs removed in favor of Project-based file resolution.
    # project_id and user_id are non-nullable to enforce multi-tenancy.
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    nodes = relationship(
        "NodeInstance",
        back_populates="workflow",
        cascade="all, delete-orphan",
        order_by="NodeInstance.order_index",
    )
    project = relationship("Project", back_populates="workflow_instance", uselist=False)
    # The `back_populates` assumes a 'workflows' relationship on the User model.
    user = relationship("User", back_populates="workflows")


class NodeStatus(str, Enum):
    NOT_STARTED = "Not Started"
    EXECUTING = "Executing"
    AWAITING_HITL_APPROVAL = "Awaiting HITL Approval"
    COMPLETED = "Completed"
    FAILED = "Failed"
    CANCELED = "Canceled"


class ExecutionStage(str, Enum):
    """Represents granular execution progress for nodes (R4.3)."""

    NOT_STARTED = "Not Started"
    INITIALIZING = "Initializing"
    PROCESSING = "Processing"
    GENERATING_OUTPUTS = "Generating Outputs"
    AWAITING_REVIEW = "Awaiting Review"
    COMPLETED = "Completed"
    FAILED = "Failed"
    CANCELED = "Canceled"


class NodeInstance(Base):
    __tablename__ = "node_instances"

    id = Column(Integer, primary_key=True, index=True)
    workflow_instance_id = Column(Integer, ForeignKey("workflow_instances.id"), nullable=False)
    # user_id is non-nullable and denormalized for efficient auth checks.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    definition_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    node_type = Column(SAEnum(NodeType, name="nodetype", values_callable=enum_values), nullable=False)
    hitl_mode = Column(SAEnum(HITLMode, name="hitlmode", values_callable=enum_values), nullable=False)
    handler_type = Column(
        SAEnum(HandlerType, name="handlertype", values_callable=enum_values),
        nullable=False,
    )
    sca_selection_mode = Column(
        SAEnum(SCASelectionMode, name="scaselectionmode", values_callable=enum_values),
        nullable=True,
    )
    export_config = Column(MutableDict.as_mutable(JSON), nullable=True)
    status = Column(SAEnum(NodeStatus, name="nodestatus", values_callable=enum_values), default=NodeStatus.NOT_STARTED)
    current_stage = Column(
        SAEnum(ExecutionStage, name="executionstage", values_callable=enum_values),
        default=ExecutionStage.NOT_STARTED,
    )
    order_index = Column(Integer, nullable=False)
    active_version_id = Column(Integer, ForeignKey("node_versions.id"), nullable=True)
    dependencies = Column(MutableDict.as_mutable(JSON), nullable=True)
    external_inputs = Column(MutableList.as_mutable(JSON), nullable=True)
    phase_id = Column(String, nullable=False, index=True)
    stage_id = Column(String, nullable=False, index=True)
    stage_name = Column(String, nullable=False)
    task_group_id = Column(String, nullable=True, index=True)

    workflow = relationship("WorkflowInstance", back_populates="nodes")
    # The `back_populates` assumes a 'nodes' relationship on the User model.
    user = relationship("User", back_populates="nodes")
    versions = relationship(
        "NodeVersion",
        back_populates="node_instance",
        # Use Column object for robust foreign_keys definition.
        foreign_keys="NodeVersion.node_instance_id",
        cascade="all, delete-orphan",
    )
    active_version = relationship("NodeVersion", foreign_keys=[active_version_id], post_update=True)
    temporary_result = relationship(
        "TemporaryExecutionResult",
        back_populates="node_instance",
        uselist=False,
        cascade="all, delete-orphan",
    )


class NodeVersion(Base):
    __tablename__ = "node_versions"

    id = Column(Integer, primary_key=True, index=True)
    node_instance_id = Column(Integer, ForeignKey("node_instances.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    version_number = Column(Integer, nullable=False)
    # (R4.3) Fields for tracking manual editing.
    source = Column(
        SAEnum(VersionSource, name="versionsource", values_callable=enum_values),
        nullable=False,
        default=VersionSource.AI_GENERATED,
    )
    based_on_version_id = Column(Integer, ForeignKey("node_versions.id"), nullable=True)
    output_data = Column(MutableDict.as_mutable(JSON), nullable=True)
    raw_generated_output = Column(MutableDict.as_mutable(JSON), nullable=True)
    execution_artifacts = Column(MutableDict.as_mutable(JSON), nullable=True)
    # Stores Dict[int, int] (NodeID -> VersionID); MutableDict preserves integer keys.
    input_dependencies = Column(MutableDict.as_mutable(JSON), nullable=False)
    hitl_history = Column(MutableList.as_mutable(JSON), nullable=False)
    llm_model_name = Column(String, nullable=False)
    temperature = Column(Float, nullable=False)
    summary = Column(String(512), nullable=False, default="Version created")

    node_instance = relationship("NodeInstance", back_populates="versions", foreign_keys=[node_instance_id])
    based_on_version = relationship("NodeVersion", remote_side=[id], foreign_keys=[based_on_version_id])

    __table_args__ = (UniqueConstraint("node_instance_id", "version_number", name="_node_version_uc"),)


class TemporaryExecutionResult(Base):
    __tablename__ = "temporary_execution_results"

    id = Column(Integer, primary_key=True, index=True)
    node_instance_id = Column(Integer, ForeignKey("node_instances.id"), unique=True, nullable=False)
    output_data = Column(MutableDict.as_mutable(JSON), nullable=True)
    execution_artifacts = Column(MutableDict.as_mutable(JSON), nullable=True)
    # Stores Dict[int, int] for live execution context.
    input_dependencies = Column(MutableDict.as_mutable(JSON), nullable=False)
    accumulated_hitl_interactions = Column(MutableList.as_mutable(JSON), nullable=False)
    llm_model_name = Column(String, nullable=False)
    temperature = Column(Float, nullable=False)
    error_log = Column(Text, nullable=True)

    node_instance = relationship("NodeInstance", back_populates="temporary_result")
