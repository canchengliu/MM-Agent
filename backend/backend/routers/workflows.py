from typing import Dict, List

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user, get_user_from_token
from backend.database import get_db
from backend.models.user import User
from backend.models.workflow import WorkflowInstance
from backend.schemas.common import PaginatedResponse
from backend.schemas.node import NodeInstanceRead, StalenessInfo
from backend.schemas.workflow import WorkflowCreate, WorkflowInstanceRead, WorkflowUpdate
from backend.services.workflow_service import WorkflowService
from backend.ws_manager import manager as ws_manager

router = APIRouter(prefix="/workflows", tags=["Workflows"])


def get_workflow_service(db: Session = Depends(get_db)) -> WorkflowService:
    return WorkflowService(db)


@router.post("/", response_model=WorkflowInstanceRead, status_code=status.HTTP_201_CREATED)
def create_workflow(
    workflow_data: WorkflowCreate,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    workflow = service.create_workflow(workflow_data, current_user)
    return service.get_workflow_instance(workflow.id, current_user)


@router.get("/", response_model=PaginatedResponse[WorkflowInstanceRead])
def list_workflows(
    skip: int = 0,
    limit: int = 20,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.get_workflows_paginated(current_user, skip, limit)


@router.get("/{workflow_id}", response_model=WorkflowInstanceRead)
def get_workflow(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    workflow = service.get_workflow_instance(workflow_id, current_user)
    return workflow


@router.patch("/{workflow_id}", response_model=WorkflowInstanceRead)
def update_workflow(
    workflow_id: int,
    update_data: WorkflowUpdate,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    service.update_workflow(workflow_id, update_data, current_user)
    return service.get_workflow_instance(workflow_id, current_user)


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    service.delete_workflow(workflow_id, current_user)
    return None


@router.post("/{workflow_id}/start", response_model=NodeInstanceRead)
async def start_workflow(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return await service.start_workflow(workflow_id, current_user)


@router.get("/{workflow_id}/staleness", response_model=Dict[int, List[StalenessInfo]])
def get_workflow_staleness(
    workflow_id: int,
    service: WorkflowService = Depends(get_workflow_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    return service.calculate_bulk_staleness(workflow_id, current_user)


@router.websocket("/{workflow_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    workflow_id: int,
    token: str = Query(..., description="JWT access token for authentication"),
    db: Session = Depends(get_db),
):
    """
    WebSocket endpoint for streaming real-time workflow updates.
    """
    user = await get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4001, reason="Authentication failed: Invalid or expired token")
        return

    workflow = db.get(WorkflowInstance, workflow_id)
    if not workflow or workflow.user_id != user.id:
        logger.warning(
            "WebSocket authorization failed for user {user_id} on workflow {workflow_id}",
            user_id=user.id,
            workflow_id=workflow_id,
        )
        await websocket.close(code=4003, reason="Authorization failed: Access denied")
        return

    await ws_manager.connect(workflow_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(workflow_id, websocket)
    except Exception:
        logger.exception("Unexpected WebSocket error", workflow_id=workflow_id)
        ws_manager.disconnect(workflow_id, websocket)
