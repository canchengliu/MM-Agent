--- (292-293 lines) ---
  * `phases` (Array\<`PhaseStageGrouping`\>): **（API 响应）** 序列化层将节点聚合为 `Phase -> Stage -> Node` 的层级结构，直接供 React Flow 渲染。每个 Phase 包含 `name` 与 `stages`，每个 Stage 提供 `id`, `name`, `nodes`（节点条目包含 `is_stale`、`active_version` 摘要等状态扩展字段）。



--- (319-320 lines) ---
* **API 序列化:** `WorkflowService._build_hierarchical_phases` 基于节点的 Phase 与 Stage 元数据返回 `phases[].stages[].nodes`。前端无需再以 `phase_id` 手动聚合扁平列表，直接消费层级化结构以构建列 (Phase) / 分组 (Stage) / 卡片 (Node)。



--- (477-482 lines) ---
          * **B.2: 工作流可视化画布 (Workflow Visualization Canvas):** 位于中央/左侧。
              * 使用 React Flow 渲染工作流结构（分阶段流程图或 DAG）。
              * **实时状态与陈旧性:** 清晰展示每个节点的状态和“陈旧性”标记。
              * **交互性 (回溯支持):** 用户可以点击任何已执行的节点以选中它。
              * **动态适应性:** 必须能够动态渲染由 Generator 节点生成的结构变化。
          * **B.3: 节点检查器面板 (Node Inspector Panel):** 位于右侧。根据选中的节点动态显示内容。


--- (666-672 lines) ---
*   **技术基础:** `React Flow (@xyflow/react)`.
*   **画布导航:** 支持平移（Pan）和缩放（Zoom）。提供 Minimap 和 Controls 工具栏。
*   **节点选择与回溯 (Backtracking):**
    *   用户可以点击任何已开始或已完成的节点来选中它，触发检查器面板加载其详情。
    *   **执行前沿限制:** 超前于“执行前沿”的 `Not Started` 节点应在视觉上显示为“未解锁”，并且不可点击。
*   **动态结构更新:** 当 Generator 节点完成时，使用布局动画（`Framer Motion` 或 `React Flow` 内置动画）平滑地呈现新节点的出现和重新排列。



--- (871-875 lines) ---
**[B] 工作流画布区 (Workflow Canvas Area):**
*   `React Flow` 容器。背景为网格图案。
*   **节点渲染:** 自定义节点卡片，显示名称、ID、状态图标、陈旧性图标。按照 `Phase -> Stage -> Node` 的层级布置：Phase 作为列，Stage 作为列内分组，直接消费 API 返回的 `phases[].stages[].nodes` 数据。
*   **控件:** 右下角 Minimap 和 Zoom Controls。



--- (1590-1596 lines) ---
**[B.1] 工作流画布区 (Workflow Canvas Area - React Flow)**

  * 布局：`flex-1 relative`.
  * **背景:** `bg-background`. 使用 `React Flow Background` 组件实现点状网格 (`BackgroundVariant.Dots`, color 调整为 `text-muted/20`)。
  * **控件:** `React Flow Controls` 和 `MiniMap` 位于右下角。
  * **节点渲染 (关键 - 详见 5.1.2.1):** 使用自定义节点组件。



--- (1772-1782 lines) ---
1.  **[系统] 计算新布局:** 使用布局算法（如 Dagre）计算新坐标。
2.  **[动效] 布局调整动画 (Layout Animation):**
      * **目标:** 现有节点平滑移动到新位置。
      * **实现:** 在自定义节点组件中使用 `Framer Motion` 的 `layout` 属性。
      * **参数:** 使用 `Transitions.layout` (`type: "tween", duration: 0.3s, ease: MotionEasings.sharp`)。
3.  **[动效] 新节点进入动画 (Enter Animation):**
      * **目标:** 新生成的节点链有序地出现。
      * **实现:** 使用 `Framer Motion` 的 `variants` 和 `staggerChildren`。
      * **效果:** 淡入结合轻微的自下而上移动 (`opacity: 0, y: 20px -> opacity: 1, y: 0`)。
      * **参数:** 交错间隔 `staggerChildren: 0.05s`。单个节点动画使用 `Transitions.enter`。

