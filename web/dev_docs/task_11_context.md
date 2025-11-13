<design_doc>
--- (138-151 lines) ---
#### 1.2.7 领域：可视化导航与实时通信 (Domain: Visual Navigation & Real-time Comm)

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



--- (185-188 lines) ---
3.  **高信息密度下的极致清晰度 (Clarity within High Information Density):**
    *   拥抱复杂性，而非隐藏它。支持高信息密度的界面展示，满足专家用户同时处理大量信息的需求。
    *   通过卓越的信息架构、精密的排版和清晰的视觉层级，在高密度下建立完美的秩序感，降低认知负荷。



--- (263-286 lines) ---
##### C. 工作流结构 (Workflow Structure)

  * **WorkflowInstance (工作流实例)**
      * `id`, `name`.
      * `status` (enum: Running, Completed).
      * `phases` (array[Phase]): 结构化的节点组织层级 (Phase -\> Stage -\> NodeInstance)。**(前端关键：工作流导航器 Navigator 的核心数据源)**。
  * **Phase / Stage (阶段与步骤)**
      * *定义:* 用于在 UI 中对 NodeInstance 进行分组和导航的逻辑容器。

##### D. 节点实例与状态 (Node Instance and State)

  * **NodeInstance (节点实例)**
      * *定义:* 工作流中一个具体的执行步骤的实例。
      * `id`, `definition_id`, `name`.
      * *Execution State:*
          * `status` (enum: NodeStatus): 主状态。**(前端关键：驱动 UI 视觉状态和可用操作)**。
          * `current_stage` (enum: ExecutionStage): 详细执行阶段（用于进度展示）。
      * *Behavioral Configuration:*
          * `node_type` (enum: Standard, Generator). **(前端关键：用于控制“重新执行/编辑”的可用性)**。
          * `hitl_mode` (enum: VARL, SCA, AVL). **(前端关键：决定 HITL 界面的渲染逻辑)**。
      * *Versioning & Staleness:*
          * `active_version_id` (integer | null).
          * `is_stale` (boolean): 指示输入依赖是否已过时。**(前端关键：用于显示警告图标和横幅)**。



--- (363-391 lines) ---
#### 2.2.3 核心界面：工作流执行界面 (Core Interface: Workflow Execution View)

这是平台的核心操作区域，采用**持久化的三栏式布局**，遵循“思维驾驶舱”的设计愿景。

**布局哲学:** 分离关注点——导航 (The Map)、交互 (The Action)、历史 (The Memory)。A 和 C 栏可折叠/展开，并支持用户拖拽调整宽度。

```
[Global Header]
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [A. Workflow Navigator]  |  [B. Node Interaction Workspace]  | [C. Version History] |
|         (Left Sidebar)    |           (Center Panel)          |    (Right Sidebar)   |
|                           |                                   |                      |
+---------------------------------------------------------------------------------+
```

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



--- (702-725 lines) ---
#### C. 布局模板 2：三栏式工作流执行布局 (Template 2: The Cockpit Layout)

  * **应用场景：** 工作流执行界面 (`/projects/{id}/workflow`)。

  * **结构：** 高度灵活的三栏式布局。实现需使用 CSS Flexbox/Grid，并集成面板管理功能。

    ```
    [Global Header]
    +---------------------------------------------------------------------------------+
    | [A. Navigator] |<-R->|    [B. Node Interaction Workspace]    |<-R->| [C. History] |
    | (Left Sidebar) |     |           (Center Panel)             |     | (Right Sidebar)|
    +---------------------------------------------------------------------------------+
    (R = Resizable Separator)
    ```

  * **布局行为与规则：**

    1.  **全屏高度利用：** 布局占满 `Global Header` 以下的所有垂直空间。A、B、C 内部独立滚动。
    2.  **面板管理 (Panel Management):**
          * **实现技术:** 使用 `react-resizable-panels` 库。
          * **可调整大小 (Resizable):** 用户可拖拽 R1 和 R2 手柄调整宽度。设置应被记忆（`localStorage`）。
          * **可折叠 (Collapsible):** A 和 C 栏必须提供快速折叠/展开按钮。
    3.  **动态可见性:** C 栏（Version History）仅在 Workspace (B) 处于 `Completed` (Review Mode) 时显示。



--- (730-759 lines) ---
本节详细描述工作流执行界面中三个核心面板的线框结构。

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


--- (951-988 lines) ---
.dark {
  /* 深色模式 (Dark Mode - Primary/Default) */
  /* 背景使用深邃的蓝黑色，营造精密感 */
  --background: 222.2 84% 4.9%;    /* Deep Blue-Black (Slate 950) */
  --foreground: 210 40% 98%;       /* Near White (Slate 50) */

  /* Card/Panel background - 略高于背景色 */
  --card: 222.2 47.4% 11.2%; /* Slate-900 */
  --card-foreground: 210 40% 98%;

  --popover: 222.2 47.4% 11.2%;
  --popover-foreground: 210 40% 98%;

  /* Primary (Cyber Blue) - 在深色下更明亮 */
  --primary: 217.2 91.2% 59.8%;    /* Blue-500 */
  --primary-foreground: 222.2 47.4% 11.2%; /* Dark text for contrast */

  /* Secondary */
  --secondary: 217.2 32.6% 17.5%;  /* Slate-800 */
  --secondary-foreground: 210 40% 98%;

  /* Muted */
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%; /* Slate-400 */

  /* Accent */
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  /* Destructive */
  --destructive: 0 62.8% 30.6%;    /* Darker Red */
  --destructive-foreground: 210 40% 98%;

  /* Border & Input - 在深色下保持清晰但不过于刺眼 */
  --border: 217.2 32.6% 17.5%;     /* Slate-800 */
  --input: 217.2 32.6% 17.5%;
  --ring: 217.2 91.2% 59.8%;
}


