<design_doc>
--- (289-306 lines) ---
  * **TemporaryExecutionResult (临时执行结果)**
      * *定义:* 节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时产物（存储于 `NodeDetailView.pending_result`）。
      * `output_data` (object): AI 生成的当前临时输出。
      * `execution_artifacts` (object): 当前执行周期内产生的产物（详见 2.1.2）。
      * `accumulated_hitl_interactions` (array): 当前周期内累积的 HITL 记录。
      * `error_log` (string | null).
  * **NodeVersion (节点版本快照)**
      * *定义:* 节点执行成功并被批准后的不可变、完整上下文快照 (SRS 3.2)。
      * `id`, `version_number`.
      * `source` (enum: AI\_GENERATED, MANUALLY\_EDITED).
      * `summary` (string).
      * *The Snapshot (核心内容):*
          * `output_data` (object): 最终输出数据。
          * `execution_artifacts` (object): 执行产物。
          * `input_dependencies` (object: `{upstream_node_id: version_id}`): **(前端关键：用于溯源和展示依赖详情)**。
          * `hitl_history` (array): 创建此版本的所有 HITL 交互记录。
      * *Environment Parameters:* `llm_model_name`, `temperature`.



--- (319-331 lines) ---
##### B. 执行产物分类 (Execution Artifacts Taxonomy)

这是实现“彻底的透明度”的关键内容分类。`ExecutionArtifacts` 对象包含以下几类内容：

1.  **AI 交互记录 (AI Interaction Logs):**
      * `prompt`: 发送给 LLM 的完整提示内容。
      * `raw_llm_response`: LLM 返回的原始响应文本。
2.  **代码生成与执行 (Code Generation and Execution):**
      * `generated_code.py`: AI 生成的可执行 Python 代码。
      * `execution.log`: 代码执行的标准输出 (stdout) 和标准错误 (stderr) 日志。
3.  **外部工具调用 (External Tool Calls):**
      * `tool_call_log`: 外部工具（如搜索引擎）的调用参数和返回结果记录。



--- (392-423 lines) ---
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



--- (500-520 lines) ---
#### 2.3.3 任务流 3：中间结果的人工编辑 (Task Flow: Manual Editing of Intermediate Results)

**场景:** 用户决定直接修改 Node C 的输出，而不通过 AI 重新生成。

**流程:**

1.  **用户启动编辑模式:**
      * 用户查看 Node C（`Completed` 状态）。
      * 用户点击 Contextual Toolbar (B1) 的 [Manual Edit]。*(校验：Generator Node 禁用此操作)*。
2.  **UI 切换到编辑器:**
      * Center Workspace (B) 的 `Generated Output` 区块切换为编辑器（e.g., Novel/Tiptap 或 Code Editor），加载当前版本内容。
      * Toolbar 按钮更换为 [Cancel Edit] 和 [Save New Version]。
3.  **用户编辑与保存:**
      * 用户修改内容。
      * 用户点击 [Save New Version]，输入版本摘要并确认。
      * **系统响应 (API):** `POST /nodes/C/manual-edit`。
      * **系统处理 (后端):** 创建新的 `NodeVersion` (V2)，`source="MANUALLY_EDITED"`。将 V2 设为 `active_version`。
4.  **状态更新与传播:**
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node C)。
      * **前端响应:** UI 退出编辑模式。Right Sidebar 更新。前端触发工作流全量状态刷新（同 2.3.2 步骤 4），更新下游节点的 `is_stale` 标志。



--- (552-582 lines) ---
#### A. 高密度内容展示 (High-Density Content Display)

1.  **专业文档与公式渲染 (Professional Markdown/LaTeX Renderer):**

      * **应用场景：** `Generated Output` 的展示（非编辑状态）。
      * **实现：** 基于 `react-markdown`，集成 `remark-gfm`, `remark-math`, `rehype-katex`。
      * **要求：** 使用 `@tailwindcss/typography` (`prose` class) 进行专业排版，但需定制样式以支持高密度显示（例如，减小行高和边距）。确保 KaTeX 公式渲染清晰、准确。

2.  **代码与结构化数据查看器 (Code and Data Viewer):**

      * **应用场景：** 展示 `Execution Artifacts`（Prompt, generated\_code.py, JSON 数据）。
      * **实现：** 推荐使用 `Monaco Editor` 的只读模式，以提供最佳的性能、语法高亮、代码折叠和搜索功能。备选方案为 `react-syntax-highlighter`。
      * **要求：** 使用高质量等宽字体（如 Geist Mono）。提供“复制到剪贴板”和“下载”快捷操作。

3.  **实时日志查看器 (Live Log Viewer):**

      * **应用场景：** 展示 `execution.log`，特别是在 `Executing` 状态下。
      * **实现：** 基于 Code Viewer 扩展。
      * **要求：**
          * **实时流式传输：** 支持实时追加内容。
          * **自动滚动：** 默认自动滚动到底部（使用 `use-stick-to-bottom` Hook）。用户手动滚动时应暂停自动滚动，并提供“返回底部”按钮。
          * **性能：** 对于超长日志，应采用虚拟滚动（可引入 `tanstack-virtual`）以保证性能。

#### B. 交互记录（Interaction Transcript）

这是“节点交互工作区 (Workspace)”的核心组织模式，用于实现“彻底的透明度与可追溯性”。

  * **结构模型：** 将节点的完整上下文（输入、过程、输出、交互）组织成一个线性的记录流。
  * **区块实现：** 记录流由多个区块组成（Inputs, Artifacts, Output, HITL Zone）。使用 Shadcn/ui `Accordion` 或 `Collapsible` 实现区块的展开/折叠。
  * **默认状态：** 关键区块（Output, HITL Zone）默认展开；辅助信息区块（Inputs, Artifacts）默认折叠。



--- (761-805 lines) ---
#### B. 节点交互工作区 (Node Interaction Workspace - Center Panel)

**通用结构:** 分为固定头部 (B1)、可滚动内容区 (B2) 和固定底部 (B3)。

```
[B. Node Interaction Workspace]
|
+-- [B1. Workspace Header] (Fixed Top)
|   |-- [Title]: [ID] | [Name]
|   |-- [Status Badge]: (e.g., Awaiting HITL)
|   |-- [Contextual Toolbar]: (Dynamic Buttons)
|   +-- [Staleness Banner] (Conditional Alert Banner if is_stale=true)
|
+-- [B2. Interaction Transcript] (Scrollable Content)
|   |
|   +-- [Block 1: Inputs & Dependencies] (Collapsible, Default Collapsed)
|   +-- [Block 2: Execution Artifacts] (Collapsible, Default Collapsed)
|   |   |-- [Tabs: Prompt | Code | Logs]
|   |   |-- [Code/Log Viewer]
|   +-- [Block 3: Generated Output] (Main Content, Default Expanded)
|   |   |-- [Markdown/LaTeX Renderer OR Editor]
|   +-- [Block 4: HITL Interaction Zone] (Dynamic Content, Default Expanded)
|
+-- [B3. Action Footer] (Fixed Bottom, Conditional Visibility)
    |-- [Secondary Actions] (e.g., Discard)
    |-- [Primary Actions] (e.g., Reject, Approve)
```

**状态变化详解:**

  * **`Awaiting HITL Approval`:**
      * B1 Toolbar: 隐藏。
      * B2 Block 4: 激活 HITL 交互界面（如 SCA 选择器）。
      * B3 Footer: 显示。
  * **`Completed` (Review Mode):**
      * B1 Toolbar: 显示 [Re-execute], [Manual Edit]。
      * B2 Block 4: 显示只读的 HITL 历史记录。
      * B3 Footer: 隐藏。
      * **Right Sidebar (C): 显示。**
  * **`Executing`:**
      * B1 Toolbar: 显示 [Cancel Execution]。
      * B2 Block 2: 展开并激活实时日志查看器。
      * B2 Block 3 & 4: 加载状态或为空。
      * B3 Footer: 隐藏。



--- (932-951 lines) ---
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%; /* Slate-500 */

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  /* Destructive (Red) */
  --destructive: 0 84.2% 60.2%;    /* Red-500 */
  --destructive-foreground: 210 40% 98%;

  /* Borders and Inputs */
  --border: 214.3 31.8% 91.4%;     /* Slate-200 */
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;

  /* UI Radius (See 4.1.4) */
  --radius: 0.5rem; /* 8px - Base radius */
}

.dark {


--- (953-972 lines) ---
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


--- (1045-1067 lines) ---
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

// Export the font objects directly if using the 'geist' package approach
export const fontSans = GeistSans;
export const fontMono = GeistMono;
```

```tsx
// app/layout.tsx
import { fontSans, fontMono } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          // Apply CSS variables for Tailwind integration
          fontSans.variable,
          fontMono.variable
        )}


--- (1108-1147 lines) ---
##### D. 富文本排版规范 (Prose/Markdown Typography)

使用 `@tailwindcss/typography` (`prose` class) 渲染 Markdown 内容。需要对其默认样式进行定制，以提高信息密度。

```javascript
// tailwind.config.js (Customizing Typography Plugin)
module.exports = {
  // ...
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            // 提高信息密度：减小默认的段落和标题边距
            p: { marginTop: theme('spacing.3'), marginBottom: theme('spacing.3') },
            h1: { marginTop: theme('spacing.6'), marginBottom: theme('spacing.4') },
            h2: { marginTop: theme('spacing.5'), marginBottom: theme('spacing.3') },
            // ... (customize other elements as needed)

            // 代码块样式定制
            'pre': {
              // 使用比 card 更深的背景（例如 background），增强对比
              backgroundColor: theme('colors.background'),
              fontFamily: theme('fontFamily.mono'),
            },
            'code': {
              fontFamily: theme('fontFamily.mono'),
            },
          },
        },
        // 确保深色模式适配 (使用 prose-invert)
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

// Usage: <div className="prose dark:prose-invert">...</div>
```



