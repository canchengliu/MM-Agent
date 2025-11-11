"""API endpoints for managing the current user's profile and settings."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user
from backend.auth.service import AuthService
from backend.database import get_db
from backend.models.user import User
from backend.schemas.user import PasswordChange, UserRead, UserSettingsRead, UserSettingsUpdate
from backend.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service() -> UserService:
    """Provide a UserService instance for request-scoped dependencies."""
    return UserService()


def get_auth_service() -> AuthService:
    """Provide an AuthService instance."""
    return AuthService()


@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_active_verified_user)):
    """Return the authenticated user's profile."""
    return current_user


@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    password_change: PasswordChange,
    current_user: User = Depends(get_current_active_verified_user),
    auth_service: AuthService = Depends(get_auth_service),
    db: Session = Depends(get_db),
):
    """Change the authenticated user's password."""
    auth_service.change_password(db, current_user, password_change)
    return None


@router.get("/me/settings", response_model=UserSettingsRead)
async def read_user_settings(
    current_user: User = Depends(get_current_active_verified_user),
    user_service: UserService = Depends(get_user_service),
    db: Session = Depends(get_db),
):
    """Fetch the authenticated user's settings."""
    # The service now directly returns the response model.
    return user_service.get_settings(db, user=current_user)


@router.patch("/me/settings", response_model=UserSettingsRead)
async def update_user_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_verified_user),
    user_service: UserService = Depends(get_user_service),
    db: Session = Depends(get_db),
):
    """Update the authenticated user's settings."""
    # The service now handles the update and returns the response model directly.
    return user_service.update_settings(db, user=current_user, settings_in=settings_in)
