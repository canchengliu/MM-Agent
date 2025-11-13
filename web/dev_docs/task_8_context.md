<design_doc>
--- (139-151 lines) ---

| ID | 功能名称 | 描述 | 来源 | 优先级 |
| :--- | :--- | :--- | :--- | :--- |
| N1.1 | 工作流可视化 | 以可视化格式（分阶段流程图）显示完整的工作流结构。 | FRS 5.1 | P0 |
| N1.2 | 动态结构可视化 | 可视化工具必须能够动态展示 Generator 节点生成的结构。 | FRS 5.1 | P0 |
| N2.1 | 实时状态显示 | 实时显示每个节点的状态和执行阶段。 | FRS 5.2 | P0 |
| N2.2 | 过时状态可视化 | 清晰标识“陈旧 (Stale)”的节点。 | FRS 5.2 | P1 |
| N3.1 | 节点回溯与审查 (Jumping) | 用户可以选择任何已执行的节点以查看其详细信息。 | FRS 5.3, SRS 5.2 | P0 |
| N3.2 | 执行前沿控制 | 不允许跳转到尚未执行的未来节点。 | SRS 5.2 | P0 |
| R1.1 | WebSocket 实时通信 | 建立安全的 WebSocket 连接，实现实时状态更新。 | API 6 | P1 |
| R1.2 | 实时事件处理 | 客户端处理 `NODE_STATUS_UPDATED`, `WORKFLOW_STRUCTURE_UPDATED`, `NODE_ACTIVE_VERSION_CHANGED` 等事件。 | API 6.5 | P1 |
| R1.3 | 断线重连与状态同步 | 客户端实现断线重连，并在重连后通过 REST API 同步全量状态。 | API 6.1 | P1 |



--- (483-486 lines) ---
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node A)。
      * **前端响应 (关键):** 前端监听到此事件，立即调用 `GET /workflows/{id}` 重新获取全量工作流状态。
      * 新的状态中，Node B 的 `is_stale` 标志为 `true`。
5.  **UI 更新与过时感知:**


--- (497-498 lines) ---
      * **系统响应 (WebSocket):** WebSocket 推送 `NODE_STATUS_UPDATED` (B-\>Executing)。
8.  **UI 更新:** Node B 进入执行状态，⚠️ 图标消失。


--- (518-519 lines) ---
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node C)。
      * **前端响应:** UI 退出编辑模式。Right Sidebar 更新。前端触发工作流全量状态刷新（同 2.3.2 步骤 4），更新下游节点的 `is_stale` 标志。


--- (530-538 lines) ---
3.  **系统广播结构更新 (WebSocket - 关键):**
      * 后端广播 `WORKFLOW_STRUCTURE_UPDATED` 事件。负载包含**全新且完整**的 `WorkflowInstanceRead` 对象。
4.  **前端响应与状态同步 (关键):**
      * 前端监听到此事件。
      * **全量替换:** 前端（Zustand Workflow Store）必须立即丢弃当前的 `phases` 结构，并用事件负载中的新数据进行**全量替换**。
5.  **UI 更新与重渲染:**
      * Left Navigator (A) 根据新结构完全重渲染，平滑展示新插入的节点。
      * UI 显示短暂通知（Toast: "Workflow structure updated."）。
6.  **导航:** 根据 HITL 审批的返回结果（`action: ExecuteNext`），前端自动导航到新插入序列的第一个节点，该节点通常会自动开始执行。


--- (645-683 lines) ---

实现依赖于前端状态管理（Zustand）与后端实时通信（WebSocket, REST API）的精确协同。

##### 1\. 状态同步范式 (State Synchronization Paradigm)

  * 严格遵循 API 6.1 原则：**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新。**
  * **关键规则:** WebSocket 断线重连后，必须立即重新调用 REST API 获取全量快照，以保证数据一致性。

##### 2\. 依赖过时状态 (Staleness)

实现“静默状态管理”（SRS 1.4）。

  * **检测与传播逻辑:**
    1.  **触发:** 前端监听到 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。
    2.  **同步:** 前端必须立即调用 `GET /workflows/{id}` 重新获取全量工作流状态，以更新所有节点的 `is_stale` 标志。
  * **视觉传达:**
      * **全局 (Navigator A):** 在 `is_stale: true` 的节点旁显示清晰的 ⚠️ 图标。Hover 显示 Tooltip 解释原因。
      * **局部 (Workspace B1):** 如果当前节点过时，显示醒目的、不可关闭的 `Staleness Banner`。

##### 3\. 工作流结构动态更新 (Dynamic Structure Updates)

处理 `Generator` 节点导致的结构变化。

  * **触发:** 监听到 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件。
  * **处理逻辑 (关键):** 前端状态管理器必须执行**全量替换**操作，使用事件负载数据覆盖本地缓存。
  * **视觉传达:**
      * **通知:** 显示短暂 Toast：“Workflow structure updated.”。
      * **平滑过渡:** Navigator (A) 重新渲染。使用 `Framer Motion` (Layout Animations) 实现新节点的平滑插入动画，帮助用户理解结构变化。

##### 4\. 执行取消 (Execution Cancellation)

处理异步取消过程。

  * **流程:**
    1.  用户点击 [Cancel]。按钮立即变为“Cancelling...”并禁用。
    2.  发送 API 请求 `POST /nodes/{id}/cancel`。
    3.  等待 WebSocket `NODE_STATUS_UPDATED` 事件（`status: Canceled`）。
    4.  收到确认后，UI 更新为最终 `Canceled` 状态，激活 [Retry] 按钮。



--- (1737-1743 lines) ---
##### B. 实现约定与最佳实践

1.  **主题与样式:** 严格遵守 Design Tokens。使用 CSS Variables 实现主题。默认深色模式。使用 `cn` 工具函数组合类名。
2.  **状态同步范式 (关键):** 严格遵循“REST API 为全量快照（Source of Truth），WebSocket 提供增量更新”的原则（参见 3.1.2.C.1）。实现健壮的断线重连和重连后的全量同步。
3.  **Staleness 处理逻辑:** 监听到 `NODE_ACTIVE_VERSION_CHANGED` 事件后，必须立即重新获取全量工作流状态以更新 `is_stale` 标志。
4.  **动态结构处理:** `WORKFLOW_STRUCTURE_UPDATED` 事件必须触发 Zustand Store 的全量替换。


</design_doc>

<api>
--- (19-38 lines) ---
### 核心机制：JWT Bearer Token

本系统采用 **JSON Web Tokens (JWT)** 作为身份验证机制。

#### 令牌生命周期 (Token Lifecycle)

1.  **获取 (Acquisition)**: 用户通过 `POST /auth/login` 成功登录后，获得一个 `access_token`。
    *   **令牌类型**: 系统内部使用不同类型的JWT来区分用途（如：访问令牌、邮件验证令牌）。`access_token` 是用于API访问的令牌。
    *   **有效期**: 根据系统配置 (`config.py`)，`access_token` 的有效期为 **7天**。其他类型的令牌（如邮件验证）有其独立的、通常更短的有效期。
2.  **使用 (Usage)**: 在令牌有效期内，前端向所有受保护的 API 端点发起请求时，必须在 HTTP `Authorization` 头中附加此令牌。
    *   **格式**: `Authorization: Bearer <your_access_token>`
3.  **存储 (Storage)**:
    *   **推荐方案 (最高安全性)**: 将令牌存储在 `HttpOnly`、`Secure`、`SameSite=Strict` 的 Cookie 中。这可以有效防止 XSS 攻击窃取令牌，但需要后端配合设置 Cookie。
    *   **备选方案**: 如果后端不便处理 Cookie，可将令牌存储在内存中（例如，JavaScript 变量或状态管理库如 Redux/Pinia）。页面刷新会导致令牌丢失，需要重新登录或从 `sessionStorage` 恢复。**不推荐**使用 `localStorage`，因为它容易受到 XSS 攻击。
