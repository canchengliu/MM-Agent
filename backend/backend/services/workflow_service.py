from collections import OrderedDict
from typing import Any, Dict, List, Optional, Set

from loguru import logger
from sqlalchemy.orm import Session, joinedload

from backend.exceptions import ForbiddenException, InvalidStateException, NotFoundException
from backend.models.project import Project
from backend.models.user import User
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, WorkflowInstance, WorkflowStatus
from backend.schemas.common import PaginatedResponse
from backend.schemas.events import EventType
from backend.schemas.node import NodeInstanceRead, StalenessInfo
from backend.schemas.workflow import (
    PhaseRead,
    StageRead,
    WorkflowCreate,
    WorkflowInstanceRead,
    WorkflowUpdate,
)
from backend.utils.event_utils import broadcast_event
from backend.workflow_definition import (
    KEY_STAGE_ID,
    KEY_STAGE_NAME,
    PHASE_2_TEMPLATE,
    PREVIOUS_IN_TASK,
    TERMINAL_NODE_SUFFIX,
    WORKFLOW_DEFINITION,
    NodeType,
)


def _merge_dependencies(
    base_deps: Optional[Dict[str, Dict[str, List[str]]]],
    overlay_deps: Optional[Dict[str, List[str]]],
) -> Dict[str, Dict[str, List[str]]]:
    """
    Merge overlay dependencies into the base dependencies while keeping required_fields unique.
    """
    merged: Dict[str, Dict[str, List[str]]] = {}
    if base_deps:
        for upstream_id, metadata in base_deps.items():
            fields = metadata.get("required_fields", [])
            merged[upstream_id] = {"required_fields": list(fields)}

    if not overlay_deps:
        return merged

    for upstream_id, required_fields_list in overlay_deps.items():
        if not isinstance(required_fields_list, list):
            logger.warning(
                "Skipping malformed dependency requirement",
                upstream_id=upstream_id,
                field_type=type(required_fields_list),
            )
            continue

        existing_fields = set(merged.get(upstream_id, {}).get("required_fields", []))
        existing_fields.update(required_fields_list)
        merged[upstream_id] = {"required_fields": sorted(existing_fields)}

    return merged


