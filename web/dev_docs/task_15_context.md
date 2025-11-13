<design_doc>
--- (16-17 lines) ---
*   **技术栈:** 精通 Python (Pandas, NumPy, SciPy), MATLAB, R；熟练使用 Jupyter Notebooks 进行探索；使用 LaTeX 撰写专业论文；使用 Git 进行版本控制。
*   **核心特质:** 高度目标导向、分析性强、追求极致效率、控制欲强、对结果的精确性和可解释性有极高要求。


--- (214-215 lines) ---
    *   字体选择必须保证在复杂数据、图表和代码展示中的极致清晰度和易读性。采用现代、简洁的字体（如 Geist 或 Inter）和高质量的等宽字体（如 Geist Mono 或 Fira Code）。
    *   复杂数据和公式 (LaTeX) 的渲染必须清晰、美观。


--- (409-409 lines) ---
      * **Block 3: Generated Output:** 核心内容展示区（Markdown, LaTeX, 图表）。


--- (422-422 lines) ---
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



--- (554-559 lines) ---
1.  **专业文档与公式渲染 (Professional Markdown/LaTeX Renderer):**

      * **应用场景：** `Generated Output` 的展示（非编辑状态）。
      * **实现：** 基于 `react-markdown`，集成 `remark-gfm`, `remark-math`, `rehype-katex`。
      * **要求：** 使用 `@tailwindcss/typography` (`prose` class) 进行专业排版，但需定制样式以支持高密度显示（例如，减小行高和边距）。确保 KaTeX 公式渲染清晰、准确。



--- (597-606 lines) ---
#### D. 人工编辑与模式切换 (Manual Editing and Mode Switching)

支持用户直接干预结果（FRS 4）。

  * **模式：View-to-Edit Transition**
      * **触发：** 用户在 `Completed` 节点点击 [Manual Edit]。
      * **切换：** Center Workspace 的 `Generated Output` 区块原位切换为编辑器。根据内容类型选择 `Novel/Tiptap`（富文本/Markdown）或 `Monaco Editor`（代码）。
      * **控制：** Workspace 工具栏按钮变更为 [Cancel Edit] 和 [Save New Version]。
      * **保存：** 点击 [Save New Version] 后，弹出模态框要求输入“版本摘要 (Summary)”。保存成功后，UI 切换回 Review Mode，显示新版本。



--- (781-781 lines) ---
|   |   |-- [Markdown/LaTeX Renderer OR Editor]


--- (1028-1040 lines) ---
#### 4.1.2 字体系统与排版规则 (Typography System and Rules)

##### A. 设计哲学 (Philosophy)

排版的目标是在高信息密度下实现极致的清晰度和完美的秩序感。

##### B. 字体选择与加载 (Font Selection and Loading)

我们选择 **Geist** 字体家族（由 Vercel 设计）。它简洁、现代且具有极高的可读性。

1.  **主界面字体 (UI Font):** `Geist Sans`
2.  **等宽字体 (Monospaced Font):** `Geist Mono`（用于代码编辑器、日志查看器）。



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



--- (1408-1413 lines) ---
##### 4\. 富文本/Markdown 编辑器 (Rich Text/Markdown Editor)

  * **实现：** 基于 `Novel` (Tiptap)。
  * **视觉属性：** 编辑器 UI（工具栏、浮动菜单）必须深度定制，以匹配全局组件风格。内容排版遵循 `prose` 规范（4.1.2.D）。
  * **功能：** 支持 GFM、LaTeX 公式编辑和实时预览 (KaTeX)。



--- (1546-1550 lines) ---
  * **Block 3: Generated Output:**

      * **View Mode:** 使用 `react-markdown`。应用 `prose dark:prose-invert` 类（遵循 4.1.2.D 定制样式）。
      * **Edit Mode:** 切换为 `Novel/Tiptap`（富文本）或 `Monaco Editor`（代码）。



--- (1734-1734 lines) ---
  * **专业组件:** Monaco Editor, Novel/Tiptap, `react-resizable-panels`.


--- (1757-1757 lines) ---
  * **富文本:** 使用 `@tailwindcss/typography` (`prose dark:prose-invert`)，应用定制化样式提高密度（4.1.2.D）。


--- (1783-1783 lines) ---
      * **Rich Text Editor (Novel/Tiptap):** 实现规范见 5.1.3.B2 (Block 3)。

</design_doc>

<api>
--- (846-867 lines) ---
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

***


--- (1233-1338 lines) ---
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


--- (1470-1521 lines) ---
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

</api>

<front_stack>
--- (37-37 lines) ---
| **`@tailwindcss/typography`** | Tailwind CSS 的官方插件 (`prose` 类)，用于美化由 Markdown 或富文本编辑器生成的文本块样式。 |


--- (60-61 lines) ---
| **cmdk** | 用于构建命令面板（Command Palette）的组件，在富文本编辑器中用于实现斜杠命令。 |
| **Tippy.js** | 用于在富文本编辑器中创建 `@mention` 功能的浮动提示框 (Tooltip/Popover)。 |


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


--- (142-142 lines) ---
| **`InputBox`** | 一个功能完备的聊天输入框组件。它封装了：<br>- **富文本输入**: 基于 Tiptap/Novel，支持 `@mention` 等功能。<br>- **异步操作**: 内置“增强提示” (`Enhance Prompt`) 功能，包含加载和动画状态。<br>- **状态同步**: 通过 `useRef` 和 `useImperativeHandle` 暴露 `submit`, `setContent` 等方法，供父组件调用。<br>- **动态 UI**: 使用 `AnimatePresence` 展示用户反馈提示，并带有精美的动画效果。 |


--- (169-169 lines) ---
| **Markdown 预处理** | `core/utils/markdown.ts` 提供了一系列用于清理和规范化 Markdown 文本的函数，特别是 `normalizeMathForEditor` 和 `unescapeLatexInMath`，它们解决了在富文本编辑器中正确处理 LaTeX 数学公式的痛点。 |


--- (219-228 lines) ---
### 十vii、 高级编辑器 (Tiptap/Novel) 定制

项目对 Novel 编辑器进行了深度定制，这些定制方案可以直接复用。

| 定制/模式 | 描述与复用价值 |
| :--- | :--- |
| **自定义 Markdown 序列化器** | `components/editor/math-serializer.ts` 文件展示了如何扩展 Tiptap 的现有插件。通过 `.extend()` 方法为 `Mathematics` 插件添加了自定义的 `markdown.serialize` 逻辑，确保数学公式能够被正确地转换回 `$...$` 和 `$$...$$` 格式的 Markdown。这是扩展 Tiptap 功能的核心模式。 |
| **斜杠命令 (Slash Command) 实现** | `components/editor/slash-command.tsx` 提供了一个完整的斜杠命令实现范例。它定义了一个 `suggestionItems` 数组，每个对象包含命令的标题、图标和执行逻辑，然后通过 `Command.configure` 集成到编辑器中。这套代码几乎可以原封不动地移植到任何 Tiptap 项目中。 |
| **异步 `@mention` 建议系统** | `components/deer-flow/resource-suggestion.tsx` 是一个非常高级的模式。它配置了 Tiptap 的 `Mention` 插件，使其 `items` 属性成为一个异步函数，该函数通过 `fetch` 动态查询 RAG 资源。同时，它使用 `ReactRenderer` 和 `Tippy.js` 来渲染自定义的浮动建议列表 (`ResourceMentions` 组件)。这为实现任何需要异步数据源的编辑器建议功能提供了完美的蓝图。 |



