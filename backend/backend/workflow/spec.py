"""Pydantic models describing declarative workflow specifications."""

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class NodeType(str, Enum):
    STANDARD = "Standard"
    GENERATOR = "Generator"


class HITLMode(str, Enum):
    VARL = "VARL"
    SCA = "SCA"
    AVL = "AVL"


class SCASelectionMode(str, Enum):
    SINGLE = "Single"
    MULTIPLE = "Multiple"


class HandlerType(str, Enum):
    GENERIC_SCA = "GenericSCAHandler"
    GENERIC_AVL = "GenericAVLHandler"
    GENERIC_VARL = "GenericVARLHandler"
    TASKBOOK_GENERATOR = "TaskbookGeneratorHandler"
    CODE_EXECUTION = "CodeExecutionHandler"
    NARRATIVE_SYNTHESIS = "NarrativeSynthesisHandler"
    FINAL_PAPER = "FinalPaperHandler"


class NodeSpec(BaseModel):
    id: str
    name: str
    phase: str
    stage_id: str
    stage_name: str
    type: NodeType
    hitl_mode: HITLMode
    dependencies: Dict[str, Dict[str, List[str]]] = Field(default_factory=dict)
    external_inputs: List[str] = Field(default_factory=list)
    task_group_id: Optional[str] = None

    handler_type: HandlerType
    sca_selection_mode: Optional[SCASelectionMode] = None
    export_config: Dict[str, Any] = Field(default_factory=dict)
    generates_task_id_from: Optional[str] = None


class DynamicTaskTemplateSpec(BaseModel):
    name_prefix: str
    stage_name_prefix: str
    type: NodeType
    hitl_mode: HITLMode
    inputs: Dict[str, List[str]] = Field(default_factory=dict)
    outputs: List[str] = Field(default_factory=list)
    inherits_external_inputs: bool = False

    handler_type: HandlerType
    sca_selection_mode: Optional[SCASelectionMode] = None
    export_config: Dict[str, Any] = Field(default_factory=dict)


class WorkflowSpec(BaseModel):
    id: str
    name: str
    structure: List[NodeSpec]
    dynamic_task_templates: Dict[str, DynamicTaskTemplateSpec] = Field(default_factory=dict)
    terminal_node_suffix: str


__all__ = [
    "DynamicTaskTemplateSpec",
    "HITLMode",
    "HandlerType",
    "NodeSpec",
    "NodeType",
    "SCASelectionMode",
    "WorkflowSpec",
]
