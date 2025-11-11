"""
Service for securely managing file storage and retrieval with tenant isolation.
This service abstracts file system operations and enforces security policies to
prevent unauthorized file access.
"""

import os
import uuid
from pathlib import Path

from loguru import logger

from backend.config import settings
from backend.exceptions import ForbiddenException, NotFoundException


class StorageService:
    """
    Manages file storage and retrieval with tenant isolation.
    Ensures that files are stored in a structured way (e.g., base_path/user_id/project_id/)
    and prevents path traversal attacks.
    """

    def __init__(self, base_path: Path):
        self.base_path = base_path.resolve()  # Use absolute path for security checks
        # Ensure the base directory exists
        os.makedirs(self.base_path, exist_ok=True)
        logger.info("StorageService initialized with base path: {}", self.base_path)

    def _get_project_dir(self, user_id: int, project_id: int) -> Path:
        """Constructs and returns the directory path for a specific project."""
        return self.base_path / str(user_id) / str(project_id)

    def _get_and_validate_path(self, storage_path: str) -> Path:
        """
        Constructs a full, absolute path from a relative storage path and validates it.
        Raises:
            ForbiddenException: If the path is invalid or outside the storage root.
        """
        # Prevent any path traversal characters in the relative path.
        if ".." in Path(storage_path).parts:
            logger.warning("Path traversal attempt detected in storage path: {}", storage_path)
            raise ForbiddenException("Invalid storage path format.")

        full_path = (self.base_path / storage_path).resolve()

        # Security Check: Ensure the resolved path is within the base storage directory.
        try:
            if not full_path.is_relative_to(self.base_path):
                raise ForbiddenException("Access to this file path is forbidden.")
        except AttributeError:  # Fallback for Python < 3.9
            if not str(full_path).startswith(str(self.base_path)):
                raise ForbiddenException("Access to this file path is forbidden.")

        return full_path

    def save_file(self, user_id: int, project_id: int, filename: str, content: bytes) -> str:
        """
        Saves file content to a user- and project-specific directory with a unique name.
        Args:
            user_id: The ID of the user owning the project.
            project_id: The ID of the project.
            filename: The original name of the file to save.
            content: The binary content of the file.
        Returns:
            The unique, relative storage path to be saved in the database.
        """
        project_dir = self._get_project_dir(user_id, project_id)
        os.makedirs(project_dir, exist_ok=True)

        original_path = Path(filename)
        # Sanitize filename to prevent security issues (e.g., path traversal in filename itself)
        safe_stem = Path(original_path.stem).name
        if not safe_stem:
            raise ValueError("A valid filename must be provided.")

        # Optimization: Generate a unique filename to prevent overwrites.
        unique_id = uuid.uuid4().hex[:8]
        unique_filename = f"{safe_stem}-{unique_id}{original_path.suffix}"

        file_path = project_dir / unique_filename
        file_path.write_bytes(content)

        relative_path = str(file_path.relative_to(self.base_path))
        logger.info("File saved successfully. Original: '{}', Stored As: '{}'", filename, relative_path)
        return relative_path

    def get_file_content(self, storage_path: str) -> bytes:
        """
        Retrieves the content of a file given its relative storage path.
        Args:
            storage_path: The relative path from the database.
        Returns:
            The binary content of the file.
        """
        full_path = self._get_and_validate_path(storage_path)

        if not full_path.is_file():
            raise NotFoundException(f"File not found at storage path: {storage_path}")

        logger.debug("Reading file content from: {}", full_path)
        return full_path.read_bytes()

    def delete_file(self, storage_path: str) -> None:
        """
        Deletes a file given its relative storage path. Is idempotent.
        Args:
            storage_path: The relative path from the database.
        """
        try:
            full_path = self._get_and_validate_path(storage_path)

            if full_path.is_file():
                os.remove(full_path)
                logger.info("File deleted successfully: {}", full_path)
            else:
                logger.warning("Attempted to delete a non-existent file, operation skipped: {}", storage_path)
        except (NotFoundException, ForbiddenException) as e:
            # If path is invalid or not found, we can consider the "delete" successful.
            logger.warning("Skipped deleting file due to path validation issue: {}. Message: {}", storage_path, e)


# Instantiate a singleton for the service, making it easily accessible.
storage_service = StorageService(base_path=settings.STORAGE_BASE_PATH)
