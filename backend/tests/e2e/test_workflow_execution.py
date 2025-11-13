import asyncio
import io
import json
import zipfile
from typing import Dict

import pytest

from backend.models.project import FileRole, ProblemType
from backend.models.workflow import NodeStatus
from backend.schemas.events import EventType
from backend.schemas.hitl import AdjudicationDecision
from tests.support.execution_mocker import PlannedExecution, planned_result


def _build_taskbook(task_ids):
    tasks = []
    for task_id in task_ids:
        tasks.append(
            {
                "task_id": task_id,
                "task_name": f"Task {task_id}",
                "io_interfaces": {
                    "inputs": {"1.1.1": ["Formal Problem Restatement"]},
                    "outputs": ["Key Artifact"],
                },
                "external_inputs": ["Problem Statement"],
            }
        )
    return {"tasks": tasks}


def _map_node_ids(workflow_state: Dict) -> Dict[str, int]:
    mapping: Dict[str, int] = {}
    for phase in workflow_state["phases"]:
        for stage in phase["stages"]:
            for node in stage["nodes"]:
                mapping[node["definition_id"]] = node["id"]
    return mapping


def _sca_candidates(*candidate_ids):
    return [{"id": cid, "name": f"Candidate {cid}"} for cid in candidate_ids]


def _avl_output(content: str, critiques=None):
    return {
        "primary_artifact": {
            "content": content,
            "Formal Problem Restatement": f"{content} restatement",
            "Global Assumption Framework": f"Assumptions derived from {content}",
        },
        "critiques": critiques or [],
    }


