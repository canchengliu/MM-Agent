--- (407-416 lines) ---
**节点生命周期状态 (Node Lifecycle Status - `NodeStatus`)**

| 状态 | 定义 |
| :--- | :--- |
| **未开始 (Not Started)** | 节点从未被执行过。 |
| **执行中 (Executing)** | 节点的计算/LLM 推理正在进行。 |
| **等待 HITL 批准 (Awaiting HITL Approval)** | 计算成功完成，等待用户在 HITL 界面进行交互。此状态下的结果是临时的 (`pending_result`)。 |
| **已完成 (Completed)** | 节点拥有一个或多个已批准的版本，且存在一个 `Active Version`。 |
| **执行失败 (Failed)** | 节点的计算执行失败。 |



--- (644-645 lines) ---
*   **单一焦点原则:** 在任意时刻，工作流画布中只有一个节点处于选中（Focused）状态。点击节点会立即选中它，并取消之前的选择。选中的节点应有清晰的视觉高亮。
*   **可访问性:** 利用 Radix UI 的底层能力，确保所有交互元素支持键盘导航。模态框和下拉菜单必须实现正确的焦点捕获 (Focus Trapping)。


--- (727-738 lines) ---
**节点生命周期状态 (`NodeStatus`) 可视化规范:**

建立一套一致的视觉语言（图标 + 色彩 + 动画）应用于工作流画布和检查器面板。

| 状态 | 图标 (Lucide Icon) | 颜色 (Semantic Color) | 动画与效果 |
| :--- | :--- | :--- | :--- |
| **Not Started** | `Circle` (虚线) | 中性灰 (Gray) | 无。若未解锁，显示为置灰状态。 |
| **Executing** | `Loader` (旋转) | 主色 (Blue/Primary) | 旋转动画。节点边缘可应用微妙的动态光效（`Magic UI BorderBeam`）。 |
| **Awaiting HITL Approval** | `UserCheck` 或 `Hand` | 警告色 (Yellow/Amber) | 微妙的脉动效果或闪烁，以吸引用户注意。 |
| **Completed** | `CheckCircle` (实心) | 成功色 (Green) | 状态变化时有平滑的转场动画。 |
| **Failed** | `XCircle` (实心) | 错误色 (Red) | 醒目，静态。 |



--- (757-763 lines) ---
**陈旧性 (Staleness) 可视化规范:**

*   **检测触发:** 任何节点的 `active_version` 变更后，前端立即调用 `GET /workflows/{id}/staleness` 更新状态。
*   **L1: 画布提示:** 在陈旧的节点卡片上添加一个醒目的警告图标（例如 `AlertTriangle` 或 `RefreshCw`），颜色为警告色。
*   **L2: 检查器面板提示:** 当用户选择陈旧节点时，在“执行与结果”标签页顶部显示一个突出的警告框 (`Shadcn Alert`)。文案必须清晰说明原因和建议操作。
*   **L3: 依赖详情:** 在“依赖关系”标签页中，清晰高亮显示版本号不一致的上游依赖。



--- (824-827 lines) ---
*   **机制:** 基于客户端状态管理（`Zustand`）而非 URL 路由。
*   **用途:** 在工作流执行视图中切换焦点节点（回溯和审查）。
*   **行为:** 用户点击画布节点，更新 `selectedNodeId` 状态，检查器面板局部更新内容。URL 保持不变（或仅更新查询参数 `?node={id}`）。这使得导航极为快速和流畅。



--- (1295-1297 lines) ---
  * **`BorderBeam` / 动态光环:**
      * **应用场景:** 用于工作流画布中处于 `Executing` 状态的节点边缘，可视化正在进行的活动。
      * **参数:** 速度适中，颜色使用主色 (`--primary`)。