--- (1400-1413 lines) ---
##### 3\. 代码/日志查看器与编辑器 (Code/Log Viewer and Editor)

  * **实现：** 基于 `Monaco Editor`。
  * **视觉属性：**
      * 主题：定制 Monaco 主题以匹配平台的 Dark/Light 模式。
      * 字体：`Geist Mono`, `text-sm` (14px)。
  * **功能：** 支持只读模式和编辑模式。提供语法高亮、代码折叠、复制/下载操作。日志模式下支持自动滚动到底部（使用 `use-stick-to-bottom` Hook）。

##### 4\. 富文本/Markdown 编辑器 (Rich Text/Markdown Editor)

  * **实现：** 基于 `Novel` (Tiptap)。
  * **视觉属性：** 编辑器 UI（工具栏、浮动菜单）必须深度定制，以匹配全局组件风格。内容排版遵循 `prose` 规范（4.1.2.D）。
  * **功能：** 支持 GFM、LaTeX 公式编辑和实时预览 (KaTeX)。



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



--- (1578-1587 lines) ---

##### State: `Executing`

  * **Navigator (A):** 图标为 `Loader2` (Cyan, `animate-spin`)。
  * **Workspace (B):**
      * B1: Toolbar 显示 [Cancel Execution]。
      * B2: Block 2 (Artifacts) 自动展开，焦点在 `Logs` Tab，实时显示日志流。
      * **视觉增强:** 在 Workspace (B) 容器边缘激活 `Magic UI BorderBeam` 动画（Cyan 色调），表示计算活动。
  * **History (C):** 隐藏。



--- (1774-1785 lines) ---
#### 5.3.4 核心 UI 组件库规范索引 (Core UI Component Library Specification Index)

*(详见 4.3)*

  * **基础组件 (Shadcn/ui):** 遵循 Token 定制 Button, Input, Card, Badge 等。
  * **专业复合组件:**
      * **Workflow Node Status Indicator:** 实现规范见 5.1.2.A3-A4。
      * **Version Card:** 实现规范见 5.1.4.C2-C3。
      * **Code/Log Viewer (Monaco):** 实现规范见 5.1.3.B2 (Block 2)。
      * **Rich Text Editor (Novel/Tiptap):** 实现规范见 5.1.3.B2 (Block 3)。
      * **HITL Panels (SCA/AVL):** 实现规范见 4.3.B.5。



--- (1787-1794 lines) ---

  * **工作流执行界面 (Cockpit Layout):**
      * 整体布局与面板管理：详见 5.1.1。
      * A. Workflow Navigator：详见 5.1.2。
      * B. Node Interaction Workspace (Transcript Model)：详见 5.1.3。
      * C. Version History Panel：详见 5.1.4。
      * Workspace 状态变化详解 (`Executing`, `Awaiting HITL`, `Completed`, `Stale`, `Editing`): 详见 5.1.5（阶段 5.1 的另一份候选文档中）。


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



--- (1233-1300 lines) ---
### 1. 节点查询与展示

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



--- (1332-1338 lines) ---
#### 1.3. 获取特定版本的详细信息

*   **Endpoint**: `GET /nodes/{node_id}/versions/{version_id}`
*   **权限**: 节点所有者。
*   **描述**: 获取单个版本的完整信息，包括其具体的 `output_data` 和 `hitl_history`。

---


--- (1536-1583 lines) ---
### 5. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了节点与执行控制模块中使用的核心数据对象。

#### 5.1. NodeDetailView

`GET /nodes/{node_id}` 返回的节点详细视图对象，继承自 `NodeInstanceRead`。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| *(所有 NodeInstanceRead 字段)* | | 参见项目管理文档中的 `NodeInstanceRead` 定义。 |
| `active_version` | object (NodeVersionRead) \| null | 如果节点已完成，此字段包含其当前活动版本的完整数据。 |
| `pending_result` | object (TemporaryExecutionRead) \| null | 如果节点正在执行或等待审批，此字段包含其临时的、未固化的结果。 |
| `staleness_report` | array (StalenessInfo) \| null | 如果节点的上游依赖已更新，此列表将包含详细的过时信息。 |

#### 5.2. NodeVersionRead

表示一个已固化的节点版本。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 版本的唯一标识符。 |
| `version_number`| integer | 版本号，在单个节点内递增。 |
| `node_instance_id` | integer | 所属节点实例的 ID。 |
| `summary` | string | 对此版本创建原因的简短总结 (例如, "Manually edited...")。 |
| `source` | string (enum) | 版本的来源。可选值: `"AI_GENERATED"`, `"MANUALLY_EDITED"`。 |
| `based_on_version_id` | integer \| null | 此版本所基于的前一个版本的 ID。 |
| `output_data` | object \| null | 节点执行后，经过 HITL 处理的最终输出数据。 |
| `raw_generated_output`| object \| null | AI 或执行引擎生成的原始、未经处理的输出数据。 |
| **`execution_artifacts`** | **object \| null** | **[新增]** 包含了执行此版本时产生的关键产物，用于数据溯源。可能包含：`prompt` (发送给LLM的提示), `generated_code.py` (生成的代码), `execution.log` (代码执行日志)等。 |
| `input_dependencies` | object | 一个映射 `{[upstream_node_id]: [consumed_version_id]}`，记录了执行时使用的上游依赖版本。 |
| `hitl_history` | array (object) | 包含了从创建到批准此版本的所有人机交互记录。 |
| `llm_model_name`| string | 执行此版本时使用的 LLM 模型名称。 |
| `temperature` | number (float) | 执行此版本时使用的 LLM 温度参数。 |

#### 5.3. TemporaryExecutionRead

表示节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时结果。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `output_data` | object \| null | AI 或执行引擎生成的当前临时输出。 |
| **`execution_artifacts`** | **object \| null** | **[新增]** 在当前执行周期内产生的关键产物。结构与 `NodeVersionRead` 中的 `execution_artifacts` 类似。 |
| `accumulated_hitl_interactions` | array (object) | 在当前执行周期内累积的人机交互记录。 |
| `error_log` | string \| null | 如果执行失败，这里会包含详细的错误信息和堆栈跟踪。 |

