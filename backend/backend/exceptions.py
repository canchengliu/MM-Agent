from typing import Any, Dict, Optional


class WorkflowException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        error_code: str = "WORKFLOW_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details


class NotFoundException(WorkflowException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=404, error_code="NOT_FOUND", details=details)


class InvalidStateException(WorkflowException):
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        error_code: str = "INVALID_STATE",
    ):
        super().__init__(message, status_code=409, error_code=error_code, details=details)


class ForbiddenException(WorkflowException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=403, error_code="FORBIDDEN", details=details)


class DependencyException(WorkflowException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=424, error_code="DEPENDENCY_FAILED", details=details)
