<design_doc>
--- (136-136 lines) ---
| V4.1 | 过时状态 (Staleness) 检测 | 系统检测并标记输入依赖已过时的节点（`is_stale`）。 | SRS 1.4, FRS 5.2 | P1 |


--- (145-145 lines) ---
| N2.2 | 过时状态可视化 | 清晰标识“陈旧 (Stale)”的节点。 | FRS 5.2 | P1 |


--- (147-147 lines) ---
| N3.2 | 执行前沿控制 | 不允许跳转到尚未执行的未来节点。 | SRS 5.2 | P0 |


--- (278-279 lines) ---
          * `status` (enum: NodeStatus): 主状态。**(前端关键：驱动 UI 视觉状态和可用操作)**。
          * `current_stage` (enum: ExecutionStage): 详细执行阶段（用于进度展示）。


--- (285-285 lines) ---
          * `is_stale` (boolean): 指示输入依赖是否已过时。**(前端关键：用于显示警告图标和横幅)**。


--- (313-313 lines) ---
  * **`NodeStatus` (生命周期主状态)**: `Not Started`, `Executing`, `Awaiting HITL Approval`, `Completed`, `Failed`, `Canceled`.


--- (383-386 lines) ---
  * **节点展示关键信息:**
    1.  **Status Icon:** 实时状态图标（✅, ⚙️ (Animated), ⏳, ❌, 🛑, ◯）。
    2.  **Node Identifier and Name.**
    3.  **Staleness Indicator (⚠️):** 如果 `is_stale: true`，则显示清晰的警告图标。


--- (389-389 lines) ---
      * **Execution Frontier:** 尚未执行的未来节点视觉上禁用且不可点击 (SRS 5.2)。


--- (654-662 lines) ---

实现“静默状态管理”（SRS 1.4）。

  * **检测与传播逻辑:**
    1.  **触发:** 前端监听到 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。
    2.  **同步:** 前端必须立即调用 `GET /workflows/{id}` 重新获取全量工作流状态，以更新所有节点的 `is_stale` 标志。
  * **视觉传达:**
      * **全局 (Navigator A):** 在 `is_stale: true` 的节点旁显示清晰的 ⚠️ 图标。Hover 显示 Tooltip 解释原因。
      * **局部 (Workspace B1):** 如果当前节点过时，显示醒目的、不可关闭的 `Staleness Banner`。


--- (732-759 lines) ---
#### A. 工作流导航器 (Workflow Navigator - Left Sidebar)

```
[A. Workflow Navigator] (Scrollable, Resizable Panel)
|
+-- [Header]: Workflow Navigator [Collapse Button <<]
|
+-- [Workflow Tree View] (Hierarchical List)
    |
    +-- v Phase 1: Strategic Analysis (Collapsible Group)
        |
        +-- v Stage 1.1: Strategic Definition
            |
            +-- [Node Item 1.1.1]
            |   |-- [✅ Completed] [Name]
            |
            +-- [Node Item 1.1.2] (Selected/Active)
                |-- [⏳ Awaiting HITL] [Name]
    |
    +-- v Phase 2: Cyclic Execution
        |
        +-- [Node Item 2.1.1]
            |-- [⚙️ Executing] [Name] (Animated Spinner)
        +-- [Node Item 2.1.2]
            |-- [✅ Completed] [Name] [⚠️ Stale Indicator]
        +-- [Node Item 2.1.3] (Disabled - Execution Frontier)
            |-- [◯ Not Started] [Name]
```


--- (991-1024 lines) ---
##### D. 语义化状态色彩规范 (Semantic Status Colors)

用于传达工作流状态。这些颜色扩展到 Tailwind 配置中，以提供专用的工具类（例如 `text-status-completed`）。

