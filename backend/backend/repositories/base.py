"""
Base repository abstractions to keep SQLAlchemy session handling centralized.
"""
from __future__ import annotations

from typing import Generic, Type, TypeVar

from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    """Basic CRUD helpers shared by repositories."""

    def __init__(self, db: Session, model: Type[ModelType]):
        self.db = db
        self.model = model

    def get(self, pk: int) -> ModelType | None:
        """Return a single record by primary key."""
        return self.db.get(self.model, pk)


__all__ = ["BaseRepository"]
