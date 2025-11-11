"""
Service layer for user authentication and lifecycle management.
Orchestrates user registration, credential verification (login), and
provides stubs for email verification and password reset flows.
"""
from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.security import get_password_hash, verify_password
from backend.exceptions import InvalidStateException
from backend.models.user import User, UserSettings
from backend.schemas.user import UserCreate


class AuthService:
    """Service for user authentication and lifecycle management."""

    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Fetches a user by their email address."""
        return db.query(User).filter(User.email == email).first()

    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user by email and password.

        Args:
            db: The database session.
            email: The user's email.
            password: The user's plain-text password.

        Returns:
            The authenticated User object if credentials are valid, otherwise None.
        """
        user = self.get_user_by_email(db, email)
        if not user or not user.is_active:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    def register_user(self, db: Session, user_in: UserCreate) -> User:
        """
        Register a new user and create their default settings atomically.

        Args:
            db: The database session.
            user_in: A Pydantic model containing user creation data.

        Returns:
            The newly created User object.

        Raises:
            InvalidStateException: If a user with the email already exists.
        """
        if self.get_user_by_email(db, user_in.email):
            raise InvalidStateException(
                f"User with email '{user_in.email}' already exists.",
                error_code="USER_ALREADY_EXISTS",
            )

        hashed_password = get_password_hash(user_in.password)
        new_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            display_name=user_in.display_name or user_in.email.split("@")[0],
            is_active=True,
            is_verified=False,
        )
        new_user.settings = UserSettings()

        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            logger.info("New user registered successfully", user_id=new_user.id, email=new_user.email)
            return new_user
        except Exception:
            db.rollback()
            logger.exception("Failed to register new user. Transaction rolled back.", email=user_in.email)
            raise

    def verify_email(self) -> None:
        """
        (STUB) Business logic for handling email verification.
        This would typically involve validating a token sent to the user's email.
        """
        logger.warning("STUB: Email verification logic is not implemented.")
        pass

    def reset_password(self) -> None:
        """
        (STUB) Business logic for handling password reset requests.
        This would involve generating a secure token and sending a reset link.
        """
        logger.warning("STUB: Password reset logic is not implemented.")
        pass
