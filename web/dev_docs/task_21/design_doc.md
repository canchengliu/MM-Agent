--- (35-35 lines) ---
*   **平台诉求:** 清晰的流程视图、精细化的 HITL 干预能力（SCA/AVL），以及无缝编辑 AI 生成工件（公式、代码）的能力（R4）。


--- (59-59 lines) ---
*   **随时干预与编辑的权力:** 如果 AI 生成的结果不符合预期，Evelyn 需要能够直接上手修改（R4），无论是代码、公式还是文本报告。


--- (147-149 lines) ---
| EDT-6.7 | 人工编辑：支持对 AI 生成的文本工件进行编辑。 | P1 | 用户主权体现。 | R4.1 |
| EDT-6.8 | 人工编辑：平台内编辑器（富文本/LaTeX、代码）。 | P1 | | R4.2 |
| EDT-6.9 | 人工编辑：版本控制逻辑。保存编辑必须创建新版本并自动激活。 | P1 | 依赖 VER-4.1。 | R4.3 |


--- (327-327 lines) ---
  * `source` (Enum: "AI\_GENERATED", "MANUALLY\_EDITED"): 版本的来源。


--- (487-487 lines) ---
                      * `Completed`: 显示 `active_version` 的输出工件。提供“编辑”和“重新执行”操作。如果陈旧，显示警告。


--- (610-630 lines) ---
#### 2.3.4 场景四：对 AI 生成的工件进行人工编辑并创建新版本

**目标:** 用户直接修改 AI 生成的中间结果，并保存为新的激活版本。
**入口点:** L2.2.B: 工作流执行视图。Node N 已完成 (V1)。

**流程描述:**

1.  **[用户动作]** 用户在 Node N 的详情面板审查 V1 工件。点击“人工编辑 (Manual Edit)”按钮。
2.  **[系统反馈 (UI)]** 详情面板切换为编辑模式，加载平台内编辑器（如 Tiptap/Novel），并载入 V1 内容。
3.  **[用户动作]** 用户在编辑器中修改内容。（可选：使用 Ask AI 辅助功能）。
4.  **[用户动作]** 点击“保存并激活”按钮。输入版本摘要并确认。
5.  **[系统响应 (API)]** 调用 `POST /nodes/{id}/manual-edit`。
      * `base_version_id: V1`, `edited_output_data: {...}`, `summary: "..."`。
6.  **[系统响应 (后端逻辑)]**
      * 创建新版本 V2 (`source: MANUALLY_EDITED`)。
      * 将 V2 设为 `active_version`。
7.  **[系统反馈 (UI)]** 退出编辑模式，详情面板显示 V2 内容。
8.  **[系统响应 (UI)]** 前端重新计算陈旧性。所有依赖 Node N 的下游节点被标记为“陈旧”。

**出口点:** 节点 N 的激活版本已更新为人工编辑后的 V2，下游节点显示陈旧提示。



--- (709-716 lines) ---
##### 4\. 结构化内容编辑 (人工编辑 R4)

*   **技术基础:** `Tiptap/Novel` (富文本/LaTeX), Code Editor。
*   **交互规则:**
    *   **进入编辑模式:** 在已完成节点的检查器面板中，点击“人工编辑”。内容区切换为编辑器实例。
    *   **AI 辅助 (Ask AI):** 集成 Deer-Flow 的 Ask AI 功能。用户可通过斜杠命令 (`/ai`) 或选中文本后的浮动工具栏调用 AI 辅助编辑。
    *   **保存与版本创建:** 点击“保存并激活”按钮。弹出对话框要求用户输入“版本摘要 (Summary)”。提交后，创建一个新的 `MANUALLY_EDITED` 版本并自动激活。



--- (886-887 lines) ---
            *   操作工具栏："Manual Edit", "Re-execute"。
            *   输出工件展示区（Markdown, Code, etc.）。


--- (929-942 lines) ---
#### 3.2.2.4 屏幕四：工件编辑与版本管理视图 (Artifact Editing and Version Management)

**视图 A: 人工编辑模式 (Manual Editing Mode)**

*   **位置:** 嵌入在屏幕二的节点检查器面板 [C.3, Tab 1] 中（激活编辑模式时）。

**[A] 编辑器主体:**
*   `Tiptap/Novel` 编辑器实例（或 Code Editor）。
*   包含完整的工具栏和 Ask AI 辅助功能。

**[B] 编辑操作栏:**
*   固定在面板底部。
*   按钮："Cancel", "Save & Activate" (点击后弹出版本摘要输入对话框)。



--- (993-993 lines) ---
| 用户直接修改工件 | Manual Edit | |


--- (1482-1489 lines) ---
##### 2\. 富文本/LaTeX 编辑器 (Tiptap/Novel Editor)

  * **视觉定制:** Novel 的默认样式需要定制以符合设计系统。
      * **字体与排版:** 继承全局字体 (Geist) 和排版规则 (4.1.2)。
      * **工具栏:** 使用 `Shadcn/ui` 的 `ToggleGroup` 和 `Button` (Ghost variant)。背景为 `--popover`。
  * **Ask AI 集成:**
      * 斜杠命令 (`/`) 和 `@mention` 菜单使用 `cmdk` 和 `Tippy.js` 实现，视觉风格与 `DropdownMenu` 保持一致。



--- (1719-1737 lines) ---
#### 5.1.4 屏幕四：工件编辑视图 (Artifact Editing View)

  * **位置:** 嵌入在节点检查器面板 [B.2.3] 中（当激活编辑模式时）。

**[A] 编辑器主体 (Editor Body)**

  * 布局：`flex-1 overflow-y-auto`.
  * 组件：`Tiptap/Novel` 编辑器实例。
  * **样式定制:**
      * 工具栏背景 `--popover`, `shadow-lg`, `rounded-md`.
      * 排版遵循 4.1.2.3。字体 Geist Sans。
      * Ask AI 菜单 (`cmdk`) 视觉风格与 `Shadcn Command` 一致。

**[B] 编辑操作栏 (Fixed Footer)**

  * 布局：`p-4 border-t border-border mt-auto flex justify-end gap-4`.
  * 按钮："Cancel" (`Secondary`), "Save & Activate" (`Primary`).
  * **保存对话框:** 点击保存后弹出 `Dialog`，要求输入“版本摘要 (Summary)” (`Textarea`)。

