"""
Service for managing the project lifecycle and workflow orchestration.
"""
from pathlib import Path
from typing import List, Optional, Tuple

from fastapi import UploadFile
from loguru import logger
from sqlalchemy.orm import Session

from backend.config import settings
from backend.exceptions import DependencyException, ForbiddenException, InvalidStateException, NotFoundException
from backend.models.project import FileRole, HistoricalProblem, Project, ProjectFile, ProjectStatus, ProblemType
from backend.models.user import User
from backend.models.workflow import NodeInstance, WorkflowInstance
from backend.repositories import ProjectRepository
from backend.schemas.project import ProjectCreate, ProjectUpdate
from backend.services.storage_service import storage_service
from backend.services.user_service import UserService
from backend.services.workflow_service import WorkflowService


class ProjectService:
    """Service for managing the project lifecycle and configuration."""

    def __init__(
        self,
        db: Session,
        user_service: Optional[UserService] = None,
        workflow_service: Optional[WorkflowService] = None,
    ):
        """
        Initialize service dependencies, allowing overrides for testability.
        """
        self.db = db
        self.user_service = user_service or UserService()
        self.workflow_service = workflow_service or WorkflowService(db)
        self.project_repo = ProjectRepository(db)

    def _get_project_for_user(self, project_id: int, user: User) -> Project:
        """Retrieve a project and enforce ownership."""
        project = self.project_repo.get(project_id)
        if not project:
            raise NotFoundException(f"Project with id {project_id} not found.")
        if project.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this project.")
        return project

    def create_project(self, project_data: ProjectCreate, user: User) -> Project:
        """Create a new project for the given user."""
        existing_project = self.project_repo.find_by_name_for_user(project_data.name, user)
        if existing_project:
            raise InvalidStateException(
                f"Project with name '{project_data.name}' already exists.",
                error_code="PROJECT_NAME_EXISTS",
            )

        new_project = Project(
            user_id=user.id,
            name=project_data.name,
            description=project_data.description,
            status=ProjectStatus.CONFIGURING,
        )
        self.db.add(new_project)
        self.db.commit()
        self.db.refresh(new_project)
        logger.info("Created new project '{}' for user {}", new_project.name, user.id)
        return new_project

    def get_projects_paginated(self, user: User, skip: int, limit: int) -> Tuple[int, List[Project]]:
        """Return a user's projects along with a total count for pagination."""
        return self.project_repo.list_paginated_for_user(user, skip, limit)

    def get_historical_problems(self) -> List[HistoricalProblem]:
        """Retrieve the list of available historical problems (R3.3)."""
        return (
            self.db.query(HistoricalProblem)
            .order_by(HistoricalProblem.year.desc(), HistoricalProblem.type)
            .all()
        )

    def get_project_details(self, project_id: int, user: User) -> Project:
        """Return project details after verifying ownership."""
        project = self.project_repo.get_with_details(project_id)
        if not project:
            raise NotFoundException(f"Project with id {project_id} not found.")
        if project.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this project.")
        return project

    def update_project(self, project_id: int, update_data: ProjectUpdate, user: User) -> Project:
        """Update mutable project fields."""
        project = self._get_project_for_user(project_id, user)
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(project, key, value)
        self.db.commit()
        self.db.refresh(project)
        logger.info("Updated project {}", project_id)
        return project

    def delete_project(self, project_id: int, user: User) -> None:
        """Delete a project and its stored files."""
        project = self.project_repo.get_with_details(project_id)
        if not project:
            raise NotFoundException(f"Project with id {project_id} not found.")
        if project.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this project.")

        files_to_delete = list(project.files)
        try:
            for file_record in files_to_delete:
                storage_service.delete_file(file_record.storage_path)
            logger.info("Deleted stored files for project {}", project_id)
        except Exception as exc:
            logger.exception("Failed to delete stored files for project {}, aborting.", project_id)
            raise DependencyException(f"Could not delete associated files for project {project_id}") from exc

        self.db.delete(project)
        self.db.commit()
        logger.info("Deleted project {} from database for user {}", project_id, user.id)

    async def upload_file(self, project_id: int, user: User, file: UploadFile, role: FileRole) -> ProjectFile:
        """Upload and associate a file with the project."""
        project = self._get_project_for_user(project_id, user)
        content = await file.read()
        new_file = self._create_and_store_file(project, user, file.filename, role, content)
        self.db.commit()
        self.db.refresh(new_file)
        logger.info("Uploaded file '{}' for project {}", file.filename, project_id)
        return new_file

    def _create_and_store_file(
        self,
        project: Project,
        user: User,
        filename: str,
        role: FileRole,
        content: bytes,
    ) -> ProjectFile:
        """Persist content to storage and return the ProjectFile record."""
        storage_path = storage_service.save_file(
            user_id=user.id,
            project_id=project.id,
            filename=filename,
            content=content,
        )
        new_file = ProjectFile(
            project_id=project.id,
            user_id=user.id,
            filename=filename,
            role=role,
            storage_path=storage_path,
        )
        self.db.add(new_file)
        return new_file

    def initialize_from_historical(self, project_id: int, historical_problem_id: int, user: User) -> Project:
        """Configure a project using assets from the historical library."""
        project = self._get_project_for_user(project_id, user)
        historical_problem = self.db.query(HistoricalProblem).get(historical_problem_id)
        if not historical_problem:
            raise NotFoundException(f"HistoricalProblem with id {historical_problem_id} not found.")

        historical_data_base_path = Path(settings.EXTERNAL_DATA_DIR)
        try:
            desc_path = historical_data_base_path / historical_problem.description_path
            desc_content = desc_path.read_bytes()
            self._create_and_store_file(project, user, desc_path.name, FileRole.PROBLEM_DESCRIPTION, desc_content)

            if historical_problem.dataset_path:
                dataset_path = historical_data_base_path / historical_problem.dataset_path
                dataset_content = dataset_path.read_bytes()
                self._create_and_store_file(project, user, dataset_path.name, FileRole.DATASET, dataset_content)

            project.historical_problem_id = historical_problem.id
            project.problem_type = historical_problem.type
            self.db.commit()
            self.db.refresh(project)
            logger.info("Initialized project {} from historical problem {}", project_id, historical_problem_id)
            return project
        except FileNotFoundError as exc:
            self.db.rollback()
            logger.error("Failed to find historical problem file: {}", exc)
            raise DependencyException(f"A file for '{historical_problem.name}' was not found on the server.") from exc
        except Exception:
            self.db.rollback()
            logger.exception("Failed during historical problem initialization for project {}", project_id)
            raise

    def _create_workflow_for_project(self, project: Project) -> WorkflowInstance:
        """Create and initialize a workflow (and its nodes) for the project."""
        workflow = WorkflowInstance(
            name=f"Workflow for '{project.name}'",
            project_id=project.id,
            user_id=project.user_id,
        )
        self.db.add(workflow)
        self.db.flush()
        self.workflow_service._initialize_nodes(workflow)
        return workflow

    async def start_workflow(self, project_id: int, user: User) -> NodeInstance:
        """Start the workflow for a configured project."""
        project = self._get_project_for_user(project_id, user)

        if project.status != ProjectStatus.CONFIGURING:
            raise InvalidStateException("Project must be in 'Configuring' status to start a workflow.")
        if project.problem_type == ProblemType.UNKNOWN:
            raise InvalidStateException("Problem Type must be set before starting.")
        has_problem_description = (
            self.db.query(ProjectFile)
            .filter_by(project_id=project.id, role=FileRole.PROBLEM_DESCRIPTION)
            .first()
        )
        if not has_problem_description:
            raise InvalidStateException("A 'Problem Description' file must be uploaded before starting.")
        if project.workflow_instance:
            raise InvalidStateException("A workflow has already been started for this project.")

        try:
            decrypted_settings = self.user_service.get_decrypted_settings(self.db, user)
            project.configuration_snapshot = decrypted_settings
            project.status = ProjectStatus.RUNNING

            workflow = self._create_workflow_for_project(project)
            self.db.commit()
            logger.info(
                "Snapshot created, project {} status set to RUNNING. Workflow {} created.",
                project.id,
                workflow.id,
            )

            first_node = await self.workflow_service.start_workflow(workflow.id, user)
            logger.info("Successfully started workflow {} for project {}.", workflow.id, project.id)
            return first_node
        except Exception:
            self.db.rollback()
            logger.exception("Failed to start workflow for project {}", project_id)
            raise
