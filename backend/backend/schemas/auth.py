"""Pydantic schemas for authentication flows."""

from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


class Token(BaseModel):
    """Schema for the JWT access token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for the data encoded within the JWT."""

    # The 'sub' (subject) claim will hold the user ID.
    sub: Optional[str] = None


class EmailVerificationRequest(BaseModel):
    """Schema for verifying email."""

    token: str


class ResendVerificationRequest(BaseModel):
    """Schema for requesting a new verification email."""

    email: EmailStr


class PasswordResetRequest(BaseModel):
    """Schema for initiating password reset."""

    email: EmailStr


class PasswordResetCompletion(BaseModel):
    """Schema for completing the password reset process."""

    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, value: str) -> str:
        from backend.schemas.user import _validate_password_strength

        return _validate_password_strength(value)
