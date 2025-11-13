<design_doc>
--- (106-107 lines) ---
| W3.1 | 动态结构实例化 (Generator Node) | Generator 节点执行完毕后，动态插入子任务节点链。 | SRS 2.2 | P0 |
| W3.2 | Generator Node 执行限制 | Generator 节点不允许重新运行，以保证流程一致性。 | SRS 2.3 | P0 |


--- (143-143 lines) ---
| N1.2 | 动态结构可视化 | 可视化工具必须能够动态展示 Generator 节点生成的结构。 | FRS 5.1 | P0 |


--- (149-149 lines) ---
| R1.2 | 实时事件处理 | 客户端处理 `NODE_STATUS_UPDATED`, `WORKFLOW_STRUCTURE_UPDATED`, `NODE_ACTIVE_VERSION_CHANGED` 等事件。 | API 6.5 | P1 |


--- (220-223 lines) ---
5.  **极致流畅性与动效 (Extreme Fluidity and Motion):**
    *   动效不是装饰，而是传达信息和提升体验的关键工具。动效应是高性能、精确且富有物理感的（利用 Framer Motion）。
    *   动效必须快速、干脆，体现出系统的响应速度和专业品质。用于增强交互的流畅感、传达状态变化，而非装饰。



--- (379-391 lines) ---
##### A. 左侧栏：工作流导航器 (Workflow Navigator - The Map)

  * **目标:** 提供全局工作流结构概览、实时状态监控和快速导航。
  * **结构:** 采用高密度的**层级树状视图 (Hierarchical Tree View)**，映射 `Phase -> Stage -> Node` 层级。
  * **节点展示关键信息:**
    1.  **Status Icon:** 实时状态图标（✅, ⚙️ (Animated), ⏳, ❌, 🛑, ◯）。
    2.  **Node Identifier and Name.**
    3.  **Staleness Indicator (⚠️):** 如果 `is_stale: true`，则显示清晰的警告图标。
  * **交互逻辑:**
      * 点击可访问节点加载到 Workspace (B)。
      * **Execution Frontier:** 尚未执行的未来节点视觉上禁用且不可点击 (SRS 5.2)。
      * **Dynamic Updates:** 当收到 `WORKFLOW_STRUCTURE_UPDATED` 事件时，此树结构会动态刷新。



--- (521-539 lines) ---
#### 2.3.4 任务流 4：处理动态工作流结构更新 (Task Flow: Handling Dynamic Structure Updates)

**场景:** 一个 `Generator` 节点（例如 1.1.2）被批准，导致工作流结构动态变化。

**流程:**

1.  **Generator 节点批准:** 用户完成 Generator 节点的 HITL 审批（参见 2.3.1）。
2.  **系统处理结构变更 (后端):**
      * 后端根据 Generator 节点的输出，动态创建新的 NodeInstance 记录，并插入到工作流序列中。
3.  **系统广播结构更新 (WebSocket - 关键):**
      * 后端广播 `WORKFLOW_STRUCTURE_UPDATED` 事件。负载包含**全新且完整**的 `WorkflowInstanceRead` 对象。
4.  **前端响应与状态同步 (关键):**
      * 前端监听到此事件。
      * **全量替换:** 前端（Zustand Workflow Store）必须立即丢弃当前的 `phases` 结构，并用事件负载中的新数据进行**全量替换**。
5.  **UI 更新与重渲染:**
      * Left Navigator (A) 根据新结构完全重渲染，平滑展示新插入的节点。
      * UI 显示短暂通知（Toast: "Workflow structure updated."）。
6.  **导航:** 根据 HITL 审批的返回结果（`action: ExecuteNext`），前端自动导航到新插入序列的第一个节点，该节点通常会自动开始执行。



--- (664-673 lines) ---
##### 3\. 工作流结构动态更新 (Dynamic Structure Updates)

处理 `Generator` 节点导致的结构变化。

  * **触发:** 监听到 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件。
  * **处理逻辑 (关键):** 前端状态管理器必须执行**全量替换**操作，使用事件负载数据覆盖本地缓存。
  * **视觉传达:**
      * **通知:** 显示短暂 Toast：“Workflow structure updated.”。
      * **平滑过渡:** Navigator (A) 重新渲染。使用 `Framer Motion` (Layout Animations) 实现新节点的平滑插入动画，帮助用户理解结构变化。



--- (1259-1288 lines) ---
### 4.2 动效系统 (Motion System)

动效系统旨在提升交互的流畅性、传达即时状态变化，并增强“精密仪器”的操作感。实现主要基于 **Framer Motion**。

#### 4.2.1 动效原则与编排 (Motion Principles and Choreography)

##### A. 设计原则 (Principles)