***
```


--- (1680-1689 lines) ---
#### 5.1. `NODE_STATUS_UPDATED` (高频)

*   **描述**: 工作流中单个节点的状态发生变化。这是构建动态 UI 的核心事件。
*   **`data` 负载**: `NodeInstanceRead` 对象 (节点的**完整**最新数据，**包含 `is_stale` 标志**)。
*   **UI 影响与操作**:
    *   **状态变更**: 根据 `status` (现在包括 `Canceled`) 和 `current_stage` 更新节点的视觉表现。
    *   **交互锁定**: 当 `status` 变为 `Executing` 时，应禁用该节点上的所有操作按钮（如"执行"、"批准"），并显示加载指示器。
    *   **交互解锁**: 当 `status` 变为 `Awaiting HITL Approval`, `Failed`, 或 `Canceled` 时，应解锁对应的 HITL 操作按钮（如"批准/拒绝"或"重试"）。
    *   **数据刷新**: 如果用户正在查看该节点的详细视图，应使用事件 `data` 中的信息刷新视图内容。


</api>

<front_stack>
--- (63-82 lines) ---
### 六、 富文本编辑器与 Markdown (Novel/Tiptap 生态)

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Novel** | 基于 Tiptap 构建的所见即所得（WYSIWYG）富文本编辑器，用于报告编辑功能。 |
| **Tiptap** | 作为 Novel 的核心，是一个无头（Headless）、可扩展的富文本编辑器框架。 |
| **ProseMirror** | Tiptap 底层的核心工具库，提供了编辑器状态管理、视图和事务模型。 |
| **tiptap-markdown** | Tiptap 的扩展，用于在 Markdown 和 Tiptap 的 JSON 格式之间进行双向转换。 |
| **Tiptap 扩展集** | 使用了一系列扩展来增强编辑器功能，包括 `StarterKit`, `Placeholder`, `Link`, `Image`, `TaskList`, `Table`, `CodeBlockLowlight`, `TextStyle`, `Color`, `Highlight`, `Mathematics` 等。 |
| **`MathematicsWithMarkdown`** | 在 `components/editor/math-serializer.ts` 中自定义的 Tiptap 扩展，增强了对 KaTeX 数学公式的 Markdown 序列化支持。 |
| **React Markdown** | 用于在非编辑区域（如聊天消息）安全地渲染 Markdown 内容。 |
| **Remark / Rehype** | Markdown AST (抽象语法树) 生态系统，用于处理和转换 Markdown。 |
| | ↳ `remark-gfm` | 支持 GitHub Flavored Markdown (表格、删除线等)。 |
| | ↳ `remark-math` | 支持 Markdown 中的数学公式语法。 |
| | ↳ `rehype-katex` | 将数学公式 AST 渲染为 HTML。 |
| | ↳ **`unist-util-visit`** | 用于遍历和操作 AST 的核心工具，是编写自定义 Rehype 插件的基础。 |
| **KaTeX** | 用于在 Web 上高性能地排版和渲染数学公式。 |
| **react-syntax-highlighter** | 用于在 `research-activities-block` 中对 Python 代码进行语法高亮。 |
| **lowlight / highlight.js** | 作为 `CodeBlockLowlight` 扩展和 `react-syntax-highlighter` 的底层引擎，提供代码语法高亮能力。 |



--- (136-150 lines) ---
#### 1. UI 组件模式与实践

项目在 Shadcn/ui 的基础上构建了丰富且高度可复用的应用层组件，集中体现于 `app/chat/components/` 目录。

| 组件/模式 | 描述与复用价值 |
| :--- | :--- |
| **`InputBox`** | 一个功能完备的聊天输入框组件。它封装了：<br>- **富文本输入**: 基于 Tiptap/Novel，支持 `@mention` 等功能。<br>- **异步操作**: 内置“增强提示” (`Enhance Prompt`) 功能，包含加载和动画状态。<br>- **状态同步**: 通过 `useRef` 和 `useImperativeHandle` 暴露 `submit`, `setContent` 等方法，供父组件调用。<br>- **动态 UI**: 使用 `AnimatePresence` 展示用户反馈提示，并带有精美的动画效果。 |
| **`MessageListView` & `MessageListItem`** | 实现了经典的聊天消息列表渲染模式。<br>- **关注点分离**: `MessageListView` 负责列表滚动和布局，`MessageListItem` 则根据消息类型 (`user`, `planner`, `researcher` 等) 委托给不同的子组件 (`MessageBubble`, `PlanCard`, `ResearchCard`) 渲染，代码结构清晰。<br>- **进入动画**: 使用 `framer-motion` 的 `motion.li` 为每条新消息添加入场动画，提升用户体验。 |
| **`ThoughtBlock`** (内嵌于 `MessageListView`) | 一个可折叠的“深度思考”区块。其设计亮点在于：<br>- **流式内容处理**: 能够区分并分别渲染**已完成的静态内容**和**正在流式传输的新内容**，为流式文本提供了更丰富的视觉表现力。<br>- **自动行为**: 当主要内容出现后，会自动折叠，减少信息干扰。 |
| **`ResearchActivitiesBlock`** | 研究活动流的展示组件。它展示了如何渲染一个包含多种异构项（如网页搜索、代码执行、文件读取）的动态列表。每种活动类型都由一个专门的子组件处理（`WebSearchToolCall`, `PythonToolCall` 等），是处理复杂动态内容的绝佳范例。同时，它还包含了**性能优化**实践，如仅对前 N 个列表项应用动画。 |
| **`ResearchBlock`** | 一个集成了标签页 (`Tabs`) 的复合视图组件。它允许用户在“研究报告”和“活动流”之间切换，同时在组件顶部提供了上下文相关的操作按钮（如编辑、复制、下载），是构建复杂信息面板的优秀参考。 |
| **`ConversationStarter`** | 在聊天窗口为空时展示的欢迎界面和问题建议。它通过绝对定位和 `z-index` 叠加在 `InputBox` 上方，展示了如何构建非侵入式的引导用户界面。 |
| **`Link` (自定义)** | 位于 `components/deer-flow/link.tsx`，这是一个增强版的 `<a>` 标签。它会查询 Zustand store 中的工具调用历史，判断一个链接是否在之前的搜索结果中出现过。如果未出现，则会显示一个“链接不可靠”的警告图标。这是一个**将 UI 组件与业务状态深度结合**的创新实践。 |
| **`ScrollContainer`** | 对 Shadcn `ScrollArea` 的封装，集成了 `use-stick-to-bottom` Hook，并添加了上下边缘的渐变阴影效果，简化了创建需自动触底的滚动区域的开发工作。 |



--- (169-169 lines) ---
| **Markdown 预处理** | `core/utils/markdown.ts` 提供了一系列用于清理和规范化 Markdown 文本的函数，特别是 `normalizeMathForEditor` 和 `unescapeLatexInMath`，它们解决了在富文本编辑器中正确处理 LaTeX 数学公式的痛点。 |


--- (219-227 lines) ---
### 十vii、 高级编辑器 (Tiptap/Novel) 定制

项目对 Novel 编辑器进行了深度定制，这些定制方案可以直接复用。

| 定制/模式 | 描述与复用价值 |
| :--- | :--- |
| **自定义 Markdown 序列化器** | `components/editor/math-serializer.ts` 文件展示了如何扩展 Tiptap 的现有插件。通过 `.extend()` 方法为 `Mathematics` 插件添加了自定义的 `markdown.serialize` 逻辑，确保数学公式能够被正确地转换回 `$...$` 和 `$$...$$` 格式的 Markdown。这是扩展 Tiptap 功能的核心模式。 |
| **斜杠命令 (Slash Command) 实现** | `components/editor/slash-command.tsx` 提供了一个完整的斜杠命令实现范例。它定义了一个 `suggestionItems` 数组，每个对象包含命令的标题、图标和执行逻辑，然后通过 `Command.configure` 集成到编辑器中。这套代码几乎可以原封不动地移植到任何 Tiptap 项目中。 |
| **异步 `@mention` 建议系统** | `components/deer-flow/resource-suggestion.tsx` 是一个非常高级的模式。它配置了 Tiptap 的 `Mention` 插件，使其 `items` 属性成为一个异步函数，该函数通过 `fetch` 动态查询 RAG 资源。同时，它使用 `ReactRenderer` 和 `Tippy.js` 来渲染自定义的浮动建议列表 (`ResourceMentions` 组件)。这为实现任何需要异步数据源的编辑器建议功能提供了完美的蓝图。 |

</front_stack>

<deer_flow_frontend_code>
--- (1137-1247 lines) ---
### core/models/node.model.ts Content:

```ts
import { z } from "zod";

import {
  HITLActionEnum,
  HITLResponseActionEnum,
  VersionSourceEnum,
} from "~/constants/enums";

import { ExecutionArtifactsSchema, JsonObjectSchema } from "./common.model";
import {
  NodeInstanceReadSchema,
  StalenessInfoSchema,
} from "./workflow.model";

// --- Execution Results & Versions (The core data artifacts) ---

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

// API 5.5.3: TemporaryExecutionRead (Pending results during Executing/Awaiting HITL)
export const TemporaryExecutionReadSchema = z.object({
  output_data: JsonObjectSchema.nullable(),
  execution_artifacts: ExecutionArtifactsSchema,
  accumulated_hitl_interactions: z.array(JsonObjectSchema),
  error_log: z.string().nullable(), // For Failed status
});
export type TemporaryExecutionRead = z.infer<
  typeof TemporaryExecutionReadSchema
>;

// API 5.5.1: NodeDetailView (The comprehensive view for rendering the workspace)
// Extends NodeInstanceRead with detailed results/versions.
export const NodeDetailViewSchema = NodeInstanceReadSchema.extend({
  active_version: NodeVersionReadSchema.nullable(),
  pending_result: TemporaryExecutionReadSchema.nullable(),
  // Detailed staleness info for the current node view (API 5.1.1)
  staleness_report: z.array(StalenessInfoSchema).nullable(),
});
export type NodeDetailView = z.infer<typeof NodeDetailViewSchema>;

// --- Execution Control Requests ---

// API 5.2.1, 5.2.2: ExecutionRequest (Used for Re-execute and Retry)
export const ExecutionRequestSchema = z.object({
  modification_comments: z.string().optional(),
  // Used only for re-execute to specify the base version
  base_version_id: z.number().int().optional(),
});
export type ExecutionRequest = z.infer<typeof ExecutionRequestSchema>;

// API 5.4.1: ManualEditSubmission (R4.1, R4.2)
export const ManualEditSubmissionSchema = z.object({
  base_version_id: z.number().int(),
  edited_output_data: JsonObjectSchema,
  summary: z.string().optional(),
});
export type ManualEditSubmission = z.infer<typeof ManualEditSubmissionSchema>;

// --- HITL (Human-in-the-Loop) Models ---

// API 5.3: HITLSubmission (Request payload for user decisions)
export const HITLSubmissionSchema = z.object({
  action: HITLActionEnum,
  // Required if action is RejectAndProvideModificationComments
  feedback_comment: z.string().nullable().optional(),
  // Required if action is Continue. Structure depends on HITLMode (SCA, AVL).
  interaction_data: JsonObjectSchema.nullable().optional(),
});
export type HITLSubmission = z.infer<typeof HITLSubmissionSchema>;

// API 5.3: HITLResponse (Response that guides frontend navigation)
export const HITLResponseSchema = z.object({
  message: z.string(),
  next_node_id: z.number().int().nullable().optional(),
  action: HITLResponseActionEnum,
});
export type HITLResponse = z.infer<typeof HITLResponseSchema>;

// API 5.2.x Response (Async execution accepted)
export const ExecutionAcceptedResponseSchema = z.object({
  message: z.string(),
  // node_id is optional as per API 5.2.3 example response
  node_id: z.number().int().optional(),
});
export type ExecutionAcceptedResponse = z.infer<
  typeof ExecutionAcceptedResponseSchema
>;

```


--- (1525-1569 lines) ---
### core/models/common.model.ts Content:

```ts
import { z } from "zod";

/**
 * Generic schema factory for paginated responses (API 3.1.2, 4.1.2).
 * @param itemSchema The Zod schema for the items in the list.
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    total: z.number().int(),
    items: z.array(itemSchema),
  });

/**
 * Type helper for PaginatedResponse.
 * Aligns with the interface defined in core/api/types.ts.
 */
export type PaginatedResponse<T> = {
  total: number;
  items: T[];
};

// Generic schema for dynamic JSON structures (e.g., LLM outputs, HITL interactions)
export const JsonObjectSchema = z.record(z.string(), z.any());

// Define the structure for Execution Artifacts (API 5.5.2, 5.5.3, Design Doc 2.1.2.B)
// We use .passthrough() to allow keys beyond the documented ones, ensuring flexibility.
export const ExecutionArtifactsSchema = z
  .object({
    prompt: z.string().optional(),
    raw_llm_response: z.string().optional(),
    "generated_code.py": z.string().optional(),
    "execution.log": z.string().optional(),
    tool_call_log: z.any().optional(), // Tool logs can be complex objects or arrays
  })
  .passthrough()
  .nullable();
export type ExecutionArtifacts = z.infer<typeof ExecutionArtifactsSchema>;

```



--- (1750-1993 lines) ---
### core/api/node.service.ts Content:

```ts
import { AxiosError } from "axios";

