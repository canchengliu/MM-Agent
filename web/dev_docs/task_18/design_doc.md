--- (121-121 lines) ---
| VER-4.4 | 历史版本审查（只读模式查看完整快照）。 | P1 | 支持回溯和比较。 | S5.6 |


--- (123-123 lines) ---
| VER-4.6 | 静默状态管理与“陈旧性”(Staleness)检测与提示。 | P1 | 核心设计哲学。系统提示但不干预。 | S1.4, R5.2 |


--- (321-336 lines) ---
##### 7\. 节点版本 (NodeVersion)

节点的一次已批准执行结果的不可变快照 (Atomic Versioning)。

  * `id` (Integer), `node_instance_id` (Integer).
  * `version_number` (Integer): 节点内的版本序号 (e.g., v1, v2)。
  * `source` (Enum: "AI\_GENERATED", "MANUALLY\_EDITED"): 版本的来源。
  * `summary` (String): 对该版本的简短描述或变更日志。
  * `based_on_version_id` (Integer | Null): 此版本所基于的前一个版本 ID。
  * **快照内容 (Context Snapshot):**
      * `output_data` (JSON): 该版本最终的输出工件 (Artifacts)。
      * `input_dependencies` (JSON Array): **（关键）** 记录生成此版本时所依赖的上游节点及其版本 ID。用于计算陈旧性。
          * `[{ "upstream_node_id": 101, "consumed_version_id": 5 }]`
      * `hitl_history` (JSON Array): 生成此版本过程中的完整 HITL 交互记录。
      * `environment_parameters` (JSON): 执行环境参数。



--- (381-383 lines) ---
1.  **节点与版本 (NI \<-\> NV):** 一个节点实例（NI）拥有多个版本历史（NV），但只有一个激活版本（NV\_Active）。
2.  **版本间的依赖 (NV -\> NV\_Upstream):** 这是实现“陈旧性检测”的关键。一个版本（NV）精确记录了它生成时所消费的上游版本 ID（NV\_Upstream）。当上游节点的激活版本变更时，下游依赖旧版本的节点将被标记为“陈旧”。



--- (401-401 lines) ---
| **节点版本 (NodeVersion)** | 节点某次成功执行并被批准后的不可变快照，包含输入、输出和完整上下文。 |


--- (404-405 lines) ---
| **陈旧性 (Staleness)** | 当一个节点的上游依赖节点的 `Active Version` 更新后，该节点的状态。表示其结果是基于过时的输入生成的。 |
| **静默状态管理 (Silent State Management)** | 当上游变更导致下游“陈旧”时，系统仅作非侵入式提示，而不会自动触发任何级联更新。由用户决定何时以及如何处理不一致性。 |


--- (490-491 lines) ---
                  * **Tab 2: 版本历史 (Version History):** 列出所有历史版本。提供“审查”和“激活此版本”操作。
                  * **Tab 3: 依赖关系 (Dependencies):** 显示上游输入依赖。清晰展示“陈旧性”报告详情。


--- (699-708 lines) ---
##### 3\. 版本浏览与切换

*   **入口:** 节点检查器面板的“版本历史”标签页。
*   **交互规则:**
    *   **历史列表:** 显示所有版本，标记当前激活版本。
    *   **审查 (Review):** 点击历史版本，在只读模态框 (`Dialog`) 中加载该版本的完整快照。
    *   **激活 (Activate):** 提供“激活此版本”按钮。
        *   **强制确认:** 点击后必须弹出确认对话框，明确警告用户下游节点将变为“陈旧 (Stale)”且不会自动更新（遵循“静默状态管理”）。
        *   **限制:** Generator 节点禁止切换版本。



--- (753-763 lines) ---
#### 3.1.2.3 “静默状态管理”与“陈旧性”提示

遵循“静默状态管理”原则 (SRS 1.4)，当上游变更导致下游节点“陈旧 (Stale)”时，提供非侵入式提示。

**陈旧性 (Staleness) 可视化规范:**

*   **检测触发:** 任何节点的 `active_version` 变更后，前端立即调用 `GET /workflows/{id}/staleness` 更新状态。
*   **L1: 画布提示:** 在陈旧的节点卡片上添加一个醒目的警告图标（例如 `AlertTriangle` 或 `RefreshCw`），颜色为警告色。
*   **L2: 检查器面板提示:** 当用户选择陈旧节点时，在“执行与结果”标签页顶部显示一个突出的警告框 (`Shadcn Alert`)。文案必须清晰说明原因和建议操作。
*   **L3: 依赖详情:** 在“依赖关系”标签页中，清晰高亮显示版本号不一致的上游依赖。



--- (892-893 lines) ---
    *   **Tab 2: History:** 版本历史列表（详见屏幕四）。
    *   **Tab 3: Dependencies:** 上游依赖列表和版本一致性检查报告。


--- (943-950 lines) ---
**视图 B: 版本历史管理 (Version History Tab)**

*   **位置:** 屏幕二的节点检查器面板 [C.3, Tab 2]。

**[A] 版本历史列表:**
*   列表形式。每项显示版本号、时间、来源、摘要、激活状态。
*   操作按钮："Review" (打开模态框查看详情), "Activate" (弹出确认对话框)。



--- (1001-1004 lines) ---
*   **示例（版本切换）:**
    *   标题：`Activate Version V1?`
    *   正文：`Activating this historical version will change the output of this node. Downstream nodes will be marked as Stale and will not be automatically updated. Do you want to proceed?`
    *   按钮：`Cancel` / `Activate`


--- (1006-1010 lines) ---
**2\. 陈旧性提示 (Staleness Alerts)**

*   **范式:** 状态 + 原因 + 建议操作。
*   **示例:** `Warning: Input Outdated (Stale). Upstream node [Node A] has updated from V1 to V2. It is recommended to Re-execute this node to sync the latest data.`



--- (1453-1458 lines) ---
##### 4\. 模态框与对话框 (Dialog, AlertDialog)

  * **视觉属性:** 圆角 `rounded-lg` (8px)。阴影 `shadow-xl`。
  * **背景遮罩:** `bg-background/80`, `backdrop-blur-sm`。
  * **动效:** 进入时从中心淡入并轻微放大。使用 `Transitions.enter`。



--- (1612-1613 lines) ---
      * 组件：`<Tabs>`.
      * Tabs: "Results & Actions", "History", "Dependencies".


--- (1619-1619 lines) ---
          * **陈旧性警告 (If Stale):** 如果节点陈旧，顶部显示 `<Alert variant="warning">`。文案遵循 3.3.4。
