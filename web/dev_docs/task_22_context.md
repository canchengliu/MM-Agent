<design_doc>
--- (45-47 lines) ---
    *   **心理模型:** “我需要能够精确地‘手术刀式’干预。”
    *   用户不满足于简单的“接受/拒绝”，需要能够直接编辑 AI 生成的中间产物（公式、代码、文本）（遵循 FRS 4）。
    *   HITL 必须提供结构化的选择（SCA）和批判机制（AVL），将 AI 的广度探索能力与人类的深度判断能力相结合。


--- (124-126 lines) ---
| H4.1 | 人工编辑中间结果 | 用户能够直接修改 AI 生成的工件（文本、代码、公式等）。 | FRS 4.1 | P0 |
| H4.2 | 人工编辑版本创建 | 保存编辑后创建新版本，标记为“人工编辑”，并自动激活。 | FRS 4.3 | P0 |



--- (178-180 lines) ---
    *   系统是用户的延伸。严格遵守 SRS 1.1，所有关键操作必须由用户显式触发。系统绝不进行任何未经授权的自动化级联操作。
    *   提供最精细的控制粒度（版本切换、人工编辑、执行控制），确保用户始终掌握主导权。



--- (281-281 lines) ---
          * `node_type` (enum: Standard, Generator). **(前端关键：用于控制“重新执行/编辑”的可用性)**。


--- (285-285 lines) ---
          * `is_stale` (boolean): 指示输入依赖是否已过时。**(前端关键：用于显示警告图标和横幅)**。


--- (295-306 lines) ---
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



--- (315-315 lines) ---
  * **`NodeType`**: `Standard`, `Generator`.


--- (317-317 lines) ---
  * **`VersionSource`**: `AI_GENERATED`, `MANUALLY_EDITED`.


--- (422-422 lines) ---
      * `Manual Editing Mode`: B2.Block 3 切换为编辑器。B3 变为 [Cancel Edit], [Save New Version]。


--- (482-489 lines) ---
4.  **系统状态传播 (关键步骤 - Staleness Update):**
      * **系统响应 (WebSocket):** 后端广播 `NODE_ACTIVE_VERSION_CHANGED` (Node A)。
      * **前端响应 (关键):** 前端监听到此事件，立即调用 `GET /workflows/{id}` 重新获取全量工作流状态。
      * 新的状态中，Node B 的 `is_stale` 标志为 `true`。
5.  **UI 更新与过时感知:**
      * Right Sidebar (C): V1 标记为 Active。
      * Left Navigator (A) 刷新：Node B 旁边出现 ⚠️ Staleness Indicator。
      * *(遵循 SRS 1.4 静默状态管理，系统不自动执行)*。


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



--- (553-559 lines) ---

1.  **专业文档与公式渲染 (Professional Markdown/LaTeX Renderer):**

      * **应用场景：** `Generated Output` 的展示（非编辑状态）。
      * **实现：** 基于 `react-markdown`，集成 `remark-gfm`, `remark-math`, `rehype-katex`。
      * **要求：** 使用 `@tailwindcss/typography` (`prose` class) 进行专业排版，但需定制样式以支持高密度显示（例如，减小行高和边距）。确保 KaTeX 公式渲染清晰、准确。



--- (560-565 lines) ---
2.  **代码与结构化数据查看器 (Code and Data Viewer):**

      * **应用场景：** 展示 `Execution Artifacts`（Prompt, generated\_code.py, JSON 数据）。
      * **实现：** 推荐使用 `Monaco Editor` 的只读模式，以提供最佳的性能、语法高亮、代码折叠和搜索功能。备选方案为 `react-syntax-highlighter`。
      * **要求：** 使用高质量等宽字体（如 Geist Mono）。提供“复制到剪贴板”和“下载”快捷操作。



--- (595-595 lines) ---
      * **限制：** `Generator` 节点的版本切换按钮必须禁用（遵循 SRS 2.3）。


--- (597-606 lines) ---
#### D. 人工编辑与模式切换 (Manual Editing and Mode Switching)

支持用户直接干预结果（FRS 4）。

  * **模式：View-to-Edit Transition**
      * **触发：** 用户在 `Completed` 节点点击 [Manual Edit]。
      * **切换：** Center Workspace 的 `Generated Output` 区块原位切换为编辑器。根据内容类型选择 `Novel/Tiptap`（富文本/Markdown）或 `Monaco Editor`（代码）。
      * **控制：** Workspace 工具栏按钮变更为 [Cancel Edit] 和 [Save New Version]。
      * **保存：** 点击 [Save New Version] 后，弹出模态框要求输入“版本摘要 (Summary)”。保存成功后，UI 切换回 Review Mode，显示新版本。



--- (657-663 lines) ---
  * **检测与传播逻辑:**
    1.  **触发:** 前端监听到 `NODE_ACTIVE_VERSION_CHANGED` WebSocket 事件。
    2.  **同步:** 前端必须立即调用 `GET /workflows/{id}` 重新获取全量工作流状态，以更新所有节点的 `is_stale` 标志。
  * **视觉传达:**
      * **全局 (Navigator A):** 在 `is_stale: true` 的节点旁显示清晰的 ⚠️ 图标。Hover 显示 Tooltip 解释原因。
      * **局部 (Workspace B1):** 如果当前节点过时，显示醒目的、不可关闭的 `Staleness Banner`。



--- (761-787 lines) ---
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


--- (795-798 lines) ---
  * **`Completed` (Review Mode):**
      * B1 Toolbar: 显示 [Re-execute], [Manual Edit]。
      * B2 Block 4: 显示只读的 HITL 历史记录。
      * B3 Footer: 隐藏。


--- (1400-1407 lines) ---
##### 3\. 代码/日志查看器与编辑器 (Code/Log Viewer and Editor)

  * **实现：** 基于 `Monaco Editor`。
  * **视觉属性：**
      * 主题：定制 Monaco 主题以匹配平台的 Dark/Light 模式。
      * 字体：`Geist Mono`, `text-sm` (14px)。
  * **功能：** 支持只读模式和编辑模式。提供语法高亮、代码折叠、复制/下载操作。日志模式下支持自动滚动到底部（使用 `use-stick-to-bottom` Hook）。



