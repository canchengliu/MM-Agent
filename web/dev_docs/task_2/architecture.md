--- (25-25 lines) ---
| **样式与主题** | Tailwind CSS, `next-themes`, CSS Variables | 实现“精确未来主义”美学。 |


--- (30-30 lines) ---
| **动画与效果** | Framer Motion, Magic UI | 功能动画、过渡和视觉效果。 |


--- (117-120 lines) ---
├── /styles/                     # 全局样式和设计令牌
│   ├── globals.css              # Tailwind 设置和 CSS 变量 (4.1.1.3)
│   ├── motion-tokens.ts         # Framer Motion 参数 (4.2.2.3)
│


--- (205-205 lines) ---
    theme: 'dark', // 默认深色模式 (Design Doc 4.1.1)


--- (853-872 lines) ---
### 6\. 样式和设计系统实现

#### 6.1 主题和令牌

“精确未来主义”的实现（Design Doc 4.1）。

  * **`styles/globals.css`：** 定义 Design Doc 4.1.1.3 中指定的亮色和深色模式的 CSS 变量。
  * **`tailwind.config.js`：** 将这些变量映射到 Tailwind 工具类。配置 Geist 字体 (4.1.2.1) 和基本圆角半径 (6px, 4.1.4.2)。
  * **`next-themes`：** 在根布局中配置 `defaultTheme="dark"`。

#### 6.2 动态系统 (Framer Motion)

功能动态设计的实现（Design Doc 4.2）。

  * **`styles/motion-tokens.ts`：** 持续时间和缓动函数的集中式常量 (4.2.2.3)。
  * **用法：**
      * `InspectorPanel` 中的 `AnimatePresence`，用于在选择节点时平滑内容切换 (5.2.4)。
      * `WorkflowCanvas` 中的 `layout` 动画，用于结构更新时平滑重新定位 (5.2.2)。
      * 动态出现新节点时的交错动画。

