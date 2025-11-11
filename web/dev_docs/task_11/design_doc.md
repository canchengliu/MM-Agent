--- (91-98 lines) ---
| :--- | :--- | :--- | :--- | :--- |
| PMG-2.1 | 项目创建（名称、描述）。 | P0 | 工作流的容器。 | R2.2 |
| PMG-2.2 | 项目仪表板（列表、元数据显示）。 | P0 | 用户入口。 | R2.3 |
| PMG-2.3 | 项目配置：文件上传与角色定义。 | P0 | 工作流输入的基础。 | R3.2 |
| PMG-2.4 | 项目配置：赛题类型选择 (A-F, -)。 | P0 | | R3.4 |
| PMG-2.5 | 项目状态管理（Configuring, Running, Completed）。 | P0 | 控制项目生命周期。 | R2.1 |
| PMG-2.6 | 项目元数据更新（名称、描述）。 | P1 | | R2.1 |
| PMG-2.7 | 项目删除（级联删除所有数据，需二次确认）。 | P1 | | R2.4 |


--- (267-276 lines) ---
##### 3\. 项目 (Project)

用户工作的基本单元，封装一次完整的建模尝试。

  * `id` (Integer), `user_id` (Integer), `name` (String), `description` (String).
  * `status` (Enum: "Configuring", "Running", "Completed"): 项目生命周期状态。
  * `problem_type` (Enum: "A"-"F", "-"): 建模赛题类型。
  * `workflow_instance_id` (Integer | Null): 关联的工作流实例 ID。
  * `created_at`, `updated_at` (DateTime).



--- (450-455 lines) ---
**L2.1: 项目仪表板 (Project Dashboard)**
用户的默认入口点，用于管理所有项目。

  * **路由:** `/projects`
  * **核心组件:** 项目列表/网格视图，新建项目按钮，搜索/筛选功能。



--- (505-505 lines) ---
2.  **列表到详情 (List to Detail):** 从项目仪表板 (L2.1) 点击项目，导航到项目工作区 (L2.2)。


--- (652-654 lines) ---
    *   **危险操作 (Destructive):** 不可逆的操作（如“删除”、“丢弃执行”）。使用危险色按钮 (`Shadcn Button` destructive variant)。
*   **确认机制:** 所有危险操作必须通过 `Shadcn AlertDialog` 进行二次确认。确认信息必须清晰说明操作的后果。
*   **溢出菜单:** 对于低频操作，使用“更多操作”(...)菜单（`DropdownMenu` 组件）收纳。


--- (839-857 lines) ---
#### 3.2.2.1 屏幕一：项目管理仪表板 (Project Management Dashboard)

*   **路由:** `/projects`
*   **布局模板:** 模板一 (标准列表/仪表板布局)。

**结构描述:**

**[A] 页面头部:**
*   左侧：标题 "Projects"。
*   右侧：按钮 "+ New Project" (Primary)。

**[B] 筛选与搜索栏:**
*   左侧：搜索框 (`Input`) "Search projects..."。
*   右侧：筛选器 (`Select`) "Status", "Type"。

**[C] 项目列表:**
*   使用 `Shadcn Table` 以支持高密度信息。
*   **列:** Name (可点击导航), Status (`Badge`), Type, Last Updated, Actions ("..." `DropdownMenu` 包含 Edit, Delete)。



--- (1459-1464 lines) ---
##### 5\. 徽章 (Badge)

  * **用途:** 显示状态标签。
  * **视觉属性:** 圆角 `rounded-sm` (2px)。字体 `text-xs`, SemiBold。
  * **变体:** 定制以支持所有语义色彩（Success, Warning, Error）。



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

