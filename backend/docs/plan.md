
### 1\. 实现完整的后端优化部分代码

以下是对后端代码进行的全面修复和优化。

#### 1.1 安全配置优化

**文件: `backend/config.py`**

```python
# backend/config.py
import base64
# ... (imports)

class Settings(BaseSettings):
    # ... (other settings)

    # --- Security and Authentication (R1, R7.3) ---
    SECRET_KEY: str
    # Removed default value. Must be provided via environment variables (.env).
    ENCRYPTION_KEY: str
    ALGORITHM: str = Field(default="HS256", alias="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    @field_validator("ENCRYPTION_KEY")
    @classmethod
    def validate_encryption_key(cls, v: str) -> str:
        """Validate that the encryption key is 32 url-safe base64-encoded bytes."""
        if not v:
            # Ensure the key is explicitly provided
            raise ValueError("ENCRYPTION_KEY must be set in the environment variables (.env).")
        try:
            # The key must be 32 bytes after decoding.
            if len(base64.urlsafe_b64decode(v)) != 32:
                raise ValueError("Encryption key must be 32 url-safe base64-encoded bytes.")
        except (ValueError, TypeError) as e:
            # Improved error message clarity
            raise ValueError(f"Invalid ENCRYPTION_KEY format: {e}") from e
        return v

    # ... (rest of the file)
```

#### 1.2 模型定义修复

**文件: `backend/models/workflow.py`**

```python
# backend/models/workflow.py

# ... (imports and Enums)

class NodeVersion(Base):
    __tablename__ = "node_versions"
    # ... (existing columns)
    output_data = Column(MutableDict.as_mutable(JSON), nullable=True)
    raw_generated_output = Column(MutableDict.as_mutable(JSON), nullable=True)
    # Added missing execution_artifacts field
    execution_artifacts = Column(MutableDict.as_mutable(JSON), nullable=True)
    input_dependencies = Column(MutableDict.as_mutable(JSON), nullable=False)
    # ... (rest of NodeVersion)

class TemporaryExecutionResult(Base):
    __tablename__ = "temporary_execution_results"
    # ... (existing columns)
    output_data = Column(MutableDict.as_mutable(JSON), nullable=True)
    # Added missing execution_artifacts field
    execution_artifacts = Column(MutableDict.as_mutable(JSON), nullable=True)
    input_dependencies = Column(MutableDict.as_mutable(JSON), nullable=False)
    # ... (rest of TemporaryExecutionResult)
```

#### 1.3 数据库迁移修复与更新

*(注：修改现有迁移文件需谨慎操作。)*

**文件: `backend/alembic/versions/b83f6d2e1c4a_normalize_enum_values.py`**

```python
# backend/alembic/versions/b83f6d2e1c4a_normalize_enum_values.py
# ...
ENUM_SPECS: List[EnumSpec] = [
    # ... (ProjectStatus, WorkflowStatus, NodeType)
    {
        "name": "nodestatus",
        "columns": [("node_instances", "status")],
        "upgrade": {
            "values": [
                "Not Started", "Executing", "Awaiting HITL Approval", "Completed", "Failed",
                "Canceled", # Added Canceled
            ],
            "map": {
                # ... (existing maps)
                "CANCELED": "Canceled", "Canceled": "Canceled", # Added mapping
            },
        },
        "downgrade": {
             "values": [
                # ...
                "FAILED", "CANCELED", # Added CANCELED
            ],
            "map": {
                # ...
                "Canceled": "CANCELED", # Added mapping
            },
        },
    },
    {
        "name": "executionstage",
        "columns": [("node_instances", "current_stage")],
        "upgrade": {
            "values": [
                # ...
                "Completed", "Failed", "Canceled", # Added Canceled
            ],
            "map": {
                # ...
                "CANCELED": "Canceled", "Canceled": "Canceled", # Added mapping
            },
        },
        "downgrade": {
             "values": [
                # ...
                "FAILED", "CANCELED", # Added CANCELED
            ],
            "map": {
                # ...
                "Canceled": "CANCELED", # Added mapping
            },
        },
    },
    # ... (other enums)
]
# ...
```

**文件: `backend/alembic/versions/c2d1e0f9ab12_add_stage_metadata_to_node_instances.py`**

