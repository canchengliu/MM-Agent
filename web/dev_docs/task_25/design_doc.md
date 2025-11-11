--- (156-156 lines) ---
| SET-7.2 | 界面设置（语言、主题选择）。 | P2 | 提升用户体验。 | R7.2 |


--- (784-788 lines) ---
**1\. 栅格系统与响应式策略 (Grid System and Responsiveness)**

*   **技术基础:** `Tailwind CSS` Flexbox 和 Grid 布局。
*   **设计策略:** **Desktop-First**。优先保证在大屏幕上的高信息密度和操作效率。`lg` (1024px) 是支持完整功能体验的最小推荐尺寸。
*   **栅格系统:** 标准 12 列栅格系统。


--- (953-1015 lines) ---
### 3.3 UX 文案指南 (UX Writing Guidelines)

本文档确立了 O-Award 建模平台内部所有文案的语调、风格和用词规范。

#### 3.3.1 品牌声音与语调 (Brand Voice and Tone)

**品牌声音：精密、专业、赋能 (Precise, Professional, Empowering).**

平台的声音是专家与专家之间的对话，保持客观、精确，同时提供清晰的指引和支持。

**语调指南:**

1.  **精确与客观 (Precise and Objective):** 使用准确术语，避免口语化和情绪化表达。
    *   *Do:* "Node 1.1.2 execution failed."
    *   *Don't:* "Oops! Something went wrong."
2.  **清晰与直接 (Clear and Direct):** 直截了当地说明事实和所需操作。优先使用主动语态和祈使句。
    *   *Do:* "Select a preferred architecture to continue."
    *   *Don't:* "An architecture must be selected before proceeding."
3.  **支持性与赋能 (Supportive and Empowering):** 强调用户的控制权，并在出现问题时提供解决方案。
    *   *Do:* "Input dependency changed. Re-execution is recommended to sync updates."
    *   *Don't:* "You must re-execute this node."

#### 3.3.2 沟通原则 (Communication Principles)

1.  **一致性 (Consistency):** 严格遵守术语表，确保在所有界面中使用统一的术语。
2.  **简洁性 (Conciseness):** 言简意赅，删除不必要的词语。
3.  **清晰性优先 (Clarity First):** 当简洁性与清晰性冲突时，优先保证清晰性。

#### 3.3.3 术语标准化 (Terminology Standardization)

| 概念 | 标准术语 (英文) | 备注/解释 |
| :--- | :--- | :--- |
| 工作流中的步骤 | Node | |
| 节点的执行结果快照 | Version (V1, V2...) | |
| 当前生效的版本 | Active Version | 下游节点使用的输入来源。 |
| 上游更新导致下游过时 | Stale (Status: Stale) | 表示结果基于过时的输入生成。 |
| 人机协同环节 | HITL Approval / Review | 优先使用 Review 或 Approval。 |
| 对已完成节点发起新执行 | Re-execute | 用于探索性执行。 |
| 对失败节点再次尝试 | Retry | 用于错误恢复。 |
| 丢弃本次临时执行结果 | Discard Execution | 强调会丢失本次执行的临时结果。 |
| 用户直接修改工件 | Manual Edit | |
| 切换激活版本 | Activate Version | 避免使用 Rollback。 |

#### 3.3.4 特定场景文案范式 (Specific Scenario Paradigms)

**1\. 确认对话框 (Confirmation Dialogs - 强调后果)**

*   **范式:** 标题应明确操作。正文必须清晰说明后果。按钮应使用明确动词。
*   **示例（版本切换）:**
    *   标题：`Activate Version V1?`
    *   正文：`Activating this historical version will change the output of this node. Downstream nodes will be marked as Stale and will not be automatically updated. Do you want to proceed?`
    *   按钮：`Cancel` / `Activate`

**2\. 陈旧性提示 (Staleness Alerts)**

*   **范式:** 状态 + 原因 + 建议操作。
*   **示例:** `Warning: Input Outdated (Stale). Upstream node [Node A] has updated from V1 to V2. It is recommended to Re-execute this node to sync the latest data.`

**3\. 错误信息 (Error Messages)**

*   **范式:** 发生了什么 + 为什么发生 + 如何解决。
*   **示例:** `Execution Failed. The Python script encountered an error at line 42. Please review the execution log for details and Retry.`



--- (1232-1245 lines) ---
#### 4.1.3.3 响应式设计 (Responsiveness)

  * **设计策略:** **Desktop-First (桌面优先)**。平台的核心体验是为桌面环境优化的。
  * **断点定义 (Breakpoints):** 使用 Tailwind CSS 默认断点。

| 断点 | 尺寸 | 设计考量 |
| :--- | :--- | :--- |
| `sm`, `md` | \< 1024px | 移动/平板设备。支持基本浏览和管理功能。布局堆叠为单列。复杂操作（如工作流编辑）可能受限。 |
| **`lg`** | **≥ 1024px** | **最小推荐尺寸。** 支持完整功能体验。“画布+检查器”布局开始可用。 |
| `xl` | ≥ 1280px | 理想桌面尺寸。信息密度和空间感达到平衡。 |
| `2xl`| ≥ 1536px | 超宽屏。提供更宽阔的画布视野。 |

  * **布局适应规则:** 在 `< lg` 断点下，工作流执行视图的检查器面板应从右侧固定布局变为覆盖在画布上方的模态抽屉 (`Shadcn Drawer`)。

