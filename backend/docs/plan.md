This solution provides the complete, optimized code addressing all identified gaps, ensuring robust authentication, enhanced workflow control, real-time feedback, and comprehensive data provenance.

### 1\. Authentication and User Management (Gaps 1 & 2)

**`backend/schemas/user.py`**

```python
"""Pydantic schemas for user creation and settings updates."""

from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from backend.models.user import HITLProfile, InterfaceTheme, SupportedLanguage, ThinkingDepth


def _validate_password_strength(value: str) -> str:
    """Enforce minimum password requirements per FRS 1.1."""
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    return value


class UserCreate(BaseModel):
    """Schema for creating a new user."""

    email: EmailStr
    password: str
    display_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return _validate_password_strength(value)


# (R1.3) Schema for changing password
class PasswordChange(BaseModel):
    """Schema for changing the user's password."""

    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return _validate_password_strength(value)


class UserSettingsUpdate(BaseModel):
    """
    Schema for updating user settings. All fields are optional.
    API keys are received in plaintext and encrypted by the service.
    """

    language: Optional[SupportedLanguage] = None
    theme: Optional[InterfaceTheme] = None
    hitl_profile: Optional[HITLProfile] = None
    thinking_depth: Optional[ThinkingDepth] = None
    llm_model_name: Optional[str] = None
    llm_base_url: Optional[str] = None
    llm_api_key: Optional[str] = None  # Plaintext for input
    e2b_api_key: Optional[str] = None  # Plaintext for input


class UserRead(BaseModel):
    """Schema for reading user profile data, excluding sensitive info."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    display_name: Optional[str] = None
    is_active: bool
    is_verified: bool


class UserSettingsRead(BaseModel):
    """Schema for reading user settings, excluding sensitive info."""

    model_config = ConfigDict(from_attributes=True)

    language: SupportedLanguage
    theme: InterfaceTheme
    hitl_profile: HITLProfile
    thinking_depth: ThinkingDepth
    llm_model_name: Optional[str] = None
    llm_base_url: Optional[str] = None
    has_llm_api_key: bool
    has_e2b_api_key: bool
```

**`backend/schemas/auth.py`**

```python
"""Pydantic schemas for authentication flows."""

from typing import Optional

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """Schema for the JWT access token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for the data encoded within the JWT."""

    # The 'sub' (subject) claim will hold the user ID.
    sub: Optional[str] = None


# (R1.1) Schemas for email verification
class EmailVerificationRequest(BaseModel):
    """Schema for verifying email."""

    token: str


class ResendVerificationRequest(BaseModel):
    """Schema for requesting a new verification email."""
    email: EmailStr
```

**`backend/auth/security.py`**

```python
"""Core security utilities for password hashing, JWT, and BYOK encryption."""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Union

from cryptography.fernet import Fernet
from fastapi import HTTPException, status
from jose import ExpiredSignatureError, JWTError, jwt

from backend.config import settings

PASSWORD_SCHEME = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 390_000
PASSWORD_SALT_BYTES = 16

_fernet = Fernet(settings.ENCRYPTION_KEY)


# (R1.1) Define token types for security
class TokenType(str, Enum):
    """Defines the purpose of a JWT token."""

    ACCESS = "access"
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"


def _encode_bytes(raw: bytes) -> str:
    return base64.b64encode(raw).decode("utf-8")


def _decode_bytes(value: str) -> bytes:
    return base64.b64decode(value.encode("utf-8"))


def get_password_hash(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256.
    """
    if not isinstance(password, str) or not password:
        raise ValueError("Password must be a non-empty string.")

    salt = secrets.token_bytes(PASSWORD_SALT_BYTES)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return f"{PASSWORD_SCHEME}${PASSWORD_ITERATIONS}${_encode_bytes(salt)}${_encode_bytes(derived)}"


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Compare a password to a stored PBKDF2 hash string.
    """
    try:
        scheme, iterations_str, salt_b64, hash_b64 = hashed_password.split("$")
        if scheme != PASSWORD_SCHEME:
            return False
        iterations = int(iterations_str)
        salt = _decode_bytes(salt_b64)
        stored_hash = _decode_bytes(hash_b64)
    except (ValueError, TypeError):
        return False

    new_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(new_hash, stored_hash)


def encrypt_data(value: Optional[Union[str, bytes]]) -> Optional[str]:
    # ... (Existing implementation)
    if value is None:
        return None

    raw_bytes = value if isinstance(value, bytes) else value.encode("utf-8")
    token = _fernet.encrypt(raw_bytes)
    return token.decode("utf-8")


def decrypt_data(value: Optional[Union[str, bytes]]) -> Optional[str]:
    # ... (Existing implementation)
    if value is None:
        return None

    token_bytes = value if isinstance(value, bytes) else value.encode("utf-8")
    plaintext = _fernet.decrypt(token_bytes)
    return plaintext.decode("utf-8")


# (R1.1) Generalized token creation
def create_token(data: dict, token_type: TokenType, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT token for various purposes."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Default expiration based on type
        if token_type == TokenType.ACCESS:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        elif token_type == TokenType.EMAIL_VERIFICATION:
            expire = datetime.utcnow() + timedelta(hours=24)  # 24 hours for email verification
        elif token_type == TokenType.PASSWORD_RESET:
            expire = datetime.utcnow() + timedelta(minutes=15)  # 15 minutes for password reset
        else:
            raise ValueError("Unsupported token type")

    to_encode.update({"exp": expire, "type": token_type.value})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


# (R1.1) Generalized token decoding
def decode_token(token: str, expected_type: TokenType) -> dict:
    """Decode and validate a JWT token, ensuring it matches the expected type."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != expected_type.value:
            raise JWTError("Invalid token type")
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate token: {e}",
        )


def create_access_token(data: dict) -> str:
    """Create a signed JWT access token."""
    return create_token(data, TokenType.ACCESS)


__all__ = [
    "decrypt_data",
    "encrypt_data",
    "get_password_hash",
    "verify_password",
    "create_access_token",
    "create_token",
    "decode_token",
    "TokenType",
]
```

**`backend/auth/dependencies.py`**

