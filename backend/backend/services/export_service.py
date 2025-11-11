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
            node_outputs = self._get_node_outputs(project)
            self._add_structured_outputs(zf, node_outputs)
            self._add_project_manifest(zf, project, node_outputs)
            logger.info("Project export completed for '{}'", project.name)

        zip_buffer.seek(0)
        return zip_buffer.read()

    def _get_node_outputs(self, project: Project) -> Dict[str, Dict[str, Any]]:
        """Retrieve output data from the active version of each executed node."""
        if not project.workflow_instance:
            return {}

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

        outputs: Dict[str, Dict[str, Any]] = {}
        for node in nodes_with_active_versions:
            if node.active_version and node.active_version.output_data is not None:
                outputs[node.definition_id] = {
                    "name": node.name,
                    "output": node.active_version.output_data,
                    "version_number": node.active_version.version_number,
                    "order_index": node.order_index,
                }

        logger.debug("Gathered outputs for {} nodes.", len(outputs))
        return outputs

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

    def _add_structured_outputs(self, zf: zipfile.ZipFile, node_outputs: Dict[str, Dict[str, Any]]):
        """Dispatch node outputs into their artifact-specific handlers."""
        sorted_nodes = sorted(node_outputs.items(), key=lambda item: item[1].get("order_index", 999))
        for def_id, data in sorted_nodes:
            handled = False
            handled = self._add_final_paper(zf, def_id, data) or handled
            handled = self._add_code_artifacts(zf, data) or handled
            handled = self._add_attachments(zf, data) or handled
            if not handled and data.get("output"):
                self._add_intermediate_result(zf, data)

    def _add_final_paper(self, zf: zipfile.ZipFile, def_id: str, data: Dict[str, Any]) -> bool:
        """Capture the final competition paper, if present."""
        output = data.get("output", {})
        if def_id == "3.1.2" and "Submission-Ready Paper" in output:
            paper_content = output["Submission-Ready Paper"]
            self._write_content_to_zip(zf, "Final Paper/O-Award Paper.md", paper_content)
            return True
        return False

    def _add_code_artifacts(self, zf: zipfile.ZipFile, data: Dict[str, Any]) -> bool:
        """Capture generated code artifacts for a node."""
        output_data = data.get("output", {}) or {}
        node_name = _sanitize_filename(data.get("name", "untitled"))
        order_index = data.get("order_index", 999)
        code_keys = ["code", "script", "execution_script"]
        handled = False

        for key in code_keys:
            if key in output_data:
                path = f"Code Artifacts/{order_index:02d}_{node_name}_{key}.py"
                self._write_content_to_zip(zf, path, output_data[key])
                handled = True
        return handled

    def _add_attachments(self, zf: zipfile.ZipFile, data: Dict[str, Any]) -> bool:
        """Capture supporting attachments and visualization data."""
        output_data = data.get("output", {}) or {}
        node_name = _sanitize_filename(data.get("name", "untitled"))
        order_index = data.get("order_index", 999)
        attachment_keys = ["vv_report", "key_output_doc", "visualization", "plot", "sensitivity_data"]
        handled = False

        for key in attachment_keys:
            if key in output_data:
                path = f"Attachments and Visualizations/{order_index:02d}_{node_name}_{key}.json"
                self._write_content_to_zip(zf, path, output_data[key])
                handled = True
        return handled

    def _add_intermediate_result(self, zf: zipfile.ZipFile, data: Dict[str, Any]):
        """Persist intermediate JSON results for nodes lacking a specialized handler."""
        node_name = _sanitize_filename(data.get("name", "untitled"))
        order_index = data.get("order_index", 999)
        path = f"Intermediate Results/{order_index:02d}_{node_name}.json"
        self._write_content_to_zip(zf, path, data["output"])

    def _add_project_manifest(
        self, zf: zipfile.ZipFile, project: Project, node_outputs: Dict[str, Dict[str, Any]]
    ):
        """Generate the project manifest detailing exported artifacts."""
        exported_nodes_summary = [
            {
                "definition_id": def_id,
                "name": data["name"],
                "order_index": data["order_index"],
                "exported_version": data["version_number"],
            }
            for def_id, data in sorted(node_outputs.items(), key=lambda item: item[1]["order_index"])
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
