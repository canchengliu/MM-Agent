"""
Service for exporting project results into a standardized archive format.
This service fulfills requirements described in FRS R6.
"""

import datetime
import io
import json
import re
import zipfile
from typing import Any, Dict, List

from loguru import logger
from sqlalchemy.orm import Session, joinedload

from backend.models import NodeInstance, Project, ProjectFile
from backend.services.execution_engine.config_resolver import resolve_config
from backend.services.execution_engine.executor import NodeExecutor
from backend.services.execution_engine.handlers.registry import get_handler_class
from backend.services.storage_service import storage_service


def _sanitize_filename(name: str) -> str:
    """Return a filesystem-safe filename fragment."""
    cleaned = re.sub(r'[<>:"/\\|?*]', "_", name or "")
    cleaned = re.sub(r"[\x00-\x1f\x7f]", "", cleaned)
    return cleaned.strip() or "untitled"


class ExportService:
    """Service to handle the project export feature (R6)."""

    def __init__(self, db: Session):
        self.db = db

    def export_project_to_zip(self, project: Project) -> bytes:
        """Compile all project artifacts into a single ZIP archive."""
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            logger.info("Starting export for project '{}'", project.name)
            self._add_original_inputs(zf, project)
            node_data = self._get_node_outputs_with_instances(project)
            self._add_structured_outputs(zf, project, node_data)
            self._add_project_manifest(zf, project, node_data)
            logger.info("Project export completed for '{}'", project.name)

        zip_buffer.seek(0)
        return zip_buffer.read()

    def _get_node_outputs_with_instances(self, project: Project) -> List[Dict[str, Any]]:
        """Retrieve node instances alongside their active version outputs and artifacts."""
        if not project.workflow_instance:
            return []

        nodes_with_active_versions: List[NodeInstance] = (
            self.db.query(NodeInstance)
            .filter(
                NodeInstance.workflow_instance_id == project.workflow_instance.id,
                NodeInstance.active_version_id.isnot(None),
            )
            .options(joinedload(NodeInstance.active_version))
            .order_by(NodeInstance.order_index)
            .all()
        )

        nodes: List[Dict[str, Any]] = []
        for node in nodes_with_active_versions:
            if not node.active_version or node.active_version.output_data is None:
                continue
            nodes.append(
                {
                    "node_instance": node,
                    "output_data": node.active_version.output_data,
                    "execution_artifacts": node.active_version.execution_artifacts,
                    "version_number": node.active_version.version_number,
                }
            )

        logger.debug("Gathered outputs for {} nodes.", len(nodes))
        return nodes

    def _write_content_to_zip(self, zf: zipfile.ZipFile, path: str, data: Any):
        """Serialize content to bytes (if needed) and write it into the archive."""
        if isinstance(data, bytes):
            content_bytes = data
        elif isinstance(data, (dict, list)):
            content_bytes = json.dumps(data, indent=2, default=str).encode("utf-8")
        else:
            content_bytes = str(data).encode("utf-8")
        zf.writestr(path, content_bytes)

    def _add_original_inputs(self, zf: zipfile.ZipFile, project: Project):
        """Add the project's original uploaded files to the archive."""
        project_files: List[ProjectFile] = (
            self.db.query(ProjectFile).filter(ProjectFile.project_id == project.id).all()
        )
        if not project_files:
            return

        for p_file in project_files:
            try:
                content = storage_service.get_file_content(p_file.storage_path)
                role_folder = _sanitize_filename(p_file.role.value)
                path = f"Original Inputs/{role_folder}/{p_file.filename}"
                self._write_content_to_zip(zf, path, content)
            except Exception as exc:
                logger.error("Failed to add original input '{}' to export: {}", p_file.filename, exc)
                error_info = f"Error reading file: {p_file.filename}\n{exc}"
                zf.writestr(f"Original Inputs/{p_file.filename}.error.txt", error_info)

    def _add_structured_outputs(
        self,
        zf: zipfile.ZipFile,
        project: Project,
        node_data_list: List[Dict[str, Any]],
    ):
        """Delegate export formatting to node handlers."""
        if not node_data_list:
            return

        config = resolve_config(project.configuration_snapshot)
        temp_executor = NodeExecutor(config=config)

        for data in node_data_list:
            node_instance: NodeInstance = data["node_instance"]
            output_data = data.get("output_data")
            if not output_data:
                continue

            handler_cls = get_handler_class(node_instance.handler_type)
            handler = handler_cls(temp_executor, node_instance)

            order_index = node_instance.order_index
            node_name = _sanitize_filename(node_instance.name)
            base_path = f"Results/{order_index:02d}_{node_name}/"

            handler.format_export(zf, output_data, base_path, data.get("execution_artifacts"))

    def _add_project_manifest(
        self, zf: zipfile.ZipFile, project: Project, node_data_list: List[Dict[str, Any]]
    ):
        """Generate the project manifest detailing exported artifacts."""
        exported_nodes_summary = [
            {
                "definition_id": data["node_instance"].definition_id,
                "name": data["node_instance"].name,
                "order_index": data["node_instance"].order_index,
                "exported_version": data["version_number"],
            }
            for data in sorted(node_data_list, key=lambda item: item["node_instance"].order_index)
        ]

        manifest = {
            "project_details": {
                "name": project.name,
                "description": project.description,
                "status": project.status.value,
                "problem_type": project.problem_type.value,
                "created_at": project.created_at,
                "export_date": datetime.datetime.utcnow(),
            },
            "workflow_details": {
                "name": project.workflow_instance.name if project.workflow_instance else "N/A",
                "status": project.workflow_instance.status.value if project.workflow_instance else "N/A",
            },
            "exported_nodes": exported_nodes_summary,
            "configuration_snapshot": project.configuration_snapshot,
        }

        self._write_content_to_zip(zf, "Project Manifest.json", manifest)