1.  **迅捷与响应 (Swift and Responsive):** 动效必须极快（通常在 100ms - 300ms 之间），绝不延迟操作。
2.  **精确与克制 (Precise and Restrained):** 运动应干脆、直接，避免过度夸张的回弹效果。
3.  **信息导向 (Informative):** 动效用于引导注意力、解释状态变化或增强空间模型。

##### B. 动效编排逻辑 (Choreography Logic)

1.  **微交互与反馈 (Micro-interactions):**

      * 按钮点击反馈：使用 Framer Motion `whileTap={{ scale: 0.98 }}` 实现轻微下压感。
      * 悬停状态：快速的颜色或背景变化。

2.  **空间模型与转场 (Spatial Model and Transitions):**

      * **模态框:** 从中心快速放大并淡入。
      * **标签页切换:** 使用 Framer Motion `layoutId` 实现激活指示器（Active Indicator）的平滑滑动动画。

3.  **布局与结构动态更新 (Layout and Dynamic Structure Updates):**

      * **关键场景:** 当 `WORKFLOW_STRUCTURE_UPDATED` 发生时。
      * **实现技术:** 使用 `Framer Motion` 的 Layout Animations 和 `AnimatePresence`。新节点平滑插入，现有节点平滑移动到新位置，帮助用户理解结构变化。

-----


--- (1290-1357 lines) ---
#### 4.2.2 动效参数定义 (Motion Parameters - Easing and Duration Tokens)

定义系统化的动效参数，定义为 TypeScript 常量供 Framer Motion 使用。

##### A. 持续时间 Token (Duration Tokens)

```typescript
// constants/motion.ts

export const Duration = {
  INSTANT: 0.1,  // 100ms: 微交互反馈
  FAST: 0.2,     // 200ms: 小元素过渡 (Tooltip, Dropdown)
  MEDIUM: 0.3,   // 300ms: 标准 UI 过渡 (Modals, Panel opening)
  SLOW: 0.5,     // 500ms: 大型布局动画
};
```

##### B. 运动曲线 Token (Easing Curve Tokens)

```typescript
// constants/motion.ts

export const Easing = {
  // Standard (EaseInOut): 平衡的运动。
  STANDARD: [0.4, 0, 0.2, 1],

  // Enter (EaseOut/Decelerate): 快速开始，平滑减速停止。
  ENTER: [0, 0, 0.2, 1],

  // Exit (EaseIn/Accelerate): 平滑开始，快速结束。
  EXIT: [0.4, 0, 1, 1],
};
```

##### C. Framer Motion 变体配置范例 (Framer Motion Variants Configuration)

```typescript
// constants/motion.ts

export const Variants = {
  // Fade In Up (e.g., list items appearing, HITL results loading)
  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: Duration.MEDIUM, ease: Easing.ENTER }
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: { duration: Duration.FAST, ease: Easing.EXIT }
    },
  },

  // Modal Enter/Exit (Pop effect)
  modalPop: {
    initial: { opacity: 0, scale: 0.96 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: Duration.MEDIUM, ease: Easing.ENTER }
    },
    // ... exit definition
  },
};
```



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



--- (1742-1743 lines) ---
4.  **动态结构处理:** `WORKFLOW_STRUCTURE_UPDATED` 事件必须触发 Zustand Store 的全量替换。



--- (1803-1803 lines) ---
      * **工作流结构动态更新 (Layout Animations - 关键):** 详见 5.2.3。

</design_doc>

<api>
--- (857-857 lines) ---
| `node_type` | string (enum) | 节点的类型。可选值: `"Standard"`, `"Generator"`。 |


--- (884-886 lines) ---
*   **动态结构**: 工作流的结构并非完全静态。当一个 `node_type` 为 `Generator` 的节点执行完成后，它会向当前工作流中**动态插入**一系列新的节点。
    *   **前端关键**: 必须监听 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件。收到此事件后，应立即废弃本地的工作流结构缓存，并调用 `GET /workflows/{workflow_id}` 重新获取完整的 `phases` 树来刷新视图。



--- (929-952 lines) ---
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
              "phase_id": "Phase 1: Strategic Analysis & Macro Architecture",
              "stage_id": "1.1",
              "stage_name": "Strategic Definition",
              "status": "Not Started",
              "is_stale": false // [新增] 初始时总为 false
            }
          ]
        }
      ]
    }
  ]


--- (1001-1036 lines) ---
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


--- (1076-1080 lines) ---
##### > 前端实现要点
> *   在进入工作流页面时首次调用此接口。
> *   当收到 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件时，必须调用此接口以获取全新的 `phases` 树并重新渲染。
> *   **[新增]** 在渲染节点时，检查 `node.is_stale` 标志。如果为 `true`，应在节点上显示一个明确的视觉指示器（如警告图标或虚线边框）。



