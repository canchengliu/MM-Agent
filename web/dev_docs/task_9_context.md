<design_doc>
--- (148-151 lines) ---
| R1.1 | WebSocket 实时通信 | 建立安全的 WebSocket 连接，实现实时状态更新。 | API 6 | P1 |
| R1.2 | 实时事件处理 | 客户端处理 `NODE_STATUS_UPDATED`, `WORKFLOW_STRUCTURE_UPDATED`, `NODE_ACTIVE_VERSION_CHANGED` 等事件。 | API 6.5 | P1 |
| R1.3 | 断线重连与状态同步 | 客户端实现断线重连，并在重连后通过 REST API 同步全量状态。 | API 6.1 | P1 |



--- (390-391 lines) ---
      * **Dynamic Updates:** 当收到 `WORKFLOW_STRUCTURE_UPDATED` 事件时，此树结构会动态刷新。



--- (455-457 lines) ---
        4.  **系统处理 (后端):** 固化新版本 V1，设为 `active_version`。Node A 状态更新为 `Completed`。判断并启动下一个节点 (Node B)。
        5.  **系统响应 (API/WebSocket):** API 返回 `action: ExecuteNext`。WebSocket 推送 `NODE_STATUS_UPDATED` (A-\>Completed, B-\>Executing) 和 `NODE_ACTIVE_VERSION_CHANGED` (A)。
        6.  **UI 更新与导航:** UI 自动导航到 Node B。Left Navigator 更新状态图标。


--- (464-465 lines) ---
        6.  **系统响应 (WebSocket):** WebSocket 推送 `NODE_STATUS_UPDATED` (A-\>Executing)。
        7.  **UI 更新:** Center Workspace 切换到 `Executing` 视图。Action Footer (B3) 隐藏。流程返回等待状态。


--- (483-486 lines) ---
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node A)。
      * **前端响应 (关键):** 前端监听到此事件，立即调用 `GET /workflows/{id}` 重新获取全量工作流状态。
      * 新的状态中，Node B 的 `is_stale` 标志为 `true`。
5.  **UI 更新与过时感知:**


--- (497-498 lines) ---
      * **系统响应 (WebSocket):** WebSocket 推送 `NODE_STATUS_UPDATED` (B-\>Executing)。
8.  **UI 更新:** Node B 进入执行状态，⚠️ 图标消失。


--- (518-520 lines) ---
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node C)。
      * **前端响应:** UI 退出编辑模式。Right Sidebar 更新。前端触发工作流全量状态刷新（同 2.3.2 步骤 4），更新下游节点的 `is_stale` 标志。



--- (530-539 lines) ---
3.  **系统广播结构更新 (WebSocket - 关键):**
      * 后端广播 `WORKFLOW_STRUCTURE_UPDATED` 事件。负载包含**全新且完整**的 `WorkflowInstanceRead` 对象。
4.  **前端响应与状态同步 (关键):**
      * 前端监听到此事件。
      * **全量替换:** 前端（Zustand Workflow Store）必须立即丢弃当前的 `phases` 结构，并用事件负载中的新数据进行**全量替换**。
5.  **UI 更新与重渲染:**
      * Left Navigator (A) 根据新结构完全重渲染，平滑展示新插入的节点。
      * UI 显示短暂通知（Toast: "Workflow structure updated."）。
6.  **导航:** 根据 HITL 审批的返回结果（`action: ExecuteNext`），前端自动导航到新插入序列的第一个节点，该节点通常会自动开始执行。



--- (645-652 lines) ---

实现依赖于前端状态管理（Zustand）与后端实时通信（WebSocket, REST API）的精确协同。

##### 1\. 状态同步范式 (State Synchronization Paradigm)

  * 严格遵循 API 6.1 原则：**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新。**
  * **关键规则:** WebSocket 断线重连后，必须立即重新调用 REST API 获取全量快照，以保证数据一致性。



--- (653-663 lines) ---
##### 2\. 依赖过时状态 (Staleness)

实现“静默状态管理”（SRS 1.4）。

  * **检测与传播逻辑:**
    1.  **触发:** 前端监听到 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。
    2.  **同步:** 前端必须立即调用 `GET /workflows/{id}` 重新获取全量工作流状态，以更新所有节点的 `is_stale` 标志。
  * **视觉传达:**
      * **全局 (Navigator A):** 在 `is_stale: true` 的节点旁显示清晰的 ⚠️ 图标。Hover 显示 Tooltip 解释原因。
      * **局部 (Workspace B1):** 如果当前节点过时，显示醒目的、不可关闭的 `Staleness Banner`。



--- (664-673 lines) ---
##### 3\. 工作流结构动态更新 (Dynamic Structure Updates)

处理 `Generator` 节点导致的结构变化。

  * **触发:** 监听到 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件。
  * **处理逻辑 (关键):** 前端状态管理器必须执行**全量替换**操作，使用事件负载数据覆盖本地缓存。
  * **视觉传达:**
      * **通知:** 显示短暂 Toast：“Workflow structure updated.”。
      * **平滑过渡:** Navigator (A) 重新渲染。使用 `Framer Motion` (Layout Animations) 实现新节点的平滑插入动画，帮助用户理解结构变化。



--- (678-684 lines) ---
  * **流程:**
    1.  用户点击 [Cancel]。按钮立即变为“Cancelling...”并禁用。
    2.  发送 API 请求 `POST /nodes/{id}/cancel`。
    3.  等待 WebSocket `NODE_STATUS_UPDATED` 事件（`status: Canceled`）。
    4.  收到确认后，UI 更新为最终 `Canceled` 状态，激活 [Retry] 按钮。

-----


--- (1284-1287 lines) ---

      * **关键场景:** 当 `WORKFLOW_STRUCTURE_UPDATED` 发生时。
      * **实现技术:** 使用 `Framer Motion` 的 Layout Animations 和 `AnimatePresence`。新节点平滑插入，现有节点平滑移动到新位置，帮助用户理解结构变化。