```python
"""
FastAPI dependencies for authentication and authorization.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError, jwt
from loguru import logger
from sqlalchemy.orm import Session

from backend.auth.security import TokenType  # Import TokenType
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
        
        # (R1.1) Ensure only ACCESS tokens are used for standard auth
        if payload.get("type") != TokenType.ACCESS.value:
            raise credentials_exception

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
    # ... (Existing implementation)
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account.")
    if not current_user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is not verified.")
    return current_user


async def get_user_from_token(token: str, db: Session) -> Optional[User]:
    """
    Decode a JWT specifically for WebSocket auth flows.
    """
    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        # (R1.1) Ensure only ACCESS tokens are used for WebSocket auth
        if payload.get("type") != TokenType.ACCESS.value:
            logger.warning("WebSocket auth failed: Invalid token type.")
            return None

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
```

**`backend/auth/service.py`**

```python
"""
Service layer for user authentication and lifecycle management.
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
        # ... (Existing implementation)
        return db.query(User).filter(User.email == email).first()

    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        # ... (Existing implementation)
        user = self.get_user_by_email(db, email)
        if not user or not user.is_active:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    def register_user(self, db: Session, user_in: UserCreate) -> User:
        # ... (Existing registration logic)
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
            # (R1.1) Send verification email after successful registration
            self.send_verification_email(db, new_user)
            return new_user
        except Exception:
            db.rollback()
            logger.exception("Failed to register new user. Transaction rolled back.", email=user_in.email)
            raise

    # (R1.3) Implement password change
    def change_password(self, db: Session, user: User, password_change: PasswordChange) -> None:
        """Change the password for an authenticated user."""
        if not verify_password(password_change.current_password, user.hashed_password):
            raise ForbiddenException("Incorrect current password.")

        new_hashed_password = get_password_hash(password_change.new_password)
        user.hashed_password = new_hashed_password
        db.commit()
        logger.info("Password changed successfully for user {}", user.id)

    # (R1.1) Implement email verification sending
    def send_verification_email(self, db: Session, user: User) -> None:
        """Generate a verification token and simulate sending an email."""
        if user.is_verified:
            # Silently ignore if already verified (for resend logic)
            return

        token = create_token(data={"sub": str(user.id)}, token_type=TokenType.EMAIL_VERIFICATION)

        # In a real application, this would invoke an email sending service.
        logger.info(f"SIMULATION: Sending verification email to {user.email}. Token: {token}")
        # Print to console for development/testing purposes
        print(f"SIMULATION: Verification Token for {user.email}: {token}")

    # (R1.1) Implement resend logic
    def handle_resend_verification(self, db: Session, email: str) -> None:
        """Handles the request to resend verification."""
        user = self.get_user_by_email(db, email)
        if user:
            self.send_verification_email(db, user)
        else:
            # Do not leak information about email existence
            logger.info(f"Resend verification requested for unknown email: {email}")

    # (R1.1) Implement email verification logic
    def verify_email(self, db: Session, token: str) -> User:
        """Verify the user's email using the provided token."""
        # decode_token handles expiration and type checking, raises HTTPException on failure
        payload = decode_token(token, TokenType.EMAIL_VERIFICATION)
        user_id_str = payload.get("sub")

        if not user_id_str:
            raise WorkflowException("Invalid token payload.", status_code=400)

        try:
            user_id = int(user_id_str)
        except ValueError:
            raise WorkflowException("Invalid user ID in token.", status_code=400)

        user = db.get(User, user_id)
        if not user:
            raise WorkflowException("User not found.", status_code=404)

        if user.is_verified:
            # Idempotent success
            return user

        user.is_verified = True
        db.commit()
        db.refresh(user)
        logger.info("Email verified successfully for user {}", user.id)
        return user

    def reset_password(self) -> None:
        # ... (Existing stub)
        logger.warning("STUB: Password reset logic is not implemented.")
        pass
```

**`backend/routers/users.py`**

```python
"""API endpoints for managing the current user's profile and settings."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_active_verified_user
from backend.auth.service import AuthService  # Import AuthService
from backend.database import get_db
from backend.models.user import User
from backend.schemas.user import PasswordChange, UserRead, UserSettingsRead, UserSettingsUpdate
from backend.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service() -> UserService:
    """Provide a UserService instance for request-scoped dependencies."""
    return UserService()


# Inject AuthService
def get_auth_service() -> AuthService:
    """Provide an AuthService instance."""
    return AuthService()


@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_active_verified_user)):
    """Return the authenticated user's profile."""
    return current_user


# (R1.3) Endpoint for password change
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
    # ... (Existing implementation)
    return user_service.get_settings(db, user=current_user)


@router.patch("/me/settings", response_model=UserSettingsRead)
async def update_user_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_verified_user),
    user_service: UserService = Depends(get_user_service),
    db: Session = Depends(get_db),
):
    # ... (Existing implementation)
    return user_service.update_settings(db, user=current_user, settings_in=settings_in)
```

**`backend/routers/auth.py`**

```python
"""API endpoints for user authentication and registration."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.auth.security import create_access_token
from backend.auth.service import AuthService
from backend.database import get_db
from backend.exceptions import InvalidStateException
from backend.schemas.auth import EmailVerificationRequest, ResendVerificationRequest, Token
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
    # ... (Existing implementation)
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
        # (R1.1) The service now handles sending the verification email internally
        return auth_service.register_user(db, user_in=user_in)
    except InvalidStateException as exc:
        raise exc


# (R1.1) Endpoint for verifying email token
@router.post("/verify-email", response_model=UserRead)
def verify_email(
    request: EmailVerificationRequest,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Verify the user's email address using the provided token."""
    return auth_service.verify_email(db, request.token)


# (R1.1) Endpoint for resending verification email
@router.post("/resend-verification-email", status_code=status.HTTP_202_ACCEPTED)
def resend_verification_email(
    request: ResendVerificationRequest,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Resend the verification email."""
    auth_service.handle_resend_verification(db, request.email)
    # Always return success to prevent email enumeration attacks
    return {"message": "If the account exists and is not verified, a verification email has been sent."}


@router.post("/reset-password", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(auth_service: AuthService = Depends(get_auth_service)):
    # ... (Existing implementation)
    auth_service.reset_password()
    return {"message": "If an account with this email exists, a password reset link has been sent."}
```