4.  **失效与刷新 (Expiration & Refresh)**:
    *   当令牌过期后，API 将返回 `401 Unauthorized` 错误。
    *   **当前系统不包含令牌刷新 (Refresh Token) 机制**。这意味着一旦 `access_token` 过期，用户必须重新进行登录流程。
5.  **登出 (Logout)**:
    *   登出是一个纯粹的**客户端操作**。前端需要从存储中（无论是 Cookie、内存还是 `sessionStorage`）**丢弃/删除**该令牌，然后将用户重定向到登录页面。



--- (1585-1749 lines) ---
### 6_实时通信(Real-timeCommunication-WebSocket).md Content:

```md
## API 文档: 实时通信 (WebSocket)

本篇文档旨在为前端开发者提供一份清晰、健壮且具有高度实践指导意义的 WebSocket API 指南，用于实现工作流状态的实时、可靠更新。

### 1. 核心原则与最佳实践

在深入细节之前，请理解以下核心设计原则：

1.  **WebSocket 是状态的“增量更新器”，而非唯一来源**:
    *   **初始状态通过 REST 获取**: 页面或组件加载时，**必须**首先通过 `GET /workflows/{id}` 或 `GET /projects/{id}` API 获取工作流的**完整快照**作为基础状态。
    *   **WebSocket 负责后续更新**: 建立 WebSocket 连接后，收到的事件用于**更新**这个基础状态。

2.  **事件是幂等的，携带全量数据**:
    *   `NODE_STATUS_UPDATED` 事件中的 `data` 负载是该节点的**完整最新状态**，而非“变更部分”的 diff。这意味着前端可以直接用新数据**替换**旧的节点数据，无需复杂的合并逻辑，这极大地降低了出错的概率。

3.  **连接是短暂的，状态是持久的**:
    *   不要假设 WebSocket 连接会永远存在。客户端必须实现**断线重连**机制。
    *   **重连后必须同步状态**: 每次成功重连后，应**立即**重新调用 REST API 获取一次全量快照，以同步断连期间可能错过的所有更新。这是保证数据一致性的关键。

#### 1.1. 推荐的数据流模型

```text
                             +-----------------------------+
                             |       前端状态管理器         |  <-- (Vuex, Redux, etc.)
                             | (e.g., currentWorkflow)     |
                             +-----------------------------+
                                     ^          ^
                                     |          | (5. 事件驱动更新)
(4. 用响应数据“灌溉”/覆盖初始状态)    |          |
                                     |          |
+------------------------------------+          +--------------------------------------+
| (1. 页面加载)                      |          | (3. 建立连接)                           |
| 前端发起 REST 请求                 |          | 前端建立 WebSocket 连接                  |
| GET /workflows/{id}                |          | ws://.../ws/{id}?token=...           |
+------------------------------------+          +--------------------------------------+
       |        |                                           |        ^
       |        | (2. 响应)                                 |        | (持续)
       v        v                                           v        |
+------------------------------------------------------------------------------------+
|                                    后端服务器                                        |
+------------------------------------------------------------------------------------+
```

### 2. 连接端点

*   **URL**: `ws://<your_server_address>/ws/{workflow_id}?token=<your_jwt_token>`
*   **协议**: `ws` (本地开发) 或 `wss` (生产环境)

#### 2.1. 路径与查询参数
*   `workflow_id` (integer, **required**): 要订阅的工作流实例 ID。
*   `token` (string, **required**): 有效的 JWT Access Token。

### 3. 认证与生命周期

#### 3.1. Token 生命周期与连接持久性

*   **一次性验证**: Token 仅在**连接建立的瞬间**被验证。一旦连接成功，即使 Token 在几分钟后过期，已建立的连接**不会**被中断。
*   **前端主动刷新**: 为了处理需要长时间保持连接的场景（例如用户在一个页面停留超过 token 有效期），前端应实现以下策略：
    1.  在 JWT Token 即将过期前（例如，过期前1分钟），主动调用 REST API 刷新 Token。
    2.  获取新 Token 后，**主动关闭**当前的 WebSocket 连接。
    3.  使用**新 Token** 立即重新建立连接。

这种主动管理模式可以确保无缝的实时体验，避免因 token 过期导致的意外断连。

#### 3.2. 连接关闭代码

*   **`1000 Normal Closure`**: 正常关闭（例如，用户离开页面，前端主动关闭）。
*   **`4001` (Custom)**: **认证失败**。Token 无效、格式错误或已过期。**UI 应提示用户重新登录**。
*   **`4003` (Custom)**: **授权失败**。用户无权访问该 `workflow_id`。**UI 应显示权限错误，并可能需要导航回列表页**。

### 4. 消息格式 (`EventPayload`)

#### 4.1. EventPayload

所有从服务器推送到客户端的 WebSocket 消息都遵循此结构。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `event_type` | string (enum) | 事件的类型，决定了 `data` 负载的结构和前端应采取的行动。 |
| `workflow_id`| integer | 事件所属的工作流实例 ID。 |
| `node_id` | integer \| null | 如果是节点级事件，则为关联的节点 ID；否则为 `null`。 |
| `data` | object | 事件的负载。其具体结构取决于 `event_type`。 |

#### 4.2. 事件负载 (`data`) 结构

*   **当 `event_type` 为 `NODE_STATUS_UPDATED` 或 `NODE_ACTIVE_VERSION_CHANGED` 时**: **[标题更新]**
    *   `data` 的结构为 `NodeInstanceRead`。**[重要变化]** 此对象现在包含 `is_stale` 字段。详情请参见项目管理文档。
*   **当 `event_type` 为 `WORKFLOW_STRUCTURE_UPDATED` 或 `WORKFLOW_STATUS_UPDATED` 时**:
    *   `data` 的结构为 `WorkflowInstanceRead`。**[重要变化]** 其内部嵌套的每个节点对象 (`nodes` 数组中) 也都包含 `is_stale` 字段。

### 5. 事件详解

#### 5.1. `NODE_STATUS_UPDATED` (高频)