class WorkflowService:
    def __init__(self, db: Session):
        self.db = db

    def _get_workflow_for_user(self, workflow_id: int, user: User) -> WorkflowInstance:
        """Retrieve a workflow and enforce ownership."""
        workflow = self.db.query(WorkflowInstance).get(workflow_id)
        if not workflow:
            raise NotFoundException(f"WorkflowInstance {workflow_id} not found.")
        if workflow.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this workflow.")
        return workflow

    def _calculate_staleness_flags(self, workflow: WorkflowInstance) -> Dict[int, bool]:
        """Calculates the boolean staleness flag for all nodes in the workflow."""
        if not workflow.nodes:
            return {}

        nodes = workflow.nodes
        active_version_map: Dict[int, Optional[int]] = {node.id: node.active_version_id for node in nodes}
        staleness_flags: Dict[int, bool] = {}

        for node in nodes:
            is_stale = False
            if node.status == NodeStatus.COMPLETED and node.active_version:
                input_dependencies = node.active_version.input_dependencies or {}
                for upstream_node_id, consumed_version_id in input_dependencies.items():
                    current_active_version_id = active_version_map.get(upstream_node_id)
                    if current_active_version_id != consumed_version_id:
                        is_stale = True
                        break
            staleness_flags[node.id] = is_stale

        return staleness_flags

    def _build_hierarchical_phases(
        self, nodes: List[NodeInstance], staleness_flags: Dict[int, bool]
    ) -> List[PhaseRead]:
        """Convert node instances into a Phase -> Stage -> Node hierarchy."""
        phases: "OrderedDict[str, PhaseRead]" = OrderedDict()
        sorted_nodes = sorted(nodes or [], key=lambda n: n.order_index)

        for node in sorted_nodes:
            phase_name = node.phase_id
            if phase_name not in phases:
                phases[phase_name] = PhaseRead(name=phase_name, stages=[])
            phase = phases[phase_name]

            stage = next((s for s in phase.stages if s.id == node.stage_id), None)
            if not stage:
                stage = StageRead(id=node.stage_id, name=node.stage_name, nodes=[])
                phase.stages.append(stage)

            node_read = NodeInstanceRead.model_validate(node)
            node_read.is_stale = staleness_flags.get(node.id, False)
            stage.nodes.append(node_read)

        return list(phases.values())

    def _serialize_workflow(self, workflow: WorkflowInstance) -> WorkflowInstanceRead:
        """Build a WorkflowInstanceRead with hierarchical phase data."""
        if not workflow.nodes:
            self.db.refresh(workflow, ["nodes"])
        staleness_flags = self._calculate_staleness_flags(workflow)
        hierarchical_phases = self._build_hierarchical_phases(workflow.nodes or [], staleness_flags)
        return WorkflowInstanceRead(
            id=workflow.id,
            name=workflow.name,
            status=workflow.status,
            project_id=workflow.project_id,
            user_id=workflow.user_id,
            phases=hierarchical_phases,
        )

    def get_workflows_paginated(
        self, user: User, skip: int, limit: int
    ) -> PaginatedResponse[WorkflowInstanceRead]:
        """Return a user's workflows ordered by creation date with pagination and staleness info."""
        query = self.db.query(WorkflowInstance).filter(WorkflowInstance.user_id == user.id)
        total = query.count()
        workflows = (
            query.options(joinedload(WorkflowInstance.nodes).joinedload(NodeInstance.active_version))
            .order_by(WorkflowInstance.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        serialized_items = [self._serialize_workflow(workflow) for workflow in workflows]
        return PaginatedResponse(total=total, items=serialized_items)

    def get_workflow_instance(self, workflow_id: int, user: User) -> WorkflowInstanceRead:
        """Get a workflow instance with ownership check and staleness calculation."""
        workflow = (
            self.db.query(WorkflowInstance)
            .options(joinedload(WorkflowInstance.nodes).joinedload(NodeInstance.active_version))
            .get(workflow_id)
        )
        if not workflow:
            raise NotFoundException(f"WorkflowInstance {workflow_id} not found.")
        if workflow.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this workflow.")

        return self._serialize_workflow(workflow)

    def create_workflow(self, create_data: WorkflowCreate, user: User) -> WorkflowInstance:
        project = self.db.query(Project).get(create_data.project_id)
        if not project:
            raise NotFoundException(f"Project {create_data.project_id} not found.")
        if project.user_id != user.id:
            raise ForbiddenException("You do not have permission to modify this project.")
        if project.workflow_instance:
            raise InvalidStateException("A workflow already exists for this project.")

        workflow = WorkflowInstance(
            name=create_data.name,
            project_id=project.id,
            user_id=user.id,
        )
        self.db.add(workflow)
        self.db.flush()
        self._initialize_nodes(workflow)
        self.db.commit()
        self.db.refresh(workflow)
        return workflow

    def update_workflow(
        self, workflow_id: int, update_data: WorkflowUpdate, user: User
    ) -> WorkflowInstance:
        """Update mutable workflow fields."""
        workflow = self._get_workflow_for_user(workflow_id, user)
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(workflow, key, value)
        self.db.commit()
        self.db.refresh(workflow)
        return workflow

    def delete_workflow(self, workflow_id: int, user: User) -> None:
        """Delete a workflow and all related nodes/versions."""
        workflow = self._get_workflow_for_user(workflow_id, user)
        self.db.delete(workflow)
        self.db.commit()
        logger.info("Deleted workflow and associated data", workflow_id=workflow_id)

    def _initialize_nodes(self, workflow: WorkflowInstance):
        order_index = 0
        for node_def in WORKFLOW_DEFINITION["structure"]:
            stage_id = node_def.get(KEY_STAGE_ID)
            stage_name = node_def.get(KEY_STAGE_NAME)
            if not stage_id:
                stage_id = node_def["id"].rsplit(".", 1)[0]
            if not stage_name:
                stage_name = node_def["name"]
            node = NodeInstance(
                workflow_instance_id=workflow.id,
                user_id=workflow.user_id,
                definition_id=node_def["id"],
                name=node_def["name"],
                node_type=node_def["type"],
                hitl_mode=node_def["hitl_mode"],
                dependencies=node_def.get("dependencies", {}),
                external_inputs=node_def.get("external_inputs", []),
                order_index=order_index,
                phase_id=node_def["phase"],
                stage_id=stage_id,
                stage_name=stage_name,
                task_group_id=node_def.get("task_group_id"),
                current_stage=ExecutionStage.NOT_STARTED,
            )
            self.db.add(node)
            order_index += 1

    async def start_workflow(self, workflow_id: int, user: User) -> NodeInstance:
        """Starts or resumes a workflow, with an ownership check."""
        from backend.services.node_service import NodeService
        workflow = self._get_workflow_for_user(workflow_id, user)
        first_node = (
            self.db.query(NodeInstance)
            .filter_by(workflow_instance_id=workflow_id, order_index=0)
            .first()
        )
        if not first_node:
            raise InvalidStateException("Workflow has no nodes.")
        if first_node.status != NodeStatus.NOT_STARTED:
            if first_node.status != NodeStatus.FAILED or first_node.active_version_id is not None:
                raise InvalidStateException("Workflow has already been started.")
        if workflow.status != WorkflowStatus.RUNNING:
            workflow.status = WorkflowStatus.RUNNING
            self.db.commit()
            await self._broadcast_workflow_update(self.get_workflow_instance(workflow_id, user))

        node_service = NodeService(self.db)
        return await node_service.enqueue_initial_execution(first_node.id, user)

    def get_next_node(self, current_node: NodeInstance) -> Optional[NodeInstance]:
        return (
            self.db.query(NodeInstance)
            .filter_by(
                workflow_instance_id=current_node.workflow_instance_id,
                order_index=current_node.order_index + 1,
            )
            .first()
        )

    def handle_generator_node_completion(self, node: NodeInstance, output: Dict[str, Any]) -> bool:
        """
        Handles dynamic task generation for Generator nodes while relying on the caller's transaction.
        Returns True if the workflow structure changed, False otherwise.
        """
        if node.node_type != NodeType.GENERATOR:
            return False

        taskbook_data = output.get("Structured Modeling Taskbook", {})
        taskbook = taskbook_data.get("tasks")
        if not taskbook:
            logger.warning(
                "Generator node completed without a valid 'Structured Modeling Taskbook'. No dynamic nodes created.",
                node_id=node.id,
            )
            return False

        insertion_index = node.order_index + 1
        total_nodes_to_insert = len(taskbook) * len(PHASE_2_TEMPLATE)
        self._shift_subsequent_nodes(node.workflow_instance_id, insertion_index, total_nodes_to_insert)
        new_phase2_nodes = self._insert_dynamic_tasks(node.workflow_instance_id, insertion_index, taskbook)
        self._update_phase3_dependencies(node.workflow_instance_id, new_phase2_nodes)
        self.db.flush()

        return True

    def _shift_subsequent_nodes(self, workflow_id: int, start_index: int, shift_amount: int):
        (
            self.db.query(NodeInstance)
            .filter(NodeInstance.workflow_instance_id == workflow_id, NodeInstance.order_index >= start_index)
            .update({NodeInstance.order_index: NodeInstance.order_index + shift_amount}, synchronize_session=False)
        )

    def _insert_dynamic_tasks(
        self,
        workflow_id: int,
        start_index: int,
        taskbook: List[Dict[str, Any]],
    ) -> List[NodeInstance]:
        workflow = self.db.query(WorkflowInstance).get(workflow_id)
        if not workflow:
            raise NotFoundException(f"WorkflowInstance {workflow_id} not found during dynamic task insertion.")

        current_index = start_index
        all_new_nodes: List[NodeInstance] = []
        phase_2_name = "Phase 2: Cyclic Sub-problem Execution"
        defined_task_ids: Set[str] = {task["task_id"] for task in taskbook}

        for task in taskbook:
            task_id = task["task_id"]
            io_interfaces = task.get("io_interfaces", {})
            raw_task_specific_inputs = io_interfaces.get("inputs") or {}
            task_external_inputs = task.get("external_inputs") or []
            previous_node_in_task_def_id: Optional[str] = None
            resolved_task_specific_inputs: Dict[str, List[str]] = {}

            for upstream_id, required_fields in raw_task_specific_inputs.items():
                fields_list = required_fields if isinstance(required_fields, list) else [required_fields]

                if upstream_id in defined_task_ids:
                    resolved_id = f"{upstream_id}{TERMINAL_NODE_SUFFIX}"
                    resolved_task_specific_inputs[resolved_id] = list(fields_list)
                else:
                    resolved_task_specific_inputs[upstream_id] = list(fields_list)

            for id_suffix, template in PHASE_2_TEMPLATE.items():
                definition_id = f"{task_id}{id_suffix}"
                name = f"[{task_id}] {template['name_prefix']}"
                stage_suffix = id_suffix.rsplit(".", 1)[0] if "." in id_suffix else id_suffix
                stage_id = f"{task_id}{stage_suffix}"
                stage_name_prefix = template.get("stage_name_prefix") or "Execution"
                stage_name = f"[{task_id}] {stage_name_prefix}"
                dependencies = {
                    "1.1.1": {"required_fields": ["Formal Problem Restatement"]},
                    "1.1.2": {"required_fields": ["Structured Modeling Taskbook"]},
                }

                dependencies = _merge_dependencies(dependencies, resolved_task_specific_inputs)

                template_inputs = template.get("inputs", {})
                intra_task_deps: Dict[str, List[str]] = {}
                for upstream_def_id, required_fields in template_inputs.items():
                    fields_list = list(required_fields)
                    if upstream_def_id == PREVIOUS_IN_TASK:
                        if previous_node_in_task_def_id:
                            intra_task_deps[previous_node_in_task_def_id] = fields_list
                    else:
                        intra_task_deps[upstream_def_id] = fields_list

                dependencies = _merge_dependencies(dependencies, intra_task_deps)

                node_external_inputs: List[str] = []
                if template.get("inherits_external_inputs"):
                    node_external_inputs = list(task_external_inputs)

                new_node = NodeInstance(
                    workflow_instance_id=workflow_id,
                    user_id=workflow.user_id,
                    definition_id=definition_id,
                    name=name,
                    node_type=template["type"],
                    hitl_mode=template["hitl_mode"],
                    dependencies=dependencies,
                    external_inputs=node_external_inputs,
                    order_index=current_index,
                    phase_id=phase_2_name,
                    stage_id=stage_id,
                    stage_name=stage_name,
                    task_group_id=task_id,
                    current_stage=ExecutionStage.NOT_STARTED,
                )
                self.db.add(new_node)
                all_new_nodes.append(new_node)
                current_index += 1
                previous_node_in_task_def_id = definition_id

        self.db.flush()
        return all_new_nodes

    def _update_phase3_dependencies(self, workflow_id: int, phase2_nodes: List[NodeInstance]):
        """Ensure node 3.1.1 depends on outputs from each Phase 2 robustness node."""
        node_311 = (
            self.db.query(NodeInstance)
            .filter_by(workflow_instance_id=workflow_id, definition_id="3.1.1")
            .first()
        )
        if not node_311:
            return
        current_deps = node_311.dependencies or {}
        new_deps_to_merge: Dict[str, List[str]] = {}
        terminal_template = PHASE_2_TEMPLATE.get(TERMINAL_NODE_SUFFIX)
        if not terminal_template:
            logger.error(
                "Terminal node template not found in PHASE_2_TEMPLATE",
                terminal_suffix=TERMINAL_NODE_SUFFIX,
            )
            return

        for p2_node in phase2_nodes:
            if p2_node.definition_id.endswith(TERMINAL_NODE_SUFFIX):
                required_fields = list(terminal_template.get("outputs", []))
                new_deps_to_merge[p2_node.definition_id] = required_fields

        node_311.dependencies = _merge_dependencies(current_deps, new_deps_to_merge)

    def complete_workflow(self, workflow_id: int, user: User):
        """Marks a workflow as completed, with an ownership check."""
        workflow = self._get_workflow_for_user(workflow_id, user)
        workflow.status = WorkflowStatus.COMPLETED
        self.db.flush()

    def calculate_bulk_staleness(self, workflow_id: int, user: User) -> Dict[int, List[StalenessInfo]]:
        """Returns detailed staleness reports for all workflow nodes, with an ownership check."""

        self._get_workflow_for_user(workflow_id, user)
        nodes = (
            self.db.query(NodeInstance)
            .filter(NodeInstance.workflow_instance_id == workflow_id)
            .options(joinedload(NodeInstance.active_version))
            .all()
        )

        active_version_map: Dict[int, Optional[int]] = {node.id: node.active_version_id for node in nodes}
        definition_id_map: Dict[int, str] = {node.id: node.definition_id for node in nodes}

        bulk_report: Dict[int, List[StalenessInfo]] = {}
        for node in nodes:
            if node.status == NodeStatus.COMPLETED and node.active_version:
                input_dependencies = node.active_version.input_dependencies or {}
                node_staleness: List[StalenessInfo] = []

                for upstream_node_id, consumed_version_id in input_dependencies.items():
                    current_active_version_id = active_version_map.get(upstream_node_id)
                    if current_active_version_id != consumed_version_id:
                        node_staleness.append(
                            StalenessInfo(
                                upstream_node_id=upstream_node_id,
                                upstream_definition_id=definition_id_map.get(upstream_node_id, "N/A"),
                                consumed_version_id=consumed_version_id,
                                current_active_version_id=current_active_version_id,
                            )
                        )

                if node_staleness:
                    bulk_report[node.id] = node_staleness

        return bulk_report

    async def broadcast_structure_update(self, workflow_id: int):
        await self._broadcast_structure_update(workflow_id)

    async def _broadcast_structure_update(self, workflow_id: int):
        workflow = (
            self.db.query(WorkflowInstance)
            .options(joinedload(WorkflowInstance.nodes).joinedload(NodeInstance.active_version))
            .get(workflow_id)
        )
        if workflow:
            workflow_data = self._serialize_workflow(workflow).model_dump(mode="json")
            await broadcast_event(workflow_id, EventType.WORKFLOW_STRUCTURE_UPDATED, workflow_data)

    async def _broadcast_workflow_update(self, workflow_data: WorkflowInstanceRead | WorkflowInstance):
        if isinstance(workflow_data, WorkflowInstance):
            workflow_id = workflow_data.id
            workflow_obj = (
                self.db.query(WorkflowInstance)
                .options(joinedload(WorkflowInstance.nodes).joinedload(NodeInstance.active_version))
                .get(workflow_id)
            )
            if not workflow_obj:
                logger.warning("Workflow {} not found for broadcast.", workflow_id)
                return
            serialized_data = self._serialize_workflow(workflow_obj).model_dump(mode="json")
        else:
            serialized_data = workflow_data.model_dump(mode="json")
            workflow_id = workflow_data.id

        await broadcast_event(workflow_id, EventType.WORKFLOW_STATUS_UPDATED, serialized_data)