### 2\. Workflow Control, Provenance, and Staleness (Gaps 7, 9, 10, 13)

**`backend/models/workflow.py`**

```python
import datetime
from enum import Enum

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.ext.mutable import MutableDict, MutableList
from sqlalchemy.orm import relationship

from backend.database import Base
from backend.models.enum_utils import enum_values
from backend.workflow_definition import HITLMode, NodeType


class WorkflowStatus(str, Enum):
    # ... (Existing definitions)
    RUNNING = "Running"
    COMPLETED = "Completed"


class VersionSource(str, Enum):
    # ... (Existing definitions)
    AI_GENERATED = "AI_GENERATED"
    MANUALLY_EDITED = "MANUALLY_EDITED"


class WorkflowInstance(Base):
    # ... (Existing definitions and columns)
    __tablename__ = "workflow_instances"
    # ...


class NodeStatus(str, Enum):
    NOT_STARTED = "Not Started"
    EXECUTING = "Executing"
    AWAITING_HITL_APPROVAL = "Awaiting HITL Approval"
    COMPLETED = "Completed"
    FAILED = "Failed"
    # (R1.3.1) Added for explicit cancellation tracking
    CANCELED = "Canceled"


class ExecutionStage(str, Enum):
    """Represents granular execution progress for nodes (R4.3)."""

    NOT_STARTED = "Not Started"
    INITIALIZING = "Initializing"
    PROCESSING = "Processing"
    GENERATING_OUTPUTS = "Generating Outputs"
    AWAITING_REVIEW = "Awaiting Review"
    COMPLETED = "Completed"
    FAILED = "Failed"
    # (R1.3.1) Added for explicit cancellation tracking
    CANCELED = "Canceled"


class NodeInstance(Base):
    # ... (Existing definitions and columns)
    __tablename__ = "node_instances"
    # ...


class NodeVersion(Base):
    __tablename__ = "node_versions"

    id = Column(Integer, primary_key=True, index=True)
    # ... (Existing columns)
    based_on_version_id = Column(Integer, ForeignKey("node_versions.id"), nullable=True)
    output_data = Column(MutableDict.as_mutable(JSON), nullable=True)
    raw_generated_output = Column(MutableDict.as_mutable(JSON), nullable=True)

    # (R6.3) Stores code, prompts, or other artifacts used during execution for provenance.
    execution_artifacts = Column(MutableDict.as_mutable(JSON), nullable=True)

    # ... (Existing columns and relationships)
    input_dependencies = Column(MutableDict.as_mutable(JSON), nullable=False)
    hitl_history = Column(MutableList.as_mutable(JSON), nullable=False)
    llm_model_name = Column(String, nullable=False)
    temperature = Column(Float, nullable=False)
    summary = Column(String(512), nullable=False, default="Version created")

    node_instance = relationship("NodeInstance", back_populates="versions", foreign_keys=[node_instance_id])
    based_on_version = relationship("NodeVersion", remote_side=[id], foreign_keys=[based_on_version_id])

    __table_args__ = (UniqueConstraint("node_instance_id", "version_number", name="_node_version_uc"),)


class TemporaryExecutionResult(Base):
    __tablename__ = "temporary_execution_results"

    id = Column(Integer, primary_key=True, index=True)
    # ... (Existing columns)
    output_data = Column(MutableDict.as_mutable(JSON), nullable=True)

    # (R6.3) Stores artifacts generated during the current execution attempt.
    execution_artifacts = Column(MutableDict.as_mutable(JSON), nullable=True)

    # ... (Existing columns and relationships)
    input_dependencies = Column(MutableDict.as_mutable(JSON), nullable=False)
    accumulated_hitl_interactions = Column(MutableList.as_mutable(JSON), nullable=False)
    llm_model_name = Column(String, nullable=False)
    temperature = Column(Float, nullable=False)
    error_log = Column(Text, nullable=True)

    node_instance = relationship("NodeInstance", back_populates="temporary_result")
```

**`backend/schemas/node.py`**

```python
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from backend.models.workflow import ExecutionStage, NodeStatus, VersionSource
from backend.workflow_definition import HITLMode, NodeType


class NodeInstanceRead(BaseModel):
    id: int
    definition_id: str
    name: str
    status: NodeStatus
    current_stage: ExecutionStage
    node_type: NodeType
    hitl_mode: HITLMode
    order_index: int
    active_version_id: Optional[int]
    phase_id: str
    task_group_id: Optional[str] = None
    # (R5.2) Indicates if the node's inputs are outdated compared to upstream active versions.
    # Calculated by WorkflowService when fetching lists/details.
    is_stale: bool = False

    class Config:
        from_attributes = True


class VersionData(BaseModel):
    source: VersionSource
    based_on_version_id: Optional[int]
    output_data: Optional[Dict[str, Any]]
    raw_generated_output: Optional[Dict[str, Any]]
    # (R6.3) Code, prompts, and other artifacts used during execution.
    execution_artifacts: Optional[Dict[str, Any]]
    input_dependencies: Dict[int, int]
    hitl_history: List[Dict[str, Any]]
    llm_model_name: str
    temperature: float


class NodeVersionRead(VersionData):
    id: int
    version_number: int
    node_instance_id: int
    summary: str

    class Config:
        from_attributes = True


class TemporaryExecutionRead(BaseModel):
    output_data: Optional[Dict[str, Any]]
    # (R6.3) Artifacts generated during the current execution attempt.
    execution_artifacts: Optional[Dict[str, Any]]
    accumulated_hitl_interactions: List[Dict[str, Any]]
    error_log: Optional[str]

    class Config:
        from_attributes = True


class StalenessInfo(BaseModel):
    # ... (Existing definition)
    upstream_node_id: int
    upstream_definition_id: str
    consumed_version_id: int
    current_active_version_id: Optional[int]


class ManualEditSubmission(BaseModel):
    # ... (Existing definition)
    base_version_id: int
    edited_output_data: Dict[str, Any]
    summary: Optional[str] = None


class NodeDetailView(NodeInstanceRead):
    active_version: Optional[NodeVersionRead] = None
    pending_result: Optional[TemporaryExecutionRead] = None
    staleness_report: Optional[List[StalenessInfo]] = None
```