```javascript
// tailwind.config.js (theme.extend.colors)
status: {
  // Completed (Green/Emerald)
  completed: {
    DEFAULT: 'hsl(142.1 76.2% 36.3%)', // Emerald-600
    foreground: 'hsl(145.1 100% 98%)',
  },
  // Executing (Cyan) - 具有科技感和动感
  executing: {
    DEFAULT: 'hsl(186.2 95.2% 40.3%)', // Cyan-600
    foreground: 'hsl(186.2 100% 98%)',
  },
  // Awaiting HITL / Stale (Amber) - 需要注意和行动
  awaiting: {
    DEFAULT: 'hsl(45.9 95.2% 50.3%)', // Amber-500
    foreground: 'hsl(45.9 95.2% 10%)', // Dark foreground for contrast
  },
  // Failed (Red) - Uses --destructive by default, but can be referenced here if needed.
  failed: {
     DEFAULT: 'hsl(var(--destructive))',
     foreground: 'hsl(var(--destructive-foreground))',
  },
  // Canceled (Orange)
  canceled: {
    DEFAULT: 'hsl(24.6 95.2% 53.3%)', // Orange-500
    foreground: 'hsl(24.6 100% 98%)',
  },
},
```


--- (1385-1393 lines) ---
##### 1\. 工作流节点状态指示器 (Workflow Node Status Indicator)

  * **应用场景：** Workflow Navigator (A)。
  * **Status Icons (Lucide Icons):**
      * 使用 4.1.1.D 中定义的语义状态色彩 (`text-status-*`)。
      * `Executing`: 使用 `Loader2` 图标，并应用 `animate-spin` 动画。
  * **Staleness Indicator (⚠️):** 使用 `AlertTriangle` 图标。Hover 时必须显示 Tooltip 解释原因。
  * **交互：** `Selected State` 应有清晰的背景高亮 (`bg-accent`) 和左侧垂直指示条（`border-l-4 border-primary`）。



--- (1485-1514 lines) ---
#### 5.1.2 A. 工作流导航器 (Workflow Navigator - Left Sidebar)

**视觉特征:** 高密度、结构清晰、实时状态反馈。

**A1. 结构与头部:**

  * Header 高度 `h-12` (48px)。包含标题和折叠按钮（`ChevronsLeft` Icon）。

**A2. 工作流树状视图 (Workflow Tree View):**

  * **Phase/Stage 标题:** `text-xs font-semibold uppercase text-muted-foreground` (Slate 400)。
  * **节点项 (Node Item):**
      * 高度 `h-8` (32px)。字体 `text-sm`。
      * **交互状态:**
          * *Default:* Hover 时背景 `bg-accent` (Slate 800)。
          * *Selected (Active Node):* 背景 `bg-accent`。左侧必须显示一个垂直激活指示条：`border-l-4 border-primary` (4px Cyber Blue)。
          * *Disabled (Execution Frontier):* `opacity-50`, `cursor-not-allowed`。

**A3. 状态图标与色彩 (Status Icons):**

  * 使用 Lucide Icons，应用语义化状态色彩（4.1.1.D）。
  * `Executing`: `Loader2` 图标, `text-status-executing` (Cyan 600), 必须应用 `animate-spin`。
  * `Completed`: `CheckCircle`, `text-status-completed` (Emerald 600)。
  * `Awaiting HITL`: `Hourglass`, `text-status-awaiting` (Amber 500)。

**A4. 过时状态指示器 (Staleness Indicator ⚠️):**

  * 图标: `AlertTriangle`, `text-status-awaiting` (Amber 500)。
  * **交互:** 必须使用 `Shadcn/ui Tooltip` 包裹。Hover 时显示：“Stale: Upstream dependency [Node Name] has changed.”



--- (1579-1604 lines) ---
##### State: `Executing`

  * **Navigator (A):** 图标为 `Loader2` (Cyan, `animate-spin`)。
  * **Workspace (B):**
      * B1: Toolbar 显示 [Cancel Execution]。
      * B2: Block 2 (Artifacts) 自动展开，焦点在 `Logs` Tab，实时显示日志流。
      * **视觉增强:** 在 Workspace (B) 容器边缘激活 `Magic UI BorderBeam` 动画（Cyan 色调），表示计算活动。
  * **History (C):** 隐藏。

##### State: `Awaiting HITL Approval` (SCA 模式为例)

  * **Navigator (A):** 图标为 `Hourglass` (Amber)。
  * **Workspace (B):**
      * B2 Block 4 (HITL Zone): 激活 SCA 界面（`Tabs` for Analysis/Candidates, `RadioGroup`+`Card` for selection）。
      * B3 Footer: 显示。
  * **History (C):** 隐藏。