--- (1611-1656 lines) ---
#### 5.2.1 场景 1：工作流结构动态更新 (Workflow Structure Dynamic Updates)

**场景:** `Generator` 节点完成，`WORKFLOW_STRUCTURE_UPDATED` 事件触发。

**目标:** 平滑地展示结构变化，保持空间感和上下文。

**实现技术:** Framer Motion `Layout Animations` 和 `AnimatePresence`。

**规范详述 (Navigator A):**

1.  **容器配置:** Workflow Tree View 的容器必须是 `motion.ul`（或 `motion.div`）。
2.  **节点项配置:** 每个 `Node Item` 必须是 `motion.li`，设置唯一的 `key` 和 `layout` 属性。

<!-- end list -->

```tsx
// Implementation Guidance (Workflow Tree)
import { motion, AnimatePresence } from 'framer-motion';
import { Duration, Easing } from '@/constants/motion';

// ... Inside the Tree View rendering logic ...
<motion.ul layout className="space-y-1">
  <AnimatePresence initial={false}> {/* initial={false} prevents animation on first load */}
    {nodes.map((node) => (
      <motion.li
        key={node.id}
        layout // Enables smooth movement when position changes
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{
          // Use spring for natural layout movement
          layout: { type: "spring", stiffness: 350, damping: 30 },
          // Use standard easing for insertion/exit
          default: { duration: Duration.MEDIUM, ease: Easing.ENTER }
        }}
      >
        <NodeItem node={node} />
      </motion.li>
    ))}
  </AnimatePresence>
</motion.ul>
```

3.  **效果:** 新节点平滑插入（展开高度+淡入），现有节点平滑移动到新位置。



--- (1683-1691 lines) ---
#### 5.2.4 场景 4：版本切换与 Staleness 传播反馈 (Version Switching & Staleness Feedback)

**目标:** 清晰传达版本变更及其对下游的影响。

1.  **版本激活反馈 (C):**

      * API 成功后，`[ACTIVE]` Badge 平滑过渡到新版本卡片。使用 Framer Motion `layoutId` 实现 Badge 的移动动画。

2.  **Staleness 传播反馈 (A):**


--- (1737-1744 lines) ---
##### B. 实现约定与最佳实践

1.  **主题与样式:** 严格遵守 Design Tokens。使用 CSS Variables 实现主题。默认深色模式。使用 `cn` 工具函数组合类名。
2.  **状态同步范式 (关键):** 严格遵循“REST API 为全量快照（Source of Truth），WebSocket 提供增量更新”的原则（参见 3.1.2.C.1）。实现健壮的断线重连和重连后的全量同步。
3.  **Staleness 处理逻辑:** 监听到 `NODE_ACTIVE_VERSION_CHANGED` 事件后，必须立即重新获取全量工作流状态以更新 `is_stale` 标志。
4.  **动态结构处理:** `WORKFLOW_STRUCTURE_UPDATED` 事件必须触发 Zustand Store 的全量替换。

#### 5.3.3 设计系统 Token 集汇总 (Consolidated Design System Tokens)


--- (1803-1804 lines) ---
      * **工作流结构动态更新 (Layout Animations - 关键):** 详见 5.2.3。
      * 版本切换与 Staleness 传播动画（Badge movement, Pulse indicator）：详见 5.2.4。

</design_doc>

<api>
--- (847-866 lines) ---

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



--- (884-886 lines) ---
*   **动态结构**: 工作流的结构并非完全静态。当一个 `node_type` 为 `Generator` 的节点执行完成后，它会向当前工作流中**动态插入**一系列新的节点。
    *   **前端关键**: 必须监听 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件。收到此事件后，应立即废弃本地的工作流结构缓存，并调用 `GET /workflows/{workflow_id}` 重新获取完整的 `phases` 树来刷新视图。



--- (1001-1080 lines) ---
#### 2.1. 获取工作流详细信息

获取指定工作流的完整信息，是加载和刷新工作流画布页面的核心 API。

*   **Endpoint**: `GET /workflows/{workflow_id}`
*   **权限**: 工作流所有者。

##### 路径参数
*   `workflow_id` (integer, **required**): 要查询的工作流实例的唯一ID。

##### 成功响应 (`200 OK`)
返回 `WorkflowInstanceRead` 对象，包含最新的 `phases` 树（每个阶段下有若干 Stage 和节点列表）。**[重要变化]** 每个节点对象现在都包含一个 `is_stale` 布尔标志。
```jsonc
{
  "id": 1,
  "name": "Updated Workflow Name",
  "status": "Running",
  "project_id": 12,
  "user_id": 1,
  "phases": [
    {
      "name": "Phase 1: Strategic Analysis & Macro Architecture",
      "stages": [
        {
          "id": "1.1",
          "name": "Strategic Definition",
          "nodes": [
            {
              "id": 101,
              "definition_id": "1.1.1",
              "name": "Problem Deconstruction and Mathematical Formulation",
              "status": "Completed",
              "stage_id": "1.1",
              "stage_name": "Strategic Definition",
              "is_stale": false // [新增] 依赖未变
            },
            {
              "id": 102,
              "name": "Node B (depends on A)",
              "status": "Completed",
              "is_stale": true // [新增] Node A 版本更新后，Node B 变为过时
            }
          ]
        }
      ]
    },
    {
      "name": "Phase 2: Cyclic Sub-problem Execution",
      "stages": [
        {
          "id": "Task_A1.2.1",
          "name": "[Task_A1] Data & Model Generation",
          "nodes": [
            {
              "id": 201,
              "definition_id": "Task_A1.2.1.1",
              "name": "[Task_A1] Data Insights and Candidate Model Generation",
              "stage_id": "Task_A1.2.1",
              "stage_name": "[Task_A1] Data & Model Generation",
              "status": "Executing",
              "is_stale": false
            }
          ]
        }
      ]
    }
  ]
}
```

