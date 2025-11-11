"""
FastAPI dependencies for authentication and authorization.

Provides reusable dependency functions that decode JWTs and ensure the
current user is active and verified before accessing protected endpoints.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError, jwt
from loguru import logger
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db
from backend.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Decode the JWT access token and fetch the corresponding user."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
    except JWTError:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except (TypeError, ValueError):
        raise credentials_exception

    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_verified_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensure the authenticated user is both active and verified.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account.")
    if not current_user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is not verified.")
    return current_user


async def get_user_from_token(token: str, db: Session) -> Optional[User]:
    """
    Decode a JWT specifically for WebSocket auth flows.

    Returns the user instance or None so callers can close the connection with a
    custom code instead of raising HTTPException.
    """
    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            logger.warning("WebSocket auth failed: 'sub' claim missing in token.")
            return None

        user_id = int(user_id_str)
        user = db.get(User, user_id)
        if user is None:
            logger.warning(
                "WebSocket auth failed: User ID {user_id} from token not found in DB.",
                user_id=user_id,
            )
            return None

        return user
    except ExpiredSignatureError:
        logger.info("WebSocket auth failed: Token has expired.")
        return None
    except (JWTError, ValueError, TypeError) as exc:
        logger.warning("WebSocket auth failed due to malformed token: {}", str(exc))
        return None
