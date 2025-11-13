## O-Award Workflow Engine: E2E Test Suite Architecture for Core Logic

This document outlines the architecture for an End-to-End (E2E) test suite for the O-Award Workflow Engine backend. The architecture is designed to comprehensively validate the complex core business logic: workflow execution, Human-in-the-Loop (HITL) interactions, version control, dynamic structure generation, and real-time updates.

### 1\. Testing Philosophy and Strategy

The E2E strategy is tailored to the system's asynchronous, state-driven nature.

1.  **Focus on Core Logic:** The scope is strictly limited to the workflow engine's behavior (state machines, dependency resolution, HITL flows, versioning). Authentication, performance, and security are excluded.
2.  **API-Driven Integration:** Tests simulate a client interacting via the public REST API and WebSocket interface.
3.  **Deterministic Simulation (Mocking the Engine):** Actual LLM calls and Sandbox executions are slow and non-deterministic. The E2E suite **must** mock the `Execution Engine` (specifically `LLMClient` and `SandboxClient`) to provide fast, predefined responses tailored to each test scenario. This isolates the workflow logic from the AI execution.
4.  **Asynchronous Synchronization:** Tests must robustly handle the asynchronous nature of the Arq worker. We will use intelligent synchronization (primarily listening to WebSocket events) rather than arbitrary sleeps or polling.
5.  **Integrated Environment:** Tests require a complete environment: the FastAPI application, a running Arq worker process, a dedicated test database, and Redis.

### 2\. Test Architecture and Tooling

#### 2.1. Technology Stack

  * **Framework:** `pytest` with `pytest-asyncio`.
  * **API Client:** `httpx` (Asynchronous HTTP client).
  * **WebSocket Client:** `websockets` or FastAPI/Starlette WebSocket client.
  * **Mocking:** `pytest-mock` (for patching the Execution Engine).
  * **Environment:** Docker Compose (recommended for managing the DB, Redis, App, and Worker).

#### 2.2. Core Architectural Components

##### A. Fixtures (`conftest.py`)

`pytest` fixtures manage the environment lifecycle:

  * `test_db`: Provides an isolated database instance, migrated using Alembic.
  * `test_redis`: Provides an isolated Redis instance.
  * `test_app`: The FastAPI application instance configured for the test environment.
  * `arq_worker`: **(Critical)** A running Arq worker process connected to `test_redis`. This worker executes the actual tasks but uses the mocked execution engine.
  * `api_client`: An authenticated `httpx.AsyncClient`.
  * `execution_mocker`: A fixture using `pytest-mock` to patch `NodeExecutor.execute_node` and its clients, allowing tests to define expected execution outcomes.

##### B. Core Helper: `WorkflowDriver`

A high-level abstraction class to orchestrate tests and manage asynchronous synchronization.

```python
class WorkflowDriver:
    # Initializes with api_client and a websocket_listener
    # ...

    async def start_project(self, config):
        # Creates project, uploads files, starts workflow
        # ...

    async def wait_for_node_status(self, node_id, expected_status, timeout=30):
        # Uses the WebSocketListener to wait for a NODE_STATUS_UPDATED event
        # matching the criteria, ensuring real-time synchronization.
        # ...

    async def approve_sca(self, node_id, selected_ids: list):
        # Submits HITL Continue with SCA selection data
        # ...

    async def reject_with_feedback(self, node_id, feedback: str):
        # Submits HITL RejectAndProvideModificationComments
        # ...

    async def adjudicate_avl(self, node_id, adjudication_data: list):
        # Submits HITL Continue with AVL adjudication data
        # ...

    async def switch_version(self, node_id, version_id):
        # Activates a historical version
        # ...

    async def get_workflow_state(self):
        # Fetches the current workflow structure and state via API
        # ...
```

##### C. Core Helper: `WebSocketListener`

Manages the WebSocket connection and buffers events for the `WorkflowDriver`.

