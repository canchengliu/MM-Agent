"""Pydantic schemas for authentication flows."""

from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    """Schema for the JWT access token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for the data encoded within the JWT."""

    # The 'sub' (subject) claim will hold the user ID.
    sub: Optional[str] = None