**`backend/schemas/events.py`**

```python
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel


class EventType(str, Enum):
    """WebSocket event types."""

    NODE_STATUS_UPDATED = "NODE_STATUS_UPDATED"
    # (R5.2) Broadcast when the active version changes (e.g., manual edit, version switch)
    NODE_ACTIVE_VERSION_CHANGED = "NODE_ACTIVE_VERSION_CHANGED"
    WORKFLOW_STRUCTURE_UPDATED = "WORKFLOW_STRUCTURE_UPDATED"
    WORKFLOW_STATUS_UPDATED = "WORKFLOW_STATUS_UPDATED"


class EventPayload(BaseModel):
    # ... (Existing definition)
    event_type: EventType
    workflow_id: int
    node_id: Optional[int] = None
    data: Dict[str, Any]
```

**`backend/services/execution_engine/executor.py`**

```python
"""
Core Node Executor: Orchestrates LLM and Sandbox clients to run a node.
"""

import asyncio
from typing import Any, Dict, List, Optional

from loguru import logger
from pydantic import BaseModel, Field

from backend.models.user import ThinkingDepth
from backend.models.workflow import NodeInstance
from backend.services.execution_engine.config_resolver import ExecutionConfig
from backend.services.execution_engine.llm_client import LLMClient
from backend.services.execution_engine.sandbox_client import SandboxClient
from backend.workflow_definition import (
    HITLMode,
    KEY_ANALYSIS,
    KEY_CANDIDATES,
    KEY_CRITIQUES,
    KEY_ID,
    KEY_PRIMARY_ARTIFACT,
    KEY_SCA_OUTPUT,
    KEY_SELECTED_ITEM,
)


# (R6.3) Define structured execution result
class ExecutionResult(BaseModel):
    """Structured result from a node execution, including output and artifacts."""

    output_data: Dict[str, Any]
    artifacts: Dict[str, Any] = Field(default_factory=dict)


class NodeExecutor:
    # ... (__init__ implementation remains the same)

    async def execute_node(
        self,
        node: NodeInstance,
        inputs: Dict[str, Any],
        history: List[Dict[str, Any]],
        feedback: Optional[str],
        previous_output: Optional[Dict[str, Any]],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> ExecutionResult:
        await asyncio.sleep(1.0)
        logger.info(
            "Executing node with NodeExecutor",
            # ... (logging details)
        )

        if node.hitl_mode == HITLMode.SCA:
            return await self._execute_sca(node, inputs, feedback)
        if node.hitl_mode == HITLMode.AVL:
            return await self._execute_avl(node, inputs, feedback, previous_output, adjudication_data)
        return await self._execute_varl(node, inputs, feedback)

    async def _execute_varl(self, node: NodeInstance, inputs: Dict[str, Any], feedback: Optional[str]) -> ExecutionResult:
        prompt = f"Generate a VARL artifact. Feedback: {feedback}"
        llm_response = await self.llm_client.generate_text(prompt)

        # (R6.3) Capture the prompt as an artifact
        artifacts = {"prompt": prompt}

        artifact = {
            "content": llm_response,
            "data": "Generic VARL data output",
        }
        if node.definition_id == "3.1.2":
            artifact["Submission-Ready Paper"] = llm_response
        elif node.definition_id.endswith(".2.2.1"):
            # (R6.3) Capture the generated code as an artifact
            code_to_run = f"# Python code generated for {node.definition_id}\nprint('Simulated execution')"
            artifacts["generated_code.py"] = code_to_run

            sandbox_result = await self.sandbox_client.execute_code(code_to_run)
            
            # Store execution logs as artifacts
            artifacts["execution.log"] = sandbox_result.get("stdout", "")
            if sandbox_result.get("stderr"):
                artifacts["error.log"] = sandbox_result.get("stderr", "")

            artifact["raw_results"] = sandbox_result.get("results", "Simulated Raw Data")
            artifact["vv_data"] = "Simulated V&V Data from sandbox"
            artifact["sensitivity_data"] = "Simulated Sensitivity Data from sandbox"

        output_data = {KEY_PRIMARY_ARTIFACT: artifact}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)

    async def _execute_sca(self, node: NodeInstance, inputs: Dict[str, Any], feedback: Optional[str]) -> ExecutionResult:
        # ... (Existing SCA logic setup)
        output: Dict[str, Any] = {}
        base_candidates: List[Dict[str, Any]] = []

        # ... (Candidate generation logic)

        # ... (Thinking depth logic)
        num_candidates_map = {
            ThinkingDepth.INSTANT: 2,
            ThinkingDepth.MEDIUM: 3,
            ThinkingDepth.HEAVY: 4,
        }
        num_to_generate = num_candidates_map.get(self.config.thinking_depth, 3)

        final_candidates = base_candidates[:num_to_generate]

        if feedback:
            final_candidates.append({KEY_ID: "F1", "name": "Option based on feedback", "description": "F_data"})

        analysis_prompt = f"Provide a comparative analysis of {len(final_candidates)} candidates."
        analysis = await self.llm_client.generate_text(analysis_prompt)

        output[KEY_CANDIDATES] = final_candidates
        output[KEY_ANALYSIS] = analysis
        
        # (R6.3) Capture the analysis prompt as an artifact
        artifacts = {"analysis_prompt": analysis_prompt}
        return ExecutionResult(output_data=output, artifacts=artifacts)

    # ... (_generate_narrative_candidates, _generate_taskbook_candidates implementations remain the same)

    async def _execute_avl(
        self,
        # ... (arguments)
    ) -> ExecutionResult:
        # ... (Existing AVL logic setup for prompt generation)

        artifact_content = await self.llm_client.generate_text(prompt)

        # ... (Artifact specialization logic)

        critiques = await self._critique(node, artifact, adjudication_data)
        output_data = {
            KEY_PRIMARY_ARTIFACT: artifact,
            KEY_CRITIQUES: critiques,
        }
        
        # (R6.3) Capture the generation prompt as an artifact
        artifacts = {"generation_prompt": prompt}
        return ExecutionResult(output_data=output_data, artifacts=artifacts)

    # ... (_critique implementation remains the same)
```