##### 错误响应
*   `401 Unauthorized`: 认证失败。
*   `403 Forbidden`: 用户无权访问该工作流。
*   `404 Not Found`: 指定的 `workflow_id` 不存在。

##### > 前端实现要点
> *   在进入工作流页面时首次调用此接口。
> *   当收到 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件时，必须调用此接口以获取全新的 `phases` 树并重新渲染。
> *   **[新增]** 在渲染节点时，检查 `node.is_stale` 标志。如果为 `true`，应在节点上显示一个明确的视觉指示器（如警告图标或虚线边框）。



--- (1149-1161 lines) ---
#### 4.1. WorkflowInstanceRead

表示一个工作流实例的完整信息，包含完整的 `Phase -> Stage -> Node` 层级结构。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 工作流实例的唯一标识符。 |
| `name` | string | 工作流的名称。 |
| `status` | string (enum) | 工作流的当前状态。可选值: `"Running"`, `"Completed"`。 |
| `project_id` | integer | 所属项目的 ID。 |
| `user_id` | integer | 所属用户的 ID。 |
| `phases` | array (PhaseRead) | 工作流的阶段数组，每个 Phase 内含多个 Stage，Stage 再包含节点列表。 |



--- (1507-1510 lines) ---
*   **重要影响**:
    *   此操作仅改变节点的 `active_version`，但**不会**自动重新执行任何下游节点。用户需自行决定是否基于此旧版本的结果去手动重新执行下游节点。
    *   **[新增]** 操作成功后，会广播一个 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。前端应监听此事件，并重新获取工作流的过时信息 (`is_stale` 标志) 以更新UI。


</api>

<front_stack>
--- (26-31 lines) ---
### 三、 客户端-服务器通信

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
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


--- (163-171 lines) ---
#### 3. API 通信与数据处理模式

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **模拟流式响应 (`chatReplayStream`)** | `core/api/chat.ts` 中的 `chatReplayStream` 函数是一个极具价值的工具。它能够读取静态文本文件，并**模拟**一个实时的 SSE 流，甚至可以控制快进。这对于开发、调试、演示和编写测试用例都非常有用。 |
| **健壮的 JSON 解析 (`parseJSON`)** | 位于 `core/utils/json.ts`，这个工具函数使用 `best-effort-json-parser` 并结合自定义逻辑来处理来自 LLM 的、可能不完全合规的 JSON 字符串（例如，后面跟着多余的文本）。这对于与大语言模型交互的应用来说至关重要。 |
| **Markdown 预处理** | `core/utils/markdown.ts` 提供了一系列用于清理和规范化 Markdown 文本的函数，特别是 `normalizeMathForEditor` 和 `unescapeLatexInMath`，它们解决了在富文本编辑器中正确处理 LaTeX 数学公式的痛点。 |
| **统一的 API URL 解析** | `core/api/resolve-service-url.ts` 中的 `resolveServiceURL` 函数确保了所有对后端服务的请求都通过一个统一的函数来构建 URL，便于管理和切换 API 基地址。 |



--- (199-208 lines) ---

项目的目录结构和代码组织方式遵循了现代大型前端应用的**最佳实践**，非常值得借鉴。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **功能切片 (Feature-Sliced) 路由** | `app/` 目录下的结构（如 `app/chat/`, `app/landing/`, `app/settings/`）体现了按功能组织代码的原则。每个功能模块都是一个独立的单元，包含了自身的页面、组件和逻辑，使得项目结构清晰，易于扩展和维护。 |
| **组件分层** | 项目中的 `components/` 目录被清晰地划分为三层：<br>1. **`ui/`**: 基础 UI 组件，源自 Shadcn/ui，是应用的视觉基石。<br>2. **`deer-flow/`**: 应用级的共享组件，如 `Logo`, `Markdown`, `Tooltip` 等。它们封装了通用逻辑，在多个功能模块中复用。<br>3. **`magicui/`**: 高度定制化的视觉特效组件，与业务逻辑解耦，可轻松移植到任何项目中。 |
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |
| **自定义 Hooks 封装** | `hooks/` 目录提供了可复用的 React Hooks，如 `useIntersectionObserver` 和 `useIsMobile`。它们将复杂的浏览器 API 或重复的逻辑封装成简单易用的钩子，简化了组件代码。 |



--- (229-238 lines) ---
### 十viii、 鲁棒性与回退策略

项目在代码中体现了防御性编程的思想，确保在各种异常情况下应用依然能稳定运行。

| 策略/模式 | 描述与复用价值 |
| :--- | :--- |
| **API 请求重试与超时** | `core/api/hooks.ts` 中的 `useConfig` Hook 在 `fetch` 配置时，不仅设置了超时 (`AbortSignal.timeout`)，还实现了带有指数退避 (exponential backoff) 的重试逻辑。这显著提高了应用在网络不佳情况下的稳定性。 |
| **组件级错误回退** | `components/deer-flow/fav-icon.tsx` 组件的 `img` 标签上使用了 `onError` 事件处理器。当网站图标加载失败时，它会自动切换到一个通用的备用图标，避免了在 UI 上显示破碎的图片。 |
| **环境驱动的逻辑切换** | `env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY` 环境变量在多个地方被用作开关，以改变应用的行为。例如，`chatStream` 会根据此变量决定是调用真实的 API 还是模拟的 `chatReplayStream`。这使得同一套代码库可以轻松地部署为功能完整的动态应用或纯静态的演示网站。 |
| **容错数据解析** | `core/utils/json.ts` 中的 `parseJSON` 函数在解析失败时不会直接抛出错误，而是会返回一个预设的 `fallback` 值。这使得即使 LLM 返回的 JSON 格式稍有瑕疵，UI 也不会因此崩溃。 |