--- (1093-1107 lines) ---
##### C. 排版规则与字阶 (Typographic Scale and Rules)

采用一套紧凑的字阶。我们区分 UI 控件字体大小和主体内容字体大小。

| Role | Tailwind Class | Size (px/rem) | Line Height | Weight | 应用场景 (Usage) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Caption | `text-xs` | 12px (0.75rem) | 16px (1rem) | Regular (400) | 辅助说明、元数据、时间戳。 |
| **UI Default** | **`text-sm`** | **14px (0.875rem)**| **20px (1.25rem)**| **Regular (400)** | **按钮、输入框、列表、导航、核心 UI。** |
| Body Text | `text-base` | 16px (1rem) | 24px (1.5rem) | Regular (400) | 主体内容阅读（Markdown 渲染）。 |
| Subtitle | `text-lg` | 18px (1.125rem)| 28px (1.75rem)| Medium (500) | 区块标题、副标题。 |
| H3 | `text-xl` | 20px (1.25rem)| 28px (1.75rem)| SemiBold (600)| 三级标题。 |
| H2 | `text-2xl` | 24px (1.5rem) | 32px (2rem) | Bold (700) | 二级标题、页面标题。 |
| H1 | `text-3xl` | 30px (1.875rem)| 36px (2.25rem)| Bold (700) | 核心大标题。 |
| Code/Log | `text-sm font-mono`| 14px (0.875rem)| 20px (1.25rem)| Regular (400) | 代码编辑器、日志查看器。 |



--- (1385-1393 lines) ---
##### 1\. 工作流节点状态指示器 (Workflow Node Status Indicator)

  * **应用场景：** Workflow Navigator (A)。
  * **Status Icons (Lucide Icons):**
      * 使用 4.1.1.D 中定义的语义状态色彩 (`text-status-*`)。
      * `Executing`: 使用 `Loader2` 图标，并应用 `animate-spin` 动画。
  * **Staleness Indicator (⚠️):** 使用 `AlertTriangle` 图标。Hover 时必须显示 Tooltip 解释原因。
  * **交互：** `Selected State` 应有清晰的背景高亮 (`bg-accent`) 和左侧垂直指示条（`border-l-4 border-primary`）。



--- (1435-1484 lines) ---
#### 5.1.1 布局实现与面板管理 (Layout Implementation and Panel Management)

**技术实现:** 采用 `react-resizable-panels` 库实现三栏式布局。

**全局属性:**

  * **背景:** `bg-background` (Slate 950)。
  * **高度:** 占据 `Global Header` 以下的全部视口高度。
  * **字体:** 全局应用 `font-sans` (Geist Sans), `text-sm` (14px) 作为基准。

**布局结构与行为 (`react-resizable-panels` 配置):**

```tsx
// Implementation Guidance Snippet (Workflow Layout Component)
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// ... inside the layout component
<PanelGroup
  direction="horizontal"
  autoSaveId="workflow-cockpit-layout" // 必须启用持久化存储
  className="flex-1 overflow-hidden"
>
  {/* A. Navigator Panel */}
  <Panel id="navigator" collapsible={true} minSize={15} defaultSize={20} className="bg-card">
    {/* Content A */}
  </Panel>

  {/* Resizer Handle R1 */}
  <PanelResizeHandle className="w-1 bg-border transition-colors duration-200 hover:bg-primary/70" />

  {/* B. Workspace Panel */}
  <Panel id="workspace" minSize={50} className="bg-background">
    {/* Content B */}
  </Panel>

  {/* C. History Panel (Conditional Rendering) */}
  {isHistoryVisible && ( // 仅在 Completed/Review Mode 时显示
    <>
      <PanelResizeHandle className="w-1 bg-border transition-colors duration-200 hover:bg-primary/70" />
      <Panel id="history" collapsible={true} minSize={15} defaultSize={20} className="bg-card">
        {/* Content C */}
      </Panel>
    </>
  )}
</PanelGroup>
```

  * **面板背景色区分:** Navigator (A) 和 History (C) 使用 `bg-card` (Slate 900)，与中央 Workspace (B) 的 `bg-background` (Slate 950) 区分，建立视觉层级。
  * **分隔手柄 (Resizer Handle):** 宽度 `w-1` (4px)。默认 `bg-border`。Hover 时变为 `bg-primary/70` (Cyber Blue, 70% opacity)，提供清晰反馈。



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



--- (877-886 lines) ---
### 核心概念

