"""
Service layer for user authentication and lifecycle management.
Orchestrates user registration, credential verification (login), and
provides stubs for email verification and password reset flows.
"""
from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.security import (
    TokenType,
    create_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from backend.exceptions import ForbiddenException, InvalidStateException, WorkflowException
from backend.models.user import User, UserSettings
from backend.schemas.user import PasswordChange, UserCreate


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
    def change_password(self, db: Session, user: User, password_change: PasswordChange) -> None:
        """Change the password for an authenticated user."""
        if not verify_password(password_change.current_password, user.hashed_password):
            raise ForbiddenException("Incorrect current password.")

        new_hashed_password = get_password_hash(password_change.new_password)
        user.hashed_password = new_hashed_password
        db.commit()
        logger.info("Password changed successfully for user {}", user.id)

    def send_verification_email(self, db: Session, user: User) -> None:
        """Generate a verification token and simulate sending an email."""
        if user.is_verified:
            return

        token = create_token(data={"sub": str(user.id)}, token_type=TokenType.EMAIL_VERIFICATION)
        logger.info("SIMULATION: Sending verification email to {}", user.email)
        print(f"SIMULATION: Verification Token for {user.email}: {token}")

    def handle_resend_verification(self, db: Session, email: str) -> None:
        """Handles the request to resend verification."""
        user = self.get_user_by_email(db, email)
        if user:
            self.send_verification_email(db, user)
        else:
            logger.info("Resend verification requested for unknown email: {}", email)

    def verify_email(self, db: Session, token: str) -> User:
        """Verify the user's email using the provided token."""
        payload = decode_token(token, TokenType.EMAIL_VERIFICATION)
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise WorkflowException("Invalid token payload.", status_code=400)

        try:
            user_id = int(user_id_str)
        except ValueError as exc:
            raise WorkflowException("Invalid user ID in token.", status_code=400) from exc

        user = db.get(User, user_id)
        if not user:
            raise WorkflowException("User not found.", status_code=404)

        if user.is_verified:
            return user

        user.is_verified = True
        db.commit()
        db.refresh(user)
        logger.info("Email verified successfully for user {}", user.id)
        return user

    def initiate_password_reset(self, db: Session, email: str) -> None:
        """Generate a password reset token and simulate sending an email (R1.3)."""
        user = self.get_user_by_email(db, email)

        if user and user.is_active:
            token = create_token(data={"sub": str(user.id)}, token_type=TokenType.PASSWORD_RESET)
            logger.info("SIMULATION: Sending password reset email to {}", user.email)
            print(f"SIMULATION: Password Reset Token for {user.email}: {token}")
        else:
            logger.info("Password reset requested for email: {}. Silently handling.", email)

    def complete_password_reset(self, db: Session, token: str, new_password: str) -> None:
        """Verify the reset token and update the user's password (R1.3)."""
        payload = decode_token(token, TokenType.PASSWORD_RESET)
        user_id_str = payload.get("sub")

        if not user_id_str:
            raise WorkflowException("Invalid token payload.", status_code=400)

        try:
            user_id = int(user_id_str)
            user = db.get(User, user_id)
        except (ValueError, TypeError):
            raise WorkflowException("Invalid or expired token.", status_code=400)

        if not user:
            raise WorkflowException("Invalid or expired token.", status_code=400)

        if not user.is_active:
            raise ForbiddenException("Cannot reset password for an inactive account.")

        user.hashed_password = get_password_hash(new_password)
        db.commit()
        logger.info("Password reset successfully completed for user {}", user.id)
