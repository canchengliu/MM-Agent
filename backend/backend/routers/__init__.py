from fastapi import APIRouter

from backend.routers.auth import router as auth_router
from backend.routers.nodes import router as nodes_router
from backend.routers.projects import router as projects_router
from backend.routers.users import router as users_router
from backend.routers.workflows import router as workflows_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(projects_router)
api_router.include_router(workflows_router)
api_router.include_router(nodes_router)

__all__ = ["api_router", "auth_router", "nodes_router", "projects_router", "users_router", "workflows_router"]