--- (1408-1413 lines) ---
##### 4\. 富文本/Markdown 编辑器 (Rich Text/Markdown Editor)

  * **实现：** 基于 `Novel` (Tiptap)。
  * **视觉属性：** 编辑器 UI（工具栏、浮动菜单）必须深度定制，以匹配全局组件风格。内容排版遵循 `prose` 规范（4.1.2.D）。
  * **功能：** 支持 GFM、LaTeX 公式编辑和实时预览 (KaTeX)。



--- (1515-1550 lines) ---
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



--- (1740-1743 lines) ---
2.  **状态同步范式 (关键):** 严格遵循“REST API 为全量快照（Source of Truth），WebSocket 提供增量更新”的原则（参见 3.1.2.C.1）。实现健壮的断线重连和重连后的全量同步。
3.  **Staleness 处理逻辑:** 监听到 `NODE_ACTIVE_VERSION_CHANGED` 事件后，必须立即重新获取全量工作流状态以更新 `is_stale` 标志。
4.  **动态结构处理:** `WORKFLOW_STRUCTURE_UPDATED` 事件必须触发 Zustand Store 的全量替换。


</design_doc>

<api>
--- (850-866 lines) ---
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



--- (1470-1500 lines) ---
### 4. 版本与结果干预

#### 4.1. 提交手动编辑 (R4)

允许用户绕过 AI 执行，直接注入人工结果。这是一个高权限操作，会立即完成节点并创建新版本。

*   **Endpoint**: `POST /nodes/{node_id}/manual-edit`
*   **权限**: 节点所有者。
*   **重要影响**: 此操作会立即将节点设为 `Completed`，并用您提供的数据创建一个新版本。这会立即触发对所有下游节点的“过时”状态检查。

##### 请求体 (`ManualEditSubmission`)
```json
{
  "base_version_id": 2,
  "edited_output_data": {
    "Formal Problem Restatement": "This is my manually edited problem restatement."
  },
  "summary": "Manually corrected the problem statement for clarity."
}
```
*   `base_version_id` (integer, **required**): 必须指定一个基础版本。
*   `edited_output_data` (object, **required**): 用户编辑后的完整输出 JSON。
*   `summary` (string, *optional*): 对本次编辑的简短描述。

##### 成功响应 (`200 OK`)
返回更新后的节点实例信息 (`NodeInstanceRead`)。

##### 错误响应
*   `409 Conflict` (`INVALID_STATE`): 指定的 `base_version_id` 无效。
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



