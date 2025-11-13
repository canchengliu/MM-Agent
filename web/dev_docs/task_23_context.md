<design_doc>
--- (107-107 lines) ---
| W3.2 | Generator Node 执行限制 | Generator 节点不允许重新运行，以保证流程一致性。 | SRS 2.3 | P0 |


--- (134-137 lines) ---
| V3.1 | 版本切换与激活 | 用户手动切换任意节点的“激活”版本。 | SRS 3.3, FRS 5.5.2 | P0 |
| V3.2 | 静默状态管理（非级联） | 版本切换仅影响当前节点，不自动触发下游更新。 | SRS 1.4, 3.3 | P0 |
| V4.1 | 过时状态 (Staleness) 检测 | 系统检测并标记输入依赖已过时的节点（`is_stale`）。 | SRS 1.4, FRS 5.2 | P1 |



--- (424-433 lines) ---
##### C. 右侧栏：版本历史面板 (Version History Panel - The Memory)

  * **目标:** 管理当前选中节点的历史版本，支持快速审阅、对比和回溯。
  * **可见性规则:** 仅当 Center Workspace 处于 `Completed` (Review Mode) 状态时显示。在 `Executing` 或 `Awaiting HITL Approval` 时自动隐藏。
  * **结构:** 垂直的“版本卡片列表 (Version Card List)”，按时间倒序排列。
  * **卡片信息:** 版本号 (V1, V2...), **[Active Tag]**, 时间戳, 来源图标 (🤖/✏️), 版本摘要。
  * **交互逻辑:**
      * **Review:** 点击卡片在 Center Workspace 加载该版本的详情。
      * **Activate:** 在非激活版本上提供 [Set as Active Version] 按钮。点击后触发全局 Staleness 刷新。



--- (467-499 lines) ---
#### 2.3.2 任务流 2：版本回溯、切换与下游重执行 (Task Flow: Version Switching and Downstream Re-execution)

**场景:** 用户回退到上游 Node A 的历史版本 V1（当前 V2 激活），并希望更新下游 Node B。

**流程:**

1.  **用户导航与审阅:**
      * 用户在 Left Navigator (A) 点击 Node A。
      * Center Workspace (B) 加载 V2（Review Mode）。Right Sidebar (C) 显示。
2.  **用户审查历史版本:**
      * 用户在 Right Sidebar (C) 点击 V1 卡片。Center Workspace (B) 加载 V1 详情。
3.  **用户执行版本切换:**
      * 用户在 V1 卡片上点击 [Set as Active Version]。
      * **系统响应 (API):** `POST /nodes/A/versions/V1/activate`。
      * **系统处理 (后端):** 更新 Node A 的 `active_version_id` 为 V1。
4.  **系统状态传播 (关键步骤 - Staleness Update):**
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node A)。
      * **前端响应 (关键):** 前端监听到此事件，立即调用 `GET /workflows/{id}` 重新获取全量工作流状态。
      * 新的状态中，Node B 的 `is_stale` 标志为 `true`。
5.  **UI 更新与过时感知:**
      * Right Sidebar (C): V1 标记为 Active。
      * Left Navigator (A) 刷新：Node B 旁边出现 ⚠️ Staleness Indicator。
      * *(遵循 SRS 1.4 静默状态管理，系统不自动执行)*。
6.  **用户处理下游依赖:**
      * 用户点击 Node B。
      * Center Workspace (B) 加载 Node B。Workspace Header (B1) 显示醒目的 `Staleness Banner`：“⚠️ Inputs have changed. Node A has a new active version (V1).”
7.  **用户触发下游重执行:**
      * 用户点击 Contextual Toolbar (B1) 的 [Re-execute]。
      * **系统响应 (API):** `POST /nodes/B/re-execute`。
      * **系统处理 (后端):** 后端拉取 Node A 的当前激活版本 (V1) 作为输入（SRS 3.4），启动 Node B 执行。
      * **系统响应 (WebSocket):** WebSocket 推送 `NODE_STATUS_UPDATED` (B-\>Executing)。
8.  **UI 更新:** Node B 进入执行状态，⚠️ 图标消失。



--- (590-596 lines) ---
2.  **版本切换 (Version Switching):**

      * **流程：** 用户点击非活动版本上的 [Set as Active Version] 按钮。
      * **确认对话框（关键）：** 弹出确认模态框（Shadcn `AlertDialog`），明确告知用户后果：“Activating this version will change the node's output. Downstream nodes will NOT be automatically updated; they will be marked as 'Stale'. Proceed?”（遵循 SRS 1.4, 3.3）。
      * **响应：** 用户确认后执行 API 调用。UI 更新 `Active` 标签，并等待 WebSocket 事件触发全局 Staleness 更新。
      * **限制：** `Generator` 节点的版本切换按钮必须禁用（遵循 SRS 2.3）。



--- (653-663 lines) ---
##### 2\. 依赖过时状态 (Staleness)

实现“静默状态管理”（SRS 1.4）。

  * **检测与传播逻辑:**
    1.  **触发:** 前端监听到 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。
    2.  **同步:** 前端必须立即调用 `GET /workflows/{id}` 重新获取全量工作流状态，以更新所有节点的 `is_stale` 标志。
  * **视觉传达:**
      * **全局 (Navigator A):** 在 `is_stale: true` 的节点旁显示清晰的 ⚠️ 图标。Hover 显示 Tooltip 解释原因。
      * **局部 (Workspace B1):** 如果当前节点过时，显示醒目的、不可关闭的 `Staleness Banner`。



--- (806-827 lines) ---
#### C. 版本历史面板 (Version History Panel - Right Sidebar)

**结构:**

```
[C. Version History] (Scrollable, Resizable Panel, Conditional Visibility)
|
+-- [Header]: Version History [Collapse Button >>]
|
+-- [Version Card List] (Reverse Chronological)
    |
    +-- [Version Card V2] (Active State)
    |   |-- [V2] [Timestamp] [Source Icon: 🤖]
    |   |-- **[ACTIVE Tag]** (Prominent visual indicator)
    |   |-- [Summary: "Refined based on feedback..."]
    |
    +-- [Version Card V1] (Inactive State)
        |-- [V1] [Timestamp] [Source Icon: ✏️]
        |-- [Summary: "Manually corrected assumptions."]
        |-- [Button: Set as Active Version] (Requires Confirmation Dialog)
```



--- (878-884 lines) ---
##### 4\. 确认对话框 (Confirmations)

  * **版本切换确认:**
      * **Title:** Activate Version V1?
      * **Body:** "Activating this version will change the node's output. Downstream nodes will be marked as 'Stale' and will NOT be automatically updated. Do you wish to proceed?"
      * **Actions:** [Cancel], [Activate V1]



--- (1558-1576 lines) ---
#### 5.1.4 C. 版本历史面板 (Version History Panel - Right Sidebar)

**可见性逻辑:** 仅当 Workspace (B) 处于 `Completed` (Review Mode) 时显示。

**C1. 结构与头部:**

  * 背景 `bg-card`。Header 同 Navigator (A)。

