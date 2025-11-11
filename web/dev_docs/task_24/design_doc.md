--- (215-236 lines) ---
#### 1.3.4 动态视觉语言定位 (Motion Design Strategy)

动效（Motion）在平台中扮演战略性角色，它不仅仅是美学上的修饰，更是传达信息、提升理解力和增强体验的关键工具（主要基于 `Framer Motion` 实现）。

**动效的核心目标：功能性、流畅性、空间感。**

1.  **可视化复杂流程与状态变迁 (Visualize Complex Processes):**
    *   动效应被用于清晰地可视化工作流的执行过程。例如，节点状态的转换应通过流畅的动画来表示，使用户能够直观感知流程的动态。
    *   当工作流结构动态更新时（Generator 节点完成），使用布局动画来平滑地呈现新节点的出现和重新排列，减少突兀感。

2.  **引导注意力与增强空间感 (Guide Attention and Spatial Orientation):**
    *   使用动效来引导用户的视觉焦点到关键事件上（例如，一个节点等待 HITL 批准时）。
    *   通过转场动画来建立不同视图之间的空间关系（例如，从工作流画布“深入”到节点详情视图），帮助用户构建清晰的空间心智模型。

3.  **提供即时反馈与提升响应感 (Provide Immediate Feedback and Enhance Responsiveness):**
    *   微交互（Micro-interactions）应为用户的操作提供即时、细腻的反馈，使界面感觉更加灵敏和生动。

**动效原则:**
*   **功能性优先:** 动效必须服务于明确的功能目标。
*   **快速且精确:** 动效应迅速、干脆，符合平台高效、专业的调性。持续时间应尽可能短，但保证流畅性。
*   **性能与可访问性:** 动效必须高性能，并尊重用户的系统设置（如 `prefers-reduced-motion`）。



--- (731-738 lines) ---
| 状态 | 图标 (Lucide Icon) | 颜色 (Semantic Color) | 动画与效果 |
| :--- | :--- | :--- | :--- |
| **Not Started** | `Circle` (虚线) | 中性灰 (Gray) | 无。若未解锁，显示为置灰状态。 |
| **Executing** | `Loader` (旋转) | 主色 (Blue/Primary) | 旋转动画。节点边缘可应用微妙的动态光效（`Magic UI BorderBeam`）。 |
| **Awaiting HITL Approval** | `UserCheck` 或 `Hand` | 警告色 (Yellow/Amber) | 微妙的脉动效果或闪烁，以吸引用户注意。 |
| **Completed** | `CheckCircle` (实心) | 成功色 (Green) | 状态变化时有平滑的转场动画。 |
| **Failed** | `XCircle` (实心) | 错误色 (Red) | 醒目，静态。 |



--- (1303-1353 lines) ---
### 4.2.1 动效原则与编排 (Motion Principles and Choreography)

动效系统旨在将复杂的工作流管理转化为直观、流畅的交互过程，提升用户对系统的理解力和掌控感。

#### 4.2.1.1 动效哲学与目标 (Motion Philosophy and Goals)

**哲学：动效服务于功能 (Motion Serves Function).**

动效绝非装饰，而是传达信息和增强交互的工具。

**核心目标:**

1.  **可视化复杂性:** 清晰地展现状态变迁、数据流动和工作流结构的动态变化。
2.  **引导注意力:** 在关键时刻将用户的焦点引导到需要操作的区域。
3.  **建立空间模型:** 通过转场动画帮助用户在复杂的界面中保持方向感。
4.  **提升响应感:** 提供即时、流畅的反馈，使界面感觉更加灵敏和高效。

#### 4.2.1.2 物理模型与调性 (Physical Model and Tone)

**调性：快速、精确、受控 (Fast, Precise, Controlled).**

  * **速度 (Speed):** 动效应迅速完成，以匹配专家用户的操作速度。界面不应让用户等待动画。
  * **精确性 (Precision):** 运动轨迹清晰、直接。**避免**使用弹跳 (Bounce) 或过度拉伸 (Overshoot) 效果。
  * **受控性 (Control):** 运动应精确地开始和停止，体现出工程化的质感。

