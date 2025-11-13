<design_doc>
--- (172-173 lines) ---

我们的愿景是打造一个使专家用户能够完全掌控复杂建模工作流的“思维驾驶舱”。它将 AI 的探索能力与人类的战略智慧无缝融合，提供无与伦比的透明度、控制力和迭代效率。用户应感受到自己正在操作一台强大、可靠且高度响应的专业精密仪器。


--- (349-350 lines) ---
                  * **/workflow** (工作流执行界面 - 核心交互区)
          * **/settings** (用户设置中心): /profile, /preferences, /engine.


--- (363-377 lines) ---
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


--- (379-433 lines) ---
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

##### B. 中心面板：节点交互工作区 (Node Interaction Workspace - The Action)

  * **目标:** 提供当前选中节点的专注交互环境。

  * **结构:** 采用“交互记录 (Interaction Transcript)”的视觉隐喻，按时间顺序展示节点的活动记录。

  * **B1. Workspace Header (固定顶部):**

      * [Node Title] 和 [Current Status]。
      * [Contextual Toolbar]: 根据节点状态动态显示操作按钮（Re-execute, Manual Edit, Cancel, Retry）。
      * [Staleness Banner]: 如果 `is_stale: true`，显示醒目的横幅提示。

  * **B2. Interaction Transcript (主内容区，可滚动):**

      * 展示当前查看的版本（`active_version` 或 `pending_result`）的完整上下文。
      * **Block 1: Inputs & Dependencies:** (默认折叠) 显示消费的上游节点版本信息。
      * **Block 2: Execution Artifacts:** 展示 `prompt`, `generated_code.py`, `execution.log`。使用专用的查看器组件。
      * **Block 3: Generated Output:** 核心内容展示区（Markdown, LaTeX, 图表）。
      * **Block 4: HITL Interaction Zone:**
          * `Awaiting HITL Approval` 时: 激活特定的 HITL 界面（SCA/AVL/VARL）。
          * `Completed` 时: 显示该版本的 HITL 历史记录。

  * **B3. Action Footer (固定底部，条件显示):**

      * 仅在 `Awaiting HITL Approval` 状态下显示。
      * 提供主要的 HITL 操作：[Discard Execution], [Reject & Provide Feedback], [Approve & Continue]。

  * **动态行为 (Dynamic Behavior):**

      * `Executing`: B2 突出显示实时日志/进度。B1 显示 [Cancel]。
      * `Manual Editing Mode`: B2.Block 3 切换为编辑器。B3 变为 [Cancel Edit], [Save New Version]。

##### C. 右侧栏：版本历史面板 (Version History Panel - The Memory)

  * **目标:** 管理当前选中节点的历史版本，支持快速审阅、对比和回溯。
  * **可见性规则:** 仅当 Center Workspace 处于 `Completed` (Review Mode) 状态时显示。在 `Executing` 或 `Awaiting HITL Approval` 时自动隐藏。
  * **结构:** 垂直的“版本卡片列表 (Version Card List)”，按时间倒序排列。
  * **卡片信息:** 版本号 (V1, V2...), **[Active Tag]**, 时间戳, 来源图标 (🤖/✏️), 版本摘要。
  * **交互逻辑:**
      * **Review:** 点击卡片在 Center Workspace 加载该版本的详情。
      * **Activate:** 在非激活版本上提供 [Set as Active Version] 按钮。点击后触发全局 Staleness 刷新。



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



--- (951-962 lines) ---
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


--- (964-967 lines) ---
  /* Primary (Cyber Blue) - 在深色下更明亮 */
  --primary: 217.2 91.2% 59.8%;    /* Blue-500 */
  --primary-foreground: 222.2 47.4% 11.2%; /* Dark text for contrast */



--- (984-987 lines) ---
  /* Border & Input - 在深色下保持清晰但不过于刺眼 */
  --border: 217.2 32.6% 17.5%;     /* Slate-800 */
  --input: 217.2 32.6% 17.5%;
  --ring: 217.2 91.2% 59.8%;