--- (1552-1570 lines) ---

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
--- (20-24 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |


--- (47-52 lines) ---
| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |
| **Sonner** | 用于显示轻量级的 Toast 通知（消息提示）。 |


--- (63-81 lines) ---
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


--- (140-142 lines) ---
| 组件/模式 | 描述与复用价值 |
| :--- | :--- |
| **`InputBox`** | 一个功能完备的聊天输入框组件。它封装了：<br>- **富文本输入**: 基于 Tiptap/Novel，支持 `@mention` 等功能。<br>- **异步操作**: 内置“增强提示” (`Enhance Prompt`) 功能，包含加载和动画状态。<br>- **状态同步**: 通过 `useRef` 和 `useImperativeHandle` 暴露 `submit`, `setContent` 等方法，供父组件调用。<br>- **动态 UI**: 使用 `AnimatePresence` 展示用户反馈提示，并带有精美的动画效果。 |


--- (146-146 lines) ---
| **`ResearchBlock`** | 一个集成了标签页 (`Tabs`) 的复合视图组件。它允许用户在“研究报告”和“活动流”之间切换，同时在组件顶部提供了上下文相关的操作按钮（如编辑、复制、下载），是构建复杂信息面板的优秀参考。 |


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


--- (169-169 lines) ---
| **Markdown 预处理** | `core/utils/markdown.ts` 提供了一系列用于清理和规范化 Markdown 文本的函数，特别是 `normalizeMathForEditor` 和 `unescapeLatexInMath`，它们解决了在富文本编辑器中正确处理 LaTeX 数学公式的痛点。 |


--- (193-193 lines) ---
| **`Framer Motion` 列表与状态动画** | **列表交错动画**: 在 `conversation-starter.tsx` 和 `message-list-view.tsx` 中，通过在 `motion.li` 的 `transition` prop 中设置 `delay: index * 0.1`，实现了新项目依次入场的精美效果。这是一个可直接应用于任何动态列表的模式。<br>**条件渲染动画**: `input-box.tsx` 使用 `<AnimatePresence>` 组件来包裹根据条件渲染的元素（如用户反馈提示）。这使得元素的出现和消失都带有平滑的动画效果，而不是生硬地切换。 |


--- (219-228 lines) ---
### 十vii、 高级编辑器 (Tiptap/Novel) 定制

项目对 Novel 编辑器进行了深度定制，这些定制方案可以直接复用。

| 定制/模式 | 描述与复用价值 |
| :--- | :--- |
| **自定义 Markdown 序列化器** | `components/editor/math-serializer.ts` 文件展示了如何扩展 Tiptap 的现有插件。通过 `.extend()` 方法为 `Mathematics` 插件添加了自定义的 `markdown.serialize` 逻辑，确保数学公式能够被正确地转换回 `$...$` 和 `$$...$$` 格式的 Markdown。这是扩展 Tiptap 功能的核心模式。 |
| **斜杠命令 (Slash Command) 实现** | `components/editor/slash-command.tsx` 提供了一个完整的斜杠命令实现范例。它定义了一个 `suggestionItems` 数组，每个对象包含命令的标题、图标和执行逻辑，然后通过 `Command.configure` 集成到编辑器中。这套代码几乎可以原封不动地移植到任何 Tiptap 项目中。 |
| **异步 `@mention` 建议系统** | `components/deer-flow/resource-suggestion.tsx` 是一个非常高级的模式。它配置了 Tiptap 的 `Mention` 插件，使其 `items` 属性成为一个异步函数，该函数通过 `fetch` 动态查询 RAG 资源。同时，它使用 `ReactRenderer` 和 `Tippy.js` 来渲染自定义的浮动建议列表 (`ResourceMentions` 组件)。这为实现任何需要异步数据源的编辑器建议功能提供了完美的蓝图。 |



--- (249-249 lines) ---
| **状态更新批处理** | `core/store/store.ts` 中的 `sendMessage` 函数在处理 SSE 流时，并没有在每次收到 `chunk` 时都立即调用 `setState`，而是将待更新的消息放入一个 `pendingUpdates` Map 中，并通过 `setTimeout` 进行批处理。这种“去抖”或“批处理”的模式，将一秒内可能发生的数十次状态更新合并为少数几次，极大地减少了 React 的渲染次数，是流式应用性能优化的关键。 |


--- (269-269 lines) ---
| **安全性** | **防范 XSS 攻击**: 渲染用户生成或来自 API 的内容时，项目始终使用 `react-markdown` (`Markdown` 组件) 或通过 Tiptap 的安全机制进行渲染，而不是直接使用 `dangerouslySetInnerHTML`。<br>**安全处理用户输入**: `components/editor/index.tsx` 中的富文本编辑器在处理粘贴内容时，通过 `handleImagePaste` 和 `transformPastedHTML` 等逻辑对输入进行过滤和转换，防止粘贴恶意的 HTML 代码。<br>**安全的外部链接**: 在所有 `target="_blank"` 的链接中，都添加了 `rel="noopener noreferrer"`，防止了潜在的 "tabnabbing" 漏洞。 |

</front_stack>

<deer_flow_frontend_code>
--- (1210-1217 lines) ---
// API 5.4.1: ManualEditSubmission (R4.1, R4.2)
export const ManualEditSubmissionSchema = z.object({
  base_version_id: z.number().int(),
  edited_output_data: JsonObjectSchema,
  summary: z.string().optional(),
});
export type ManualEditSubmission = z.infer<typeof ManualEditSubmissionSchema>;



--- (1883-1901 lines) ---
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


--- (2050-2067 lines) ---
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


--- (3663-3685 lines) ---
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


--- (3740-3891 lines) ---
export interface UIInteractionSlice {
  // --- State ---

  // 1. Navigation & Selection
  activeNodeId: number | null;

  // 2. Workspace View State
  // If null, we are viewing the latest (active_version or pending_result).
  viewingVersionId: number | null;
  isEditing: boolean;
  // Temporary storage for content being edited locally before submission (Design Doc 2.3.3)
  localEditContent: string | null;

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
  // Action to update the local draft content
  updateLocalEditContent: (content: string) => void;
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
  localEditContent: null,
  collapsedPhases: new Set(),
  collapsedStages: new Set(),
  expandedBlocks: DEFAULT_EXPANDED_BLOCKS,

  selectNode: (nodeId) => {
    // When selecting a new node, reset the view state (view latest, not editing)
    // and reset expanded blocks to default for the new context. (Design Doc 2.4.B)
    // Also clear any local drafts from the previously selected node.
    set({
      activeNodeId: nodeId,
      viewingVersionId: null,
      isEditing: false,
      localEditContent: null,
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
    // We do not initialize localEditContent here; the editor component initializes based on existing content.
    set({ isEditing: true, viewingVersionId: null });
  },

  stopEditing: () => {
    // When stopping editing (Cancel or Save), clear the local draft.
    set({ isEditing: false, localEditContent: null });
  },

  // Update handler for the editor component
  updateLocalEditContent: (content: string) => {
    // Only update if currently in editing mode
    if (get().isEditing) {
      set({ localEditContent: content });
    }
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
      localEditContent: null,
      collapsedPhases: new Set(),
      collapsedStages: new Set(),
      expandedBlocks: DEFAULT_EXPANDED_BLOCKS,
    });
  },
});



--- (577-581 lines) ---
    case EventType.NodeActiveVersionChanged:
      // Triggers full sync for staleness (API 6.5.2)
      // The action is async, we use void to explicitly acknowledge we are not waiting for it here.
      void store.handleNodeActiveVersionChanged(payload.data);
      break;