--- (242-251 lines) ---
项目在多个层面都考虑了性能，确保了应用的响应速度和流畅性。

| 实践/技术 | 描述与复用价值 |
| :--- | :--- |
| **代码分割 (Code Splitting)** | 使用 `next/dynamic` 对大型或非首屏必要的组件进行懒加载。在 `app/chat/page.tsx` 中，核心的 `Main` 组件就是动态导入的，并提供了一个 `loading` 状态。这显著减小了初始页面的 JavaScript 包体积，加快了页面的可交互时间。 |
| **组件级 Memoization** | **`React.memo`**: 对于 props 不经常变化的纯展示组件，项目使用了 `React.memo` 进行包裹。例如，在 `app/chat/components/research-activities-block.tsx` 中，`ActivityMessage` 和 `ActivityListItem` 都被 `React.memo` 优化，防止在父组件重渲染时不必要地重新渲染整个活动列表。 <br>**`useMemo` / `useCallback`**: 在整个代码库中广泛使用 `useMemo` 来缓存计算结果（如 `app/chat/main.tsx` 中的 `doubleColumnMode`），以及使用 `useCallback` 来缓存事件处理器（如 `app/chat/components/input-box.tsx` 中的 `handleSendMessage`），避免了子组件因函数引用变化而导致的无效渲染。 |
| **有限动画策略** | 在渲染长列表时，并非所有项都需要动画。`app/chat/components/research-activities-block.tsx` 中实现了一个聪明的策略：定义一个 `MAX_ANIMATED_ITEMS` 常量，只对前 N 个新加载的列表项应用 `framer-motion` 动画，而后续项则直接渲染。这在保证视觉效果的同时，极大地降低了大量 DOM 元素同时动画带来的性能开销。 |
| **状态更新批处理** | `core/store/store.ts` 中的 `sendMessage` 函数在处理 SSE 流时，并没有在每次收到 `chunk` 时都立即调用 `setState`，而是将待更新的消息放入一个 `pendingUpdates` Map 中，并通过 `setTimeout` 进行批处理。这种“去抖”或“批处理”的模式，将一秒内可能发生的数十次状态更新合并为少数几次，极大地减少了 React 的渲染次数，是流式应用性能优化的关键。 |
| **虚拟滚动** (潜在) | 虽然当前代码中没有明确实现虚拟滚动，但项目的组件化结构（如 `MessageListView`）非常适合集成 `react-window` 或 `tanstack-virtual` 等库。对于需要处理成千上万条消息的场景，这是下一步性能优化的明确方向。 |


</front_stack>

<deer_flow_frontend_code>
--- (100-449 lines) ---
### core/websocket/manager.ts Content:

```ts
import { toast } from "sonner";
import { type Unsubscribe } from "zustand";

import { type EventPayload } from "~/core/models/events.model";
import { useStore } from "~/core/store";
import { ConnectionStatus } from "~/core/store/slices/connection-status.slice";
import { sleep } from "~/core/utils/time";

import { calculateBackoffDelay } from "./backoff";
import { dispatchEvent } from "./dispatcher";
import { resolveWebSocketURL } from "./resolve-ws-url";

const WS_CLOSE_CODE = {
  NORMAL_CLOSURE: 1000,
  AUTH_FAILED: 4001,
  AUTH_FORBIDDEN: 4003,
} as const;

const RECONNECT_CONFIG = {
  BASE_DELAY: 1000,
  MAX_DELAY: 30000,
  MAX_ATTEMPTS: 10,
} as const;

class WebSocketManager {
  private socket: WebSocket | null = null;
  private workflowId: number | null = null;
  private token: string | null = null;

  private reconnectAttempts = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private tokenUnsubscribe: Unsubscribe | null = null;
  private intentionalDisconnect = false;

  constructor() {
    this.initializeTokenSubscription();
  }

  private initializeTokenSubscription() {
    this.tokenUnsubscribe = useStore.subscribe(
      (state) => state.token,
      (newToken, oldToken) => {
        if (newToken !== oldToken) {
          this.handleTokenChange(newToken);
        }
      },
    );
  }

  private handleTokenChange(newToken: string | null) {
    this.token = newToken;
    const isSubscribed = useStore.getState().isSubscribed;

    if (isSubscribed && newToken) {
      console.log("WebSocketManager: Token updated. Forcing reconnection...");
      void this.reconnect(true);
    } else if (!newToken && isSubscribed) {
      console.log("WebSocketManager: Token removed (logout). Disconnecting.");
      this.disconnect();
    }
  }

  public connect(workflowId: number) {
    if (
      this.workflowId === workflowId &&
      (this.socket || this.reconnectTimeoutId)
    ) {
      console.log(
        `WebSocketManager: Already connected or connecting to workflow ${workflowId}.`,
      );
      return;
    }

    if (this.workflowId !== workflowId && this.workflowId !== null) {
      this.disconnect();
    }

    this.workflowId = workflowId;
    this.intentionalDisconnect = false;
    this.token = useStore.getState().token;

    useStore.getState().setSubscribed(true);

    if (!this.token) {
      console.error(
        "WebSocketManager: Cannot connect without an authentication token.",
      );
      useStore
        .getState()
        .logout(true, "Authentication required for real-time updates.");
      this.updateStatus(ConnectionStatus.Error);
      return;
    }

    this.createSocketConnection();
  }

  private createSocketConnection() {
    if (!this.workflowId || !this.token || this.intentionalDisconnect) return;

    const path = `/ws/${this.workflowId}?token=${this.token}`;

    try {
      const url = resolveWebSocketURL(path);

      console.log(
        `WebSocketManager: Connecting to ${url.split("?token=")[0]}...`,
      );
      this.updateStatus(
        this.reconnectAttempts > 0
          ? ConnectionStatus.Reconnecting
          : ConnectionStatus.Connecting,
      );

      this.socket = new WebSocket(url);
      this.socket.onopen = this.onOpen;
      this.socket.onmessage = this.onMessage;
      this.socket.onerror = this.onError;
      this.socket.onclose = this.onClose;
    } catch (error) {
      console.error(
        "WebSocketManager: Failed to initialize WebSocket (e.g., URL resolution error):",
        error,
      );
      this.socket = null;
      this.updateStatus(ConnectionStatus.Error);
      toast.error("Connection Initialization Failed", {
        description:
          "Could not configure the real-time connection. Please check settings.",
      });
    }
  }

  public disconnect() {
    this.intentionalDisconnect = true;
    this.cleanupReconnection();
    this.workflowId = null;

    if (this.socket) {
      console.log("WebSocketManager: Disconnecting...");
      this.socket.close(WS_CLOSE_CODE.NORMAL_CLOSURE);
      this.socket = null;
    }

    useStore.getState().resetWsState();
  }

  private onOpen = () => {
    console.log("WebSocketManager: Connection established.");
    this.reconnectAttempts = 0;
    this.updateStatus(ConnectionStatus.Connected);
    this.synchronizeWorkflowState();
  };

  private onMessage = (event: MessageEvent) => {
    const { isLoading, isSyncing } = useStore.getState();
    if (isLoading || isSyncing) {
      console.log("WebSocketManager: Ignoring message during synchronization.");
      return;
    }

    try {
      const payload = JSON.parse(event.data) as EventPayload;
      dispatchEvent(payload);
    } catch (error) {
      console.error(
        "WebSocketManager: Error processing message:",
        event.data,
        error,
      );
    }
  };

  private onError = (event: Event) => {
    console.error("WebSocketManager: Connection error:", event);
  };

  private onClose = (event: CloseEvent) => {
    console.log(
      `WebSocketManager: Connection closed. Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`,
    );

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      this.socket = null;
    }

    if (this.handleSpecificCloseCodes(event.code)) {
      return;
    }

    if (!this.intentionalDisconnect) {
      this.attemptReconnect();
    } else if (useStore.getState().wsStatus !== ConnectionStatus.Error) {
      this.updateStatus(ConnectionStatus.Disconnected);
    }
  };

  private handleSpecificCloseCodes(code: number): boolean {
    switch (code) {
      case WS_CLOSE_CODE.NORMAL_CLOSURE:
        return false;

      case WS_CLOSE_CODE.AUTH_FAILED:
        console.error(
          "WebSocketManager: Authentication failed (4001). Logging out.",
        );
        this.intentionalDisconnect = true;
        this.updateStatus(ConnectionStatus.Error);
        useStore
          .getState()
          .logout(
            true,
            "WebSocket authentication failed. Please log in again.",
          );
        return true;

      case WS_CLOSE_CODE.AUTH_FORBIDDEN:
        console.error("WebSocketManager: Authorization failed (4003).");
        this.intentionalDisconnect = true;
        this.updateStatus(ConnectionStatus.Error);
        toast.error("Access Denied", {
          description:
            "You do not have permission to access this workflow.",
        });
        return true;

      default:
        return false;
    }
  }

  private attemptReconnect() {
    if (this.intentionalDisconnect || this.reconnectTimeoutId) return;

    if (this.reconnectAttempts >= RECONNECT_CONFIG.MAX_ATTEMPTS) {
      console.error(
        "WebSocketManager: Maximum reconnection attempts reached. Giving up.",
      );
      toast.error("Connection Lost", {
        description:
          "Unable to re-establish real-time connection. Please check your network and refresh the page.",
        duration: 10000,
      });
      this.updateStatus(ConnectionStatus.Error);
      this.disconnect();
      return;
    }

    this.reconnectAttempts++;
    this.updateStatus(ConnectionStatus.Reconnecting);

    const delay = calculateBackoffDelay(
      this.reconnectAttempts,
      RECONNECT_CONFIG.BASE_DELAY,
      RECONNECT_CONFIG.MAX_DELAY,
    );

    console.log(
      `WebSocketManager: Attempting to reconnect (Attempt ${this.reconnectAttempts}) in ${delay}ms...`,
    );

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectTimeoutId = null;
      this.createSocketConnection();
    }, delay);
  }

  public async reconnect(immediate = false) {
    if (!this.workflowId) return;

    this.cleanupReconnection();

    if (this.socket) {
      const prevIntentional = this.intentionalDisconnect;
      this.intentionalDisconnect = true;
      this.socket.close(
        WS_CLOSE_CODE.NORMAL_CLOSURE,
        "Forced Reconnect (e.g. Token Refresh)",
      );
      this.intentionalDisconnect = prevIntentional;
    }

    this.updateStatus(ConnectionStatus.Reconnecting);

    if (!immediate) {
      await sleep(500);
    }

    this.reconnectAttempts = 0;
    this.createSocketConnection();
  }

  private cleanupReconnection() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  private synchronizeWorkflowState() {
    if (!this.workflowId) return;

    console.log(
      "WebSocketManager: Connection (re)established. Triggering full workflow synchronization (REST as Source of Truth)...",
    );
    useStore
      .getState()
      .loadWorkflow(this.workflowId)
      .catch((error) => {
        console.error(
          "WebSocketManager: Failed to synchronize state after reconnection:",
          error,
        );
        toast.error("Synchronization Failed", {
          description:
            "Could not synchronize workflow state. Data might be outdated.",
        });
      });
  }

  private updateStatus(status: ConnectionStatus) {
    const { isSubscribed } = useStore.getState();
    if (
      isSubscribed ||
      status === ConnectionStatus.Disconnected ||
      status === ConnectionStatus.Error
    ) {
      useStore.getState().setWsStatus(status);
    }
  }

  public destroy() {
    this.disconnect();
    if (this.tokenUnsubscribe) {
      this.tokenUnsubscribe();
      this.tokenUnsubscribe = null;
    }
  }
}

export const webSocketManager = new WebSocketManager();

```