--- (1165-1201 lines) ---
##### B. 网格与布局 (Grid and Layout)

1.  **内容网格:** 内容区域内部使用标准的 **12 列 CSS Grid** 布局。
2.  **核心布局 (Cockpit Layout):** 工作流执行界面采用灵活的三栏式结构。
      * **实现技术:** 必须使用 `react-resizable-panels` 库实现。
      * **要求:**
          * 支持拖拽调整 Navigator (A), Workspace (B), History (C) 的宽度。
          * A 和 C 栏必须支持快速折叠/展开。
          * 用户的布局配置必须持久化存储于 `localStorage`（使用 `autoSaveId` 属性）。
          * 设置合理的最小尺寸限制。

<!-- end list -->

```tsx
// Implementation Snippet using react-resizable-panels
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// Example usage in Workflow Layout
<PanelGroup direction="horizontal" autoSaveId="workflow-cockpit-layout">
  <Panel id="navigator" collapsible={true} minSize={15} defaultSize={20}>
    {/* A. Navigator Content */}
  </Panel>
  <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
  <Panel id="workspace" minSize={50}>
    {/* B. Workspace Content */}
  </Panel>
  {/* Conditionally render History Panel based on node state */}
  {isHistoryVisible && (
    <>
      <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
      <Panel id="history" collapsible={true} minSize={15} defaultSize={20}>
        {/* C. History Content */}
      </Panel>
    </>
  )}
</PanelGroup>
```


--- (1431-1484 lines) ---
### 5.1 高保真页面描述（文本描述）(High-Fidelity Page Descriptions - Textual Description)

本节详细描述核心界面——工作流执行界面（The Cockpit Layout）的高保真设计实现细节。它将设计系统（阶段 4）应用于线框图结构（阶段 3），明确了布局参数、视觉属性和组件配置。本描述假定平台处于默认的**深色模式 (Dark Mode)**。

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



--- (1515-1557 lines) ---
#### 5.1.3 B. 节点交互工作区 (Node Interaction Workspace - Center Panel)

采用“交互记录 (Interaction Transcript)”模型。

**B1. 工作区头部 (Workspace Header - Fixed Top):**

  * 高度 `h-12` (48px)。`border-b`。
  * **Title:** `text-lg font-semibold`。
  * **Status Badge:** 使用 `Shadcn/ui Badge`，动态应用状态色彩。
  * **Contextual Toolbar:** 动态按钮组（`size="sm"`）。

**B1.1 过时状态横幅 (Staleness Banner - Conditional):**

  * 如果 `is_stale: true`，在 Header 下方显示。
  * 使用 `Shadcn/ui Alert` (定制 Amber variant)。文案遵循 3.3.D.2。

**B2. 交互记录内容区 (Interaction Transcript - Scrollable):**

  * **布局:** `space-y-6 p-6`。

  * **区块实现:** 使用 `Shadcn/ui Card` 作为容器，并结合 `Collapsible` 实现展开/折叠。

  * **Block 2: Execution Artifacts:**

      * 使用 `Shadcn/ui Tabs` 组织：[Prompt], [Code], [Logs]。
      * **内容查看器:** 必须使用 `Monaco Editor` 只读模式。
          * 主题：匹配 Dark Mode。
          * 字体：`font-mono` (Geist Mono), `text-sm`。
          * 背景：`bg-background` (比 Card 背景更深)。
          * 功能：提供 [Copy] / [Download] 按钮。Logs 模式必须支持自动滚动。

  * **Block 3: Generated Output:**

      * **View Mode:** 使用 `react-markdown`。应用 `prose dark:prose-invert` 类（遵循 4.1.2.D 定制样式）。
      * **Edit Mode:** 切换为 `Novel/Tiptap`（富文本）或 `Monaco Editor`（代码）。

