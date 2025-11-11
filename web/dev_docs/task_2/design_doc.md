--- (199-214 lines) ---
#### 1.3.3 前沿美学基调 (Aesthetic Principles)

平台的美学风格定义为 **“精密未来主义 (Precision Futurism)”**。它融合了数学的精确逻辑、AI 的尖端科技感和专业工具的实用主义。

1.  **数学的精确之美 (Mathematical Precision):**
    *   **秩序与网格。** 布局基于严谨的网格系统，强调对齐、平衡和秩序感。线条清晰锐利，拒绝冗余装饰。
    *   **清晰的层级。** 通过字体排版（Typography）、对比度和空间关系建立清晰的信息层级。

2.  **未来感与科技感 (Futuristic and Technological):**
    *   **深色优先 (Dark Mode First)。** 默认采用深色主题（利用 `next-themes`），营造沉浸、专注的实验室氛围，同时减少视觉疲劳。色彩方案应体现科技感（如深空灰、科技蓝）。
    *   **微妙的光影与质感。** 运用微妙的阴影、渐变和动态光效（参考 `Magic UI` 组件，如 `BorderBeam`, `ShineBorder`）来构建空间感和未来感，但必须保持克制，服务于功能。

3.  **高密度与可读性 (High Density and Readability):**
    *   **字体选择至关重要。** 选择在屏幕上显示清晰的现代无衬线字体（如 `Geist`）。
    *   **语义化色彩。** 色彩的使用应高度克制且富有目的性。主色用于强调关键操作，语义色彩用于传达状态。



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



--- (1018-1133 lines) ---
## 阶段 4：视觉语言、美学与动效系统 (Phase 4: Visual Language, Aesthetics & Motion System)

本文档定义了 O-Award 建模平台的设计系统基础，包括视觉语言、美学规范和动效系统。该系统基于“精密未来主义 (Precision Futurism)”的美学基调（1.3.3），旨在提供专业、高效且富有科技感的体验。所有规范都以 Design Tokens 的形式结构化，确保与 `Tailwind CSS`, `Shadcn/ui` 和 `Framer Motion` 的无缝集成。

### 4.1.1 色彩系统与主题策略 (Color System and Theming Strategy)

#### 4.1.1.1 主题策略 (Theming Strategy)

1.  **深色优先 (Dark Mode First):** 平台默认采用深色模式，以营造沉浸式的专业环境，减少视觉疲劳，并强化科技感。浅色模式作为备选提供。
2.  **实现机制:** 利用 `next-themes` 进行主题切换。所有颜色必须定义为 CSS 变量，并遵循 `Shadcn/ui` 的 HSL 格式约定。主题切换通过在 `<html>` 标签上切换 `class="dark"` 来实现。
3.  **无障碍性 (Accessibility):** 所有前景文本与背景色的组合必须满足 WCAG AA 级的对比度要求。

#### 4.1.1.2 色板定义 (Color Palette)

色板设计强调克制、科技感和清晰的语义。

  * **主色 (Primary): 精密蓝 (Precision Blue).** 冷静、精确，用于关键操作和激活状态。
  * **中性色 (Neutrals): 冷灰 (Cool Gray).** 带有轻微蓝色倾向的灰色阶，用于构建界面结构和背景。
  * **语义色彩 (Semantic Colors):** 用于传达系统状态（成功 Green、警告 Amber、错误 Red）。

#### 4.1.1.3 Design Tokens 与 CSS 变量定义

以下定义了语义化的 Design Tokens 及其对应的 CSS 变量（HSL 值）。这些变量将直接应用于 `globals.css` 中。

```css
/* globals.css */
@layer base {
  :root { /* Light Mode Definitions */
    /* 基础层 (Foundation) */
    --background: 0 0% 100%;          /* White */
    --foreground: 220 10% 10%;        /* Near Black */

    /* 容器与浮层 (Containers & Overlays) */
    --card: 0 0% 100%;
    --card-foreground: 220 10% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 220 10% 10%;

    /* 主色 (Primary - Precision Blue) */
    --primary: 215 90% 50%;           /* Bright Blue */
    --primary-foreground: 0 0% 100%;

    /* 次要色 (Secondary) */
    --secondary: 220 5% 90%;          /* Light Gray */
    --secondary-foreground: 220 10% 15%;

    /* 辅助与强调 (Muted & Accent) */
    --muted: 220 5% 96%;              /* Very Light Gray */
    --muted-foreground: 220 5% 45%;   /* Medium Gray Text */
    --accent: 220 5% 96%;
    --accent-foreground: 220 10% 15%;

    /* 危险色 (Destructive) */
    --destructive: 0 85% 60%;         /* Red */
    --destructive-foreground: 0 0% 100%;

    /* 实用工具 (Utilities) */
    --border: 220 5% 85%;             /* Border color */
    --input: 220 5% 85%;              /* Input border color */
    --ring: 215 90% 50%;              /* Focus ring color (Primary) */

    /* 基础圆角 (Base Radius - See 4.1.4.2) */
    --radius: 0.375rem; /* 6px (Radius-MD) */

    /* 扩展语义色 (Extended Semantic Colors) */
    --warning: 40 100% 50%;
    --warning-foreground: 0 0% 10%;
    --success: 140 70% 45%;
    --success-foreground: 0 0% 100%;
  }

  .dark { /* Dark Mode Definitions (Default) */
    /* 基础层 (Foundation) */
    --background: 220 10% 7%;         /* Deep Blue-Black */
    --foreground: 0 0% 98%;           /* Off White */

    /* 容器与浮层 (Containers & Overlays) */
    /* 卡片比背景稍亮，构建层级感 */
    --card: 220 10% 10%;              /* Charcoal */
    --card-foreground: 0 0% 98%;
    --popover: 220 10% 10%;
    --popover-foreground: 0 0% 98%;

    /* 主色 (Primary - Precision Blue) */
    /* 深色模式下稍微提亮以保持活力 */
    --primary: 210 90% 60%;           /* Lighter Blue */
    --primary-foreground: 220 10% 5%; /* Dark text for contrast */

    /* 次要色 (Secondary) */
    --secondary: 220 10% 20%;         /* Medium Gray */
    --secondary-foreground: 0 0% 98%;

    /* 辅助与强调 (Muted & Accent) */
    --muted: 220 10% 12%;
    --muted-foreground: 220 5% 65%;   /* Light Gray Text */
    --accent: 220 10% 15%;
    --accent-foreground: 0 0% 98%;

    /* 危险色 (Destructive) */
    --destructive: 0 65% 50%;         /* Darker Red */
    --destructive-foreground: 0 0% 98%;

    /* 实用工具 (Utilities) */
    --border: 220 10% 20%;
    --input: 220 10% 25%;
    --ring: 210 90% 60%;

    /* 扩展语义色 (Extended Semantic Colors) */
    --warning: 45 100% 60%;
    --warning-foreground: 0 0% 5%;
    --success: 150 70% 50%;
    --success-foreground: 0 0% 5%;
  }
}
```