**C2. 版本卡片 (Version Card):**

  * 使用紧凑型 `Card`。`p-3 rounded-md`。
  * 内容：[V\#], [Timestamp], [Source Icon 🤖/✏️], [Summary]。
  * **Active State:**
      * 边框 `border-primary`。
      * 显示 **[ACTIVE]** `Badge` (`variant="default"`)。
  * **Inactive State:**
      * 显示 [Set as Active Version] 按钮。
      * 点击必须触发 `AlertDialog` 确认，文案遵循 3.3.D.4（强调非级联更新和 Staleness 后果）。



--- (1683-1712 lines) ---
#### 5.2.4 场景 4：版本切换与 Staleness 传播反馈 (Version Switching & Staleness Feedback)

**目标:** 清晰传达版本变更及其对下游的影响。

1.  **版本激活反馈 (C):**

      * API 成功后，`[ACTIVE]` Badge 平滑过渡到新版本卡片。使用 Framer Motion `layoutId` 实现 Badge 的移动动画。

2.  **Staleness 传播反馈 (A):**

      * **触发:** 工作流状态刷新后（检测到 `is_stale: true`）。
      * **效果:** ⚠️ Staleness Indicator 出现时，使用一个微妙的动画吸引注意。
      * **实现:** 使用 Framer Motion 实现快速的“脉冲 (Pulse)”效果。

<!-- end list -->

```tsx
// Implementation Guidance (Staleness Indicator)
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{
    type: "spring",
    stiffness: 500,
    damping: 20,
  }}
>
  <AlertTriangle className="text-status-awaiting" />
</motion.div>
```


--- (1741-1741 lines) ---
3.  **Staleness 处理逻辑:** 监听到 `NODE_ACTIVE_VERSION_CHANGED` 事件后，必须立即重新获取全量工作流状态以更新 `is_stale` 标志。

</design_doc>

<api>
--- (846-866 lines) ---
#### 5.4. NodeInstanceRead

表示工作流中单个节点的当前状态和基本信息。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 节点实例的唯一标识符。 |
| `definition_id` | string | 节点在工作流定义中的静态 ID (例如, "1.1.1")。 |
| `name` | string | 节点的显示名称。 |
| `status` | string (enum) | 节点的当前执行状态。可选值: `"Not Started"`, `"Executing"`, `"Awaiting HITL Approval"`, `"Completed"`, `"Failed"`, `"Canceled"`。**[新增]** `Canceled` 状态表示执行被用户取消。 |
| `current_stage` | string (enum) | 节点更详细的执行阶段。可选值: `"Not Started"`, `"Initializing"`, `"Processing"`, `"Generating Outputs"`, `"Awaiting Review"`, `"Completed"`, `"Failed"`。 |
| `node_type` | string (enum) | 节点的类型。可选值: `"Standard"`, `"Generator"`。 |
| `hitl_mode` | string (enum) | 节点的人机交互模式。可选值: `"VARL"`, `"SCA"`, `"AVL"`。 |
| `order_index` | integer | 节点在工作流中的顺序索引 (从 0 开始)。 |
| `active_version_id` | integer \| null | 当前活动的版本 ID。若节点未完成，则为 `null`。 |
| `phase_id` | string | 节点所属的阶段名称 (例如, "Phase 1: ...")。 |
| `stage_id` | string | 节点所属 Stage 的唯一 ID (例如, "1.1" 或 "Task_A1.2.1")。 |
| `stage_name` | string | Stage 的显示名称 (例如, "Strategic Definition")。 |
| `task_group_id` | string \| null | 如果节点是动态生成的，则为所属的任务组 ID。 |
| `is_stale` | boolean | **[新增]** 指示该节点的输入依赖相对于其上游节点的最新活动版本是否已过时。`true` 表示过时，前端应提供视觉提示（如警告图标），建议用户重新执行。 |



--- (1079-1079 lines) ---
> *   **[新增]** 在渲染节点时，检查 `node.is_stale` 标志。如果为 `true`，应在节点上显示一个明确的视觉指示器（如警告图标或虚线边框）。


--- (1208-1210 lines) ---
*   **执行前沿 (Execution Frontier)**: 指工作流中已执行或正在执行的最后一个节点的序号。为保证流程的顺序性，用户不能“跳级”操作前沿之外的节点。
*   **过时状态 (Staleness)**: 当一个节点的上游依赖节点更新了其 `active_version` 后，该节点就处于“过时”状态。这是 **UI 提示** 的关键数据，应在界面上明确标记该节点，并建议用户“重新执行以同步最新上游数据”。



--- (1243-1245 lines) ---
    *   **关键逻辑 (R5.2)**: 如果请求的节点处于 `NOT_STARTED` 状态，后端会校验其是否超前于工作流的“执行前沿”。若超前，将返回 `403 Forbidden`。
    *   **过时检查**: 响应中包含 `staleness_report` 字段，前端应检查此字段，若非空，则在 UI 上明确提示用户此节点的输入依赖已更新。



--- (1284-1294 lines) ---
##### `staleness_report` 示例 (如果存在):
```json
"staleness_report": [
  {
    "upstream_node_id": 100, // 上游节点的ID
    "upstream_definition_id": "1.1.1", // 上游节点的定义ID
    "consumed_version_id": 1, // 当前节点上次执行时所使用的上游版本号
    "current_active_version_id": 2 // 上游节点当前最新的活动版本号
  }
]
```


--- (1301-1331 lines) ---
#### 1.2. 获取节点的所有版本

*   **Endpoint**: `GET /nodes/{node_id}/versions`
*   **权限**: 节点所有者。
*   **描述**: 按版本号降序返回指定节点的所有历史版本列表，用于版本回溯和比较。

##### 成功响应 (`200 OK`)
返回 `NodeVersionRead` 对象数组。
```json
[
  {
    "id": 2,
    "version_number": 2,
    "node_instance_id": 100,
    "summary": "Refined based on feedback...",
    "source": "MANUALLY_EDITED", // 版本来源：AI生成 或 手动编辑
    "based_on_version_id": 1,
    "...": "..."
  },
  {
    "id": 1,
    "version_number": 1,
    "node_instance_id": 100,
    "summary": "Initial version approved.",
    "source": "AI_GENERATED",
    "based_on_version_id": null,
    "...": "..."
  }
]
```



--- (1499-1499 lines) ---
*   `403 Forbidden`: 试图编辑一个已完成的 `Generator` 节点。


--- (1501-1521 lines) ---
#### 4.2. 激活指定版本

将指定的历史版本设置为当前节点的“官方”活动版本。

*   **Endpoint**: `POST /nodes/{node_id}/versions/{version_id}/activate`
*   **权限**: 节点所有者。
*   **重要影响**:
    *   此操作仅改变节点的 `active_version`，但**不会**自动重新执行任何下游节点。用户需自行决定是否基于此旧版本的结果去手动重新执行下游节点。
    *   **[新增]** 操作成功后，会广播一个 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。前端应监听此事件，并重新获取工作流的过时信息 (`is_stale` 标志) 以更新UI。

##### 路径参数
*   `node_id` (integer, **required**)
*   `version_id` (integer, **required**)

##### 成功响应 (`200 OK`)
返回更新后的 `NodeInstanceRead` 对象，其 `active_version_id` 已变为指定的 `version_id`。

##### 错误响应
*   `403 Forbidden`: 试图在 `Generator` 节点上切换版本。
*   `409 Conflict` (`INVALID_STATE`): 指定的 `version_id` 不属于该节点。



--- (1549-1549 lines) ---
| `staleness_report` | array (StalenessInfo) \| null | 如果节点的上游依赖已更新，此列表将包含详细的过时信息。 |


--- (1604-1606 lines) ---
    *   不要假设 WebSocket 连接会永远存在。客户端必须实现**断线重连**机制。
    *   **重连后必须同步状态**: 每次成功重连后，应**立即**重新调用 REST API 获取一次全量快照，以同步断连期间可能错过的所有更新。这是保证数据一致性的关键。



--- (1673-1674 lines) ---
*   **当 `event_type` 为 `NODE_STATUS_UPDATED` 或 `NODE_ACTIVE_VERSION_CHANGED` 时**: **[标题更新]**
    *   `data` 的结构为 `NodeInstanceRead`。**[重要变化]** 此对象现在包含 `is_stale` 字段。详情请参见项目管理文档。


--- (1690-1704 lines) ---
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


</api>

<front_stack>
--- (18-25 lines) ---
### 二、 状态管理

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |



--- (45-52 lines) ---
### 五、 UI 组件库与视觉效果

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |
| **Sonner** | 用于显示轻量级的 Toast 通知（消息提示）。 |


--- (151-162 lines) ---
#### 2. 核心业务逻辑与状态管理模式

项目基于 Zustand 构建了清晰、高效的状态管理架构，核心代码位于 `core/store/`。

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **状态与设置分离** | `store.ts` 负责管理**会话相关的动态状态**（如消息、响应状态），而 `settings-store.ts` 负责管理**用户配置**。这种分离使得状态管理更加清晰，易于维护。 |
| **`sendMessage` 异步流程编排** | 这个核心函数是整个聊天功能的驱动器。它展示了：<br>1. **乐观更新**: 立即将用户消息追加到状态中。<br>2. **流式处理**: 调用 `chatStream` 并通过 `for await...of` 循环处理 SSE 事件。<br>3. **批量更新**: 使用 `setTimeout` 和 `Map` 对来自流的多个消息更新事件进行批处理，减少 React 的重渲染次数，提升性能。<br>4. **错误处理**: 使用 `try...finally` 确保无论成功与否，`responding` 状态都能被正确重置。 |
| **`mergeMessage` 纯函数** | 位于 `core/messages/merge-message.ts`，这是一个独立的、无副作用的函数，负责根据收到的 SSE 事件更新单个消息对象的状态。这种模式将状态变更的复杂逻辑从主流程中剥离，使其易于测试和维护，是 Reducer 模式的体现。 |
| **派生状态选择器 (Selectors)** | 项目定义了多个自定义 Hook (`useMessage`, `useRenderableMessageIds`, `useLastInterruptMessage`) 来从 store 中派生和选择数据。它们结合 `useShallow` 进行性能优化，封装了获取特定状态的逻辑，避免了组件内的重复计算。`useRenderableMessageIds` 尤其巧妙，它预先过滤出需要在 UI 中渲染的消息，从根源上解决了 React 列表渲染时的 `key` 值警告问题。 |
| **LocalStorage 持久化** | `settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数提供了一个简洁明了的模式，用于将 Zustand store 的状态与 `localStorage` 同步，实现了用户设置的持久化。 |



--- (187-197 lines) ---
### 十四、 高级动画与视觉效果模式

项目巧妙地结合了多种动画技术，以创造流畅且引人入胜的用户体验。这些模式具有高度的可移植性。

| 模式/技术 | 描述与复用价值 |
| :--- | :--- |
| **`Framer Motion` 列表与状态动画** | **列表交错动画**: 在 `conversation-starter.tsx` 和 `message-list-view.tsx` 中，通过在 `motion.li` 的 `transition` prop 中设置 `delay: index * 0.1`，实现了新项目依次入场的精美效果。这是一个可直接应用于任何动态列表的模式。<br>**条件渲染动画**: `input-box.tsx` 使用 `<AnimatePresence>` 组件来包裹根据条件渲染的元素（如用户反馈提示）。这使得元素的出现和消失都带有平滑的动画效果，而不是生硬地切换。 |
| **`Magic UI` 特效组件的集成** | 项目将 `Magic UI` 组件作为独立的、可配置的视觉增强层。例如，`input-box.tsx` 在 "Enhance Prompt" 功能激活时，会动态渲染 `<BorderBeam>` 组件，为组件添加一个临时的、代表"处理中"状态的视觉光环。这展示了如何将视觉特效与组件的内部状态变化相结合。 |
| **纯 CSS 动画与组件** | 项目在 `styles/globals.css` 中定义了复杂的 `@keyframes` 动画，如 `aurora` 和 `spotlight`。这些动画通过独立的组件（如 `aurora-text.tsx`, `ray.tsx`）应用，将动画逻辑与组件结构分离。这种方法性能优异，适用于背景、光效等装饰性动画。 |
| **CSS Modules** | 对于需要特定、隔离样式的组件，如 `loading-animation.tsx`，项目采用了 CSS Modules (`.module.css`)。这确保了动画类名（如 `.bouncing-animation`）的局部作用域，避免了与全局 Tailwind 样式或其它组件样式的冲突。 |



--- (200-208 lines) ---
项目的目录结构和代码组织方式遵循了现代大型前端应用的**最佳实践**，非常值得借鉴。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **功能切片 (Feature-Sliced) 路由** | `app/` 目录下的结构（如 `app/chat/`, `app/landing/`, `app/settings/`）体现了按功能组织代码的原则。每个功能模块都是一个独立的单元，包含了自身的页面、组件和逻辑，使得项目结构清晰，易于扩展和维护。 |
| **组件分层** | 项目中的 `components/` 目录被清晰地划分为三层：<br>1. **`ui/`**: 基础 UI 组件，源自 Shadcn/ui，是应用的视觉基石。<br>2. **`deer-flow/`**: 应用级的共享组件，如 `Logo`, `Markdown`, `Tooltip` 等。它们封装了通用逻辑，在多个功能模块中复用。<br>3. **`magicui/`**: 高度定制化的视觉特效组件，与业务逻辑解耦，可轻松移植到任何项目中。 |
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |
| **自定义 Hooks 封装** | `hooks/` 目录提供了可复用的 React Hooks，如 `useIntersectionObserver` 和 `useIsMobile`。它们将复杂的浏览器 API 或重复的逻辑封装成简单易用的钩子，简化了组件代码。 |



--- (211-218 lines) ---
项目建立了一套强大且灵活的样式与主题系统。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **基于 CSS 变量的主题系统** | `styles/globals.css` 中，通过在 `:root` 和 `.dark` 选择器下定义大量的 CSS 自定义属性 (custom properties)，构建了整个应用的主题系统。所有颜色、半径等设计令牌 (design tokens) 都被变量化，使得主题切换（通过 `next-themes`）仅需切换一个顶层 class，浏览器即可高效地重绘。 |
| **Tailwind `@theme` 指令** | 通过 `@theme` 指令，项目将 CSS 变量（如 `--app-background`）与 Tailwind 的配置相结合，创建了语义化的工具类（如 `bg-app`）。这使得在组件中可以直观地使用主题颜色，而无需关心具体的色值。 |
| **`cn` 工具函数** | `lib/utils.ts` 中的 `cn` 函数是整个项目的标准实践。它结合了 `clsx` 和 `tailwind-merge`，解决了在 React 组件中动态、条件性地组合 Tailwind 类名时的所有痛点（如条件判断、样式覆盖冲突），是现代 Tailwind 项目的必备工具。 |



--- (229-238 lines) ---
### 十viii、 鲁棒性与回退策略

项目在代码中体现了防御性编程的思想，确保在各种异常情况下应用依然能稳定运行。

| 策略/模式 | 描述与复用价值 |
| :--- | :--- |
| **API 请求重试与超时** | `core/api/hooks.ts` 中的 `useConfig` Hook 在 `fetch` 配置时，不仅设置了超时 (`AbortSignal.timeout`)，还实现了带有指数退避 (exponential backoff) 的重试逻辑。这显著提高了应用在网络不佳情况下的稳定性。 |
| **组件级错误回退** | `components/deer-flow/fav-icon.tsx` 组件的 `img` 标签上使用了 `onError` 事件处理器。当网站图标加载失败时，它会自动切换到一个通用的备用图标，避免了在 UI 上显示破碎的图片。 |
| **环境驱动的逻辑切换** | `env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY` 环境变量在多个地方被用作开关，以改变应用的行为。例如，`chatStream` 会根据此变量决定是调用真实的 API 还是模拟的 `chatReplayStream`。这使得同一套代码库可以轻松地部署为功能完整的动态应用或纯静态的演示网站。 |
| **容错数据解析** | `core/utils/json.ts` 中的 `parseJSON` 函数在解析失败时不会直接抛出错误，而是会返回一个预设的 `fallback` 值。这使得即使 LLM 返回的 JSON 格式稍有瑕疵，UI 也不会因此崩溃。 |


--- (241-251 lines) ---

项目在多个层面都考虑了性能，确保了应用的响应速度和流畅性。

| 实践/技术 | 描述与复用价值 |
| :--- | :--- |
| **代码分割 (Code Splitting)** | 使用 `next/dynamic` 对大型或非首屏必要的组件进行懒加载。在 `app/chat/page.tsx` 中，核心的 `Main` 组件就是动态导入的，并提供了一个 `loading` 状态。这显著减小了初始页面的 JavaScript 包体积，加快了页面的可交互时间。 |
| **组件级 Memoization** | **`React.memo`**: 对于 props 不经常变化的纯展示组件，项目使用了 `React.memo` 进行包裹。例如，在 `app/chat/components/research-activities-block.tsx` 中，`ActivityMessage` 和 `ActivityListItem` 都被 `React.memo` 优化，防止在父组件重渲染时不必要地重新渲染整个活动列表。 <br>**`useMemo` / `useCallback`**: 在整个代码库中广泛使用 `useMemo` 来缓存计算结果（如 `app/chat/main.tsx` 中的 `doubleColumnMode`），以及使用 `useCallback` 来缓存事件处理器（如 `app/chat/components/input-box.tsx` 中的 `handleSendMessage`），避免了子组件因函数引用变化而导致的无效渲染。 |
| **有限动画策略** | 在渲染长列表时，并非所有项都需要动画。`app/chat/components/research-activities-block.tsx` 中实现了一个聪明的策略：定义一个 `MAX_ANIMATED_ITEMS` 常量，只对前 N 个新加载的列表项应用 `framer-motion` 动画，而后续项则直接渲染。这在保证视觉效果的同时，极大地降低了大量 DOM 元素同时动画带来的性能开销。 |
| **状态更新批处理** | `core/store/store.ts` 中的 `sendMessage` 函数在处理 SSE 流时，并没有在每次收到 `chunk` 时都立即调用 `setState`，而是将待更新的消息放入一个 `pendingUpdates` Map 中，并通过 `setTimeout` 进行批处理。这种“去抖”或“批处理”的模式，将一秒内可能发生的数十次状态更新合并为少数几次，极大地减少了 React 的渲染次数，是流式应用性能优化的关键。 |
| **虚拟滚动** (潜在) | 虽然当前代码中没有明确实现虚拟滚动，但项目的组件化结构（如 `MessageListView`）非常适合集成 `react-window` 或 `tanstack-virtual` 等库。对于需要处理成千上万条消息的场景，这是下一步性能优化的明确方向。 |



--- (265-271 lines) ---
项目遵循了前端安全和可访问性的基本原则。

| 领域 | 实践与价值 |
| :--- | :--- |
| **安全性** | **防范 XSS 攻击**: 渲染用户生成或来自 API 的内容时，项目始终使用 `react-markdown` (`Markdown` 组件) 或通过 Tiptap 的安全机制进行渲染，而不是直接使用 `dangerouslySetInnerHTML`。<br>**安全处理用户输入**: `components/editor/index.tsx` 中的富文本编辑器在处理粘贴内容时，通过 `handleImagePaste` 和 `transformPastedHTML` 等逻辑对输入进行过滤和转换，防止粘贴恶意的 HTML 代码。<br>**安全的外部链接**: 在所有 `target="_blank"` 的链接中，都添加了 `rel="noopener noreferrer"`，防止了潜在的 "tabnabbing" 漏洞。 |
| **可访问性 (a11y)** | **语义化 HTML**: 项目结构良好，使用了恰当的 HTML5 标签（`header`, `main`, `footer`, `section` 等）。<br>**Radix UI 基础**: 由于 UI 组件库基于 Radix UI，所有组件（如 `Dialog`, `DropdownMenu`, `Tooltip`）都内置了完善的键盘导航支持、焦点管理和 ARIA 属性，提供了坚实的可访问性基础。例如，弹窗打开时焦点会自动移入，关闭后会返回原处。 |


</front_stack>

<deer_flow_frontend_code>
--- (570-582 lines) ---
  // Route the event based on its type (API 6.5)
  switch (event_type) {
    case EventType.NodeStatusUpdated:
      // Incremental update (API 6.5.1)
      store.handleNodeStatusUpdated(payload.data);
      break;

    case EventType.NodeActiveVersionChanged:
      // Triggers full sync for staleness (API 6.5.2)
      // The action is async, we use void to explicitly acknowledge we are not waiting for it here.
      void store.handleNodeActiveVersionChanged(payload.data);
      break;



--- (1092-1116 lines) ---
// Define the Event Types (API 6.5)
export enum EventType {
  NodeStatusUpdated = "NODE_STATUS_UPDATED",
  NodeActiveVersionChanged = "NODE_ACTIVE_VERSION_CHANGED",
  WorkflowStructureUpdated = "WORKFLOW_STRUCTURE_UPDATED",
  WorkflowStatusUpdated = "WORKFLOW_STATUS_UPDATED",
}

// Base structure shared by all event payloads
interface BaseEventPayload {
  event_type: EventType;
  workflow_id: number;
}

export type NodeStatusUpdatedPayload = BaseEventPayload & {
  event_type: EventType.NodeStatusUpdated;
  data: NodeInstanceRead;
  node_id: number;
};

export type NodeActiveVersionChangedPayload = BaseEventPayload & {
  event_type: EventType.NodeActiveVersionChanged;
  data: NodeInstanceRead;
  node_id: number;
};


--- (1157-1178 lines) ---
// API 5.5.2: NodeVersionRead (Immutable snapshot after approval - R5.6, V1.1)
export const NodeVersionReadSchema = z.object({
  id: z.number().int(),
  version_number: z.number().int(),
  node_instance_id: z.number().int(),
  summary: z.string().nullable(),
  source: VersionSourceEnum,
  based_on_version_id: z.number().int().nullable(),
  // The Snapshot Content (V1.2)
  output_data: JsonObjectSchema.nullable(),
  raw_generated_output: JsonObjectSchema.nullable(),
  execution_artifacts: ExecutionArtifactsSchema,
  // input_dependencies: { [upstream_node_id]: consumed_version_id }
  // Keys are node IDs (numbers), but JSON object keys are strings.
  input_dependencies: z.record(z.string(), z.number().int()),
  hitl_history: z.array(JsonObjectSchema),
  // Environment Parameters (V1.2)
  llm_model_name: z.string().nullable(),
  temperature: z.number().nullable(),
});
export type NodeVersionRead = z.infer<typeof NodeVersionReadSchema>;



--- (1556-1578 lines) ---
// API 3.5.4: NodeInstanceRead (Central model for Workflow visualization and state management)
export const NodeInstanceReadSchema = z.object({
  id: z.number().int(),
  definition_id: z.string(), // Static ID (e.g., "1.1.1")
  name: z.string(),
  // Execution State
  status: NodeStatusEnum,
  current_stage: ExecutionStageEnum,
  // Configuration
  node_type: NodeTypeEnum,
  hitl_mode: HITLModeEnum,
  order_index: z.number().int(),
  // Versioning
  active_version_id: z.number().int().nullable(),
  // Structural Context (Design Doc 2.1.1.D)
  phase_id: z.string(),
  stage_id: z.string(),
  stage_name: z.string(),
  task_group_id: z.string().nullable(), // For dynamically generated nodes
  // Staleness Indicator (R5.2, V4.1)
  is_stale: z.boolean(),
});
export type NodeInstanceRead = z.infer<typeof NodeInstanceReadSchema>;


--- (2069-2087 lines) ---
  /**
   * Activates a specific historical version (API 5.4.2).
   */
  activateVersion: async (
    nodeId: number,
    versionId: number,
  ): Promise<NodeInstanceRead> => {
    try {
      const response = await apiClient.post<NodeInstanceRead>(
        `/nodes/${nodeId}/versions/${versionId}/activate`,
        null, // No body required
      );
      return response.data;
    } catch (error) {
      handleInterventionError(error);
      throw error;
    }
  },
};


--- (2109-2124 lines) ---
/**
 * Centralized handling for intervention-related errors (409, 403).
 */
const handleInterventionError = (error: unknown) => {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    // 409 Conflict (Invalid state or IDs, e.g., invalid base_version_id)
    if (status === 409) {
      throw new Error("INVALID_STATE_OR_VERSION_MISMATCH");
    }
    // 403 Forbidden (e.g., trying to edit/switch Generator node - W3.2)
    if (status === 403) {
      throw new Error("ACTION_FORBIDDEN_ON_NODE_TYPE");
    }
  }
};


--- (3135-3201 lines) ---
export interface WorkflowSlice {
  // --- State ---
  workflowInstance: WorkflowInstanceRead | null;
  // Normalized index for fast lookups (Architecture 4.3.4)
  nodesById: Map<number, NodeInstanceRead>;
  // Cache for node details
  nodeDetailsCache: Map<number, NodeDetailView>;
  // Cache for specific historical versions
  nodeVersionsCache: Map<number, NodeVersionRead>;
  // (Task 21): Cache for the list of versions for a node (API 5.1.2). Stores array or null (if fetch failed).
  nodeVersionListCache: Map<number, NodeVersionRead[] | null>;

  isLoading: boolean; // Initial load
  isSyncing: boolean; // Background refresh/sync (e.g., after WS event or staleness update)
  isExecutingAction: boolean; // Covers re-execute, HITL submit, versioning actions (API request duration)

  // Tracks nodes where cancellation has been requested but not yet confirmed by WS. (Design Doc 3.1.2.C.4, Task 17.5)
  pendingCancellationNodeIds: Set<number>;

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
  // (Task 21): Action to fetch the list of all versions
  fetchNodeVersionList: (
    nodeId: number,
    force?: boolean,
  ) => Promise<NodeVersionRead[] | null>;
  // Action to fetch a specific historical version
  fetchNodeVersion: (
    nodeId: number,
    versionId: number,
  ) => Promise<NodeVersionRead | null>;

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


--- (3216-3255 lines) ---
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
        nodeVersionsCache: new Map(),
        nodeVersionListCache: new Map(), // (Task 21)
        pendingCancellationNodeIds: new Set(), // Reset pending cancellations
      });
      // Clear associated UI state
      get().resetWorkflowUIState();
    } else {
      // Indicate background synchronization. This prevents WS events from processing (checked in WebSocketManager).
      set({ isSyncing: true });
    }

    try {
      // Fetch the full snapshot (REST as Source of Truth - API 6.1)
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


--- (3354-3378 lines) ---
  /**
   * Handles version changes, triggering a full sync for staleness updates.
   * (API 6.5.2, Architecture 4.3.4 Strategy 4, Design Doc 3.1.2.C.2)
   */
  handleNodeActiveVersionChanged: async (updatedNode) => {
    // (Task 21): Invalidate the version list cache for this node, as the active status indicator in the list must be updated.
    set(
      produce((state: WorkflowSlice) => {
        state.nodeVersionListCache.delete(updatedNode.id);
      }),
    );

    // 1. Optimistically update the specific node first
    get().handleNodeStatusUpdated(updatedNode);

    // 2. Trigger full synchronization (Crucial for updating global is_stale flags)
    const workflowId = get().workflowInstance?.id;
    if (workflowId) {
      console.log(
        `NODE_ACTIVE_VERSION_CHANGED detected for node ${updatedNode.id}. Triggering full workflow sync (Staleness Update).`,
      );
      // We trigger the loadWorkflow in sync mode (isInitialLoad=false)
      await get().loadWorkflow(workflowId);
    }
  },


--- (3637-3661 lines) ---
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


--- (3711-3731 lines) ---
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


--- (11876-12025 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/history/version-card.tsx Content:

```tsx
"use client";

import { Bot, Pencil } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { NodeVersionRead } from "~/core/models/node.model";
import { VersionSource } from "~/constants/enums";

interface VersionCardProps {
  version: NodeVersionRead;
  isActive: boolean; // Is this the globally active version?
  isViewing: boolean; // Is this the version currently loaded in the workspace?
  onReview: () => void;
  onActivate: () => void;
  disabled: boolean; // Disable actions when an operation is in progress or forbidden
}

/**
 * C2. Version Card Component.
 * Displays a compact summary of a historical version.
 * (Design Doc 5.1.4.C2)
 */
export function VersionCard({
  version,
  isActive,
  isViewing,
  onReview,
  onActivate,
  disabled,
}: VersionCardProps) {
  // Determine the source icon (🤖/✏️) (Design Doc 5.1.4.C2)
  const isAiGenerated = version.source === VersionSource.AI_GENERATED;
  const SourceIcon = isAiGenerated ? Bot : Pencil;

  // Placeholder for timestamp formatting.
  // As the provided API definition (NodeVersionRead) lacks a timestamp field (e.g., created_at), we use a mock value.
  const formattedTimestamp = "Timestamp N/A"; // TODO: Replace when API provides timestamp

  const handleActivateClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onReview when clicking the button
    if (!disabled) {
      onActivate();
    }
  };

  const handleCardClick = () => {
    // Trigger review only if the card is not already being viewed.
    if (!isViewing) {
        onReview();
    }
  };

  return (
    // Use motion.div for layout animations when the list updates (e.g., new version added or activation changes order/layout).
    <motion.div layout transition={{ type: "spring", stiffness: 350, damping: 25 }}>
        <Card
        onClick={handleCardClick}
        // Apply accessibility attributes
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent scroll on spacebar
                handleCardClick();
            }
        }}
        // Styling (Design Doc 5.1.4.C2: Compact layout p-3)
        className={cn(
            // Override default Card styling (which often has larger padding/gaps) for compact layout
            "block gap-0 p-3 shadow-sm transition-all duration-200 group",
            // Interactive styling
            !isViewing && "cursor-pointer hover:bg-secondary/50",
            // Visual indicator for the currently viewed version in the workspace
            isViewing && "bg-secondary/80 shadow-md ring-1 ring-ring/50",
            // Active State Styling (Design Doc 5.1.4.C2): border-primary
            isActive && "border-primary border-2",
        )}
        >
        <div className="flex items-start justify-between gap-3">
            {/* Left side: Version Info, Icon, Timestamp */}
            <div className="flex items-center gap-3">
            {/* Source Icon Visualization with thematic color */}
            <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                isAiGenerated 
                    ? "bg-blue-50 border-blue-300 text-blue-500 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400"
                    : "bg-amber-50 border-amber-300 text-amber-500 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400"
            )}>
                <SourceIcon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-sm font-semibold">
                V{version.version_number}
                </p>
                <p className="text-xs text-muted-foreground">
                {formattedTimestamp}
                </p>
            </div>
            </div>

            {/* Right side: Active Badge */}
            {isActive && (
            // (Design Doc 5.2.4): Use Framer Motion layoutId for smooth transition of the badge between cards.
            <motion.div layoutId="active-version-badge" transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                <Badge variant="default" className="text-xs uppercase tracking-wide shadow-sm">
                Active
                </Badge>
            </motion.div>
            )}
        </div>

        {/* Summary (Design Doc 5.1.4.C2) */}
        <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
            {version.summary || <span className="italic">No summary provided.</span>}
        </p>

        {/* Action Button (Inactive State) (Design Doc 5.1.4.C2) */}
        {/* Show button prominently when viewing an inactive version, or on hover otherwise. */}
        {!isActive && (
            <div className="mt-3">
            <Button
                variant="outline"
                size="sm"
                className={cn(
                    "w-full transition-opacity duration-200",
                    // Fade in on hover/focus if not currently viewing this specific card
                    !isViewing && "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                )}
                onClick={handleActivateClick}
                disabled={disabled}
                title={disabled ? "Action disabled" : "Set as Active Version"}
            >
                Set as Active Version
            </Button>
            </div>
        )}
        </Card>
    </motion.div>
  );
}


