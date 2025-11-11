"""
Data-access helpers for Project entities.
"""
from __future__ import annotations

from typing import Tuple

from sqlalchemy.orm import Session, selectinload

from backend.models.project import Project
from backend.models.user import User

from .base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    """Encapsulates complex project queries."""

    def __init__(self, db: Session):
        super().__init__(db, Project)

    def find_by_name_for_user(self, name: str, user: User) -> Project | None:
        return (
            self.db.query(self.model)
            .filter(self.model.user_id == user.id, self.model.name == name)
            .first()
        )

    def list_paginated_for_user(self, user: User, skip: int, limit: int) -> Tuple[int, list[Project]]:
        query = self.db.query(self.model).filter(self.model.user_id == user.id)
        total = query.count()
        items = (
            query.options(selectinload(Project.workflow_instance))
            .order_by(self.model.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return total, items

    def get_with_details(self, project_id: int) -> Project | None:
        return (
            self.db.query(self.model)
            .options(
                selectinload(Project.files),
                selectinload(Project.workflow_instance),
            )
            .filter(self.model.id == project_id)
            .first()
        )


__all__ = ["ProjectRepository"]