import type {
  ExecutionAcceptedResponse,
  ExecutionRequest,
  HITLResponse,
  HITLSubmission,
  ManualEditSubmission,
  NodeDetailView,
  NodeVersionRead,
} from "~/core/models/node.model";
import type { NodeInstanceRead } from "~/core/models/workflow.model";

import apiClient from "./client";

/**
 * API Service for Node & Execution Control (API 5).
 */
export const NodeService = {
  // --- 1. Node Query & Display (API 5.1) ---

  /**
   * Gets the detailed view of a specific node (API 5.1.1).
   */
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

  /**
   * Gets the list of all versions for a specific node (API 5.1.2).
   */
  getNodeVersions: async (nodeId: number): Promise<NodeVersionRead[]> => {
    const response = await apiClient.get<NodeVersionRead[]>(
      `/nodes/${nodeId}/versions`,
    );
    return response.data;
  },

  /**
   * Gets the details of a specific version (API 5.1.3).
   */
  getNodeVersionById: async (
    nodeId: number,
    versionId: number,
  ): Promise<NodeVersionRead> => {
    const response = await apiClient.get<NodeVersionRead>(
      `/nodes/${nodeId}/versions/${versionId}`,
    );
    return response.data;
  },

  // --- 2. Execution Control (Start & Stop) (API 5.2) ---

  /**
   * Re-executes a completed node (Exploratory) (API 5.2.1).
   */
  reExecuteNode: async (
    nodeId: number,
    data: ExecutionRequest = {},
  ): Promise<ExecutionAcceptedResponse> => {
    try {
      // Expect 202 Accepted. Status updates via WebSocket.
      const response = await apiClient.post<ExecutionAcceptedResponse>(
        `/nodes/${nodeId}/re-execute`,
        data,
        {
          validateStatus: (status) => status === 202,
        },
      );
      return response.data;
    } catch (error) {
      handleExecutionError(error);
      // If handleExecutionError didn't throw a specific error, re-throw the original
      throw error;
    }
  },

  /**
   * Retries a failed or canceled node (Corrective) (API 5.2.2).
   */
  retryNode: async (
    nodeId: number,
    data: ExecutionRequest = {},
  ): Promise<ExecutionAcceptedResponse> => {
    try {
      // Expect 202 Accepted.
      const response = await apiClient.post<ExecutionAcceptedResponse>(
        `/nodes/${nodeId}/retry`,
        data,
        {
          validateStatus: (status) => status === 202,
        },
      );
      return response.data;
    } catch (error) {
      handleExecutionError(error);
      throw error;
    }
  },

  /**
   * Cancels an executing node (API 5.2.3).
   */
  cancelNode: async (nodeId: number): Promise<ExecutionAcceptedResponse> => {
    try {
      // Expect 202 Accepted.
      const response = await apiClient.post<ExecutionAcceptedResponse>(
        `/nodes/${nodeId}/cancel`,
        null,
        {
          validateStatus: (status) => status === 202,
        },
      );
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (Node not executing)
      if (error instanceof AxiosError && error.response?.status === 409) {
        throw new Error("NODE_NOT_EXECUTING");
      }
      throw error;
    }
  },

  // --- 3. Human-in-the-Loop (HITL) (API 5.3) ---

  /**
   * Submits HITL decision for a node awaiting approval (API 5.3).
   */
  submitHITL: async (
    nodeId: number,
    data: HITLSubmission,
  ): Promise<HITLResponse> => {
    try {
      const response = await apiClient.post<HITLResponse>(
        `/nodes/${nodeId}/hitl`,
        data,
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle 409 Conflict (Node not awaiting approval)
        if (error.response?.status === 409) {
          throw new Error("NODE_NOT_AWAITING_APPROVAL");
        }
        // Handle 400 Bad Request (Invalid interaction data)
        if (error.response?.status === 400) {
          throw new Error("INVALID_HITL_SUBMISSION");
        }
      }
      throw error;
    }
  },

  // --- 4. Version & Result Intervention (API 5.4) ---

  /**
   * Submits a manual edit (API 5.4.1).
   */
  manualEdit: async (
    nodeId: number,
    data: ManualEditSubmission,
  ): Promise<NodeInstanceRead> => {
    try {
      const response = await apiClient.post<NodeInstanceRead>(
        `/nodes/${nodeId}/manual-edit`,
        data,
      );
      return response.data;
    } catch (error) {
      handleInterventionError(error);
      throw error;
    }
  },

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

// --- Helper Functions for Error Handling ---

/**
 * Centralized handling for execution-related errors (409, 403).
 */
const handleExecutionError = (error: unknown) => {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    // 409 Conflict (Invalid state for execution)
    if (status === 409) {
      throw new Error("INVALID_STATE_FOR_EXECUTION");
    }
    // 403 Forbidden (e.g., trying to re-execute Generator node - W3.2)
    if (status === 403) {
      throw new Error("ACTION_FORBIDDEN_ON_NODE_TYPE");
    }
  }
  // If not handled specifically, the error propagates implicitly if not caught by the caller's catch block.
};

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

```


--- (2962-3406 lines) ---
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


--- (3408-3548 lines) ---
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
  // IDs of stages that are collapsed in the navigator (A)
  collapsedStages: Set<string>;
  // Keys of blocks (e.g., 'inputs', 'artifacts') that are expanded in the workspace (B2)
  expandedBlocks: Set<string>;

  // --- Actions ---
  selectNode: (nodeId: number) => void;
  viewHistoricalVersion: (versionId: number) => void;
  viewLatestVersion: () => void;
  startEditing: () => void;
  stopEditing: () => void;
  togglePhaseCollapse: (phaseId: string) => void;
  toggleStageCollapse: (stageId: string) => void;
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
  collapsedStages: new Set(),
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

  toggleStageCollapse: (stageId) => {
    set((state) => {
      const newCollapsedStages = new Set(state.collapsedStages);
      if (newCollapsedStages.has(stageId)) {
        newCollapsedStages.delete(stageId);
      } else {
        newCollapsedStages.add(stageId);
      }
      return { collapsedStages: newCollapsedStages };
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
      collapsedStages: new Set(),
      expandedBlocks: DEFAULT_EXPANDED_BLOCKS,
    });
  },
});

```


--- (702-746 lines) ---
### core/markdown/katex.ts Content:

```ts
// Configuration for KaTeX rendering, used by both the renderer and the editor.
import type { Options as RehypeKatexOptions } from "rehype-katex";

// Optional: Import extensions if needed (e.g., for chemistry)
// import "katex/contrib/mhchem";

// Define custom LaTeX macros for convenience and standardization (Design Doc Ref: User Profile - Python/MATLAB user)
const macros = {
  // Linear Algebra
  "\\vect": "\\mathbf{#1}",
  "\\mat": "\\mathbf{#1}",
  // Calculus
  "\\grad": "\\nabla #1",
  "\\div": "\\nabla \\cdot #1",
  "\\curl": "\\nabla \\times #1",
  "\\dv": "\\frac{d #1}{d #2}",
  "\\pdv": "\\frac{\\partial #1}{\\partial #2}",
  "\\pdvN": "\\frac{\\partial^{#3} #1}{\\partial #2^{#3}}",
  // Brackets and Norms
  "\\abs": "\\left|#1\\right|",
  "\\norm": "\\left\\lVert#1\\right\\rVert",
  "\\set": "\\left\\{#1\\right\\}",
  // Quantum Mechanics (Dirac Notation)
  "\\bra": "\\left\\langle#1\\right|",
  "\\ket": "\\left|#1\\right\\rangle",
  "\\braket": "\\left\\langle#1\\middle|#2\\right\\rangle",
  // Structures
  "\\matrix": "\\begin{pmatrix}#1\\end{pmatrix}",
} as const;

export const katexOptions: RehypeKatexOptions = {
  macros,
  // 'ignore' allows rendering to continue even if there are minor LaTeX errors
  strict: "ignore",
  // Trust specific commands for advanced features if needed
  trust: (context) => context.command === "\\htmlClass" || context.command === "\\href",
  throwOnError: false,
};

export type KatexMacroKey = keyof typeof macros;

```


--- (863-1023 lines) ---
### core/utils/markdown.ts Content:

```ts
// Utilities for processing Markdown strings, focusing on compatibility between
// display (react-markdown) and editing (Tiptap/Novel), especially concerning LaTeX.

/**
 * Applies various fixes to Markdown strings for better rendering consistency.
 */
export function autoFixMarkdown(markdown: string): string {
  return autoCloseTrailingLink(markdown);
}

/**
 * Unescape markdown-escaped characters within math delimiters.
 * Tiptap-markdown often escapes characters like *, _, [, ] which corrupts LaTeX formulas.
 * This function restores the original LaTeX by unescaping within $...$ and $$...$$.
 * Crucial when exporting Markdown from the editor (Front Stack Ref: Markdown Preprocessing).
 */
export function unescapeLatexInMath(markdown: string): string {
  let result = markdown;

  // Process inline math: $...$
  result = result.replace(/\$([^\$]+?)\$/g, (match, mathContent) => {
    const unescaped = unescapeMarkdownSpecialChars(mathContent);
    return `$${unescaped}$`;
  });

  // Process display math: $$...$$
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (match, mathContent) => {
    const unescaped = unescapeMarkdownSpecialChars(mathContent);
    return `$$${unescaped}$$`;
  });

  return result;
}

/**
 * Reverse markdown escaping for special characters.
 * Order matters: process \\ last to avoid re-escaping characters we just unescaped.
 */
function unescapeMarkdownSpecialChars(text: string): string {
  return text
    .replace(/\\\*/g, "*") // \* → *
    .replace(/\\_/g, "_") // \_ → _
    .replace(/\\\[/g, "[") // \[ → [
    .replace(/\\\]/g, "]") // \] → ]
    .replace(/\\\{/g, "{") // \{ → {
    .replace(/\\\}/g, "}") // \} → }
    .replace(/\\\\/g, "\\"); // \\ → \ (Must be last)
}

/**
 * Normalize math delimiters for editor consumption (Tiptap).
 * Converts standard LaTeX delimiters (e.g. \[...\]) to the $...$ and $$...$$ format Tiptap expects.
 */
export function normalizeMathForEditor(markdown: string): string {
  let normalized = markdown;

  // Convert display math delimiters (\[...\] and \\[...\\])
  // Handle double backslash first
  normalized = normalized
    .replace(/\\\\\[([\s\S]*?)\\\\\]/g, (_match, content) => `$$${content}$$`) // \\[...\\] → $$...$$
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, content) => `$$${content}$$`); // \[...\] → $$...$$

  // Convert inline math delimiters (\(...\) and \\(...\\))
  normalized = normalized
    .replace(/\\\\\(([\s\S]*?)\\\\\)/g, (_match, content) => `$${content}$`) // \\(...\\) → $...$
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, content) => `$${content}$`); // \(...\) → $...$

  // Normalize backslashes within math contexts (sometimes LLMs output double backslashes)
  normalized = normalizeBackslashesInMath(normalized);

  return normalized;
}

/**
 * Normalize math delimiters for display consumption (react-markdown/remark-math).
 */
export function normalizeMathForDisplay(markdown: string): string {
  // The normalization logic is generally the same for display and editing.
  return normalizeMathForEditor(markdown);
}

/**
 * Fixes unclosed Markdown links or images at the end of a string.
 * Useful for streaming outputs.
 */
function autoCloseTrailingLink(markdown: string): string {
  let fixedMarkdown: string = markdown;

  // Fix unclosed image/link syntax ![...](... or [...](... at the end of the string
  const patterns = [
    { regex: /!\[([^\]]*)\]\(([^)]*)$/g, replacement: (m: string, alt: string, url: string) => `![${alt}](${url})` },
    { regex: /\[([^\]]*)\]\(([^)]*)$/g, replacement: (m: string, text: string, url: string) => `[${text}](${url})` },
    { regex: /!\[([^\]]*)$/g, replacement: (m: string, alt: string) => `![${alt}]` },
    { regex: /\[([^\]]*)$/g, replacement: (m: string, text: string) => `[${text}]` },
  ];

  patterns.forEach(({ regex, replacement }) => {
    fixedMarkdown = fixedMarkdown.replace(regex, replacement as any);
  });

  return fixedMarkdown;
}

/**
 * Helper to replace double backslashes with single ones within math contexts.
 */
function normalizeBackslashesInMath(markdown: string): string {
  let normalized = markdown;

  // For inline math: $...$
  normalized = normalized.replace(/\$([^\$]+?)\$/g, (match, mathContent) => {
    return `$${mathContent.replace(/\\\\/g, "\\")}$`;
  });

  // For display math: $$...$$
  normalized = normalized.replace(/\$\$([\s\S]+?)\$\$/g, (match, mathContent) => {
    return `$$${mathContent.replace(/\\\\/g, "\\")}$$`;
  });

  return normalized;
}

/**
 * Removes surrounding Markdown code block delimiters (```markdown, ```text, ```) if present.
 * Useful for cleaning up LLM outputs.
 */
export function dropMarkdownWrapper(markdown?: string | null): string {
    if (!markdown) return "";

    let result = markdown.trim();

    const patterns = [
        /^```markdown\n([\s\S]*?)\n```$/m,
        /^```text\n([\s\S]*?)\n```$/m,
        /^```\n([\s\S]*?)\n```$/m,
    ];

    for (const pattern of patterns) {
        const match = result.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }

    // Handle cases where the closing delimiter might be missing (e.g., during streaming)
    if (result.startsWith("```markdown\n") && !result.endsWith("```")) {
        return result.substring(12).trim();
    }
    if (result.startsWith("```text\n") && !result.endsWith("```")) {
        return result.substring(8).trim();
    }
    if (result.startsWith("```\n") && !result.endsWith("```")) {
        return result.substring(4).trim();
    }

    return result;
}



--- (7229-7389 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/cockpit-layout.tsx Content:

```tsx
"use client";

import { useMemo, useRef, type RefObject } from "react";
// Removed Loader2, NodeStatusIcon, Badge imports as they are now handled within NodeWorkspace
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { useShallow } from "zustand/react/shallow";

import { WorkflowTree } from "./workflow-tree";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import type { WorkflowInstanceRead } from "~/core/models/workflow.model";
import { useStore } from "~/core/store";
import { NodeWorkspace } from "./workspace/node-workspace"; // Import NodeWorkspace

interface CockpitLayoutProps {
  workflow: WorkflowInstanceRead;
  isSyncing: boolean;
}

export function CockpitLayout({ workflow, isSyncing }: CockpitLayoutProps) {
  const { activeNodeId, nodesById, isEditing } = useStore(
    useShallow((state) => ({
      activeNodeId: state.activeNodeId,
      nodesById: state.nodesById,
      // We need to track the editing state for the Panel C visibility logic.
      isEditing: state.isEditing,
    })),
  );

  const activeNode = useMemo(() => {
    if (!activeNodeId) return null;
    return nodesById.get(activeNodeId) ?? null;
  }, [activeNodeId, nodesById]);

  // Design Doc 2.2.3.C / 3.1.1.C: Panel C (History) visibility logic.
  // Visible only when the Center Workspace is in "Review Mode" (Completed status AND not currently editing).
  const isHistoryVisible = activeNode?.status === "Completed" && !isEditing;

  const navigatorPanelRef = useRef<ImperativePanelHandle>(null);
  const historyPanelRef = useRef<ImperativePanelHandle>(null);

  const togglePanel = (panelRef: RefObject<ImperativePanelHandle | null>) => {
    const panel = panelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="workflow-cockpit-layout"
      className="flex h-full overflow-hidden rounded-2xl border border-border/60 bg-background/60 shadow-inner"
    >
      <ResizablePanel
        ref={navigatorPanelRef}
        id="workflow-navigator"
        collapsible
        defaultSize={22}
        minSize={18}
        className="bg-card/80"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Workflow Navigator
              </p>
              <p className="text-sm font-medium text-foreground">{workflow.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => togglePanel(navigatorPanelRef)}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">Toggle navigator</span>
            </Button>
          </div>
          <ScrollArea className="flex-1 px-3 py-4">
            <WorkflowTree workflow={workflow} />
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      {/* B. Workspace Panel */}
      <ResizablePanel
        id="workflow-workspace"
        // Dynamically adjust sizes based on Panel C visibility
        minSize={isHistoryVisible ? 45 : 60}
        defaultSize={isHistoryVisible ? 56 : 78}
        className="bg-background"
      >
        {/* Architecture 6.2: Host the NodeWorkspace component. */}
        <NodeWorkspace workflowStatus={workflow.status} isSyncing={isSyncing} />
      </ResizablePanel>

      {/* C. History Panel (Conditional) */}
      {isHistoryVisible ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            ref={historyPanelRef}
            id="workflow-history"
            collapsible
            defaultSize={22} // Slightly increased default size
            minSize={16}
            className="bg-card/80"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Version History
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {activeNode?.name ?? "History"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => togglePanel(historyPanelRef)}
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Toggle history</span>
                </Button>
              </div>
              <ScrollArea className="flex-1 px-4 py-4">
                {/* Placeholder content */}
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Panel C: Version History Placeholder.
                  </p>
                  <div className="rounded-xl border border-dashed border-border/60 p-3">
                    Version cards (V1, V2...) will be listed here when implemented.
                  </div>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </>
      ) : null}
    </ResizablePanelGroup>
  );
}



--- (7772-7915 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/node-workspace.tsx Content:

```tsx
"use client";

import { useEffect } from "react";
import { Loader2, Workflow } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { ScrollArea } from "~/components/ui/scroll-area";
import { useStore } from "~/core/store";
import { WorkspaceHeader } from "./workspace-header";
import { type WorkflowStatus } from "~/constants/enums";
import { InteractionTranscript } from "./interaction-transcript";
import { ActionFooter } from "./action-footer";

interface NodeWorkspaceProps {
  workflowStatus: WorkflowStatus;
  isSyncing: boolean;
}

/**
 * B. Node Interaction Workspace (Center Panel).
 * Manages data fetching optimization for the active node and implements the B1/B2/B3 layout.
 * (Architecture 7.2, Design Doc 3.1.3.B)
 */
export function NodeWorkspace({
  workflowStatus,
  isSyncing,
}: NodeWorkspaceProps) {
  const { activeNodeId, fetchNodeDetails, nodeDetailsCache, nodesById } =
    useStore(
      useShallow((state) => ({
        activeNodeId: state.activeNodeId,
        fetchNodeDetails: state.fetchNodeDetails,
        nodeDetailsCache: state.nodeDetailsCache,
        nodesById: state.nodesById,
      })),
    );

  // 1. Basic info (NodeInstanceRead) - available instantly from normalized store
  const activeNodeBasic = activeNodeId ? nodesById.get(activeNodeId) : null;

  // 2. Detailed info (NodeDetailView) - fetched on demand and cached
  const activeNodeDetails = activeNodeId
    ? nodeDetailsCache.get(activeNodeId)
    : null;

  // 3. Fetch details when activeNodeId changes
  useEffect(() => {
    if (activeNodeId) {
      // Trigger fetch (non-blocking). The slice handles caching and errors (toasts).
      void fetchNodeDetails(activeNodeId);
    }
  }, [activeNodeId, fetchNodeDetails]);

  // 4. Determine loading state and display data
  // We are loading details if we have an ID but not the corresponding details object in cache yet.
  const isLoadingDetails = !!activeNodeId && !activeNodeDetails;

  // Use details if available, otherwise fallback to basic info if available.
  // This ensures responsiveness: basic info renders immediately while details load.
  const displayNode = activeNodeDetails ?? activeNodeBasic;

  // Handle Empty State (No node selected)
  if (!displayNode) {
    // If activeNodeId is null, it's empty. If activeNodeId is set but basic info is missing (e.g. data sync issue), also treat as empty/loading.
    return activeNodeId ? <LoadingWorkspace /> : <EmptyWorkspace />;
  }

  // Render the workspace structure (Design Doc 3.1.3.B)
  // B1/B2/B3 Layout implementation using flex column.
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* B1: Header (Fixed Top) - Includes B1.1 Staleness Banner internally */}
      <WorkspaceHeader
        node={displayNode}
        isSyncing={isSyncing}
        workflowStatus={workflowStatus}
        isLoadingDetails={isLoadingDetails}
        // Pass the staleness report from the details (only available when details are loaded)
        stalenessReport={activeNodeDetails?.staleness_report ?? null}
      />

      {/* B2: Content (Scrollable) - InteractionTranscript */}
      <ScrollArea className="flex-1">
        {isLoadingDetails ? (
          // Loading State for Details within B2
          <div className="p-6">
            <LoadingWorkspaceDetails />
          </div>
        ) : (
          // Loaded State
          // We know activeNodeDetails must exist here if isLoadingDetails is false and displayNode exists.
          <InteractionTranscript node={activeNodeDetails!} />
        )}
      </ScrollArea>

      {/* B3: Footer (Fixed Bottom, Conditional Visibility) */}
      {/* Visibility logic (HITL or Editing) is handled inside ActionFooter. */}
      <ActionFooter node={displayNode} />
    </div>
  );
}