```


--- (12027-12291 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/history/version-history-panel.tsx Content:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, History as HistoryIcon, RefreshCw, AlertTriangle } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { LayoutGroup } from "framer-motion";

import { useStore } from "~/core/store";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { VersionCard } from "./version-card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import type { NodeVersionRead } from "~/core/models/node.model";
import { NodeType } from "~/constants/enums";

interface VersionHistoryPanelProps {
  activeNode: NodeInstanceRead;
}

/**
 * C. Version History Panel (Right Sidebar Content).
 * Manages the fetching and display of the version history list using Zustand store.
 * (Design Doc 5.1.4, Architecture 7.3)
 */
export function VersionHistoryPanel({ activeNode }: VersionHistoryPanelProps) {
  // Access state and actions from Zustand
  const {
    viewingVersionId,
    viewHistoricalVersion,
    viewLatestVersion,
    fetchNodeVersionList,
    nodeVersionListCache,
    activateVersion,
    isExecutingAction,
  } = useStore(
    useShallow((state) => ({
      viewingVersionId: state.viewingVersionId,
      viewHistoricalVersion: state.viewHistoricalVersion,
      viewLatestVersion: state.viewLatestVersion,
      fetchNodeVersionList: state.fetchNodeVersionList,
      nodeVersionListCache: state.nodeVersionListCache,
      activateVersion: state.activateVersion,
      isExecutingAction: state.isExecutingAction,
    })),
  );

  // State for managing the activation confirmation dialog
  const [pendingActivation, setPendingActivation] = useState<NodeVersionRead | null>(null);

  const nodeId = activeNode.id;
  const activeVersionId = activeNode.active_version_id;

  // Retrieve the version list from the cache.
  // The cache might contain `undefined` (initial state/not fetched), `null` (failed fetch), or the array of versions.
  const versions = nodeVersionListCache.get(nodeId);

  // Determine loading state: We are loading if the versions list is `undefined`.
  const isLoading = versions === undefined;
  // Determine error state: We are in error if the cached value is `null`.
  const isError = versions === null;

  // Fetch the version list when the panel becomes visible (nodeId changes).
  useEffect(() => {
    // Trigger fetch (non-blocking). The slice handles caching logic (only fetches if undefined or forced) and errors.
    void fetchNodeVersionList(nodeId);
  }, [nodeId, fetchNodeVersionList]);


  // Handle Review interaction (Design Doc 3.1.1.C.1)
  const handleReview = (versionId: number) => {
    // If the user clicks the currently active version, ensure we are in "latest" view mode.
    if (versionId === activeVersionId) {
      viewLatestVersion();
    } else {
      // Otherwise, switch to historical view mode.
      viewHistoricalVersion(versionId);
    }
  };

  // Handle Activation interaction (Design Doc 3.1.1.C.2)
  const handleActivateRequest = (version: NodeVersionRead) => {
    if (isExecutingAction) return;
    // Open confirmation dialog by setting the pending activation state
    setPendingActivation(version);
  };

  // Handler for confirming activation in the dialog
  const confirmActivation = async () => {
    if (pendingActivation) {
      // Call the store action (API 5.4.2). State updates rely on WebSocket (NODE_ACTIVE_VERSION_CHANGED).
      const success = await activateVersion(nodeId, pendingActivation.id);
      if (success) {
        setPendingActivation(null);
      }
      // If failed, keep dialog open so user can see potential toast error (handled in slice) and retry/cancel.
    }
  };

  // Determine if activation is forbidden (e.g., Generator nodes - API 5.4.2)
  const isActivationForbidden = activeNode.node_type === NodeType.Generator;

  // --- Render States ---

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    // Pass force=true to retry the fetch
    return <ErrorState onRetry={() => fetchNodeVersionList(nodeId, true)} />;
  }

  // We know versions is an array here (not undefined or null)
  if (versions.length === 0) {
    return <EmptyState />;
  }

  // --- Main Content ---

  return (
    <>
      {/* Wrap in LayoutGroup to enable Framer Motion layout animations (like the active badge transition via layoutId) */}
      {/* (Design Doc 5.2.4) */}
      {/* Note: ScrollArea is handled by the parent CockpitLayout */}
      <LayoutGroup>
        <div className="space-y-4 p-4">
            {/* API 5.1.2 returns versions in reverse chronological order (descending). */}
            {versions.map((version) => {
                const isActive = version.id === activeVersionId;
                // Determine if this version is currently being viewed in the workspace.
                // If viewingVersionId is null (latest mode), the active version is being viewed.
                const isViewing = viewingVersionId === version.id || (viewingVersionId === null && isActive);

                return (
                <VersionCard
                    key={version.id}
                    version={version}
                    isActive={isActive}
                    isViewing={isViewing}
                    onReview={() => handleReview(version.id)}
                    onActivate={() => handleActivateRequest(version)}
                    disabled={isExecutingAction || isActivationForbidden}
                />
                );
            })}
        </div>
      </LayoutGroup>

      {/* Confirmation Dialog (Extracted for clarity) */}
      <ActivationConfirmationDialog
        version={pendingActivation}
        onConfirm={confirmActivation}
        onCancel={() => setPendingActivation(null)}
        // Show loading state if activation is pending AND the global action flag is set.
        isActivating={isExecutingAction && !!pendingActivation}
      />
    </>
  );
}

// --- Helper Components for States ---

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="ml-3 text-sm">Loading history...</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4"/>
        <AlertTitle>Error Loading History</AlertTitle>
        <AlertDescription>
          Could not fetch the version history.
        </AlertDescription>
        <Button variant="destructive" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2"/> Retry
        </Button>
      </Alert>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
      <HistoryIcon className="h-12 w-12 text-border" />
      <p className="mt-4 text-sm">No version history found for this node.</p>
    </div>
  );
}

// --- Activation Confirmation Dialog ---

interface ActivationConfirmationDialogProps {
  version: NodeVersionRead | null;
  onConfirm: () => void;
  onCancel: () => void;
  isActivating: boolean;
}

/**
 * Confirmation dialog for version activation.
 * (Design Doc 3.3.D.4 / 5.1.4.C2)
 */
function ActivationConfirmationDialog({
  version,
  onConfirm,
  onCancel,
  isActivating,
}: ActivationConfirmationDialogProps) {
  if (!version) return null;

  return (
    // Control open state based on whether a version is pending activation.
    // Prevent closing dialog while activation API call is in progress.
    <AlertDialog open={!!version} onOpenChange={(open) => !open && !isActivating && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Activate Version V{version.version_number}?
          </AlertDialogTitle>
          {/* Required text from Design Doc 3.3.D.4 */}
          <AlertDialogDescription>
            Activating this version will change the node&apos;s output.
            Downstream nodes will be marked as &apos;Stale&apos; and will{" "}
            <strong>NOT</strong> be automatically updated. Do you wish to
            proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Disable buttons during the API call */}
          <AlertDialogCancel disabled={isActivating}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isActivating}>
            {isActivating && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Activate V{version.version_number}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


```


