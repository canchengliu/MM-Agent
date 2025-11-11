"""API endpoints for user authentication and registration."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.auth.security import create_access_token
from backend.auth.service import AuthService
from backend.database import get_db
from backend.exceptions import InvalidStateException
from backend.schemas.auth import Token
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
        return auth_service.register_user(db, user_in=user_in)
    except InvalidStateException as exc:
        raise exc


@router.post("/reset-password", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(auth_service: AuthService = Depends(get_auth_service)):
    """Stub endpoint for initiating password reset flow."""
    auth_service.reset_password()
    return {"message": "If an account with this email exists, a password reset link has been sent."}

