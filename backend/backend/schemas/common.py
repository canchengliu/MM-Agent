from typing import Generic, List, TypeVar

from pydantic import BaseModel

DataType = TypeVar("DataType")


class PaginatedResponse(BaseModel, Generic[DataType]):
    """Generic schema for paginated collections."""

    total: int
    items: List[DataType]


class SystemInfo(BaseModel):
    """Schema exposed by the system information endpoint."""

    app_version: str
    llm_model_name: str