// --- Helper Components for States ---

function EmptyWorkspace() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-12 text-center text-muted-foreground">
      <Workflow className="h-16 w-16 text-border" />
      <h3 className="mt-4 text-lg font-semibold">Select a Node</h3>
      <p className="text-sm mt-2 max-w-md">
        Choose a node from the Workflow Navigator (Panel A) to view its details,
        outputs, and interact with the execution.
      </p>
    </div>
  );
}

// Used when the entire workspace is loading (e.g. initial selection before basic info is available, though unlikely with current architecture)
function LoadingWorkspace() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="mt-4 text-sm">Loading workspace...</p>
    </div>
  );
}

// Used when basic info is available but details (B2 content) are loading
function LoadingWorkspaceDetails() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="ml-3 text-sm text-muted-foreground">
        Loading detailed execution data...
      </p>
    </div>
  );
}


```


--- (7917-7958 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/interaction-transcript.tsx Content:

```tsx
"use client";

import type { NodeDetailView } from "~/core/models/node.model";

interface InteractionTranscriptProps {
  // B2 requires the full details (NodeDetailView) to render content blocks.
  node: NodeDetailView;
}

/**
 * B2. Interaction Transcript (Scrollable Content)
 * Displays the complete context of the currently viewed version.
 * (Placeholder implementation for Task 13)
 * (Design Doc 5.1.3.B2)
 */
export function InteractionTranscript({ node }: InteractionTranscriptProps) {
  // Design Doc 5.1.3.B2: Layout: space-y-6 p-6.
  return (
    <div className="space-y-6 p-6">
      {/* Placeholder Content */}
      <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-6 text-sm text-muted-foreground">
        B2: Interaction Transcript Placeholder.
        <br />
        Node Status: {node.status}. Active Version: {node.active_version_id ?? "N/A (Pending)"}.
      </div>

       {/* Placeholder blocks representing the structure (Design Doc 5.1.3.B2) */}
       <div className="space-y-6">
        <div className="h-20 rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">Block 1: Inputs & Dependencies (Default Collapsed)</div>
        <div className="h-32 rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">Block 2: Execution Artifacts (Prompt, Code, Logs) (Default Collapsed)</div>
        <div className="h-64 rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">Block 3: Generated Output (Default Expanded)</div>
        <div className="h-40 rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">Block 4: HITL Interaction Zone (Default Expanded)</div>
      </div>
    </div>
  );
}


```


--- (9822-9895 lines) ---
### components/ui/tabs.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "~/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

```


--- (11235-11272 lines) ---
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


--- (12021-12143 lines) ---
### components/renderers/MarkdownRenderer.tsx Content:

```tsx
"use client";

/**
 * Professional Markdown and LaTeX Renderer Component.
 * Implements Design Doc requirement 3.2.1 (Professional Markdown/LaTeX Renderer).
 * Utilizes react-markdown with GFM, Math (KaTeX) support, and customized high-density typography.
 */

import React, { useMemo } from "react";
import ReactMarkdown, { type Options as ReactMarkdownOptions } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Import KaTeX CSS for formula rendering
import "katex/dist/katex.min.css";

import { katexOptions } from "~/core/markdown/katex";
import { autoFixMarkdown, normalizeMathForDisplay, dropMarkdownWrapper } from "~/core/utils/markdown";
import { rehypeSplitWordsIntoSpans } from "~/core/rehype";
import { cn } from "~/lib/utils";

export interface MarkdownRendererProps extends Omit<ReactMarkdownOptions, 'children'> {
  /** The Markdown content string to render. */
  content: string;
  /** Optional CSS class name for the container div. */
  className?: string;
  /**
   * Enable animated rendering (e.g., for streaming content).
   * Splits words into spans for fade-in effects (requires corresponding CSS).
   */
  animated?: boolean;
  /**
   * Controls whether to automatically clean up LLM wrappers (e.g., ```markdown ... ```).
   * @default true
   */
  cleanWrapper?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  className,
  content,
  animated = false,
  cleanWrapper = true,
  ...props
}) => {

  // Define custom components for specific elements
  const components: ReactMarkdownOptions["components"] = useMemo(() => {
    return {
      // Ensure all links open in a new tab securely
      a: ({ href, children }) => {
        const rel = "noopener noreferrer";
        const link = (href as string | undefined) ?? "#";
        return (
          <a href={link} target="_blank" rel={rel}>
            {children}
          </a>
        );
      },
      // Basic image rendering
      img: ({ src, alt }) => (
        <img className="rounded-md border" src={src as string} alt={alt ?? ""} />
      ),
      // Ensure code blocks use Geist Mono (Design Doc 4.1.2.B)
      pre: ({ children }) => (
          <pre className="font-mono">{children}</pre>
      ),
      code: ({ children }) => (
          <code className="font-mono">{children}</code>
      )
    };
  }, []);

  // Configure Rehype plugins
  const rehypePlugins = useMemo<NonNullable<ReactMarkdownOptions["rehypePlugins"]>>(() => {
    const plugins: NonNullable<ReactMarkdownOptions["rehypePlugins"]> = [
        // Add KaTeX rendering plugin
        [rehypeKatex, katexOptions]
    ];
    // Add animation plugin if enabled
    if (animated) {
      plugins.push(rehypeSplitWordsIntoSpans);
    }
    return plugins;
  }, [animated]);

  // Preprocess the markdown content
  const processedContent = useMemo(() => {
    if (!content) return "";
    let markdown = content;
    if (cleanWrapper) {
        markdown = dropMarkdownWrapper(markdown);
    }
    // Normalize LaTeX delimiters and apply automatic fixes
    return autoFixMarkdown(normalizeMathForDisplay(markdown));
  }, [content, cleanWrapper]);


  return (
    <div
      // Apply Tailwind Typography classes ('prose') for professional styling (Design Doc 4.1.2.D).
      // 'max-w-none' ensures it fills the container.
      className={cn("prose dark:prose-invert max-w-none", className)}
    >
      <ReactMarkdown
        // Configure Remark plugins for GFM and Math syntax
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={rehypePlugins}
        components={components}
        {...props}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};


```


--- (14836-14990 lines) ---
### components/editors/MonacoWrapper.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import type { EditorProps, OnMount, Monaco } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import type { editor } from 'monaco-editor';

// Define the Loading fallback component
const MonacoLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

// Dynamically import Monaco Editor for optimized loading (Architecture 9.4.1)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: MonacoLoading,
});

// Define base options for Monaco, ensuring consistency across the platform
// Design Doc 4.1.2.B: Use Geist Mono. Design Doc 4.3.B.3: text-sm (14px).
const MONACO_BASE_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  // Use the CSS variable set by Next.js font optimization (Geist Mono)
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 14,
  lineHeight: 20, // Improved readability
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true, // Automatically adjust layout when the container size changes
  // Configure subtle scrollbars
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    useShadows: false,
  },
  smoothScrolling: true,
  folding: true, // Enable code folding by default (Design Doc 3.1.1.A.2)
};

// Helper function to define custom themes that match the application's aesthetic
const defineCustomThemes = (monaco: Monaco) => {
  // Design Doc 4.1.1.B defines the colors. Monaco requires hex values.

  // Dark theme (Design Doc 4.1.1: Dark Mode First)
  // --background: 222.2 84% 4.9% ≈ #020617 (Deep Blue-Black / Slate 950)
  const darkBg = '#020617';
  // --secondary/border: 217.2 32.6% 17.5% ≈ #1e293b. Used for subtle highlights with sufficient contrast.
  const darkHighlight = '#1e293b';

  monaco.editor.defineTheme('o-award-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      // Design Doc 5.1.3.B2 specifies bg-background for the viewer.
      'editor.background': darkBg,
      'editorGutter.background': darkBg, // Ensure gutter matches background
      'editor.lineHighlightBackground': darkHighlight,
      'editor.selectionBackground': '#334155', // Slate 700 approximation
    },
  });

  // Light theme
  // --background: 0 0% 100% ≈ #ffffff
  const lightBg = '#ffffff';
  monaco.editor.defineTheme('o-award-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': lightBg,
      'editorGutter.background': lightBg,
      'editor.lineHighlightBackground': '#f1f5f9', // Slate 100 approximation
    },
  });
};


export interface MonacoWrapperProps extends EditorProps {
  // We primarily extend EditorProps
}