--- (1149-1180 lines) ---
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

#### 4.2. PhaseRead

表示工作流中的一个 Phase。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `name` | string | Phase 的显示名称 (例如, "Phase 1: Strategic Analysis & Macro Architecture")。 |
| `stages` | array (StageRead) | 此 Phase 下的 Stage 列表，按节点 `order_index` 顺序排列。 |

#### 4.3. StageRead

表示 Phase 内部的一个 Stage（逻辑分组）。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | string | Stage 的唯一 ID (例如, "1.1" 或 "Task_A1.2.1")。 |
| `name` | string | Stage 的显示名称 (例如, "Strategic Definition" 或 "[Task_A1] Data & Model Generation")。 |
| `nodes` | array (NodeInstanceRead) | 属于该 Stage 的节点列表，保持其全局执行顺序。 |



--- (1259-1259 lines) ---
  "node_type": "Generator",


--- (1660-1677 lines) ---
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



--- (1705-1713 lines) ---
#### 5.3. `WORKFLOW_STRUCTURE_UPDATED` (低频，高影响)

*   **描述**: 工作流的节点集合发生了根本性变化（增加/重排序），通常由 `Generator` 节点完成时触发。
*   **`data` 负载**: `WorkflowInstanceRead` 对象 (包含**全新且完整**的 `Phase -> Stage -> Node` 树，**每个节点都带有最新的 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **全量替换**: **必须**将前端状态管理器中的 `phases` 树完全替换为此事件 `data.phases`。**严禁**尝试进行 diff 或 patch 操作。
    *   **用户体验考量**: 这是一个颠覆性的更新。建议在 UI 上显示一个短暂的、非阻塞的通知（例如 Toast "工作流已更新"），以告知用户发生了结构性变化。如果用户的焦点（例如，正在编辑的表单）位于受影响的节点上，需要谨慎处理，避免丢失用户输入。
    *   **渲染优化**: 在 Vue/React 中，确保你的节点列表渲染使用了 `key` 属性（例如 `v-for` 或 `.map`），以帮助框架高效地重新渲染 DOM。


</api>

<front_stack>
--- (51-52 lines) ---
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |
| **Sonner** | 用于显示轻量级的 Toast 通知（消息提示）。 |


--- (143-143 lines) ---
| **`MessageListView` & `MessageListItem`** | 实现了经典的聊天消息列表渲染模式。<br>- **关注点分离**: `MessageListView` 负责列表滚动和布局，`MessageListItem` 则根据消息类型 (`user`, `planner`, `researcher` 等) 委托给不同的子组件 (`MessageBubble`, `PlanCard`, `ResearchCard`) 渲染，代码结构清晰。<br>- **进入动画**: 使用 `framer-motion` 的 `motion.li` 为每条新消息添加入场动画，提升用户体验。 |


--- (145-145 lines) ---
| **`ResearchActivitiesBlock`** | 研究活动流的展示组件。它展示了如何渲染一个包含多种异构项（如网页搜索、代码执行、文件读取）的动态列表。每种活动类型都由一个专门的子组件处理（`WebSearchToolCall`, `PythonToolCall` 等），是处理复杂动态内容的绝佳范例。同时，它还包含了**性能优化**实践，如仅对前 N 个列表项应用动画。 |


--- (187-193 lines) ---
### 十四、 高级动画与视觉效果模式

项目巧妙地结合了多种动画技术，以创造流畅且引人入胜的用户体验。这些模式具有高度的可移植性。

| 模式/技术 | 描述与复用价值 |
| :--- | :--- |
| **`Framer Motion` 列表与状态动画** | **列表交错动画**: 在 `conversation-starter.tsx` 和 `message-list-view.tsx` 中，通过在 `motion.li` 的 `transition` prop 中设置 `delay: index * 0.1`，实现了新项目依次入场的精美效果。这是一个可直接应用于任何动态列表的模式。<br>**条件渲染动画**: `input-box.tsx` 使用 `<AnimatePresence>` 组件来包裹根据条件渲染的元素（如用户反馈提示）。这使得元素的出现和消失都带有平滑的动画效果，而不是生硬地切换。 |


--- (241-251 lines) ---

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
--- (548-594 lines) ---
### core/websocket/dispatcher.ts Content:

```ts
import { EventType, type EventPayload } from "~/core/models/events.model";
import { useStore } from "~/core/store";

/**
 * Central dispatcher for WebSocket events. Routes events to the appropriate Zustand store actions.
 * (Architecture 5.2.2)
 */
export function dispatchEvent(payload: EventPayload): void {
  const store = useStore.getState();
  const { event_type, workflow_id } = payload;

  // Ensure the event belongs to the currently active workflow
  if (store.workflowInstance?.id !== workflow_id) {
    console.warn(
      `Dispatcher: Received event for workflow ${workflow_id} but current workflow is ${store.workflowInstance?.id}. Ignoring.`,
    );
    return;
  }

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

    case EventType.WorkflowStructureUpdated:
      // Full structure replacement (API 6.5.3)
      store.handleWorkflowStructureUpdated(payload.data);
      break;

    case EventType.WorkflowStatusUpdated:
      // Workflow status update
      store.handleWorkflowStatusUpdated(payload.data);
      break;
  }
}
```


--- (1092-1136 lines) ---
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


--- (3112-3732 lines) ---
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
  NodeVersionRead,
} from "~/core/models/node.model";
import type {
  NodeInstanceRead,
  WorkflowInstanceRead,
} from "~/core/models/workflow.model";
import { type SliceCreator } from "~/core/store";
import { HITLResponseAction } from "~/constants/enums";

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