```python
class WebSocketListener:
    # Connects to ws://.../{workflow_id}/ws
    # ...

    async def wait_for_event(self, event_type, filter_func=None, timeout=10):
        # Waits until a specific event is received.
        # ...
```

### 3\. Comprehensive E2E Test Scenarios

The following scenarios cover the critical execution paths of the workflow engine.

#### Suite 1: Workflow Lifecycle and Golden Path

  * **Scenario 1.1: Project Configuration Validation:** Attempt to start a workflow with missing prerequisites (Problem Description file, Problem Type). Verify API returns validation errors.
  * **Scenario 1.2: Workflow Initialization and Start:** Configure a project correctly and start.
      * *Verification:* Project status -\> `RUNNING`; `WorkflowInstance` created; `configuration_snapshot` saved; First node (1.1.1) transitions to `EXECUTING`.
  * **Scenario 1.3: Linear Execution and Approval (VARL/Simple):** Execute a sequence of nodes (N -\> N+1).
      * *Flow:* Wait for N `AWAITING_HITL_APPROVAL` -\> Approve -\> Wait for N `COMPLETED` and N+1 `EXECUTING`.
      * *Verification:* State transitions are correct; `NodeVersion` created; `temporary_result` deleted; WebSocket events (`NODE_STATUS_UPDATED`, `NODE_ACTIVE_VERSION_CHANGED`) are emitted correctly.
  * **Scenario 1.4: Workflow Completion:** Execute the final node (3.1.2).
      * *Verification:* Workflow and Project status transition to `COMPLETED`; `WORKFLOW_STATUS_UPDATED` event emitted.
  * **Scenario 1.5: Project Export (R6):** After completion, call the Export API.
      * *Verification:* ZIP archive contains the manifest, inputs, and the active version outputs/artifacts of all nodes.

#### Suite 2: HITL Modes and Iteration Cycles

  * **Scenario 2.1: SCA Mode - Single Selection (R5.3):** Execute an SCA node.
      * *Verification:* `candidates` generated. Approving with 0 or \>1 IDs fails validation. Approving with 1 ID succeeds. Final output reflects the selection.
  * **Scenario 2.2: SCA Mode - Multiple Selection:** Execute a multi-select SCA node. Approve with multiple IDs. Verify final output structure.
  * **Scenario 2.3: Rejection and Feedback Loop (VARL/SCA):**
      * *Flow:* Awaiting HITL -\> Reject with feedback.
      * *Verification:* Node transitions back to `EXECUTING`; Feedback recorded in `accumulated_hitl_interactions`; Worker receives feedback for the next execution.
  * **Scenario 2.4: AVL Mode - Iteration (Accepting Critiques):**
      * *Flow:* Awaiting HITL (Critiques present) -\> Submit Adjudication (Accept some).
      * *Verification:* Node transitions back to `EXECUTING` (AVL loop continues); Worker receives `adjudication_data`.
  * **Scenario 2.5: AVL Mode - Termination (Rejecting All Critiques):**
      * *Flow:* Awaiting HITL -\> Submit Adjudication (Reject all).
      * *Verification:* Node transitions to `COMPLETED` (AVL loop terminates); Workflow advances.
  * **Scenario 2.6: Discard Execution (R5.3):**
      * *Flow:* Awaiting HITL -\> Submit `Discard`.
      * *Verification:* `temporary_result` deleted. Status reverts (to `COMPLETED` if a prior version exists, otherwise `NOT_STARTED`).

