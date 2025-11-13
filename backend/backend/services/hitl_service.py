import datetime
from typing import Any, Dict, List, Optional

from loguru import logger
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.exceptions import InvalidStateException
from backend.models.user import User
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, NodeVersion, VersionSource, WorkflowStatus
from backend.schemas.hitl import (
    AdjudicationDecision,
    HITLActionType,
    HITLSubmission,
)
from backend.services.execution_engine.handlers.registry import get_handler_class
from backend.services.node_service import NodeService
from backend.workflow.spec import HITLMode

class HITLService:
    def __init__(self, db: Session, node_service: NodeService):
        self.db = db
        self.node_service = node_service

    def _get_handler_for_node(self, node: NodeInstance):
        handler_cls = get_handler_class(node.handler_type)
        return handler_cls(None, node)

    async def process_submission(
        self, node_id: int, submission: HITLSubmission, user: User
    ) -> Dict[str, Any]:
        """Process a HITL submission, with an ownership check."""
        node = self.node_service.get_node_instance(node_id, user=user)

        if submission.action == HITLActionType.DISCARD:
            if node.status in [NodeStatus.AWAITING_HITL_APPROVAL, NodeStatus.FAILED, NodeStatus.CANCELED]:
                return await self._discard_execution(node)
            raise InvalidStateException(f"Cannot discard execution in status {node.status}.")

        if node.status != NodeStatus.AWAITING_HITL_APPROVAL:
            raise InvalidStateException(f"Cannot process HITL submission in status {node.status}.")

        if submission.action == HITLActionType.CONTINUE:
            return await self._handle_approval_or_loop(node, submission.interaction_data or {}, user)
        if submission.action == HITLActionType.REJECT_WITH_FEEDBACK:
            return await self._reject_and_retry(node, submission.feedback_comment, user)

        raise InvalidStateException("Unsupported HITL action.")

    async def _handle_approval_or_loop(
        self, node: NodeInstance, interaction_data: Optional[Dict[str, Any]], user: User
    ):
        self._validate_hitl_integrity(node, interaction_data)

        if node.hitl_mode == HITLMode.AVL:
            adjudication_data_list = (interaction_data or {}).get("adjudication", [])
            if any(item.get("decision") == AdjudicationDecision.ACCEPTED for item in adjudication_data_list):
                self._record_interaction(node, "AVLAdjudication", interaction_data)
                await self.node_service.enqueue_hitl_action(
                    node.id, user=user, adjudication_data=adjudication_data_list
                )
                return {
                    "message": "Adjudication received. Starting AVL refinement iteration.",
                    "node_id": node.id,
                    "action": "AVLLoop",
                }
        return await self._approve_and_proceed(node, interaction_data, user)

    async def _approve_and_proceed(
        self, node: NodeInstance, interaction_data: Optional[Dict[str, Any]], user: User
    ):
        """
        Approves the node, finalizes the version, and advances the workflow atomically (R5.3).
        """
        raw_output = node.temporary_result.output_data
        final_output = self._determine_final_output(node, raw_output, interaction_data)

        try:
            new_version = self._create_version_from_temporary(node, final_output, raw_output, interaction_data)
            await self.node_service._finalize_node_completion_and_advance(
                node,
                user,
                new_version,
                final_output,
            )
        except Exception:
            logger.exception("Failed during HITL approval process for node", node_id=node.id)
            raise

        if node.workflow:
            self.db.refresh(node.workflow)

        next_node = (
            self.db.query(NodeInstance)
            .filter_by(
                workflow_instance_id=node.workflow_instance_id,
                order_index=node.order_index + 1,
            )
            .first()
        )

        if node.workflow and node.workflow.status == WorkflowStatus.COMPLETED:
            return {"message": "Workflow completed successfully.", "next_node_id": None, "action": "Completed"}

        if not next_node:
            raise InvalidStateException("Internal Error: Workflow is not complete, but failed to find the next node.")

        execute_next = next_node.status == NodeStatus.NOT_STARTED
        if execute_next:
            return {
                "message": f"Node approved. Starting next node {next_node.definition_id}.",
                "next_node_id": next_node.id,
                "action": "ExecuteNext",
            }

        return {
            "message": f"Node approved. Navigating to review next node {next_node.definition_id}.",
            "next_node_id": next_node.id,
            "action": "NavigateNext",
        }

    def _validate_hitl_integrity(self, node: NodeInstance, interaction_data: Optional[Dict[str, Any]]):
        raw_output = node.temporary_result.output_data
        handler = self._get_handler_for_node(node)
        handler.validate_hitl_integrity(raw_output, interaction_data)

    def _determine_final_output(
        self,
        node: NodeInstance,
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        handler = self._get_handler_for_node(node)
        return handler.determine_final_output(raw_output, interaction_data)

    async def _reject_and_retry(self, node: NodeInstance, feedback: Optional[str], user: User):
        if not feedback:
            raise InvalidStateException("Feedback comment is required for rejection.")
        self._record_interaction(node, "RejectionFeedback", {"comment": feedback})
        await self.node_service.enqueue_hitl_action(node.id, user=user, user_feedback=feedback)
        return {"message": "Feedback received. Re-executing node.", "node_id": node.id, "action": "ReExecute"}

    def _record_interaction(self, node: NodeInstance, interaction_type: str, data: Dict[str, Any]):
        temp_result = node.temporary_result
        interactions = temp_result.accumulated_hitl_interactions or []
        interaction = {
            "type": interaction_type,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "data": data,
        }
        interactions.append(interaction)
        temp_result.accumulated_hitl_interactions = interactions[:]  # copy for SQLAlchemy change tracking
        self.db.commit()

    async def _discard_execution(self, node: NodeInstance) -> Dict[str, Any]:
        if node.status not in [NodeStatus.AWAITING_HITL_APPROVAL, NodeStatus.FAILED, NodeStatus.CANCELED]:
            raise InvalidStateException(f"Cannot discard execution in status {node.status}.")

        if node.temporary_result:
            self.db.delete(node.temporary_result)

        if node.active_version_id:
            node.status = NodeStatus.COMPLETED
            node.current_stage = ExecutionStage.COMPLETED
        else:
            node.status = NodeStatus.NOT_STARTED
            node.current_stage = ExecutionStage.NOT_STARTED

        self.db.commit()
        self.db.refresh(node)
        await self.node_service._broadcast_node_update(node)
        return {"message": "Execution attempt discarded. Status reverted.", "node_id": node.id, "action": "Discarded"}

    def _generate_version_summary(self, interactions: List[Dict[str, Any]]) -> str:
        """Create a concise, context-aware explanation for the version."""

        if not interactions:
            return "Initial version approved."

        for interaction in reversed(interactions):
            interaction_type = interaction.get("type")
            data = interaction.get("data", {})

            if interaction_type == "AVLAdjudication":
                adjudications = data.get("adjudication", [])
                accepted_count = sum(1 for item in adjudications if item.get("decision") == AdjudicationDecision.ACCEPTED)
                if accepted_count > 0:
                    first_comment = next(
                        (
                            item.get("comment")
                            for item in adjudications
                            if item.get("decision") == AdjudicationDecision.ACCEPTED and item.get("comment")
                        ),
                        None,
                    )
                    summary = f"Refined (Accepted {accepted_count} critiques)."
                    if first_comment:
                        summary += f" Context: '{first_comment[:60]}...'"
                    return summary
                return "Approved (Rejected all critiques)."

            if interaction_type in ["RejectionFeedback", "InitialModificationComment", "RetryModificationComment"]:
                comment = data.get("comment")
                if comment:
                    if interaction_type == "InitialModificationComment":
                        prefix = "Re-executed"
                    elif interaction_type == "RetryModificationComment":
                        prefix = "Retried"
                    else:
                        prefix = "Refined"
                    return f"{prefix} based on feedback: '{comment[:80]}...'"

        return "Version approved."

    def _create_version_from_temporary(
        self,
        node: NodeInstance,
        final_output: Dict[str, Any],
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> NodeVersion:
        temp_result = node.temporary_result
        with self.db.begin_nested():
            self.db.query(NodeInstance).filter_by(id=node.id).with_for_update().one_or_none()
            max_version = (
                self.db.query(func.max(NodeVersion.version_number))
                .filter_by(node_instance_id=node.id)
                .scalar()
            )
            next_version_number = (max_version or 0) + 1
            summary = self._generate_version_summary(temp_result.accumulated_hitl_interactions)
            final_interactions = temp_result.accumulated_hitl_interactions[:]
            final_interactions.append(
                {
                    "type": "Approval",
                    "interaction_data": interaction_data,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                }
            )
            version_source = self._determine_version_source(final_interactions)
            base_version_id = node.active_version_id
            execution_artifacts = temp_result.execution_artifacts

            new_version = NodeVersion(
                node_instance_id=node.id,
                version_number=next_version_number,
                source=version_source,
                based_on_version_id=base_version_id,
                output_data=final_output,
                raw_generated_output=raw_output,
                execution_artifacts=execution_artifacts,
                input_dependencies=temp_result.input_dependencies,
                hitl_history=final_interactions,
                llm_model_name=temp_result.llm_model_name,
                temperature=temp_result.temperature,
                summary=summary,
            )
            self.db.add(new_version)
            self.db.flush()
        return new_version

    def _determine_version_source(self, interactions: List[Dict[str, Any]]) -> VersionSource:
        if not interactions:
            return VersionSource.AI_GENERATED

        manual_markers = {
            "InitialModificationComment",
            "RetryModificationComment",
            "RejectionFeedback",
            "AVLAdjudication",
        }
        if any(entry.get("type") in manual_markers for entry in interactions):
            return VersionSource.MANUALLY_EDITED
        return VersionSource.AI_GENERATED