--- (260-260 lines) ---
| **直接导入 Markdown 内容** | 项目配置了 Webpack (或 Turbopack) 加载器，允许直接 `import` `.md` 文件作为字符串。如 `app/settings/tabs/about-tab.tsx` 中 `import aboutEn from "./about-en.md";`。配合 `typings/md.d.ts` 中的类型声明，这为处理静态文本内容（如“关于”页面、文档）提供了极为便捷和类型安全的方式。 |


--- (269-269 lines) ---
| **安全性** | **防范 XSS 攻击**: 渲染用户生成或来自 API 的内容时，项目始终使用 `react-markdown` (`Markdown` 组件) 或通过 Tiptap 的安全机制进行渲染，而不是直接使用 `dangerouslySetInnerHTML`。<br>**安全处理用户输入**: `components/editor/index.tsx` 中的富文本编辑器在处理粘贴内容时，通过 `handleImagePaste` 和 `transformPastedHTML` 等逻辑对输入进行过滤和转换，防止粘贴恶意的 HTML 代码。<br>**安全的外部链接**: 在所有 `target="_blank"` 的链接中，都添加了 `rel="noopener noreferrer"`，防止了潜在的 "tabnabbing" 漏洞。 |

</front_stack>

<deer_flow_frontend_code>
--- (730-768 lines) ---
         - katex.ts

### core/markdown/katex.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { Options as RehypeKatexOptions } from "rehype-katex";

import "katex/contrib/mhchem";

const macros = {
  "\\vect": "\\mathbf{#1}",
  "\\mat": "\\mathbf{#1}",
  "\\grad": "\\nabla #1",
  "\\div": "\\nabla \\cdot #1",
  "\\curl": "\\nabla \\times #1",
  "\\dv": "\\frac{d #1}{d #2}",
  "\\pdv": "\\frac{\\partial #1}{\\partial #2}",
  "\\pdvN": "\\frac{\\partial^{#3} #1}{\\partial #2^{#3}}",
  "\\abs": "\\left|#1\\right|",
  "\\norm": "\\left\\lVert#1\\right\\rVert",
  "\\set": "\\left\\{#1\\right\\}",
  "\\bra": "\\left\\langle#1\\right|",
  "\\ket": "\\left|#1\\right\\rangle",
  "\\braket": "\\left\\langle#1\\middle|#2\\right\\rangle",
  "\\matrix": "\\begin{pmatrix}#1\\end{pmatrix}",
} as const;

export const katexOptions: RehypeKatexOptions = {
  macros,
  strict: "ignore",
  trust: (context) => context.command === "\\htmlClass" || context.command === "\\href",
};

export type KatexMacroKey = keyof typeof macros;

```


--- (885-1060 lines) ---
### core/utils/markdown.ts Content:

```ts
export function autoFixMarkdown(markdown: string): string {
  return autoCloseTrailingLink(markdown);
}

/**
 * Unescape markdown-escaped characters within math delimiters
 * tiptap-markdown escapes special characters like *, _, [, ] which corrupts math formulas
 * This function restores the original LaTeX by unescaping within $...$ and $$...$$
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
 * Reverse markdown escaping for special characters
 * Order matters: process \\ last to avoid re-escaping
 */
function unescapeMarkdownSpecialChars(text: string): string {
  return text
    .replace(/\\\*/g, '*')      // \* → *
    .replace(/\\_/g, '_')       // \_ → _
    .replace(/\\\[/g, '[')      // \[ → [
    .replace(/\\\]/g, ']')      // \] → ]
    .replace(/\\\{/g, '{')      // \{ → {
    .replace(/\\\}/g, '}')      // \} → }
    .replace(/\\\\/g, '\\');    // \\ → \
}

/**
 * Normalize math delimiters for editor consumption
 * Converts display delimiters (\[...\], \\[...\\]) to $$ format
 * Converts inline delimiters (\(...\), \\(...\\)) to $ format
 * This ensures consistent format before loading into Tiptap editor
 */
export function normalizeMathForEditor(markdown: string): string {
  let normalized = markdown;
  
  // Convert display math - handle double backslash first to avoid conflicts
  normalized = normalized
    .replace(/\\\\\[([^\]]*)\\\\\]/g, (_match, content) => `$$${content}$$`)  // \\[...\\] → $$...$$
    .replace(/\\\[([^\]]*)\\\]/g, (_match, content) => `$$${content}$$`);  // \[...\] → $$...$$
  
  // Convert inline math - handle double backslash first to avoid conflicts
  normalized = normalized
    .replace(/\\\\\(([^)]*)\\\\\)/g, (_match, content) => `$${content}$`)  // \\(...\\) → $...$
    .replace(/\\\(([^)]*)\\\)/g, (_match, content) => `$${content}$`);    // \(...\) → $...$
  
  // Replace double backslashes with single in math contexts
  // For inline math: $...$
  normalized = normalized.replace(
    /\$([^\$]+?)\$/g,
    (match, mathContent) => {
      return `$${mathContent.replace(/\\\\/g, '\\')}$`;
    }
  );
  
  // For display math: $$...$$
  normalized = normalized.replace(
    /\$\$([\s\S]+?)\$\$/g,
    (match, mathContent) => {
      return `$$${mathContent.replace(/\\\\/g, '\\')}$$`;
    }
  );

  return normalized;
}

/**
 * Normalize math delimiters for display consumption
 * Ensures all math delimiters are in $$ format for remarkMath/rehypeKatex
 * This is used by the Markdown display component
 */
export function normalizeMathForDisplay(markdown: string): string {
  let normalized = markdown;
  
  // Convert all LaTeX-style delimiters to $$
  // Both display and inline math use $$ for display component (remarkMath handles both)
  // Handle double backslash first to avoid conflicts
  normalized = normalized
    .replace(/\\\\\[([^\]]*)\\\\\]/g, (_match, content) => `$$${content}$$`)  // \\[...\\] → $$...$$
    .replace(/\\\[([^\]]*)\\\]/g, (_match, content) => `$$${content}$$`)      // \[...\] → $$...$$
    .replace(/\\\\\(([^)]*)\\\\\)/g, (_match, content) => `$$${content}$$`)   // \\(...\\) → $$...$$
    .replace(/\\\(([^)]*)\\\)/g, (_match, content) => `$$${content}$$`);       // \(...\) → $$...$$
  
  // Replace double backslashes with single in math contexts
  // For inline math: $...$
  normalized = normalized.replace(
    /\$([^\$]+?)\$/g,
    (match, mathContent) => {
      return `$${mathContent.replace(/\\\\/g, '\\')}$`;
    }
  );
  
  // For display math: $$...$$
  normalized = normalized.replace(
    /\$\$([\s\S]+?)\$\$/g,
    (match, mathContent) => {
      return `$$${mathContent.replace(/\\\\/g, '\\')}$$`;
    }
  );
    
  return normalized;
}