--- (12788-12844 lines) ---
### constants/motion.ts Content:

```ts
/**
 * Standardized animation durations (seconds) — Design Doc 4.2.1.A.
 */
export const Duration = {
  INSTANT: 0,
  X_FAST: 0.1,
  FAST: 0.2,
  MEDIUM: 0.3,
  SLOW: 0.5,
  X_SLOW: 0.8,
} as const;

/**
 * Standard easing curves (cubic-bezier arrays) — Design Doc 4.2.1.B.
 */
export const Easing = {
  STANDARD: [0.4, 0, 0.2, 1],
  ENTER: [0, 0, 0.2, 1],
  EXIT: [0.4, 0, 1, 1],
  EXPRESSIVE: [0.215, 0.61, 0.355, 1],
} as const;

/**
 * 4.2.2.C Framer Motion Variants Configuration
 */
export const Variants = {
  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: Duration.MEDIUM, ease: Easing.ENTER },
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: { duration: Duration.FAST, ease: Easing.EXIT },
    },
  },
  modalPop: {
    initial: { opacity: 0, scale: 0.96 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: Duration.MEDIUM, ease: Easing.ENTER },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: { duration: Duration.FAST, ease: Easing.EXIT },
    },
  },
} as const;



--- (12912-12920 lines) ---
// API 3.5.4: Node Type (SRS 2.2)
export const NodeTypeEnum = z.enum(["Standard", "Generator"]);
export type NodeType = z.infer<typeof NodeTypeEnum>;

// (Task 21): Define explicit constants for NodeType
export const NodeType = {
  Standard: "Standard" as const,
  Generator: "Generator" as const,
};


--- (13440-13576 lines) ---
### components/ui/alert-dialog.tsx Content:

```tsx
"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 sm:gap-0",
      className,
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