*   **项目与工作流**: 每个`项目 (Project)`在生命周期中最多拥有一个`工作流实例 (WorkflowInstance)`。工作流的创建和管理都与项目强绑定。
*   **工作流状态**:
    *   `Running`: 表示工作流已激活，可以或正在执行节点。**注意**: 一个新创建的工作流默认为此状态，但这仅表示“准备就绪”，并不意味着有节点正在执行。
    *   `Completed`: 工作流中所有节点均已成功执行完毕。
*   **阶段层级**: 所有工作流数据都以 `Phase -> Stage -> Node` 的树形结构通过 `WorkflowInstanceRead.phases` 返回。`stage_id` 与 `stage_name` 已成为节点的一等字段，前端无需再根据 `phase_id` 进行分组。
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



--- (1235-1245 lines) ---
#### 1.1. 获取节点详细信息

此端点是渲染节点视图的主力，提供单个节点的完整状态、数据和上下文信息。

*   **Endpoint**: `GET /nodes/{node_id}`
*   **权限**: 必须是该节点所属工作流的所有者。
*   **描述**:
    *   查询并返回指定 `node_id` 的详细视图。
    *   **关键逻辑 (R5.2)**: 如果请求的节点处于 `NOT_STARTED` 状态，后端会校验其是否超前于工作流的“执行前沿”。若超前，将返回 `403 Forbidden`。
    *   **过时检查**: 响应中包含 `staleness_report` 字段，前端应检查此字段，若非空，则在 UI 上明确提示用户此节点的输入依赖已更新。



--- (1607-1629 lines) ---
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


--- (1631-1639 lines) ---
### 2. 连接端点

*   **URL**: `ws://<your_server_address>/ws/{workflow_id}?token=<your_jwt_token>`
*   **协议**: `ws` (本地开发) 或 `wss` (生产环境)

#### 2.1. 路径与查询参数
*   `workflow_id` (integer, **required**): 要订阅的工作流实例 ID。
*   `token` (string, **required**): 有效的 JWT Access Token。



--- (1705-1713 lines) ---
#### 5.3. `WORKFLOW_STRUCTURE_UPDATED` (低频，高影响)