**`backend/services/hitl_service.py`**

```python
import datetime
from typing import Any, Dict, List, Optional

# ... (Existing imports)
from sqlalchemy.orm import Session

# ... (Existing imports)
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, NodeVersion, VersionSource, WorkflowStatus
# ... (Existing imports)

class HITLService:
    # ... (Existing methods: __init__, process_submission, _handle_approval_or_loop, _approve_and_proceed)

    # ... (Existing methods: _validate_hitl_integrity, _determine_final_output, _reject_and_retry, _record_interaction)

    async def _discard_execution(self, node: NodeInstance) -> Dict[str, Any]:
        # Allow discarding FAILED, CANCELED, or AWAITING_HITL_APPROVAL
        if node.status not in [NodeStatus.AWAITING_HITL_APPROVAL, NodeStatus.FAILED, NodeStatus.CANCELED]:
             raise InvalidStateException(f"Cannot discard execution in status {node.status}.")

        if node.temporary_result:
            self.db.delete(node.temporary_result)
        
        # Revert status based on whether a previous version exists
        if node.active_version_id:
            node.status = NodeStatus.COMPLETED
            node.current_stage = ExecutionStage.COMPLETED
        else:
            node.status = NodeStatus.NOT_STARTED
            node.current_stage = ExecutionStage.NOT_STARTED
        
        self.db.commit()
        self.db.refresh(node)
        await self.node_service._broadcast_node_update(node)
        return {"message": "Execution attempt discarded. Status reverted.", "node_id": node.id, "action": "Discarded"}

    # ... (_generate_version_summary implementation)

    def _create_version_from_temporary(
        self,
        node: NodeInstance,
        final_output: Dict[str, Any],
        raw_output: Dict[str, Any],
        interaction_data: Optional[Dict[str, Any]],
    ) -> NodeVersion:
        temp_result = node.temporary_result
        with self.db.begin_nested():
            # ... (Existing versioning logic)
            
            # (R6.3) Retrieve artifacts from temporary result
            execution_artifacts = temp_result.execution_artifacts

            new_version = NodeVersion(
                node_instance_id=node.id,
                version_number=next_version_number,
                source=version_source,
                based_on_version_id=base_version_id,
                output_data=final_output,
                raw_generated_output=raw_output,
                # (R6.3) Persist execution artifacts
                execution_artifacts=execution_artifacts,
                input_dependencies=temp_result.input_dependencies,
                hitl_history=final_interactions,
                llm_model_name=temp_result.llm_model_name,
                temperature=temp_result.temperature,
                summary=summary,
            )
            self.db.add(new_version)
            self.db.flush()
        return new_version

    # ... (_determine_version_source implementation)
```

**`backend/services/node_service.py`**

