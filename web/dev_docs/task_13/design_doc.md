--- (135-136 lines) ---
| WFC-5.7 | 实时通信（WebSocket）集成。实时推送状态和结构更新。 | P1 | 支持 WFC-5.1 实时性。 | API Doc 6 |



--- (472-482 lines) ---
    **L2.2.B: 工作流执行视图 (Workflow Execution View) (当 `Running`/`Completed`)**

      * **描述:** 平台的核心操作区，采用“画布+检查器”布局模型。
      * **结构:**
          * **B.1: 项目控制栏 (Project Control Bar):** 位于顶部。显示项目名称、状态、全局操作（如“导出项目”）。
          * **B.2: 工作流可视化画布 (Workflow Visualization Canvas):** 位于中央/左侧。
              * 使用 React Flow 渲染工作流结构（分阶段流程图或 DAG）。
              * **实时状态与陈旧性:** 清晰展示每个节点的状态和“陈旧性”标记。
              * **交互性 (回溯支持):** 用户可以点击任何已执行的节点以选中它。
              * **动态适应性:** 必须能够动态渲染由 Generator 节点生成的结构变化。
          * **B.3: 节点检查器面板 (Node Inspector Panel):** 位于右侧。根据选中的节点动态显示内容。


--- (746-752 lines) ---
**2\. WebSocket 实时通信管理**

*   **连接状态指示器:** 在全局导航栏中显示 WebSocket 连接状态。
*   **断线与重连:**
    *   连接中断时，在屏幕顶部显示全局横幅 (Global Banner)：“实时更新已中断，正在尝试重连...”。
    *   重连成功后，横幅消失，并立即触发一次全局状态同步。



--- (803-812 lines) ---
**模板二：沉浸式工作区布局 (Immersive Workspace Layout - Canvas + Inspector)**

*   **适用场景:** L2.2.B 工作流执行视图。
*   **结构:** 全屏、全高布局。
    *   **[A] 项目控制栏:** 位于顶部。提供项目级上下文和操作。
    *   **[B] 工作区容器:** 占据剩余所有高度。采用水平 Flex 布局。
        *   **[B.1] 工作流画布区 (Canvas):** 占据主要空间 (`flex-1`)。承载 React Flow 可视化。
        *   **[B.2] 节点检查器面板 (Inspector):** 固定在右侧。固定宽度（例如 `w-96` 或 `w-1/3`）。支持独立滚动。
*   **动态调整:** B.1 和 B.2 之间应提供一个可拖拽的分隔条（Resizable Splitter），并支持折叠/展开 B.2。



--- (860-875 lines) ---
#### 3.2.2.2 屏幕二：工作流执行画布 (Workflow Execution View)

*   **路由:** `/projects/{project_id}`
*   **布局模板:** 模板二 (沉浸式工作区布局)。

**结构描述:**

**[A] 项目控制栏 (Project Control Bar):**
*   左侧：面包屑导航 (Projects / {Project Name})，项目状态 `Badge`。
*   右侧：按钮 "Export Project"。

**[B] 工作流画布区 (Workflow Canvas Area):**
*   `React Flow` 容器。背景为网格图案。
*   **节点渲染:** 自定义节点卡片，显示名称、ID、状态图标、陈旧性图标。按照 `Phase -> Stage -> Node` 的层级布置：Phase 作为列，Stage 作为列内分组，直接消费 API 返回的 `phases[].stages[].nodes` 数据。
*   **控件:** 右下角 Minimap 和 Zoom Controls。



--- (1567-1604 lines) ---
#### 5.1.2 屏幕二：工作流执行视图 (Workflow Execution View)

  * **路由:** `/projects/{project_id}`
  * **布局模板:** 模板二 (沉浸式工作区布局)。
  * **美学基调:** 高度沉浸、精密、动态。体现“数字实验室”的氛围。

**结构与样式描述:**

**[全局容器 (Global Container)]**

  * 布局：`flex flex-col h-screen bg-background`. 确保占据整个视口高度。

**[A] 项目控制栏 (Project Control Bar)**

  * 布局：`flex justify-between items-center p-4 border-b border-border`. 高度固定。
  * 背景：`bg-card` (比全局背景稍亮，构建层级)。
  * **[A.1] 左侧：上下文信息:** 面包屑和项目状态 `<Badge>`.
  * **[A.2] 右侧：全局操作:** 按钮 "Export Project".

**[B] 工作区容器 (Workspace Container)**

  * 布局：`flex flex-1 overflow-hidden`. 占据剩余所有高度。

**[B.1] 工作流画布区 (Workflow Canvas Area - React Flow)**

  * 布局：`flex-1 relative`.
  * **背景:** `bg-background`. 使用 `React Flow Background` 组件实现点状网格 (`BackgroundVariant.Dots`, color 调整为 `text-muted/20`)。
  * **控件:** `React Flow Controls` 和 `MiniMap` 位于右下角。
  * **节点渲染 (关键 - 详见 5.1.2.1):** 使用自定义节点组件。

**[B.2] 节点检查器面板 (Node Inspector Panel)**

  * 布局：`w-96 lg:w-[480px] flex flex-col border-l border-border overflow-y-auto`. 固定在右侧。

  * 背景：`bg-card`.

  * **(注):** B.1 和 B.2 之间应实现可拖拽分隔器。



--- (1815-1819 lines) ---
**2. 展开/折叠检查器面板**

  * **实现:** 使用 `Framer Motion` 的 `layout` 动画处理宽度变化。
  * **效果:** 面板平滑地滑入或滑出屏幕右侧。画布区域同时平滑地调整宽度。
  * **参数:** `Transitions.layout`.