*   **描述**: 工作流的节点集合发生了根本性变化（增加/重排序），通常由 `Generator` 节点完成时触发。
*   **`data` 负载**: `WorkflowInstanceRead` 对象 (包含**全新且完整**的 `Phase -> Stage -> Node` 树，**每个节点都带有最新的 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **全量替换**: **必须**将前端状态管理器中的 `phases` 树完全替换为此事件 `data.phases`。**严禁**尝试进行 diff 或 patch 操作。
    *   **用户体验考量**: 这是一个颠覆性的更新。建议在 UI 上显示一个短暂的、非阻塞的通知（例如 Toast "工作流已更新"），以告知用户发生了结构性变化。如果用户的焦点（例如，正在编辑的表单）位于受影响的节点上，需要谨慎处理，避免丢失用户输入。
    *   **渲染优化**: 在 Vue/React 中，确保你的节点列表渲染使用了 `key` 属性（例如 `v-for` 或 `.map`），以帮助框架高效地重新渲染 DOM。



--- (1725-1734 lines) ---
#### 6.1. 状态同步与“灌溉”模式 (State Hydration)

这是保证数据一致性的核心模式：

1.  **加载 (Load)**: 组件挂载时，显示全局加载状态。
2.  **获取 (Fetch)**: 调用 `GET /workflows/{id}`。
3.  **灌溉 (Hydrate)**: 请求成功后，将完整的响应数据存入状态管理器。此时，隐藏全局加载状态，渲染页面。
4.  **连接 (Connect)**: 在“灌溉”完成后，建立 WebSocket 连接。
5.  **更新 (Update)**: 监听事件，并用事件数据更新状态管理器中的对应部分。


</api>

<front_stack>
--- (22-23 lines) ---
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |


--- (36-42 lines) ---
| **Tailwind CSS** | 原子化的 CSS 框架，用于构建整个项目的用户界面样式。 |
| **`@tailwindcss/typography`** | Tailwind CSS 的官方插件 (`prose` 类)，用于美化由 Markdown 或富文本编辑器生成的文本块样式。 |
| **`tailwindcss-animate`** | 为 Tailwind CSS 提供了便捷的动画类库。 |
| **next-themes** | 用于实现浅色/深色模式的主题切换功能。 |
| **class-variance-authority (cva)** | 用于创建可组合的、带变体的 UI 组件样式，广泛应用于 `components/ui` 目录。 |
| **tailwind-merge** | 用于智能合并 Tailwind CSS 类名，优雅地解决样式冲突问题。 |
| **clsx** | 一个小巧的工具库，用于根据条件动态地组合 CSS 类名。 |


--- (49-50 lines) ---
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |


--- (107-109 lines) ---
| **Lucide React** | 一套简洁、一致的开源图标库，是项目图标的主要来源。 |
| **Ant Design Icons** | 来自 Ant Design 的图标库，补充了部分特定图标。 |
| **Radix UI Icons** | 来自 Radix UI 的图标库，补充了部分特定图标。 |


--- (143-146 lines) ---
| **`MessageListView` & `MessageListItem`** | 实现了经典的聊天消息列表渲染模式。<br>- **关注点分离**: `MessageListView` 负责列表滚动和布局，`MessageListItem` 则根据消息类型 (`user`, `planner`, `researcher` 等) 委托给不同的子组件 (`MessageBubble`, `PlanCard`, `ResearchCard`) 渲染，代码结构清晰。<br>- **进入动画**: 使用 `framer-motion` 的 `motion.li` 为每条新消息添加入场动画，提升用户体验。 |
| **`ThoughtBlock`** (内嵌于 `MessageListView`) | 一个可折叠的“深度思考”区块。其设计亮点在于：<br>- **流式内容处理**: 能够区分并分别渲染**已完成的静态内容**和**正在流式传输的新内容**，为流式文本提供了更丰富的视觉表现力。<br>- **自动行为**: 当主要内容出现后，会自动折叠，减少信息干扰。 |
| **`ResearchActivitiesBlock`** | 研究活动流的展示组件。它展示了如何渲染一个包含多种异构项（如网页搜索、代码执行、文件读取）的动态列表。每种活动类型都由一个专门的子组件处理（`WebSearchToolCall`, `PythonToolCall` 等），是处理复杂动态内容的绝佳范例。同时，它还包含了**性能优化**实践，如仅对前 N 个列表项应用动画。 |
| **`ResearchBlock`** | 一个集成了标签页 (`Tabs`) 的复合视图组件。它允许用户在“研究报告”和“活动流”之间切换，同时在组件顶部提供了上下文相关的操作按钮（如编辑、复制、下载），是构建复杂信息面板的优秀参考。 |


--- (153-161 lines) ---
项目基于 Zustand 构建了清晰、高效的状态管理架构，核心代码位于 `core/store/`。

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **状态与设置分离** | `store.ts` 负责管理**会话相关的动态状态**（如消息、响应状态），而 `settings-store.ts` 负责管理**用户配置**。这种分离使得状态管理更加清晰，易于维护。 |
| **`sendMessage` 异步流程编排** | 这个核心函数是整个聊天功能的驱动器。它展示了：<br>1. **乐观更新**: 立即将用户消息追加到状态中。<br>2. **流式处理**: 调用 `chatStream` 并通过 `for await...of` 循环处理 SSE 事件。<br>3. **批量更新**: 使用 `setTimeout` 和 `Map` 对来自流的多个消息更新事件进行批处理，减少 React 的重渲染次数，提升性能。<br>4. **错误处理**: 使用 `try...finally` 确保无论成功与否，`responding` 状态都能被正确重置。 |
| **`mergeMessage` 纯函数** | 位于 `core/messages/merge-message.ts`，这是一个独立的、无副作用的函数，负责根据收到的 SSE 事件更新单个消息对象的状态。这种模式将状态变更的复杂逻辑从主流程中剥离，使其易于测试和维护，是 Reducer 模式的体现。 |
| **派生状态选择器 (Selectors)** | 项目定义了多个自定义 Hook (`useMessage`, `useRenderableMessageIds`, `useLastInterruptMessage`) 来从 store 中派生和选择数据。它们结合 `useShallow` 进行性能优化，封装了获取特定状态的逻辑，避免了组件内的重复计算。`useRenderableMessageIds` 尤其巧妙，它预先过滤出需要在 UI 中渲染的消息，从根源上解决了 React 列表渲染时的 `key` 值警告问题。 |
| **LocalStorage 持久化** | `settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数提供了一个简洁明了的模式，用于将 Zustand store 的状态与 `localStorage` 同步，实现了用户设置的持久化。 |


--- (184-185 lines) ---
| **运行时配置获取** | `core/api/hooks.ts` 中的 `useConfig` Hook 展示了如何从后端异步获取应用配置（如可用的 LLM 模型）。它包含了**重试逻辑**和**超时机制**，并在失败后回退到默认配置，增强了应用的鲁棒性。 |



--- (204-208 lines) ---
| **功能切片 (Feature-Sliced) 路由** | `app/` 目录下的结构（如 `app/chat/`, `app/landing/`, `app/settings/`）体现了按功能组织代码的原则。每个功能模块都是一个独立的单元，包含了自身的页面、组件和逻辑，使得项目结构清晰，易于扩展和维护。 |
| **组件分层** | 项目中的 `components/` 目录被清晰地划分为三层：<br>1. **`ui/`**: 基础 UI 组件，源自 Shadcn/ui，是应用的视觉基石。<br>2. **`deer-flow/`**: 应用级的共享组件，如 `Logo`, `Markdown`, `Tooltip` 等。它们封装了通用逻辑，在多个功能模块中复用。<br>3. **`magicui/`**: 高度定制化的视觉特效组件，与业务逻辑解耦，可轻松移植到任何项目中。 |
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |
| **自定义 Hooks 封装** | `hooks/` 目录提供了可复用的 React Hooks，如 `useIntersectionObserver` 和 `useIsMobile`。它们将复杂的浏览器 API 或重复的逻辑封装成简单易用的钩子，简化了组件代码。 |



--- (217-218 lines) ---
| **`cn` 工具函数** | `lib/utils.ts` 中的 `cn` 函数是整个项目的标准实践。它结合了 `clsx` 和 `tailwind-merge`，解决了在 React 组件中动态、条件性地组合 Tailwind 类名时的所有痛点（如条件判断、样式覆盖冲突），是现代 Tailwind 项目的必备工具。 |



--- (261-262 lines) ---
| **原子化且可组合的 Store Action** | `core/store/settings-store.ts` 中提供了一系列小巧、独立的 action 函数，如 `setReportStyle`, `setEnableDeepThinking`。它们封装了对 Zustand store 的特定修改，并自动调用 `saveSettings` 进行持久化。这使得在应用的任何地方修改设置都变得简单且一致。 |


</front_stack>

<deer_flow_frontend_code>
--- (100-477 lines) ---
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

/**
 * Manages the WebSocket connection lifecycle, authentication, reconnection logic,
 * and synchronization triggers. (Architecture 5.2)
 */
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
    // (Implementation remains as provided in context - handles token refresh)
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
    // (Implementation remains as provided in context - forces reconnection on token change)
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
    // (Implementation remains as provided in context - initiates connection)
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
    // (Implementation remains as provided in context - creates WebSocket instance)
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
    // (Implementation remains as provided in context)
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

  /**
   * Handler for successful connection (or reconnection).
   * Triggers synchronization (Architecture 5.3.2).
   */
  private onOpen = () => {
    console.log("WebSocketManager: Connection established.");
    this.reconnectAttempts = 0;
    this.updateStatus(ConnectionStatus.Connected);
    // CRITICAL: Enforce REST as Source of Truth upon connection (API 6.1.1)
    this.synchronizeWorkflowState();
  };

  /**
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

  private onError = (event: Event) => {
    console.error("WebSocketManager: Connection error:", event);
  };

  private onClose = (event: CloseEvent) => {
    // (Implementation remains as provided in context - handles cleanup and reconnection attempts)
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
    // (Implementation remains as provided in context - handles auth errors)
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
    // (Implementation remains as provided in context - exponential backoff)
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
    // (Implementation remains as provided in context)
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

  /**
   * Triggers a full workflow state synchronization using the REST API (Source of Truth).
   * (Architecture 5.3.2)
   */
  private synchronizeWorkflowState() {
    if (!this.workflowId) return;

    console.log(
      "WebSocketManager: Connection (re)established. Triggering full workflow synchronization (REST as Source of Truth)...",
    );
    // Call the store's loadWorkflow action. It handles setting 'isSyncing' state.
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
    // (Implementation remains as provided in context)
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
    // (Implementation remains as provided in context)
    this.disconnect();
    if (this.tokenUnsubscribe) {
      this.tokenUnsubscribe();
      this.tokenUnsubscribe = null;
    }
  }
}

export const webSocketManager = new WebSocketManager();
```


--- (1444-1559 lines) ---
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


--- (1728-1760 lines) ---
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


--- (2700-2823 lines) ---
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

```


--- (2846-2902 lines) ---
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



--- (2995-3439 lines) ---
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


--- (3441-3563 lines) ---
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
      const shouldExpand = isExpanded ?? !currentlyExpanded;

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



--- (4119-4180 lines) ---
### app/(platform)/layout.tsx Content:

```tsx
"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ConnectionStatusBanner } from "~/components/platform/layout/connection-status-banner";
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
      <ConnectionStatusBanner />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

```


--- (6700-6722 lines) ---
                     - page.tsx

### app/(platform)/projects/[projectId]/workflow/page.tsx Content:

```tsx
import { notFound } from "next/navigation";

import { ProjectWorkflowContainer } from "./components/project-workflow-container";

interface ProjectWorkflowPageProps {
  params: { projectId: string };
}

export default function ProjectWorkflowPage({ params }: ProjectWorkflowPageProps) {
  const numericProjectId = Number(params.projectId);
  if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
    notFound();
  }

  return <ProjectWorkflowContainer projectId={numericProjectId} />;
}

