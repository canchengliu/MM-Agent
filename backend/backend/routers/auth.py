"""API endpoints for user authentication and registration."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.auth.security import create_access_token
from backend.auth.service import AuthService
from backend.database import get_db
from backend.exceptions import InvalidStateException
from backend.schemas.auth import (
    EmailVerificationRequest,
    PasswordResetCompletion,
    PasswordResetRequest,
    ResendVerificationRequest,
    Token,
)
from backend.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_auth_service() -> AuthService:
    """Provide an AuthService instance for request-scoped dependencies."""
    return AuthService()


@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Authenticate user credentials and return a JWT access token."""
    user = auth_service.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not verified. Please check your email.",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Register a new user account."""
    try:
        new_user = auth_service.register_user(db, user_in=user_in)
        auth_service.send_verification_email(db, new_user)
        return new_user
    except InvalidStateException as exc:
        raise exc


@router.post("/verify-email", response_model=UserRead)
def verify_email(
    request: EmailVerificationRequest,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Verify the user's email address using the provided token."""
    return auth_service.verify_email(db, request.token)


@router.post("/resend-verification-email", status_code=status.HTTP_202_ACCEPTED)
def resend_verification_email(
    request: ResendVerificationRequest,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Resend the verification email."""
    auth_service.handle_resend_verification(db, request.email)
    return {"message": "If the account exists and is not verified, a verification email has been sent."}


@router.post("/request-password-reset", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Initiate the password reset flow."""
    auth_service.initiate_password_reset(db, request.email)
    return {"message": "If an account with this email exists, a password reset link has been sent."}


@router.post("/complete-password-reset", status_code=status.HTTP_200_OK)
async def complete_password_reset(
    request: PasswordResetCompletion,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Complete the password reset using the token provided via email."""
    auth_service.complete_password_reset(db, request.token, request.new_password)
    return {"message": "Password has been reset successfully."}