```python
# backend/alembic/versions/c2d1e0f9ab12_add_stage_metadata_to_node_instances.py
# ...
# revision identifiers, used by Alembic.
revision = 'c2d1e0f9ab12'
# down_revision = '3a5b6c7d8e9f' # OLD: Caused branching
down_revision = 'b83f6d2e1c4a' # FIXED: Linearized dependency
branch_labels = None
depends_on = None
# ...
```

**(新建文件) `backend/alembic/versions/f1a2b3c4d5e6_add_execution_artifacts.py`**

```python
"""Add execution_artifacts to NodeVersion and TemporaryExecutionResult

Revision ID: f1a2b3c4d5e6
Revises: c2d1e0f9ab12
Create Date: 2025-11-11 06:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.ext.mutable import MutableDict

# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = 'c2d1e0f9ab12'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Use MutableDict.as_mutable(sa.JSON()) for consistency with the model definition
    json_type = MutableDict.as_mutable(sa.JSON())

    # Use batch_alter_table for SQLite compatibility
    with op.batch_alter_table('node_versions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('execution_artifacts', json_type, nullable=True))

    with op.batch_alter_table('temporary_execution_results', schema=None) as batch_op:
        batch_op.add_column(sa.Column('execution_artifacts', json_type, nullable=True))

def downgrade() -> None:
    with op.batch_alter_table('temporary_execution_results', schema=None) as batch_op:
        batch_op.drop_column('execution_artifacts')

    with op.batch_alter_table('node_versions', schema=None) as batch_op:
        batch_op.drop_column('execution_artifacts')
```

#### 1.4 功能实现：密码重置 (R1.3)

**文件: `backend/schemas/auth.py`**

```python
# backend/schemas/auth.py
# ... (imports)
from pydantic import BaseModel, EmailStr, field_validator

# ... (Token, TokenData, etc.)

class PasswordResetRequest(BaseModel):
    """Schema for initiating password reset."""
    email: EmailStr

class PasswordResetCompletion(BaseModel):
    """Schema for completing the password reset process."""
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, value: str) -> str:
        # Re-use the validation logic defined in schemas/user.py
        from backend.schemas.user import _validate_password_strength
        return _validate_password_strength(value)
```

**文件: `backend/auth/service.py`**

```python
# backend/auth/service.py
# ... (imports)

class AuthService:
    # ... (other methods)

    def register_user(self, db: Session, user_in: UserCreate) -> User:
        # ... (validation and creation logic)
        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            logger.info("New user registered successfully", user_id=new_user.id, email=new_user.email)
            # NOTE: Removed self.send_verification_email(db, new_user). The router now handles this post-commit.
            return new_user
        except Exception:
            # ... (rollback logic)

    # ...

    # Replaced stub reset_password with functional implementations
    def initiate_password_reset(self, db: Session, email: str) -> None:
        """Generate a password reset token and simulate sending an email (R1.3)."""
        user = self.get_user_by_email(db, email)
        # Security practice: Respond similarly regardless of user existence.
        if user and user.is_active:
            token = create_token(data={"sub": str(user.id)}, token_type=TokenType.PASSWORD_RESET)
            logger.info("SIMULATION: Sending password reset email to {}", user.email)
            print(f"SIMULATION: Password Reset Token for {user.email}: {token}")
        else:
            logger.info("Password reset requested for email: {}. Silently handling.", email)

    def complete_password_reset(self, db: Session, token: str, new_password: str) -> None:
        """Verify the reset token and update the user's password (R1.3)."""
        # decode_token validates expiration and type, raises HTTPException on failure.
        payload = decode_token(token, TokenType.PASSWORD_RESET)
        user_id_str = payload.get("sub")

        if not user_id_str:
            raise WorkflowException("Invalid token payload.", status_code=400)

        try:
            user_id = int(user_id_str)
            user = db.get(User, user_id)
        except (ValueError, TypeError):
             # Use a generic error message for security.
            raise WorkflowException("Invalid or expired token.", status_code=400)

        if not user:
            raise WorkflowException("Invalid or expired token.", status_code=400)

        if not user.is_active:
            raise ForbiddenException("Cannot reset password for an inactive account.")

        user.hashed_password = get_password_hash(new_password)
        db.commit()
        logger.info("Password reset successfully completed for user {}", user.id)
```