--- (1093-1095 lines) ---
export enum EventType {
  NodeStatusUpdated = "NODE_STATUS_UPDATED",
  NodeActiveVersionChanged = "NODE_ACTIVE_VERSION_CHANGED",


--- (1112-1116 lines) ---
export type NodeActiveVersionChangedPayload = BaseEventPayload & {
  event_type: EventType.NodeActiveVersionChanged;
  data: NodeInstanceRead;
  node_id: number;
};


--- (8286-8469 lines) ---
### app/(platform)/projects/[projectId]/workflow/components/workspace/action-footer.tsx Content:

```tsx
"use client";

import React from "react";
import { useShallow } from "zustand/react/shallow";
import { Save, X, Check, MessageSquare, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "~/components/ui/button";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { useStore } from "~/core/store";
import { HITLInteractionContext, type HITLInteractionContextType } from "../../hitl/hitl-interaction-manager";
import { NodeStatus } from "~/constants/enums";

interface ActionFooterProps {
  // We can use NodeInstanceRead as status and ID are sufficient for the footer logic.
  node: NodeInstanceRead;
}

/**
 * B3. Action Footer (Fixed Bottom, Conditional Visibility)
 * Provides primary actions for HITL Approval or Manual Editing mode.
 * (Design Doc 5.1.3.B3)
 */
export function ActionFooter({ node }: ActionFooterProps) {
  const { isEditing, stopEditing, isExecutingAction, viewingVersionId } = useStore(
    useShallow((state) => ({
      // Check if we are editing THIS specific node
      isEditing: state.isEditing && state.activeNodeId === node.id,
      stopEditing: state.stopEditing,
      // isExecutingAction tracks API requests from the store (e.g. Manual Edit save)
      isExecutingAction: state.isExecutingAction,
      viewingVersionId: state.viewingVersionId,
    })),
  );

  const isAwaitingHITL = node.status === NodeStatus.AwaitingHITLApproval;
  // HITL interactions are only allowed when viewing the latest state (not historical).
  const isViewingHistory = viewingVersionId !== null;

  // Footer visible in HITL (latest view only) or Editing Mode. (Design Doc 3.1.1.B)
  const showFooter = (isAwaitingHITL && !isViewingHistory) || isEditing;

  // Use HITLInteractionContext if available (provided by HITLInteractionManager when Awaiting HITL)
  // This context manages the state and actions for the HITL process.
  const hitlContext = React.useContext(HITLInteractionContext);

  // Design Doc 5.2.3.2: Action Footer Transition (B3)
  return (
    <AnimatePresence>
      {showFooter && (
        <motion.footer
          // Animation parameters: initial, animate, exit. Duration.FAST (0.2s), Easing.ENTER
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }} // "easeOut" often corresponds to Easing.ENTER
          // Styling: h-16 (64px), border-t, bg-card. (Design Doc 5.1.3.B3)
          className="flex h-16 shrink-0 items-center justify-between border-t bg-card px-6"
        >
          {isEditing ? (
            <EditingFooterActions
              stopEditing={stopEditing}
              isExecutingAction={isExecutingAction}
            />
          ) : (
            <HITLFooterActions
              hitlContext={hitlContext}
              // For HITL actions, we rely primarily on the context's isSubmitting state,
              // but also respect the global isExecutingAction as a fallback/safety measure.
              isGloballyExecuting={isExecutingAction}
            />
          )}
        </motion.footer>
      )}
    </AnimatePresence>
  );
}

// --- Helper Components for Actions ---

interface EditingFooterActionsProps {
  stopEditing: () => void;
  isExecutingAction: boolean;
}

// State: Manual Editing Mode (Design Doc 3.1.1.B)
function EditingFooterActions({ stopEditing, isExecutingAction }: EditingFooterActionsProps) {
  return (
    <>
      <div className="text-sm font-medium text-muted-foreground">
        Editing Mode
      </div>
      {/* Layout: flex justify-end space-x-4. */}
      <div className="flex space-x-4">
        <Button
          variant="ghost"
          onClick={stopEditing}
          disabled={isExecutingAction}
        >
          <X className="h-4 w-4" />
          Cancel Edit
        </Button>
        {/* Placeholder for Save action (Implementation in future task) */}
        <Button
          variant="default"
          disabled={isExecutingAction}
          onClick={() => console.log("Save New Version clicked (Placeholder)")}
        >
          <Save className="h-4 w-4" />
          Save New Version
        </Button>
      </div>
    </>
  );
}

interface HITLFooterActionsProps {
  hitlContext: HITLInteractionContextType | null;
  isGloballyExecuting: boolean;
}

// State: Awaiting HITL Approval
function HITLFooterActions({ hitlContext, isGloballyExecuting }: HITLFooterActionsProps) {
  // Defensive check: If context is missing, the manager hasn't initialized (e.g., data still loading).
  if (!hitlContext) {
    return (
      <div className="w-full text-center text-sm text-muted-foreground italic">
        Loading HITL Controls...
      </div>
    );
  }

  const {
    handleApprove,
    handleReject,
    handleDiscard,
    isSubmitting,
    isInteractionValid,
  } = hitlContext;

  const isDisabled = isSubmitting || isGloballyExecuting;

  return (
    <>
      <div>
        {/* Secondary Actions: [Discard] (ghost) (H2.3) */}
        <Button
          variant="ghost"
          disabled={isDisabled}
          onClick={handleDiscard}
        >
          <Trash2 className="h-4 w-4" />
          Discard Execution
        </Button>
      </div>
      <div className="flex space-x-4">
        {/* Primary Actions: [Reject] (secondary) (H2.2) */}
        <Button
          variant="secondary"
          disabled={isDisabled}
          onClick={handleReject}
        >
          <MessageSquare className="h-4 w-4" />
          Reject & Provide Feedback
        </Button>
        {/* [Approve] (primary) (H2.1) */}
        <Button
          variant="default"
          // Approve is disabled if overall disabled OR if specific interaction data is invalid (e.g. SCA selection missing)
          disabled={isDisabled || !isInteractionValid}
          onClick={handleApprove}
        >
          <Check className="h-4 w-4" />
          Approve & Continue
        </Button>
      </div>
    </>
  );
}

```


--- (8617-8782 lines) ---
    cancelNode,
    startEditing,
    isEditing,
  } = useStore(
    useShallow((state) => ({
      isExecutingAction: state.isExecutingAction,
      // Check if this specific node is pending cancellation (Task 17.5)
      isCancelling: state.pendingCancellationNodeIds.has(node.id),
      cancelNode: state.cancelNode,
      startEditing: state.startEditing,
      // Check if we are currently editing THIS specific node
      isEditing: state.isEditing && state.activeNodeId === node.id,
    })),
  );

  // Handlers for opening/closing the dialog
  const handleOpenReExecute = () => {
    setExecutionDialogState({ isOpen: true, type: "Re-execute" });
  };

  const handleOpenRetry = () => {
    setExecutionDialogState({ isOpen: true, type: "Retry" });
  };

  const handleCloseDialog = () => {
    setExecutionDialogState({ isOpen: false, type: null });
  };

  // Check if a global action is ongoing (API call), but suppress if the dialog is open.
  const isActionExecutingWhileDialogClosed = isExecutingAction && !executionDialogState.isOpen;

  // If an action is currently executing, show a processing indicator (Task 17.3).
  // We prioritize the specific "Cancelling" UI (handled below in the button logic), so we exclude it here.
  if (isActionExecutingWhileDialogClosed && !isCancelling) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </div>
    );
  }

  // Global disable state: if we are currently editing the node (actions move to footer B3) OR externally disabled (e.g., viewing history)
  const disabled = isEditing || externalDisabled;

  // Design Doc 2.1.2.A: Generator nodes have behavioral restrictions (W3.2).
  const isGenerator = node.node_type === "Generator";
  const generatorMessage =
    "Generator nodes define workflow structure and cannot be modified or re-executed independently.";

  // Logic based on Design Doc 3.1.3.B (State Variations) and API specs.

  let content = null;

  if (node.status === "Executing") {
    // State: Executing -> Show [Cancel Execution] (API 5.2.3) or [Cancelling...]

    if (isCancelling) {
      // Design Doc 3.1.2.C.4 Step 1: Button immediately becomes "Cancelling..." and disabled.
      content = (
        <Button
          variant="destructive"
          size="sm"
          disabled={true}
          // Apply semantic color (Orange) via text color utility if needed, though 'destructive' variant handles the main color.
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Cancelling...
        </Button>
      );
    } else {
      content = (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => cancelNode(node.id)}
          // Allow canceling even if editing (though unlikely state combination)
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          Cancel Execution
        </Button>
      );
    }
  } else if (node.status === "Failed" || node.status === "Canceled") {
    // State: Failed/Canceled -> Show [Retry] (API 5.2.2)
    content = (
      <Button
        variant="secondary"
        size="sm"
        // Open dialog to allow optional comments (API 5.2.2)
        onClick={handleOpenRetry}
        disabled={disabled}
      >
        <RotateCw className="h-4 w-4" />
        Retry
      </Button>
    );
  } else if (node.status === "Completed") {
    // State: Completed (Review Mode)
    // Standard nodes show [Manual Edit] (API 5.4.1) and [Re-execute] (API 5.2.1)
    content = (
      <div className="flex gap-2">
        {/* Manual Edit Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Span wrapper is required for tooltips on disabled buttons */}
            <span>
              <Button
                variant="outline"
                size="sm"
                // startEditing triggers UI state change in UIInteractionSlice
                onClick={startEditing}
                disabled={disabled || isGenerator}
              >
                <Edit2 className="h-4 w-4" />
                Manual Edit
              </Button>
            </span>
          </TooltipTrigger>
          {isGenerator && <TooltipContent>{generatorMessage}</TooltipContent>}
        </Tooltip>

        {/* Re-execute Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="default" // Using primary (default) for Re-execute
                size="sm"
                // Open dialog to allow optional comments (API 5.2.1, Task 17.4)
                onClick={handleOpenReExecute}
                disabled={disabled || isGenerator}
              >
                <RotateCcw className="h-4 w-4" />
                Re-execute
              </Button>
            </span>
          </TooltipTrigger>
          {isGenerator && <TooltipContent>{generatorMessage}</TooltipContent>}
        </Tooltip>
      </div>
    );
  }

  // Awaiting HITL Approval (actions in B3), Not Started, or other states have no actions in B1.
  return (
    <>
      <TooltipProvider>{content}</TooltipProvider>
      {/* Render the dialog portal if open */}
      {executionDialogState.type && (
        <ExecutionDialog
          isOpen={executionDialogState.isOpen}
          onClose={handleCloseDialog}
          nodeId={node.id}
          nodeName={node.name}
          type={executionDialogState.type}
          // baseVersionId is omitted here as ContextualToolbar operates on the active version by default (API 5.2.1).
        />
      )}
    </>
  );
}