*   **描述**: 工作流中单个节点的状态发生变化。这是构建动态 UI 的核心事件。
*   **`data` 负载**: `NodeInstanceRead` 对象 (节点的**完整**最新数据，**包含 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **状态变更**: 根据 `status` (现在包括 `Canceled`) 和 `current_stage` 更新节点的视觉表现。
    *   **交互锁定**: 当 `status` 变为 `Executing` 时，应禁用该节点上的所有操作按钮（如"执行"、"批准"），并显示加载指示器。
    *   **交互解锁**: 当 `status` 变为 `Awaiting HITL Approval`, `Failed`, 或 `Canceled` 时，应解锁对应的 HITL 操作按钮（如"批准/拒绝"或"重试"）。
    *   **数据刷新**: 如果用户正在查看该节点的详细视图，应使用事件 `data` 中的信息刷新视图内容。

#### 5.2. `NODE_ACTIVE_VERSION_CHANGED` (中频，高影响)

*   **描述**: 某个节点的"活动版本"(`active_version`) 发生了变更。这通常由以下操作触发：
    1.  用户手动切换到某个历史版本 (`POST /nodes/{id}/versions/{id}/activate`)。
    2.  用户提交了一次手动编辑 (`POST /nodes/{id}/manual-edit`)，创建了一个新的活动版本。
    3.  一个探索性的重新执行 (`re-execute`) 完成并被批准，创建了一个新的活动版本。
*   **`data` 负载**: `NodeInstanceRead` 对象 (变更后节点的**完整**最新数据，包含了新的 `active_version_id`)。
*   **UI 影响与操作**:
    *   **核心目的**: 此事件是**下游节点过时状态发生变化的权威信号**。
    *   **推荐操作流**:
        1.  收到此事件后，更新状态管理器中对应 `node_id` 的数据。
        2.  **立即**调用 `GET /workflows/{workflow_id}` 重新获取整个工作流的最新状态。这会刷新所有节点的 `is_stale` 标志。
        3.  使用新的工作流数据重新渲染画布，此时下游节点的视觉状态（警告图标等）会正确更新。
    *   **为何重要**: 如果不处理此事件，当上游节点版本变化时，UI 将无法及时向用户反馈下游节点的数据已"过时"，可能导致用户基于陈旧数据做出决策。

#### 5.3. `WORKFLOW_STRUCTURE_UPDATED` (低频，高影响)

*   **描述**: 工作流的节点集合发生了根本性变化（增加/重排序），通常由 `Generator` 节点完成时触发。
*   **`data` 负载**: `WorkflowInstanceRead` 对象 (包含**全新且完整**的 `Phase -> Stage -> Node` 树，**每个节点都带有最新的 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **全量替换**: **必须**将前端状态管理器中的 `phases` 树完全替换为此事件 `data.phases`。**严禁**尝试进行 diff 或 patch 操作。
    *   **用户体验考量**: 这是一个颠覆性的更新。建议在 UI 上显示一个短暂的、非阻塞的通知（例如 Toast "工作流已更新"），以告知用户发生了结构性变化。如果用户的焦点（例如，正在编辑的表单）位于受影响的节点上，需要谨慎处理，避免丢失用户输入。
    *   **渲染优化**: 在 Vue/React 中，确保你的节点列表渲染使用了 `key` 属性（例如 `v-for` 或 `.map`），以帮助框架高效地重新渲染 DOM。

#### 5.4. `WORKFLOW_STATUS_UPDATED` (低频)

*   **描述**: 整个工作流的顶级状态发生变化，主要是当工作流完成时。
*   **`data` 负载**: `WorkflowInstanceRead` 对象 (**其内部节点也包含最新的 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **全局状态更新**: 更新页面标题栏或面包屑导航中的工作流状态。
    *   **功能解锁**: 当 `data.status` 变为 `Completed` 时，应**启用**"导出项目"等最终操作按钮。
    *   **庆祝/总结**: 可以触发一个祝贺动画或自动导航到项目总结页面。

### 6. 客户端实现策略与模式

#### 6.1. 状态同步与“灌溉”模式 (State Hydration)

这是保证数据一致性的核心模式：

1.  **加载 (Load)**: 组件挂载时，显示全局加载状态。
2.  **获取 (Fetch)**: 调用 `GET /workflows/{id}`。
3.  **灌溉 (Hydrate)**: 请求成功后，将完整的响应数据存入状态管理器。此时，隐藏全局加载状态，渲染页面。
4.  **连接 (Connect)**: 在“灌溉”完成后，建立 WebSocket 连接。
5.  **更新 (Update)**: 监听事件，并用事件数据更新状态管理器中的对应部分。

#### 6.2. 处理竞态条件 (Race Conditions)

一个典型的竞态场景：当 WS 重连后，你发起了 `GET /workflows/{id}`（请求 A），在它的响应返回**之前**，一个 WebSocket 事件（事件 B）先到达了。

**解决方案**:

*   **以 REST 为基准**: 在“灌溉”模式下，可以简单地规定：当 REST 请求（请求 A）的响应到达时，它的数据**总是**覆盖当前状态。即使事件 B 先更新了状态，也会被更完整的快照 A 覆盖，后续的 WebSocket 事件会从这个新基准开始更新。
*   **(可选) 时间戳/版本号**: 更复杂的系统可能会在事件和 REST 响应中加入时间戳或版本号，客户端可以依此丢弃过时的数据。但在此 API 设计下，遵循上述“以 REST 为基准”的原则已足够健壮。

#### 6.3. 错误处理与健壮性

*   **连接错误**: 监听 WebSocket 的 `onerror` 和 `onclose` 事件。
*   **UI 反馈**: 在无法连接或连接中断时，在 UI 顶部显示一个持久的、非阻塞的横幅（Banner），提示“实时更新已中断，正在尝试重连...”。
*   **指数退避重连**: 实现一个带有指数退避（Exponential Backoff）和抖动（Jitter）的自动重连逻辑，避免在服务器故障时发起大量无效请求。例如，尝试间隔为 1s, 2s, 4s, 8s... 直到上限。
```

</api>

<front_stack>
--- (22-24 lines) ---
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |


--- (30-31 lines) ---
| **自定义 SSE 客户端** | 项目在 `core/sse/fetch-stream.ts` 中实现了一个健壮的 `fetchStream` 函数。它使用 `fetch` API 和 `TextDecoderStream` 来处理流式响应，并能正确解析 Server-Sent Events (SSE) 协议，是实现聊天流式响应的核心底层工具。 |



--- (151-161 lines) ---
#### 2. 核心业务逻辑与状态管理模式

项目基于 Zustand 构建了清晰、高效的状态管理架构，核心代码位于 `core/store/`。

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **状态与设置分离** | `store.ts` 负责管理**会话相关的动态状态**（如消息、响应状态），而 `settings-store.ts` 负责管理**用户配置**。这种分离使得状态管理更加清晰，易于维护。 |
| **`sendMessage` 异步流程编排** | 这个核心函数是整个聊天功能的驱动器。它展示了：<br>1. **乐观更新**: 立即将用户消息追加到状态中。<br>2. **流式处理**: 调用 `chatStream` 并通过 `for await...of` 循环处理 SSE 事件。<br>3. **批量更新**: 使用 `setTimeout` 和 `Map` 对来自流的多个消息更新事件进行批处理，减少 React 的重渲染次数，提升性能。<br>4. **错误处理**: 使用 `try...finally` 确保无论成功与否，`responding` 状态都能被正确重置。 |
| **`mergeMessage` 纯函数** | 位于 `core/messages/merge-message.ts`，这是一个独立的、无副作用的函数，负责根据收到的 SSE 事件更新单个消息对象的状态。这种模式将状态变更的复杂逻辑从主流程中剥离，使其易于测试和维护，是 Reducer 模式的体现。 |
| **派生状态选择器 (Selectors)** | 项目定义了多个自定义 Hook (`useMessage`, `useRenderableMessageIds`, `useLastInterruptMessage`) 来从 store 中派生和选择数据。它们结合 `useShallow` 进行性能优化，封装了获取特定状态的逻辑，避免了组件内的重复计算。`useRenderableMessageIds` 尤其巧妙，它预先过滤出需要在 UI 中渲染的消息，从根源上解决了 React 列表渲染时的 `key` 值警告问题。 |
| **LocalStorage 持久化** | `settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数提供了一个简洁明了的模式，用于将 Zustand store 的状态与 `localStorage` 同步，实现了用户设置的持久化。 |


--- (167-167 lines) ---
| **模拟流式响应 (`chatReplayStream`)** | `core/api/chat.ts` 中的 `chatReplayStream` 函数是一个极具价值的工具。它能够读取静态文本文件，并**模拟**一个实时的 SSE 流，甚至可以控制快进。这对于开发、调试、演示和编写测试用例都非常有用。 |


--- (206-206 lines) ---
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |


--- (229-238 lines) ---
### 十viii、 鲁棒性与回退策略

项目在代码中体现了防御性编程的思想，确保在各种异常情况下应用依然能稳定运行。

| 策略/模式 | 描述与复用价值 |
| :--- | :--- |
| **API 请求重试与超时** | `core/api/hooks.ts` 中的 `useConfig` Hook 在 `fetch` 配置时，不仅设置了超时 (`AbortSignal.timeout`)，还实现了带有指数退避 (exponential backoff) 的重试逻辑。这显著提高了应用在网络不佳情况下的稳定性。 |
| **组件级错误回退** | `components/deer-flow/fav-icon.tsx` 组件的 `img` 标签上使用了 `onError` 事件处理器。当网站图标加载失败时，它会自动切换到一个通用的备用图标，避免了在 UI 上显示破碎的图片。 |
| **环境驱动的逻辑切换** | `env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY` 环境变量在多个地方被用作开关，以改变应用的行为。例如，`chatStream` 会根据此变量决定是调用真实的 API 还是模拟的 `chatReplayStream`。这使得同一套代码库可以轻松地部署为功能完整的动态应用或纯静态的演示网站。 |
| **容错数据解析** | `core/utils/json.ts` 中的 `parseJSON` 函数在解析失败时不会直接抛出错误，而是会返回一个预设的 `fallback` 值。这使得即使 LLM 返回的 JSON 格式稍有瑕疵，UI 也不会因此崩溃。 |


--- (249-249 lines) ---
| **状态更新批处理** | `core/store/store.ts` 中的 `sendMessage` 函数在处理 SSE 流时，并没有在每次收到 `chunk` 时都立即调用 `setState`，而是将待更新的消息放入一个 `pendingUpdates` Map 中，并通过 `setTimeout` 进行批处理。这种“去抖”或“批处理”的模式，将一秒内可能发生的数十次状态更新合并为少数几次，极大地减少了 React 的渲染次数，是流式应用性能优化的关键。 |


--- (259-259 lines) ---
| **强大的调试与演示工具** | `core/api/chat.ts` 中的 `chatReplayStream` 是一个强大的开发和演示工具。它允许开发者将一次真实的 API 交互录制为文本文件，然后在本地通过 URL 参数（`?replay=...`）完美复现整个流式交互过程。这对于调试复杂的后端逻辑、制作产品演示以及编写端到端测试都非常有价值。 |

</front_stack>

<deer_flow_frontend_code>
--- (36-90 lines) ---
### env.js Content:

```js
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_BASE_URL: z
      .string()
      .url()
      .optional()
      .default("http://localhost:8000/api/v1"),
    NEXT_PUBLIC_WS_URL: z.string().url().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  // Removed Deer-Flow specific variables (AMPLITUDE, GITHUB_OAUTH, STATIC_WEBSITE_ONLY, etc.)
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

```


--- (572-582 lines) ---
### core/utils/time.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

```


--- (2010-2107 lines) ---
### core/api/client.ts Content:

```ts
import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

import { useStore } from "~/core/store";

import { resolveServiceURL } from "./resolve-service-url";

/**
 * Global Axios instance configured for the O-Award API.
 * Implements Architecture 5.1.1 (Interceptors for Auth and Error Handling).
 */
const apiClient = axios.create({
  baseURL: resolveServiceURL(""),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// --- Request Interceptor: Inject Authorization Token ---
apiClient.interceptors.request.use(
  (config) => {
    // Skip token injection for auth endpoints (login, register, etc.)
    if (config.url?.startsWith("/auth/")) {
      return config;
    }

    // Access the token directly from the Zustand store state.
    const token = useStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    const rejection = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(rejection);
  },
);

// --- Response Interceptor: Global Error Handling ---
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response, config } = error;

    // 1. Handle 401 Unauthorized (Authentication Failure)
    if (response?.status === 401) {
      // Avoid triggering global logout if the failed request was the login attempt itself or email verification.
      if (!config?.url?.includes("/auth/login") && !config?.url?.includes("/auth/verify-email")) {
        // Only trigger logout if the store actually thinks we are authenticated
        if (useStore.getState().isAuthenticated) {
          console.warn("401 Unauthorized detected. Logging out.");
          // Trigger global logout action.
          useStore.getState().logout(true, "Session expired. Please log in again.");
        }
      }
      // Specific 401 failures are handled locally in services/components.
    }

    // 2. Handle 403 Forbidden
    else if (response?.status === 403) {
      // Specific 403 errors (like unverified account during login) are handled locally in AuthService.
      // This is a catch-all for other forbidden actions within the app.
      if (!config?.url?.includes("/auth/login")) {
        toast.error("Access Denied", {
          description: "You do not have permission to perform this action.",
        });
      }
    }

    // 3. Handle Server Errors (5xx)
    else if (response?.status && response.status >= 500) {
      toast.error("Server Error", {
        description: "An unexpected error occurred on the server. Please try again later.",
      });
    }

    // 4. Handle Network Errors
    else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      toast.error("Network Error", {
        description: "Could not connect to the server. Please check your internet connection and API configuration.",
      });
    }

    // Pass the error along for local handling (e.g., in service catch blocks)
    const rejection = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(rejection);
  },
);

export default apiClient;

```


--- (2252-2305 lines) ---
        ## store
         - index.ts

### core/store/index.ts Content:

```ts
import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

import { createAuthSlice, type AuthSlice } from "./slices/auth.slice";
import {
  createProjectSlice,
  type ProjectSlice,
} from "./slices/project.slice";
import { createSettingsSlice, type SettingsSlice } from "./slices/settings.slice";
import {
  createUIInteractionSlice,
  type UIInteractionSlice,
} from "./slices/ui-interaction.slice";
import {
  createWorkflowSlice,
  type WorkflowSlice,
} from "./slices/workflow.slice";

// Define the combined state interface (Architecture 4.1)
export type GlobalState = AuthSlice &
  SettingsSlice &
  ProjectSlice &
  WorkflowSlice &
  UIInteractionSlice;

// Define the type for the slice creator function, ensuring compatibility with devtools
// and allowing slices to access the full global state. (Architecture 4.2)
export type SliceCreator<T> = StateCreator<
  GlobalState,
  [["zustand/devtools", never]], // Middleware type
  [],
  T
>;

// Create the combined store using devtools middleware
export const useStore = create<GlobalState>()(
  devtools(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
      ...createSettingsSlice(set, get, api),
      ...createProjectSlice(set, get, api),
      ...createWorkflowSlice(set, get, api),
      ...createUIInteractionSlice(set, get, api),
    }),
    { name: "O-Award-Store" }, // Name for Redux DevTools
  ),
);



