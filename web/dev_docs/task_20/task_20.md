
#### 任务 6.2：HITL 模式实现 (SCA, AVL, VARL)

*   **目标：** 实现 SCA、AVL 和 VARL 模式的特定交互界面。
*   **输入：** `<design_doc> (5.1.3.1, 5.1.3.2)`, Magic UI (ShineBorder)。
*   **输出：** `SCAInterface.tsx`, `AVLInterface.tsx`, `VARLInterface.tsx`。
*   **核心关注点：**
    *   **SCA：** 比较分析报告渲染；候选方案选择；选中状态的 `ShineBorder` 效果（Design Doc 5.1.3.1）；提交 `selected_ids`。
    *   **AVL：** 批判列表渲染；裁决控件（Accept/Reject）；状态管理（确保所有项已裁决才能提交）；提交 `adjudication` 数据。
    *   **VARL：** 简单结果展示。
*   **实现策略:**
    1.  实现 `SCAInterface.tsx`，重点关注选中状态管理和 `ShineBorder` 集成。
    2.  实现 `AVLInterface.tsx`，重点关注复杂的裁决状态管理和提交条件。
    3.  实现 `VARLInterface.tsx`。
*   **边界：** 实现所有 HITL 模式界面。