##### State: `Completed` (Review Mode, Stale)

  * **Navigator (A):** 图标为 `CheckCircle` (Green)，并在右侧显示 ⚠️ `AlertTriangle` (Amber)。
  * **Workspace (B):**
      * B1: Toolbar 显示 [Re-execute], [Manual Edit]。
      * B1.1: 显示 `Staleness Banner` (Amber Alert)。
      * B2: 显示只读 Transcript。
  * **History (C):** 显示。



--- (1691-1712 lines) ---
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


--- (1779-1781 lines) ---
  * **专业复合组件:**
      * **Workflow Node Status Indicator:** 实现规范见 5.1.2.A3-A4。
      * **Version Card:** 实现规范见 5.1.4.C2-C3。


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



--- (1076-1080 lines) ---
##### > 前端实现要点
> *   在进入工作流页面时首次调用此接口。
> *   当收到 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件时，必须调用此接口以获取全新的 `phases` 树并重新渲染。
> *   **[新增]** 在渲染节点时，检查 `node.is_stale` 标志。如果为 `true`，应在节点上显示一个明确的视觉指示器（如警告图标或虚线边框）。



--- (1202-1210 lines) ---
### 核心概念

为更好地理解本模块 API，请先熟悉以下核心概念：

*   **节点生命周期 (Node Lifecycle)**: 一个节点通常会经历 `Not Started` -> `Executing` -> `Awaiting HITL Approval` -> `Completed` 的状态流。**[新增]** `Executing` 状态可以被中断，进入 `Canceled` 状态。`retry` 或 `re-execute` 等操作会使其重新进入 `Executing` 状态。`Failed` 是一个可能的终态，但可以通过 `retry` 恢复。
*   **版本 (Version)**: 每次节点成功执行并被用户批准后，其结果（输入、输出、交互历史）都会被固化为一个“版本”。`active_version` 代表该节点当前对外提供的“官方”结果。
*   **执行前沿 (Execution Frontier)**: 指工作流中已执行或正在执行的最后一个节点的序号。为保证流程的顺序性，用户不能“跳级”操作前沿之外的节点。
*   **过时状态 (Staleness)**: 当一个节点的上游依赖节点更新了其 `active_version` 后，该节点就处于“过时”状态。这是 **UI 提示** 的关键数据，应在界面上明确标记该节点，并建议用户“重新执行以同步最新上游数据”。



--- (1235-1245 lines) ---
#### 1.1. 获取节点详细信息

此端点是渲染节点视图的主力，提供单个节点的完整状态、数据和上下文信息。

*   **Endpoint**: `GET /nodes/{node_id}`
*   **权限**: 必须是该节点所属工作流的所有者。
*   **描述**:
    *   查询并返回指定 `node_id` 的详细视图。
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


--- (1296-1300 lines) ---
##### 错误响应
*   `401 Unauthorized`: 认证失败。
*   `403 Forbidden`: 用户无权访问该节点，或试图访问未解锁的节点。
*   `404 Not Found`: 指定的 `node_id` 不存在。



--- (1540-1550 lines) ---
#### 5.1. NodeDetailView

`GET /nodes/{node_id}` 返回的节点详细视图对象，继承自 `NodeInstanceRead`。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| *(所有 NodeInstanceRead 字段)* | | 参见项目管理文档中的 `NodeInstanceRead` 定义。 |
| `active_version` | object (NodeVersionRead) \| null | 如果节点已完成，此字段包含其当前活动版本的完整数据。 |
| `pending_result` | object (TemporaryExecutionRead) \| null | 如果节点正在执行或等待审批，此字段包含其临时的、未固化的结果。 |
| `staleness_report` | array (StalenessInfo) \| null | 如果节点的上游依赖已更新，此列表将包含详细的过时信息。 |



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



--- (1929-1943 lines) ---
#### **4. 节点生命周期与状态机**

*   **4.1. 节点状态:**
    *   `未开始 (Not Started)`
    *   `执行中 (Executing)`
    *   `等待HITL批准 (Awaiting HITL Approval)`
    *   `已完成 (Completed)`
    *   `执行失败 (Failed)`
    *   `已取消 (Canceled)`: 节点的执行被人为请求中止。