--- (2397-2838 lines) ---
### core/store/slices/workflow.slice.ts Content:

```ts
import { produce } from "immer";
import { toast } from "sonner";

import { NodeService } from "~/core/api/node.service";
import { WorkflowService } from "~/core/api/workflow.service";
import type {
  ExecutionRequest,
  HITLResponse,
  HITLSubmission,
  ManualEditSubmission,
  NodeDetailView,
} from "~/core/models/node.model";
import type {
  NodeInstanceRead,
  WorkflowInstanceRead,
} from "~/core/models/workflow.model";
import { type SliceCreator } from "~/core/store";

export interface WorkflowSlice {
  // --- State ---
  workflowInstance: WorkflowInstanceRead | null;
  // Normalized index for fast lookups (Architecture 4.3.4)
  nodesById: Map<number, NodeInstanceRead>;
  // Cache for node details
  nodeDetailsCache: Map<number, NodeDetailView>;

  isLoading: boolean; // Initial load
  isSyncing: boolean; // Background refresh/sync (e.g., after WS event or staleness update)
  isExecutingAction: boolean; // Covers re-execute, HITL submit, versioning actions

  // --- Actions ---

  // A. Synchronization & Initialization
  loadWorkflow: (workflowId: number) => Promise<WorkflowInstanceRead | null>;
  _normalizeAndSetData: (workflow: WorkflowInstanceRead) => void;
  clearWorkflowData: () => void;

  // B. WebSocket Event Handlers (Defined here, called by WebSocket manager)
  handleNodeStatusUpdated: (node: NodeInstanceRead) => void;
  handleNodeActiveVersionChanged: (
    node: NodeInstanceRead,
  ) => Promise<void>;
  handleWorkflowStructureUpdated: (workflow: WorkflowInstanceRead) => void;
  handleWorkflowStatusUpdated: (workflow: WorkflowInstanceRead) => void;

  // C. Node Detail Management
  fetchNodeDetails: (
    nodeId: number,
    force?: boolean,
  ) => Promise<NodeDetailView | null>;

  // D. Execution Control & HITL
  reExecuteNode: (
    nodeId: number,
    data?: ExecutionRequest,
  ) => Promise<boolean>;
  retryNode: (nodeId: number, data?: ExecutionRequest) => Promise<boolean>;
  cancelNode: (nodeId: number) => Promise<boolean>;
  submitHITL: (
    nodeId: number,
    data: HITLSubmission,
  ) => Promise<HITLResponse | null>;
  activateVersion: (nodeId: number, versionId: number) => Promise<boolean>;
  manualEdit: (
    nodeId: number,
    data: ManualEditSubmission,
  ) => Promise<boolean>;
}

export const createWorkflowSlice: SliceCreator<WorkflowSlice> = (set, get) => ({
  workflowInstance: null,
  nodesById: new Map(),
  nodeDetailsCache: new Map(),
  isLoading: false,
  isSyncing: false,
  isExecutingAction: false,

  // A. Synchronization & Initialization

  /**
   * Loads or synchronizes the workflow state. Handles both initial load and background syncs.
   * (Architecture 5.3.1, 5.3.2)
   */
  loadWorkflow: async (workflowId) => {
    const isInitialLoad =
      get().workflowInstance === null ||
      get().workflowInstance?.id !== workflowId;

    if (isInitialLoad) {
      // Reset state for a new workflow load
      set({
        isLoading: true,
        workflowInstance: null,
        nodesById: new Map(),
        nodeDetailsCache: new Map(),
      });
      // Clear associated UI state
      get().resetWorkflowUIState();
    } else {
      // Indicate background synchronization
      set({ isSyncing: true });
    }

    try {
      // Fetch the full snapshot (REST as Source of Truth)
      const workflow = await WorkflowService.getWorkflowById(workflowId);
      get()._normalizeAndSetData(workflow);
      return workflow;
    } catch (error) {
      console.error("Failed to load workflow:", error);
      toast.error("Failed to load or synchronize workflow data.");
      return null;
    } finally {
      set({ isLoading: false, isSyncing: false });
    }
  },

  /**
   * Normalizes the workflow data (builds the nodesById map) and updates the state.
   * (Architecture 4.3.4 Strategy 1)
   */
  _normalizeAndSetData: (workflow) => {
    const nodesById = new Map<number, NodeInstanceRead>();
    workflow.phases.forEach((phase) => {
      phase.stages.forEach((stage) => {
        stage.nodes.forEach((node) => {
          nodesById.set(node.id, node);
        });
      });
    });
    // Hydrate the store (Architecture 5.3.1 Step 3)
    set({ workflowInstance: workflow, nodesById });
  },

  clearWorkflowData: () => {
    set({
      workflowInstance: null,
      nodesById: new Map(),
      nodeDetailsCache: new Map(),
    });
    // Also clear associated UI interaction state
    get().resetWorkflowUIState();
  },

  // B. WebSocket Event Handlers

  /**
   * Handles incremental updates (API 6.5.1, Architecture 4.3.4 Strategy 2).
   * Uses Immer for efficient immutable updates of the nested structure.
   */
  handleNodeStatusUpdated: (updatedNode) => {
    // Use produce from immer for immutable updates
    set(
      produce((state: WorkflowSlice) => {
        if (!state.nodesById.has(updatedNode.id)) return;

        // 1. Update normalized map
        state.nodesById.set(updatedNode.id, updatedNode);

        // 2. Update nested structure immutably (required for React reactivity)
        if (state.workflowInstance) {
          // Locate the node in the tree structure
          const phase = state.workflowInstance.phases.find(
            (p) => p.name === updatedNode.phase_id,
          );
          if (phase) {
            const stage = phase.stages.find(
              (s) => s.id === updatedNode.stage_id,
            );
            if (stage) {
              const nodeIndex = stage.nodes.findIndex(
                (n) => n.id === updatedNode.id,
              );
              if (nodeIndex !== -1) {
                // Replace the node object (immer handles the immutability)
                stage.nodes[nodeIndex] = updatedNode;
              }
            }
          }
        }

        // 3. Update details cache if the node is currently cached
        const cachedDetails = state.nodeDetailsCache.get(updatedNode.id);
        if (cachedDetails) {
          // Optimistically merge the updated basic info (NodeInstanceRead fields) into the NodeDetailView
          state.nodeDetailsCache.set(updatedNode.id, {
            ...cachedDetails,
            ...updatedNode,
          });
        }
      }),
    );
  },

  /**
   * Handles version changes, triggering a full sync for staleness updates.
   * (API 6.5.2, Architecture 4.3.4 Strategy 4, Design Doc 3.1.2.C.2)
   */
  handleNodeActiveVersionChanged: async (updatedNode) => {
    // 1. Optimistically update the specific node first
    get().handleNodeStatusUpdated(updatedNode);

    // 2. Trigger full synchronization (Crucial for updating global is_stale flags)
    const workflowId = get().workflowInstance?.id;
    if (workflowId) {
      console.log(
        `NODE_ACTIVE_VERSION_CHANGED detected for node ${updatedNode.id}. Triggering full workflow sync.`,
      );
      // We trigger the loadWorkflow in sync mode (isInitialLoad=false)
      await get().loadWorkflow(workflowId);
    }
  },

  /**
   * Handles dynamic structure changes (API 6.5.3, Architecture 4.3.4 Strategy 3).
   */
  handleWorkflowStructureUpdated: (workflow) => {
    // Full replacement is mandatory (Design Doc 3.1.2.C.3).
    get()._normalizeAndSetData(workflow);
    toast.info("Workflow structure updated.");
  },

  handleWorkflowStatusUpdated: (workflow) => {
    // Update the workflow instance data.
    get()._normalizeAndSetData(workflow);
    if (workflow.status === "Completed") {
      toast.success("Workflow execution completed!");
    }
  },

  // C. Node Detail Management

  fetchNodeDetails: async (nodeId, force = false) => {
    if (!force && get().nodeDetailsCache.has(nodeId)) {
      return get().nodeDetailsCache.get(nodeId) || null;
    }

    try {
      const details = await NodeService.getNodeById(nodeId);
      set(
        produce((state: WorkflowSlice) => {
          state.nodeDetailsCache.set(nodeId, details);
        }),
      );
      return details;
    } catch (error) {
      console.error(`Failed to fetch details for node ${nodeId}:`, error);
      if (error instanceof Error && error.message === "NODE_BEYOND_FRONTIER") {
        // Design Doc N3.2
        toast.error("Access Denied", {
          description: "You cannot view nodes that have not yet been executed.",
        });
      } else {
        toast.error(`Failed to load details for node ${nodeId}.`);
      }
      return null;
    }
  },

  // D. Execution Control & HITL
  // These actions initiate changes via API and rely on WebSocket events for state updates.

  reExecuteNode: async (nodeId, data = {}) => {
    set({ isExecutingAction: true });
    try {
      await NodeService.reExecuteNode(nodeId, data);
      toast.success("Re-execution started.");
      // State will be updated via WebSocket (NODE_STATUS_UPDATED -> Executing)
      return true;
    } catch (error) {
      handleExecutionError(error, "Re-execute");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  retryNode: async (nodeId, data = {}) => {
    set({ isExecutingAction: true });
    try {
      await NodeService.retryNode(nodeId, data);
      toast.success("Retry started.");
      return true;
    } catch (error) {
      handleExecutionError(error, "Retry");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  cancelNode: async (nodeId) => {
    set({ isExecutingAction: true });
    try {
      await NodeService.cancelNode(nodeId);
      toast.success("Cancellation requested.");
      // State update (Canceled) via WebSocket
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === "NODE_NOT_EXECUTING") {
        toast.error("Cannot cancel", {
          description: "The node is not currently executing.",
        });
      } else {
        toast.error("Failed to cancel execution.");
      }
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  submitHITL: async (nodeId, data) => {
    set({ isExecutingAction: true });
    try {
      const response = await NodeService.submitHITL(nodeId, data);
      toast.success(response.message || "Decision submitted.");
      // State updates via WebSocket. Response guides UI navigation.
      return response;
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "NODE_NOT_AWAITING_APPROVAL":
            toast.error("Submission Failed", {
              description: "The node is not awaiting approval.",
            });
            break;
          case "INVALID_HITL_SUBMISSION":
            toast.error("Invalid Submission", {
              description: "The provided data was invalid. Please check your inputs.",
            });
            break;
          default:
            toast.error("Failed to submit decision.");
        }
      }
      return null;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  // Design Doc 2.3.2 Task Flow: Version Switching
  activateVersion: async (nodeId, versionId) => {
    set({ isExecutingAction: true });
    try {
      // API 5.4.2 returns the updated NodeInstanceRead
      const updatedNode = await NodeService.activateVersion(nodeId, versionId);
      toast.success(`Version activated.`);

      // We rely on the WebSocket handler (NODE_ACTIVE_VERSION_CHANGED) to trigger the necessary syncs for staleness.
      // We optimistically update the local node state immediately.
      get().handleNodeStatusUpdated(updatedNode);

      // Ensure the UI interaction state is updated if we were viewing a historical version
      if (get().viewingVersionId !== null) {
        get().viewLatestVersion();
      }

      return true;
    } catch (error) {
      handleInterventionError(error, "Activate Version");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },

  // Design Doc 2.3.3 Task Flow: Manual Editing
  manualEdit: async (nodeId, data) => {
    set({ isExecutingAction: true });
    try {
      // API 5.4.1 returns the updated NodeInstanceRead
      const updatedNode = await NodeService.manualEdit(nodeId, data);
      toast.success("Manual edit saved as new version.");

      // Rely on WebSocket (NODE_ACTIVE_VERSION_CHANGED) for global sync.
      // Optimistically update local state.
      get().handleNodeStatusUpdated(updatedNode);

      // Exit editing mode in UI interaction slice (Cross-slice communication)
      get().stopEditing();

      return true;
    } catch (error) {
      handleInterventionError(error, "Manual Edit");
      return false;
    } finally {
      set({ isExecutingAction: false });
    }
  },
});

// Helper function for centralized error toast notifications
const handleExecutionError = (error: unknown, actionName: string) => {
  if (error instanceof Error) {
    switch (error.message) {
      case "INVALID_STATE_FOR_EXECUTION":
        toast.error(`${actionName} Failed`, {
          description: "The node is not in a valid state for execution.",
        });
        break;
      case "ACTION_FORBIDDEN_ON_NODE_TYPE":
        toast.error(`${actionName} Forbidden`, {
          description:
            "This action is not allowed for this node type (e.g., Generator nodes).",
        });
        break;
      default:
        toast.error(`Failed to ${actionName.toLowerCase()} node.`);
    }
  } else {
    toast.error(`Failed to ${actionName.toLowerCase()} node.`);
  }
};

const handleInterventionError = (error: unknown, actionName: string) => {
  if (error instanceof Error) {
    switch (error.message) {
      case "INVALID_STATE_OR_VERSION_MISMATCH":
        toast.error(`${actionName} Failed`, {
          description:
            "Invalid state or version mismatch. Please refresh and try again.",
        });
        break;
      case "ACTION_FORBIDDEN_ON_NODE_TYPE":
        toast.error(`${actionName} Forbidden`, {
          description: "This action is not allowed for this node type.",
        });
        break;
      default:
        toast.error(`Failed to ${actionName.toLowerCase()}.`);
    }
  } else {
    toast.error(`Failed to ${actionName.toLowerCase()}.`);
  }
};

```