**文件: `backend/routers/auth.py`**

```python
# backend/routers/auth.py
# ... (imports)
from backend.schemas.auth import (
    EmailVerificationRequest, ResendVerificationRequest, Token,
    PasswordResetRequest, PasswordResetCompletion # Added imports
)
# ...

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    # ...
):
    """Register a new user account."""
    try:
        new_user = auth_service.register_user(db, user_in=user_in)
        # Send verification email after successful registration (Moved from service)
        auth_service.send_verification_email(db, new_user)
        return new_user
    except InvalidStateException as exc:
        raise exc

# ... (other endpoints)

# Renamed from /reset-password and updated implementation
@router.post("/request-password-reset", status_code=status.HTTP_202_ACCEPTED)
async def request_password_reset(
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Initiate password reset flow (R1.3)."""
    auth_service.initiate_password_reset(db, request.email)
    return {"message": "If an account with this email exists, a password reset link has been sent."}

# Added endpoint
@router.post("/complete-password-reset", status_code=status.HTTP_200_OK)
async def complete_password_reset(
    request: PasswordResetCompletion,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Complete the password reset using the token (R1.3)."""
    auth_service.complete_password_reset(db, request.token, request.new_password)
    return {"message": "Password has been reset successfully."}
```

#### 1.5 功能实现：历年赛题库 (R3.3)

**文件: `backend/schemas/project.py`**

```python
# backend/schemas/project.py
# ... (imports)

# ... (existing schemas)

class HistoricalProblemRead(BaseModel):
    """Schema for reading historical problem data from the library (R3.3)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    year: int
    type: ProblemType
    name: str
    # Use Field validation_alias to map from the ORM attribute names.
    has_description: bool = Field(..., validation_alias="description_path")
    has_dataset: bool = Field(..., validation_alias="dataset_path")

    @field_validator("has_description", "has_dataset", mode="before")
    def check_path_exists(cls, v):
        # If the path field (aliased) is present and not None/empty, it exists.
        return bool(v)
```

**文件: `backend/services/project_service.py`**

```python
# backend/services/project_service.py
# ... (imports)

class ProjectService:
    # ... (existing methods)

    def get_historical_problems(self) -> List[HistoricalProblem]:
        """Retrieve the list of available historical problems (R3.3)."""
        return self.db.query(HistoricalProblem).order_by(HistoricalProblem.year.desc(), HistoricalProblem.type).all()

    # ... (rest of the file)
```

**文件: `backend/routers/projects.py`**

```python
# backend/routers/projects.py
# ... (imports)
from backend.schemas.project import (
    HistoricalInitializationRequest,
    HistoricalProblemRead, # Added
    # ...
)

# Router specifically for the public problem library (R3.3)
library_router = APIRouter(prefix="/library", tags=["Problem Library"])

router = APIRouter(prefix="/projects", tags=["Projects"])

# ... (dependency injectors)

@library_router.get("/historical-problems", response_model=List[HistoricalProblemRead])
def list_historical_problems(
    service: ProjectService = Depends(get_project_service),
) -> List[HistoricalProblemRead]:
    """List all available historical problems from the library (R3.3)."""
    problems = service.get_historical_problems()
    # Use model_validate to handle the aliases correctly
    return [HistoricalProblemRead.model_validate(p) for p in problems]

# ... (other project endpoints)
```

**文件: `backend/routers/__init__.py`**

```python
# backend/routers/__init__.py
from fastapi import APIRouter
# ...
# Updated import
from backend.routers.projects import router as projects_router, library_router
# ...

api_router = APIRouter(prefix="/api/v1")
# ...
api_router.include_router(projects_router)
api_router.include_router(library_router) # Added inclusion
# ...

# Updated __all__
__all__ = [
    "api_router", "auth_router", "nodes_router", "projects_router",
    "users_router", "workflows_router", "library_router"
]
```

#### 1.6 功能实现：执行取消 API

**文件: `backend/routers/nodes.py`**