function autoCloseTrailingLink(markdown: string): string {
  // Fix unclosed Markdown links or images
  let fixedMarkdown: string = markdown;

  // Fix unclosed image syntax ![...](...)
  fixedMarkdown = fixedMarkdown.replace(
    /!\[([^\]]*)\]\(([^)]*)$/g,
    (match: string, altText: string, url: string): string => {
      return `![${altText}](${url})`;
    },
  );

  // Fix unclosed link syntax [...](...)
  fixedMarkdown = fixedMarkdown.replace(
    /\[([^\]]*)\]\(([^)]*)$/g,
    (match: string, linkText: string, url: string): string => {
      return `[${linkText}](${url})`;
    },
  );

  // Fix unclosed image syntax ![...]
  fixedMarkdown = fixedMarkdown.replace(
    /!\[([^\]]*)$/g,
    (match: string, altText: string): string => {
      return `![${altText}]`;
    },
  );

  // Fix unclosed link syntax [...]
  fixedMarkdown = fixedMarkdown.replace(
    /\[([^\]]*)$/g,
    (match: string, linkText: string): string => {
      return `[${linkText}]`;
    },
  );

  // Fix unclosed images or links missing ")"
  fixedMarkdown = fixedMarkdown.replace(
    /!\[([^\]]*)\]\(([^)]*)$/g,
    (match: string, altText: string, url: string): string => {
      return `![${altText}](${url})`;
    },
  );

  fixedMarkdown = fixedMarkdown.replace(
    /\[([^\]]*)\]\(([^)]*)$/g,
    (match: string, linkText: string, url: string): string => {
      return `[${linkText}](${url})`;
    },
  );

  return fixedMarkdown;
}

```


--- (1663-1674 lines) ---
         - index.ts
         - rehype-split-words-into-spans.ts

### core/rehype/index.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export * from "./rehype-split-words-into-spans";

```


--- (1676-1723 lines) ---
### core/rehype/rehype-split-words-into-spans.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { Element, Root, ElementContent } from "hast";
import { visit } from "unist-util-visit";
import type { BuildVisitor } from "unist-util-visit";

export function rehypeSplitWordsIntoSpans() {
  return (tree: Root) => {
    visit(tree, "element", ((node: Element) => {
      if (
        ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "strong"].includes(
          node.tagName,
        ) &&
        node.children
      ) {
        const newChildren: Array<ElementContent> = [];
        node.children.forEach((child) => {
          if (child.type === "text") {
            const segmenter = new Intl.Segmenter("zh", { granularity: "word" });
            const segments = segmenter.segment(child.value);
            const words = Array.from(segments)
              .map((segment) => segment.segment)
              .filter(Boolean);
            words.forEach((word: string) => {
              newChildren.push({
                type: "element",
                tagName: "span",
                properties: {
                  className: "animate-fade-in",
                },
                children: [{ type: "text", value: word }],
              });
            });
          } else {
            newChildren.push(child);
          }
        });
        node.children = newChildren;
      }
    }) as BuildVisitor<Root, "element">);
  };
}

```


--- (9264-9273 lines) ---
     - md.d.ts

### typings/md.d.ts Content:

```ts
declare module "*.md" {
  const content: string;
  export default content;
}



--- (9280-9599 lines) ---
### styles/prosemirror.css Content:

```css
.prose {
  max-width: inherit;
}

.prose.inline-editor * {
  margin: 0;
}

.prose.inline-editor .is-empty {
  display: none;
}

.prose.inline-editor .is-empty.placeholder {
  display: block;
  opacity: 0.65;
  font-size: 14px;
}

.ProseMirror {
  line-height: 1.75;
}

.ProseMirror .is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  height: 0;
}

.ProseMirror p.is-empty::before {
  content: attr(data-placeholder);
  float: left;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  height: 0;
}

.ProseMirror .mention {
  background-color: var(--purple-light);
  border-radius: 0.4rem;
  box-decoration-break: clone;
  color: var(--brand);
  padding: 0.1rem 0.3rem;
}

/* Custom image styles */

.ProseMirror img {
  transition: filter 0.1s ease-in-out;

  &:hover {
    cursor: pointer;
    filter: brightness(90%);
  }

  &.ProseMirror-selectednode {
    outline: 3px solid #5abbf7;
    filter: brightness(90%);
  }
}

.img-placeholder {
  position: relative;

  &:before {
    content: "";
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid var(--novel-stone-200);
    border-top-color: var(--novel-stone-800);
    animation: spinning 0.6s linear infinite;
  }
}

.ProseMirror pre {
  background: #0d0d0d;
  border-radius: 0.5rem;
  color: #fff;
  font-family: "JetBrainsMono", monospace;
  padding: 0.75rem 1rem;

  code {
    background: none;
    color: inherit;
    font-size: 0.8rem;
    padding: 0;
  }

  .hljs-comment,
  .hljs-quote {
    color: #616161;
  }

  .hljs-variable,
  .hljs-template-variable,
  .hljs-attribute,
  .hljs-tag,
  .hljs-name,
  .hljs-regexp,
  .hljs-link,
  .hljs-name,
  .hljs-selector-id,
  .hljs-selector-class {
    color: #f98181;
  }

  .hljs-number,
  .hljs-meta,
  .hljs-built_in,
  .hljs-builtin-name,
  .hljs-literal,
  .hljs-type,
  .hljs-params {
    color: #fbbc88;
  }

  .hljs-string,
  .hljs-symbol,
  .hljs-bullet {
    color: #b9f18d;
  }

  .hljs-title,
  .hljs-section {
    color: #faf594;
  }

  .hljs-keyword,
  .hljs-selector-tag {
    color: #70cff8;
  }

  .hljs-emphasis {
    font-style: italic;
  }

  .hljs-strong {
    font-weight: 700;
  }
}

@keyframes spinning {
  to {
    transform: rotate(360deg);
  }
}

/* Custom TODO list checkboxes – shoutout to this awesome tutorial: https://moderncss.dev/pure-css-custom-checkbox-style/ */

ul[data-type="taskList"] li > label {
  margin-right: 0.2rem;
  user-select: none;
}

@media screen and (max-width: 768px) {
  ul[data-type="taskList"] li > label {
    margin-right: 0.5rem;
  }
}

ul[data-type="taskList"] li > label input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: hsl(var(--background));
  margin: 0;
  cursor: pointer;
  width: 1.2em;
  height: 1.2em;
  position: relative;
  top: 5px;
  border: 2px solid hsl(var(--border));
  margin-right: 0.3rem;
  display: grid;
  place-content: center;

  &:hover {
    background-color: hsl(var(--accent));
  }

  &:active {
    background-color: hsl(var(--accent));
  }

  &::before {
    content: "";
    width: 0.65em;
    height: 0.65em;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em;
    transform-origin: center;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  }

  &:checked::before {
    transform: scale(1);
  }
}

ul[data-type="taskList"] li[data-checked="true"] > div > p {
  color: var(--muted-foreground);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

/* Overwrite tippy-box original max-width */

.tippy-box {
  max-width: 400px !important;
}

.ProseMirror:not(.dragging) .ProseMirror-selectednode {
  outline: none !important;
  background-color: var(--novel-highlight-blue);
  transition: background-color 0.2s;
  box-shadow: none;
}

.drag-handle {
  position: fixed;
  opacity: 1;
  transition: opacity ease-in 0.2s;
  border-radius: 0.25rem;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(0, 0, 0, 0.5)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: calc(0.5em + 0.375rem) calc(0.5em + 0.375rem);
  background-repeat: no-repeat;
  background-position: center;
  width: 1.2rem;
  height: 1.5rem;
  z-index: 50;
  cursor: grab;

  &:hover {
    background-color: var(--novel-stone-100);
    transition: background-color 0.2s;
  }

  &:active {
    background-color: var(--novel-stone-200);
    transition: background-color 0.2s;
    cursor: grabbing;
  }

  &.hide {
    opacity: 0;
    pointer-events: none;
  }

  @media screen and (max-width: 600px) {
    display: none;
    pointer-events: none;
  }
}

.dark .drag-handle {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(255, 255, 255, 0.5)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
}

/* Custom Youtube Video CSS */
iframe {
  border: 8px solid #ffd00027;
  border-radius: 4px;
  min-width: 200px;
  min-height: 200px;
  display: block;
  outline: 0px solid transparent;
}

div[data-youtube-video] > iframe {
  cursor: move;
  aspect-ratio: 16 / 9;
  width: 100%;
}

.ProseMirror-selectednode iframe {
  transition: outline 0.15s;
  outline: 6px solid #fbbf24;
}

@media only screen and (max-width: 480px) {
  div[data-youtube-video] > iframe {
    max-height: 50px;
  }
}

@media only screen and (max-width: 720px) {
  div[data-youtube-video] > iframe {
    max-height: 100px;
  }
}

/* CSS for bold coloring and highlighting issue*/
span[style] > strong {
  color: inherit;
}

mark[style] > strong {
  color: inherit;
}

.prose ol, .prose ul {
  margin-left: 1.2em;
  color: #b0b0b0;
  font-size: 0.98em;
}
.prose ol > li::marker, .prose ul > li::marker {
  color: #b0b0b0;
}

```