```


--- (8813-8970 lines) ---
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

  // 3. Fetch latest details when activeNodeId changes
  useEffect(() => {
    if (activeNodeId) {
      // Trigger fetch (non-blocking). The slice handles caching and errors (toasts).
      void fetchNodeDetails(activeNodeId);
    }
  }, [activeNodeId, fetchNodeDetails]);

  // 4. Determine the data source for the transcript (Handles historical vs latest)
  // This hook manages fetching historical data via the store if needed.
  const transcriptData = useTranscriptData(activeNodeDetails);

  // 5. Determine loading state and display data
  // We are loading initial details if we have an ID but not the details object yet.
  const isLoadingDetails = !!activeNodeId && !activeNodeDetails;

  // The transcript content is loading if initial details are loading OR if the hook reports loading (e.g., historical fetch).
  const isTranscriptLoading = isLoadingDetails || transcriptData.isLoading;

  // Use details if available, otherwise fallback to basic info if available.
  // This ensures responsiveness: basic info renders immediately while details load.
  const displayNode = activeNodeDetails ?? activeNodeBasic;

  // Handle Empty State (No node selected)
  if (!displayNode) {
    // If activeNodeId is null, it's empty. If activeNodeId is set but basic info is missing (e.g. data sync issue), also treat as empty/loading.
    return activeNodeId ? <LoadingWorkspace /> : <EmptyWorkspace />;
  }

  // (Task 18): Determine if HITL Manager is needed
  const isAwaitingHITL = displayNode.status === NodeStatus.AwaitingHITLApproval;

  // Define the main content (B2 and B3)
  const workspaceContent = (
    <>
      {/* B2: Content (Scrollable) - InteractionTranscript */}
      <ScrollArea className="flex-1">
        {isTranscriptLoading ? (
          // Loading State for Details within B2
          <div className="p-6">
            <LoadingWorkspaceDetails />
          </div>
        ) : (
          // Loaded State
          // We know activeNodeDetails must exist here if isTranscriptLoading is false (due to the hook implementation).
          // We pass the selected dataSource to the transcript.
          <InteractionTranscript
            node={activeNodeDetails!}
            dataSource={transcriptData}
          />
        )}
      </ScrollArea>

      {/* B3: Footer (Fixed Bottom, Conditional Visibility) */}
      {/* Visibility logic (HITL or Editing) is handled inside ActionFooter. */}
      <ActionFooter node={displayNode} />
    </>
  );

  // Render the workspace structure (Design Doc 3.1.3.B)
  // B1/B2/B3 Layout implementation using flex column.
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* B1: Header (Fixed Top) - Includes B1.1 Staleness Banner internally */}
      <WorkspaceHeader
        node={displayNode}
        isSyncing={isSyncing}
        workflowStatus={workflowStatus}
        isLoadingDetails={isTranscriptLoading}
        // Pass the staleness report from the details (only available when details are loaded)
        stalenessReport={activeNodeDetails?.staleness_report ?? null}
      />

      {/* Conditionally wrap B2 and B3 with HITLInteractionManager (Design Doc 3.1.1.E) */}
      {isAwaitingHITL ? (
        // When Awaiting HITL, provide the manager with the necessary context.
        // We use a key based on the node ID and its status to ensure the manager state resets
        // when the underlying state changes (e.g., navigating or after ReExecute which changes status).
        <HITLInteractionManager
          key={`${displayNode.id}-${displayNode.status}`}
          node={displayNode}
          // Determine the pending result source reliably for the manager.
          // Prioritize the transcriptData if it's pending, otherwise fallback to details.
          pendingResult={
            (transcriptData.isPending ? (transcriptData.data as TemporaryExecutionRead) : null) ??
            activeNodeDetails?.pending_result ??
            null
          }
        >
          {workspaceContent}
        </HITLInteractionManager>
      ) : (
        workspaceContent
      )}
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




--- (9071-9221 lines) ---
export function WorkspaceHeader({
  node,
  isSyncing,
  workflowStatus,
  isLoadingDetails,
  stalenessReport,
}: WorkspaceHeaderProps) {
  // (Task 21): Access UI Interaction state (Design Doc 3.1.1.C.1)
  const { viewingVersionId, viewLatestVersion } = useStore(
    useShallow((state) => ({
      viewingVersionId: state.viewingVersionId,
      viewLatestVersion: state.viewLatestVersion,
    })),
  );

  // We are viewing history if viewingVersionId is set (regardless of whether it's the active version or not).
  const isViewingHistory = viewingVersionId !== null;

  // Determine if the Staleness Banner (B1.1) should be shown.
  // Requires node to be marked stale AND we must have the details (report) loaded.
  // (Task 21): Hide staleness banner when viewing history, as staleness relates to the latest state.
  const showStalenessBanner =
    node.is_stale && stalenessReport && stalenessReport.length > 0 && !isViewingHistory;

  // Design Doc 5.1.5: Activate BorderBeam animation (Cyan) when Executing.
  const isExecuting = node.status === "Executing";

  return (
    // B1: Fixed Top Header Container. Uses flex-col to stack main header and banner.
    // Relative positioning required for BorderBeam.
    <div className="relative z-10 flex shrink-0 flex-col border-b border-border/50 bg-background">
       {/* Visual Enhancement: BorderBeam during execution */}
       {isExecuting && (
        <BorderBeam
          // Use the semantic status color for executing (Cyan)
          // status.executing.DEFAULT: hsl(186.2 95.2% 40.3%)
          colorFrom="hsl(186.2 95.2% 40.3%)"
          colorTo="hsl(186.2 95.2% 60%)"
          duration={5}
        />
      )}
      
      {/* Main Header Content (B1) */}
      {/* We use padding (py-3) instead of fixed height (h-12) to accommodate content flexibly. */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3">
        {/* Left side: Title, Status, Metadata */}
        <div className="flex items-center gap-4">
          <NodeStatusIcon status={node.status} size={24} className="hidden sm:block" />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Design Doc 5.1.3.B1: [ID] | [Name] */}
              <h1 className="text-lg font-semibold">
                <span className="font-mono text-sm text-muted-foreground">
                  {node.definition_id}
                </span>{" "}
                | {node.name}
              </h1>

                {/* Status Badge */}
                {/* (Task 21): Hide status badge when viewing history, as the status reflects the current live state, not the historical snapshot. */}
                {!isViewingHistory && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5 text-xs font-medium"
                  >
                    {/* Show detailed stage if executing (Design Doc 3.3.C) */}
                    {node.status === "Executing"
                      ? node.current_stage
                      : node.status}
                  </Badge>
                )}

                {/* (Task 21): Historical View Indicator (Design Doc 3.1.1.C.1) */}
                {isViewingHistory && (
                  <Badge
                    variant="outline"
                    // Use Amber color scheme for prominent visual indication
                    className="flex items-center gap-1.5 text-xs font-medium border-amber-500 text-amber-700 bg-amber-50/50 dark:text-amber-500 dark:bg-amber-950/30 shadow-sm"
                  >
                    <History className="h-3.5 w-3.5" />
                    Reviewing History
                  </Badge>
                )}

              {isLoadingDetails && (
                <Loader2
                  className="h-4 w-4 animate-spin text-muted-foreground"
                  title="Loading details"
                />
              )}
            </div>
            {/* Metadata (Stage and Type) */}
            <p className="text-sm text-muted-foreground mt-0.5">
              {node.stage_name} • Type: {node.node_type} • HITL:{" "}
              {node.hitl_mode}
            </p>
          </div>
        </div>

        {/* Right side: Contextual Toolbar and Workflow Status */}
        <div className="flex items-center gap-6">
          {/* Contextual Toolbar (Dynamic Buttons) */}
            {/* (Task 21): Disable toolbar actions (Re-execute, Edit) when viewing history. */}
          <ContextualToolbar node={node} disabled={isViewingHistory} />

            {/* (Task 21): Action: Return to Latest Version (Improves UX) */}
            {isViewingHistory && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={viewLatestVersion}
                      className="flex items-center gap-2"
                    >
                      <Undo2 className="h-4 w-4" />
                      Return to Latest
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop reviewing history and view the latest active version.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

          {/* Workflow Status Indicator */}
          <div className="flex items-center gap-3 border-l pl-6">
            {isSyncing && (
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing
              </span>
            )}
            <Badge
              variant="outline"
              className="text-xs uppercase tracking-wide"
            >
              Workflow {workflowStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* B1.1: Staleness Banner (Conditional) */}
      {showStalenessBanner && <StalenessBanner report={stalenessReport!} />}
    </div>
  );
}



--- (9773-9854 lines) ---
export function OutputBlock({ node, dataSource }: OutputBlockProps) {
    const { isEditing, updateLocalEditContent, localEditContent } = useStore(
        useShallow((state) => ({
          // We only enter edit mode if the user explicitly started it via the toolbar
          isEditing: state.isEditing,
          // State management for the local draft (managed in UIInteractionSlice)
          updateLocalEditContent: state.updateLocalEditContent,
          localEditContent: state.localEditContent,
        })),
      );

  const outputData = dataSource.data?.output_data;

  // Determine the content to display. This logic attempts to find Markdown content, falling back to JSON.
  const content = useMemo(() => {
    if (!outputData) return "";

    // If it's a simple string, assume it's Markdown.
    if (typeof outputData === 'string') {
        return outputData;
    }

    // If it's an object, look for common markdown fields (Heuristic approach)
    if (typeof outputData === 'object' && outputData !== null) {
        const markdownKeys = ['report', 'content', 'markdown', 'analysis', 'summary', 'comparative_analysis', 'result'];
        for (const key of markdownKeys) {
            if (key in outputData && typeof (outputData as Record<string, unknown>)[key] === 'string') {
                return (outputData as Record<string, string>)[key];
            }
        }
    }

    // Fallback for unknown object structure: serialize to JSON for visibility.
    if (typeof outputData === 'object' && Object.keys(outputData).length > 0) {
        // Use Markdown code block formatting for JSON display within the renderer.
        try {
            return `\`\`\`json\n${JSON.stringify(outputData, null, 2)}\n\`\`\``;
        } catch (e) {
            console.error("Failed to serialize output data:", e);
            return "Error: Output data could not be displayed.";
        }
    }

    return String(outputData);
  }, [outputData]);

  const isEmpty = content.trim() === "";

  // We should only show the editor if the global state isEditing is true AND we are viewing the latest version (Design Doc 3.1.1.D)
  const showEditor = isEditing && !dataSource.isHistorical;

  return (
    // Design Doc 2.4.B: Output default expanded (managed by UIInteractionSlice defaults)
    <TranscriptBlock blockKey="output" title="Generated Output">
      {isEmpty && !showEditor ? (
        <div className="text-sm text-muted-foreground italic p-4 border rounded-lg bg-muted/50">
          No primary output generated. Check the HITL Zone or Artifacts if applicable.
        </div>
      ) : showEditor ? (
        // Edit Mode: RichTextEditor (Novel/Tiptap) (Design Doc 5.1.3.B2)
        // Use a slightly different background and border to signify edit mode.
        <div className="-m-4 p-4 bg-background/50 rounded-lg border border-input shadow-inner">
            {/* Initialize with the current content, or the local draft if the user started typing */}
            <RichTextEditor
                // Use the draft if available, otherwise use the original content
                initialContent={localEditContent ?? content}
                onUpdate={updateLocalEditContent}
                // Provide ample space for editing
                className="min-h-[500px]"
            />
        </div>
      ) : (
        // View Mode: MarkdownRenderer (Design Doc 5.1.3.B2)
        // The renderer handles Markdown and the JSON fallback (which is wrapped in ```json).
        <MarkdownRenderer content={content} />
      )}
    </TranscriptBlock>
  );
}