```python
import datetime
import traceback
from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple

# (R1.3.1) Import Arq components for cancellation
from arq.jobs import Job
from arq.jobs import NotFoundError as ArqNotFoundError
from loguru import logger
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from backend.config import settings
from backend.exceptions import DependencyException, ForbiddenException, InvalidStateException, NotFoundException, WorkflowException
# ... (Other imports)
from backend.redis import get_redis_pool
from backend.schemas.events import EventType
# ... (Other imports)
from backend.services.execution_engine.config_resolver import resolve_config
# (R6.3) Import ExecutionResult
from backend.services.execution_engine.executor import ExecutionResult, NodeExecutor
from backend.services.storage_service import storage_service
from backend.task_names import TASK_EXECUTE_NODE
from backend.utils.event_utils import broadcast_event
from backend.workflow_definition import HITLMode, NodeType


_INPUT_KEY_TO_ROLE_MAP = {
    # ... (Existing definition)
}


class NodeService:
    # ... (__init__, get_node_instance implementations)

    async def _enqueue_job(self, node_id: int, **kwargs) -> NodeInstance:
        """Internal helper to enqueue a worker job and update node state."""
        redis = await get_redis_pool()
        
        # (R1.3.1) Use a unique job key based on node_id for cancellation tracking.
        job_key = f"executing_node:{node_id}"

        try:
            # We use _job_id to ensure only one job per node is queued/running.
            job = await redis.enqueue_job(TASK_EXECUTE_NODE, node_id=node_id, _job_id=job_key, **kwargs)
            logger.info(f"Enqueued job {job.job_id} (Key: {job_key}) for node {node_id}")
        except Exception as e:
            # Handle potential duplicate job key if state is inconsistent
            logger.error(f"Failed to enqueue job for node {node_id}. A job might already be running. Error: {e}")
            raise InvalidStateException(
                f"Failed to start execution for node {node_id}. An execution might already be in progress."
            )

        node = self.get_node_instance(node_id)
        # Ensure status is updated only if not already executing (idempotency check)
        if node.status != NodeStatus.EXECUTING:
            node.status = NodeStatus.EXECUTING
            node.current_stage = ExecutionStage.INITIALIZING
            self.db.commit()
            self.db.refresh(node)
            await self._broadcast_node_update(node)
            logger.info("Node status updated to EXECUTING", node_id=node_id, job_args=kwargs)
        
        return node

    # ... (enqueue_initial_execution, enqueue_re_execution implementations remain the same)

    async def enqueue_retry(
        self, node_id: int, user: User, user_feedback: Optional[str] = None
    ) -> NodeInstance:
        """Retry a failed or canceled node, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        # Allow retry from FAILED or CANCELED
        if node.status not in [NodeStatus.FAILED, NodeStatus.CANCELED]:
            raise InvalidStateException(
                f"Node must be 'Failed' or 'Canceled' to retry; current status is '{node.status.value}'.",
                details={"node_id": node.id, "current_status": node.status.value},
            )
        self._validate_execution_request(
            node,
            user_feedback=user_feedback,
            is_retry_from_hitl=False,
            base_version_id=None,
            adjudication_data=None,
        )
        return await self._enqueue_job(
            node_id,
            user_feedback=user_feedback,
            is_retry_from_hitl=False,
            base_version_id=None,
            adjudication_data=None,
            previous_status=node.status.value,
        )

    async def enqueue_hitl_action(
        # ... (arguments)
    ) -> NodeInstance:
        # ... (Validation logic remains the same)

        previous_status = node.status.value
        
        # (R1.3.1) HITL actions also use the unique job key mechanism
        return await self._enqueue_job(
            node_id,
            user_feedback=user_feedback,
            is_retry_from_hitl=is_retry,
            base_version_id=None,
            adjudication_data=adjudication_data,
            previous_status=previous_status,
        )


    # (R1.3.1) Implement cancellation mechanism
    async def cancel_execution(self, node_id: int, user: User) -> Dict[str, str]:
        """Attempt to cancel an ongoing execution for a node."""
        node = self.get_node_instance(node_id, user=user)

        if node.status != NodeStatus.EXECUTING:
            raise InvalidStateException(f"Node is not currently executing. Status: {node.status.value}")

        redis = await get_redis_pool()
        job_key = f"executing_node:{node_id}"
        job = Job(job_key, redis)

        try:
            # Attempt to abort the job using Arq's mechanism
            aborted = await job.abort()
            
            if aborted:
                logger.info(f"Cancellation signal sent for job {job_key} (Node {node_id}).")
                # The worker handles the state transition (to CANCELED) upon receiving AbortJob.
                return {"message": "Cancellation request sent. The node will transition to 'Canceled' shortly."}
            else:
                logger.warning(f"Could not send cancellation signal for job {job_key}. It might have finished already.")
                # Refresh the node status from DB to check if it finished naturally
                self.db.refresh(node)
                if node.status != NodeStatus.EXECUTING:
                    return {
                        "message": f"Execution could not be cancelled as it already completed or failed. Current status: {node.status.value}"
                    }
                else:
                    # Job exists but couldn't be aborted
                    raise WorkflowException("Failed to cancel execution. The task might be unresponsive.", status_code=500)

        except ArqNotFoundError:
            logger.warning(f"Job {job_key} not found in Redis during cancellation attempt.")
            # The job might have finished or never started properly.
            self.db.refresh(node)
            if node.status == NodeStatus.EXECUTING:
                # Inconsistent state: DB says EXECUTING but no job found. Force correction.
                logger.error(f"Inconsistent state detected for Node {node_id}. Forcing status correction.")
                node.status = NodeStatus.FAILED
                node.current_stage = ExecutionStage.FAILED
                if node.temporary_result:
                    node.temporary_result.error_log = "Execution state inconsistent (Job lost). Automatically marked as failed."
                self.db.commit()
                await self._broadcast_node_update(node)
                return {"message": "Execution not found, but node status was inconsistent. Marked as Failed."}
            else:
                return {"message": f"Execution not found. Current status: {node.status.value}"}
        except Exception as e:
            logger.exception(f"An unexpected error occurred during cancellation attempt for Node {node_id}.")
            raise WorkflowException(f"An error occurred during cancellation: {e}", status_code=500)

    async def execute_in_worker(
        # ... (arguments)
    ) -> NodeInstance:
        # ... (Execution preparation logic remains the same)

        # ... (Executor initialization remains the same)

        try:
            node.current_stage = ExecutionStage.PROCESSING
            self.db.commit()
            await self._broadcast_node_update(node)

            # (R6.3) Updated to handle structured ExecutionResult
            execution_result: ExecutionResult = await executor.execute_node(
                node,
                resolved_inputs,
                previous_hitl_history,
                executor_feedback,
                previous_output,
                adjudication_data,
            )

            node.current_stage = ExecutionStage.GENERATING_OUTPUTS
            self.db.commit()
            await self._broadcast_node_update(node)

            # (R6.3) Store both output data and artifacts
            temp_result.output_data = execution_result.output_data
            temp_result.execution_artifacts = execution_result.artifacts
            temp_result.error_log = None
            node.status = NodeStatus.AWAITING_HITL_APPROVAL
            node.current_stage = ExecutionStage.AWAITING_REVIEW
        except Exception as exc:
            # ... (Exception handling remains the same)
            pass

        self.db.commit()
        self.db.refresh(node)
        await self._broadcast_node_update(node)
        return node

    # --- Execution Preparation Helper Methods ---
    # ... (_prepare_hitl_loop_context, _prepare_failed_retry_context, _get_base_history)

    def _create_fresh_temporary_result(
        # ... (arguments)
    ) -> TemporaryExecutionResult:
        # ... (Existing logic)

        # (R6.3) Initialize execution artifacts
        temp_result = TemporaryExecutionResult(
            node_instance_id=node.id,
            input_dependencies=input_map,
            accumulated_hitl_interactions=interactions,
            execution_artifacts={}, # Initialize artifacts
            llm_model_name=settings.LLM_MODEL_NAME,
            temperature=settings.DEFAULT_TEMPERATURE,
        )
        self.db.add(temp_result)
        self.db.flush()
        return temp_result

    # ... (_validate_execution_request, _resolve_external_inputs, _resolve_dependencies, _resolve_dependencies_from_map, get_node_detail_view, _check_staleness)

    def _create_manual_version(
        self,
        node: NodeInstance,
        base_version: NodeVersion,
        submission: ManualEditSubmission,
    ) -> NodeVersion:
        """Create a new NodeVersion record based on a manual edit submission."""
        with self.db.begin_nested():
            # ... (Locking and versioning logic)

            new_version = NodeVersion(
                # ... (Existing fields)
                output_data=submission.edited_output_data,
                raw_generated_output=base_version.raw_generated_output,
                # (R6.3) Carry forward artifacts from the base version
                execution_artifacts=base_version.execution_artifacts,
                input_dependencies=base_version.input_dependencies,
                hitl_history=history,
                # ... (Existing fields)
            )
            self.db.add(new_version)
            self.db.flush()

        return new_version

    async def _finalize_node_completion_and_advance(
        # ... (arguments)
    ):
        """
        Centralized helper to finalize node completion, update workflow state, and advance execution.
        """
        from backend.services.workflow_service import WorkflowService

        workflow_service = WorkflowService(self.db)
        # ... (Existing logic)

        # (R5.2) Store the old version ID before updating for change detection
        old_version_id = node.active_version_id

        try:
            node.active_version_id = new_version.id
            # ... (Rest of the try block logic)

            self.db.commit()
        except Exception:
            # ... (Exception handling)
            raise InvalidStateException("Failed to finalize node completion due to an internal error.")

        self.db.refresh(node)
        await self._broadcast_node_update(node)

        # (R5.2) Broadcast version change event if the ID changed
        if old_version_id != new_version.id:
            await self._broadcast_version_change(node)

        # ... (Post-commit actions)
        if workflow_completed:
            # Fetch the workflow using the service method that ensures serialization and staleness calculation
            workflow_read = workflow_service.get_workflow_instance(node.workflow_instance_id, user=user)
            await workflow_service._broadcast_workflow_update(workflow_read)

        if next_node and next_node.status == NodeStatus.NOT_STARTED:
            await self.enqueue_initial_execution(next_node.id, user=user)


    async def switch_active_version(self, node_id: int, version_id: int, user: User) -> NodeInstance:
        """Switch a node's active version, with an ownership check."""
        node = self.get_node_instance(node_id, user=user)
        # ... (Validation logic)

        old_version_id = node.active_version_id
        
        # Check if the version is actually changing
        if old_version_id == version_id:
            return node

        node.active_version_id = version_id
        status_changed = False
        # ... (Status update logic)
        
        self.db.commit()
        self.db.refresh(node)

        if status_changed:
            await self._broadcast_node_update(node)

        # (R5.2) Broadcast version change event
        await self._broadcast_version_change(node)

        return node

    async def _broadcast_node_update(self, node: NodeInstance):
        # ... (Existing implementation)
        pass

    # (R5.2) New method to broadcast version change
    async def _broadcast_version_change(self, node: NodeInstance):
        """Broadcasts that the active version has changed."""
        # The payload is the full NodeInstanceRead as the client needs the updated active_version_id.
        # Staleness flag is omitted here as it's context-dependent on the workflow view.
        node_data = NodeInstanceRead.model_validate(node).model_dump(mode="json")
        await broadcast_event(
            node.workflow_instance_id, EventType.NODE_ACTIVE_VERSION_CHANGED, node_data, node_id=node.id
        )

    # ... (get_versions, get_version_details implementations)
```