```


--- (6727-6983 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/project-workflow-container.tsx Content:

```tsx
"use client";

import { ChevronLeft, Loader2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShallow } from "zustand/react/shallow";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { useWorkflowConnection } from "~/core/hooks/use-workflow-connection";
import { useStore } from "~/core/store";

interface ProjectWorkflowContainerProps {
  projectId: number;
}

export function ProjectWorkflowContainer({
  projectId,
}: ProjectWorkflowContainerProps) {
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

  const showProjectLoader =
    isLoadingProjectDetail && !currentProject && !projectError;
  const showWorkflowLoader =
    workflowId !== null &&
    workflowInstance === null &&
    (workflowIsLoading || workflowIsSyncing);

  return (
    <div className="flex h-full flex-col bg-background p-6">
      <Button variant="ghost" asChild className="mb-4 w-fit">
        <Link href="/projects">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>

      <div className="flex-1 overflow-y-auto rounded-lg border bg-card p-6">
        {showProjectLoader ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {projectError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load project</AlertTitle>
            <AlertDescription>{projectError}</AlertDescription>
          </Alert>
        ) : null}

        {!currentProject && !showProjectLoader && !projectError ? (
          <Alert>
            <AlertTitle>No project selected</AlertTitle>
            <AlertDescription>
              Please return to the projects list and select a valid project.
            </AlertDescription>
          </Alert>
        ) : null}

        {currentProject ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Project #{currentProject.id}
                </p>
                <h1 className="text-2xl font-semibold">
                  {currentProject.name}
                </h1>
              </div>

              {workflowId ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => void handleWorkflowRefresh()}
                  disabled={
                    isWorkflowRefreshing ||
                    workflowIsLoading ||
                    workflowIsSyncing
                  }
                >
                  {isWorkflowRefreshing || workflowIsSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              ) : null}
            </div>

            {!workflowId ? (
              <Alert>
                <AlertTitle>Workflow not started</AlertTitle>
                <AlertDescription>
                  Start the workflow from the project configuration page to
                  unlock the cockpit view.
                </AlertDescription>
              </Alert>
            ) : null}

            {workflowId ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Workflow ID #{workflowId}
                  </p>
                  <p className="text-muted-foreground">
                    Real-time workflow cockpit interface implementation coming
                    soon.
                  </p>
                </div>

                {showWorkflowLoader ? (
                  <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : null}

                {!showWorkflowLoader && workflowInstance ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-muted/40 p-4">
                      <p className="text-sm text-muted-foreground">
                        Workflow Name
                      </p>
                      <p className="text-lg font-semibold">
                        {workflowInstance.name}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/40 p-4">
                      <p className="text-sm text-muted-foreground">
                        Current Status
                      </p>
                      <p className="text-lg font-semibold">
                        {workflowInstance.status}
                      </p>
                    </div>
                    {workflowMetrics ? (
                      <div className="rounded-lg border bg-muted/40 p-4">
                        <p className="text-sm text-muted-foreground">
                          Structure Overview
                        </p>
                        <p className="text-lg font-semibold">
                          {workflowMetrics.phaseCount} phases •{" "}
                          {workflowMetrics.nodeCount} nodes
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

```


--- (7968-8056 lines) ---
### constants/enums.ts Content:

```ts
import { z } from "zod";

// --- Project Management (API 3) ---

// API 3.5.1: Project Status (Design Doc 2.1.1.B)
export const ProjectStatusEnum = z.enum(["Configuring", "Running", "Completed"]);
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

// API 3.5.1: Problem Type (FRS 3.4)
// Note: "-" represents an unset or custom type.
export const ProblemTypeEnum = z.enum(["A", "B", "C", "D", "E", "F", "-"]);
export type ProblemType = z.infer<typeof ProblemTypeEnum>;

// API 3.5.3: File Role (FRS 3.2.2)
export const FileRoleEnum = z.enum([
  "Problem Description",
  "Dataset",
  "Reference Material",
]);
export type FileRole = z.infer<typeof FileRoleEnum>;

// --- Workflow Management (API 4) ---

// API 4.4.1: Workflow Status (Design Doc 2.1.1.C)
export const WorkflowStatusEnum = z.enum(["Running", "Completed"]);
export type WorkflowStatus = z.infer<typeof WorkflowStatusEnum>;

// --- Node & Execution (API 5, Design Doc 2.1.2.A) ---

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

// API 3.5.4: Detailed Execution Stage (for progress indication)
export const ExecutionStageEnum = z.enum([
  "Not Started",
  "Initializing",
  "Processing",
  "Generating Outputs",
  "Awaiting Review",
  "Completed",
  "Failed",
]);
export type ExecutionStage = z.infer<typeof ExecutionStageEnum>;

// API 3.5.4: Node Type (SRS 2.2)
export const NodeTypeEnum = z.enum(["Standard", "Generator"]);
export type NodeType = z.infer<typeof NodeTypeEnum>;

// API 3.5.4: HITL Mode
export const HITLModeEnum = z.enum(["VARL", "SCA", "AVL"]);
export type HITLMode = z.infer<typeof HITLModeEnum>;

// API 5.5.2: Version Source (FRS 4.3)
export const VersionSourceEnum = z.enum(["AI_GENERATED", "MANUALLY_EDITED"]);
export type VersionSource = z.infer<typeof VersionSourceEnum>;

// --- HITL Interaction (API 5.3) ---

// API 5.3: HITL Submission Action (User intent)
export const HITLActionEnum = z.enum([
  "Continue", // (H2.1)
  "RejectAndProvideModificationComments", // (H2.2)
  "Discard", // (H2.3)
]);
export type HITLAction = z.infer<typeof HITLActionEnum>;

// API 5.3: HITL Response Action (Frontend Navigation Guidance)
export const HITLResponseActionEnum = z.enum([
  "ExecuteNext",
  "NavigateNext",
  "Completed", // Workflow finished
  "AVLLoop", // Internal iteration (AVL mode)
  "ReExecute", // Node is re-executing
  "Discarded",
]);
export type HITLResponseAction = z.infer<typeof HITLResponseActionEnum>;

```


--- (8396-8518 lines) ---
### styles/globals.css Content:

```css
@config "../../tailwind.config.ts";
@import "tailwindcss";
@plugin "tailwindcss-animate";
@plugin "@tailwindcss/typography";

@theme {
  --radius: 0.5rem;

  /* Light mode tokens mirrored in :root for runtime CSS variables */
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-card: 0 0% 100%;
  --color-card-foreground: 222.2 84% 4.9%;
  --color-popover: 0 0% 100%;
  --color-popover-foreground: 222.2 84% 4.9%;
  --color-primary: 221.2 83.2% 53.3%;
  --color-primary-foreground: 210 40% 98%;
  --color-secondary: 210 40% 96.1%;
  --color-secondary-foreground: 222.2 47.4% 11.2%;
  --color-muted: 210 40% 96.1%;
  --color-muted-foreground: 215.4 16.3% 46.9%;
  --color-accent: 210 40% 96.1%;
  --color-accent-foreground: 222.2 47.4% 11.2%;
  --color-destructive: 0 84.2% 60.2%;
  --color-destructive-foreground: 210 40% 98%;
  --color-border: 214.3 31.8% 91.4%;
  --color-input: 214.3 31.8% 91.4%;
  --color-ring: 221.2 83.2% 53.3%;
}

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

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground text-sm;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* 4.1.4.C Advanced Visual Effects: Subtle Texture (Dot Grid for Dark Mode) */
.dark body {
  background-image: radial-gradient(
    circle at center,
    hsl(var(--border) / 0.15) 0.5px,
    hsl(var(--background)) 0
  );
  background-size: 24px 24px;
}

```


--- (9932-9978 lines) ---
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



--- (10013-10079 lines) ---
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


--- (10119-10156 lines) ---
### components/ui/collapsible.tsx Content:

```tsx
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

```


--- (15405-15418 lines) ---
### lib/utils.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

</deer_flow_frontend_code>

<architecture>
--- (13-14 lines) ---
1.  **复杂状态同步与实时性**: 精确管理工作流结构、节点状态、版本信息和实时执行进度，确保数据一致性。
2.  **高信息密度与清晰度**: 实现灵活的三栏式“驾驶舱”布局，清晰展示大量复杂信息（代码、日志、公式）。


--- (20-23 lines) ---
1.  **集中式状态管理**: 使用 Zustand 作为全局状态管理的单一事实来源 (SSOT)。
2.  **明确的数据同步范式**: 严格遵守 API 6.1 原则——**REST API 作为全量快照（Source of Truth），WebSocket 提供增量更新**。在连接恢复和关键事件后执行全量同步。
3.  **关注点分离**: 采用分层架构（UI 层、状态管理层、API 服务层），实现业务逻辑与 UI 的解耦。
4.  **性能优先**: 采用代码分割、Memoization、虚拟化（必要时）和高效的状态更新策略。


--- (39-39 lines) ---
  * **Zustand**: 全局状态管理。采用切片模式 (Slice Pattern) 组织复杂状态。


--- (45-45 lines) ---
  * **Shadcn/ui (基于 Radix UI)**: 基础 UI 组件库，提供可访问性和定制能力。


--- (52-53 lines) ---
  * **Framer Motion**: 核心动效库。用于微交互、转场和关键的布局动画 (Layout Animations)。
  * **`react-resizable-panels`**: **[关键选型]** 实现三栏式驾驶舱布局，支持面板调整、折叠和持久化。


--- (64-64 lines) ---
  * **WebSocket API (或 socket.io-client)**: 用于实时通信。


--- (102-112 lines) ---
└── (platform)/         # 主应用模块 (Protected)
    ├── layout.tsx      # 平台布局 (Global Header, Auth Check)
    │
    ├── projects/
    │   ├── page.tsx    # 项目列表仪表板
    │   └── [projectId]/
    │       ├── layout.tsx
    │       ├── config/page.tsx      # 项目配置页面
    │       └── workflow/            # 工作流执行界面 (The Cockpit)
    │           ├── page.tsx
    │           └── components/      # Cockpit 核心组件 (详见 3.3.3)


--- (141-151 lines) ---
#### 3.3.3 Cockpit 核心组件结构 (位于 `src/app/projects/[projectId]/workflow/components/`)

```
/workflow/components/
├── CockpitLayout.tsx          # 核心三栏布局实现 (react-resizable-panels)
│
├── Navigator/                 # A. 左侧栏：工作流导航器
│   ├── WorkflowNavigator.tsx
│   ├── WorkflowTree.tsx
│   └── NodeTreeItem.tsx
│


--- (170-181 lines) ---
/src/core
├── /api/               # API 服务层
│   ├── client.ts       # Axios 实例配置 (拦截器)
│   ├── auth.service.ts
│   ├── project.service.ts
│   └── workflow.service.ts
├── /websocket/         # WebSocket 管理
│   ├── manager.ts      # 连接管理 (重连、认证)
│   └── dispatcher.ts   # 事件分发到 Zustand
├── /store/             # Zustand 状态管理 (详见第 4 节)
└── /models/            # 数据模型 (TS Interfaces, Zod Schemas)
```


--- (194-195 lines) ---
4.  **Workflow State (核心)**: 当前工作流的结构、节点状态、版本信息（服务器状态缓存）。
5.  **UI Interaction State**: 纯粹的 UI 状态（当前选中的节点、展开/折叠状态等）。


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



--- (285-309 lines) ---
#### 4.3.5 UIInteractionSlice (`uiInteractionSlice.ts`)

管理工作流界面的 UI 状态，与业务数据分离。

```typescript
// src/core/store/slices/uiInteractionSlice.ts
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
```


--- (332-358 lines) ---

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



--- (373-417 lines) ---
## 6\. 核心布局架构：思维驾驶舱 (Core Layout Architecture: The Cockpit)

实现设计文档 3.2.1.C 和 5.1.1 定义的三栏式布局。

### 6.1 布局引擎选型与实现

  * **技术选型**: `react-resizable-panels`。
  * **实现位置**: `src/app/projects/[projectId]/workflow/components/CockpitLayout.tsx`。

### 6.2 布局结构 (Layout Structure)

```tsx
// CockpitLayout.tsx (Conceptual)
<PanelGroup direction="horizontal" autoSaveId="o-award-cockpit-v1">
  {/* A. Navigator */}
  <Panel id="navigator" collapsible={true} minSize={15} className="bg-card">
    <WorkflowNavigator />
  </Panel>
  <CustomResizeHandle />

  {/* B. Workspace */}
  <Panel id="workspace" minSize={50} className="bg-background">
    <NodeWorkspace />
  </Panel>

  {/* C. History (Conditional) */}
  {isHistoryVisible && (
    <>
      <CustomResizeHandle />
      <Panel id="history" collapsible={true} minSize={15} className="bg-card">
        <VersionHistoryPanel />
      </Panel>
    </>
  )}
</PanelGroup>
```

### 6.3 关键实现要求

1.  **全屏高度**: `PanelGroup` 需占满视口高度（减去 Global Header）。
2.  **持久化**: 必须启用 `autoSaveId`，将用户布局偏好存储在 `localStorage`。
3.  **可折叠性**: A 和 C 栏必须支持快速折叠/展开。
4.  **动态可见性 (Panel C)**: `isHistoryVisible` 的逻辑由 `WorkflowSlice` 和 `UIInteractionSlice` 共同决定（仅当选中节点状态为 `Completed` 时显示）。
5.  **视觉层级**: 使用不同的背景色（`bg-card` vs `bg-background`）区分侧边栏和工作区。



--- (420-440 lines) ---
## 7\. 核心组件实现策略 (Core Component Implementation Strategy)

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



--- (497-513 lines) ---
### 8.1 主题与 Token 实现

#### 8.1.1 CSS Variables 与 Tailwind 配置

  * 在 `styles/globals.css` 中实现设计文档 4.1.1.B 的 CSS 变量定义（HSL 格式）。
  * 在 `tailwind.config.ts` 中配置 Tailwind 使用这些变量。
  * 扩展 Tailwind 配置，实现语义化状态色彩（`status-completed`, `status-executing` 等）（设计文档 4.1.1.D）。

#### 8.1.2 主题策略 (Dark Mode First)

  * 使用 `next-themes`，配置 `defaultTheme="dark"`。

### 8.2 字体与排版

  * 使用 `Geist Sans` 和 `Geist Mono`。
  * 遵循高密度排版规则（UI 默认 `text-sm` 14px）。
  * 定制 `@tailwindcss/typography` (`prose`)，减小默认边距（设计文档 4.1.2.D）。

</architecture>



---

<task>


### 任务 11：工作流导航器 (A)：结构、数据绑定与基础导航

**目标：** 实现左侧栏的工作流导航器，提供结构概览和基础导航功能。

**核心关注点：** 层级树状视图、Zustand 数据绑定、节点选择交互。

**实现策略（参考 `<design_doc> 5.1.2`, `<architecture> 7.1`）：**

1.  **组件结构（`Navigator/`）：** 实现 `WorkflowNavigator.tsx`, `WorkflowTree.tsx`, `NodeTreeItem.tsx`。
2.  **数据绑定与加载：**
    *   在 `WorkflowNavigator` 中订阅 `WorkflowSlice`。
    *   在组件挂载时（或路由进入时）调用 `WorkflowSlice.loadWorkflow`（如果数据未加载），并启动 `WebSocketManager.connect`。
3.  **层级视图实现（`WorkflowTree.tsx`）：**
    *   渲染 `Phase -> Stage -> Node` 结构。
    *   使用 Shadcn `Collapsible` 实现 Phase/Stage 的展开/折叠。状态由 `UIInteractionSlice.collapsedPhases` 管理。
4.  **节点项基础实现（`NodeTreeItem.tsx`）：**
    *   实现高密度布局（`h-8`, `text-sm`）。
    *   **导航交互：** 点击节点时，调用 `UIInteractionSlice.selectNode(nodeId)`。
    *   **选中状态样式：** 实现清晰的选中状态视觉反馈（背景高亮 `bg-accent` 和左侧 `border-l-4 border-primary` 激活条）（`<design_doc> 5.1.2.A2`）。

**输入：** 任务 4, 9, 10 的输出（WorkflowSlice, Sync Strategy, Cockpit Layout）, `<design_doc> 5.1.2`, `<architecture> 7.1`。
**输出：** 实现了可导航、可折叠的工作流层级视图，并与全局状态集成。


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
