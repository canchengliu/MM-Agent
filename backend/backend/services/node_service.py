import datetime
import traceback
from collections import defaultdict
from typing import Any, Callable, Dict, List, Optional, Tuple

from arq.jobs import Job, JobStatus
from loguru import logger
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from backend.config import settings
from backend.exceptions import (
    DependencyException,
    ForbiddenException,
    InvalidStateException,
    NotFoundException,
    WorkflowException,
)
from backend.models.project import FileRole, ProjectFile
from backend.models.user import User
from backend.models.workflow import (
    ExecutionStage,
    NodeInstance,
    NodeStatus,
    NodeVersion,
    TemporaryExecutionResult,
    VersionSource,
    WorkflowInstance,
)
from backend.redis import get_redis_pool
from backend.schemas.events import EventType
from backend.schemas.node import (
    ManualEditSubmission,
    NodeDetailView,
    NodeInstanceRead,
    NodeVersionRead,
    StalenessInfo,
    TemporaryExecutionRead,
)
from backend.services.execution_engine.config_resolver import resolve_config
from backend.services.execution_engine.executor import NodeExecutor
from backend.services.execution_engine.results import ExecutionResult
from backend.services.storage_service import storage_service
from backend.task_names import TASK_EXECUTE_NODE
from backend.utils.event_utils import broadcast_event
from backend.workflow.spec import HITLMode, NodeType


_INPUT_KEY_TO_ROLE_MAP = {
    "Problem Statement": FileRole.PROBLEM_DESCRIPTION,
    "Datasets": FileRole.DATASET,
    "Reference Material": FileRole.REFERENCE_MATERIAL,
}