--- (2840-2963 lines) ---
### core/store/slices/ui-interaction.slice.ts Content:

```ts
import { type SliceCreator } from "~/core/store";

// Manages the UI state of the Workflow page, decoupled from the business data.
export interface UIInteractionSlice {
  // --- State ---

  // 1. Navigation & Selection
  activeNodeId: number | null;

  // 2. Workspace View State
  // If null, we are viewing the latest (active_version or pending_result).
  viewingVersionId: number | null;
  isEditing: boolean;

  // 3. Layout State (Collapsible elements)
  // IDs of phases that are collapsed in the navigator (A)
  collapsedPhases: Set<string>;
  // Keys of blocks (e.g., 'inputs', 'artifacts') that are expanded in the workspace (B2)
  expandedBlocks: Set<string>;

  // --- Actions ---
  selectNode: (nodeId: number) => void;
  viewHistoricalVersion: (versionId: number) => void;
  viewLatestVersion: () => void;
  startEditing: () => void;
  stopEditing: () => void;
  togglePhaseCollapse: (phaseId: string) => void;
  toggleBlockExpansion: (blockKey: string, isExpanded?: boolean) => void;
  resetWorkflowUIState: () => void;
}

// Define default expanded blocks (Design Doc 3.1.3.B, 2.4.B)
// Key blocks (Output, HITL Zone) default expanded; auxiliary (Inputs, Artifacts) default collapsed.
const DEFAULT_EXPANDED_BLOCKS = new Set(["output", "hitl_zone"]);

export const createUIInteractionSlice: SliceCreator<UIInteractionSlice> = (
  set,
  get,
) => ({
  activeNodeId: null,
  viewingVersionId: null,
  isEditing: false,
  collapsedPhases: new Set(),
  expandedBlocks: DEFAULT_EXPANDED_BLOCKS,

  selectNode: (nodeId) => {
    // When selecting a new node, reset the view state (view latest, not editing)
    // and reset expanded blocks to default for the new context. (Design Doc 2.4.B)
    set({
      activeNodeId: nodeId,
      viewingVersionId: null,
      isEditing: false,
      expandedBlocks: DEFAULT_EXPANDED_BLOCKS,
    });
  },

  viewHistoricalVersion: (versionId) => {
    // Cannot view history while editing
    if (get().isEditing) return;
    set({ viewingVersionId: versionId, isEditing: false });
  },

  viewLatestVersion: () => {
    // Allow switching back to latest even if editing (e.g., viewing base version during edit)
    set({ viewingVersionId: null });
  },

  startEditing: () => {
    // Must have an active node to start editing
    if (get().activeNodeId === null) return;
    // When starting editing, we must be viewing the latest version (the base for the edit) (Design Doc 3.1.1.D)
    set({ isEditing: true, viewingVersionId: null });
  },

  stopEditing: () => {
    set({ isEditing: false });
  },

  togglePhaseCollapse: (phaseId) => {
    set((state) => {
      // Use Set for efficient management of collapsed state (immutable update)
      const newCollapsedPhases = new Set(state.collapsedPhases);
      if (newCollapsedPhases.has(phaseId)) {
        newCollapsedPhases.delete(phaseId);
      } else {
        newCollapsedPhases.add(phaseId);
      }
      return { collapsedPhases: newCollapsedPhases };
    });
  },

  toggleBlockExpansion: (blockKey, isExpanded) => {
    set((state) => {
      const newExpandedBlocks = new Set(state.expandedBlocks);
      const currentlyExpanded = newExpandedBlocks.has(blockKey);

      // Determine the desired state (toggle if undefined, otherwise use provided value)
      const shouldExpand =
        isExpanded !== undefined ? isExpanded : !currentlyExpanded;

      if (shouldExpand) {
        newExpandedBlocks.add(blockKey);
      } else {
        newExpandedBlocks.delete(blockKey);
      }
      return { expandedBlocks: newExpandedBlocks };
    });
  },

  // Called when navigating away from the workflow page or clearing workflow data (cross-slice communication)
  resetWorkflowUIState: () => {
    set({
      activeNodeId: null,
      viewingVersionId: null,
      isEditing: false,
      collapsedPhases: new Set(),
      expandedBlocks: DEFAULT_EXPANDED_BLOCKS,
    });
  },
});



--- (3320-3413 lines) ---
### core/store/slices/auth.slice.ts Content:

```ts
import { toast } from "sonner";