@pytest.mark.asyncio
async def test_workflow_golden_path_and_export(api_client, workflow_driver, execution_mocker):
    driver = workflow_driver

    project = await driver._create_project(name="Golden Path", description="Validate config gating.")
    response = await api_client.post(
        f"/api/v1/projects/{project['id']}/start",
        headers=driver.auth.headers,
    )
    assert response.status_code == 409
    error_payload = response.json()
    assert "Problem Type" in error_payload.get("message", "")

    await driver._upload_file(
        project["id"],
        role=FileRole.PROBLEM_DESCRIPTION,
        content=b"Problem context",
    )
    await driver._upload_file(
        project["id"],
        role=FileRole.DATASET,
        content=b"csv,data",
        filename="data.csv",
    )
    await driver._update_project(project["id"], problem_type=ProblemType.A)
    print("Project configured")

    task_ids = ["TaskA"]
    execution_mocker.plan(
        "1.1.1",
        planned_result(output=_avl_output("AVL Draft")),
    )
    execution_mocker.plan(
        "1.1.2",
        planned_result(
            output={
                "candidates": [
                    {
                        "id": "GEN_PRIMARY",
                        "name": "Generator Option",
                        "Structured Modeling Taskbook": _build_taskbook(task_ids),
                    }
                ],
                "analysis": "Compare generator candidates",
            }
        ),
    )
    execution_mocker.plan(
        "TaskA.2.1.1",
        planned_result(output={"candidates": _sca_candidates("TA211", "TA212"), "analysis": "Task insights"}),
    )
    execution_mocker.plan(
        "TaskA.2.1.2",
        planned_result(output={"primary_artifact": {"content": "Formulation"}, "critiques": []}),
    )
    execution_mocker.plan(
        "TaskA.2.2.1",
        planned_result(output={"primary_artifact": {"content": "Code Execution"}, "critiques": []}),
    )
    execution_mocker.plan(
        "TaskA.2.2.2",
        planned_result(output={"candidates": _sca_candidates("V1", "V2", "V3"), "analysis": "Visualization set"}),
    )
    execution_mocker.plan(
        "3.1.1",
        planned_result(output={"candidates": _sca_candidates("G1", "G2"), "analysis": "Narrative options"}),
    )
    execution_mocker.plan(
        "3.1.2",
        planned_result(output={"primary_artifact": {"content": "Final Paper Draft"}}),
    )

    first_node = await driver._start_workflow(project["id"])
    print("Workflow started")
    await driver._attach_listener()
    node_map = _map_node_ids(await driver.get_workflow_state())

    node_111 = first_node["id"]
    await driver.wait_for_node_status(node_111, NodeStatus.EXECUTING)
    print("Node 1.1.1 executing")
    await driver.wait_for_node_status(node_111, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.adjudicate_avl(node_111, [])
    await driver.wait_for_node_status(node_111, NodeStatus.COMPLETED)
    print("Node 1.1.1 completed")

    project_state = await driver.get_project()
    assert project_state["status"] == "Running"
    assert project_state["configuration_snapshot"]

    generator_id = node_map["1.1.2"]
    current_generator = await driver.get_node(generator_id)
    print("Generator current status:", current_generator["status"])
    print("Waiting for generator to execute")
    await driver.wait_for_node_status(generator_id, NodeStatus.EXECUTING)
    print("Generator executing")
    await driver.wait_for_node_status(generator_id, NodeStatus.AWAITING_HITL_APPROVAL)

    invalid = await api_client.post(
        f"/api/v1/nodes/{generator_id}/hitl",
        json={"action": "Continue", "interaction_data": {"selected_ids": []}},
        headers=driver.auth.headers,
    )
    assert invalid.status_code == 409

    await driver.approve_sca(generator_id, ["GEN_PRIMARY"])
    await driver.wait_for_node_status(generator_id, NodeStatus.COMPLETED)
    print("Generator completed")

    print("Waiting for workflow structure update")
    structure_event = await driver.listener.wait_for_event(EventType.WORKFLOW_STRUCTURE_UPDATED.value, timeout=10)
    updated_state = structure_event["data"]
    node_map = _map_node_ids(updated_state)
    first_dynamic = node_map["TaskA.2.1.1"]
    print("Waiting for first dynamic node to execute")
    await driver.wait_for_node_status(first_dynamic, NodeStatus.EXECUTING)

    stage2_detail = await driver.get_node(node_map["TaskA.2.1.2"])
    assert "TaskA.2.1.1" in stage2_detail["dependencies"]

    stage3_detail = await driver.get_node(node_map["3.1.1"])
    assert any(dep.startswith("TaskA.2.2.2") for dep in stage3_detail["dependencies"])

    await driver.wait_for_node_status(first_dynamic, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_sca(first_dynamic, ["TA211"])
    await driver.wait_for_node_status(first_dynamic, NodeStatus.COMPLETED)
    print("TaskA.2.1.1 completed")

    node_212 = node_map["TaskA.2.1.2"]
    await driver.wait_for_node_status(node_212, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.adjudicate_avl(node_212, [])
    await driver.wait_for_node_status(node_212, NodeStatus.COMPLETED)
    print("TaskA.2.1.2 completed")

    node_221 = node_map["TaskA.2.2.1"]
    await driver.wait_for_node_status(node_221, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_varl(node_221)
    await driver.wait_for_node_status(node_221, NodeStatus.COMPLETED)
    print("TaskA.2.2.1 completed")

    node_222 = node_map["TaskA.2.2.2"]
    await driver.wait_for_node_status(node_222, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_sca(node_222, ["V1", "V2"])
    await driver.wait_for_node_status(node_222, NodeStatus.COMPLETED)
    print("TaskA.2.2.2 completed")

    narrative = node_map["3.1.1"]
    await driver.wait_for_node_status(narrative, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_sca(narrative, ["G1"])
    await driver.wait_for_node_status(narrative, NodeStatus.COMPLETED)
    print("Node 3.1.1 completed")

    final_node = node_map["3.1.2"]
    await driver.wait_for_node_status(final_node, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_varl(final_node)
    await driver.wait_for_node_status(final_node, NodeStatus.COMPLETED)
    print("Node 3.1.2 completed")

    workflow_summary = await driver.wait_for_workflow_status("Completed")
    assert workflow_summary["status"] == "Completed"

    project_state = await driver.get_project()
    assert project_state["status"] == "Completed"

    export_bytes = await driver.export_project()
    with zipfile.ZipFile(io.BytesIO(export_bytes)) as archive:
        names = archive.namelist()
        assert "Project Manifest.json" in names
        manifest = json.loads(archive.read("Project Manifest.json"))
        assert manifest["project_details"]["status"] == "Completed"
        inputs = [name for name in names if name.startswith("Original Inputs/Problem Description")]
        assert inputs
        result_dirs = [name for name in names if name.startswith("Results/")]
        assert result_dirs

    rerun_resp = await api_client.post(
        f"/api/v1/nodes/{generator_id}/re-execute",
        json={"modification_comments": None, "base_version_id": None},
        headers=driver.auth.headers,
    )
    assert rerun_resp.status_code == 403


@pytest.mark.asyncio
async def test_hitl_iterations_and_discard(workflow_driver, execution_mocker):
    driver = workflow_driver
    project = await driver._create_project(name="HITL Cycles", description="Test loops")
    await driver._upload_file(project["id"], role=FileRole.PROBLEM_DESCRIPTION, content=b"Problem file")
    await driver._update_project(project["id"], problem_type=ProblemType.B)

    execution_mocker.plan(
        "1.1.1",
        planned_result(
            output=_avl_output(
                "AVL Draft 1",
                critiques=[{"id": "AVL-C1", "critique": "Need more depth", "severity": "High"}],
            )
        ),
        planned_result(output=_avl_output("AVL Draft 2")),
    )
    execution_mocker.plan(
        "1.1.2",
        planned_result(
            output={
                "candidates": [
                    {
                        "id": "GEN_B",
                        "name": "Plan B",
                        "Structured Modeling Taskbook": _build_taskbook(["TaskB"]),
                    }
                ],
                "analysis": "Generator analysis",
            }
        ),
    )
    execution_mocker.plan(
        "TaskB.2.1.1",
        planned_result(output={"candidates": _sca_candidates("B211", "B212"), "analysis": "B2.1.1"}),
        planned_result(output={"candidates": _sca_candidates("B311", "B312"), "analysis": "Re-run"}),
        planned_result(output={"candidates": _sca_candidates("B411", "B412"), "analysis": "Staleness"}),
    )
    execution_mocker.plan(
        "TaskB.2.1.2",
        planned_result(output={"primary_artifact": {"content": "TaskB Formulation"}, "critiques": []}),
    )
    execution_mocker.plan(
        "TaskB.2.2.1",
        planned_result(output={"primary_artifact": {"content": "Code attempt 1"}}),
        planned_result(output={"primary_artifact": {"content": "Code attempt 2"}}),
    )
    execution_mocker.plan(
        "TaskB.2.2.2",
        planned_result(output={"candidates": _sca_candidates("BV1", "BV2"), "analysis": "Viz first"}),
        planned_result(output={"candidates": _sca_candidates("BV3", "BV4"), "analysis": "Viz second"}),
    )

    first_node = await driver._start_workflow(project["id"])
    await driver._attach_listener()
    node_map = _map_node_ids(await driver.get_workflow_state())

    node_111 = first_node["id"]
    await driver.wait_for_node_status(node_111, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.adjudicate_avl(
        node_111,
        [
            {
                "critique_id": "AVL-C1",
                "decision": AdjudicationDecision.ACCEPTED.value,
                "comment": "Please expand assumptions",
            }
        ],
    )
    await driver.wait_for_node_status(node_111, NodeStatus.EXECUTING)
    await driver.wait_for_node_status(node_111, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.adjudicate_avl(
        node_111,
        [
            {
                "critique_id": "AVL-C1",
                "decision": AdjudicationDecision.REJECTED.value,
                "comment": "Issue solved",
            }
        ],
    )
    await driver.wait_for_node_status(node_111, NodeStatus.COMPLETED)
    versions = await driver.list_versions(node_111)
    assert len(versions) == 1
    assert any("AVLAdjudication" in json.dumps(v["hitl_history"]) for v in versions)

    generator_id = node_map["1.1.2"]
    await driver.wait_for_node_status(generator_id, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_sca(generator_id, ["GEN_B"])
    await driver.wait_for_node_status(generator_id, NodeStatus.COMPLETED)

    workflow_state = await driver.get_workflow_state()
    node_map = _map_node_ids(workflow_state)

    code_node = node_map["TaskB.2.2.1"]
    await driver.wait_for_node_status(code_node, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.reject_with_feedback(code_node, "Execution logs missing.")
    await driver.wait_for_node_status(code_node, NodeStatus.EXECUTING)
    await driver.wait_for_node_status(code_node, NodeStatus.AWAITING_HITL_APPROVAL)
    reject_detail = await driver.get_node(code_node)
    assert reject_detail["pending_result"]["accumulated_hitl_interactions"]
    await driver.approve_varl(code_node)
    await driver.wait_for_node_status(code_node, NodeStatus.COMPLETED)

    sca_node = node_map["TaskB.2.1.1"]
    await driver.wait_for_node_status(sca_node, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_sca(sca_node, ["B211"])
    await driver.wait_for_node_status(sca_node, NodeStatus.COMPLETED)

    versions_before_reexec = await driver.list_versions(sca_node)
    await driver.re_execute(sca_node, base_version_id=versions_before_reexec[0]["id"])
    await driver.wait_for_node_status(sca_node, NodeStatus.AWAITING_HITL_APPROVAL)
    discard_resp = await driver.discard_execution(sca_node)
    assert discard_resp["action"] == "Discarded"
    node_detail = await driver.get_node(sca_node)
    assert node_detail["status"] == NodeStatus.COMPLETED
    assert node_detail["pending_result"] is None


@pytest.mark.asyncio
async def test_manual_edits_version_switching_and_staleness(workflow_driver, execution_mocker):
    driver = workflow_driver
    project = await driver._create_project(name="Version Control", description="Manual interventions")
    await driver._upload_file(project["id"], role=FileRole.PROBLEM_DESCRIPTION, content=b"Project docs")
    await driver._update_project(project["id"], problem_type=ProblemType.C)

    execution_mocker.plan(
        "1.1.1",
        planned_result(output=_avl_output("AVL C1")),
        planned_result(output=_avl_output("AVL C2")),
        planned_result(output=_avl_output("AVL C3")),
    )
    execution_mocker.plan(
        "1.1.2",
        planned_result(
            output={
                "candidates": [
                    {
                        "id": "GEN_C",
                        "name": "Option C",
                        "Structured Modeling Taskbook": _build_taskbook(["TaskC"]),
                    }
                ],
                "analysis": "Generator C",
            }
        ),
    )
    execution_mocker.plan(
        "TaskC.2.1.1",
        planned_result(output={"candidates": _sca_candidates("C211", "C212"), "analysis": "C211"}),
        planned_result(output={"candidates": _sca_candidates("C311", "C312"), "analysis": "C311"}),
    )
    execution_mocker.plan(
        "TaskC.2.1.2",
        planned_result(output={"primary_artifact": {"content": "Formulation C"}, "critiques": []}),
    )
    execution_mocker.plan(
        "TaskC.2.2.1",
        planned_result(output={"primary_artifact": {"content": "Code C"}, "critiques": []}),
    )
    execution_mocker.plan(
        "TaskC.2.2.2",
        planned_result(output={"candidates": _sca_candidates("CV1", "CV2"), "analysis": "Viz C"}),
        planned_result(output={"candidates": _sca_candidates("CV3", "CV4"), "analysis": "Viz C re-run"}),
    )

    await driver._start_workflow(project["id"])
    await driver._attach_listener()
    node_map = _map_node_ids(await driver.get_workflow_state())

    node_111 = node_map["1.1.1"]
    await driver.wait_for_node_status(node_111, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.adjudicate_avl(node_111, [])
    await driver.wait_for_node_status(node_111, NodeStatus.COMPLETED)

    generator_id = node_map["1.1.2"]
    await driver.wait_for_node_status(generator_id, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_sca(generator_id, ["GEN_C"])
    await driver.wait_for_node_status(generator_id, NodeStatus.COMPLETED)

    workflow_state = await driver.get_workflow_state()
    node_map = _map_node_ids(workflow_state)

    sca_node = node_map["TaskC.2.1.1"]
    await driver.wait_for_node_status(sca_node, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_sca(sca_node, ["C211"])
    await driver.wait_for_node_status(sca_node, NodeStatus.COMPLETED)

    avl_node = node_map["TaskC.2.1.2"]
    await driver.wait_for_node_status(avl_node, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.adjudicate_avl(avl_node, [])
    await driver.wait_for_node_status(avl_node, NodeStatus.COMPLETED)
    versions = await driver.list_versions(avl_node)
    manual_summary = "SME correction"
    manual_payload = {"primary_artifact": {"content": "Manual Formulation"}}
    await driver.manual_edit(avl_node, base_version_id=versions[0]["id"], edited_output=manual_payload, summary=manual_summary)
    updated_node = await driver.get_node(avl_node)
    assert updated_node["active_version"]["summary"] == manual_summary
    assert updated_node["active_version"]["source"] == "MANUALLY_EDITED"

    viz_node = node_map["TaskC.2.2.2"]
    await driver.wait_for_node_status(viz_node, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_sca(viz_node, ["CV1"])
    await driver.wait_for_node_status(viz_node, NodeStatus.COMPLETED)
    viz_versions = await driver.list_versions(viz_node)
    await driver.re_execute(viz_node, base_version_id=viz_versions[0]["id"])
    await driver.wait_for_node_status(viz_node, NodeStatus.AWAITING_HITL_APPROVAL)
    edited_visual = {"charts": ["Manual Revision"]}
    await driver.manual_edit(viz_node, base_version_id=viz_versions[0]["id"], edited_output=edited_visual, summary="Viz override")
    viz_detail = await driver.get_node(viz_node)
    assert len(await driver.list_versions(viz_node)) == 2
    assert viz_detail["status"] == NodeStatus.COMPLETED

    await driver.re_execute(node_111)
    await driver.wait_for_node_status(node_111, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.adjudicate_avl(node_111, [])
    await driver.wait_for_node_status(node_111, NodeStatus.COMPLETED)
    versions_after_rerun = await driver.list_versions(node_111)
    assert len(versions_after_rerun) == 2

    dependent_node = await driver.get_node(sca_node)
    assert dependent_node["staleness_report"]
    v1_id = versions_after_rerun[-1]["id"]
    await driver.switch_version(node_111, v1_id)
    refreshed = await driver.get_node(sca_node)
    assert refreshed["staleness_report"] is None

    await driver.re_execute(node_111)
    await driver.wait_for_node_status(node_111, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.adjudicate_avl(node_111, [])
    await driver.wait_for_node_status(node_111, NodeStatus.COMPLETED)
    upstream_versions = await driver.list_versions(node_111)
    active_upstream = upstream_versions[0]["id"]

    await driver.re_execute(sca_node)
    await driver.wait_for_node_status(sca_node, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_sca(sca_node, ["C311"])
    await driver.wait_for_node_status(sca_node, NodeStatus.COMPLETED)
    downstream_versions = await driver.list_versions(sca_node)
    deps = downstream_versions[0]["input_dependencies"]
    assert deps.get(node_111) == active_upstream or deps.get(str(node_111)) == active_upstream


@pytest.mark.asyncio
async def test_execution_failures_and_controls(workflow_driver, execution_mocker):
    driver = workflow_driver
    project = await driver._create_project(name="Error Handling", description="Control flows")
    await driver._upload_file(project["id"], role=FileRole.PROBLEM_DESCRIPTION, content=b"Scenario data")
    await driver._update_project(project["id"], problem_type=ProblemType.D)

    execution_mocker.plan(
        "1.1.1",
        PlannedExecution(exception=RuntimeError("boom")),
        planned_result(output=_avl_output("Recovered AVL")),
    )
    execution_mocker.plan(
        "1.1.2",
        planned_result(
            output={
                "candidates": [
                    {
                        "id": "GEN_D",
                        "name": "Resilient Plan",
                        "Structured Modeling Taskbook": _build_taskbook(["TaskD"]),
                    }
                ],
                "analysis": "Generator D",
            },
            delay=1.5,
        ),
        planned_result(
            output={
                "candidates": [
                    {
                        "id": "GEN_D",
                        "name": "Resilient Plan",
                        "Structured Modeling Taskbook": _build_taskbook(["TaskD"]),
                    }
                ],
                "analysis": "Generator D Done",
            }
        ),
    )
    execution_mocker.plan(
        "TaskD.2.1.1",
        planned_result(output={"candidates": _sca_candidates("D211", "D212"), "analysis": "TaskD first"}),
    )
    execution_mocker.plan(
        "TaskD.2.1.2",
        planned_result(output={"primary_artifact": {"content": "Formulation D"}, "critiques": []}),
        PlannedExecution(exception=RuntimeError("formulation regression")),
    )
    execution_mocker.plan(
        "TaskD.2.2.1",
        planned_result(output={"primary_artifact": {"content": "Code D initial"}}),
    )

    first_node = await driver._start_workflow(project["id"])
    await driver._attach_listener()
    node_map = _map_node_ids(await driver.get_workflow_state())

    node_111 = first_node["id"]
    await driver.wait_for_node_status(node_111, NodeStatus.FAILED)
    failed_detail = await driver.get_node(node_111)
    assert "boom" in failed_detail["pending_result"]["error_log"]

    await driver.retry(node_111)
    await driver.wait_for_node_status(node_111, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.adjudicate_avl(node_111, [])
    await driver.wait_for_node_status(node_111, NodeStatus.COMPLETED)

    generator_id = node_map["1.1.2"]
    await driver.wait_for_node_status(generator_id, NodeStatus.EXECUTING)
    await asyncio.sleep(0.2)
    cancel_resp = await driver.cancel(generator_id)
    assert cancel_resp.status_code == 202
    await driver.wait_for_node_status(generator_id, NodeStatus.CANCELED)

    await driver.retry(generator_id)
    await driver.wait_for_node_status(generator_id, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_sca(generator_id, ["GEN_D"])
    await driver.wait_for_node_status(generator_id, NodeStatus.COMPLETED)

    workflow_state = await driver.get_workflow_state()
    node_map = _map_node_ids(workflow_state)
    frontier_code = await driver.enforce_frontier(node_map["3.1.1"])
    assert frontier_code == 403

    sca_node = node_map["TaskD.2.1.1"]
    await driver.wait_for_node_status(sca_node, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_sca(sca_node, ["D211"])
    await driver.wait_for_node_status(sca_node, NodeStatus.COMPLETED)

    avl_node = node_map["TaskD.2.1.2"]
    await driver.wait_for_node_status(avl_node, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.adjudicate_avl(avl_node, [])
    await driver.wait_for_node_status(avl_node, NodeStatus.COMPLETED)

    code_node = node_map["TaskD.2.2.1"]
    await driver.wait_for_node_status(code_node, NodeStatus.AWAITING_HITL_APPROVAL)
    await driver.approve_varl(code_node)
    await driver.wait_for_node_status(code_node, NodeStatus.COMPLETED)

    await driver.re_execute(avl_node)
    await driver.wait_for_node_status(avl_node, NodeStatus.FAILED)
    avl_failed = await driver.get_node(avl_node)
    assert "regression" in avl_failed["pending_result"]["error_log"]

    await driver.re_execute(code_node)
    await driver.wait_for_node_status(code_node, NodeStatus.FAILED)
    code_failed = await driver.get_node(code_node)
    assert "Upstream dependency" in code_failed["pending_result"]["error_log"]