export const createWorkflowSlice: SliceCreator<WorkflowSlice> = (set, get) => ({
  workflowInstance: null,
  nodesById: new Map(),
  nodeDetailsCache: new Map(),
  nodeVersionsCache: new Map(),
  nodeVersionListCache: new Map(), // (Task 21)
  isLoading: false,
  isSyncing: false,
  isExecutingAction: false,
  pendingCancellationNodeIds: new Set(),

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
    // (Implementation remains as provided in context)
    set({
      workflowInstance: null,
      nodesById: new Map(),
      nodeDetailsCache: new Map(),
      nodeVersionsCache: new Map(),
      nodeVersionListCache: new Map(), // (Task 21)
      pendingCancellationNodeIds: new Set(), // Clear pending cancellations
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
        if (!state.nodesById.has(updatedNode.id)) {
          console.warn(`WorkflowSlice: Received update for unknown node ${updatedNode.id}. Ignoring.`);
          return;
        }

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

        // 4. Handle Cancellation Confirmation (Design Doc 3.1.2.C.4 Step 3 & 4)
        if (state.pendingCancellationNodeIds.has(updatedNode.id)) {
          // If the status is now Canceled, the cancellation is confirmed.
          if (updatedNode.status === "Canceled") {
            state.pendingCancellationNodeIds.delete(updatedNode.id);
          }
          // Robustness check: If the status changed away from Executing for any other reason (e.g., Failed, Completed naturally before cancellation processed), also clear the pending state.
          else if (updatedNode.status !== "Executing") {
            console.warn(`WorkflowSlice: Node ${updatedNode.id} left Executing state (${updatedNode.status}) while cancellation was pending.`);
            state.pendingCancellationNodeIds.delete(updatedNode.id);
          }
        }
      }),
    );
  },

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

  /**
   * Handles dynamic structure changes (API 6.5.3, Architecture 4.3.4 Strategy 3).
   */
  handleWorkflowStructureUpdated: (workflow) => {
    // Full replacement is mandatory (Design Doc 3.1.2.C.3).
    get()._normalizeAndSetData(workflow);
    // Notify the user (Design Doc 3.1.2.C.3)
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
    // (Implementation remains as provided in context)
    if (!force && get().nodeDetailsCache.has(nodeId)) {
      return get().nodeDetailsCache.get(nodeId) ?? null;
    }

    try {
      const details = await NodeService.getNodeById(nodeId);
      set(
        produce((state: WorkflowSlice) => {
          state.nodeDetailsCache.set(nodeId, details);
          // Optimization: If details include an active version, cache it in the version cache too.
          if (details.active_version) {
            state.nodeVersionsCache.set(details.active_version.id, details.active_version);
          }
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

  /**
   * (Task 21): Fetches the list of all versions for a node and caches it centrally. (API 5.1.2)
   */
  fetchNodeVersionList: async (nodeId, force = false) => {
    // Check cache first. If force is false AND the key exists (even if the value is null/failed), return the cached value.
    if (!force && get().nodeVersionListCache.has(nodeId)) {
      // Return cached value (which could be the array or null if previously failed).
      return get().nodeVersionListCache.get(nodeId) ?? null;
    }

    try {
      // Fetch from API (API 5.1.2)
      const versions = await NodeService.getNodeVersions(nodeId);

      // Update cache
      set(
        produce((state: WorkflowSlice) => {
          state.nodeVersionListCache.set(nodeId, versions);

          // Optimization: Pre-populate the individual version cache (nodeVersionsCache).
          // This ensures that when a user clicks a version card, the data is immediately available
          // for the workspace (useTranscriptData), potentially avoiding a subsequent fetch (API 5.1.3).
          versions.forEach((version) => {
            // We conservatively update the individual cache. If the list API (5.1.2) returns summarized objects
            // (e.g., missing output_data), we don't want to overwrite a fully detailed object fetched via (5.1.3).
            const existing = state.nodeVersionsCache.get(version.id);
            if (!existing) {
                 state.nodeVersionsCache.set(version.id, version);
            }
            // If API 5.1.2 returns full objects, we could merge/overwrite here, but the conservative approach is safer.
          });
        }),
      );
      return versions;
    } catch (error) {
      console.error(
        `Failed to fetch version list for node ${nodeId}:`,
        error,
      );
      // Provide user feedback
      toast.error(`Failed to load version history.`, {
        description: `Could not retrieve the list of versions.`,
      });
      
      // Set cache value to null to indicate failure, allowing the UI to show an error state.
      set(produce((state: WorkflowSlice) => {
          // We set the value to null, but keep the key, so subsequent checks know the fetch was attempted and failed.
          state.nodeVersionListCache.set(nodeId, null);
      }));
      return null;
    }
  },

  /**
   * Fetches a specific historical version of a node and caches it centrally. (API 5.1.3)
   */
  fetchNodeVersion: async (nodeId, versionId) => {
    // Check cache first
    if (get().nodeVersionsCache.has(versionId)) {
      return get().nodeVersionsCache.get(versionId) ?? null;
    }

    try {
      // Fetch from API
      const version = await NodeService.getNodeVersionById(nodeId, versionId);
      // Update cache
      set(
        produce((state: WorkflowSlice) => {
          state.nodeVersionsCache.set(versionId, version);
        }),
      );
      return version;
    } catch (error) {
      console.error(`Failed to fetch version ${versionId} for node ${nodeId}:`, error);
      // Provide user feedback and a recovery option if fetching fails.
      toast.error(`Failed to load historical version (ID: ${versionId}).`, {
        description: "Please try again or return to the latest version.",
        action: {
          label: "View Latest",
          // Cross-slice communication to revert UI state
          onClick: () => get().viewLatestVersion(),
        },
      });
      return null;
    }
  },

  // D. Execution Control & HITL
  // (Implementations remain as provided in context - they initiate actions via API and rely on WS events above for state updates)
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

  /**
   * Handles the asynchronous cancellation process (Design Doc 3.1.2.C.4, API 5.2.3, Task 17.5).
   */
  cancelNode: async (nodeId) => {
    // 1. Optimistically set pending cancellation state and start API request tracking (Design Doc 3.1.2.C.4 Step 1 & 2).
    set(
      produce((state: WorkflowSlice) => {
        // We track the API request duration (isExecutingAction) separately from the persistent pending state (pendingCancellationNodeIds).
        state.isExecutingAction = true;
        state.pendingCancellationNodeIds.add(nodeId);
      }),
    );

    try {
      // 2. Send API request
      await NodeService.cancelNode(nodeId);
      toast.success("Cancellation requested. Waiting for confirmation.");
      // We remain in pending state until WebSocket confirms 'Canceled' via handleNodeStatusUpdated.
      return true;
    } catch (error) {
      // 3. Handle API errors and revert pending state if request failed.
      set(
        produce((state: WorkflowSlice) => {
          state.pendingCancellationNodeIds.delete(nodeId);
        }),
      );

      if (error instanceof Error && error.message === "NODE_NOT_EXECUTING") {
        toast.error("Cannot cancel", {
          description: "The node is not currently executing.",
        });
      } else {
        // Use standardized error structure (Design Doc 3.1.2.B.3)
        toast.error("Cancellation Request Failed.", {
          description: "Could not send the request to the server. Please try again.",
        });
      }
      return false;
    } finally {
      // 4. Stop API request tracking, but maintain pendingCancellationNodeIds if successful.
      set({ isExecutingAction: false });
    }
  },

  submitHITL: async (nodeId, data) => {
    set({ isExecutingAction: true });
    try {
      const response = await NodeService.submitHITL(nodeId, data);
      toast.success(response.message || "Decision submitted.");

      // (Task 18): Handle specific actions requiring immediate frontend state updates
      if (response.action === HITLResponseAction.Discarded) {
        // If discarded, the pending_result is gone and the state might have reverted.
        // We must force a refetch of the node details to clear the cache and update the UI immediately. (API 5.3)
        console.log(
          `Execution discarded for node ${nodeId}. Forcing details refetch to synchronize UI.`,
        );
        // Await this to ensure cache is clean before returning response to caller.
        await get().fetchNodeDetails(nodeId, true);
      }

      // State updates via WebSocket. Response guides UI navigation (handled by HITLInteractionManager).
      return response;
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "NODE_NOT_AWAITING_APPROVAL":
            toast.error("Submission Failed", {
              description: "The node is not currently awaiting approval.",
            });
            // Force a refresh in case the local state is out of sync
            void get().fetchNodeDetails(nodeId, true);
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

// Helper functions for error handling (Implementation remains as provided in context)
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


--- (7690-7889 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workflow-tree.tsx Content:

```tsx
"use client";

import { Fragment, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { NodeTreeItem } from "./node-tree-item";
import type { WorkflowInstanceRead } from "~/core/models/workflow.model";
import { useStore } from "~/core/store";
import { Duration, Easing } from "~/constants/motion";
import { cn } from "~/lib/utils";

interface WorkflowTreeProps {
  workflow: WorkflowInstanceRead;
}

export function WorkflowTree({ workflow }: WorkflowTreeProps) {
  const {
    activeNodeId,
    selectNode,
    collapsedPhases,
    collapsedStages,
    togglePhaseCollapse,
    toggleStageCollapse,
  } = useStore(
    useShallow((state) => ({
      activeNodeId: state.activeNodeId,
      selectNode: state.selectNode,
      collapsedPhases: state.collapsedPhases,
      collapsedStages: state.collapsedStages,
      togglePhaseCollapse: state.togglePhaseCollapse,
      toggleStageCollapse: state.toggleStageCollapse,
    })),
  );

  const { nodeOrderLookup, executionFrontierNodeId } = useMemo(() => {
    let runningIndex = 0;
    const lookup = new Map<number, number>();
    const flattened: number[] = [];

    workflow.phases.forEach((phase) => {
      phase.stages.forEach((stage) => {
        stage.nodes.forEach((node) => {
          lookup.set(node.id, runningIndex);
          flattened.push(node.status === "Completed" ? -1 : node.id);
          runningIndex += 1;
        });
      });
    });

    const frontierNodeId =
      flattened.find((nodeId) => nodeId !== -1) ?? null;

    return { nodeOrderLookup: lookup, executionFrontierNodeId: frontierNodeId };
  }, [workflow]);

  const frontierOrder =
    executionFrontierNodeId !== null
      ? nodeOrderLookup.get(executionFrontierNodeId) ?? null
      : null;

  const isNodeBeyondFrontier = useCallback(
    (nodeId: number) => {
      if (frontierOrder === null) return false;
      const nodeOrder = nodeOrderLookup.get(nodeId);
      if (nodeOrder === undefined) return false;
      return nodeOrder > frontierOrder;
    },
    [frontierOrder, nodeOrderLookup],
  );

  const handleNodeSelect = useCallback(
    (nodeId: number) => {
      selectNode(nodeId);
    },
    [selectNode],
  );

  if (!workflow.phases.length) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-card/30 p-4 text-sm text-muted-foreground">
        Workflow structure will appear once execution begins.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workflow.phases.map((phase, phaseIndex) => {
        const phaseKey = getPhaseKey(phase, phaseIndex);
        const isPhaseCollapsed = collapsedPhases.has(phaseKey);

        return (
          <div
            key={phaseKey}
            className="overflow-hidden rounded-xl border border-border/50 bg-card/40"
          >
            <button
              type="button"
              onClick={() => togglePhaseCollapse(phaseKey)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <span>{phase.name}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isPhaseCollapsed && "-rotate-90",
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {!isPhaseCollapsed && (
                <motion.div
                  key={`${phaseKey}-content`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: Duration.FAST, ease: Easing.STANDARD }}
                  className="space-y-1 border-t border-border/40 bg-card/20 py-2"
                >
                  {phase.stages.map((stage, stageIndex) => {
                    const isStageCollapsed = collapsedStages.has(stage.id);
                    return (
                      <Fragment key={stage.id}>
                        <button
                          type="button"
                          onClick={() => toggleStageCollapse(stage.id)}
                          className={cn(
                            "flex w-full items-center justify-between px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80",
                            stageIndex === 0 ? "pt-1" : "pt-2",
                          )}
                        >
                          <span>{stage.name}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isStageCollapsed && "-rotate-90",
                            )}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {!isStageCollapsed && (
                            <motion.ul
                              key={`${stage.id}-nodes`}
                              layout
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{
                                duration: Duration.FAST,
                                ease: Easing.STANDARD,
                              }}
                              className="space-y-1 px-3 pb-2"
                            >
                              {stage.nodes.map((node) => (
                                <NodeTreeItem
                                  key={node.id}
                                  node={node}
                                  isActive={node.id === activeNodeId}
                                  isDisabled={isNodeBeyondFrontier(node.id)}
                                  onSelect={handleNodeSelect}
                                />
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </Fragment>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function getPhaseKey(
  phase: WorkflowInstanceRead["phases"][number],
  fallbackIndex: number,
) {
  for (const stage of phase.stages) {
    for (const node of stage.nodes) {
      if (node.phase_id) {
        return node.phase_id;
      }
    }
  }
  return `phase-${fallbackIndex}`;
}

```


--- (8367-8474 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/node-tree-item.tsx Content:

```tsx
"use client";

import { AlertTriangle } from "lucide-react";
// Import AnimatePresence for entry/exit animations (Design Doc 5.2.4)
import { AnimatePresence, motion } from "framer-motion";

import { NodeStatusIcon } from "~/components/platform/workflow/node-status-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { Duration, Easing } from "~/constants/motion";
import { cn } from "~/lib/utils";

interface NodeTreeItemProps {
  node: NodeInstanceRead;
  isActive: boolean;
  /**
   * Indicates if the node is beyond the execution frontier (SRS 5.2, Design Doc N3.2).
   */
  isDisabled: boolean;
  onSelect: (nodeId: number) => void;
}

/**
 * Represents a single node in the Workflow Navigator Tree.
 * Handles visualization of status, staleness, selection state, and execution frontier constraints.
 * (Design Doc 5.1.2.A)
 */
export function NodeTreeItem({
  node,
  isActive,
  isDisabled,
  onSelect,
}: NodeTreeItemProps) {
  return (
    // motion.li with layout enables smooth transitions when the structure changes (Arch Doc 7.1.2)
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: Duration.FAST, ease: Easing.STANDARD }}
    >
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) {
            onSelect(node.id);
          }
        }}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "group relative flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "h-8", // Explicit height h-8 (32px) (Design Doc 5.1.2.A2)
          "border-l-4 border-transparent",
          "hover:bg-accent/40",
          // Active State (Design Doc 5.1.2.A2): bg-accent, border-l-4 border-primary
          isActive && "border-primary bg-accent/60 text-foreground shadow-sm",
          // Disabled State (Execution Frontier) (Design Doc 5.1.2.A2): opacity-50, cursor-not-allowed
          isDisabled &&
            "cursor-not-allowed opacity-50 hover:bg-transparent focus-visible:ring-0",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {/* Status Icon (Design Doc 5.1.2.A3) */}
          <NodeStatusIcon status={node.status} />
          <span className="truncate font-medium">{node.name}</span>
        </span>

        {/* Staleness Indicator (Design Doc 5.1.2.A4, V4.1) (Task 24.2) */}
        {/* Use AnimatePresence to enable the subtle entry/exit animation */}
        <AnimatePresence>
          {node.is_stale && (
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Apply spring animation as specified in Design Doc (Lines 1691-1712) (Task 24.2 Animation) */}
                <motion.span
                  key="stale-indicator"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 20,
                  }}
                  // Use semantic color for awaiting/warning (Amber) (Design Doc 5.1.2.A4)
                  className="inline-flex items-center text-status-awaiting"
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Node output is stale.</span>
                </motion.span>
              </TooltipTrigger>
              <TooltipContent align="end">
                {/* Required tooltip content (Design Doc 5.1.2.A4) */}
                Stale: Upstream dependency has changed.
              </TooltipContent>
            </Tooltip>
          )}
        </AnimatePresence>
      </button>
    </motion.li>
  );
}
```


--- (12837-12893 lines) ---
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



--- (13466-13508 lines) ---
         - sonner.tsx
         - accordion.tsx
         - tooltip.tsx
         - alert.tsx
         - switch.tsx
         - radio-group.tsx
         - command.tsx
         - toggle-group.tsx
         - avatar.tsx
         - dialog.tsx
         - badge.tsx
         - separator.tsx
         - button.tsx
         - toggle.tsx
         - checkbox.tsx
         - collapsible.tsx
         - dropdown-menu.tsx
         - select.tsx
         - textarea.tsx
         - input.tsx
         - skeleton.tsx
         - form.tsx

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


--- (272-292 lines) ---
   * Handler for incoming messages. Includes logic to prevent race conditions during sync.
   */
  private onMessage = (event: MessageEvent) => {
    const { isLoading, isSyncing } = useStore.getState();
    // Prevent processing events while synchronization is in progress
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

</deer_flow_frontend_code>

<architecture>
--- (16-17 lines) ---
4.  **动态性与流畅性**: 平滑处理工作流结构的动态变化，提供即时的交互反馈和高性能的动效。



--- (51-52 lines) ---

  * **Framer Motion**: 核心动效库。用于微交互、转场和关键的布局动画 (Layout Animations)。


--- (147-151 lines) ---
├── Navigator/                 # A. 左侧栏：工作流导航器
│   ├── WorkflowNavigator.tsx
│   ├── WorkflowTree.tsx
│   └── NodeTreeItem.tsx
│


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



--- (365-370 lines) ---
#### 5.3.3 处理复杂事件 (Handling Complex Events)

1.  **`NODE_STATUS_UPDATED` (增量更新)**: 直接更新 `WorkflowSlice.nodesById`。
2.  **`NODE_ACTIVE_VERSION_CHANGED` (Staleness 更新)**: 必须触发全量同步 (`loadWorkflow`) 以刷新全局 `is_stale` 标志。
3.  **`WORKFLOW_STRUCTURE_UPDATED` (结构更新)**: 必须使用事件负载进行全量替换 `WorkflowSlice.workflowInstance`。



--- (422-440 lines) ---
### 7.1 A. 工作流导航器 (Workflow Navigator)

**文件**: `WorkflowNavigator.tsx`, `NodeTreeItem.tsx`。

#### 7.1.1 数据源与结构

  * 数据源: `WorkflowSlice.currentWorkflow.phases`。
  * 实现高密度的层级树状视图。使用 `Collapsible` 实现 Phase/Stage 的折叠。

#### 7.1.2 节点项 (`NodeTreeItem`)

  * **状态可视化**:
      * 使用 `NodeStatusIcon` 显示实时状态（颜色遵循 4.1.1.D，`Executing` 需动画）。
      * 显示 `StalenessIndicator` (⚠️) 如果 `is_stale: true`。
  * **交互**:
      * 清晰的选中状态（背景高亮+左侧激活条）。
      * 执行前沿控制：禁用未来节点的点击。
  * **动效 (Framer Motion)**: **[关键实现]** 必须实现为 `motion.li` 并设置 `layout` 属性，使用 `AnimatePresence` 包裹列表。这是实现动态结构更新平滑过渡的核心（设计文档 5.2.1）。



--- (523-533 lines) ---
#### 8.3.2 关键动效实现

1.  **布局动画 (Layout Animations)**:
      * **应用场景**: Workflow Navigator (A) 处理动态结构更新。
      * **实现**: 使用 `motion.li`, `layout` 属性和 `AnimatePresence` 实现节点的平滑插入和移动（设计文档 5.2.1）。
2.  **微交互**: 按钮点击反馈 (`whileTap={{ scale: 0.98 }}`)。
3.  **转场动画**: 模态框（`modalPop` variant）、HITL 内容加载（`fadeInUp` variant）。
4.  **状态指示**:
      * `Executing`: `animate-spin` 和可选的 `BorderBeam` 动画。
      * `Staleness`: ⚠️ 图标出现时的微妙脉冲动画。



--- (545-551 lines) ---
### 9.2 错误处理与反馈 (Error Handling and Feedback)

  * **反馈机制**: 统一使用 Toast (Sonner), Banner (Alert), AlertDialog 进行反馈（设计文档 3.1.2）。
  * **API 错误**: 在 API Client 拦截器中全局处理通用错误（401, 403, 5xx）。在业务逻辑中处理特定错误（409, 422）。
  * **WebSocket 错误**: 实现连接状态反馈（横幅）和重连逻辑。
  * **Error Boundaries**: 使用 React Error Boundaries 包裹关键组件，防止局部崩溃。


</architecture>



---

<task>


### 任务 25：动态工作流结构更新与布局动画

**目标：** 实现对动态工作流结构更新（`Generator` 节点）的处理，并使用 Framer Motion 实现平滑的布局动画来展示结构变化，提升用户体验。

**核心关注点：** `WORKFLOW_STRUCTURE_UPDATED` 事件响应、Framer Motion Layout Animations、性能。

**实现策略（参考 `<design_doc> 5.2.1`, `<architecture> 7.1.2`）：**

1.  **事件处理确认：** 确保任务 9 中实现的 `handleWorkflowStructureUpdated` Action（全量替换逻辑）正确执行。
2.  **Workflow Navigator 动效实现（关键实现）：**
    *   在 `WorkflowTree.tsx`（任务 11）中集成 Framer Motion。
    *   使用 `motion.ul layout` 作为容器。
    *   使用 `<AnimatePresence initial={false}>` 包裹列表项。
    *   将 `NodeTreeItem` 外部包裹 `motion.li`，设置唯一的 `key` 和 `layout` 属性。
    *   配置 `transition` 参数（使用 Spring 动画类型），实现新节点的平滑插入（展开高度+淡入）和现有节点的平滑移动（参考 `<design_doc> 5.2.1` 的代码指导）。
3.  **系统反馈：** 收到结构更新事件时，显示短暂 Toast：“Workflow structure updated.”（`<design_doc> 3.1.2.C.3`）。

**输入：** 任务 9, 11 的输出（事件处理逻辑, WorkflowTree）, `<design_doc> 5.2.1, 3.1.2.C.3`, `<api> 6.5.3`。
**输出：** 实现了对动态工作流结构更新的平滑处理，提升了用户体验的流畅性。


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