/**
 * MonacoWrapper component integrates Monaco Editor with the application's theming and font settings.
 * It handles dynamic loading, custom theme definition, and configuration synchronization.
 */
const MonacoWrapper = React.forwardRef<editor.IStandaloneCodeEditor, MonacoWrapperProps>(
  ({ options, onMount, beforeMount, ...props }, ref) => {
    const { resolvedTheme } = useTheme();

    // Determine Monaco theme based on next-themes (Design Doc 4.1.1)
    // Default to dark if theme is unresolved (e.g., during initialization, matching defaultTheme="dark")
    const monacoTheme = (resolvedTheme === 'dark' || !resolvedTheme) ? 'o-award-dark' : 'o-award-light';

    // Merge base options with instance-specific options
    const combinedOptions = React.useMemo(() => ({
      ...MONACO_BASE_OPTIONS,
      ...options,
    }), [options]);

    // Handle Monaco initialization (before mount)
    const handleBeforeMount = (monaco: Monaco) => {
        // Define custom themes before the editor mounts
        defineCustomThemes(monaco);
        if (beforeMount) {
            beforeMount(monaco);
        }
    };

    // Handle editor mount lifecycle
    const handleOnMount: OnMount = (editorInstance, monaco) => {
      // Assign the editor instance to the forwarded ref
      if (ref) {
        if (typeof ref === 'function') {
          ref(editorInstance);
        } else {
          ref.current = editorInstance;
        }
      }
      // Call original onMount if provided
      if (onMount) {
        onMount(editorInstance, monaco);
      }
    };

    return (
      <MonacoEditor
        // Keying by theme helps ensure Monaco re-initializes correctly if theme changes rapidly
        key={monacoTheme}
        theme={monacoTheme}
        options={combinedOptions}
        onMount={handleOnMount}
        beforeMount={handleBeforeMount}
        loading={<MonacoLoading />}
        {...props}
      />
    );
  }
);

MonacoWrapper.displayName = 'MonacoWrapper';

export default MonacoWrapper;


```


--- (14992-15134 lines) ---
### components/editors/LogViewer.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
// We import the MonacoWrapper which already handles dynamic loading internally.
import MonacoWrapper from './MonacoWrapper';
import type { editor } from 'monaco-editor';
import { Button } from '~/components/ui/button';
import { ArrowDownToLine } from 'lucide-react';
import { cn } from '~/lib/utils';

interface LogViewerProps {
  logs: string; // The full log content
  className?: string;
}

/**
 * LogViewer component optimized for displaying real-time logs with auto-scrolling capabilities.
 * Implements requirements from Design Doc 3.1.1.A.3 (Live Log Viewer).
 */
export const LogViewer: React.FC<LogViewerProps> = ({ logs, className }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  // Design Doc 3.1.1.A.3: Default automatic scroll to the bottom
  const [autoScroll, setAutoScroll] = useState(true);
  // State to track if the user has manually scrolled up (to show the button)
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // Function to scroll the editor to the very bottom
  const scrollToBottom = useCallback(() => {
    const editor = editorRef.current;
    if (editor) {
      const model = editor.getModel();
      if (model) {
        const lineCount = model.getLineCount();
        // Reveal the last line. 0 (ScrollType.Immediate) ensures immediate scroll.
        editor.revealLine(lineCount, 0);
      }
    }
  }, []);

  // Effect: Auto-scroll when logs update, provided autoScroll is enabled
  useEffect(() => {
    // If autoScroll is true (meaning user is at the bottom or hasn't intervened), scroll down on log updates.
    if (autoScroll && editorRef.current) {
      scrollToBottom();
    }
  }, [logs, autoScroll, scrollToBottom]);

  // Handle editor mount and setup scroll listeners
  const handleMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance;

    // Listener for scroll events within Monaco to detect user interaction
    editorInstance.onDidScrollChange((e) => {
      // Only react if the vertical scroll position or the content height changed
      if (!e.scrollTopChanged && !e.scrollHeightChanged) return;

      const scrollHeight = e.scrollHeight;
      const scrollTop = e.scrollTop;
      // Use the actual height of the viewport from the event
      const height = e.height;

      // Determine if the view is at the bottom (with a small tolerance)
      const isAtBottom = scrollTop + height >= scrollHeight - 10;

      // Design Doc 3.1.1.A.3: User manual scroll should pause auto-scroll.
      if (!isAtBottom) {
        // If the user scrolls up, we disable auto-scroll and show the "Follow" button.
        setAutoScroll(false);
        setIsScrolledUp(true);
      } else {
        // If user scrolls back to the bottom, re-enable auto-scroll.
        setAutoScroll(true);
        setIsScrolledUp(false);
      }
    });

    // Initial scroll to bottom on mount if logs are present
    if (logs) {
        scrollToBottom();
    }
  };

  // Handler for the "Return to Bottom" / "Follow Logs" button
  const handleResumeAutoScroll = () => {
    // Re-enable auto-scroll and immediately jump to bottom
    setAutoScroll(true);
    scrollToBottom();
  };

  return (
    // Design Doc 5.1.3.B2: Background bg-background
    <div className={cn("relative h-full w-full overflow-hidden rounded-lg border bg-background shadow-inner", className)}>
      <MonacoWrapper
        ref={editorRef}
        value={logs}
        language="log" // Use 'log' or 'plaintext'
        onMount={handleMount}
        options={{
          readOnly: true,
          domReadOnly: true,
          lineNumbers: 'on',
          wordWrap: 'on', // Wrap long log lines
          // Monaco handles virtualization internally (Architecture 9.4.4)
          padding: { top: 12, bottom: 12 },
          // Optimize for logs: disable features not needed
          folding: false,
          codeLens: false,
          contextmenu: false,
          renderLineHighlight: 'none',
          minimap: { enabled: false },
          // Performance optimizations for large files
          largeFileOptimizations: true,
        }}
      />

      {/* "Return to Bottom" Button (Design Doc 3.1.1.A.3) */}
      {/* Using TailwindCSS animation utilities for a smooth appearance */}
      {isScrolledUp && (
        <div className="absolute bottom-4 right-8 z-20 animate-in fade-in slide-in-from-bottom-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleResumeAutoScroll}
            // Use primary color for high visibility
            className="flex items-center gap-2 shadow-xl transition-shadow hover:shadow-2xl bg-primary hover:bg-primary/90"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Follow Logs
          </Button>
        </div>
      )}
    </div>
  );
};


```


