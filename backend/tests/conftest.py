import asyncio
import os
import shutil
from pathlib import Path

import httpx
import pytest
import pytest_asyncio
import sys

TESTS_DIR = Path(__file__).resolve().parent
BASE_DIR = TESTS_DIR.parent
TMP_DIR = BASE_DIR / ".pytest_tmp"
TMP_DIR.mkdir(parents=True, exist_ok=True)
TEST_DB_PATH = TMP_DIR / "test.db"
STORAGE_PATH = TMP_DIR / "storage"
STORAGE_PATH.mkdir(parents=True, exist_ok=True)

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["REDIS_HOST"] = "test.local"
os.environ["REDIS_PORT"] = "6379"
os.environ["REDIS_DB"] = "0"
os.environ["REDIS_PASSWORD"] = "testpassword"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["ENCRYPTION_KEY"] = "afXbtjR7dQN2pAylYOvrmrMlbzZHzjFJTbcaiAYLkKM="
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"
os.environ["STORAGE_BASE_PATH"] = str(STORAGE_PATH)

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.database import Base, SessionLocal, engine  # noqa: E402
from backend.main import app  # noqa: E402
from backend.models.user import User  # noqa: E402
from backend.services.execution_engine.executor import NodeExecutor  # noqa: E402
from backend.worker import execute_node_task  # noqa: E402
from tests.support.driver import AuthSession, WorkflowDriver  # noqa: E402
from tests.support.execution_mocker import ExecutionMocker  # noqa: E402
from tests.support.fake_redis import (  # noqa: E402
    ArqWorkerHarness,
    FakeArqRedis,
    FakeJob,
    FakeJobStatus,
)


class LifespanManager:
    def __init__(self, application):
        self._app = application
        self._context = None

    async def __aenter__(self):
        self._context = self._app.router.lifespan_context(self._app)
        return await self._context.__aenter__()

    async def __aexit__(self, exc_type, exc, tb):
        return await self._context.__aexit__(exc_type, exc, tb)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def fake_redis():
    return FakeArqRedis()


@pytest.fixture(scope="session", autouse=True)
def patch_redis(fake_redis):
    import backend.redis as redis_module
    import backend.main as main_module
    import backend.utils.event_utils as event_utils
    import backend.services.node_service as node_service

    monkeypatch = pytest.MonkeyPatch()

    async def _get_pool():
        return fake_redis

    async def _close_pool():
        await fake_redis.close()

    async def _create_pool(_settings):
        return fake_redis

    monkeypatch.setattr(redis_module, "get_redis_pool", _get_pool)
    monkeypatch.setattr(redis_module, "close_redis_pool", _close_pool)
    monkeypatch.setattr(redis_module, "create_pool", _create_pool)
    monkeypatch.setattr(main_module, "get_redis_pool", _get_pool)
    monkeypatch.setattr(event_utils, "get_redis_pool", _get_pool)
    monkeypatch.setattr(node_service, "Job", lambda job_id, redis: FakeJob(job_id, fake_redis))
    monkeypatch.setattr(node_service, "JobStatus", FakeJobStatus)

    yield
    monkeypatch.undo()


@pytest.fixture(autouse=True)
def clean_storage():
    if STORAGE_PATH.exists():
        shutil.rmtree(STORAGE_PATH)
    STORAGE_PATH.mkdir(parents=True, exist_ok=True)
    yield


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest_asyncio.fixture(autouse=True)
async def reset_fake_queue(fake_redis):
    await fake_redis.reset()
    yield


@pytest_asyncio.fixture
async def app_lifespan(patch_redis):
    async with LifespanManager(app):
        yield


@pytest_asyncio.fixture
async def arq_worker(fake_redis):
    worker = ArqWorkerHarness(fake_redis, execute_node_task)
    await worker.start()
    yield worker
    await worker.stop()


@pytest_asyncio.fixture
async def api_client(app_lifespan, arq_worker):
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver", follow_redirects=True) as client:
        yield client


@pytest_asyncio.fixture
async def auth_session(api_client):
    email = "qa@example.com"
    password = "ComplexPass123"
    register_resp = await api_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "display_name": "QA"},
    )
    register_resp.raise_for_status()

    db = SessionLocal()
    try:
        user = db.query(User).filter_by(email=email).first()
        user.is_verified = True
        db.commit()
        user_id = user.id
    finally:
        db.close()

    login_resp = await api_client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    login_resp.raise_for_status()
    token = login_resp.json()["access_token"]
    return AuthSession(email=email, token=token, user_id=user_id)


@pytest_asyncio.fixture
async def workflow_driver(api_client, auth_session):
    driver = WorkflowDriver(app, api_client, auth_session)
    yield driver
    await driver.close()


@pytest.fixture
def execution_mocker(monkeypatch):
    planner = ExecutionMocker()

    async def _fake_execute(self, node, inputs, history, feedback, previous_output, adjudication_data):
        return await planner.dispatch(node, inputs, history, feedback, previous_output, adjudication_data)

    monkeypatch.setattr(NodeExecutor, "execute_node", _fake_execute)
    return planner