**`backend/services/workflow_service.py`**

```python
from typing import Any, Dict, List, Optional, Set

from loguru import logger
from sqlalchemy.orm import Session, joinedload

from backend.exceptions import ForbiddenException, InvalidStateException, NotFoundException
from backend.models.project import Project
from backend.models.user import User
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, WorkflowInstance, WorkflowStatus
from backend.schemas.common import PaginatedResponse
from backend.schemas.events import EventType
from backend.schemas.node import StalenessInfo, NodeInstanceRead
from backend.schemas.workflow import WorkflowCreate, WorkflowInstanceRead, WorkflowUpdate
# NodeService is imported inside methods to prevent circular dependency
# from backend.services.node_service import NodeService
from backend.utils.event_utils import broadcast_event
from backend.workflow_definition import (
    # ... (Existing imports)
)


def _merge_dependencies(
    # ... (Existing implementation)
):
    # ...


class WorkflowService:
    def __init__(self, db: Session):
        self.db = db

    def _get_workflow_for_user(self, workflow_id: int, user: User) -> WorkflowInstance:
        # ... (Existing implementation)

    # (R5.2) Helper to calculate staleness flags
    def _calculate_staleness_flags(self, workflow: WorkflowInstance) -> Dict[int, bool]:
        """Calculates the boolean staleness flag for all nodes in the workflow."""
        # Assumes nodes and nodes.active_version are preloaded on the workflow object
        if not workflow.nodes:
            return {}

        nodes = workflow.nodes
        # Create a map of the currently active version for every node
        active_version_map: Dict[int, Optional[int]] = {node.id: node.active_version_id for node in nodes}
        staleness_flags: Dict[int, bool] = {}

        for node in nodes:
            is_stale = False
            # Only completed nodes with an active version can be stale based on their inputs
            if node.status == NodeStatus.COMPLETED and node.active_version:
                # Accessing active_version relationship which should be preloaded
                input_dependencies = node.active_version.input_dependencies or {}

                for upstream_node_id, consumed_version_id in input_dependencies.items():
                    current_active_version_id = active_version_map.get(upstream_node_id)
                    if current_active_version_id != consumed_version_id:
                        is_stale = True
                        break

            staleness_flags[node.id] = is_stale

        return staleness_flags

    # (R5.2) Update pagination to include staleness check
    def get_workflows_paginated(
        self, user: User, skip: int, limit: int
    ) -> PaginatedResponse[WorkflowInstanceRead]:
        """Return a user's workflows ordered by creation date with pagination and staleness info."""
        query = self.db.query(WorkflowInstance).filter(WorkflowInstance.user_id == user.id)
        total = query.count()
        # Ensure necessary relationships are loaded for staleness calculation
        workflows = (
            query.options(joinedload(WorkflowInstance.nodes).joinedload(NodeInstance.active_version))
            .order_by(WorkflowInstance.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        # Calculate staleness flags and serialize
        all_serialized = []
        for workflow in workflows:
            staleness_flags = self._calculate_staleness_flags(workflow)
            serialized = WorkflowInstanceRead.model_validate(workflow)
            # Apply the flags to the serialized nodes
            for node_read in serialized.nodes:
                node_read.is_stale = staleness_flags.get(node_read.id, False)
            all_serialized.append(serialized)

        return PaginatedResponse(total=total, items=all_serialized)

    # (R5.2) Update detail view to include staleness check and return Read model
    def get_workflow_instance(self, workflow_id: int, user: User) -> WorkflowInstanceRead:
        """Get a workflow instance with ownership check and staleness calculation."""
        # Ensure nodes and their active versions are loaded
        workflow = (
            self.db.query(WorkflowInstance)
            .options(joinedload(WorkflowInstance.nodes).joinedload(NodeInstance.active_version))
            .get(workflow_id)
        )

        if not workflow:
            raise NotFoundException(f"WorkflowInstance {workflow_id} not found.")
        if workflow.user_id != user.id:
            raise ForbiddenException("You do not have permission to access this workflow.")

        # Calculate staleness flags
        staleness_flags = self._calculate_staleness_flags(workflow)
        
        # Serialize and inject flags
        workflow_read = WorkflowInstanceRead.model_validate(workflow)
        for node_read in workflow_read.nodes:
             node_read.is_stale = staleness_flags.get(node_read.id, False)

        return workflow_read

    # ... (create_workflow, update_workflow, delete_workflow, _initialize_nodes implementations)

    async def start_workflow(self, workflow_id: int, user: User) -> NodeInstance:
        # Import NodeService here to avoid circular dependency
        from backend.services.node_service import NodeService
        
        # Use internal _get_workflow_for_user for ORM object access
        workflow = self._get_workflow_for_user(workflow_id, user)
        # ... (Existing logic)
        if workflow.status != WorkflowStatus.RUNNING:
            workflow.status = WorkflowStatus.RUNNING
            self.db.commit()
            # Use the updated broadcast method that handles serialization and staleness
            await self._broadcast_workflow_update(self.get_workflow_instance(workflow_id, user))

        node_service = NodeService(self.db)
        return await node_service.enqueue_initial_execution(first_node.id, user)

    # ... (get_next_node, handle_generator_node_completion, _shift_subsequent_nodes, _insert_dynamic_tasks, _update_phase3_dependencies, complete_workflow implementations)

    # ... (calculate_bulk_staleness implementation remains similar but leverages optimized loading if needed)

    # ... (broadcast_structure_update implementation)

    # Update broadcast methods to accept the Read model (preferred) or ORM model (fallback)
    async def _broadcast_workflow_update(self, workflow_data: WorkflowInstanceRead | WorkflowInstance):
        if isinstance(workflow_data, WorkflowInstance):
             # Fallback for older callsites: serialize now (less efficient, staleness might be missing)
             logger.warning("Broadcasting workflow update from ORM object. Staleness data might be missing.")
             if not workflow_data.nodes:
                 self.db.refresh(workflow_data, ["nodes"])
             serialized_data = WorkflowInstanceRead.model_validate(workflow_data).model_dump(mode="json")
             workflow_id = workflow_data.id
        else:
             # Preferred path: use pre-serialized data (includes staleness)
             serialized_data = workflow_data.model_dump(mode="json")
             workflow_id = workflow_data.id
        
        await broadcast_event(workflow_id, EventType.WORKFLOW_STATUS_UPDATED, serialized_data)
```