--- (15136-15267 lines) ---
### components/editors/CodeViewer.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import React, { useState } from 'react';
// We import the MonacoWrapper which already handles dynamic loading internally.
import MonacoWrapper from './MonacoWrapper';
import { Button } from '~/components/ui/button';
import { Copy, Download, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '~/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

interface CodeViewerProps {
  code: string;
  language: string;
  fileName?: string;
  className?: string;
  showLineNumbers?: boolean;
}

/**
 * CodeViewer component provides a read-only view for code snippets with syntax highlighting,
 * code folding, and utility actions (Copy/Download). (Design Doc 3.1.1.A.2)
 */
export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language,
  fileName = 'code_snippet.txt',
  className,
  showLineNumbers = true,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  // Design Doc 3.1.1.A.2: "Copy to clipboard" action
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      // Feedback is subtle via icon change.
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      toast.error('Failed to copy code.');
      console.error('Copy failed: ', err);
    });
  };

  // Design Doc 3.1.1.A.2: "Download" action
  const handleDownload = () => {
    // Determine extension and MIME type comprehensively
    const extensionMap: Record<string, { ext: string, mime: string }> = {
        python: { ext: '.py', mime: 'text/x-python' },
        javascript: { ext: '.js', mime: 'application/javascript' },
        typescript: { ext: '.ts', mime: 'application/typescript' },
        json: { ext: '.json', mime: 'application/json' },
        markdown: { ext: '.md', mime: 'text/markdown' },
        yaml: { ext: '.yaml', mime: 'text/yaml' },
        xml: { ext: '.xml', mime: 'application/xml' },
        html: { ext: '.html', mime: 'text/html' },
        log: { ext: '.log', mime: 'text/plain' },
    };

    const { ext, mime } = extensionMap[language] || { ext: '.txt', mime: 'text/plain' };
    const downloadFileName = fileName.includes('.') ? fileName : `${fileName}${ext}`;
    const mimeType = `${mime};charset=utf-8`;

    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${downloadFileName}.`);
  };

  return (
    // Design Doc 5.1.3.B2: Background bg-background (deeper than Card)
    // Add 'group' class to enable hover detection for the toolbar
    <div className={cn("group relative h-full w-full overflow-hidden rounded-lg border bg-background shadow-inner", className)}>
      {/* Toolbar positioned absolutely, visible on group hover for a cleaner interface */}
      <div className="absolute top-2 right-3 z-10 flex gap-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100 focus-within:opacity-100">

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={handleCopy} aria-label="Copy code" className="h-8 w-8 shadow-md">
              {isCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCopied ? 'Copied!' : 'Copy to clipboard'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="icon" onClick={handleDownload} aria-label="Download code" className="h-8 w-8 shadow-md">
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download file</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Monaco Editor Instance */}
      <MonacoWrapper
        value={code}
        language={language}
        options={{
          readOnly: true,
          domReadOnly: true, // Optimization for read-only mode
          lineNumbers: showLineNumbers ? 'on' : 'off',
          // Ensure padding so the floating toolbar doesn't obscure the top lines
          padding: { top: 16, bottom: 12 },
          // Optimization for large files
          largeFileOptimizations: true,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};


```


--- (15276-15459 lines) ---
### components/editors/RichTextEditor/index.tsx Content:

```tsx
"use client";

/**
 * Rich Text Editor Component based on Novel (Tiptap/ProseMirror).
 * Implements Design Doc requirement 4.3.B.4 (Rich Text/Markdown Editor).
 */

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  Placeholder,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import type { Content } from "@tiptap/react";
import { useState, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";

// Core configuration and utilities
import { defaultExtensions } from "./extensions";
import { slashCommand, suggestionItems } from "./slash-command";
import { uploadFn } from "./image-upload";
import { normalizeMathForEditor, unescapeLatexInMath } from "~/core/utils/markdown";

// UI Components (Selectors and Menus)
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { TextButtons } from "./selectors/text-buttons";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { Separator } from "~/components/ui/separator";

import { cn } from "~/lib/utils";

export interface RichTextEditorProps {
  initialContent: Content; // Markdown string or Tiptap JSON
  onUpdate?: (markdown: string) => void;
  debounceDuration?: number;
  className?: string;
  placeholder?: string;
  editable?: boolean;
}

export const RichTextEditor = ({
    initialContent,
    onUpdate,
    debounceDuration = 750,
    className = "",
    placeholder = "Start writing here, or type '/' for commands...",
    editable = true,
}: RichTextEditorProps) => {

  // Normalize initial content for editor consumption (especially LaTeX delimiters)
  const content = useMemo(() => {
    if (typeof initialContent === "string") {
      return normalizeMathForEditor(initialContent);
    }
    return initialContent;
  }, [initialContent]);

  // Combine default extensions with the slash command extension
  const extensions = useMemo(() => {
    // Create placeholder extension with the provided placeholder text
    const placeholderExtension = Placeholder.configure({
      placeholder,
    });
    // Replace the default placeholder with the configured one
    const extensionsWithoutPlaceholder = defaultExtensions.filter(ext => ext.name !== 'placeholder');
    return [...extensionsWithoutPlaceholder, placeholderExtension, slashCommand];
  }, [placeholder]);

  // State for managing the visibility of bubble menu selectors
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  // Debounced update handler for serializing content back to Markdown
  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      if (onUpdate) {
        // Get the Markdown representation
        let markdown = editor.storage.markdown.getMarkdown();
        // Crucial step: Unescape LaTeX characters that Tiptap might have escaped
        markdown = unescapeLatexInMath(markdown);
        onUpdate(markdown);
      }
    },
    debounceDuration,
  );

  return (
    <div className={cn("relative w-full h-full", className)}>
      <EditorRoot>
        <EditorContent
          editable={editable}
          immediatelyRender={false}
          initialContent={content as JSONContent}
          extensions={extensions}
          className="h-full w-full overflow-y-auto"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              // Apply Tailwind Typography styles ('prose'). Customized for high density (Design Doc 4.1.2.D).
              // Styles applied here are further customized by prosemirror.css
              class:
                "prose dark:prose-invert focus:outline-none max-w-full h-full",
            },
          }}
          onUpdate={({ editor }) => {
            if (!editable) return;
            debouncedUpdates(editor);
          }}
          slotAfter={<ImageResizer />}
        >
          {/* 1. Slash Command Menu (/) */}
          <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-border bg-popover px-1 py-2 shadow-lg transition-all">
            <EditorCommandEmpty className="text-muted-foreground px-2 text-sm">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent aria-selected:bg-accent cursor-pointer"
                  key={item.title}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          {/* 2. Bubble Menu (Floating Toolbar on selection) */}
          {editable && (
            <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
                <Separator orientation="vertical" className="h-5" />
                <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                <Separator orientation="vertical" className="h-5" />
                <TextButtons />
                <Separator orientation="vertical" className="h-5" />
                <LinkSelector open={openLink} onOpenChange={setOpenLink} />
                <Separator orientation="vertical" className="h-5" />
                <MathSelector />
                <Separator orientation="vertical" className="h-5" />
                <ColorSelector open={openColor} onOpenChange={setOpenColor} />
            </GenerativeMenuSwitch>
          )}

        </EditorContent>
      </EditorRoot>
    </div>
  );
};


```


--- (16958-17121 lines) ---
### components/editor/index.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import type { Content } from "@tiptap/react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "../ui/separator";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import { normalizeMathForEditor, unescapeLatexInMath } from "~/core/utils/markdown";
// import { defaultEditorContent } from "./content";

import "~/styles/prosemirror.css";

const hljs = require("highlight.js");

const extensions = [...defaultExtensions, slashCommand];

export interface ReportEditorProps {
  content: Content;
  onMarkdownChange?: (markdown: string) => void;
}

const ReportEditor = ({ content, onMarkdownChange }: ReportEditorProps) => {
  const [initialContent, setInitialContent] = useState<Content>(() => {
    // Normalize math delimiters for editor consumption
    if (typeof content === "string") {
      return normalizeMathForEditor(content);
    }
    return content;
  });
  const [saveStatus, setSaveStatus] = useState("Saved");

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      if (onMarkdownChange) {
        let markdown = editor.storage.markdown.getMarkdown();
        markdown = unescapeLatexInMath(markdown);
        onMarkdownChange(markdown);
      }
      setSaveStatus("Saved");
    },
    500,
  );

  if (!initialContent) return null;

  return (
    <div className="relative w-full">
      <EditorRoot>
        <EditorContent
          immediatelyRender={false}
          initialContent={initialContent as JSONContent}
          extensions={extensions}
          className="border-muted relative h-full w-full"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-base prose-p:my-4 dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="border-muted bg-background z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="text-muted-foreground px-2">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="hover:bg-accent aria-selected:bg-accent flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm"
                  key={item.title}
                >
                  <div className="border-muted bg-background flex h-10 w-10 items-center justify-center rounded-md border">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
            <Separator orientation="vertical" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <MathSelector />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default ReportEditor;

```

</deer_flow_frontend_code>

<architecture>
--- (56-59 lines) ---

  * **Monaco Editor**: **[关键选型]** 用于代码查看、编辑和实时日志展示。提供专业级体验。
  * **Novel (Tiptap/ProseMirror)**: 富文本/Markdown 编辑器，用于人工编辑环节。
  * **`react-markdown` + Remark/Rehype + KaTeX**: 用于渲染 Markdown 和 LaTeX 公式。


--- (129-135 lines) ---
├── /editors/           # 专业编辑器封装
│   ├── MonacoWrapper.tsx
│   ├── CodeViewer.tsx (Monaco Read-only)
│   ├── LogViewer.tsx (Monaco Live Logs)
│   └── RichTextEditor.tsx (Novel/Tiptap)
├── /renderers/         # 内容渲染器
│   └── MarkdownRenderer.tsx (react-markdown + KaTeX)


--- (152-161 lines) ---
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


--- (298-301 lines) ---
  // Workspace 状态
  isEditing: boolean;
  expandedBlocks: Set<string>; // e.g., 'artifacts', 'inputs'



--- (441-464 lines) ---
### 7.2 B. 节点交互工作区 (Node Interaction Workspace)

**文件**: `NodeWorkspace.tsx`。

采用“交互记录 (Interaction Transcript)”模型（设计文档 3.1.1.B）。

#### 7.2.1 结构与布局

  * **B1. Header (`WorkspaceHeader.tsx`)**: 固定顶部。显示标题、状态、上下文工具栏（Re-execute, Edit, Cancel）和 `StalenessBanner`。
  * **B2. Transcript (`InteractionTranscript.tsx`)**: 可滚动内容区。
      * 使用 `Collapsible` 实现区块管理（Inputs, Artifacts, Output, HITL Zone）。
  * **B3. Footer (`ActionFooter.tsx`)**: 固定底部。仅在 `HITL` 模式下显示。

#### 7.2.2 专业内容展示与编辑

  * **Artifacts Block**:
      * 使用 `Tabs` 组织 Prompt, Code, Logs。
      * 使用 `CodeViewer` (Monaco) 展示内容。
      * `LogViewer` 模式需支持实时更新和自动滚动（`use-stick-to-bottom`）。
  * **Output Block**:
      * 实现 View-to-Edit 模式切换（设计文档 3.1.1.D）。
      * View Mode: 使用 `MarkdownRenderer`。
      * Edit Mode: 动态切换为 `RichTextEditor` (Novel/Tiptap) 或 `CodeEditor` (Monaco)。


</architecture>



---

<task>


### 任务 16：工作区 (B) - 交互记录实现与内容集成

**目标：** 实现交互记录（Interaction Transcript, B2），并将任务 14 和 15 实现的专业内容组件集成到各个区块中。

**核心关注点：** 区块化布局、数据绑定（Pending vs Active）、专业组件应用。

**实现策略（参考 `<design_doc> 5.1.3.B2`, `<architecture> 7.2.2`）：**

1.  **InteractionTranscript 实现（`Workspace/InteractionTranscript.tsx`）：**
    *   实现 B2 区域结构。使用 `Collapsible` 实现区块（Block 1-4）的展开/折叠（连接到 `UIInteractionSlice.expandedBlocks`）。
2.  **数据源选择逻辑（完善 `NodeWorkspace.tsx`）：** 确定当前展示的数据源（`pending_result` vs `active_version` vs 历史版本）。
3.  **Block 1: Inputs（`InputsBlock.tsx`）：** 展示 `input_dependencies` 信息。默认折叠。
4.  **Block 2: Artifacts（`ArtifactsBlock.tsx`）：**
    *   使用 `Tabs` 组织 [Prompt], [Code], [Logs]。
    *   **关键集成：** 使用任务 14 实现的 `CodeViewer` 和 `LogViewer` 展示 `execution_artifacts`。
    *   实现 `Executing` 状态下的实时日志展示逻辑（自动展开 Logs Tab）。
5.  **Block 3: Output（`OutputBlock.tsx`）：**
    *   **关键集成：** 使用任务 15 实现的 `MarkdownRenderer` 展示 `output_data`。

**输入：** 任务 14 和 15 的输出（专业组件）, 任务 13 的输出（Workspace 结构）, `<design_doc> 5.1.3.B2`。
**输出：** 实现了内容展示和区块管理的交互记录组件，集成了专业查看器。


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