--- (520-556 lines) ---
### core/websocket/dispatcher.ts Content:

```ts
import { EventType, type EventPayload } from "~/core/models/events.model";
import { useStore } from "~/core/store";

export function dispatchEvent(payload: EventPayload): void {
  const store = useStore.getState();
  const { event_type, workflow_id } = payload;

  if (store.workflowInstance?.id !== workflow_id) {
    console.warn(
      `Dispatcher: Received event for workflow ${workflow_id} but current workflow is ${store.workflowInstance?.id}. Ignoring.`,
    );
    return;
  }

  switch (event_type) {
    case EventType.NodeStatusUpdated:
      store.handleNodeStatusUpdated(payload.data);
      break;

    case EventType.NodeActiveVersionChanged:
      void store.handleNodeActiveVersionChanged(payload.data);
      break;

    case EventType.WorkflowStructureUpdated:
      store.handleWorkflowStructureUpdated(payload.data);
      break;

    case EventType.WorkflowStatusUpdated:
      store.handleWorkflowStatusUpdated(payload.data);
      break;
  }
}

```


--- (1084-1133 lines) ---
### core/models/events.model.ts Content:

```ts
import type { NodeInstanceRead, WorkflowInstanceRead } from "./workflow.model";

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

export type WorkflowStructureUpdatedPayload = BaseEventPayload & {
  event_type: EventType.WorkflowStructureUpdated;
  data: WorkflowInstanceRead;
  node_id: null;
};

export type WorkflowStatusUpdatedPayload = BaseEventPayload & {
  event_type: EventType.WorkflowStatusUpdated;
  data: WorkflowInstanceRead;
  node_id: null;
};

export type EventPayload =
  | NodeStatusUpdatedPayload
  | NodeActiveVersionChangedPayload
  | WorkflowStructureUpdatedPayload
  | WorkflowStatusUpdatedPayload;

```


--- (1406-1521 lines) ---
### core/models/workflow.model.ts Content:

```ts
import { z } from "zod";

import {
  ExecutionStageEnum,
  HITLModeEnum,
  NodeStatusEnum,
  NodeTypeEnum,
  WorkflowStatusEnum,
} from "~/constants/enums";

// --- Core Component Models (The building blocks) ---

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

// API 4.4.3: StageRead
export const StageReadSchema = z.object({
  id: z.string(),
  name: z.string(),
  nodes: z.array(NodeInstanceReadSchema),
});
export type StageRead = z.infer<typeof StageReadSchema>;

// API 4.4.2: PhaseRead
export const PhaseReadSchema = z.object({
  name: z.string(),
  stages: z.array(StageReadSchema),
});
export type PhaseRead = z.infer<typeof PhaseReadSchema>;

// --- Workflow Instance Models ---

// API 4.1.2: WorkflowSummaryRead (Lightweight version for lists)
export const WorkflowSummaryReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: WorkflowStatusEnum,
  project_id: z.number().int(),
  user_id: z.number().int(),
  // API 4.1.2 example includes created_at
  created_at: z.string().datetime().optional(),
});
export type WorkflowSummaryRead = z.infer<typeof WorkflowSummaryReadSchema>;

// API 4.4.1: WorkflowInstanceRead (The complete workflow structure and state)
export const WorkflowInstanceReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: WorkflowStatusEnum,
  project_id: z.number().int(),
  user_id: z.number().int(),
  phases: z.array(PhaseReadSchema),
});

export type WorkflowInstanceRead = z.infer<typeof WorkflowInstanceReadSchema>;

// --- Utility Models ---

// API 4.4.4: StalenessInfo (Details on why a node is stale)
export const StalenessInfoSchema = z.object({
  upstream_node_id: z.number().int(),
  upstream_definition_id: z.string(),
  consumed_version_id: z.number().int(),
  current_active_version_id: z.number().int().nullable(),
});
export type StalenessInfo = z.infer<typeof StalenessInfoSchema>;

// API 4.3.1: Workflow Staleness Report (Map<NodeId, StalenessInfo[]>)
export const WorkflowStalenessReportSchema = z.record(
  z.string(), // Node ID (as string key in JSON object)
  z.array(StalenessInfoSchema),
);
export type WorkflowStalenessReport = z.infer<
  typeof WorkflowStalenessReportSchema
>;

// --- Create/Update Models (Requests) ---

// API 4.1.1: WorkflowCreate
export const WorkflowCreateSchema = z.object({
  name: z.string().min(1, "Workflow name is required."),
  project_id: z.number().int(),
});
export type WorkflowCreate = z.infer<typeof WorkflowCreateSchema>;

// API 4.2.2: WorkflowUpdate (PATCH request)
export const WorkflowUpdateSchema = z.object({
  name: z.string().min(1, "Workflow name is required.").optional(),
});
export type WorkflowUpdate = z.infer<typeof WorkflowUpdateSchema>;

```


--- (1690-1722 lines) ---
### core/hooks/use-workflow-connection.ts Content:

```ts
import { useEffect } from "react";

import { useStore } from "~/core/store";
import { webSocketManager } from "~/core/websocket/manager";

export function useWorkflowConnection(
  workflowId: number | null | undefined,
): void {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (workflowId && isAuthenticated) {
      console.log(
        `[useWorkflowConnection] Mounting for workflow ${workflowId}. Initiating connection.`,
      );
      webSocketManager.connect(workflowId);
    }

    return () => {
      if (workflowId && isAuthenticated) {
        console.log(
          `[useWorkflowConnection] Unmounting or changing context. Disconnecting workflow ${workflowId}.`,
        );
        webSocketManager.disconnect();
      }
    };
  }, [workflowId, isAuthenticated]);
}

```