```


--- (14931-14970 lines) ---
### components/ui/badge.tsx Content:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-xs",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-xs",
        outline: "text-foreground shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };



--- (15005-15071 lines) ---
### components/ui/button.tsx Content:

```tsx
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        "cursor-pointer active:scale-105",
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };

```

</deer_flow_frontend_code>

<architecture>
--- (13-15 lines) ---
1.  **复杂状态同步与实时性**: 精确管理工作流结构、节点状态、版本信息和实时执行进度，确保数据一致性。
2.  **高信息密度与清晰度**: 实现灵活的三栏式“驾驶舱”布局，清晰展示大量复杂信息（代码、日志、公式）。
3.  **精细化控制与复杂交互**: 支持多种人机协同 (HITL) 模式和精细的用户干预（版本切换、人工编辑）。


--- (20-22 lines) ---
1.  **集中式状态管理**: 使用 Zustand 作为全局状态管理的单一事实来源 (SSOT)。
2.  **明确的数据同步范式**: 严格遵守 API 6.1 原则——**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新**。在连接恢复和关键事件后执行全量同步。
3.  **关注点分离**: 采用分层架构（UI 层、状态管理层、API 服务层），实现业务逻辑与 UI 的解耦。


--- (51-52 lines) ---

  * **Framer Motion**: 核心动效库。用于微交互、转场和关键的布局动画 (Layout Animations)。


--- (128-128 lines) ---
│   └── feedback/       # ConfirmationDialog, Toaster


--- (162-164 lines) ---
└── History/                   # C. 右侧栏：版本历史面板
    ├── VersionHistoryPanel.tsx
    └── VersionCard.tsx


--- (231-284 lines) ---
#### 4.3.4 WorkflowSlice (`workflowSlice.ts`) - 核心复杂性

管理当前活动工作流的完整状态。

```typescript
// src/core/store/slices/workflowSlice.ts
interface WorkflowSlice {
  // --- 1. 工作流数据 (Server State Cache) ---
  workflowInstance: WorkflowInstanceRead | null; // 包含完整的 phases 树