#### Suite 3: Version Control, Staleness, and Intervention

  * **Scenario 3.1: Version History Integrity:** Execute a node, reject/retry, then approve. Verify multiple `NodeVersion` records exist with correct `hitl_history` and `input_dependencies`.
  * **Scenario 3.2: Manual Editing (Completed Node - R4):**
      * *Flow:* Node N completed (V1) -\> Submit Manual Edit based on V1.
      * *Verification:* V2 created (`source=MANUALLY_EDITED`); V2 activated; `NODE_ACTIVE_VERSION_CHANGED` emitted.
  * **Scenario 3.3: Manual Editing (Bypassing HITL):**
      * *Flow:* Node N `AWAITING_HITL_APPROVAL` -\> Submit Manual Edit (using an appropriate base version).
      * *Verification:* Node transitions directly to `COMPLETED`; New version created; Workflow advances.
  * **Scenario 3.4: Version Switching and Staleness Detection (R5.5.2, R5.2):**
      * *Setup:* A(V1) -\> B(V1). Re-execute A(V2). B is now stale relative to A(V2).
      * *Flow:* Switch A back to V1.
      * *Verification:* A's active version is V1. Query Workflow API: B's `is_stale` flag is now `False`.
  * **Scenario 3.5: Silent State Management and Staleness Resolution (SRS 1.4):**
      * *Setup:* A(V1) -\> B(V1). Re-execute A(V2).
      * *Verification:* B is marked `is_stale`. B does *not* automatically execute.
      * *Flow:* Manually Re-execute B.
      * *Verification:* B executes, creates V2. B(V2)'s `input_dependencies` correctly reference A(V2). B is no longer stale.

#### Suite 4: Dynamic Workflow Generation (Generator Nodes)

  * **Scenario 4.1: Generator Execution and Structure Update (SRS 2.2):**
      * *Flow:* Execute and approve the Generator Node (1.1.2). (Mock must return a `Taskbook`).
      * *Verification:*
          * WebSocket event `WORKFLOW_STRUCTURE_UPDATED` is received with the full new structure.
          * Dynamic nodes (Phase 2) are inserted into the database.
          * Subsequent nodes (Phase 3) have `order_index` shifted correctly.
  * **Scenario 4.2: Dynamic Dependency Rewiring:**
      * *Verification:* Check dependencies of new nodes:
          * Intra-task dependencies (e.g., T1.2.1.2 depends on T1.2.1.1) are correct.
          * Phase 3 nodes (e.g., 3.1.1) dependencies are updated to include all generated Phase 2 terminal nodes.
  * **Scenario 4.3: Execution Flow Post-Generation:**
      * *Verification:* The first dynamically generated node automatically transitions to `EXECUTING`.
  * **Scenario 4.4: Generator Node Restrictions (SRS 2.3):**
      * *Flow:* Attempt to `Re-execute`, `ManualEdit`, or `SwitchVersion` on the completed Generator node.
      * *Verification:* All attempts fail with appropriate error codes (403/409).

#### Suite 5: Execution Control and Error Handling

  * **Scenario 5.1: Node Execution Failure:**
      * *Setup:* Configure `execution_mocker` to raise an exception.
      * *Flow:* Execute node.
      * *Verification:* Node transitions to `FAILED`; Error traceback captured in `temporary_result.error_log`.
  * **Scenario 5.2: Retry Failed Node:**
      * *Flow:* Call `Retry` on the failed node.
      * *Verification:* Node transitions back to `EXECUTING` and completes successfully (assuming mock is reconfigured).
  * **Scenario 5.3: Execution Cancellation (R5.2.3):**
      * *Setup:* Configure `execution_mocker` to sleep (simulate long execution).
      * *Flow:* Start execution -\> Immediately call `Cancel` API.
      * *Verification:* API returns 202. Worker receives abort signal. Node transitions to `CANCELED`.
  * **Scenario 5.4: Dependency Resolution Failure:** Attempt to execute a node when an upstream dependency is `FAILED` or `NOT_STARTED`.
      * *Verification:* Execution fails early in the worker with `DependencyException`; Node transitions to `FAILED`.
  * **Scenario 5.5: Execution Frontier Enforcement (SRS 5.2):** Attempt to access the `NodeDetailView` API for a node beyond the current execution frontier.
      * *Verification:* API returns 403 Forbidden.