from typing import Any, Dict, Optional

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response for API exceptions."""

    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