**B3. 操作底部栏 (Action Footer - Fixed Bottom):**

  * 仅在 `Awaiting HITL Approval` 时显示。
  * 高度 `h-16` (64px)。`border-t`。背景 `bg-card`。
  * 布局：`flex justify-end space-x-4`。
  * 按钮配置：[Discard] (`ghost`), [Reject] (`secondary`), [Approve] (`primary`)。



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



--- (1734-1734 lines) ---
  * **专业组件:** Monaco Editor, Novel/Tiptap, `react-resizable-panels`.


--- (1762-1763 lines) ---
  * **布局:** 使用 `react-resizable-panels` 实现 Cockpit Layout，配置需持久化。



--- (1788-1792 lines) ---
  * **工作流执行界面 (Cockpit Layout):**
      * 整体布局与面板管理：详见 5.1.1。
      * A. Workflow Navigator：详见 5.1.2。
      * B. Node Interaction Workspace (Transcript Model)：详见 5.1.3。
      * C. Version History Panel：详见 5.1.4。

</design_doc>

<api>
--- (712-748 lines) ---
### 3. 工作流编排与导出

#### 3.1. 启动项目工作流

*   **Endpoint**: `POST /projects/{project_id}/start`
*   **权限**: 项目所有者。
*   **描述**: 这是项目从“配置”到“运行”的关键操作。执行此操作会：
    1.  **校验前置条件**: 检查项目状态、问题类型是否设置、以及是否已上传“问题描述”文件。
    2.  **创建配置快照**: 永久记录用户当前的个人设置。
    3.  **创建工作流实例**: 在数据库中生成完整的工作流结构。
    4.  **变更项目状态**: 将项目状态更新为 `Running`。
    5.  **启动执行**: 将工作流的第一个节点加入后台执行队列。

##### 执行影响
*   **异步处理**: 这是一个异步操作，API 会立即返回 `202 Accepted`，表示任务已接收。
*   **状态变更**: 项目的 `status` 将变为 `Running`。
*   **WebSocket 事件**: 后续的节点状态更新将通过 WebSocket 的 `NODE_STATUS_UPDATED` 事件推送。
*   **UI 交互**: 前端在收到 `202` 响应后，应立即禁用“启动”按钮并显示加载状态，然后根据 WebSocket 事件更新界面。

##### 成功响应 (`202 Accepted`)
请求被接受，后台任务已启动。响应体是新创建工作流的**第一个节点**的实例信息 (`NodeInstanceRead`)。前端可以利用这个信息直接导航到第一个节点的视图。
```jsonc
{
  "id": 100,
  "definition_id": "1.1.1",
  "name": "Problem Deconstruction and Mathematical Formulation",
  "status": "Executing", // 注意：状态已是Executing，表示任务已成功入队
  "current_stage": "Initializing",
  "node_type": "Standard",
  "hitl_mode": "AVL",
  "order_index": 0,
  "active_version_id": null,
  "phase_id": "Phase 1: Strategic Analysis & Macro Architecture",
  "task_group_id": null,
  "is_stale": false
}
```


--- (824-834 lines) ---
#### 5.2. ProjectDetailRead

用于展示单个项目详情的完整信息对象，继承自 `ProjectSummaryRead`。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| *(所有 ProjectSummaryRead 字段)* | | ... |
| `description` | string \| null | 项目的详细描述。 |
| `files` | array (ProjectFileRead) | 与项目关联的文件列表。参见 `ProjectFileRead` 定义。 |
| `historical_problem_id` | integer \| null | 如果项目基于历史案例初始化，则为该案例的 ID。 |



--- (877-886 lines) ---
### 核心概念

*   **项目与工作流**: 每个`项目 (Project)`在生命周期中最多拥有一个`工作流实例 (WorkflowInstance)`。工作流的创建和管理都与项目强绑定。
*   **工作流状态**:
    *   `Running`: 表示工作流已激活，可以或正在执行节点。**注意**: 一个新创建的工作流默认为此状态，但这仅表示“准备就绪”，并不意味着有节点正在执行。
    *   `Completed`: 工作流中所有节点均已成功执行完毕。