class NodeService:
    def __init__(self, db: Session):
        self.db = db

    def get_node_instance(self, node_id: int, user: Optional[User] = None) -> NodeInstance:
        """
        Get a node instance, with an optional ownership check.
        If a user is provided, enforces that the user owns the node.
        """
        node = self.db.query(NodeInstance).get(node_id)
        if not node:
            raise NotFoundException(f"NodeInstance with id {node_id} not found.")
        if user and node.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this node.")
        return node

    async def _enqueue_job(self, node: NodeInstance, **kwargs) -> Job:
        """Internal helper to enqueue a worker job. Assumes DB state is updated and committed."""
        redis = await get_redis_pool()
        node_id = node.id
        job_key = f"executing_node:{node_id}"

        try:
            job = await redis.enqueue_job(TASK_EXECUTE_NODE, node_id=node_id, _job_id=job_key, **kwargs)
            logger.info(
                "Enqueued job {job_id} (Key: {job_key}) for node {node_id}",
                job_id=job.job_id,
                job_key=job_key,
                node_id=node_id,
            )
            return job
        except Exception as exc:
            logger.error(
                "Failed to enqueue job for node {node_id}. Job might already be running or queue unavailable.",
                node_id=node_id,
                error=str(exc),
            )
            raise InvalidStateException(
                f"Failed to start execution for node {node_id}. An execution might already be in progress or the queue is unavailable."
            ) from exc

    async def _prepare_and_enqueue(
        self,
        node: NodeInstance,
        validation_func: Callable[
            [NodeInstance, Optional[str], bool, Optional[int], Optional[List[Dict[str, Any]]]],
            None,
        ],
        user_feedback: Optional[str],
        is_retry_from_hitl: bool,
        base_version_id: Optional[int],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> NodeInstance:
        """Centralized logic for validation, status updates, broadcasting, and enqueueing."""
        previous_status_enum = node.status
        previous_stage = node.current_stage
        previous_status_value = node.status.value

        validation_func(node, user_feedback, is_retry_from_hitl, base_version_id, adjudication_data)

        status_changed = False
        if node.status != NodeStatus.EXECUTING:
            try:
                node.status = NodeStatus.EXECUTING
                node.current_stage = ExecutionStage.INITIALIZING
                self.db.commit()
                self.db.refresh(node)
                status_changed = True
                await self._broadcast_node_update(node)
            except Exception:
                self.db.rollback()
                logger.exception("Failed to update node status to EXECUTING before enqueueing.", node_id=node.id)
                raise InvalidStateException("Failed to prepare node for execution due to database error.")

        try:
            await self._enqueue_job(
                node,
                user_feedback=user_feedback,
                is_retry_from_hitl=is_retry_from_hitl,
                base_version_id=base_version_id,
                adjudication_data=adjudication_data,
                previous_status=previous_status_value,
            )
        except InvalidStateException:
            if status_changed:
                logger.warning("Reverting node status due to enqueue failure.", node_id=node.id)
                try:
                    self.db.refresh(node)
                    if node.status == NodeStatus.EXECUTING:
                        node.status = previous_status_enum
                        node.current_stage = previous_stage
                        self.db.commit()
                        await self._broadcast_node_update(node)
                    else:
                        logger.info(
                            "Node status changed concurrently, skipping reversion.",
                            node_id=node.id,
                            current_status=node.status.value,
                        )
                except Exception:
                    logger.exception(
                        "CRITICAL: Failed to revert node status after enqueue failure. DB state may be inconsistent.",
                        node_id=node.id,
                    )
            raise
        return node

    async def enqueue_initial_execution(self, node_id: int, user: User) -> NodeInstance:
        """Start the first execution for a not-started node, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.NOT_STARTED:
            raise InvalidStateException(
                "Initial execution is only allowed for nodes that have not started.",
                details={"node_id": node.id, "current_status": node.status.value},
            )
        return await self._prepare_and_enqueue(
            node,
            self._validate_execution_request,
            None,
            False,
            None,
            None,
        )

    async def enqueue_re_execution(
        self,
        node_id: int,
        user: User,
        user_feedback: Optional[str] = None,
        base_version_id: Optional[int] = None,
    ) -> NodeInstance:
        """Re-run a completed node, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.COMPLETED:
            raise InvalidStateException(
                f"Node must be 'Completed' to re-execute; current status is '{node.status.value}'.",
                details={"node_id": node.id, "current_status": node.status.value},
            )
        return await self._prepare_and_enqueue(
            node,
            self._validate_execution_request,
            user_feedback,
            False,
            base_version_id,
            None,
        )

    async def enqueue_retry(
        self, node_id: int, user: User, user_feedback: Optional[str] = None
    ) -> NodeInstance:
        """Retry a failed or canceled node, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status not in [NodeStatus.FAILED, NodeStatus.CANCELED]:
            raise InvalidStateException(
                f"Node must be 'Failed' or 'Canceled' to retry; current status is '{node.status.value}'.",
                details={"node_id": node.id, "current_status": node.status.value},
            )
        return await self._prepare_and_enqueue(
            node,
            self._validate_execution_request,
            user_feedback,
            False,
            None,
            None,
        )

    async def enqueue_hitl_action(
        self,
        node_id: int,
        user: User,
        user_feedback: Optional[str] = None,
        adjudication_data: Optional[List[Dict[str, Any]]] = None,
    ) -> NodeInstance:
        """Enqueue a HITL action, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.AWAITING_HITL_APPROVAL:
            raise InvalidStateException(f"Cannot enqueue HITL action for node in status {node.status}")

        is_retry = bool(user_feedback)
        return await self._prepare_and_enqueue(
            node,
            self._validate_execution_request,
            user_feedback,
            is_retry,
            None,
            adjudication_data,
        )

    async def cancel_execution(self, node_id: int, user: User) -> Dict[str, str]:
        """Attempt to cancel an ongoing execution for a node."""
        node = self.get_node_instance(node_id, user=user)

        if node.status != NodeStatus.EXECUTING:
            raise InvalidStateException(f"Node is not currently executing. Status: {node.status.value}")

        redis = await get_redis_pool()
        job_key = f"executing_node:{node_id}"
        job = Job(job_key, redis)

        try:
            aborted = await job.abort()
            if aborted:
                logger.info("Cancellation signal sent for job {job_key}", job_key=job_key)
                return {"message": "Cancellation request sent. The node will transition to 'Canceled' shortly."}

            job_status = await job.status()
            if job_status == JobStatus.not_found:
                logger.warning("Job {job_key} not found in Redis during cancellation attempt.", job_key=job_key)
                self.db.refresh(node)
                if node.status == NodeStatus.EXECUTING:
                    logger.error(
                        "Inconsistent state detected for Node {node_id}. Forcing status correction.", node_id=node_id
                    )
                    node.status = NodeStatus.FAILED
                    node.current_stage = ExecutionStage.FAILED
                    if node.temporary_result:
                        node.temporary_result.error_log = (
                            "Execution state inconsistent (Job lost). Automatically marked as failed."
                        )
                    self.db.commit()
                    await self._broadcast_node_update(node)
                    return {"message": "Execution not found, but node status was inconsistent. Marked as Failed."}
                return {"message": f"Execution not found. Current status: {node.status.value}"}

            logger.warning("Could not send cancellation signal for job {job_key}.", job_key=job_key)
            self.db.refresh(node)
            if node.status != NodeStatus.EXECUTING:
                return {
                    "message": f"Execution could not be cancelled as it already completed or failed. Current status: {node.status.value}"
                }
            raise WorkflowException("Failed to cancel execution. The task might be unresponsive.", status_code=500)
        except Exception as exc:
            logger.exception("An unexpected error occurred during cancellation attempt for Node {node_id}.", node_id=node_id)
            raise WorkflowException(f"An error occurred during cancellation: {exc}", status_code=500) from exc

    async def execute_in_worker(
        self,
        node: NodeInstance,
        user_feedback: Optional[str] = None,
        is_retry_from_hitl: bool = False,
        base_version_id: Optional[int] = None,
        adjudication_data: Optional[List[Dict[str, Any]]] = None,
        previous_status: Optional[str] = None,
    ) -> NodeInstance:
        node_id = node.id
        original_status = NodeStatus(previous_status) if previous_status else node.status

        resolved_inputs: Dict[str, Any] = {}
        input_dependency_map: Dict[int, int] = {}
        previous_hitl_history: List[Dict[str, Any]] = []
        previous_output: Optional[Dict[str, Any]] = None
        executor_feedback = user_feedback
        temp_result: Optional[TemporaryExecutionResult] = None

        try:
            if is_retry_from_hitl or adjudication_data:
                resolved_inputs, input_dependency_map, previous_hitl_history, previous_output = self._prepare_hitl_loop_context(
                    node
                )
                temp_result = node.temporary_result
            else:
                resolved_inputs, input_dependency_map = self._resolve_dependencies(node)

                if original_status == NodeStatus.FAILED and node.temporary_result:
                    temp_result = self._prepare_failed_retry_context(node, input_dependency_map, user_feedback)
                    previous_hitl_history = temp_result.accumulated_hitl_interactions or []
                else:
                    base_history = self._get_base_history(node, base_version_id)
                    temp_result = self._create_fresh_temporary_result(
                        node,
                        input_dependency_map,
                        base_history,
                        user_feedback,
                    )
                    previous_hitl_history = temp_result.accumulated_hitl_interactions or []

                previous_output = None
        except Exception:
            logger.exception("Failed during execution preparation for node", node_id=node_id)
            self.db.rollback()
            raise

        if not temp_result:
            raise InvalidStateException("Internal Error: Failed to establish temporary execution context.")

        temp_result.error_log = None
        self.db.flush()

        project_snapshot = None
        if node.workflow and node.workflow.project:
            project_snapshot = node.workflow.project.configuration_snapshot

        executor = NodeExecutor(config=resolve_config(project_snapshot))

        try:
            node.current_stage = ExecutionStage.PROCESSING
            self.db.commit()
            await self._broadcast_node_update(node)

            execution_result: ExecutionResult = await executor.execute_node(
                node,
                resolved_inputs,
                previous_hitl_history,
                executor_feedback,
                previous_output,
                adjudication_data,
            )

            node.current_stage = ExecutionStage.GENERATING_OUTPUTS
            self.db.commit()
            await self._broadcast_node_update(node)

            temp_result.output_data = execution_result.output_data
            temp_result.execution_artifacts = execution_result.artifacts
            temp_result.error_log = None
            node.status = NodeStatus.AWAITING_HITL_APPROVAL
            node.current_stage = ExecutionStage.AWAITING_REVIEW
        except Exception as exc:
            logger.exception("Execution failed for node", node_id=node.id)
            temp_result.error_log = f"Error: {exc}\nTraceback:\n{traceback.format_exc()}"
            temp_result.output_data = None
            node.status = NodeStatus.FAILED
            node.current_stage = ExecutionStage.FAILED

        self.db.commit()
        self.db.refresh(node)
        await self._broadcast_node_update(node)
        return node

    # --- Execution Preparation Helper Methods ---

    def _prepare_hitl_loop_context(
        self, node: NodeInstance
    ) -> Tuple[Dict[str, Any], Dict[int, int], List[Dict[str, Any]], Optional[Dict[str, Any]]]:
        temp_result = node.temporary_result
        if not temp_result:
            raise InvalidStateException("Temporary execution context missing for HITL loop.")

        resolved_inputs, dependency_map = self._resolve_dependencies_from_map(node, temp_result.input_dependencies)
        history = temp_result.accumulated_hitl_interactions or []
        previous_output = temp_result.output_data
        return resolved_inputs, dependency_map, history, previous_output

    def _prepare_failed_retry_context(
        self,
        node: NodeInstance,
        input_dependency_map: Dict[int, int],
        user_feedback: Optional[str],
    ) -> TemporaryExecutionResult:
        if not node.temporary_result:
            raise InvalidStateException("Cannot retry FAILED node without a temporary execution result.")

        temp_result = node.temporary_result
        temp_result.error_log = None
        temp_result.input_dependencies = input_dependency_map

        interactions = temp_result.accumulated_hitl_interactions or []
        if user_feedback:
            interactions.append(
                {
                    "type": "RetryModificationComment",
                    "data": {"comment": user_feedback},
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                }
            )
        temp_result.accumulated_hitl_interactions = interactions[:]
        return temp_result

    def _get_base_history(self, node: NodeInstance, base_version_id: Optional[int]) -> List[Dict[str, Any]]:
        version_to_use_id = base_version_id if base_version_id is not None else node.active_version_id
        if not version_to_use_id:
            return []

        base_version = (
            self.db.query(NodeVersion)
            .filter_by(id=version_to_use_id, node_instance_id=node.id)
            .first()
        )
        if not base_version:
            raise InvalidStateException(
                f"Base version id {version_to_use_id} does not exist or does not belong to node {node.id}."
            )
        return base_version.hitl_history or []

    def _create_fresh_temporary_result(
        self,
        node: NodeInstance,
        input_map: Dict[int, int],
        history: List[Dict[str, Any]],
        initial_feedback: Optional[str],
    ) -> TemporaryExecutionResult:
        if node.temporary_result:
            self.db.delete(node.temporary_result)
            self.db.flush()

        interactions = history[:]
        if initial_feedback:
            interactions.append(
                {
                    "type": "InitialModificationComment",
                    "data": {"comment": initial_feedback},
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                }
            )

        temp_result = TemporaryExecutionResult(
            node_instance_id=node.id,
            input_dependencies=input_map,
            accumulated_hitl_interactions=interactions,
            execution_artifacts={},
            llm_model_name=settings.LLM_MODEL_NAME,
            temperature=settings.DEFAULT_TEMPERATURE,
        )
        self.db.add(temp_result)
        self.db.flush()
        return temp_result

    def _validate_execution_request(
        self,
        node: NodeInstance,
        user_feedback: Optional[str],
        is_retry_from_hitl: bool,
        base_version_id: Optional[int],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ):
        if adjudication_data:
            if node.hitl_mode != HITLMode.AVL:
                raise InvalidStateException("Adjudication data can only be provided for AVL nodes.")
            if node.status != NodeStatus.AWAITING_HITL_APPROVAL or not node.temporary_result:
                raise InvalidStateException(
                    "Cannot continue AVL loop unless status is AWAITING_HITL_APPROVAL with pending results."
                )
            if is_retry_from_hitl or user_feedback or base_version_id is not None:
                raise InvalidStateException("Conflicting parameters provided for AVL loop continuation.")
            return

        if is_retry_from_hitl:
            if node.status != NodeStatus.AWAITING_HITL_APPROVAL or not node.temporary_result:
                raise InvalidStateException(
                    "Cannot retry from HITL unless status is AWAITING_HITL_APPROVAL with temporary results."
                )
            if not user_feedback:
                raise InvalidStateException("Feedback must be provided for HITL retry.")
            if base_version_id is not None:
                raise InvalidStateException("base_version_id cannot be specified during a HITL retry loop.")
            return

        if node.node_type == NodeType.GENERATOR and node.status == NodeStatus.COMPLETED:
            raise ForbiddenException("Generator nodes cannot be re-executed once completed (R2.3).")

        if base_version_id is not None:
            exists = (
                self.db.query(NodeVersion.id)
                .filter_by(id=base_version_id, node_instance_id=node.id)
                .scalar()
                is not None
            )
            if not exists:
                raise InvalidStateException(
                    f"Base version id {base_version_id} does not exist or does not belong to node {node.id}."
                )

    def _resolve_external_inputs(self, node: NodeInstance) -> Dict[str, Any]:
        """
        Resolve external data dependencies by querying ProjectFile records once and
        loading the referenced blobs from storage.
        """
        resolved_external: Dict[str, Any] = {}
        if not node.external_inputs:
            return resolved_external

        def get_role_from_key(key: str) -> FileRole:
            if key in _INPUT_KEY_TO_ROLE_MAP:
                return _INPUT_KEY_TO_ROLE_MAP[key]
            try:
                return FileRole(key)
            except ValueError as exc:
                raise DependencyException(
                    f"Unknown external input key '{key}' defined in workflow. No matching FileRole found."
                ) from exc

        workflow = self.db.query(WorkflowInstance).get(node.workflow_instance_id)
        if not workflow or not workflow.project_id:
            raise DependencyException(
                "Node requires external inputs but is not linked to a valid project.",
                details={"node_id": node.id, "workflow_id": node.workflow_instance_id},
            )

        project_id = workflow.project_id
        logger.info("Resolving external inputs for project_id={project_id}", project_id=project_id)

        required_roles = {get_role_from_key(key) for key in node.external_inputs}
        project_files = (
            self.db.query(ProjectFile)
            .filter(
                ProjectFile.project_id == project_id,
                ProjectFile.role.in_(list(required_roles)),
            )
            .all()
        )

        files_by_role: Dict[FileRole, List[ProjectFile]] = defaultdict(list)
        for project_file in project_files:
            files_by_role[project_file.role].append(project_file)

        for input_key in node.external_inputs:
            role_to_find = get_role_from_key(input_key)
            matching_files = files_by_role.get(role_to_find, [])

            if not matching_files:
                raise DependencyException(
                    f"Required file with role '{role_to_find.value}' not found for project {project_id}.",
                    details={"project_id": project_id, "required_role": role_to_find.value},
                )

            if len(matching_files) > 1:
                raise DependencyException(
                    f"Ambiguous dependency: Found {len(matching_files)} files with role '{role_to_find.value}' for project {project_id}. Expected 1.",
                    details={
                        "project_id": project_id,
                        "ambiguous_role": role_to_find.value,
                        "file_ids": [f.id for f in matching_files],
                    },
                )

            project_file = matching_files[0]

            try:
                content_bytes = storage_service.get_file_content(project_file.storage_path)
                resolved_external[input_key] = content_bytes.decode("utf-8")
                logger.debug(
                    "Resolved external input '{key}' using file '{filename}'",
                    key=input_key,
                    filename=project_file.filename,
                )
            except FileNotFoundError as exc:
                logger.error(
                    "Data integrity issue: DB record for file '{path}' exists but file is missing from storage.",
                    path=project_file.storage_path,
                )
                raise DependencyException(
                    f"File not found in storage for role '{role_to_find.value}' at path '{project_file.storage_path}'."
                ) from exc
            except Exception as exc:
                logger.exception("Failed to read or decode file content for role '{role}'", role=role_to_find.value)
                raise DependencyException(f"Error processing file for role '{role_to_find.value}': {exc}") from exc

        return resolved_external

    def _resolve_dependencies(self, node: NodeInstance) -> Tuple[Dict[str, Any], Dict[int, int]]:
        input_dependency_map: Dict[int, int] = {}
        resolved_inputs = self._resolve_external_inputs(node)

        if not node.dependencies:
            return resolved_inputs, input_dependency_map

        upstream_definition_ids = list(node.dependencies.keys())
        upstream_nodes = (
            self.db.query(NodeInstance)
            .filter(
                NodeInstance.workflow_instance_id == node.workflow_instance_id,
                NodeInstance.definition_id.in_(upstream_definition_ids),
            )
            .options(joinedload(NodeInstance.active_version))
            .all()
        )

        found_definition_ids = set()
        for upstream in upstream_nodes:
            definition_id = upstream.definition_id
            found_definition_ids.add(definition_id)
            if upstream.status != NodeStatus.COMPLETED or not upstream.active_version:
                raise DependencyException(f"Upstream dependency '{definition_id}' is not completed.")

            upstream_output = upstream.active_version.output_data or {}
            dependency_spec = node.dependencies.get(definition_id, {})
            required_fields = dependency_spec.get("required_fields", [])

            if required_fields:
                missing_fields = [field for field in required_fields if field not in upstream_output]
                if missing_fields:
                    raise DependencyException(f"Upstream dependency '{definition_id}' is missing fields: {missing_fields}")

            upstream_input_data: Dict[str, Any] = {}
            if required_fields:
                for field in required_fields:
                    upstream_input_data[field] = upstream_output[field]
            resolved_inputs[definition_id] = upstream_input_data
            input_dependency_map[upstream.id] = upstream.active_version_id

        if len(found_definition_ids) != len(upstream_definition_ids):
            missing = set(upstream_definition_ids) - found_definition_ids
            raise DependencyException(f"Could not resolve dependencies: {missing}")
        return resolved_inputs, input_dependency_map

    def _resolve_dependencies_from_map(
        self,
        node: NodeInstance,
        dependency_map: Dict[int, int],
        db_session: Optional[Session] = None,
    ) -> Tuple[Dict[str, Any], Dict[int, int]]:
        db = db_session or self.db
        dependency_map = dependency_map or {}
        try:
            resolved_inputs = self._resolve_external_inputs(node)
        except DependencyException:
            logger.exception("Fatal: Failed to re-resolve external inputs during retry", node_id=node.id)
            raise

        version_ids = list(dependency_map.values())
        if not version_ids:
            return resolved_inputs, dependency_map

        versions = db.query(NodeVersion).filter(NodeVersion.id.in_(version_ids)).options(
            joinedload(NodeVersion.node_instance)
        ).all()
        version_lookup = {version.id: version for version in versions}

        for node_id_value, version_id in dependency_map.items():
            version = version_lookup.get(version_id)
            if not version:
                raise NotFoundException(f"Dependency version {version_id} not found.")

            definition_id = version.node_instance.definition_id
            upstream_output = version.output_data or {}
            dependency_spec = node.dependencies.get(definition_id, {}) if node.dependencies else {}
            required_fields = dependency_spec.get("required_fields", [])

            if required_fields:
                missing_fields = [field for field in required_fields if field not in upstream_output]
                if missing_fields:
                    raise DependencyException(
                        f"Upstream dependency '{definition_id}' is missing fields: {missing_fields}"
                    )

            upstream_input_data: Dict[str, Any] = {}
            if required_fields:
                for field in required_fields:
                    upstream_input_data[field] = upstream_output[field]
            resolved_inputs[definition_id] = upstream_input_data

        return resolved_inputs, dependency_map

    def get_node_detail_view(self, node_id: int, user: User) -> NodeDetailView:
        """Get the detailed view for a node, with an ownership check and optimized query."""
        node = (
            self.db.query(NodeInstance)
            .options(joinedload(NodeInstance.active_version), joinedload(NodeInstance.temporary_result))
            .get(node_id)
        )
        if not node:
            raise NotFoundException(f"NodeInstance with id {node_id} not found.")
        if node.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this node.")

        if node.status == NodeStatus.NOT_STARTED:
            max_executed_index = (
                self.db.query(func.max(NodeInstance.order_index))
                .filter(
                    NodeInstance.workflow_instance_id == node.workflow_instance_id,
                    NodeInstance.status != NodeStatus.NOT_STARTED,
                )
                .scalar()
            )

            execution_frontier = 0 if max_executed_index is None else max_executed_index + 1
            if node.order_index > execution_frontier:
                raise ForbiddenException(
                    f"Cannot jump ahead (R5.2). Node {node.definition_id} (Index {node.order_index}) "
                    f"is beyond the execution frontier (Index {execution_frontier})."
                )

        view = NodeDetailView.model_validate(node)
        if node.active_version:
            view.active_version = NodeVersionRead.model_validate(node.active_version)
        if node.temporary_result:
            view.pending_result = TemporaryExecutionRead.model_validate(node.temporary_result)

        inputs_to_check = None
        if node.status == NodeStatus.COMPLETED and node.active_version:
            inputs_to_check = node.active_version.input_dependencies
        elif node.temporary_result:
            inputs_to_check = node.temporary_result.input_dependencies

        if inputs_to_check:
            staleness_report = self._check_staleness(inputs_to_check)
            view.staleness_report = staleness_report or None

        return view

    def _check_staleness(self, input_map: Dict[int, int]) -> List[StalenessInfo]:
        if not input_map:
            return []

        staleness_report: List[StalenessInfo] = []
        upstream_node_ids = list(input_map.keys())
        upstream_nodes = self.db.query(NodeInstance).filter(NodeInstance.id.in_(upstream_node_ids)).all()

        for upstream in upstream_nodes:
            consumed_version_id = input_map.get(upstream.id)
            if upstream.active_version_id != consumed_version_id:
                staleness_report.append(
                    StalenessInfo(
                        upstream_node_id=upstream.id,
                        upstream_definition_id=upstream.definition_id,
                        consumed_version_id=consumed_version_id,
                        current_active_version_id=upstream.active_version_id,
                    )
                )
        return staleness_report

    def _create_manual_version(
        self,
        node: NodeInstance,
        base_version: NodeVersion,
        submission: ManualEditSubmission,
    ) -> NodeVersion:
        """Create a new NodeVersion record based on a manual edit submission."""
        with self.db.begin_nested():
            (
                self.db.query(NodeInstance)
                .filter_by(id=node.id)
                .with_for_update()
                .one()
            )

            max_version = (
                self.db.query(func.max(NodeVersion.version_number))
                .filter_by(node_instance_id=node.id)
                .scalar()
            )
            next_version_number = (max_version or 0) + 1

            history = list(base_version.hitl_history or [])
            history.append(
                {
                    "type": "ManualEdit",
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "data": {"summary": submission.summary},
                }
            )

            new_version = NodeVersion(
                node_instance_id=node.id,
                version_number=next_version_number,
                source=VersionSource.MANUALLY_EDITED,
                based_on_version_id=base_version.id,
                output_data=submission.edited_output_data,
                raw_generated_output=base_version.raw_generated_output,
                execution_artifacts=base_version.execution_artifacts,
                input_dependencies=base_version.input_dependencies,
                hitl_history=history,
                llm_model_name=base_version.llm_model_name,
                temperature=base_version.temperature,
                summary=submission.summary or f"Manual edit based on v{base_version.version_number}",
            )
            self.db.add(new_version)
            self.db.flush()

        return new_version

    async def _finalize_node_completion_and_advance(
        self,
        node: NodeInstance,
        user: User,
        new_version: NodeVersion,
        final_output: Dict[str, Any],
    ):
        """
        Centralized helper to finalize node completion, update workflow state, and advance execution.
        """
        from backend.services.workflow_service import WorkflowService

        workflow_service = WorkflowService(self.db)
        next_node: Optional[NodeInstance] = None
        structure_changed = False
        workflow_completed = False
        old_version_id = node.active_version_id

        try:
            node.active_version_id = new_version.id
            node.status = NodeStatus.COMPLETED
            node.current_stage = ExecutionStage.COMPLETED

            if node.temporary_result:
                self.db.delete(node.temporary_result)

            self.db.flush()

            if node.node_type == NodeType.GENERATOR:
                structure_changed = workflow_service.handle_generator_node_completion(node, final_output)

            next_node = workflow_service.get_next_node(node)

            if not next_node:
                workflow_service.complete_workflow(node.workflow_instance_id, user=user)
                workflow_completed = True

            self.db.commit()
        except Exception:
            self.db.rollback()
            logger.exception(
                "Transaction failed during node finalization and workflow advancement",
                node_id=node.id,
            )
            raise InvalidStateException("Failed to finalize node completion due to an internal error.")

        self.db.refresh(node)
        await self._broadcast_node_update(node)
        if old_version_id != new_version.id:
            await self._broadcast_version_change(node)

        if structure_changed:
            await workflow_service.broadcast_structure_update(node.workflow_instance_id)

        if workflow_completed:
            workflow_read = workflow_service.get_workflow_instance(node.workflow_instance_id, user=user)
            await workflow_service._broadcast_workflow_update(workflow_read)

        if next_node and next_node.status == NodeStatus.NOT_STARTED:
            await self.enqueue_initial_execution(next_node.id, user=user)

    async def submit_manual_edit(
        self,
        node_id: int,
        user: User,
        submission: ManualEditSubmission,
    ) -> NodeInstance:
        """
        Process a manual edit submission, creating a new version and advancing the workflow (FRS R4).
        """
        node = self.get_node_instance(node_id, user=user)

        if node.status == NodeStatus.COMPLETED and node.node_type == NodeType.GENERATOR:
            raise ForbiddenException("Cannot edit a completed Generator node as it would alter the workflow structure.")

        base_version = (
            self.db.query(NodeVersion)
            .filter_by(id=submission.base_version_id, node_instance_id=node.id)
            .first()
        )
        if not base_version:
            raise InvalidStateException(f"Base version {submission.base_version_id} not found for this node.")

        try:
            new_version = self._create_manual_version(node, base_version, submission)
            await self._finalize_node_completion_and_advance(
                node,
                user,
                new_version,
                final_output=submission.edited_output_data,
            )
        except Exception:
            logger.exception("Failed to process manual edit for node", node_id=node_id)
            raise

        return node

    async def switch_active_version(self, node_id: int, version_id: int, user: User) -> NodeInstance:
        """Switch a node's active version, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        version = self.db.query(NodeVersion).filter_by(id=version_id, node_instance_id=node_id).first()
        if not version:
            raise InvalidStateException(f"Version {version_id} does not belong to node {node_id}.")
        if node.node_type == NodeType.GENERATOR:
            raise ForbiddenException("Switching versions on Generator nodes is forbidden.")
        node.active_version_id = version_id
        status_changed = False
        if node.status not in [NodeStatus.EXECUTING, NodeStatus.AWAITING_HITL_APPROVAL]:
            if node.status != NodeStatus.COMPLETED:
                node.status = NodeStatus.COMPLETED
                node.current_stage = ExecutionStage.COMPLETED
                status_changed = True
        self.db.commit()
        self.db.refresh(node)

        if status_changed:
            await self._broadcast_node_update(node)

        await self._broadcast_version_change(node)
        return node

    async def _broadcast_node_update(self, node: NodeInstance):
        """Broadcasts a standardized node update event."""

        node_data = NodeInstanceRead.model_validate(node).model_dump(mode="json")
        await broadcast_event(node.workflow_instance_id, EventType.NODE_STATUS_UPDATED, node_data, node_id=node.id)

    async def _broadcast_version_change(self, node: NodeInstance):
        """Broadcasts that the active version has changed."""
        node_data = NodeInstanceRead.model_validate(node).model_dump(mode="json")
        await broadcast_event(
            node.workflow_instance_id,
            EventType.NODE_ACTIVE_VERSION_CHANGED,
            node_data,
            node_id=node.id,
        )

    def get_versions(self, node_id: int, user: User) -> List[NodeVersion]:
        """Get all versions for a node, with an ownership check."""
        self.get_node_instance(node_id, user=user)
        return (
            self.db.query(NodeVersion)
            .filter(NodeVersion.node_instance_id == node_id)
            .order_by(NodeVersion.version_number.desc())
            .all()
        )

    def get_version_details(self, node_id: int, version_id: int, user: User) -> NodeVersionRead:
        """Get details for a specific version, with an ownership check."""
        self.get_node_instance(node_id, user=user)
        version = self.db.query(NodeVersion).filter_by(id=version_id, node_instance_id=node_id).first()
        if not version:
            raise NotFoundException(f"Version {version_id} for Node {node_id} not found.")
        return NodeVersionRead.model_validate(version)