--- (9601-9722 lines) ---
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



--- (12267-12436 lines) ---
### components/deer-flow/markdown.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown, {
  type Options as ReactMarkdownOptions,
} from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

import { Button } from "~/components/ui/button";
import { rehypeSplitWordsIntoSpans } from "~/core/rehype";
import { katexOptions } from "~/core/markdown/katex";
import { autoFixMarkdown, normalizeMathForDisplay } from "~/core/utils/markdown";
import { cn } from "~/lib/utils";

import Image from "./image";
import { Tooltip } from "./tooltip";

export function Markdown({
  className,
  children,
  style,
  enableCopy,
  animated = false,
  checkLinkCredibility = false,
  ...props
}: ReactMarkdownOptions & {
  className?: string;
  enableCopy?: boolean;
  style?: React.CSSProperties;
  animated?: boolean;
  checkLinkCredibility?: boolean;
}) {
  const components: ReactMarkdownOptions["components"] = useMemo(() => {
    return {
      a: ({ href, children }) => {
        const rel = checkLinkCredibility
          ? "noopener noreferrer nofollow"
          : "noopener noreferrer";
        const link = (href as string | undefined) ?? "#";
        return (
          <a href={link} target="_blank" rel={rel}>
            {children}
          </a>
        );
      },
      img: ({ src, alt }) => (
        <a href={src as string} target="_blank" rel="noopener noreferrer">
          <Image className="rounded" src={src as string} alt={alt ?? ""} />
        </a>
      ),
    };
  }, [checkLinkCredibility]);

  const rehypePlugins = useMemo<NonNullable<ReactMarkdownOptions["rehypePlugins"]>>(() => {
    const plugins: NonNullable<ReactMarkdownOptions["rehypePlugins"]> = [[
      rehypeKatex,
      katexOptions,
    ]];
    if (animated) {
      plugins.push(rehypeSplitWordsIntoSpans);
    }
    return plugins;
  }, [animated]);
  return (
    <div className={cn(className, "prose dark:prose-invert")} style={style}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={rehypePlugins}
        components={components}
        {...props}
      >
        {autoFixMarkdown(
          dropMarkdownQuote(normalizeMathForDisplay(children ?? "")) ?? "",
        )}
      </ReactMarkdown>
      {enableCopy && typeof children === "string" && (
        <div className="flex">
          <CopyButton content={children} />
        </div>
      )}
    </div>
  );
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip title="Copy">
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 1000);
          } catch (error) {
            console.error(error);
          }
        }}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}{" "}
      </Button>
    </Tooltip>
  );
}



function dropMarkdownQuote(markdown?: string | null): string | null {
  if (!markdown) return null;

  const patternsToRemove = [
    { prefix: "```markdown\n", suffix: "\n```", prefixLen: 12 },
    { prefix: "```text\n", suffix: "\n```", prefixLen: 8 },
    { prefix: "```\n", suffix: "\n```", prefixLen: 4 },
  ];

  let result = markdown;
  
  for (const { prefix, suffix, prefixLen } of patternsToRemove) {
    if (result.startsWith(prefix) && !result.endsWith(suffix)) {
      result = result.slice(prefixLen);
      break;  // remove prefix without suffix only once
    }
  }
  
  let changed = true;

  while (changed) {
    changed = false;
    
    for (const { prefix, suffix, prefixLen } of patternsToRemove) {
      let startIndex = 0;
      while ((startIndex = result.indexOf(prefix, startIndex)) !== -1) {
        const endIndex = result.indexOf(suffix, startIndex + prefixLen);
        if (endIndex !== -1) {
          // only remove fully matched code blocks
          const before = result.slice(0, startIndex);
          const content = result.slice(startIndex + prefixLen, endIndex);
          const after = result.slice(endIndex + suffix.length);
          result = before + content + after;
          changed = true;
          startIndex = before.length + content.length;
        } else {
          startIndex += prefixLen;
        }
      }
    }
  }
  
  return result;
}

```


--- (15238-15401 lines) ---
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


--- (15403-15441 lines) ---
### components/editor/math-serializer.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Mathematics } from "novel";

/**
 * Extended Mathematics extension with markdown serialization support
 * Handles both inline math ($...$) and block/display math ($$...$$)
 */
export const MathematicsWithMarkdown = Mathematics.extend({
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const latex = node.attrs?.latex || "";
          const isBlock = node.attrs?.display === true;
          
          if (isBlock) {
            // Block/display math: $$...$$
            state.write("$$");
            state.write(latex);
            state.write("$$");
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

```


--- (15443-15512 lines) ---
### components/editor/image-upload.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { createImageUpload } from "novel";
import { toast } from "sonner";