import { UserService } from "~/core/api/user.service";
import type { UserRead } from "~/core/models/user.model";
import { type SliceCreator } from "~/core/store";

// Using localStorage as a common fallback if HttpOnly cookies are not used (API 1. Core Mechanism).
const TOKEN_STORAGE_KEY = "o-award-auth-token";

export interface AuthSlice {
  // State
  token: string | null;
  user: UserRead | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // True after the initial auth check is complete

  // Actions
  initializeAuth: () => Promise<void>;
  // Used by components after successful login/verification
  handleAuthenticationSuccess: (token: string, user: UserRead) => void;
  logout: (redirectToLogin?: boolean, message?: string) => void;
  updateUserProfile: (user: UserRead) => void;
}

export const createAuthSlice: SliceCreator<AuthSlice> = (set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  initializeAuth: async () => {
    // 1. Check for token in storage
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      set({ isInitialized: true, isAuthenticated: false, user: null });
      return;
    }

    // 2. Set the token tentatively so the API client interceptor can use it
    set({ token: storedToken });

    // 3. Validate the token by fetching the user profile
    try {
      const user = await UserService.getCurrentUser();
      set({ isAuthenticated: true, user, isInitialized: true });
    } catch (error) {
      console.error("Error during auth initialization (token validation failed):", error);
      // If validation fails (e.g., 401), the API interceptor might trigger logout.
      // We ensure the initialized flag is set regardless.
      // If the interceptor didn't clear the state, we do it here as a fallback.
      if (get().token === storedToken) {
        get().logout(false, "Session validation failed.");
      }
      set({ isInitialized: true });
    }
  },

  handleAuthenticationSuccess: (token, user) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    set({ token, user, isAuthenticated: true, isInitialized: true });
  },

  logout: (redirectToLogin = true, message) => {
    // Clear token and user state
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
    // Also clear settings state when logging out (as settings depend on auth)
    set({ settings: null });

    if (message) {
      toast.info(message);
    }

    // Redirect using window.location if needed, as router might not be accessible here (e.g., called from API interceptor)
    if (redirectToLogin && typeof window !== "undefined") {
      // Check if we are already on an auth page to avoid unnecessary redirects
      // We use startsWith('/auth') based on the routing structure.
      if (!window.location.pathname.startsWith("/auth")) {
        // Use window.location.href for a clean navigation upon logout
        window.location.href = "/auth/login";
      }
    }
  },

  updateUserProfile: (user) => {
    set({ user });
  },
});

