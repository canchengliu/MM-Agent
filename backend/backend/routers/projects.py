"""API endpoints for project management, file uploads, and workflow initiation."""

import re
from urllib.parse import quote

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user
from backend.database import get_db
from backend.models.project import FileRole
from backend.models.user import User
from backend.schemas.common import PaginatedResponse
from backend.schemas.node import NodeInstanceRead
from backend.schemas.project import (
    HistoricalInitializationRequest,
    ProjectCreate,
    ProjectDetailRead,
    ProjectFileRead,
    ProjectSummaryRead,
    ProjectUpdate,
)
from backend.services.export_service import ExportService
from backend.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])


def get_project_service(db: Session = Depends(get_db)) -> ProjectService:
    """Dependency injector for the ProjectService."""
    return ProjectService(db)


def get_export_service(db: Session = Depends(get_db)) -> ExportService:
    """Dependency injector for the ExportService."""
    return ExportService(db)


@router.post("/", response_model=ProjectDetailRead, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Create a new project for the authenticated user."""
    return service.create_project(project_data, current_user)


@router.get("/", response_model=PaginatedResponse[ProjectSummaryRead])
def list_projects(
    skip: int = 0,
    limit: int = 20,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> PaginatedResponse[ProjectSummaryRead]:
    """List all projects for the authenticated user with lightweight pagination."""
    total, items = service.get_projects_paginated(current_user, skip, limit)
    return PaginatedResponse(total=total, items=items)


@router.get("/{project_id}", response_model=ProjectDetailRead)
def get_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Retrieve full details for a specific project owned by the user."""
    return service.get_project_details(project_id, current_user)


@router.patch("/{project_id}", response_model=ProjectDetailRead)
def update_project(
    project_id: int,
    update_data: ProjectUpdate,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Update a project's name, description, or problem type."""
    return service.update_project(project_id, update_data, current_user)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> None:
    """Delete a project and all its associated data."""
    service.delete_project(project_id, current_user)
    return None


@router.post("/{project_id}/files", response_model=ProjectFileRead, status_code=status.HTTP_201_CREATED)
async def upload_project_file(
    project_id: int,
    file: UploadFile = File(...),
    role: FileRole = Form(...),
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectFileRead:
    """Upload a file (e.g., Problem Description, Dataset) to a project."""
    return await service.upload_file(project_id, current_user, file, role)


@router.post("/{project_id}/initialize-from-historical", response_model=ProjectDetailRead)
def initialize_from_historical_problem(
    project_id: int,
    request: HistoricalInitializationRequest,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> ProjectDetailRead:
    """Initialize a project with data from the historical problem library (R3.3)."""
    return service.initialize_from_historical(project_id, request.historical_problem_id, current_user)


@router.post("/{project_id}/start", response_model=NodeInstanceRead, status_code=status.HTTP_202_ACCEPTED)
async def start_project_workflow(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> NodeInstanceRead:
    """
    Start the modeling workflow for a configured project (R3.5).

    This action snapshots the user's settings, creates the workflow instance,
    and enqueues the first node for execution.
    """
    return await service.start_workflow(project_id, current_user)


@router.get("/{project_id}/export", response_class=Response)
async def export_project(
    project_id: int,
    project_service: ProjectService = Depends(get_project_service),
    export_service: ExportService = Depends(get_export_service),
    current_user: User = Depends(get_current_active_verified_user),
) -> Response:
    """
    Export the project's results as a ZIP archive (R6).

    Compiles all node outputs, uploaded inputs, and a manifest into a single archive.
    """
    project = project_service.get_project_details(project_id, current_user)
    if not project.workflow_instance:
        raise HTTPException(status_code=404, detail="No workflow has been started for this project to export.")

    zip_bytes = export_service.export_project_to_zip(project)

    sanitized_name = re.sub(r'[\\/*?:"<>|]', "", project.name).strip() or "untitled_project"
    filename = f"{sanitized_name}_export.zip"
    ascii_filename = filename.encode("ascii", "ignore").decode() or "project_export.zip"
    if ascii_filename == filename:
        content_disposition = f'attachment; filename="{ascii_filename}"'
    else:
        encoded_filename = quote(filename)
        content_disposition = (
            f'attachment; filename="{ascii_filename}"; filename*=UTF-8\'\'{encoded_filename}'
        )

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": content_disposition},
    )
