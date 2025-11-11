--- (151-155 lines) ---
##### 模块七：用户设置与导出 (SET/EXP)

| ID | 功能点描述 | 优先级 | 依赖关系与备注 | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| EXP-7.1 | 一键按需导出项目成果（ZIP包，包含所有激活版本）。 | P2 | 最终交付功能。 | R6 |


--- (476-476 lines) ---
          * **B.1: 项目控制栏 (Project Control Bar):** 位于顶部。显示项目名称、状态、全局操作（如“导出项目”）。


--- (768-771 lines) ---
| 层级 | 类型 | 呈现方式 | 模态性 | 组件示例 | 用途场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L1** | 内联反馈 (Inline) | 文本、图标、输入框样式 | 非阻塞 | `FormHelperText`, Icon | 表单验证错误、字段级状态。 |
| **L2** | 轻量通知 (Toast) | 短暂出现的通知框 | 非阻塞，自动消失 | `Sonner` Toast | 操作成功确认（“保存成功”）；非关键错误。 |


--- (867-869 lines) ---
**[A] 项目控制栏 (Project Control Bar):**
*   左侧：面包屑导航 (Projects / {Project Name})，项目状态 `Badge`。
*   右侧：按钮 "Export Project"。


--- (1579-1584 lines) ---
**[A] 项目控制栏 (Project Control Bar)**

  * 布局：`flex justify-between items-center p-4 border-b border-border`. 高度固定。
  * 背景：`bg-card` (比全局背景稍亮，构建层级)。
  * **[A.1] 左侧：上下文信息:** 面包屑和项目状态 `<Badge>`.
  * **[A.2] 右侧：全局操作:** 按钮 "Export Project".