```


--- (3474-3533 lines) ---
### app/(platform)/layout.tsx Content:

```tsx
"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { GlobalHeader } from "~/components/platform/layout/global-header";
import { useStore } from "~/core/store";

/**
 * Platform Layout with Authentication Route Guard.
 * Protects all routes within the (platform) group.
 */
export default function PlatformLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isInitialized: state.isInitialized,
    })),
  );

  useEffect(() => {
    // Wait until initialization (handled by AuthInitializer) is complete.
    if (!isInitialized) return;

    // If initialization is complete and the user is NOT authenticated, redirect to login.
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login.");
      // Use replace to prevent the user from navigating back to the protected route
      // Redirect to the new /auth/login path
      router.replace("/auth/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Show loading state if initializing or if we are unauthenticated (while redirecting)
  if (!isInitialized || !isAuthenticated) {
    // We show a loader here because AuthInitializer also shows a loader during the initial load.
    // This ensures a consistent loading experience until the auth state is confirmed and redirection (if any) occurs.
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render the platform layout if authenticated
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <GlobalHeader />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

```


--- (12014-12043 lines) ---
### components/providers/app-providers.tsx Content:

```tsx
"use client";

import * as React from "react";

import { ThemeProvider } from "~/components/theme-provider";
import { TooltipProvider } from "~/components/ui/tooltip";
import { AuthInitializer } from "./auth-initializer";

// Centralizes all global providers (Theme, UI, etc.)
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      // Design Doc 4.1.1: Dark Mode First
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {/* AuthInitializer handles loading the initial state (Auth and Settings) */}
      <AuthInitializer>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </AuthInitializer>
    </ThemeProvider>
  );
}

```


--- (12045-12104 lines) ---
### components/providers/auth-initializer.tsx Content:

```tsx
"use client";

import { Loader2 } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useStore } from "~/core/store";

/**
 * Responsible for initializing the application state on first load (Architecture 4.3.1).
 * 1. Initializes Authentication (checks for stored token and validates it).
 * 2. Fetches initial settings if authenticated.
 */
export function AuthInitializer({ children }: { children: ReactNode }) {
  const { initializeAuth, isInitialized, isAuthenticated, fetchSettings } = useStore(
    useShallow((state) => ({
      initializeAuth: state.initializeAuth,
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      fetchSettings: state.fetchSettings,
    })),
  );

  // Use a ref to ensure initialization logic runs exactly once on mount.
  const initializationStarted = useRef(false);

  // 1. Start Auth Initialization
  useEffect(() => {
    if (!initializationStarted.current) {
      initializationStarted.current = true;
      console.log("Starting Auth Initialization...");
      initializeAuth();
    }
  }, [initializeAuth]);

  // 2. Fetch Settings once Auth is initialized and user is confirmed authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      console.log("Auth Initialized and Authenticated. Fetching Settings...");
      // We don't await this, it runs in the background
      fetchSettings();
    }
  }, [isInitialized, isAuthenticated, fetchSettings]);

  // Show a global loading spinner while the initial authentication check is running.
  // Route guards in layouts rely on isInitialized being true.
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}



--- (12260-12322 lines) ---
### components/platform/layout/global-header.tsx Content:

```tsx
"use client";

import Link from "next/link";
import { PlusCircle, Workflow } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { ThemeToggle } from "~/components/platform/theme-toggle";
import { UserMenu } from "./user-menu";

export function GlobalHeader() {
  const pathname = usePathname();

  const navItems = [
    { name: "Projects", href: "/projects" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <div className="flex items-center gap-6">
        <Link href="/projects" className="flex items-center gap-2 text-lg font-semibold" aria-label="O-Award Home">
          <Workflow className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">O-Award</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button size="sm" asChild className="hidden sm:flex">
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>

        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

```

</deer_flow_frontend_code>

<architecture>
--- (11-17 lines) ---
前端架构的核心目标是支撑一个高性能、高可靠性、高可维护性的复杂单页应用 (SPA)，重点满足以下需求：

1.  **复杂状态同步与实时性**: 精确管理工作流结构、节点状态、版本信息和实时执行进度，确保数据一致性。
2.  **高信息密度与清晰度**: 实现灵活的三栏式“驾驶舱”布局，清晰展示大量复杂信息（代码、日志、公式）。
3.  **精细化控制与复杂交互**: 支持多种人机协同 (HITL) 模式和精细的用户干预（版本切换、人工编辑）。
4.  **动态性与流畅性**: 平滑处理工作流结构的动态变化，提供即时的交互反馈和高性能的动效。



--- (21-22 lines) ---
2.  **明确的数据同步范式**: 严格遵守 API 6.1 原则——**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新**。在连接恢复和关键事件后执行全量同步。
3.  **关注点分离**: 采用分层架构（UI 层、状态管理层、API 服务层），实现业务逻辑与 UI 的解耦。


--- (64-64 lines) ---
  * **WebSocket API (或 socket.io-client)**: 用于实时通信。


--- (176-178 lines) ---
├── /websocket/         # WebSocket 管理
│   ├── manager.ts      # 连接管理 (重连、认证)
│   └── dispatcher.ts   # 事件分发到 Zustand


--- (214-218 lines) ---
#### 4.3.1 AuthSlice (`authSlice.ts`)

  * **State**: `token`, `userProfile`, `isAuthenticated`, `isInitialized`.
  * **Actions**: `login`, `logout`, `initialize` (从存储加载 Token 并验证)。
  * **Persistence**: Token 存储管理。