```python
# backend/routers/nodes.py
# ... (imports and dependencies)

@router.get("/{node_id}", response_model=NodeDetailView)
# ... (get_node_details)

@router.post(
    "/{node_id}/cancel",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=Dict[str, Any],
    summary="Cancel an EXECUTING node",
)
async def cancel_node_execution(
    node_id: int,
    service: NodeService = Depends(get_node_service),
    current_user: User = Depends(get_current_active_verified_user),
):
    """
    Request cancellation of an ongoing node execution.
    This sends an abort signal to the worker processing the task.
    """
    result = await service.cancel_execution(node_id, current_user)
    return result

@router.post(
# ... (re_execute_node and others)
```

#### 1.7 功能实现：HITL Profile 应用 (R7.4)

**文件: `backend/services/execution_engine/executor.py`**

```python
# backend/services/execution_engine/executor.py
# ... (imports)
from backend.models.user import HITLProfile, ThinkingDepth # Import HITLProfile
# ...

class NodeExecutor:
    # ... (init, execute_node, _execute_varl, _execute_sca)

    # ... (_execute_avl - no changes needed here)

    async def _critique(
        self,
        node: NodeInstance,
        artifact: Dict[str, Any],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> List[Dict[str, Any]]:
        # Apply HITL Profile configuration (R7.4)
        profile = self.config.hitl_profile

        if profile == HITLProfile.EXPERT:
            # Expert mode: Higher automation trust, fewer critiques.
            if adjudication_data:
                # Assume refinement was successful if critiques were addressed.
                return []
            # Initial critique is light.
            return [
                {KEY_ID: "c_exp_1", "critique": "Overall sound, but verify boundary conditions of the core assumption.", "severity": "Medium"},
            ]

        if profile == HITLProfile.NOVICE:
            # Novice mode: Rigorous critiques for guidance.
            if adjudication_data:
                 return [
                    {
                        KEY_ID: "c_nov_r1",
                        "critique": "Refinement improved clarity, but introduced a minor ambiguity in terminology. Please review.",
                        "severity": "Low",
                    }
                ]
            return [
                {KEY_ID: "c_nov_1", "critique": "The primary assumption lacks empirical justification. Consider alternative data sources.", "severity": "High"},
                {KEY_ID: "c_nov_2", "critique": "Key terminology is used ambiguously. Define all central concepts clearly.", "severity": "Medium"},
                {KEY_ID: "c_nov_3", "critique": "The scope appears overly broad. Narrow the focus for better analysis.", "severity": "Medium"},
            ]

        # Default (Experienced) mode (existing behavior)
        if adjudication_data:
            return [
                {
                    KEY_ID: "c3",
                    "critique": "Refinement addressed major issues, but introduced a minor boundary condition error.",
                    "severity": "Low",
                }
            ]
        return [
            {KEY_ID: "c1", "critique": "The core assumption lacks justification.", "severity": "High"},
            {KEY_ID: "c2", "critique": "Terminology is ambiguous.", "severity": "Medium"},
        ]
```

#### 1.8 健壮性优化：节点执行状态时序

**文件: `backend/services/node_service.py`**

重构 `enqueue` 逻辑，确保事务安全和状态一致性。