const onUpload = (file: File) => {
  const promise = fetch("/api/upload", {
    method: "POST",
    headers: {
      "content-type": file?.type || "application/octet-stream",
      "x-vercel-filename": file?.name || "image.png",
    },
    body: file,
  });

  return new Promise((resolve, reject) => {
    toast.promise(
      promise.then(async (res) => {
        // Successfully uploaded image
        if (res.status === 200) {
          const { url } = (await res.json()) as { url: string };
          // preload the image
          const image = new Image();
          image.src = url;
          image.onload = () => {
            resolve(url);
          };
          // No blob store configured
        } else if (res.status === 401) {
          resolve(file);
          throw new Error(
            "`BLOB_READ_WRITE_TOKEN` environment variable not found, reading image locally instead.",
          );
          // Unknown error
        } else {
          throw new Error("Error uploading image. Please try again.");
        }
      }),
      {
        loading: "Uploading image...",
        success: "Image uploaded successfully.",
        error: (e) => {
          reject(e);
          return e.message;
        },
      },
    );
  });
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported.");
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error("File size too big (max 20MB).");
      return false;
    }
    return true;
  },
});

```


--- (15514-15726 lines) ---
### components/editor/slash-command.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  TextQuote,
} from "lucide-react";
import { Command, createSuggestionItems, renderItems } from "novel";
// import { uploadFn } from "./image-upload";

export const suggestionItems = createSuggestionItems([
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  // {
  //   title: "Image",
  //   description: "Upload an image from your computer.",
  //   searchTerms: ["photo", "picture", "media"],
  //   icon: <ImageIcon size={18} />,
  //   command: ({ editor, range }) => {
  //     editor.chain().focus().deleteRange(range).run();
  //     // upload image
  //     const input = document.createElement("input");
  //     input.type = "file";
  //     input.accept = "image/*";
  //     input.onchange = async () => {
  //       if (input.files?.length) {
  //         const file = input.files[0];
  //         if (!file) return;
  //         const pos = editor.view.state.selection.from;
  //         uploadFn(file, editor.view, pos);
  //       }
  //     };
  //     input.click();
  //   },
  // },
  // {
  //   title: "Youtube",
  //   description: "Embed a Youtube video.",
  //   searchTerms: ["video", "youtube", "embed"],
  //   icon: <Youtube size={18} />,
  //   command: ({ editor, range }) => {
  //     const videoLink = prompt("Please enter Youtube Video Link");
  //     //From https://regexr.com/3dj5t
  //     const ytRegex = new RegExp(
  //       /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
  //     );

  //     if (videoLink && ytRegex.test(videoLink)) {
  //       editor
  //         .chain()
  //         .focus()
  //         .deleteRange(range)
  //         .setYoutubeVideo({
  //           src: videoLink,
  //         })
  //         .run();
  //     } else {
  //       if (videoLink !== null) {
  //         alert("Please enter a correct Youtube Video Link");
  //       }
  //     }
  //   },
  // },
  // {
  //   title: "Twitter",
  //   description: "Embed a Tweet.",
  //   searchTerms: ["twitter", "embed"],
  //   icon: <Twitter size={18} />,
  //   command: ({ editor, range }) => {
  //     const tweetLink = prompt("Please enter Twitter Link");
  //     const tweetRegex = new RegExp(
  //       /^https?:\/\/(www\.)?x\.com\/([a-zA-Z0-9_]{1,15})(\/status\/(\d+))?(\/\S*)?$/,
  //     );

  //     if (tweetLink && tweetRegex.test(tweetLink)) {
  //       editor
  //         .chain()
  //         .focus()
  //         .deleteRange(range)
  //         .setTweet({
  //           src: tweetLink,
  //         })
  //         .run();
  //     } else {
  //       if (tweetLink !== null) {
  //         alert("Please enter a correct Twitter Link");
  //       }
  //     }
  //   },
  // },
]);

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});

```


--- (15728-15921 lines) ---
### components/editor/extensions.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  AIHighlight,
  CharacterCount,
  CodeBlockLowlight,
  Color,
  CustomKeymap,
  GlobalDragHandle,
  HighlightExtension,
  HorizontalRule,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TextStyle,
  TiptapImage,
  TiptapLink,
  TiptapUnderline,
  Twitter,
  UpdatedImage,
  UploadImagesPlugin,
  Youtube,
} from "novel";
import { Markdown } from "tiptap-markdown";
import { Table } from "@tiptap/extension-table";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { cx } from "class-variance-authority";
import { common, createLowlight } from "lowlight";
import { MathematicsWithMarkdown } from "./math-serializer";

//TODO I am using cx here to get tailwind autocomplete working, idk if someone else can write a regex to just capture the class key in objects
const aiHighlight = AIHighlight;
//You can overwrite the placeholder with your own configuration
const placeholder = Placeholder;
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});

const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
      }),
    ];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
});

const updatedImage = UpdatedImage.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2 "),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex gap-2 items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {},
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {},
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {},
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary"),
    },
  },
  codeBlock: false,
  code: {
    HTMLAttributes: {
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

const codeBlockLowlight = CodeBlockLowlight.configure({
  // configure lowlight: common /  all / use highlightJS in case there is a need to specify certain language grammars only
  // common: covers 37 language grammars which should be good enough in most cases
  lowlight: createLowlight(common),
});

const youtube = Youtube.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
  inline: false,
});

const twitter = Twitter.configure({
  HTMLAttributes: {
    class: cx("not-prose"),
  },
  inline: false,
});

const mathematics = MathematicsWithMarkdown.configure({
  HTMLAttributes: {
    class: cx("text-foreground rounded p-1 hover:bg-accent cursor-pointer"),
  },
  katexOptions: {
    throwOnError: false,
  },
});

const characterCount = CharacterCount.configure();

const table = Table.configure();
const tableRow = TableRow.configure();
const tableCell = TableCell.configure();
const tableHeader = TableHeader.configure();

const markdownExtension = Markdown.configure({
  html: true,
  tightLists: true,
  tightListClass: "tight",
  bulletListMarker: "-",
  linkify: false,
  breaks: false,
  transformPastedText: false,
  transformCopiedText: false,
});

const globalDragHandle = GlobalDragHandle.configure({});

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  updatedImage,
  taskList,
  taskItem,
  table,
  tableRow,
  tableCell,
  tableHeader,
  horizontalRule,
  aiHighlight,
  codeBlockLowlight,
  youtube,
  twitter,
  mathematics,
  characterCount,
  TiptapUnderline,
  markdownExtension,
  HighlightExtension,
  TextStyle,
  Color,
  CustomKeymap,
  globalDragHandle,
];