--- (1136-1173 lines) ---
### 4.1.2 字体系统与排版规则 (Typography System and Rules)

#### 4.1.2.1 字体选择与加载 (Font Selection and Loading)

选择现代、高可读性的字体家族，支持“精密未来主义”美学。

**1. 主字体 (Primary Typeface): Geist Sans**

  * **选择理由:** 专为现代界面设计，风格简洁、几何感强，具有出色的屏幕可读性。
  * **实现:** 使用 `next/font` 加载 Vercel Geist Font。

**2. 等宽字体 (Monospaced Typeface): Geist Mono**

  * **选择理由:** 与 Geist Sans 完美协调，用于代码块和数据对齐。

**3. 数学公式字体 (Math Typeface): KaTeX Default (Computer Modern)**

  * **选择理由:** LaTeX 排版的标准字体，提供最佳的数学符号支持。

**Token 化结构 (Tailwind CSS 配置):**

```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // Token: font-sans
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
        // Token: font-mono
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
      },
    },
  },
}
```


--- (1248-1282 lines) ---
### 4.1.4 视觉质感定义 (Visual Texture Definition - Shadow, Radius, Effects)

#### 4.1.4.1 空间与层级 (Shadow and Elevation)

定义阴影系统以构建界面的深度和层级关系。

**高程策略:**

  * **Light Mode (阴影主导):** 使用柔和、清晰的阴影来表示层级。
  * **Dark Mode (亮度与边框主导):** 避免使用强烈的阴影。层级主要通过背景亮度的细微差异（参考 4.1.1）和微妙的边框 (`--border`) 来体现。

**阴影 Tokens (Tailwind Shadows):**

| Token/Utility | 用途 | 描述 |
| :--- | :--- | :--- |
| `shadow-sm` | 悬停状态，低层级元素（如按钮）。 | 非常微妙的短距离阴影。 |
| `shadow-md` | 中层级元素（卡片默认状态）。 | 清晰但柔和的阴影。 |
| `shadow-lg` | 高层级元素（下拉菜单、Tooltip）。 | 较高的高程，表示元素浮动在界面之上。 |
| `shadow-xl` | 最高层级（模态框 `Dialog`）。 | 显著的高程，表示焦点所在的核心交互层。 |

#### 4.1.4.2 形状与边界 (Radius)

倾向于使用更小、更锐利的圆角，以体现精确感和秩序感，避免过度圆润。

**圆角 Tokens (Tailwind Border Radius):**

| Token/Utility | Size (px/rem) | 应用场景 |
| :--- | :--- | :--- |
| `rounded-sm` | 2px / 0.125rem | 极小元素（如 `Badge`, Checkbox）。 |
| `rounded` | 4px / 0.25rem | 按钮、输入框。 |
| `rounded-md` | 6px / 0.375rem | **（基准）** 卡片、工具提示、下拉菜单。 |
| `rounded-lg` | 8px / 0.5rem | 模态框、大型容器。 |

*注：全局 CSS 变量 `--radius` 应设置为 `0.375rem` (6px) 以应用此基准。*



--- (1303-1327 lines) ---
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



--- (1840-1867 lines) ---
#### 5.3.2 设计系统 (Design System - Phase 4)

所有实现必须严格使用定义的 Design Tokens。

##### 1\. 色彩系统 (4.1.1)

  * **主题策略:** 深色模式优先。使用 CSS 变量实现。（详见 4.1.1.3 的 CSS 定义）。

##### 2\. 字体与排版 (4.1.2)

  * **字体:** Geist Sans (主字体), Geist Mono (等宽)。
  * **排版等级:** H1-H4, Body M (16px Base), Body S (14px UI)。（详见 4.1.2.2）。

##### 3\. 空间系统 (4.1.3)

  * **基线单位:** 4px。
  * **响应式:** Desktop-First。`lg` (1024px) 为最小推荐尺寸。

##### 4\. 视觉质感 (4.1.4)

  * **圆角:** 基准 `--radius: 0.375rem` (6px, `rounded-md`)。
  * **效果:** `Magic UI` (BorderBeam, ShineBorder) 用于动态光效。

##### 5\. 动效系统 (4.2)

  * **原则 (4.2.1):** 快速、精确、受控。
  * **参数 (4.2.2):** 定义了持续时间和缓动曲线 Tokens（TypeScript 实现）。