--- (2662-2784 lines) ---
### core/api/workflow.service.ts Content:

```ts
import { AxiosError } from "axios";

import type { PaginatedResponse } from "~/core/models/common.model";
import type {
  WorkflowCreate,
  WorkflowInstanceRead,
  WorkflowStalenessReport,
  WorkflowSummaryRead,
  WorkflowUpdate,
} from "~/core/models/workflow.model";

import apiClient from "./client";

/**
 * API Service for Workflow Management (API 4).
 */
export const WorkflowService = {
  // --- 1. Workflow Lifecycle Management (API 4.1) ---

  /**
   * Gets the list of workflows for the current user (API 4.1.2).
   */
  getWorkflows: async (
    skip = 0,
    limit = 20,
  ): Promise<PaginatedResponse<WorkflowSummaryRead>> => {
    const response = await apiClient.get<
      PaginatedResponse<WorkflowSummaryRead>
    >("/workflows/", {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Creates a new workflow instance (API 4.1.1).
   * Note: Primary flow uses ProjectService.startWorkflow (API 3.3.1).
   */
  createWorkflow: async (
    data: WorkflowCreate,
  ): Promise<WorkflowInstanceRead> => {
    try {
      // Expect 201 Created
      const response = await apiClient.post<WorkflowInstanceRead>(
        "/workflows/",
        data,
        {
          validateStatus: (status) => status === 201,
        },
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (WORKFLOW_ALREADY_EXISTS)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("WORKFLOW_ALREADY_EXISTS");
      }
      throw error;
    }
  },

  // --- 2. Single Workflow Operations & Query (API 4.2) ---

  /**
   * Gets the detailed information (full structure) of a specific workflow (API 4.2.1).
   * Core API for loading/refreshing the workflow canvas (Architecture 5.3.1).
   */
  getWorkflowById: async (workflowId: number): Promise<WorkflowInstanceRead> => {
    const response = await apiClient.get<WorkflowInstanceRead>(
      `/workflows/${workflowId}`,
    );
    return response.data;
  },

  /**
   * Updates a workflow's basic information (API 4.2.2).
   */
  updateWorkflow: async (
    workflowId: number,
    data: WorkflowUpdate,
  ): Promise<WorkflowInstanceRead> => {
    const response = await apiClient.patch<WorkflowInstanceRead>(
      `/workflows/${workflowId}`,
      data,
    );
    return response.data;
  },

  /**
   * Deletes a workflow instance (API 4.2.3).
   */
  deleteWorkflow: async (workflowId: number): Promise<void> => {
    try {
      // Expect 204 No Content
      await apiClient.delete(`/workflows/${workflowId}`, {
        validateStatus: (status) => status === 204,
      });
    } catch (error) {
      // Handle 409 Conflict (WORKFLOW_IS_ACTIVE)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("WORKFLOW_IS_ACTIVE");
      }
      throw error;
    }
  },

  // --- 3. Workflow State Insights (API 4.3) ---

  /**
   * Gets the detailed staleness report for all nodes (API 4.3.1).
   */
  getWorkflowStaleness: async (
    workflowId: number,
  ): Promise<WorkflowStalenessReport> => {
    const response = await apiClient.get<WorkflowStalenessReport>(
      `/workflows/${workflowId}/staleness`,
    );
    return response.data;
  },
};



--- (2808-2865 lines) ---
### core/store/index.ts Content:

```ts
import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

import { createAuthSlice, type AuthSlice } from "./slices/auth.slice";
import {
  createConnectionStatusSlice,
  type ConnectionStatusSlice,
} from "./slices/connection-status.slice";
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
  UIInteractionSlice &
  ConnectionStatusSlice;

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
      ...createConnectionStatusSlice(set, get, api),
    }),
    { name: "O-Award-Store" }, // Name for Redux DevTools
  ),
);

```


--- (2957-3398 lines) ---
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
      return get().nodeDetailsCache.get(nodeId) ?? null;
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


--- (3879-3921 lines) ---
### core/store/slices/connection-status.slice.ts Content:

```ts
import { type SliceCreator } from "~/core/store";

export enum ConnectionStatus {
  Disconnected = "DISCONNECTED",
  Connecting = "CONNECTING",
  Connected = "CONNECTED",
  Reconnecting = "RECONNECTING",
  Error = "ERROR",
}

export interface ConnectionStatusSlice {
  wsStatus: ConnectionStatus;
  isSubscribed: boolean;
  setWsStatus: (status: ConnectionStatus) => void;
  setSubscribed: (isSubscribed: boolean) => void;
  resetWsState: () => void;
}

export const createConnectionStatusSlice: SliceCreator<ConnectionStatusSlice> = (
  set,
) => ({
  wsStatus: ConnectionStatus.Disconnected,
  isSubscribed: false,

  setWsStatus: (status) => {
    set({ wsStatus: status });
  },

  setSubscribed: (isSubscribed) => {
    set({ isSubscribed });
  },

  resetWsState: () => {
    set({
      wsStatus: ConnectionStatus.Disconnected,
      isSubscribed: false,
    });
  },
});