*   **阶段层级**: 所有工作流数据都以 `Phase -> Stage -> Node` 的树形结构通过 `WorkflowInstanceRead.phases` 返回。`stage_id` 与 `stage_name` 已成为节点的一等字段，前端无需再根据 `phase_id` 进行分组。
*   **动态结构**: 工作流的结构并非完全静态。当一个 `node_type` 为 `Generator` 的节点执行完成后，它会向当前工作流中**动态插入**一系列新的节点。
    *   **前端关键**: 必须监听 `WORKFLOW_STRUCTURE_UPDATED` WebSocket 事件。收到此事件后，应立即废弃本地的工作流结构缓存，并调用 `GET /workflows/{workflow_id}` 重新获取完整的 `phases` 树来刷新视图。



--- (1001-1180 lines) ---
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

#### 2.2. 更新工作流

*   **Endpoint**: `PATCH /workflows/{workflow_id}`
*   **权限**: 工作流所有者。
*   **描述**: 目前仅支持更新工作流名称。

##### 请求体 (`WorkflowUpdate`)
```json
{ "name": "Updated Workflow Name" }
```
*   `name` (string, *optional*): 新的工作流名称。

##### 成功响应 (`200 OK`)
返回更新后的 `WorkflowInstanceRead` 对象。

#### 2.3. 删除工作流

永久删除一个工作流及其所有关联数据。

*   **Endpoint**: `DELETE /workflows/{workflow_id}`
*   **权限**: 工作流所有者。
*   **警告**: 此操作不可逆，将删除所有节点、版本和结果。

##### 成功响应 (`204 No Content`)

##### 错误响应
*   `409 Conflict` (error_code: `WORKFLOW_IS_ACTIVE`): 无法删除一个正在执行节点的工作流。

##### > 前端实现要点
> *   在执行此操作前，务必向用户展示一个醒目的确认对话框。
> *   成功删除后，应将用户重定向至项目列表或仪表盘页面。

---
### 3. 工作流状态洞察

#### 3.1. 批量获取工作流节点过时信息

高效检查工作流中所有节点的输入依赖是否过时。

*   **Endpoint**: `GET /workflows/{workflow_id}/staleness`
*   **权限**: 工作流所有者。
*   **描述**: 返回一个映射，键为已过时的节点 ID，值为其过时原因的详细信息。

##### 成功响应 (`200 OK`)
```jsonc
{
  "105": [ // 节点 ID 105 已过时
    {
      "upstream_node_id": 101, // 上游依赖节点的 ID
      "upstream_definition_id": "1.1.1",
      "consumed_version_id": 1, // 它上次用的是版本 1
      "current_active_version_id": 2 // 但上游现在是版本 2
    }
  ]
}
```
##### > 前端实现要点
> *   **何时调用**:
>     1.  **[更新]** 当用户需要查看**为什么**一个节点是过时的（例如，鼠标悬浮在警告图标上时），可以调用此接口获取详细信息。 `is_stale` 标志提供了 "是否过时" 的信息，此接口提供了 "为何过时" 的答案。
>     2.  当任何节点的版本发生变更后（如：用户批准 HITL、手动编辑、切换历史版本）。
> *   **如何使用**: 遍历返回的字典的键（`"105"`），在画布上找到对应的节点，并为其添加一个视觉提示（如警告图标、虚线边框等），并在鼠标悬浮时展示过时详情。

---

### 4. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了工作流管理模块中使用的核心数据对象。

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



--- (1235-1338 lines) ---
#### 1.1. 获取节点详细信息

此端点是渲染节点视图的主力，提供单个节点的完整状态、数据和上下文信息。

*   **Endpoint**: `GET /nodes/{node_id}`
*   **权限**: 必须是该节点所属工作流的所有者。
*   **描述**:
    *   查询并返回指定 `node_id` 的详细视图。
    *   **关键逻辑 (R5.2)**: 如果请求的节点处于 `NOT_STARTED` 状态，后端会校验其是否超前于工作流的“执行前沿”。若超前，将返回 `403 Forbidden`。
    *   **过时检查**: 响应中包含 `staleness_report` 字段，前端应检查此字段，若非空，则在 UI 上明确提示用户此节点的输入依赖已更新。