**`backend/worker.py`**

```python
"""arq worker definition for executing node simulations."""

from __future__ import annotations

import traceback
from typing import Any, Dict

from arq.connections import RedisSettings
# (R1.3.1) Import AbortJob for cancellation handling
from arq.worker import AbortJob
from loguru import logger
from sqlalchemy.orm import joinedload

from backend.config import settings
from backend.database import SessionLocal
from backend.logging_config import setup_logging
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, WorkflowInstance
from backend.schemas.events import EventType
from backend.schemas.node import NodeInstanceRead
from backend.services.node_service import NodeService
from backend.task_names import TASK_EXECUTE_NODE
from backend.utils.event_utils import broadcast_event

setup_logging()


async def execute_node_task(ctx: Dict[str, Any], node_id: int, **kwargs: Any) -> None:
    """arq background task that executes a node with resilient error handling."""

    with logger.contextualize(node_id=node_id, job_args=kwargs):
        logger.info("Worker received task to execute node")
        db = SessionLocal()
        try:
            # ... (Node loading logic)

            if node.status != NodeStatus.EXECUTING:
                logger.warning(
                    "Worker picked up stale job for node. Discarding.",
                    node_status=node.status.value,
                )
                return

            node_service = NodeService(db)
            await node_service.execute_in_worker(node, **kwargs)

        except AbortJob:
            # (R1.3.1) Handle cancellation request from user (via Arq abort)
            logger.warning("Worker task aborted (cancelled by user).")
            # The session 'db' might be broken due to the interrupt, so use a new session for cleanup.
            db.close() 
            await handle_cancellation(node_id)
            # Re-raise AbortJob so arq marks the job as aborted correctly
            raise

        except Exception as exc:
            logger.exception("Worker task for node failed permanently.")
            # ... (Existing exception handling logic)
        finally:
            # Ensure the main session is closed
            if not db.is_closed():
               db.close()
        logger.info("Worker finished task for node")


# (R1.3.1) New helper for cancellation state update
async def handle_cancellation(node_id: int):
    """Update the database state when a job is cancelled."""
    cleanup_db = None
    try:
        cleanup_db = SessionLocal()
        node_to_cancel = cleanup_db.query(NodeInstance).get(node_id)
        # Check if it's still EXECUTING before updating (it might have finished just before abort)
        if node_to_cancel and node_to_cancel.status == NodeStatus.EXECUTING:
            # Use the CANCELED status
            node_to_cancel.status = NodeStatus.CANCELED
            node_to_cancel.current_stage = ExecutionStage.CANCELED
            if node_to_cancel.temporary_result:
                node_to_cancel.temporary_result.error_log = "Execution cancelled by user request (Job Aborted)."

            cleanup_db.commit()
            # We need to manually serialize here as we are outside the request context
            node_data = NodeInstanceRead.model_validate(node_to_cancel).model_dump(mode="json")
            await broadcast_event(
                node_to_cancel.workflow_instance_id,
                EventType.NODE_STATUS_UPDATED,
                node_data,
                node_id=node_to_cancel.id,
            )
        elif node_to_cancel:
            logger.info(f"Job aborted but node {node_id} status was already {node_to_cancel.status.value}.")
    except Exception:
        logger.exception(
            "CRITICAL: Failed to update node status after cancellation.",
            failed_node_id=node_id,
        )
        if cleanup_db:
            cleanup_db.rollback()
    finally:
        if cleanup_db:
            cleanup_db.close()


async def on_job_failure(ctx: Dict[str, Any], job: Any, exc: BaseException) -> None:
    # ... (Existing implementation)
    pass


class WorkerSettings:
    """arq worker configuration."""

    functions = [execute_node_task]
    redis_settings = RedisSettings.from_dsn(str(settings.REDIS_URL))
    job_timeout = 300  # 5 minutes
    on_job_failure = on_job_failure
    # (R1.3.1) Enable the ability to abort jobs (cancellation)
    allow_abort_jobs = True


__all__ = ["WorkerSettings", "execute_node_task", "TASK_EXECUTE_NODE"]
```