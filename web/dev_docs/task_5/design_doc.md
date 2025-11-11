--- (88-100 lines) ---
##### 模块二：项目管理与配置 (PMG)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| PMG-2.1 | 项目创建（名称、描述）。 | P0 | 工作流的容器。 | R2.2 |
| PMG-2.2 | 项目仪表板（列表、元数据显示）。 | P0 | 用户入口。 | R2.3 |
| PMG-2.3 | 项目配置：文件上传与角色定义。 | P0 | 工作流输入的基础。 | R3.2 |
| PMG-2.4 | 项目配置：赛题类型选择 (A-F, -)。 | P0 | | R3.4 |
| PMG-2.5 | 项目状态管理（Configuring, Running, Completed）。 | P0 | 控制项目生命周期。 | R2.1 |
| PMG-2.6 | 项目元数据更新（名称、描述）。 | P1 | | R2.1 |
| PMG-2.7 | 项目删除（级联删除所有数据，需二次确认）。 | P1 | | R2.4 |
| PMG-2.8 | 从历年赛题库初始化项目。 | P3 | 便利性功能。 | R3.3 |



--- (155-155 lines) ---
| EXP-7.1 | 一键按需导出项目成果（ZIP包，包含所有激活版本）。 | P2 | 最终交付功能。 | R6 |


--- (267-276 lines) ---
##### 3\. 项目 (Project)

用户工作的基本单元，封装一次完整的建模尝试。

  * `id` (Integer), `user_id` (Integer), `name` (String), `description` (String).
  * `status` (Enum: "Configuring", "Running", "Completed"): 项目生命周期状态。
  * `problem_type` (Enum: "A"-"F", "-"): 建模赛题类型。
  * `workflow_instance_id` (Integer | Null): 关联的工作流实例 ID。
  * `created_at`, `updated_at` (DateTime).



--- (277-283 lines) ---
##### 4\. 项目文件 (ProjectFile)

用户上传的、与项目关联的输入文件。

  * `id` (Integer), `project_id` (Integer), `filename` (String).
  * `role` (Enum: "Problem Description", "Dataset", "Reference Material"): 文件角色。



--- (450-455 lines) ---
**L2.1: 项目仪表板 (Project Dashboard)**
用户的默认入口点，用于管理所有项目。

  * **路由:** `/projects`
  * **核心组件:** 项目列表/网格视图，新建项目按钮，搜索/筛选功能。



--- (459-471 lines) ---
  * **路由:** `/projects/{project_id}`

  * **布局结构:** 此视图的布局会根据项目的当前状态 (`Configuring` 或 `Running`/`Completed`) 动态切换。

    **L2.2.A: 项目配置视图 (Project Configuration View) (当 `Configuring`)**

      * **描述:** 用户上传文件、定义角色、选择赛题类型的界面。
      * **主要内容:**
          * 项目元数据编辑区（名称、描述、赛题类型）。
          * 文件管理区（上传、角色定义）。
          * 初始化选项（自定义 vs. 历年赛题）。
          * 核心操作：“启动工作流 (Start Workflow)” 按钮（满足前置条件后激活）。



--- (476-476 lines) ---
          * **B.1: 项目控制栏 (Project Control Bar):** 位于顶部。显示项目名称、状态、全局操作（如“导出项目”）。


--- (516-539 lines) ---
#### 2.3.1 场景一：项目初始化并启动工作流

**目标:** 用户创建一个新项目，配置必要的输入，并成功启动建模工作流。
**入口点:** L2.1: 项目仪表板。

**流程描述:**

1.  **[用户动作]** 点击“新建项目”，输入信息并创建。
2.  **[系统响应 (API)]** `POST /projects/`。成功后导航至 L2.2.A: 项目配置视图。
3.  **[系统状态]** 项目状态 `Configuring`。“启动工作流”按钮禁用。
4.  **[用户动作]** 上传赛题描述文件，并设置角色为 "Problem Description"。
5.  **[系统响应 (API)]** `POST /projects/{id}/files`。
6.  **[用户动作]** 选择赛题类型（如 "A"）。
7.  **[系统响应 (API)]** `PATCH /projects/{id}`。
8.  **[系统反馈 (UI)]** 所有前置条件满足，“启动工作流”按钮激活。
9.  **[用户动作]** 点击“启动工作流”。
10. **[系统响应 (关键操作)]**
      * **(API):** 调用 `POST /projects/{id}/start`。
      * **(后端逻辑):** 创建配置快照；创建 `WorkflowInstance`；更新项目状态为 `Running`；启动第一个节点执行。
      * **(API 响应):** 返回 `202 Accepted`。
