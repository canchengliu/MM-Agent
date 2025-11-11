"""API endpoints for managing the current user's profile and settings."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user
from backend.database import get_db
from backend.models.user import User
from backend.schemas.user import UserRead, UserSettingsRead, UserSettingsUpdate
from backend.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service() -> UserService:
    """Provide a UserService instance for request-scoped dependencies."""
    return UserService()


@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_active_verified_user)):
    """Return the authenticated user's profile."""
    return current_user


@router.get("/me/settings", response_model=UserSettingsRead)
async def read_user_settings(
    current_user: User = Depends(get_current_active_verified_user),
    user_service: UserService = Depends(get_user_service),
    db: Session = Depends(get_db),
):
    """Fetch the authenticated user's settings."""
    settings = user_service.get_settings(db, user=current_user)
    return UserSettingsRead(
        language=settings.language,
        theme=settings.theme,
        hitl_profile=settings.hitl_profile,
        thinking_depth=settings.thinking_depth,
        llm_model_name=settings.llm_model_name,
        llm_base_url=settings.llm_base_url,
        has_llm_api_key=bool(settings.llm_api_key_encrypted),
        has_e2b_api_key=bool(settings.e2b_api_key_encrypted),
    )


@router.patch("/me/settings", response_model=UserSettingsRead)
async def update_user_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_verified_user),
    user_service: UserService = Depends(get_user_service),
    db: Session = Depends(get_db),
):
    """Update the authenticated user's settings."""
    updated_settings = user_service.update_settings(db, user=current_user, settings_in=settings_in)
    return UserSettingsRead(
        language=updated_settings.language,
        theme=updated_settings.theme,
        hitl_profile=updated_settings.hitl_profile,
        thinking_depth=updated_settings.thinking_depth,
        llm_model_name=updated_settings.llm_model_name,
        llm_base_url=updated_settings.llm_base_url,
        has_llm_api_key=bool(updated_settings.llm_api_key_encrypted),
        has_e2b_api_key=bool(updated_settings.e2b_api_key_encrypted),
    )