```python
# backend/services/node_service.py

class NodeService:
    # ... (init, get_node_instance)

    # Updated _enqueue_job to focus only on enqueueing.
    async def _enqueue_job(self, node: NodeInstance, **kwargs) -> Job:
        """Internal helper to enqueue a worker job. Assumes DB state is updated and committed."""
        redis = await get_redis_pool()
        node_id = node.id
        job_key = f"executing_node:{node_id}"

        try:
            job = await redis.enqueue_job(TASK_EXECUTE_NODE, node_id=node_id, _job_id=job_key, **kwargs)
            logger.info("Enqueued job {job_id} (Key: {job_key}) for node {node_id}", job_id=job.job_id, job_key=job_key, node_id=node_id)
            return job
        except Exception as exc:
            logger.error(
                "Failed to enqueue job for node {node_id}. Job might already be running or queue unavailable.",
                node_id=node_id,
                error=str(exc),
            )
            # Raise exception; the caller (_prepare_and_enqueue) handles state reversion.
            raise InvalidStateException(
                f"Failed to start execution for node {node_id}. An execution might already be in progress or the queue is unavailable."
            ) from exc

    # New centralized helper method
    async def _prepare_and_enqueue(
        self,
        node: NodeInstance,
        validation_func: callable,
        user_feedback: Optional[str],
        is_retry_from_hitl: bool,
        base_version_id: Optional[int],
        adjudication_data: Optional[List[Dict[str, Any]]],
    ) -> NodeInstance:
        """Centralized logic: validation, state update, commit, broadcast, and enqueue with reversion logic."""

        # Store previous state for potential reversion
        previous_status_enum = node.status
        previous_stage = node.current_stage
        previous_status_value = node.status.value # String value for worker args

        # 1. Validation
        validation_func(node, user_feedback, is_retry_from_hitl, base_version_id, adjudication_data)

        # 2. Update status and commit BEFORE enqueueing
        status_changed = False
        if node.status != NodeStatus.EXECUTING:
            try:
                node.status = NodeStatus.EXECUTING
                node.current_stage = ExecutionStage.INITIALIZING
                self.db.commit()
                self.db.refresh(node)
                status_changed = True
                # Broadcast update immediately after commit
                await self._broadcast_node_update(node)
            except Exception:
                self.db.rollback()
                logger.exception("Failed to update node status to EXECUTING before enqueueing.", node_id=node.id)
                raise InvalidStateException("Failed to prepare node for execution due to database error.")

        try:
            # 3. Enqueue the job.
            await self._enqueue_job(
                node,
                user_feedback=user_feedback,
                is_retry_from_hitl=is_retry_from_hitl,
                base_version_id=base_version_id,
                adjudication_data=adjudication_data,
                previous_status=previous_status_value,
            )
        except InvalidStateException:
            # If enqueueing fails (e.g., job key conflict), revert the status if we changed it.
            if status_changed:
                logger.warning("Reverting node status due to enqueue failure.", node_id=node.id)
                try:
                    # Ensure the node object is fresh before reverting
                    self.db.refresh(node)
                    # Check if status hasn't changed concurrently
                    if node.status == NodeStatus.EXECUTING:
                         node.status = previous_status_enum
                         node.current_stage = previous_stage
                         self.db.commit()
                         await self._broadcast_node_update(node)
                    else:
                        logger.info("Node status changed concurrently, skipping reversion.", node_id=node.id, current_status=node.status.value)
                except Exception:
                    logger.exception("CRITICAL: Failed to revert node status after enqueue failure. DB state may be inconsistent.", node_id=node.id)
            raise # Re-raise the original enqueue exception
        return node

    # Refactored Public Enqueue Methods (Simplified by using the helper)

    async def enqueue_initial_execution(self, node_id: int, user: User) -> NodeInstance:
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.NOT_STARTED:
             # ... (raise exception)
        return await self._prepare_and_enqueue(
            node, self._validate_execution_request, None, False, None, None
        )

    async def enqueue_re_execution(self, node_id: int, user: User, user_feedback: Optional[str] = None, base_version_id: Optional[int] = None) -> NodeInstance:
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.COMPLETED:
            # ... (raise exception)
        return await self._prepare_and_enqueue(
            node, self._validate_execution_request, user_feedback, False, base_version_id, None
        )

    async def enqueue_retry(self, node_id: int, user: User, user_feedback: Optional[str] = None) -> NodeInstance:
        node = self.get_node_instance(node_id, user=user)
        if node.status not in [NodeStatus.FAILED, NodeStatus.CANCELED]:
             # ... (raise exception)
        return await self._prepare_and_enqueue(
            node, self._validate_execution_request, user_feedback, False, None, None
        )

    async def enqueue_hitl_action(self, node_id: int, user: User, user_feedback: Optional[str] = None, adjudication_data: Optional[List[Dict[str, Any]]] = None) -> NodeInstance:
        node = self.get_node_instance(node_id, user=user)
        if node.status != NodeStatus.AWAITING_HITL_APPROVAL:
            # ... (raise exception)
        is_retry = bool(user_feedback)
        return await self._prepare_and_enqueue(
            node, self._validate_execution_request, user_feedback, is_retry, None, adjudication_data
        )

    # ... (rest of NodeService)
```