--- (1467-1481 lines) ---
##### 1\. 工作流节点卡片 (Workflow Node Card - React Flow Custom Node)

  * **技术基础:** `React Flow` Custom Node, 基于 `Card`。
  * **视觉属性:** 圆角 `rounded-md` (6px)。
  * **结构:** 包含状态图标、节点名称、ID 和陈旧性指示器。
  * **状态可视化 (关键):** 必须严格遵循 3.1.2.1 的规范。
      * **`Executing`:**
          * 状态图标动画化（旋转 `Loader`）。
          * **（核心效果）** 应用 `Magic UI BorderBeam` 动态光环效果于卡片边缘。颜色使用 `--primary`，速度适中（例如 `duration={5}`）。
      * **`Awaiting HITL`:** 使用 Warning 色彩，图标可能有微妙脉动效果。
      * **`Stale`:** 显示醒目的警告图标。
  * **交互状态:**
      * **Hover:** 阴影提升至 `shadow-lg`。
      * **Selected (Focused):** 边框高亮为 `--primary`，并显示焦点环。



--- (1625-1662 lines) ---
##### 5.1.2.1 详述：工作流节点卡片高保真设计 (Workflow Node Card High-Fidelity)

  * **基础结构 (Base Structure):**

      * 样式：`rounded-md` (6px), `shadow-md`, `border`. 宽度固定（例如 `w-64`）。
      * 背景：`bg-card`.

  * **内容布局:** `p-3 flex items-center gap-3`.

      * **[1] 状态图标:** 尺寸 `w-6 h-6`.
      * **[2] 节点信息:** 名称（`text-sm font-medium`）和 ID（`text-xs font-mono`）。

  * **交互状态样式 (Interaction States):**

      * **Hover:** 阴影提升 `shadow-lg`. 边框 `border-accent`.
      * **Selected (Focused):** 边框加粗 `border-2 border-primary`. 显示焦点环 `ring-2 ring-ring`.

  * **节点状态样式 (Node Status Styling):**

      * **`Executing` (核心动态效果):**

          * 图标：蓝色旋转 Loader。
          * **动态光环:** 应用 `<Magic UI BorderBeam>`.
          * 参数：`colorFrom="#1e40af"`, `colorTo="#3b82f6"`, `duration={5}`。
          * 确保 `BorderBeam` 覆盖在默认边框之上。

      * **`Awaiting HITL Approval` (吸引注意):**

          * 图标：黄色 UserCheck。
          * 边框：使用警告色 `border-warning`.
          * 动画：图标可应用微妙的脉动效果（使用 `Framer Motion`）。

      * **`Stale` (陈旧性指示):**

          * 位置：在节点卡片的右上角叠加一个小的警告图标。
          * 图标：`AlertTriangle`. 颜色：`text-warning`.
          * **(注):** 陈旧性是叠加状态。



--- (1748-1763 lines) ---
**1. 节点状态转换动画 (Node State Transition)**

  * **实现方式:** 使用 `Framer Motion` 的 `animate` 属性进行属性过渡。

  * **具体动效:**

      * **`Executing` 开始:**
          * 图标平滑过渡到旋转的 `Loader`。
          * `<Magic UI BorderBeam>` 动态光环效果淡入激活。参数：淡入使用 `duration.medium`。
      * **`Executing` 结束:**
          * `BorderBeam` 效果淡出。
          * 图标平滑过渡到新状态图标。
      * **`Awaiting HITL Approval` 开始:**
          * 图标过渡到 `--warning` 色。
          * 图标激活微妙的脉动效果（使用 `Framer Motion` 控制透明度循环变化）。参数：持续时间 `1.5s`, 缓动 `easing.standard`, 循环播放。



--- (1808-1814 lines) ---
**1. 切换焦点节点 (Switching Focused Node)**

  * **触发条件:** 用户点击画布上的另一个节点。
  * **效果:** 检查器面板内容快速切换。
      * **实现:** 使用 `<AnimatePresence mode="wait">` 包裹检查器面板的内容区，以 `selectedNodeId` 作为 `key`。
      * **参数:** 使用 `duration.fast` (0.2s)。`Transitions.standard`.