```


--- (12429-12437 lines) ---
// API 3.5.4: Node Type (SRS 2.2)
export const NodeTypeEnum = z.enum(["Standard", "Generator"]);
export type NodeType = z.infer<typeof NodeTypeEnum>;

// (Task 21): Define explicit constants for NodeType
export const NodeType = {
  Standard: "Standard" as const,
  Generator: "Generator" as const,
};


--- (18723-18906 lines) ---
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


--- (19219-19412 lines) ---
### components/editors/RichTextEditor/extensions.tsx Content:

```tsx
// Configuration file for all Tiptap extensions used in the editor.
import {
  // Core Tiptap/Novel extensions
  StarterKit,
  Placeholder,
  TiptapLink,
  TiptapUnderline,
  TaskList,
  TaskItem,
  HorizontalRule,
  CodeBlockLowlight,
  // Feature extensions
  Color,
  TextStyle,
  HighlightExtension,
  GlobalDragHandle,
  CustomKeymap,
  // Image handling
  UpdatedImage,
  UploadImagesPlugin,
  // AI features
  AIHighlight,
} from "novel";

// Markdown support
import { Markdown } from "tiptap-markdown";

// Table support
import { Table } from "@tiptap/extension-table";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";

// Lowlight for syntax highlighting
import { common, createLowlight } from "lowlight";