*   **4.2. 状态转换规则:**
    *   `执行中` -> `已取消`: 当用户请求取消任务，且后台工作进程成功中止执行时。此过程不产生任何新版本。
    *   `等待HITL批准` / `执行失败` / `已取消` -> `已完成` (或 `未开始`): 当用户点击"丢弃本次执行"。
    *   `执行失败` / `已取消` -> `执行中`: 当用户点击"重试"并提交。


</api>

<front_stack>
--- (34-44 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Tailwind CSS** | 原子化的 CSS 框架，用于构建整个项目的用户界面样式。 |
| **`@tailwindcss/typography`** | Tailwind CSS 的官方插件 (`prose` 类)，用于美化由 Markdown 或富文本编辑器生成的文本块样式。 |
| **`tailwindcss-animate`** | 为 Tailwind CSS 提供了便捷的动画类库。 |
| **next-themes** | 用于实现浅色/深色模式的主题切换功能。 |
| **class-variance-authority (cva)** | 用于创建可组合的、带变体的 UI 组件样式，广泛应用于 `components/ui` 目录。 |
| **tailwind-merge** | 用于智能合并 Tailwind CSS 类名，优雅地解决样式冲突问题。 |
| **clsx** | 一个小巧的工具库，用于根据条件动态地组合 CSS 类名。 |
| **Next.js Font (`next/font`)** | 用于本地化和优化 Web 字体，项目中使用了 `Geist` 字体。 |



--- (47-62 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |
| **Sonner** | 用于显示轻量级的 Toast 通知（消息提示）。 |
| **Magic UI (自定义组件集)** | 项目中 `components/magicui` 目录下的一系列高度定制化的视觉特效组件。 |
| | ↳ `AuroraText` | 极光渐变色文本效果。 |
| | ↳ `BentoGrid` | Bento 风格的网格布局组件。 |
| | ↳ `BorderBeam` | 环绕容器边缘的动态光束动画。 |
| | ↳ `FlickeringGrid` | 随机闪烁的背景网格效果。 |
| | ↳ `NumberTicker` | 数字滚动动画效果。 |
| | ↳ `ShineBorder` | 环绕容器边缘的闪亮边框动画。 |
| **cmdk** | 用于构建命令面板（Command Palette）的组件，在富文本编辑器中用于实现斜杠命令。 |
| **Tippy.js** | 用于在富文本编辑器中创建 `@mention` 功能的浮动提示框 (Tooltip/Popover)。 |



--- (105-109 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Lucide React** | 一套简洁、一致的开源图标库，是项目图标的主要来源。 |
| **Ant Design Icons** | 来自 Ant Design 的图标库，补充了部分特定图标。 |
| **Radix UI Icons** | 来自 Radix UI 的图标库，补充了部分特定图标。 |


--- (148-148 lines) ---
| **`Link` (自定义)** | 位于 `components/deer-flow/link.tsx`，这是一个增强版的 `<a>` 标签。它会查询 Zustand store 中的工具调用历史，判断一个链接是否在之前的搜索结果中出现过。如果未出现，则会显示一个“链接不可靠”的警告图标。这是一个**将 UI 组件与业务状态深度结合**的创新实践。 |


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



--- (198-208 lines) ---
### 十五、 架构模式与项目组织

项目的目录结构和代码组织方式遵循了现代大型前端应用的**最佳实践**，非常值得借鉴。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **功能切片 (Feature-Sliced) 路由** | `app/` 目录下的结构（如 `app/chat/`, `app/landing/`, `app/settings/`）体现了按功能组织代码的原则。每个功能模块都是一个独立的单元，包含了自身的页面、组件和逻辑，使得项目结构清晰，易于扩展和维护。 |
| **组件分层** | 项目中的 `components/` 目录被清晰地划分为三层：<br>1. **`ui/`**: 基础 UI 组件，源自 Shadcn/ui，是应用的视觉基石。<br>2. **`deer-flow/`**: 应用级的共享组件，如 `Logo`, `Markdown`, `Tooltip` 等。它们封装了通用逻辑，在多个功能模块中复用。<br>3. **`magicui/`**: 高度定制化的视觉特效组件，与业务逻辑解耦，可轻松移植到任何项目中。 |
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |
| **自定义 Hooks 封装** | `hooks/` 目录提供了可复用的 React Hooks，如 `useIntersectionObserver` 和 `useIsMobile`。它们将复杂的浏览器 API 或重复的逻辑封装成简单易用的钩子，简化了组件代码。 |



--- (209-218 lines) ---
### 十六、 样式与主题架构

项目建立了一套强大且灵活的样式与主题系统。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **基于 CSS 变量的主题系统** | `styles/globals.css` 中，通过在 `:root` 和 `.dark` 选择器下定义大量的 CSS 自定义属性 (custom properties)，构建了整个应用的主题系统。所有颜色、半径等设计令牌 (design tokens) 都被变量化，使得主题切换（通过 `next-themes`）仅需切换一个顶层 class，浏览器即可高效地重绘。 |
| **Tailwind `@theme` 指令** | 通过 `@theme` 指令，项目将 CSS 变量（如 `--app-background`）与 Tailwind 的配置相结合，创建了语义化的工具类（如 `bg-app`）。这使得在组件中可以直观地使用主题颜色，而无需关心具体的色值。 |
| **`cn` 工具函数** | `lib/utils.ts` 中的 `cn` 函数是整个项目的标准实践。它结合了 `clsx` 和 `tailwind-merge`，解决了在 React 组件中动态、条件性地组合 Tailwind 类名时的所有痛点（如条件判断、样式覆盖冲突），是现代 Tailwind 项目的必备工具。 |



--- (270-270 lines) ---
| **可访问性 (a11y)** | **语义化 HTML**: 项目结构良好，使用了恰当的 HTML5 标签（`header`, `main`, `footer`, `section` 等）。<br>**Radix UI 基础**: 由于 UI 组件库基于 Radix UI，所有组件（如 `Dialog`, `DropdownMenu`, `Tooltip`）都内置了完善的键盘导航支持、焦点管理和 ARIA 属性，提供了坚实的可访问性基础。例如，弹窗打开时焦点会自动移入，关闭后会返回原处。 |


--- (280-280 lines) ---
| **可扩展的数据-视图映射** | 在落地页的多个部分（如 `CaseStudySection` 和 `CoreFeatureSection`），UI 的生成是通过**将数据数组映射到 UI 组件**来完成的。例如，`caseStudyIcons` 数组将案例的 ID 与其对应的 Lucide 图标关联起来。这种模式使得添加、删除或修改一个案例或功能特性，只需修改数据数组，而无需触碰渲染逻辑，符合“开放-封闭原则”。 |

</front_stack>

<deer_flow_frontend_code>
--- (1459-1481 lines) ---
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


--- (1801-1812 lines) ---
  getNodeById: async (nodeId: number): Promise<NodeDetailView> => {
    try {
      const response = await apiClient.get<NodeDetailView>(`/nodes/${nodeId}`);
      return response.data;
    } catch (error) {
      // Handle 403 Forbidden (Accessing node beyond execution frontier - R5.2)
      if (error instanceof AxiosError && error.response?.status === 403) {
        throw new Error("NODE_BEYOND_FRONTIER");
      }
      throw error;
    }
  },


--- (6747-6946 lines) ---
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


--- (7472-7547 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/node-tree-item.tsx Content:

```tsx
"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

import { NodeStatusIcon } from "~/components/platform/workflow/node-status-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { Duration, Easing } from "~/constants/motion";
import { cn } from "~/lib/utils";

interface NodeTreeItemProps {
  node: NodeInstanceRead;
  isActive: boolean;
  isDisabled: boolean;
  onSelect: (nodeId: number) => void;
}

export function NodeTreeItem({
  node,
  isActive,
  isDisabled,
  onSelect,
}: NodeTreeItemProps) {
  return (
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
          "border-l-4 border-transparent",
          "hover:bg-accent/40",
          isActive && "border-primary bg-accent/60 text-foreground shadow-sm",
          isDisabled &&
            "cursor-not-allowed opacity-60 hover:bg-transparent focus-visible:ring-0",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <NodeStatusIcon status={node.status} />
          <span className="truncate font-medium">{node.name}</span>
        </span>
        {node.is_stale ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center text-amber-500">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Node output is stale.</span>
              </span>
            </TooltipTrigger>
            <TooltipContent align="end">
              Stale: Upstream dependency has changed.
            </TooltipContent>
          </Tooltip>
        ) : null}
      </button>
    </motion.li>
  );
}

```


--- (8567-8577 lines) ---
// API 3.5.4, SRS 4.1: Node Lifecycle Main Status
export const NodeStatusEnum = z.enum([
  "Not Started",
  "Executing",
  "Awaiting HITL Approval",
  "Completed",
  "Failed",
  "Canceled",
]);
export type NodeStatus = z.infer<typeof NodeStatusEnum>;



--- (8996-9061 lines) ---
/* 4.1.1.B Semantic Tokens and Theming (HSL Format) */
@layer base {
  :root {
    /* UI Radius (4.1.4) */
    --radius: 0.5rem;

    /* Light Mode */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 47.4% 11.2%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 47.4% 11.2%;
    --popover-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 217.2 91.2% 59.8%;
  }
}


--- (9972-10009 lines) ---
### components/ui/tooltip.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "~/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

```


--- (10011-10079 lines) ---
### components/ui/alert.tsx Content:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        // Added custom variants for better UX feedback in configuration flows
        info: "border-blue-500/50 text-blue-700 dark:text-blue-400 dark:border-blue-500 [&>svg]:text-blue-500 bg-blue-50/50 dark:bg-blue-950/30",
        warning:
          "border-amber-500/50 text-amber-700 dark:text-amber-400 dark:border-amber-500 [&>svg]:text-amber-500 bg-amber-50/50 dark:bg-amber-950/30",
        success:
          "border-green-500/50 text-green-700 dark:text-green-400 dark:border-green-500 [&>svg]:text-green-500 bg-green-50/50 dark:bg-green-950/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };



--- (10499-10546 lines) ---
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
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Added custom variants for status indication in project configuration
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
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

```


--- (14002-14056 lines) ---
### components/platform/data-display/project-status-badge.tsx Content:

```tsx
import { type VariantProps } from "class-variance-authority";

import { Badge, badgeVariants } from "~/components/ui/badge";
import type { ProjectStatus } from "~/constants/enums";
import { cn } from "~/lib/utils";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

/**
 * Semantic badge for displaying the current project status.
 */
export function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
  let variant: BadgeVariant | undefined = "secondary";
  let text = "";
  let customClasses = "";

  switch (status) {
    case "Configuring":
      variant = "warning";
      text = "Configuring";
      break;
    case "Running":
      variant = undefined;
      text = "Running";
      customClasses =
        "border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300";
      break;
    case "Completed":
      variant = "success";
      text = "Completed";
      break;
    default:
      variant = "outline";
      text = "Unknown";
  }

  return (
    <Badge variant={variant} className={cn(customClasses, className)}>
      {text}
    </Badge>
  );
}

```


--- (14061-14145 lines) ---
### components/platform/workflow/node-status-icon.tsx Content:

```tsx
import {
  Ban,
  CheckCircle,
  Circle,
  Hourglass,
  Loader2,
  XCircle,
} from "lucide-react";

import { type NodeStatus } from "~/constants/enums";
import { cn } from "~/lib/utils";

interface NodeStatusIconProps {
  status: NodeStatus;
  className?: string;
  size?: number;
}

/**
 * Maps `NodeStatus` values to the correct Lucide icon and semantic color.
 * (Design Doc 5.1.2.A3, 4.1.1.D)
 */
export function NodeStatusIcon({
  status,
  className,
  size = 16,
}: NodeStatusIconProps) {
  const baseClasses = "shrink-0";
  const combinedClasses = cn(baseClasses, className);
  const iconProps = { size, className: combinedClasses };

  switch (status) {
    case "Executing":
      return (
        <Loader2
          {...iconProps}
          className={cn(
            "animate-spin text-cyan-600 dark:text-cyan-500",
            combinedClasses,
          )}
        />
      );
    case "Completed":
      return (
        <CheckCircle
          {...iconProps}
          className={cn("text-emerald-600 dark:text-emerald-500", combinedClasses)}
        />
      );
    case "Awaiting HITL Approval":
      return (
        <Hourglass
          {...iconProps}
          className={cn("text-amber-500", combinedClasses)}
        />
      );
    case "Failed":
      return (
        <XCircle
          {...iconProps}
          className={cn("text-destructive", combinedClasses)}
        />
      );
    case "Canceled":
      return (
        <Ban
          {...iconProps}
          className={cn("text-muted-foreground", combinedClasses)}
        />
      );
    case "Not Started":
    default:
      return (
        <Circle
          {...iconProps}
          className={cn("text-muted-foreground/70", combinedClasses)}
        />
      );
  }
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



--- (43-49 lines) ---

  * **Tailwind CSS**: 原子化 CSS 框架，实现设计系统 Token。
  * **Shadcn/ui (基于 Radix UI)**: 基础 UI 组件库，提供可访问性和定制能力。
  * **next-themes + CSS Variables**: 实现主题管理（深色模式优先）。
  * **Geist Fonts (Sans & Mono)**: 指定字体家族。
  * **Lucide Icons**: 主要图标库。



--- (51-52 lines) ---

  * **Framer Motion**: 核心动效库。用于微交互、转场和关键的布局动画 (Layout Animations)。


--- (125-128 lines) ---
├── /platform/          # 应用级共享组件
│   ├── layout/         # GlobalHeader, ResizableHandle
│   ├── data-display/   # StatusBadge, StalenessIndicator, Timestamp
│   └── feedback/       # ConfirmationDialog, Toaster


--- (147-150 lines) ---
├── Navigator/                 # A. 左侧栏：工作流导航器
│   ├── WorkflowNavigator.tsx
│   ├── WorkflowTree.tsx
│   └── NodeTreeItem.tsx


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



--- (367-369 lines) ---
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



--- (499-504 lines) ---
#### 8.1.1 CSS Variables 与 Tailwind 配置

  * 在 `styles/globals.css` 中实现设计文档 4.1.1.B 的 CSS 变量定义（HSL 格式）。
  * 在 `tailwind.config.ts` 中配置 Tailwind 使用这些变量。
  * 扩展 Tailwind 配置，实现语义化状态色彩（`status-completed`, `status-executing` 等）（设计文档 4.1.1.D）。



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


</architecture>



---

<task>


### 任务 12：工作流导航器 (A)：高级状态可视化与执行前沿控制

**目标：** 增强工作流导航器，实现精确的实时状态可视化、Staleness 提示和执行前沿控制逻辑。

**核心关注点：** 语义化色彩、实时状态图标、业务逻辑限制（执行前沿）。

**实现策略（参考 `<design_doc> 5.1.2.A3-A4`）：**

1.  **节点状态图标（`NodeStatusIcon.tsx` 新建）：**
    *   实现专门的组件来渲染状态图标。
    *   使用 Lucide Icons，并严格应用 `<design_doc> 4.1.1.D` 定义的语义化状态色彩（`text-status-*`）。
    *   **关键实现：** `Executing` 状态必须使用 `Loader2` 图标（Cyan 色）和 `animate-spin` 动画。
    *   `Completed` (Green), `Awaiting HITL` (Amber), `Failed` (Red) 等状态需正确实现。
2.  **过时状态 (Staleness) 指示器：**
    *   在 `NodeTreeItem.tsx` 中，根据 `node.is_stale` 显示 ⚠️ `AlertTriangle` 图标（Amber 色）。
    *   使用 `Tooltip` 包裹该图标，Hover 时显示解释性文案。
3.  **执行前沿控制（Execution Frontier）（`<api> 5.1.1 R5.2`）：**
    *   在 `NodeTreeItem.tsx` 中实现逻辑，判断当前节点是否超前于工作流的执行前沿（即，状态为 `Not Started` 且前序节点未完成）。
    *   对于超前的节点，应用禁用样式（`opacity-50`, `cursor-not-allowed`）并阻止点击事件。

**输入：** 任务 11 的输出, `<design_doc> 4.1.1.D, 5.1.2`, `<api> 5.1.1`。
**输出：** 视觉完整且功能健壮的工作流导航器，能准确反映实时状态并执行业务逻辑限制。


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