  // 扁平化索引 (Normalized Index) - 关键优化
  nodesById: Map<number, NodeInstanceRead>;

  // 节点详情缓存
  nodeDetailsCache: Map<number, NodeDetailView>;

  isLoading: boolean;
  isSyncing: boolean; // 正在进行全量同步

  // --- Actions ---
  actions: {
    // A. 同步与初始化
    loadWorkflow: (workflowId: number) => Promise<void>; // 全量加载/同步
    _normalizeData: (workflow: WorkflowInstanceRead) => void; // 更新 nodesById

    // B. WebSocket 事件处理
    handleNodeStatusUpdated: (node: NodeInstanceRead) => void;
    handleNodeActiveVersionChanged: (node: NodeInstanceRead) => void;
    handleWorkflowStructureUpdated: (workflow: WorkflowInstanceRead) => void;

    // C. 节点详情管理
    fetchNodeDetails: (nodeId: number) => Promise<NodeDetailView>;

    // D. 执行控制与 HITL (调用 API Service)
    reExecuteNode: (/*...*/) => Promise<void>;
    submitHITL: (/*...*/) => Promise<HITLResponse>;
    activateVersion: (/*...*/) => Promise<void>;
    manualEdit: (/*...*/) => Promise<void>;
  }
}
```

**WorkflowSlice 关键实现策略:**

1.  **扁平化索引 (`nodesById`)**: 为了高效处理 WebSocket 的增量更新（如 `NODE_STATUS_UPDATED`），必须维护一个扁平化的节点 Map。`_normalizeData` 负责在每次全量加载后重建此索引。
2.  **增量更新 (`handleNodeStatusUpdated`)**:
      * 更新 `nodesById` 中的对应节点。
      * 必须以不可变的方式更新 `workflowInstance.phases` 树中对应的节点，以触发 UI 更新。
3.  **结构性更新 (`handleWorkflowStructureUpdated`)**:
      * **全量替换**: 使用事件负载完全替换 `workflowInstance`。
      * 调用 `_normalizeData` 重建索引。
4.  **Staleness 同步 (`handleNodeActiveVersionChanged`)**:
      * **[关键]** 此 Action 必须触发 `loadWorkflow()`，重新获取全量数据以更新所有节点的 `is_stale` 标志（遵循 API 6.5.2）。



--- (291-308 lines) ---
interface UIInteractionSlice {
  activeNodeId: number | null;
  viewingVersionId: number | null; // null 表示查看最新/Pending
  
  // Navigator 状态
  collapsedPhases: Set<string>;

  // Workspace 状态
  isEditing: boolean;
  expandedBlocks: Set<string>; // e.g., 'artifacts', 'inputs'

  actions: {
    selectNode: (nodeId: number) => void;
    viewHistoricalVersion: (versionId: number) => void;
    startEditing: () => void;
    // ...
  }
}


--- (348-370 lines) ---
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



--- (434-435 lines) ---
      * 使用 `NodeStatusIcon` 显示实时状态（颜色遵循 4.1.1.D，`Executing` 需动画）。
      * 显示 `StalenessIndicator` (⚠️) 如果 `is_stale: true`。


--- (471-490 lines) ---
### 7.3 C. 版本历史面板 (Version History Panel)

**文件**: `VersionHistoryPanel.tsx`, `VersionCard.tsx`。

#### 7.3.1 数据获取

  * 通过 `GET /nodes/{node_id}/versions` 获取版本列表。建议使用 React Query 进行缓存管理。

#### 7.3.2 版本卡片 (`VersionCard`)

  * 显示版本元数据（V\#, 时间戳, 来源图标 🤖/✏️, Summary）。
  * 清晰标记 `[ACTIVE]` 状态。

#### 7.3.3 交互逻辑

  * **Review**: 点击卡片，更新 `UIInteractionSlice.viewingVersionId`，Workspace (B) 加载历史版本详情。
  * **Activate**: 点击 [Set as Active Version]。
      * **[关键实现]** 弹出确认对话框，明确告知后果（非级联更新，Staleness）（设计文档 3.1.1.C.2）。
      * 调用 API，然后等待 WebSocket 事件触发全局同步（详见 5.3.4）。



--- (525-527 lines) ---
1.  **布局动画 (Layout Animations)**:
      * **应用场景**: Workflow Navigator (A) 处理动态结构更新。
      * **实现**: 使用 `motion.li`, `layout` 属性和 `AnimatePresence` 实现节点的平滑插入和移动（设计文档 5.2.1）。


--- (547-547 lines) ---
  * **反馈机制**: 统一使用 Toast (Sonner), Banner (Alert), AlertDialog 进行反馈（设计文档 3.1.2）。

</architecture>



---

<task>


### 任务 23：版本控制：版本切换与确认机制

**目标：** 实现激活历史版本的功能，并实施严格的用户确认机制（遵循静默状态管理原则）。

**核心关注点：** 版本切换 API 调用、强制性确认对话框、状态同步触发、业务限制。

**实现策略（参考 `<design_doc> 3.1.1.C.2`, `<api> 5.4.2`）：**

1.  **WorkflowSlice 扩展：** 实现 `activateVersion` Action。
2.  **UI 集成（`VersionCard.tsx`）：**
    *   在非活动版本上实现 [Set as Active Version] 按钮。
    *   **限制：** 禁用 `Generator` 类型节点的版本切换（`<design_doc> 3.1.1.C.2 限制`）。
3.  **强制性确认对话框（关键实现）：**
    *   点击按钮后，弹出 `AlertDialog`。
    *   文案必须严格遵循 `<design_doc> 3.3.D.4`，明确告知后果（非级联更新，Staleness）。
4.  **执行与同步：**
    *   用户确认后调用 API。
    *   确保任务 9 实现的同步逻辑（`NODE_ACTIVE_VERSION_CHANGED` 触发全量同步）正确执行，以更新全局 `is_stale` 标志。
5.  **动效反馈（可选增强）：** 使用 Framer Motion `layoutId` 实现 `[ACTIVE]` Badge 的平滑移动动画（`<design_doc> 5.2.4`）。

**输入：** 任务 21 的输出（VersionCard）, 任务 9（Sync Strategy）, `<api> 5.4.2`, `<design_doc> 3.1.1.C.2, 3.3.D.4`。
**输出：** 安全、可控的历史版本激活功能。


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


---

严格按照以下格式输出格式：

... (answer to the task) ...

**`relative_path/filename.tsx`**

```tsx
... (code) ...
```

**`relative_path/filename.ts`**

```ts
... (code) ...
```

...(more files)...

... (conclusion) ...