```


--- (15929-16002 lines) ---
### components/editor/generative/ai-completion-command.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { CommandGroup, CommandItem, CommandSeparator } from "../../ui/command";
import { useEditor } from "novel";
import { Check, TextQuote, TrashIcon } from "lucide-react";

const AICompletionCommands = ({
  completion,
  onDiscard,
}: {
  completion: string;
  onDiscard: () => void;
}) => {
  const { editor } = useEditor();
  if (!editor) return null;
  return (
    <>
      <CommandGroup>
        <CommandItem
          className="gap-2 px-4"
          value="replace"
          onSelect={() => {
            const selection = editor.view.state.selection;
            editor
              .chain()
              .focus()
              .insertContentAt(
                {
                  from: selection.from,
                  to: selection.to,
                },
                completion,
              )
              .run();
          }}
        >
          <Check className="text-muted-foreground h-4 w-4" />
          Replace selection
        </CommandItem>
        <CommandItem
          className="gap-2 px-4"
          value="insert"
          onSelect={() => {
            const selection = editor.view.state.selection;
            editor
              .chain()
              .focus()
              .insertContentAt(selection.to + 1, completion)
              .run();
          }}
        >
          <TextQuote className="text-muted-foreground h-4 w-4" />
          Insert below
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />

      <CommandGroup>
        <CommandItem onSelect={onDiscard} value="thrash" className="gap-2 px-4">
          <TrashIcon className="text-muted-foreground h-4 w-4" />
          Discard
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AICompletionCommands;

```


--- (16004-16065 lines) ---
### components/editor/generative/generative-menu-switch.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { EditorBubble, removeAIHighlight, useEditor } from "novel";
import { Fragment, type ReactNode, useEffect } from "react";
import { Button } from "../../ui/button";
import Magic from "../../ui/icons/magic";
import { AISelector } from "./ai-selector";

interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const GenerativeMenuSwitch = ({
  children,
  open,
  onOpenChange,
}: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();
  useEffect(() => {
    if (!open && editor) removeAIHighlight(editor);
  }, [open]);

  if (!editor) return null;
  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
          editor.chain().unsetHighlight().run();
        },
      }}
      className="border-muted bg-background flex w-fit max-w-[90vw] overflow-hidden rounded-md border shadow-xl"
    >
      {open && <AISelector open={open} onOpenChange={onOpenChange} />}
      {!open && (
        <Fragment>
          <Button
            className="gap-1 rounded-none text-purple-500"
            variant="ghost"
            onClick={() => onOpenChange(true)}
            size="sm"
          >
            <Magic className="h-5 w-5" />
            Ask AI
          </Button>
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;

```



--- (16067-16266 lines) ---

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { Command, CommandInput } from "../../ui/command";

import { ArrowUp } from "lucide-react";
import { useEditor } from "novel";
import { addAIHighlight } from "novel";
import { useCallback, useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import Magic from "../../ui/icons/magic";
import { ScrollArea } from "../../ui/scroll-area";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";
import { LoadingOutlined } from "@ant-design/icons";
import { resolveServiceURL } from "~/core/api/resolve-service-url";
import { fetchStream } from "~/core/sse";
//TODO: I think it makes more sense to create a custom Tiptap extension for this functionality https://tiptap.dev/docs/editor/ai/introduction

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useProseCompletion() {
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const complete = useCallback(
    async (prompt: string, options?: { body?: Record<string, any> }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchStream(
          resolveServiceURL("/api/prose/generate"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt,
              ...options?.body,
            }),
          },
        );

        let fullText = "";

        // Process the streaming response with debounced updates
        let chunkBuffer = "";
        let updateTimer: NodeJS.Timeout | undefined;

        const scheduleUpdate = () => {
          if (updateTimer) clearTimeout(updateTimer);
          updateTimer = setTimeout(() => {
            if (chunkBuffer) {
              fullText += chunkBuffer;
              setCompletion(fullText);
              chunkBuffer = "";
            }
          }, 16); // ~60fps
        };

        for await (const chunk of response) {
          chunkBuffer += chunk.data;
          scheduleUpdate();
        }
        // Final update
        if (chunkBuffer) {
          fullText += chunkBuffer;
          setCompletion(fullText);
        }

        setIsLoading(false);
        return fullText;
      } catch (e) {
        const error = e instanceof Error ? e : new Error("An error occurred");
        setError(error);
        toast.error(error.message);
        setIsLoading(false);
        throw error;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setCompletion("");
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    completion,
    complete,
    isLoading,
    error,
    reset,
  };
}

export function AISelector({ onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");

  const { completion, complete, isLoading } = useProseCompletion();

  if (!editor) return null;

  const hasCompletion = completion.length > 0;

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose prose-sm dark:prose-invert p-2 px-4">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-purple-500">
          <Magic className="mr-2 h-4 w-4 shrink-0" />
          AI is thinking
          <div className="mt-1 ml-2">
            <LoadingOutlined />
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={
                hasCompletion
                  ? "Tell AI what to do next"
                  : "Ask AI to edit or generate..."
              }
              onFocus={() => addAIHighlight(editor)}
            />
            <Button
              size="icon"
              className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
              onClick={() => {
                if (completion)
                  return complete(completion, {
                    body: { option: "zap", command: inputValue },
                  }).then(() => setInputValue(""));

                const slice = editor.state.selection.content();
                const text = editor.storage.markdown.serializer.serialize(
                  slice.content,
                );

                complete(text, {
                  body: { option: "zap", command: inputValue },
                }).then(() => setInputValue(""));
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                editor.chain().unsetHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            <AISelectorCommands
              onSelect={(value, option) =>
                complete(value, { body: { option } })
              }
            />
          )}
        </>
      )}
    </Command>
  );
}

```



--- (16268-16356 lines) ---

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  ArrowDownWideNarrow,
  CheckCheck,
  RefreshCcwDot,
  StepForward,
  WrapText,
} from "lucide-react";
import { getPrevText, useEditor } from "novel";
import { CommandGroup, CommandItem, CommandSeparator } from "../../ui/command";

const options = [
  {
    value: "improve",
    label: "Improve writing",
    icon: RefreshCcwDot,
  },
  // TODO: add this back in
  // {
  //   value: "fix",
  //   label: "Fix grammar",
  //   icon: CheckCheck,
  // },
  {
    value: "shorter",
    label: "Make shorter",
    icon: ArrowDownWideNarrow,
  },
  {
    value: "longer",
    label: "Make longer",
    icon: WrapText,
  },
];

interface AISelectorCommandsProps {
  onSelect: (value: string, option: string) => void;
}

const AISelectorCommands = ({ onSelect }: AISelectorCommandsProps) => {
  const { editor } = useEditor();
  if (!editor) return null;
  return (
    <>
      <CommandGroup heading="Edit or review selection">
        {options.map((option) => (
          <CommandItem
            onSelect={(value) => {
              const slice = editor.state.selection.content();
              const text = editor.storage.markdown.serializer.serialize(
                slice.content,
              );
              onSelect(text, value);
            }}
            className="flex gap-2 px-4"
            key={option.value}
            value={option.value}
          >
            <option.icon className="h-4 w-4 text-purple-500" />
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Use AI to do more">
        <CommandItem
          onSelect={() => {
            const pos = editor.state.selection.from;
            const text = getPrevText(editor, pos);
            onSelect(text, "continue");
          }}
          value="continue"
          className="gap-2 px-4"
        >
          <StepForward className="h-4 w-4 text-purple-500" />
          Continue writing
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AISelectorCommands;

```


--- (16359-16476 lines) ---
             - link-selector.tsx
             - text-buttons.tsx
             - node-selector.tsx
             - math-selector.tsx
             - color-selector.tsx

### components/editor/selectors/link-selector.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Button } from "../../ui/button";
import { PopoverContent } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Check, Trash } from "lucide-react";
import { useEditor } from "novel";
import { useEffect, useRef } from "react";

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_e) {
    return false;
  }
}
export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch (_e) {
    return null;
  }
}
interface LinkSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkSelector = ({ open, onOpenChange }: LinkSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { editor } = useEditor();

  // Autofocus on input by default
  useEffect(() => {
    inputRef.current?.focus();
  });
  if (!editor) return null;

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="gap-2 rounded-none border-none"
        >
          <p className="text-base">↗</p>
          <p
            className={cn("underline decoration-stone-400 underline-offset-4", {
              "text-blue-500": editor.isActive("link"),
            })}
          >
            Link
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0" sideOffset={10}>
        <form
          onSubmit={(e) => {
            const target = e.currentTarget as HTMLFormElement;
            e.preventDefault();
            const input = target[0] as HTMLInputElement;
            const url = getUrlFromString(input.value);
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
              onOpenChange(false);
            }
          }}
          className="flex p-1"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Paste a link"
            className="bg-background flex-1 p-1 text-sm outline-none"
            defaultValue={editor.getAttributes("link").href || ""}
          />
          {editor.getAttributes("link").href ? (
            <Button
              size="icon"
              variant="outline"
              type="button"
              className="flex h-8 items-center rounded-sm p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                if (inputRef.current) inputRef.current.value = "";
                onOpenChange(false);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" className="h-8">
              <Check className="h-4 w-4" />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
};

```


--- (16478-16557 lines) ---
### components/editor/selectors/text-buttons.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";
import type { SelectorItem } from "./node-selector";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;
  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (editor) => editor.isActive("bold"),
      command: (editor) => editor.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: (editor) => editor.isActive("italic"),
      command: (editor) => editor.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: (editor) => editor.isActive("underline"),
      command: (editor) => editor.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      isActive: (editor) => editor.isActive("strike"),
      command: (editor) => editor.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: "code",
      isActive: (editor) => editor.isActive("code"),
      command: (editor) => editor.chain().focus().toggleCode().run(),
      icon: CodeIcon,
    },
  ];
  return (
    <div className="flex">
      {items.map((item) => (
        <EditorBubbleItem
          key={item.name}
          onSelect={(editor) => {
            item.command(editor);
          }}
        >
          <Button
            size="sm"
            className="rounded-none"
            variant="ghost"
            type="button"
          >
            <item.icon
              className={cn("h-4 w-4", {
                "text-blue-500": item.isActive(editor),
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};



--- (16560-16711 lines) ---
### components/editor/selectors/node-selector.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  Check,
  CheckSquare,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  type LucideIcon,
  TextIcon,
  TextQuote,
} from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";

import { Button } from "../../ui/button";
import { PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Popover } from "@radix-ui/react-popover";

export type SelectorItem = {
  name: string;
  icon: LucideIcon;
  command: (
    editor: NonNullable<ReturnType<typeof useEditor>["editor"]>,
  ) => void;
  isActive: (
    editor: NonNullable<ReturnType<typeof useEditor>["editor"]>,
  ) => boolean;
};

const items: SelectorItem[] = [
  {
    name: "Text",
    icon: TextIcon,
    command: (editor) => editor.chain().focus().clearNodes().run(),
    // I feel like there has to be a more efficient way to do this – feel free to PR if you know how!
    isActive: (editor) =>
      editor.isActive("paragraph") &&
      !editor.isActive("bulletList") &&
      !editor.isActive("orderedList"),
  },
  {
    name: "Heading 1",
    icon: Heading1,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: Heading2,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: Heading3,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    name: "To-do List",
    icon: CheckSquare,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleTaskList().run(),
    isActive: (editor) => editor.isActive("taskItem"),
  },
  {
    name: "Bullet List",
    icon: ListOrdered,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    name: "Numbered List",
    icon: ListOrdered,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    name: "Quote",
    icon: TextQuote,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
  },
  {
    name: "Code",
    icon: Code,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive("codeBlock"),
  },
];
interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
  const { editor } = useEditor();
  if (!editor) return null;
  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
    name: "Multiple",
  };

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        asChild
        className="hover:bg-accent gap-2 rounded-none border-none focus:ring-0"
      >
        <Button size="sm" variant="ghost" className="gap-2">
          <span className="text-sm whitespace-nowrap">{activeItem.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={5} align="start" className="w-48 p-1">
        {items.map((item) => (
          <EditorBubbleItem
            key={item.name}
            onSelect={(editor) => {
              item.command(editor);
              onOpenChange(false);
            }}
            className="hover:bg-accent flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm"
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-sm border p-1">
                <item.icon className="h-3 w-3" />
              </div>
              <span>{item.name}</span>
            </div>
            {activeItem.name === item.name && <Check className="h-4 w-4" />}
          </EditorBubbleItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};

```


--- (16713-16756 lines) ---
### components/editor/selectors/math-selector.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { SigmaIcon } from "lucide-react";
import { useEditor } from "novel";

export const MathSelector = () => {
  const { editor } = useEditor();

  if (!editor) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-12 rounded-none"
      onClick={(evt) => {
        if (editor.isActive("math")) {
          editor.chain().focus().unsetLatex().run();
        } else {
          const { from, to } = editor.state.selection;
          const latex = editor.state.doc.textBetween(from, to);

          if (!latex) return;

          editor.chain().focus().setLatex({ latex }).run();
        }
      }}
    >
      <SigmaIcon
        className={cn("size-4", { "text-blue-500": editor.isActive("math") })}
        strokeWidth={2.3}
      />
    </Button>
  );
};

```



--- (16758-16956 lines) ---

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Check, ChevronDown } from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";

import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
export interface BubbleColorMenuItem {
  name: string;
  color: string;
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "var(--novel-black)",
  },
  {
    name: "Purple",
    color: "#9333EA",
  },
  {
    name: "Red",
    color: "#E00000",
  },
  {
    name: "Yellow",
    color: "#EAB308",
  },
  {
    name: "Blue",
    color: "#2563EB",
  },
  {
    name: "Green",
    color: "#008A00",
  },
  {
    name: "Orange",
    color: "#FFA500",
  },
  {
    name: "Pink",
    color: "#BA4081",
  },
  {
    name: "Gray",
    color: "#A8A29E",
  },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "var(--novel-highlight-default)",
  },
  {
    name: "Purple",
    color: "var(--novel-highlight-purple)",
  },
  {
    name: "Red",
    color: "var(--novel-highlight-red)",
  },
  {
    name: "Yellow",
    color: "var(--novel-highlight-yellow)",
  },
  {
    name: "Blue",
    color: "var(--novel-highlight-blue)",
  },
  {
    name: "Green",
    color: "var(--novel-highlight-green)",
  },
  {
    name: "Orange",
    color: "var(--novel-highlight-orange)",
  },
  {
    name: "Pink",
    color: "var(--novel-highlight-pink)",
  },
  {
    name: "Gray",
    color: "var(--novel-highlight-gray)",
  },
];

interface ColorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ColorSelector = ({ open, onOpenChange }: ColorSelectorProps) => {
  const { editor } = useEditor();

  if (!editor) return null;
  const activeColorItem = TEXT_COLORS.find(({ color }) =>
    editor.isActive("textStyle", { color }),
  );

  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive("highlight", { color }),
  );

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button size="sm" className="gap-2 rounded-none" variant="ghost">
          <span
            className="rounded-sm px-1"
            style={{
              color: activeColorItem?.color,
              backgroundColor: activeHighlightItem?.color,
            }}
          >
            A
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        sideOffset={5}
        className="my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded border p-1 shadow-xl"
        align="start"
      >
        <div className="flex flex-col">
          <div className="text-muted-foreground my-1 px-2 text-sm font-semibold">
            Color
          </div>
          {TEXT_COLORS.map(({ name, color }) => (
            <EditorBubbleItem
              key={name}
              onSelect={() => {
                editor.commands.unsetColor();
                name !== "Default" &&
                  editor
                    .chain()
                    .focus()
                    .setColor(color || "")
                    .run();
                onOpenChange(false);
              }}
              className="hover:bg-accent flex cursor-pointer items-center justify-between px-2 py-1 text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border px-2 py-px font-medium"
                  style={{ color }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
            </EditorBubbleItem>
          ))}
        </div>
        <div>
          <div className="text-muted-foreground my-1 px-2 text-sm font-semibold">
            Background
          </div>
          {HIGHLIGHT_COLORS.map(({ name, color }) => (
            <EditorBubbleItem
              key={name}
              onSelect={() => {
                editor.commands.unsetHighlight();
                name !== "Default" &&
                  editor.chain().focus().setHighlight({ color }).run();
                onOpenChange(false);
              }}
              className="hover:bg-accent flex cursor-pointer items-center justify-between px-2 py-1 text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border px-2 py-px font-medium"
                  style={{ backgroundColor: color }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive("highlight", { color }) && (
                <Check className="h-4 w-4" />
              )}
            </EditorBubbleItem>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

```

</deer_flow_frontend_code>

<architecture>
--- (9-17 lines) ---
### 1.1 架构目标 (Architectural Goals)

前端架构的核心目标是支撑一个高性能、高可靠性、高可维护性的复杂单页应用 (SPA)，重点满足以下需求：

1.  **复杂状态同步与实时性**: 精确管理工作流结构、节点状态、版本信息和实时执行进度，确保数据一致性。
2.  **高信息密度与清晰度**: 实现灵活的三栏式“驾驶舱”布局，清晰展示大量复杂信息（代码、日志、公式）。
3.  **精细化控制与复杂交互**: 支持多种人机协同 (HITL) 模式和精细的用户干预（版本切换、人工编辑）。
4.  **动态性与流畅性**: 平滑处理工作流结构的动态变化，提供即时的交互反馈和高性能的动效。



--- (55-60 lines) ---
### 2.5 专业领域组件

  * **Monaco Editor**: **[关键选型]** 用于代码查看、编辑和实时日志展示。提供专业级体验。
  * **Novel (Tiptap/ProseMirror)**: 富文本/Markdown 编辑器，用于人工编辑环节。
  * **`react-markdown` + Remark/Rehype + KaTeX**: 用于渲染 Markdown 和 LaTeX 公式。



--- (118-139 lines) ---
### 3.3 `src/components` 结构 (Component Organization)

组件按复用级别分层。

```
/src/components
├── /ui/                # 基础 UI 组件 (Shadcn/ui)
├── /platform/          # 应用级共享组件
│   ├── layout/         # GlobalHeader, ResizableHandle
│   ├── data-display/   # StatusBadge, StalenessIndicator, Timestamp
│   └── feedback/       # ConfirmationDialog, Toaster
├── /editors/           # 专业编辑器封装
│   ├── MonacoWrapper.tsx
│   ├── CodeViewer.tsx (Monaco Read-only)
│   ├── LogViewer.tsx (Monaco Live Logs)
│   └── RichTextEditor.tsx (Novel/Tiptap)
├── /renderers/         # 内容渲染器
│   └── MarkdownRenderer.tsx (react-markdown + KaTeX)
└── /hitl/              # HITL 交互模式组件
    ├── SCAPanel.tsx
    └── AVLPanel.tsx
```


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



--- (509-514 lines) ---
### 8.2 字体与排版

  * 使用 `Geist Sans` 和 `Geist Mono`。
  * 遵循高密度排版规则（UI 默认 `text-sm` 14px）。
  * 定制 `@tailwindcss/typography` (`prose`)，减小默认边距（设计文档 4.1.2.D）。



--- (558-565 lines) ---
### 9.4 性能优化 (Performance Optimization)

1.  **代码分割**: 使用 `next/dynamic` 懒加载大型组件（Monaco Editor, Tiptap）。
2.  **Memoization**: 广泛使用 `React.memo`, `useMemo`, `useCallback`。
3.  **Zustand 优化**: 使用 `useShallow` 选择器避免不必要的重渲染。
4.  **虚拟滚动**: 在 `LogViewer` (Monaco) 中实现虚拟滚动，处理超长日志。
5.  **状态更新批处理**: 在处理高频 WebSocket 事件时，考虑使用批处理技术（如 `setTimeout` 或 React 18 的 `startTransition`）合并状态更新，减少渲染次数。


</architecture>



---

<task>


### 任务 15：专业组件集成 - Markdown/LaTeX 渲染与富文本编辑

**目标：** 实现高质量的 Markdown/LaTeX 渲染器，并集成 Novel/Tiptap 富文本编辑器。

**核心关注点：** 公式渲染（KaTeX）、专业排版（Prose）、编辑器定制。

**实现策略（参考 `<design_doc> 4.1.2.D, 4.3.B.4`）：**

1.  **MarkdownRenderer 实现：** 在 `src/components/renderers/MarkdownRenderer.tsx`（新建）中实现。
    *   基于 `react-markdown`。集成 `remark-gfm`, `remark-math`, `rehype-katex`。确保 KaTeX CSS 加载。
    *   应用 `prose dark:prose-invert` 类，确保使用任务 1 定制的高密度排版样式。
2.  **RichTextEditor 集成：** 在 `src/components/editors/RichTextEditor.tsx`（新建）中集成 Novel/Tiptap。
    *   参考 `<deer_flow_frontend_code> components/editor` 的实现。
    *   **关键配置：** 确保支持 GFM 和 LaTeX 公式编辑。
    *   **样式定制：** 定制编辑器 UI（工具栏、菜单），使其符合全局设计风格。
    *   实现 Markdown 到 Tiptap JSON 的双向转换逻辑。

**输入：** 任务 1 的输出（设计系统）, `<design_doc> 4.1.2.D, 4.3.B.4`。
**输出：** 高质量的 Markdown/LaTeX 渲染器和定制化的富文本编辑器组件。


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