#### 4.2.1.3 编排原则 (Choreography Principles)

  * **技术基础:** `Framer Motion`。

**1. 布局动画 (Layout Animations)**

  * 当元素的位置或尺寸发生变化时（例如，展开/折叠面板，工作流结构更新），使用 `Framer Motion` 的 `layout` 属性实现平滑的过渡，保持上下文的连贯性。

**2. 进入与退出 (Enter and Exit)**

  * 使用 `<AnimatePresence>` 管理。
  * 元素出现时，使用淡入 (Fade In) 结合轻微的缩放 (Scale) 或位移 (Translate)。进入动画通常比退出动画稍慢。

**3. 时序与交错 (Timing and Staggering)**

  * 当多个元素同时出现时（如列表加载、新节点生成），使用交错动画 (Staggering) 来引导视线，使加载过程更自然有序。

**4. 状态可视化 (State Visualization)**

  * 节点状态的变化应通过颜色、图标和动态效果的组合动画来平滑过渡。

#### 4.2.1.4 性能与可访问性 (Performance and Accessibility)

  * **性能优先:** 优先使用 GPU 加速的 CSS 属性（Transform, Opacity）。
  * **尊重用户偏好:** 必须检测并响应 `prefers-reduced-motion` 设置。当开启时，复杂的动效应被替换为简单的淡入淡出或无动画。



--- (1356-1423 lines) ---
### 4.2.2 动效参数定义 (Motion Parameters - Easing and Duration Tokens)

#### 4.2.2.1 持续时间 (Duration)

定义一套标准化的持续时间等级。

| Token Name | Duration (s) | 应用场景描述 |
| :--- | :--- | :--- |
| `duration.micro` | 0.1s (100ms) | 极快的微交互（按钮点击反馈、开关切换）。 |
| `duration.fast` | 0.2s (200ms) | **（标准）** 默认交互时间。元素淡入淡出、下拉菜单展开。 |
| `duration.medium` | 0.3s (300ms) | 复杂转场：侧边栏滑入、模态框出现。 |
| `duration.slow` | 0.5s (500ms) | 复杂的编排动画或布局变化（如工作流布局重排）。 |

#### 4.2.2.2 缓动曲线 (Easing Curves)

定义一套标准化的缓动曲线（cubic-bezier 参数）。

| Token Name | Cubic Bezier | 描述与应用场景 |
| :--- | :--- | :--- |
| `easing.standard` | `[0.4, 0, 0.2, 1]` | **（标准曲线 Ease-in-out）** 平衡、响应迅速。适用于大多数通用场景。 |
| `easing.decelerate`| `[0, 0, 0.2, 1]` | **（减速曲线 Ease-out）** 快速启动，平滑停止。用于元素进入屏幕。 |
| `easing.accelerate`| `[0.4, 0, 1, 1]` | **（加速曲线 Ease-in）** 缓慢启动，快速结束。用于元素离开屏幕。 |
| `easing.sharp` | `[0.6, 0.05, 0.1, 0.95]`| **（锐利曲线）** 强调动效的开始和结束，用于需要高度精确感的场景。 |

#### 4.2.2.3 Token 化结构 (Tokenization)

动效参数定义为 TypeScript 常量，供 `Framer Motion` 直接消费。

```typescript
// src/styles/motion-tokens.ts

export const MotionDurations = {
  micro: 0.1,
  fast: 0.2,
  medium: 0.3,
  slow: 0.5,
};

export const MotionEasings = {
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  sharp: [0.6, 0.05, 0.1, 0.95],
};

// 预设的 Framer Motion Transition 对象
export const Transitions = {
  standard: {
    duration: MotionDurations.fast,
    ease: MotionEasings.standard,
  },
  enter: {
    duration: MotionDurations.medium,
    ease: MotionEasings.decelerate,
  },
  exit: {
    duration: MotionDurations.fast,
    ease: MotionEasings.accelerate,
  },
  layout: {
    // 使用 tween 处理布局动画，更精确
    type: "tween",
    duration: MotionDurations.medium,
    ease: MotionEasings.sharp,
  }
};
```



