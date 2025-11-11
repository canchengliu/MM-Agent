
#### 任务 3.1：项目仪表板实现 (列表视图与 CRUD)

*   **目标：** 实现项目管理仪表板 (L2.1)。
*   **输入：** 任务 1.3 (ProjectsStore/Service), `<design_doc> (5.1.1)`.
*   **输出：** `app/(dashboard)/projects/page.tsx`, `components/platform/ProjectTable.tsx`, `CreateProjectDialog.tsx`, `StatusBadge.tsx`。
*   **核心关注点：** 使用 Shadcn Table 实现高密度列表；状态可视化；CRUD 操作交互。
*   **实现策略:**
    1.  实现 `projects/page.tsx`，调用 `fetchProjects`。
    2.  实现 `ProjectTable.tsx`。实现 `StatusBadge.tsx`（根据项目状态显示颜色）。
    3.  实现 `CreateProjectDialog.tsx`。调用 `createProject`。
    4.  实现删除项目的 `AlertDialog` 确认流程（Design Doc 3.1.1.1）。
    5.  实现行点击导航到 `/projects/{id}`。
*   **边界：** 实现项目列表和基础 CRUD 操作 UI。
