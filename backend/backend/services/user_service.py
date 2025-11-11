"""Service for managing user-specific settings, including BYOK credentials."""

from typing import Any, Dict

from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.security import decrypt_data, encrypt_data
from backend.config import settings
from backend.models.user import User, UserSettings
from backend.schemas.user import UserSettingsUpdate


class UserService:
    """Service for managing user-specific settings."""

    def get_settings(self, db: Session, user: User) -> UserSettings:
        """
        Retrieve settings for a given user.

        Args:
            db: The database session.
            user: The user object.

        Returns:
            The UserSettings object associated with the user.
        """
        if not user.settings:
            logger.critical(
                "Data integrity error: UserSettings not found for an existing user. "
                "This should not happen as they are created during registration.",
                user_id=user.id,
            )
            raise Exception(f"CRITICAL: No settings found for user {user.id}")
        return user.settings

    def update_settings(self, db: Session, user: User, settings_in: UserSettingsUpdate) -> UserSettings:
        """
        Update user settings, securely encrypting API keys before storage.

        Args:
            db: The database session.
            user: The user whose settings are being updated.
            settings_in: A Pydantic model with optional fields to update.

        Returns:
            The updated UserSettings object.
        """
        user_settings = self.get_settings(db, user)
        update_data = settings_in.model_dump(exclude_unset=True)

        try:
            for key, value in update_data.items():
                if key == "llm_api_key":
                    user_settings.llm_api_key_encrypted = encrypt_data(value) if value else None
                elif key == "e2b_api_key":
                    user_settings.e2b_api_key_encrypted = encrypt_data(value) if value else None
                elif hasattr(user_settings, key):
                    setattr(user_settings, key, value)

            db.commit()
            db.refresh(user_settings)
            logger.info("User settings updated successfully.", user_id=user.id)
            return user_settings
        except Exception:
            db.rollback()
            logger.exception("Failed to update user settings.", user_id=user.id)
            raise

    def get_decrypted_settings(self, db: Session, user: User) -> Dict[str, Any]:
        """
        Retrieve user settings with sensitive values decrypted for internal use.
        This is critical for creating the project's configuration snapshot.

        Args:
            db: The database session.
            user: The user object.

        Returns:
            A dictionary of settings with decrypted API keys.
        """
        user_settings = self.get_settings(db, user)

        # Explicitly construct the dictionary to avoid accidentally exposing
        # internal fields (like id, user_id) and to provide a stable contract.
        decrypted_settings = {
            "language": user_settings.language.value,
            "theme": user_settings.theme.value,
            "hitl_profile": user_settings.hitl_profile.value,
            "thinking_depth": user_settings.thinking_depth.value,
            "llm_model_name": user_settings.llm_model_name or settings.LLM_MODEL_NAME,
            "llm_base_url": user_settings.llm_base_url or settings.LLM_BASE_URL,
            "llm_provider": settings.LLM_PROVIDER,
            "llm_api_key": settings.LLM_API_KEY,
            "e2b_api_key": settings.E2B_API_KEY,
        }

        try:
            if user_settings.llm_api_key_encrypted:
                decrypted_settings["llm_api_key"] = decrypt_data(user_settings.llm_api_key_encrypted)
        except Exception:
            logger.warning(
                "Failed to decrypt LLM API key for user. Falling back to default.", user_id=user.id
            )
            decrypted_settings["llm_api_key"] = decrypted_settings.get("llm_api_key") or settings.LLM_API_KEY

        try:
            if user_settings.e2b_api_key_encrypted:
                decrypted_settings["e2b_api_key"] = decrypt_data(user_settings.e2b_api_key_encrypted)
        except Exception:
            logger.warning("Failed to decrypt E2B API key for user. Proceeding without it.", user_id=user.id)
            decrypted_settings["e2b_api_key"] = decrypted_settings.get("e2b_api_key")

        return decrypted_settings