##### 路径参数
*   `node_id` (integer, **required**): 要查询的节点实例的唯一ID。

##### 成功响应 (`200 OK`)
返回一个 `NodeDetailView` 对象。

```jsonc
{
  "id": 101,
  "definition_id": "1.1.2",
  "name": "Architecture Design and Task Decomposition",
  "status": "Awaiting HITL Approval", // 节点当前的主状态，用于控制UI的主要交互
  "current_stage": "Awaiting Review", // 节点的详细执行阶段，用于更精细的UI展示（如进度条、状态文本）
  "node_type": "Generator",
  "hitl_mode": "SCA",
  "order_index": 1,
  "active_version_id": null, // 当节点未完成时，没有活动版本
  "phase_id": "Phase 1: Strategic Analysis & Macro Architecture",
  "stage_id": "1.1",
  "stage_name": "Strategic Definition",
  "task_group_id": null,
  "is_stale": false, // [新增] 指示节点是否过时
  "active_version": null, // 如果节点已完成，这里会包含其活动版本的数据
  "pending_result": { // 当节点在执行或等待审批时，临时结果会在这里。这是HITL界面的主要数据源
    "output_data": {
      "candidates": [
        { "id": "OptA", "name": "Optimization Approach", "...": "..." },
        { "id": "OptB", "name": "Simulation Approach", "...": "..." }
      ],
      "comparative_analysis": "Simulated LLM output comparing options..."
    },
    "accumulated_hitl_interactions": [],
    "error_log": null // 如果执行失败，这里会包含详细的错误日志
  },
  "staleness_report": null // 若非空，表示此节点的输入依赖已过时，UI应提示用户
}
```

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

##### 错误响应
*   `401 Unauthorized`: 认证失败。
*   `403 Forbidden`: 用户无权访问该节点，或试图访问未解锁的节点。
*   `404 Not Found`: 指定的 `node_id` 不存在。

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

#### 1.3. 获取特定版本的详细信息

*   **Endpoint**: `GET /nodes/{node_id}/versions/{version_id}`
*   **权限**: 节点所有者。
*   **描述**: 获取单个版本的完整信息，包括其具体的 `output_data` 和 `hitl_history`。

---


--- (1592-1639 lines) ---
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


</api>

<front_stack>
--- (9-11 lines) ---
| **React** | 项目的核心 UI 库，所有组件都基于 React 构建。 |
| **Next.js** | 应用框架，提供了服务器端渲染 (SSR)、静态站点生成 (SSG)、基于 `app` 目录的文件系统路由、API 路由以及其他现代化 Web 开发功能。 |
| | ↳ **App Router** | 项目采用最新的 App Router 架构，支持 React Server Components (RSC) 和客户端组件。 |


--- (24-24 lines) ---
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |


--- (34-43 lines) ---
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


