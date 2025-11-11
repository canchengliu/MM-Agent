"""Shared helpers for SQLAlchemy Enum columns."""

from enum import Enum
from typing import Type


def enum_values(enum_cls: Type[Enum]) -> list[str]:
    """Return Enum member values for consistent SAEnum value storage."""

    return [member.value for member in enum_cls]


__all__ = ["enum_values"]
