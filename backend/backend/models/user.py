"""User and UserSettings models (Task 4)."""

import datetime
from enum import Enum

from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.database import Base
from backend.models.enum_utils import enum_values


class SupportedLanguage(str, Enum):
    EN = "en"
    ZH = "zh"


class InterfaceTheme(str, Enum):
    LIGHT = "light"
    DARK = "dark"


class HITLProfile(str, Enum):
    NOVICE = "Novice"
    EXPERIENCED = "Experienced"
    EXPERT = "Expert"


class ThinkingDepth(str, Enum):
    INSTANT = "Instant"
    MEDIUM = "Medium"
    HEAVY = "Heavy"


class User(Base):
    """User model for authentication and ownership."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    settings = relationship(
        "UserSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    # Relationship to Project model, with cascading delete.
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    workflows = relationship("WorkflowInstance", back_populates="user", cascade="all, delete-orphan")
    nodes = relationship("NodeInstance", back_populates="user")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"


class UserSettings(Base):
    """User-specific settings for interface, behavior, and BYOK configuration."""

    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    language = Column(
        SAEnum(SupportedLanguage, name="supportedlanguage", values_callable=enum_values),
        default=SupportedLanguage.EN,
        nullable=False,
    )
    theme = Column(
        SAEnum(InterfaceTheme, name="interfacetheme", values_callable=enum_values),
        default=InterfaceTheme.LIGHT,
        nullable=False,
    )

    hitl_profile = Column(
        SAEnum(HITLProfile, name="hitlprofile", values_callable=enum_values),
        default=HITLProfile.EXPERIENCED,
        nullable=False,
    )
    thinking_depth = Column(
        SAEnum(ThinkingDepth, name="thinkingdepth", values_callable=enum_values),
        default=ThinkingDepth.MEDIUM,
        nullable=False,
    )

    llm_model_name = Column(String, nullable=True)
    llm_base_url = Column(String, nullable=True)
    llm_api_key_encrypted = Column(String, nullable=True)
    e2b_api_key_encrypted = Column(String, nullable=True)

    user = relationship("User", back_populates="settings")

    def __repr__(self) -> str:
        return f"<UserSettings(id={self.id}, user_id={self.user_id})>"
