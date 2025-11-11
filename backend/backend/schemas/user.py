"""Pydantic schemas for user creation and settings updates."""

from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from backend.models.user import HITLProfile, InterfaceTheme, SupportedLanguage, ThinkingDepth


class UserCreate(BaseModel):
    """Schema for creating a new user."""

    email: EmailStr
    password: str
    display_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        """Enforce minimum password requirements per FRS 1.1."""
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return value


class UserSettingsUpdate(BaseModel):
    """
    Schema for updating user settings. All fields are optional.
    API keys are received in plaintext and encrypted by the service.
    """

    language: Optional[SupportedLanguage] = None
    theme: Optional[InterfaceTheme] = None
    hitl_profile: Optional[HITLProfile] = None
    thinking_depth: Optional[ThinkingDepth] = None
    llm_model_name: Optional[str] = None
    llm_base_url: Optional[str] = None
    llm_api_key: Optional[str] = None  # Plaintext for input
    e2b_api_key: Optional[str] = None  # Plaintext for input


class UserRead(BaseModel):
    """Schema for reading user profile data, excluding sensitive info."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    display_name: Optional[str] = None
    is_active: bool
    is_verified: bool


class UserSettingsRead(BaseModel):
    """Schema for reading user settings, excluding sensitive info."""

    model_config = ConfigDict(from_attributes=True)

    language: SupportedLanguage
    theme: InterfaceTheme
    hitl_profile: HITLProfile
    thinking_depth: ThinkingDepth
    llm_model_name: Optional[str] = None
    llm_base_url: Optional[str] = None
    has_llm_api_key: bool
    has_e2b_api_key: bool