--- (256-259 lines) ---
    // B. WebSocket 事件处理
    handleNodeStatusUpdated: (node: NodeInstanceRead) => void;
    handleNodeActiveVersionChanged: (node: NodeInstanceRead) => void;
    handleWorkflowStructureUpdated: (workflow: WorkflowInstanceRead) => void;


--- (282-284 lines) ---
4.  **Staleness 同步 (`handleNodeActiveVersionChanged`)**:
      * **[关键]** 此 Action 必须触发 `loadWorkflow()`，重新获取全量数据以更新所有节点的 `is_stale` 标志（遵循 API 6.5.2）。



--- (313-370 lines) ---
## 5\. 通信层与同步策略 (Communication Layer and Synchronization Strategy)

实现健壮的 REST API 调用和 WebSocket 实时同步。

### 5.1 REST API 客户端 (REST API Client)

#### 5.1.1 Axios 实例配置 (`src/core/api/client.ts`)

配置 Axios 实例，实现全局的认证和错误处理。

1.  **Base URL**: 从环境变量配置。
2.  **请求拦截器**: 自动注入 `Authorization: Bearer <token>`（从 `AuthStore` 获取）。
3.  **响应拦截器**:
      * 全局处理 `401 Unauthorized`（触发登出和重定向）。
      * 处理通用错误码（`403`, `500`），显示全局 Toast。

#### 5.1.2 服务层抽象 (Service Layer)

将 API 调用封装在类型安全的服务中（`src/core/api/*.service.ts`），供 Zustand Store 调用。

### 5.2 WebSocket 实时通信 (WebSocket Service)

实现 `src/core/websocket/manager.ts`，负责连接生命周期管理。

#### 5.2.1 连接管理

1.  **连接时机**: 当用户进入工作流页面时建立连接。
2.  **认证**: 通过 URL 参数传递 Token (`ws://.../ws/{workflow_id}?token=...`)（API 6.2.1）。
3.  **健壮性**: 实现心跳检测和指数退避的自动重连机制。
4.  **Token 刷新**: 监听 `AuthStore` 的 Token 变化，如果 Token 更新，主动断开并使用新 Token 重连（API 6.3.1）。

#### 5.2.2 事件分发

`WebSocketManager` 监听 `onmessage` 事件，解析 `EventPayload`，并调用 `WorkflowSlice` 中对应的事件处理器 Action。

### 5.3 核心同步范式 (Core Synchronization Paradigm)

严格执行 API 6.1 定义的范式：**REST 为主，WS 为辅**。

#### 5.3.1 初始化流程 (Initialization)

1.  UI 加载。
2.  **Fetch Snapshot (REST)**: `GET /workflows/{id}`。
3.  **Hydrate Store**: 使用快照初始化 Zustand。
4.  **Connect (WS)**: 建立 WebSocket 连接。

#### 5.3.2 重连后同步 (Reconnection Synchronization) - 关键

1.  WebSocket 重连成功 (`onOpen`)。
2.  **立即触发全量同步**: 调用 `WorkflowSlice.loadWorkflow()` (REST)。
3.  **状态覆盖**: 使用新的快照覆盖 Store 状态，确保一致性。

#### 5.3.3 处理复杂事件 (Handling Complex Events)

1.  **`NODE_STATUS_UPDATED` (增量更新)**: 直接更新 `WorkflowSlice.nodesById`。
2.  **`NODE_ACTIVE_VERSION_CHANGED` (Staleness 更新)**: 必须触发全量同步 (`loadWorkflow`) 以刷新全局 `is_stale` 标志。
3.  **`WORKFLOW_STRUCTURE_UPDATED` (结构更新)**: 必须使用事件负载进行全量替换 `WorkflowSlice.workflowInstance`。



--- (541-543 lines) ---
  * **Token 管理**: 安全存储 Token（优先 `HttpOnly` Cookie，其次 `localStorage`）。
  * **注入**: API Client 拦截器自动注入 Token。WebSocket 连接时传递 Token。
  * **路由守卫**: 使用 Next.js Middleware 保护主应用路由。


--- (549-549 lines) ---
  * **WebSocket 错误**: 实现连接状态反馈（横幅）和重连逻辑。


--- (564-565 lines) ---
5.  **状态更新批处理**: 在处理高频 WebSocket 事件时，考虑使用批处理技术（如 `setTimeout` 或 React 18 的 `startTransition`）合并状态更新，减少渲染次数。


</architecture>



---

<task>


### 任务 8：WebSocket 基础设施搭建与连接管理

**目标：** 建立健壮的 WebSocket 通信层，实现连接管理、认证和自动重连机制，为实时同步提供基础。

**核心关注点：** 连接生命周期、Token 认证与刷新、健壮性（指数退避重连）、错误处理。

**实现策略（参考 `<architecture> 5.2`, `<api> 6`）：**

1.  **WebSocket Manager 实现（`src/core/websocket/manager.ts` 新建）：**
    *   创建 `WebSocketManager` 服务（可实现为单例或通过 React Context 提供）。实现 `connect(workflowId)` 和 `disconnect()` 方法。
2.  **认证集成：**
    *   从 `AuthSlice` 获取 Token，并通过 URL 参数传递（`ws://.../ws/{workflow_id}?token=...`）（`<api> 6.2.1`）。
3.  **生命周期管理与错误处理：**
    *   监听 `onopen`, `onmessage`, `onerror`, `onclose`。
    *   正确处理认证失败（4001）和授权失败（4003）的关闭代码（`<api> 6.3.2`），触发登出或显示错误。
4.  **健壮性实现（关键实现）：**
    *   在 `onclose` 中实现指数退避（Exponential Backoff）和抖动（Jitter）的自动重连逻辑（`<api> 6.6.3`）。
    *   实现心跳检测（如果需要）。
5.  **Token 刷新策略：**
    *   监听 `AuthSlice` 的 Token 变化，如果 Token 更新，主动断开并使用新 Token 重连（`<api> 6.3.1`）。
6.  **连接状态反馈：**
    *   在 Zustand 中添加 `ConnectionStatusSlice`（或在 `UIInteractionSlice` 中添加），管理连接状态。在全局 UI 中显示连接状态（例如，连接中断时显示全局 Banner）。

**输入：** 任务 4 的输出（AuthSlice）, `<api> 6`, `<architecture> 5.2`。
**输出：** 健壮、可自动重连的 WebSocket 连接管理服务。


</task>


---

你的任务是完成 <task> 中的开发任务，要求：

1. 在开发前务必深入理解 需求背景和项目代码，确保全面把握任务目标与上下文；
2. 尽可能复用及参考现有的组件、框架、库（UI样式、动画等），以提高开发效率和降低出错的概率，这是最重要的原则；
3. 如果现有的技术栈不满足需求，引入其他合适的组件、框架、库，进一步提高开发效率和降低出错的概率；
4. 使用成熟的组件、框架、库、UI样式、动画等；
5. 避免过度设计，过度封装，过度抽象，追求实用性和可维护性；
6. 在确保实现成熟可靠的基础上，**进一步提升UI美观性和优化用户交互体验**；
7. 务必先深入思考，反复推敲，反复权衡，反复反思，然后进行架构设计；
8. 架构设计确定后再进行完整的细节代码实现，确保实现代码的完整性和正确性；
9. 保证与其他任务的逻辑连贯、衔接紧密；
10. 必须确保完成该任务范围内的所有功能点，无遗漏，不涉及其他任务；
11. 必须包含对现有代码必要的修改（如果需要）以及完整新增代码的实现，使用英文注释。

**高标准完成本任务，严格对齐要求，不要遗漏任何功能点，代码简洁健壮无误。深入分析项目架构及依赖，预判风险并持续优化，仅在方案完善后开始开发，确保每一行代码皆有充分理解与把控。对实现的代码进行充分的检查、测试、验证，确保没有bug。**