import { cx } from "class-variance-authority";

// Custom Mathematics extension with serialization
import { MathematicsWithMarkdown } from "./math-serializer";
import { katexOptions } from "~/core/markdown/katex";

// --- Extension Configurations ---

const aiHighlight = AIHighlight;
const placeholder = Placeholder; // Configured via editor props dynamically

// Links
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors cursor-pointer",
    ),
  },
  openOnClick: false,
});

// Images (Using UpdatedImage from Novel)
const updatedImage = UpdatedImage.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-border shadow-sm"),
  },
  allowBase64: true,
}).extend({
    // Integrate the image upload plugin
    addProseMirrorPlugins() {
        return [
            UploadImagesPlugin({
                // Style applied while uploading (uses .img-placeholder in CSS)
                imageClass: cx("opacity-50 rounded-lg border border-border"),
            }),
        ];
    },
});


// Task Lists
const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-0"),
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex gap-2 items-start my-1"), // High density spacing
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({});

// StarterKit (Base document structure)
const starterKit = StarterKit.configure({
  // Configuration relies on 'prose' styles customized in tailwind.config.js (Design Doc 4.1.2.D)
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary pl-4 italic text-muted-foreground"),
    },
  },
  codeBlock: false, // Use CodeBlockLowlight instead
  code: {
    HTMLAttributes: {
      spellcheck: "false",
      // Ensure Geist Mono is used
      class: cx("font-mono"),
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "hsl(var(--primary))",
    width: 2,
  },
});

