
#### 任务 8.1：项目导出功能实现

*   **目标：** 实现项目成果导出为 ZIP 包的功能 (R6)。
*   **输入：** `<api> (3.3.2)`, 任务 4.1 (ProjectControlBar)。
*   **输出：** 更新 `ProjectControlBar.tsx`, `ProjectService.ts`。
*   **核心关注点：** 处理二进制（ZIP）响应；触发浏览器下载。
*   **实现策略:**
    1.  **`ProjectService.ts` (更新):** 实现 `exportProject` 方法。特殊处理 `fetch` 响应（获取 Blob），使用 `URL.createObjectURL` 和动态创建的 `<a>` 标签触发下载。
    2.  **`ProjectControlBar.tsx` (更新):** 连接“Export Project”按钮，实现加载状态管理和反馈（Toast）。
*   **边界：** 实现导出功能。
