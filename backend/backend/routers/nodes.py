from typing import Any, Dict, List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user
from backend.database import get_db
from backend.models.user import User
from backend.schemas.hitl import ExecutionRequest, HITLSubmission
from backend.schemas.node import ManualEditSubmission, NodeDetailView, NodeInstanceRead, NodeVersionRead
from backend.services.hitl_service import HITLService
from backend.services.node_service import NodeService

router = APIRouter(prefix="/nodes", tags=["Nodes"])


def get_node_service(db: Session = Depends(get_db)) -> NodeService:
    return NodeService(db)


def get_hitl_service(
    db: Session = Depends(get_db),
    node_service: NodeService = Depends(get_node_service),
) -> HITLService:
    return HITLService(db, node_service)


@router.get("/{node_id}", response_model=NodeDetailView)
def get_node_details(
    node_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_node_detail_view(node_id, current_user)


@router.post(
    "/{node_id}/re-execute",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=Dict[str, Any],
    summary="Re-execute a COMPLETED node",
)
async def re_execute_node(
    node_id: int,
    request: ExecutionRequest,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    await service.enqueue_re_execution(
        node_id,
        current_user,
        user_feedback=request.modification_comments,
        base_version_id=request.base_version_id,
    )
    return {"message": "Node re-execution has been accepted for processing.", "node_id": node_id}


@router.post(
    "/{node_id}/retry",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=Dict[str, Any],
    summary="Retry a FAILED node",
)
async def retry_node(
    node_id: int,
    request: ExecutionRequest,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    await service.enqueue_retry(
        node_id,
        current_user,
        user_feedback=request.modification_comments,
    )
    return {"message": "Node retry has been accepted for processing.", "node_id": node_id}


@router.post("/{node_id}/hitl", response_model=Dict[str, Any])
async def submit_hitl_action(
    node_id: int,
    submission: HITLSubmission,
    service: HITLService = Depends(get_hitl_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return await service.process_submission(node_id, submission, current_user)


@router.post(
    "/{node_id}/manual-edit",
    response_model=NodeInstanceRead,
    summary="Submit a manual edit for a node's output (R4)",
    description="""
Manually edit a node's output, creating a new version (R4).

This action creates a new 'Manually Edited' version based on a specified
base version, sets it as the active version, and marks the node as 'Completed'.
If the node was awaiting HITL approval, this serves as an override.
This action will trigger a staleness check on downstream nodes and advance the workflow.
    """,
)
async def submit_manual_edit(
    node_id: int,
    submission: ManualEditSubmission,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    updated_node = await service.submit_manual_edit(node_id, current_user, submission)
    return updated_node


@router.get("/{node_id}/versions", response_model=List[NodeVersionRead])
def get_node_versions(
    node_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_versions(node_id, current_user)


@router.get("/{node_id}/versions/{version_id}", response_model=NodeVersionRead)
def get_node_version_details(
    node_id: int,
    version_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_version_details(node_id, version_id, current_user)


@router.post("/{node_id}/versions/{version_id}/activate", response_model=NodeInstanceRead)
async def activate_version(
    node_id: int,
    version_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return await service.switch_active_version(node_id, version_id, current_user)