--- (6714-6795 lines) ---
  const {
    currentProject,
    isLoadingProjectDetail,
    loadProjectDetail,
    clearCurrentProject,
    workflowInstance,
    workflowIsLoading,
    workflowIsSyncing,
    loadWorkflow,
  } = useStore(
    useShallow((state) => ({
      currentProject: state.currentProject,
      isLoadingProjectDetail: state.isLoadingProjectDetail,
      loadProjectDetail: state.loadProjectDetail,
      clearCurrentProject: state.clearCurrentProject,
      workflowInstance: state.workflowInstance,
      workflowIsLoading: state.isLoading,
      workflowIsSyncing: state.isSyncing,
      loadWorkflow: state.loadWorkflow,
    })),
  );

  const [projectError, setProjectError] = useState<string | null>(null);
  const [isWorkflowRefreshing, setIsWorkflowRefreshing] = useState(false);
  const hasRequestedWorkflow = useRef(false);

  const fetchProject = useCallback(async () => {
    setProjectError(null);
    const project = await loadProjectDetail(projectId);
    if (!project) {
      setProjectError(
        "We couldn't load this project. It may have been deleted or you may not have access.",
      );
    }
  }, [loadProjectDetail, projectId]);

  useEffect(() => {
    void fetchProject();
    return () => {
      clearCurrentProject();
      hasRequestedWorkflow.current = false;
    };
  }, [clearCurrentProject, fetchProject]);

  const workflowId = currentProject?.workflow_instance_id ?? null;
  useWorkflowConnection(workflowId);

  useEffect(() => {
    if (!workflowId) {
      hasRequestedWorkflow.current = false;
      return;
    }
    if (hasRequestedWorkflow.current) return;
    hasRequestedWorkflow.current = true;
    void loadWorkflow(workflowId);
  }, [workflowId, loadWorkflow]);

  const workflowMetrics = useMemo(() => {
    if (!workflowInstance) return null;
    const phaseCount = workflowInstance.phases.length;
    const nodeCount = workflowInstance.phases.reduce((phaseTotal, phase) => {
      return (
        phaseTotal +
        phase.stages.reduce(
          (stageTotal, stage) => stageTotal + stage.nodes.length,
          0,
        )
      );
    }, 0);
    return { phaseCount, nodeCount };
  }, [workflowInstance]);

  const handleWorkflowRefresh = useCallback(async () => {
    if (!workflowId) return;
    setIsWorkflowRefreshing(true);
    try {
      await loadWorkflow(workflowId);
    } finally {
      setIsWorkflowRefreshing(false);
    }
  }, [loadWorkflow, workflowId]);


</deer_flow_frontend_code>

<architecture>
--- (13-13 lines) ---
1.  **复杂状态同步与实时性**: 精确管理工作流结构、节点状态、版本信息和实时执行进度，确保数据一致性。


--- (21-22 lines) ---
2.  **明确的数据同步范式**: 严格遵守 API 6.1 原则——**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新**。在连接恢复和关键事件后执行全量同步。
3.  **关注点分离**: 采用分层架构（UI 层、状态管理层、API 服务层），实现业务逻辑与 UI 的解耦。


--- (64-64 lines) ---
  * **WebSocket API (或 socket.io-client)**: 用于实时通信。


--- (176-178 lines) ---
├── /websocket/         # WebSocket 管理
│   ├── manager.ts      # 连接管理 (重连、认证)
│   └── dispatcher.ts   # 事件分发到 Zustand


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



--- (488-489 lines) ---
      * **[关键实现]** 弹出确认对话框，明确告知后果（非级联更新，Staleness）（设计文档 3.1.1.C.2）。
      * 调用 API，然后等待 WebSocket 事件触发全局同步（详见 5.3.4）。


--- (549-549 lines) ---
  * **WebSocket 错误**: 实现连接状态反馈（横幅）和重连逻辑。


--- (564-565 lines) ---
5.  **状态更新批处理**: 在处理高频 WebSocket 事件时，考虑使用批处理技术（如 `setTimeout` 或 React 18 的 `startTransition`）合并状态更新，减少渲染次数。



--- (573-573 lines) ---
  * **重点**: 核心工具函数 (`core/utils`)，Zustand Store 的 Actions 和 Selectors（特别是 `WorkflowSlice` 的复杂同步逻辑）。


--- (583-583 lines) ---
  * **重点**: 核心用户旅程：项目创建 -\> 工作流启动 -\> HITL 审批 -\> 版本切换 -\> Staleness 处理 -\> 重新执行。测试实时同步的正确性。

</architecture>



---

<task>


### 任务 9：核心同步范式实现（REST/WS 集成与事件分发）

**目标：** 实现核心数据同步范式（REST 为主，WS 为辅），将 WebSocket 事件正确分发到 `WorkflowSlice`，确保前端状态与后端保持一致。

**核心关注点：** 数据一致性、事件处理逻辑（增量 vs 全量）、重连后同步、Staleness 同步触发。

**实现策略（参考 `<architecture> 5.3`, `<api> 6.1, 6.5`）：**

1.  **事件分发器实现（`src/core/websocket/dispatcher.ts` 新建）：**
    *   实现 `EventDispatcher`，接收来自 `WebSocketManager` 的原始消息。
    *   解析 `EventPayload`（`<api> 6.4.1`）。
    *   根据 `event_type` 调用 `WorkflowSlice` 中对应的 Action。
2.  **WorkflowSlice 事件处理实现（填充任务 4 的骨架）：**
    *   **`handleNodeStatusUpdated`（增量更新）：** 更新 `nodesById`，并以不可变方式更新 `workflowInstance.phases` 树（确保 React 能检测到变化）。
    *   **`handleWorkflowStructureUpdated`（全量替换，关键实现）：** 使用事件负载完全替换 `workflowInstance`，并调用 `_normalizeData` 重建索引。
3.  **全量同步触发机制（关键实现）：**
    *   **`handleNodeActiveVersionChanged`：** 更新节点数据后，**必须**立即调用 `loadWorkflow()` 触发全量 REST 同步，以刷新全局 `is_stale` 标志（`<api> 6.5.2`）。
    *   **重连后同步：** 在 `WebSocketManager.onOpen`（重连成功后）处理器中，调用 `loadWorkflow()` 进行全量同步（`<api> 6.1.1`）。

**输入：** 任务 4 和 8 的输出（WorkflowSlice 结构、WebSocketManager）, `<api> 6.1, 6.4, 6.5`, `<architecture> 5.3`。
**输出：** 实现了核心同步逻辑，确保前端状态能够实时、一致地响应后端变化。


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