11. **[系统反馈 (UI):** 自动导航至 L2.2.B: 工作流执行视图。画布加载初始结构。
12. **[系统反馈 (WebSocket):** 建立连接。收到第一个节点的 `NODE_STATUS_UPDATED` (Executing) 事件。UI 显示第一个节点正在运行。

**出口点:** 工作流已启动，用户位于工作流执行视图。


--- (652-654 lines) ---
    *   **危险操作 (Destructive):** 不可逆的操作（如“删除”、“丢弃执行”）。使用危险色按钮 (`Shadcn Button` destructive variant)。
*   **确认机制:** 所有危险操作必须通过 `Shadcn AlertDialog` 进行二次确认。确认信息必须清晰说明操作的后果。
*   **溢出菜单:** 对于低频操作，使用“更多操作”(...)菜单（`DropdownMenu` 组件）收纳。


--- (867-869 lines) ---
**[A] 项目控制栏 (Project Control Bar):**
*   左侧：面包屑导航 (Projects / {Project Name})，项目状态 `Badge`。
*   右侧：按钮 "Export Project"。


--- (1512-1564 lines) ---
#### 5.1.1 屏幕一：项目管理仪表板 (Project Management Dashboard)

  * **路由:** `/projects`
  * **布局模板:** 模板一 (标准列表/仪表板布局)。
  * **美学基调:** 简洁、高效、信息清晰。

**结构与样式描述:**

**[容器 (Container)]**

  * 背景色：`bg-background` (Deep Blue-Black)。
  * 布局：标准内容容器，`max-w-7xl mx-auto p-8`。

**[A] 页面头部 (Page Header)**

  * 布局：`flex justify-between items-center mb-8`.
  * **[A.1] 标题:**
      * 文本："Projects".
      * 排版：H2 (`text-3xl font-semibold tracking-tight`).
      * 颜色：`text-foreground` (Off White).
  * **[A.2] 新建项目按钮:**
      * 组件：`<Button variant="primary">`.
      * 内容：`+ New Project`.
      * 样式：`rounded-md` (6px). 主色背景 (`bg-primary`).

**[B] 筛选与搜索栏 (Filter and Search Bar)**

  * 布局：`flex justify-between items-center mb-6`.
  * **[B.1] 搜索框:**
      * 组件：`<Input placeholder="Search projects...">`.
      * 样式：`w-full md:w-1/3`. `bg-card`, `border-input`.
  * **[B.2] 筛选器:**
      * 组件：`<Select>` (Status, Type).
      * 布局：`flex gap-4`.

**[C] 项目列表 (Project List)**

  * 组件：`<Table>` 包装在 `<Card>` 中。
  * 卡片样式：`bg-card`, `rounded-lg` (8px), `shadow-md`, `border-border`.
  * **[C.1] 表头 (Table Head):**
      * 样式：`text-sm font-medium text-muted-foreground`. 边框底部 `border-b border-border`.
  * **[C.2] 表格行 (Table Row):**
      * 交互：整行可点击导航至项目工作区。悬停时高亮 `hover:bg-accent/50`.
      * **列 1: Name:**
          * 排版：`text-base font-medium text-foreground`.
      * **列 2: Status:**
          * 组件：`<Badge>`.
          * 样式：根据状态应用语义色彩。`Running` 使用 `--primary`，`Completed` 使用 `--success`。
      * **列 3: Type & Last Updated:**
          * 排版：`text-sm text-muted-foreground`.
      * **列 5: Actions:**
          * 组件：`<DropdownMenu>` 触发器为 `<Button variant="ghost" size="icon">` 包含 `MoreHorizontal` 图标。

