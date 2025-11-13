"""High-level workflow driver used across the E2E scenarios."""

from __future__ import annotations

import io
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import httpx
from backend.models.project import FileRole, ProblemType
from backend.models.workflow import NodeStatus
from backend.schemas.events import EventType
from backend.schemas.hitl import HITLActionType
from tests.support.websocket import WebSocketListener


@dataclass
class AuthSession:
    email: str
    token: str
    user_id: int

    @property
    def headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"}


class WorkflowDriver:
    """Wraps common API and WebSocket operations for readability."""

    def __init__(self, app, client: httpx.AsyncClient, auth: AuthSession):
        self.app = app
        self.client = client
        self.auth = auth
        self.project_id: Optional[int] = None
        self.workflow_id: Optional[int] = None
        self.listener: Optional[WebSocketListener] = None

    async def start_project(
        self,
        *,
        name: str = "Research Project",
        problem_type: ProblemType = ProblemType.A,
        description: str = "End-to-end modeling project.",
        problem_description: str = "Given dataset, derive optimal strategy.",
    ) -> Dict[str, Any]:
        project = await self._create_project(name=name, description=description)
        await self._upload_file(project["id"], FileRole.PROBLEM_DESCRIPTION, problem_description.encode("utf-8"))
        await self._update_project(project["id"], problem_type=problem_type)
        first_node = await self._start_workflow(project["id"])
        await self._attach_listener()
        return first_node

    async def _create_project(self, name: str, description: str) -> Dict[str, Any]:
        resp = await self.client.post(
            "/api/v1/projects",
            json={"name": name, "description": description},
            headers=self.auth.headers,
        )
        resp.raise_for_status()
        project = resp.json()
        self.project_id = project["id"]
        return project

    async def _upload_file(self, project_id: int, role: FileRole, content: bytes, filename: str = "problem.md"):
        files = {
            "file": (filename, io.BytesIO(content), "text/markdown"),
            "role": (None, role.value),
        }
        resp = await self.client.post(
            f"/api/v1/projects/{project_id}/files",
            files=files,
            headers=self.auth.headers,
        )
        resp.raise_for_status()

    async def _update_project(self, project_id: int, *, problem_type: ProblemType):
        resp = await self.client.patch(
            f"/api/v1/projects/{project_id}",
            json={"problem_type": problem_type.value},
            headers=self.auth.headers,
        )
        resp.raise_for_status()

    async def _start_workflow(self, project_id: int) -> Dict[str, Any]:
        resp = await self.client.post(
            f"/api/v1/projects/{project_id}/start",
            headers=self.auth.headers,
        )
        resp.raise_for_status()
        first_node = resp.json()
        project = await self.get_project()
        self.workflow_id = project["workflow_instance_id"]
        return first_node

    async def _attach_listener(self):
        if not self.workflow_id:
            raise RuntimeError("Workflow has not been started.")
        if self.listener:
            return
        ws_path = f"/api/v1/workflows/{self.workflow_id}/ws?token={self.auth.token}"
        self.listener = WebSocketListener(self.app, ws_path)
        await self.listener.start()

    async def close(self):
        if self.listener:
            await self.listener.stop()
            self.listener = None

    async def wait_for_node_status(self, node_id: int, status_: NodeStatus, timeout: float = 30.0) -> Dict[str, Any]:
        if not self.listener:
            raise RuntimeError("WebSocket listener is not running.")
        target_value = status_.value if isinstance(status_, NodeStatus) else str(status_)

        current = await self.get_node(node_id)
        if self._status_reached(current["status"], target_value):
            return current

        def predicate(event: dict[str, Any]) -> bool:
            data = event.get("data") or {}
            return data.get("id") == node_id and data.get("status") == target_value

        event = await self.listener.wait_for_event(EventType.NODE_STATUS_UPDATED.value, predicate, timeout)
        return event["data"]

    async def wait_for_structure_update(self, timeout: float = 30.0) -> Dict[str, Any]:
        if not self.listener:
            raise RuntimeError("WebSocket listener is not running.")
        event = await self.listener.wait_for_event(EventType.WORKFLOW_STRUCTURE_UPDATED.value, timeout=timeout)
        return event["data"]

    async def wait_for_workflow_status(self, expected_status: str, timeout: float = 30.0) -> Dict[str, Any]:
        if not self.listener:
            raise RuntimeError("WebSocket listener is not running.")

        def predicate(event: dict[str, Any]) -> bool:
            data = event.get("data") or {}
            return data.get("status") == expected_status

        event = await self.listener.wait_for_event(EventType.WORKFLOW_STATUS_UPDATED.value, predicate, timeout)
        return event["data"]

    async def get_project(self) -> Dict[str, Any]:
        if not self.project_id:
            raise RuntimeError("Project not initialized.")
        resp = await self.client.get(
            f"/api/v1/projects/{self.project_id}",
            headers=self.auth.headers,
        )
        resp.raise_for_status()
        return resp.json()

    async def get_node(self, node_id: int) -> Dict[str, Any]:
        resp = await self.client.get(f"/api/v1/nodes/{node_id}", headers=self.auth.headers)
        resp.raise_for_status()
        return resp.json()

    async def list_versions(self, node_id: int) -> List[Dict[str, Any]]:
        resp = await self.client.get(f"/api/v1/nodes/{node_id}/versions", headers=self.auth.headers)
        resp.raise_for_status()
        return resp.json()

    async def manual_edit(self, node_id: int, base_version_id: int, edited_output: Dict[str, Any], summary: str) -> Dict[str, Any]:
        payload = {
            "base_version_id": base_version_id,
            "edited_output_data": edited_output,
            "summary": summary,
        }
        resp = await self.client.post(
            f"/api/v1/nodes/{node_id}/manual-edit",
            json=payload,
            headers=self.auth.headers,
        )
        resp.raise_for_status()
        return resp.json()

    async def switch_version(self, node_id: int, version_id: int) -> Dict[str, Any]:
        resp = await self.client.post(
            f"/api/v1/nodes/{node_id}/versions/{version_id}/activate",
            headers=self.auth.headers,
        )
        resp.raise_for_status()
        return resp.json()

    async def export_project(self) -> bytes:
        if not self.project_id:
            raise RuntimeError("Project not initialized.")
        resp = await self.client.get(
            f"/api/v1/projects/{self.project_id}/export",
            headers=self.auth.headers,
        )
        resp.raise_for_status()
        return resp.content

    async def approve_sca(self, node_id: int, selected_ids: List[str]) -> Dict[str, Any]:
        payload = {
            "action": HITLActionType.CONTINUE.value,
            "interaction_data": {"selected_ids": selected_ids},
        }
        return await self._submit_hitl(node_id, payload)

    async def approve_varl(self, node_id: int) -> Dict[str, Any]:
        payload = {"action": HITLActionType.CONTINUE.value}
        return await self._submit_hitl(node_id, payload)

    async def reject_with_feedback(self, node_id: int, comment: str) -> Dict[str, Any]:
        payload = {
            "action": HITLActionType.REJECT_WITH_FEEDBACK.value,
            "feedback_comment": comment,
        }
        return await self._submit_hitl(node_id, payload)

    async def adjudicate_avl(self, node_id: int, adjudication: List[Dict[str, Any]]) -> Dict[str, Any]:
        payload = {
            "action": HITLActionType.CONTINUE.value,
            "interaction_data": {"adjudication": adjudication},
        }
        return await self._submit_hitl(node_id, payload)

    async def discard_execution(self, node_id: int) -> Dict[str, Any]:
        payload = {"action": HITLActionType.DISCARD.value}
        return await self._submit_hitl(node_id, payload)

    async def _submit_hitl(self, node_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
        resp = await self.client.post(
            f"/api/v1/nodes/{node_id}/hitl",
            json=payload,
            headers=self.auth.headers,
        )
        resp.raise_for_status()
        return resp.json()

    async def retry(self, node_id: int, comment: Optional[str] = None):
        payload = {"modification_comments": comment}
        resp = await self.client.post(
            f"/api/v1/nodes/{node_id}/retry",
            json=payload,
            headers=self.auth.headers,
        )
        resp.raise_for_status()

    async def re_execute(self, node_id: int, base_version_id: Optional[int] = None, comment: Optional[str] = None):
        payload = {"modification_comments": comment, "base_version_id": base_version_id}
        resp = await self.client.post(
            f"/api/v1/nodes/{node_id}/re-execute",
            json=payload,
            headers=self.auth.headers,
        )
        resp.raise_for_status()

    async def cancel(self, node_id: int) -> httpx.Response:
        resp = await self.client.post(
            f"/api/v1/nodes/{node_id}/cancel",
            headers=self.auth.headers,
        )
        return resp

    async def get_workflow_state(self) -> Dict[str, Any]:
        if not self.workflow_id:
            raise RuntimeError("Workflow not initialized.")
        resp = await self.client.get(
            f"/api/v1/workflows/{self.workflow_id}",
            headers=self.auth.headers,
        )
        resp.raise_for_status()
        return resp.json()

    async def list_workflows(self) -> Dict[str, Any]:
        resp = await self.client.get("/api/v1/workflows", headers=self.auth.headers)
        resp.raise_for_status()
        return resp.json()

    async def await_status_and_version(self, node_id: int, expected_status: NodeStatus, timeout: float = 30.0):
        await self.wait_for_node_status(node_id, expected_status, timeout)
        return await self.get_node(node_id)

    async def enforce_frontier(self, node_id: int) -> int:
        resp = await self.client.get(f"/api/v1/nodes/{node_id}", headers=self.auth.headers)
        return resp.status_code

    @staticmethod
    def _status_reached(current_status: str, expected_status: str) -> bool:
        order = {
            NodeStatus.NOT_STARTED.value: 0,
            NodeStatus.EXECUTING.value: 1,
            NodeStatus.AWAITING_HITL_APPROVAL.value: 2,
            NodeStatus.COMPLETED.value: 3,
            NodeStatus.FAILED.value: 4,
            NodeStatus.CANCELED.value: 5,
        }
        current_rank = order.get(current_status, -1)
        expected_rank = order.get(expected_status, -1)
        if current_rank == -1 or expected_rank == -1:
            return current_status == expected_status
        return current_rank >= expected_rank