--- (1472-1477 lines) ---
  * **状态可视化 (关键):** 必须严格遵循 3.1.2.1 的规范。
      * **`Executing`:**
          * 状态图标动画化（旋转 `Loader`）。
          * **（核心效果）** 应用 `Magic UI BorderBeam` 动态光环效果于卡片边缘。颜色使用 `--primary`，速度适中（例如 `duration={5}`）。
      * **`Awaiting HITL`:** 使用 Warning 色彩，图标可能有微妙脉动效果。
      * **`Stale`:** 显示醒目的警告图标。


--- (1642-1662 lines) ---
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



--- (1740-1821 lines) ---
### 5.2 复杂动效与转场规范详述 (Complex Motion and Transition Specifications)

本节提供了关键场景中复杂动画和转场效果的精确定义和参数化逻辑。所有实现均基于 `Framer Motion`，并引用 4.2.2 中定义的动效 Tokens。

#### 5.2.1 场景一：工作流执行过程的可视化

**目标:** 清晰、动态地可视化节点状态的变化。

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

-----

#### 5.2.2 场景二：工作流结构的动态更新（Generator 节点）

**目标:** 当工作流结构变化时，提供平滑、可理解的视觉过渡。

**编排逻辑:**

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

-----

#### 5.2.3 场景三：HITL 交互反馈循环

**目标:** 提供流畅的反馈，清晰地传达 HITL 循环的状态。

**1. 提交反馈并等待重新执行**

  * **触发条件:** 用户点击“Reject & Modify”并提交。
  * **编排:**
    1.  **[即时反馈]** 提交按钮显示加载状态。
    2.  **[转场] 内容区域切换:** HITL 界面平滑过渡到“执行中”状态视图。
    <!-- end list -->
      * **实现:** 使用 `<AnimatePresence mode="wait">` 包裹内容区域。
      * **效果:** HITL 界面淡出，执行中视图淡入。
      * **参数:** `Transitions.standard`.

**2. 新结果呈现**

  * **编排:** 与上述过程相反。“执行中”视图淡出，新的 HITL 界面淡入。

-----

#### 5.2.4 场景四：工作区内的上下文切换

**1. 切换焦点节点 (Switching Focused Node)**

  * **触发条件:** 用户点击画布上的另一个节点。
  * **效果:** 检查器面板内容快速切换。
      * **实现:** 使用 `<AnimatePresence mode="wait">` 包裹检查器面板的内容区，以 `selectedNodeId` 作为 `key`。
      * **参数:** 使用 `duration.fast` (0.2s)。`Transitions.standard`.

**2. 展开/折叠检查器面板**

  * **实现:** 使用 `Framer Motion` 的 `layout` 动画处理宽度变化。
  * **效果:** 面板平滑地滑入或滑出屏幕右侧。画布区域同时平滑地调整宽度。
  * **参数:** `Transitions.layout`.

-----


--- (1897-1915 lines) ---

##### 1\. 全局交互模式 (3.1.1)

  * 定义了工作流导航（回溯）、HITL 流程、版本切换和人工编辑的标准交互流程。

##### 2\. 系统反馈与状态管理逻辑 (3.1.2)

  * **节点状态可视化规范。**
  * **陈旧性 (Staleness) 提示规范:** 非侵入式提示（画布图标+检查器 Alert）。

##### 3\. 复杂动效与转场规范 (5.2)

定义了关键场景的动画编排和参数（基于 `Framer Motion`）。

  * **场景一：工作流执行可视化:** 节点状态转换动画。
  * **场景二：动态结构更新:** 布局动画 + 新节点交错进入动画。
  * **场景三：HITL 反馈循环:** 内容区域平滑转场。
  * **场景四：上下文切换:** 检查器面板内容快速切换动画。