// Code Block with Syntax Highlighting
const codeBlockLowlight = CodeBlockLowlight.configure({
  lowlight: createLowlight(common),
  HTMLAttributes: {
    class: cx("font-mono text-sm"),
  },
});

// Mathematics (LaTeX)
const mathematics = MathematicsWithMarkdown.configure({
  HTMLAttributes: {
    class: cx("text-foreground rounded-sm p-0.5 transition-colors hover:bg-accent cursor-pointer inline-block"),
  },
  katexOptions: {
      ...katexOptions,
      throwOnError: false // Don't crash the editor while typing formulas
  },
});

// Tables
const table = Table.configure({ resizable: true });
const tableRow = TableRow.configure();
const tableCell = TableCell.configure({
    HTMLAttributes: {
        class: cx("border border-border p-2 text-left align-top"),
    }
});
const tableHeader = TableHeader.configure({
    HTMLAttributes: {
        class: cx("border border-border p-2 text-left font-bold bg-muted align-top"),
    }
});

// Markdown Serialization/Deserialization
const markdownExtension = Markdown.configure({
  html: true, // Allow HTML content if necessary
  tightLists: true, // High density lists
  linkify: false,
  breaks: false,
});

const globalDragHandle = GlobalDragHandle.configure({});
const highlight = HighlightExtension.configure({ multicolor: true });


// Export the list of all extensions
export const defaultExtensions = [
  // Base
  starterKit,
  placeholder,
  CustomKeymap,
  markdownExtension,
  // Formatting
  TiptapUnderline,
  TextStyle,
  Color,
  highlight,
  // Nodes
  tiptapLink,
  updatedImage,
  taskList,
  taskItem,
  table,
  tableRow,
  tableCell,
  tableHeader,
  horizontalRule,
  codeBlockLowlight,
  mathematics,
  // Utilities
  aiHighlight, // Required for AI features
  globalDragHandle,
];


```


--- (18908-18947 lines) ---
### components/editors/RichTextEditor/math-serializer.ts Content:

```ts
import { Mathematics } from "novel";

/**
 * Extended Mathematics extension with custom markdown serialization support.
 * This is crucial for ensuring that LaTeX formulas are correctly converted back
 * to standard Markdown delimiters ($...$ and $$...$$) when saving the content.
 */
export const MathematicsWithMarkdown = Mathematics.extend({
  addStorage() {
    return {
      // Define how this node should be serialized when using tiptap-markdown extension
      markdown: {
        serialize(state: any, node: any) {
          const latex = node.attrs?.latex || "";
          // The 'display' attribute determines if it's inline or block math
          const isBlock = node.attrs?.display === true;

          if (isBlock) {
            // Block/display math: $$...$$
            state.write("$$");
            state.write(latex);
            state.write("$$");
            // Ensure block separation in Markdown output
            state.closeBlock(node);
          } else {
            // Inline math: $...$
            state.write("$");
            state.write(latex);
            state.write("$");
          }
        },
      },
    };
  },
});




--- (863-1024 lines) ---
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

```


--- (20405-20568 lines) ---
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
--- (15-15 lines) ---
3.  **精细化控制与复杂交互**: 支持多种人机协同 (HITL) 模式和精细的用户干预（版本切换、人工编辑）。


--- (57-59 lines) ---
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


--- (366-369 lines) ---

1.  **`NODE_STATUS_UPDATED` (增量更新)**: 直接更新 `WorkflowSlice.nodesById`。
2.  **`NODE_ACTIVE_VERSION_CHANGED` (Staleness 更新)**: 必须触发全量同步 (`loadWorkflow`) 以刷新全局 `is_stale` 标志。
3.  **`WORKFLOW_STRUCTURE_UPDATED` (结构更新)**: 必须使用事件负载进行全量替换 `WorkflowSlice.workflowInstance`。


--- (441-470 lines) ---
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

#### 7.2.3 HITL 交互区 (HITL Interaction Zone)

  * **动态渲染**: 根据 `node.hitl_mode` 动态渲染 `SCAPanel`, `AVLPanel` 或 `VARLPanel`。
  * **`SCAPanel`**: 使用 `Tabs` 和 `RadioGroup`/`Checkbox` 实现方案选择。
  * **`AVLPanel`**: 使用列表展示批判意见，使用 React Hook Form 管理裁决状态（Accept/Reject）。


</architecture>



---

<task>


### 任务 22：版本控制：人工编辑实现（Intervention）

**目标：** 实现中间结果的人工编辑功能，允许用户直接修改节点输出并创建新版本。

**核心关注点：** View-to-Edit 模式切换、编辑器集成（Tiptap/Monaco）、新版本创建流程、状态同步。

**实现策略（参考 `<design_doc> 3.1.1.D`, `<api> 5.4.1`）：**

1.  **View-to-Edit 模式切换：**
    *   在 `WorkspaceHeader` 中实现 [Manual Edit] 按钮。调用 `UIInteractionSlice.startEditing()`。
    *   **关键实现：** 在 `OutputBlock` (B2.3) 中实现模式切换，将 `MarkdownRenderer` 替换为任务 15 实现的 `RichTextEditor` 或任务 14 实现的 `CodeEditor`（进入编辑模式）。
    *   加载当前版本内容到编辑器中。
    *   更新 `WorkspaceHeader` 工具栏为 [Cancel Edit] 和 [Save New Version]。
2.  **保存新版本流程：**
    *   点击 [Save New Version] 后，弹出模态框输入“版本摘要 (Summary)”。
    *   实现 `WorkflowSlice.manualEdit` Action，调用 API（`<api> 5.4.1`）。
3.  **状态更新与限制：**
    *   保存成功后，退出编辑模式。等待 WebSocket 事件（`NODE_ACTIVE_VERSION_CHANGED`）触发同步。
    *   **限制：** 确保 `Generator` 类型节点的编辑功能被禁用。

**输入：** 任务 14, 15, 16 的输出（专业组件、Workspace）, `<api> 5.4.1`, `<design_doc> 3.1.1.D`。
**输出：** 功能完整的人工编辑流程。


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