--- (47-51 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |


--- (161-161 lines) ---
| **LocalStorage 持久化** | `settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数提供了一个简洁明了的模式，用于将 Zustand store 的状态与 `localStorage` 同步，实现了用户设置的持久化。 |


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


</front_stack>

<deer_flow_frontend_code>
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



--- (3441-3564 lines) ---
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

```


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


--- (6703-6722 lines) ---

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


--- (8396-8517 lines) ---
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



--- (8780-8878 lines) ---
### components/ui/card.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import * as React from "react"

import { cn } from "~/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}



--- (10056-10093 lines) ---
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


--- (13247-13309 lines) ---
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
--- (1-4 lines) ---
## O-Award 建模平台：前端架构设计文档 (Frontend Architecture Design Document)

本文档提供了 O-Award 建模平台前端实现的全面架构设计。该平台旨在实现“专家的思维驾驶舱 (The Expert's Cognitive Cockpit)”体验愿景和“精密未来主义 (Precision Futurism)”美学风格，基于 Deer-Flow 技术栈进行构建和扩展。



--- (13-14 lines) ---
1.  **复杂状态同步与实时性**: 精确管理工作流结构、节点状态、版本信息和实时执行进度，确保数据一致性。
2.  **高信息密度与清晰度**: 实现灵活的三栏式“驾驶舱”布局，清晰展示大量复杂信息（代码、日志、公式）。


--- (52-54 lines) ---
  * **Framer Motion**: 核心动效库。用于微交互、转场和关键的布局动画 (Layout Animations)。
  * **`react-resizable-panels`**: **[关键选型]** 实现三栏式驾驶舱布局，支持面板调整、折叠和持久化。



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


--- (141-165 lines) ---
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
├── Workspace/                 # B. 中心面板：节点交互工作区
│   ├── NodeWorkspace.tsx
│   ├── WorkspaceHeader.tsx (B1)
│   ├── InteractionTranscript.tsx (B2)
│   ├── ActionFooter.tsx (B3)
│   └── blocks/
│       ├── InputsBlock.tsx
│       ├── ArtifactsBlock.tsx
│       └── OutputBlock.tsx
│
└── History/                   # C. 右侧栏：版本历史面板
    ├── VersionHistoryPanel.tsx
    └── VersionCard.tsx
```


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



--- (422-425 lines) ---
### 7.1 A. 工作流导航器 (Workflow Navigator)

**文件**: `WorkflowNavigator.tsx`, `NodeTreeItem.tsx`。



--- (441-444 lines) ---
### 7.2 B. 节点交互工作区 (Node Interaction Workspace)

**文件**: `NodeWorkspace.tsx`。



--- (471-474 lines) ---
### 7.3 C. 版本历史面板 (Version History Panel)

**文件**: `VersionHistoryPanel.tsx`, `VersionCard.tsx`。


</architecture>



---

<task>


### 任务 10：The Cockpit 布局实现（三栏式驾驶舱）

**目标：** 实现工作流执行界面的核心布局——三栏式“思维驾驶舱”，支持面板调整大小、折叠和持久化，严格遵循设计规范。

**核心关注点：** `react-resizable-panels` 集成、布局灵活性、视觉层级、持久化配置。

**实现策略（参考 `<design_doc> 5.1.1`, `<architecture> 6`）：**

1.  **页面与路由：** 实现工作流执行页面（`src/app/(platform)/projects/[projectId]/workflow/page.tsx` 新建）。
2.  **CockpitLayout 组件实现（`src/app/.../workflow/components/CockpitLayout.tsx` 新建）：**
    *   使用 `react-resizable-panels` 实现三栏结构（A. Navigator, B. Workspace, C. History）。
3.  **面板配置与行为：**
    *   设置合理的 `minSize`。确保布局占满全屏高度（减去 Global Header）。
    *   配置 A 和 C 栏为 `collapsible={true}`。
    *   **关键实现：** 启用 `autoSaveId`（例如 `"o-award-cockpit-v1"`），确保持久化用户布局偏好（`<design_doc> 4.1.3.B.2`）。
4.  **视觉层级实现（`<design_doc> 5.1.1`）：**
    *   A/C 栏使用 `bg-card` (Slate 900)，B 栏使用 `bg-background` (Slate 950)。
    *   定制 `PanelResizeHandle` 样式（`w-1 bg-border`，Hover 时变为 `bg-primary/70`）。
5.  **动态可见性（Panel C，占位）：** 实现 Panel C 的条件渲染逻辑（暂设为始终可见，后续任务连接到 Store）。
6.  **占位符组件：** 为 A, B, C 三个面板创建基础占位符组件。

**输入：** 任务 1 的输出（设计系统）, `<design_doc> 5.1.1, 4.1.3.B`, `<architecture> 6`。
**输出：** 灵活、可调整且持久化的三栏式工作流主界面布局骨架。


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
