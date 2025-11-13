<design_doc>
--- (200-223 lines) ---
#### 1.3.5 美学原则与视觉方向 (Aesthetic Principles and Visual Direction)

平台的美学风格定义为：**精密未来主义 (Precision Futurism)**。它融合了专业工具的严谨性与前沿科技的未来感。

**整体调性:** 专业、精密、克制、专注、深邃、前沿。

1.  **精密与秩序 (Precision and Order):**
    *   通过锐利的线条、清晰的对齐、精密的网格系统和完美的排版来实现。界面元素应传达出一种经过精心计算的秩序感。

2.  **克制且功能性的色彩 (Restrained and Functional Color):**
    *   优先采用深色模式 (Dark Mode)，营造沉浸感并减少视觉疲劳。
    *   主色调应是深邃的中性色。色彩运用应克制，主要用于传达语义信息（状态、层级、高亮）。引入具有科技感的强调色用于关键引导。

3.  **数据可视化与清晰度 (Data Visualization and Clarity):**
    *   字体选择必须保证在复杂数据、图表和代码展示中的极致清晰度和易读性。采用现代、简洁的字体（如 Geist 或 Inter）和高质量的等宽字体（如 Geist Mono 或 Fira Code）。
    *   复杂数据和公式 (LaTeX) 的渲染必须清晰、美观。

4.  **质感与深度 (Texture and Depth):**
    *   通过微妙的阴影、材质感（如背景噪点、微光效果）和精细的图标设计，构建界面的空间深度和精密仪器的质感，同时保持界面的轻盈感。

5.  **极致流畅性与动效 (Extreme Fluidity and Motion):**
    *   动效不是装饰，而是传达信息和提升体验的关键工具。动效应是高性能、精确且富有物理感的（利用 Framer Motion）。
    *   动效必须快速、干脆，体现出系统的响应速度和专业品质。用于增强交互的流畅感、传达状态变化，而非装饰。



--- (338-362 lines) ---
#### 2.2.1 全局应用结构与路由 (Global Application Structure and Routing)

应用采用基于 Next.js App Router 的结构化路由。

  * **[Root Layout]** (全局容器，包含全局页眉和认证检查)
      * **/auth** (认证模块): /login, /register, /verify-email, /reset-password.
      * **/(app)** (主应用模块，需要认证)
          * **/projects** (项目管理，应用主入口/仪表板)
              * / (项目列表仪表板)
              * **/{project\_id}** (项目详情)
                  * /config (配置页面：上传文件、设置类型)
                  * **/workflow** (工作流执行界面 - 核心交互区)
          * **/settings** (用户设置中心): /profile, /preferences, /engine.

#### 2.2.2 全局导航模型 (Global Navigation Model)

全局导航位于应用的**顶部页眉 (Global Header)**，提供对核心模块的快速访问。

  * **Global Header Structure:**
      * [Logo/Home Link]
      * [Main Navigation Links]: (Projects, Settings)
      * 
      * [Global Actions]: (e.g., New Project)
      * [User Menu]: (Avatar, Settings, Logout)



--- (560-565 lines) ---
2.  **代码与结构化数据查看器 (Code and Data Viewer):**

      * **应用场景：** 展示 `Execution Artifacts`（Prompt, generated\_code.py, JSON 数据）。
      * **实现：** 推荐使用 `Monaco Editor` 的只读模式，以提供最佳的性能、语法高亮、代码折叠和搜索功能。备选方案为 `react-syntax-highlighter`。
      * **要求：** 使用高质量等宽字体（如 Geist Mono）。提供“复制到剪贴板”和“下载”快捷操作。



--- (601-606 lines) ---
  * **模式：View-to-Edit Transition**
      * **触发：** 用户在 `Completed` 节点点击 [Manual Edit]。
      * **切换：** Center Workspace 的 `Generated Output` 区块原位切换为编辑器。根据内容类型选择 `Novel/Tiptap`（富文本/Markdown）或 `Monaco Editor`（代码）。
      * **控制：** Workspace 工具栏按钮变更为 [Cancel Edit] 和 [Save New Version]。
      * **保存：** 点击 [Save New Version] 后，弹出模态框要求输入“版本摘要 (Summary)”。保存成功后，UI 切换回 Review Mode，显示新版本。



--- (887-1357 lines) ---
## 阶段 4：视觉语言、美学与动效系统 (Phase 4: Visual Language, Aesthetics & Motion System)

本文档详细定义了 O-Award 建模平台的视觉语言、设计系统 Token 集、美学实现细节和动效系统。它旨在将“精密未来主义 (Precision Futurism)”的体验愿景转化为一套精确、可操作的设计规范，指导前端工程师使用 Tailwind CSS, Shadcn/ui, Framer Motion 和 Geist Fonts 等技术栈，构建出专业、高效且具有前沿美学的用户界面。

-----

### 4.1 视觉语言核心 (Visual Language Core - Design Tokens)

本节定义了构成平台视觉语言的核心设计 Token。所有 Token 均通过 CSS 自定义属性 (Custom Properties) 实现，以支持动态主题切换。

#### 4.1.1 色彩系统与主题策略 (Color System and Theming Strategy)

##### A. 设计哲学与策略 (Philosophy and Strategy)

  * **深色优先 (Dark Mode First):** 平台默认为深色模式，以满足专家用户对沉浸感和长时间使用的需求。
  * **克制与功能性 (Restrained and Functional):** 色彩运用极度克制。主色调采用深邃的中性色 (Slate)，色彩主要用于传达语义信息和层级关系。
  * **精密感 (Precision):** 引入具有未来科技感的强调色（赛博蓝 Cyber Blue）用于引导和状态指示。
  * **实现机制:** 采用 CSS Variables 实现主题切换，与 `next-themes` 和 Shadcn/ui 的标准实践保持一致。使用 HSL 格式定义色彩。

##### B. 语义化 Token 与主题定义 (Semantic Tokens and Theming)

以下定义了应用于 `globals.css` 中的 CSS 变量，遵循 Shadcn/ui 的约定。

```css
/* globals.css */

:root {
  /* 浅色模式 (Light Mode - Secondary) */
  --background: 0 0% 100%;        /* Pure White */
  --foreground: 222.2 84% 4.9%;   /* Slate-950 (Near Black) */

  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  /* Primary (Cyber Blue) */
  --primary: 221.2 83.2% 53.3%;    /* Blue-600 */
  --primary-foreground: 210 40% 98%;

  /* Secondary (Cool Gray) */
  --secondary: 210 40% 96.1%;      /* Slate-100 */
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%; /* Slate-500 */

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  /* Destructive (Red) */
  --destructive: 0 84.2% 60.2%;    /* Red-500 */
  --destructive-foreground: 210 40% 98%;

  /* Borders and Inputs */
  --border: 214.3 31.8% 91.4%;     /* Slate-200 */
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;

  /* UI Radius (See 4.1.4) */
  --radius: 0.5rem; /* 8px - Base radius */
}

.dark {
  /* 深色模式 (Dark Mode - Primary/Default) */
  /* 背景使用深邃的蓝黑色，营造精密感 */
  --background: 222.2 84% 4.9%;    /* Deep Blue-Black (Slate 950) */
  --foreground: 210 40% 98%;       /* Near White (Slate 50) */

  /* Card/Panel background - 略高于背景色 */
  --card: 222.2 47.4% 11.2%; /* Slate-900 */
  --card-foreground: 210 40% 98%;

  --popover: 222.2 47.4% 11.2%;
  --popover-foreground: 210 40% 98%;

  /* Primary (Cyber Blue) - 在深色下更明亮 */
  --primary: 217.2 91.2% 59.8%;    /* Blue-500 */
  --primary-foreground: 222.2 47.4% 11.2%; /* Dark text for contrast */

  /* Secondary */
  --secondary: 217.2 32.6% 17.5%;  /* Slate-800 */
  --secondary-foreground: 210 40% 98%;

  /* Muted */
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%; /* Slate-400 */

  /* Accent */
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  /* Destructive */
  --destructive: 0 62.8% 30.6%;    /* Darker Red */
  --destructive-foreground: 210 40% 98%;

  /* Border & Input - 在深色下保持清晰但不过于刺眼 */
  --border: 217.2 32.6% 17.5%;     /* Slate-800 */
  --input: 217.2 32.6% 17.5%;
  --ring: 217.2 91.2% 59.8%;
}
```

##### D. 语义化状态色彩规范 (Semantic Status Colors)

用于传达工作流状态。这些颜色扩展到 Tailwind 配置中，以提供专用的工具类（例如 `text-status-completed`）。

```javascript
// tailwind.config.js (theme.extend.colors)
status: {
  // Completed (Green/Emerald)
  completed: {
    DEFAULT: 'hsl(142.1 76.2% 36.3%)', // Emerald-600
    foreground: 'hsl(145.1 100% 98%)',
  },
  // Executing (Cyan) - 具有科技感和动感
  executing: {
    DEFAULT: 'hsl(186.2 95.2% 40.3%)', // Cyan-600
    foreground: 'hsl(186.2 100% 98%)',
  },
  // Awaiting HITL / Stale (Amber) - 需要注意和行动
  awaiting: {
    DEFAULT: 'hsl(45.9 95.2% 50.3%)', // Amber-500
    foreground: 'hsl(45.9 95.2% 10%)', // Dark foreground for contrast
  },
  // Failed (Red) - Uses --destructive by default, but can be referenced here if needed.
  failed: {
     DEFAULT: 'hsl(var(--destructive))',
     foreground: 'hsl(var(--destructive-foreground))',
  },
  // Canceled (Orange)
  canceled: {
    DEFAULT: 'hsl(24.6 95.2% 53.3%)', // Orange-500
    foreground: 'hsl(24.6 100% 98%)',
  },
},
```

-----

#### 4.1.2 字体系统与排版规则 (Typography System and Rules)

##### A. 设计哲学 (Philosophy)

排版的目标是在高信息密度下实现极致的清晰度和完美的秩序感。

##### B. 字体选择与加载 (Font Selection and Loading)

我们选择 **Geist** 字体家族（由 Vercel 设计）。它简洁、现代且具有极高的可读性。

1.  **主界面字体 (UI Font):** `Geist Sans`
2.  **等宽字体 (Monospaced Font):** `Geist Mono`（用于代码编辑器、日志查看器）。

**实现 (Next.js):** 使用 `geist` 包加载字体变量。

```typescript
// lib/fonts.ts
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

// Export the font objects directly if using the 'geist' package approach
export const fontSans = GeistSans;
export const fontMono = GeistMono;
```

```tsx
// app/layout.tsx
import { fontSans, fontMono } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          // Apply CSS variables for Tailwind integration
          fontSans.variable,
          fontMono.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
```

```javascript
// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
      },
      // ...
    },
  },
};
```

##### C. 排版规则与字阶 (Typographic Scale and Rules)

采用一套紧凑的字阶。我们区分 UI 控件字体大小和主体内容字体大小。

| Role | Tailwind Class | Size (px/rem) | Line Height | Weight | 应用场景 (Usage) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Caption | `text-xs` | 12px (0.75rem) | 16px (1rem) | Regular (400) | 辅助说明、元数据、时间戳。 |
| **UI Default** | **`text-sm`** | **14px (0.875rem)**| **20px (1.25rem)**| **Regular (400)** | **按钮、输入框、列表、导航、核心 UI。** |
| Body Text | `text-base` | 16px (1rem) | 24px (1.5rem) | Regular (400) | 主体内容阅读（Markdown 渲染）。 |
| Subtitle | `text-lg` | 18px (1.125rem)| 28px (1.75rem)| Medium (500) | 区块标题、副标题。 |
| H3 | `text-xl` | 20px (1.25rem)| 28px (1.75rem)| SemiBold (600)| 三级标题。 |
| H2 | `text-2xl` | 24px (1.5rem) | 32px (2rem) | Bold (700) | 二级标题、页面标题。 |
| H1 | `text-3xl` | 30px (1.875rem)| 36px (2.25rem)| Bold (700) | 核心大标题。 |
| Code/Log | `text-sm font-mono`| 14px (0.875rem)| 20px (1.25rem)| Regular (400) | 代码编辑器、日志查看器。 |

##### D. 富文本排版规范 (Prose/Markdown Typography)

使用 `@tailwindcss/typography` (`prose` class) 渲染 Markdown 内容。需要对其默认样式进行定制，以提高信息密度。

```javascript
// tailwind.config.js (Customizing Typography Plugin)
module.exports = {
  // ...
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            // 提高信息密度：减小默认的段落和标题边距
            p: { marginTop: theme('spacing.3'), marginBottom: theme('spacing.3') },
            h1: { marginTop: theme('spacing.6'), marginBottom: theme('spacing.4') },
            h2: { marginTop: theme('spacing.5'), marginBottom: theme('spacing.3') },
            // ... (customize other elements as needed)

            // 代码块样式定制
            'pre': {
              // 使用比 card 更深的背景（例如 background），增强对比
              backgroundColor: theme('colors.background'),
              fontFamily: theme('fontFamily.mono'),
            },
            'code': {
              fontFamily: theme('fontFamily.mono'),
            },
          },
        },
        // 确保深色模式适配 (使用 prose-invert)
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

// Usage: <div className="prose dark:prose-invert">...</div>
```

-----

#### 4.1.3 空间系统（网格、间距与响应式）(Spatial System - Grid, Spacing, and Responsiveness)

##### A. 空间单位与间距 (Base Unit and Spacing)

  * **基础单位:** 采用 **4px (0.25rem)** 作为最小单位。
  * **实现：** 使用 Tailwind CSS 的默认间距系统（`space-1` = 4px, `space-2` = 8px, `space-4` = 16px 等）。

**应用指南:**

| Usage | Recommended Spacing (Tailwind Classes) |
| :--- | :--- |
| Intra-component (紧密) | `space-1` (4px), `space-2` (8px) |
| Inter-element (标准) | `space-3` (12px), `space-4` (16px) |
| Layout Separation (分隔) | `space-6` (24px), `space-8` (32px) |

##### B. 网格与布局 (Grid and Layout)

1.  **内容网格:** 内容区域内部使用标准的 **12 列 CSS Grid** 布局。
2.  **核心布局 (Cockpit Layout):** 工作流执行界面采用灵活的三栏式结构。
      * **实现技术:** 必须使用 `react-resizable-panels` 库实现。
      * **要求:**
          * 支持拖拽调整 Navigator (A), Workspace (B), History (C) 的宽度。
          * A 和 C 栏必须支持快速折叠/展开。
          * 用户的布局配置必须持久化存储于 `localStorage`（使用 `autoSaveId` 属性）。
          * 设置合理的最小尺寸限制。

<!-- end list -->

```tsx
// Implementation Snippet using react-resizable-panels
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// Example usage in Workflow Layout
<PanelGroup direction="horizontal" autoSaveId="workflow-cockpit-layout">
  <Panel id="navigator" collapsible={true} minSize={15} defaultSize={20}>
    {/* A. Navigator Content */}
  </Panel>
  <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
  <Panel id="workspace" minSize={50}>
    {/* B. Workspace Content */}
  </Panel>
  {/* Conditionally render History Panel based on node state */}
  {isHistoryVisible && (
    <>
      <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
      <Panel id="history" collapsible={true} minSize={15} defaultSize={20}>
        {/* C. History Content */}
      </Panel>
    </>
  )}
</PanelGroup>
```

##### C. 响应式设计 (Responsiveness)

平台采用**桌面优先 (Desktop-First)** 的策略。

  * **主要断点 (Tailwind Default):** `lg` (1024px), `xl` (1280px)。
  * **响应式行为规则:**
      * **\< 1024px (`lg` 以下):** Cockpit Layout 调整。Navigator (A) 和 History (C) 默认折叠或以抽屉形式展现，Workspace (B) 占据主要空间。
      * **\>= 1024px (`lg` 及以上):** 启用标准三栏布局。

-----

#### 4.1.4 视觉质感定义 (Visual Texture Definition - Shadow, Radius, Effects)

##### A. 圆角 (Border Radius)

采用较小的圆角值，保持界面的锐利和现代感。基于 `--radius: 0.5rem` (8px)。

```javascript
// tailwind.config.js (Border Radius)
borderRadius: {
  'none': '0',
  'sm': 'calc(var(--radius) - 4px)', // 4px - Small elements (Badge, Tooltip)
  'md': 'calc(var(--radius) - 2px)', // 6px - Standard (Buttons, Inputs)
  'lg': 'var(--radius)',             // 8px - Large elements (Card, Dialog)
  'xl': 'calc(var(--radius) + 4px)', // 12px
  'full': '9999px',
},
```

##### B. 阴影与深度层级 (Shadows and Elevation)

阴影应精细且针对深色模式优化。我们主要依靠背景色亮度和清晰的边框来区分层级，阴影仅用于浮动元素。

**深度层级指南 (Z-Index Hierarchy):**

| 层级 | Z-Index | 用途 | 阴影应用 (Tailwind Class) |
| :--- | :--- | :--- | :--- |
| L1 | 10 | 内容面板、卡片 (Card, Panel) | `shadow-sm` |
| L2 | 20 | 固定导航、页眉 (Header) | `shadow-md` |
| L4 | 40 | 下拉菜单、提示框 (Dropdown, Tooltip) | `shadow-xl` |
| L5 | 50 | 模态对话框 (Dialog) | `shadow-2xl` |

##### C. 高级视觉效果 (Advanced Visual Effects)

1.  **背景纹理 (Background Texture):**

      * 在深色模式的主背景上，叠加一层极其微弱的**点阵网格 (Dot Grid)** 或微妙的径向渐变，增加视觉深度。
      * **实现:** 使用 CSS 背景图片或 `Magic UI` 的背景组件。

2.  **动态光效 (Dynamic Lighting Effects):**

      * **激活态微光 (Active Glow):** 对于关键的激活状态（如 Primary Button 悬停），添加一层与主色调一致的微弱外发光效果（使用 `box-shadow`）。
      * **动态边框光束 (Border Beam):** 在进行重要异步操作（如节点 `Executing`）时，可以在相关容器边缘使用 `Magic UI` 的 `BorderBeam` 组件，提供具有未来感的加载指示。

-----

### 4.2 动效系统 (Motion System)

动效系统旨在提升交互的流畅性、传达即时状态变化，并增强“精密仪器”的操作感。实现主要基于 **Framer Motion**。

#### 4.2.1 动效原则与编排 (Motion Principles and Choreography)

##### A. 设计原则 (Principles)

1.  **迅捷与响应 (Swift and Responsive):** 动效必须极快（通常在 100ms - 300ms 之间），绝不延迟操作。
2.  **精确与克制 (Precise and Restrained):** 运动应干脆、直接，避免过度夸张的回弹效果。
3.  **信息导向 (Informative):** 动效用于引导注意力、解释状态变化或增强空间模型。

##### B. 动效编排逻辑 (Choreography Logic)

1.  **微交互与反馈 (Micro-interactions):**

      * 按钮点击反馈：使用 Framer Motion `whileTap={{ scale: 0.98 }}` 实现轻微下压感。
      * 悬停状态：快速的颜色或背景变化。

2.  **空间模型与转场 (Spatial Model and Transitions):**

      * **模态框:** 从中心快速放大并淡入。
      * **标签页切换:** 使用 Framer Motion `layoutId` 实现激活指示器（Active Indicator）的平滑滑动动画。

3.  **布局与结构动态更新 (Layout and Dynamic Structure Updates):**

      * **关键场景:** 当 `WORKFLOW_STRUCTURE_UPDATED` 发生时。
      * **实现技术:** 使用 `Framer Motion` 的 Layout Animations 和 `AnimatePresence`。新节点平滑插入，现有节点平滑移动到新位置，帮助用户理解结构变化。

-----

#### 4.2.2 动效参数定义 (Motion Parameters - Easing and Duration Tokens)

定义系统化的动效参数，定义为 TypeScript 常量供 Framer Motion 使用。

##### A. 持续时间 Token (Duration Tokens)

```typescript
// constants/motion.ts

export const Duration = {
  INSTANT: 0.1,  // 100ms: 微交互反馈
  FAST: 0.2,     // 200ms: 小元素过渡 (Tooltip, Dropdown)
  MEDIUM: 0.3,   // 300ms: 标准 UI 过渡 (Modals, Panel opening)
  SLOW: 0.5,     // 500ms: 大型布局动画
};
```

##### B. 运动曲线 Token (Easing Curve Tokens)

```typescript
// constants/motion.ts

export const Easing = {
  // Standard (EaseInOut): 平衡的运动。
  STANDARD: [0.4, 0, 0.2, 1],

  // Enter (EaseOut/Decelerate): 快速开始，平滑减速停止。
  ENTER: [0, 0, 0.2, 1],

  // Exit (EaseIn/Accelerate): 平滑开始，快速结束。
  EXIT: [0.4, 0, 1, 1],
};
```

##### C. Framer Motion 变体配置范例 (Framer Motion Variants Configuration)

```typescript
// constants/motion.ts

export const Variants = {
  // Fade In Up (e.g., list items appearing, HITL results loading)
  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: Duration.MEDIUM, ease: Easing.ENTER }
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: { duration: Duration.FAST, ease: Easing.EXIT }
    },
  },

  // Modal Enter/Exit (Pop effect)
  modalPop: {
    initial: { opacity: 0, scale: 0.96 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: Duration.MEDIUM, ease: Easing.ENTER }
    },
    // ... exit definition
  },
};
```



--- (1727-1773 lines) ---
#### 5.3.2 技术栈与实现约定 (Tech Stack and Implementation Guidelines)

##### A. 核心技术栈

  * **框架:** Next.js (App Router), React, Zustand (State Management).
  * **样式与 UI:** Tailwind CSS, Shadcn/ui (基于 Radix UI), `next-themes`.
  * **动效:** Framer Motion.
  * **专业组件:** Monaco Editor, Novel/Tiptap, `react-resizable-panels`.
  * **字体:** Geist Sans, Geist Mono.

##### B. 实现约定与最佳实践

1.  **主题与样式:** 严格遵守 Design Tokens。使用 CSS Variables 实现主题。默认深色模式。使用 `cn` 工具函数组合类名。
2.  **状态同步范式 (关键):** 严格遵循“REST API 为全量快照（Source of Truth），WebSocket 提供增量更新”的原则（参见 3.1.2.C.1）。实现健壮的断线重连和重连后的全量同步。
3.  **Staleness 处理逻辑:** 监听到 `NODE_ACTIVE_VERSION_CHANGED` 事件后，必须立即重新获取全量工作流状态以更新 `is_stale` 标志。
4.  **动态结构处理:** `WORKFLOW_STRUCTURE_UPDATED` 事件必须触发 Zustand Store 的全量替换。

#### 5.3.3 设计系统 Token 集汇总 (Consolidated Design System Tokens)

*(汇总自阶段 4.1 和 4.2)*

##### A. 色彩系统 (Color System)

  * **核心色板 (Dark Mode):** Background (Slate 950), Card (Slate 900), Border (Slate 800), Foreground (Slate 50), Primary (Cyber Blue 500)。
  * **语义化状态色彩 (Tailwind `status-*`):** Completed (Emerald), Executing (Cyan), Awaiting/Stale (Amber), Failed (Red), Canceled (Orange)。

##### B. 字体系统与排版 (Typography System)

  * **字体家族:** Geist Sans (UI), Geist Mono (Code)。
  * **核心字号:** UI Default `text-sm` (14px)。
  * **富文本:** 使用 `@tailwindcss/typography` (`prose dark:prose-invert`)，应用定制化样式提高密度（4.1.2.D）。

##### C. 空间系统 (Spatial System)

  * **基础单位:** 4px。
  * **布局:** 使用 `react-resizable-panels` 实现 Cockpit Layout，配置需持久化。

##### D. 视觉质感 (Visual Texture)

  * **圆角:** 基于 `--radius: 0.5rem` (8px)。标准圆角 `rounded-md` (6px)。

##### E. 动效参数 (Motion Parameters)

  * **定义于 `constants/motion.ts`。**
  * **Duration:** `INSTANT`(0.1s) 到 `SLOW`(0.5s)。
  * **Easing:** `STANDARD`, `ENTER`, `EXIT`。


</design_doc>

<api>
--- (19-38 lines) ---
### 核心机制：JWT Bearer Token

本系统采用 **JSON Web Tokens (JWT)** 作为身份验证机制。

#### 令牌生命周期 (Token Lifecycle)

1.  **获取 (Acquisition)**: 用户通过 `POST /auth/login` 成功登录后，获得一个 `access_token`。
    *   **令牌类型**: 系统内部使用不同类型的JWT来区分用途（如：访问令牌、邮件验证令牌）。`access_token` 是用于API访问的令牌。
    *   **有效期**: 根据系统配置 (`config.py`)，`access_token` 的有效期为 **7天**。其他类型的令牌（如邮件验证）有其独立的、通常更短的有效期。
2.  **使用 (Usage)**: 在令牌有效期内，前端向所有受保护的 API 端点发起请求时，必须在 HTTP `Authorization` 头中附加此令牌。
    *   **格式**: `Authorization: Bearer <your_access_token>`
3.  **存储 (Storage)**:
    *   **推荐方案 (最高安全性)**: 将令牌存储在 `HttpOnly`、`Secure`、`SameSite=Strict` 的 Cookie 中。这可以有效防止 XSS 攻击窃取令牌，但需要后端配合设置 Cookie。
    *   **备选方案**: 如果后端不便处理 Cookie，可将令牌存储在内存中（例如，JavaScript 变量或状态管理库如 Redux/Pinia）。页面刷新会导致令牌丢失，需要重新登录或从 `sessionStorage` 恢复。**不推荐**使用 `localStorage`，因为它容易受到 XSS 攻击。
4.  **失效与刷新 (Expiration & Refresh)**:
    *   当令牌过期后，API 将返回 `401 Unauthorized` 错误。
    *   **当前系统不包含令牌刷新 (Refresh Token) 机制**。这意味着一旦 `access_token` 过期，用户必须重新进行登录流程。
5.  **登出 (Logout)**:
    *   登出是一个纯粹的**客户端操作**。前端需要从存储中（无论是 Cookie、内存还是 `sessionStorage`）**丢弃/删除**该令牌，然后将用户重定向到登录页面。



--- (40-66 lines) ---

| HTTP 状态码 | 错误类型 | 响应体格式 | 描述与前端处理建议 |
| :--- | :--- | :--- | :--- |
| `401 Unauthorized` | 认证失败 | `{"detail": "..."}` | 令牌无效、过期或未提供。应立即清除本地存储的无效令牌并重定向到登录页。 |
| `403 Forbidden` | 权限不足 | `{"detail": "..."}` | 用户已认证，但无权执行操作（如账户未验证）。应向用户显示具体错误信息。 |
| `409 Conflict` | 业务逻辑冲突 | 自定义JSON | 操作因当前状态无法执行（如邮箱已存在）。应解析`error_code`和`message`向用户展示。 |
| `422 Unprocessable Entity` | 请求数据验证失败 | FastAPI标准错误 | 请求体中的数据不符合模型要求（如邮箱格式错误）。应解析`detail`数组，在表单的对应字段下显示错误信息。 |

**自定义错误 (`409 Conflict`) 示例:**
```json
{
  "error_code": "USER_ALREADY_EXISTS",
  "message": "User with email 'test@example.com' already exists."
}
```
**验证错误 (`422 Unprocessable Entity`) 示例:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```


--- (70-85 lines) ---
### 1. 用户登录

#### 1.1. 登录并获取访问令牌

*   **Endpoint**: `POST /auth/login`
*   **描述**:
    *   使用用户的电子邮件和密码进行验证。
    *   成功后返回一个 JWT `access_token`，该令牌用于后续所有需要认证的 API 请求。
    *   **[重要变化]** 只有**已激活**且**已验证**的账户才能成功登录。如果账户未通过邮件验证，将返回 `403 Forbidden` 错误。

##### 请求格式
此端点遵循 OAuth2 规范，需要使用 `application/x-www-form-urlencoded` 格式提交数据。

*   `username` (string, **required**): 用户的注册**电子邮件地址**。
*   `password` (string, **required**): 用户的明文密码。



--- (87-110 lines) ---
```javascript
const formData = new URLSearchParams();
formData.append('username', 'user@example.com');
formData.append('password', 'a_strong_password');

fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: formData,
})
.then(response => response.json())
.then(data => {
  if (data.access_token) {
    // 登录成功
    console.log('Access Token:', data.access_token);
    // 在此处存储 token 并重定向
  } else {
    // 处理登录失败
    console.error('Login failed:', data);
  }
});
```


--- (131-140 lines) ---
#### 2.1. 创建新用户账户

*   **Endpoint**: `POST /auth/register`
*   **描述**: 注册一个新用户。成功后，用户的 `is_verified` 状态为 `false`，系统会**自动发送一封验证邮件**到注册邮箱。用户必须点击邮件中的链接（或使用其中的令牌）来激活账户。

##### 请求体 (`application/json`)
*   `email` (EmailStr, **required**): 用户的电子邮件地址。
*   `password` (string, **required**): 用户密码。**验证规则**: 仅检查长度**不小于8个字符**。建议前端在提交前进行客户端验证。
*   `display_name` (string, *optional*): 用户的显示名称。



--- (264-275 lines) ---
#### 4.2. UserRead

表示用户的公开信息，用于注册成功后或查询用户信息时返回。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 用户的唯一标识符。 |
| `email` | string (Email) | 用户的注册电子邮件地址。 |
| `display_name` | string \| null | 用户的显示名称。 |
| `is_active` | boolean | 账户是否被激活。 |
| `is_verified` | boolean | 账户的电子邮件地址是否已验证。 |



--- (308-321 lines) ---
### 1. 用户画像 (User Profile)

#### 1.1. 获取当前用户信息

*   **Endpoint**: `GET /users/me`
*   **权限**: 任何已登录、激活且已验证的用户。
*   **描述**: 返回当前认证用户的核心身份信息。

> **前端实现指南:**
> *   **调用时机**: 建议在用户成功登录后立即调用此接口，用于“水合”(hydrate) 应用的全局状态管理库（如 Redux, Pinia, Zustand）中的用户对象。
> *   **用途**:
>     1.  在 UI 中展示用户信息（如导航栏的欢迎语 `Welcome, Ann!`）。
>     2.  客户端可以根据 `is_active` 和 `is_verified` 状态来决定是否允许用户访问应用的核心功能区。



--- (367-398 lines) ---
### 2. 用户设置 (User Settings)

#### 2.1. 获取当前用户设置

*   **Endpoint**: `GET /users/me/settings`
*   **权限**: 任何已登录、激活且已验证的用户。
*   **描述**: 获取当前用户的全部个性化设置，用于渲染设置页面和应用全局配置。

> **前端实现指南:**
> *   **调用时机**: 当用户导航至“设置”页面时调用此接口，以获取最新数据填充表单。
> *   **UI 逻辑**:
>     *   使用 `theme` 字段来动态切换应用的 CSS 类（例如，在 `<html>` 标签上添加 `class="dark"`）。
>     *   对于 `llm_model_name` 和 `llm_base_url`，如果返回值为 `null`，UI 应显示一个占位符，如“使用系统默认配置”。
>     *   使用 `has_llm_api_key` 和 `has_e2b_api_key` 的布尔值来决定 API 密钥输入框的状态：
>         *   `true`: 显示提示信息“已设置 API 密钥”，输入框可留空表示不更改，或输入新值进行覆盖。
>         *   `false`: 显示常规的输入框，提示用户输入密钥。

##### 成功响应 (`200 OK`)
返回 `UserSettingsRead` 对象。

```jsonc
{
  "language": "en",
  "theme": "dark",
  "hitl_profile": "Experienced",
  "thinking_depth": "Medium",
  "llm_model_name": null, // 用户未自定义，将使用系统默认
  "llm_base_url": null,   // 用户未自定义，将使用系统默认
  "has_llm_api_key": true,
  "has_e2b_api_key": false
}
```


--- (425-438 lines) ---
*   `language` (enum: `"en"`, `"zh"`): 应用界面语言。
*   `theme` (enum: `"light"`, `"dark"`): 应用界面主题。
*   `hitl_profile` (enum): AI 在人机交互（HITL）环节的行为偏好。
    *   `"Novice"`: AI 提供更多引导和解释。
    *   `"Experienced"`: 默认，平衡的交互。
    *   `"Expert"`: AI 交互更简洁，假设用户熟悉流程。
*   `thinking_depth` (enum): 影响 AI 生成内容的复杂度和耗时。
    *   `"Instant"`: 响应更快，可能牺牲一些深度。
    *   `"Medium"`: 性能和质量的平衡点。
    *   `"Heavy"`: 耗时更长，但生成的内容更全面、深入。
*   `llm_model_name` (string | null): 自定义 LLM 模型名称。
*   `llm_base_url` (string | null): 自定义 LLM API 的 Base URL。
*   `llm_api_key` (string | null): 明文 LLM API Key。**发送 `null` 或 `""` 以删除**。
*   `e2b_api_key` (string | null): 明文 E2B (沙箱) API Key。**发送 `null` 或 `""` 以删除**。


--- (483-497 lines) ---
#### 3.2. UserSettingsRead

表示用户的个性化设置信息，用于 `GET /users/me/settings` 和 `PATCH /users/me/settings` 的成功响应。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `language` | string (enum) | 应用界面语言。可选值: `"en"`, `"zh"`。 |
| `theme` | string (enum) | 应用界面主题。可选值: `"light"`, `"dark"`。 |
| `hitl_profile` | string (enum) | AI 在人机交互环节的行为偏好。可选值: `"Novice"`, `"Experienced"`, `"Expert"`。 |
| `thinking_depth`| string (enum) | AI 生成内容的复杂度。可选值: `"Instant"`, `"Medium"`, `"Heavy"`。 |
| `llm_model_name`| string \| null | 用户自定义的 LLM 模型名称。若为 `null`，则使用系统默认模型。 |
| `llm_base_url` | string \| null | 用户自定义的 LLM API Base URL。若为 `null`，则使用系统默认 URL。 |
| `has_llm_api_key` | boolean | 指示用户是否已设置 LLM API 密钥。**绝不**返回密钥本身。 |
| `has_e2b_api_key` | boolean | 指示用户是否已设置 E2B (沙箱) API 密钥。**绝不**返回密钥本身。 |



--- (511-515 lines) ---
*   **项目生命周期 (Project Lifecycle)**:
    1.  **`Configuring` (配置中)**: 项目的初始状态。在此阶段，用户可以上传文件、修改项目元数据、并从历史案例库中初始化数据。
    2.  **`Running` (运行中)**: 当用户启动工作流后，项目进入此状态。此状态下，项目的主要配置（如名称、描述）仍可修改，但工作流已激活并开始执行。
    3.  **`Completed` (已完成)**: 当项目内的工作流执行完毕后，项目进入此最终状态。
*   **文件角色 (File Role)**: 上传到项目的文件必须被赋予一个明确的角色（如 `Problem Description`, `Dataset`），以便工作流中的节点能够准确地消费它们。


--- (818-818 lines) ---
| `status` | string (enum) | 项目的当前生命周期状态。可选值: `"Configuring"`, `"Running"`, `"Completed"`。 |


--- (855-855 lines) ---
| `status` | string (enum) | 节点的当前执行状态。可选值: `"Not Started"`, `"Executing"`, `"Awaiting HITL Approval"`, `"Completed"`, `"Failed"`, `"Canceled"`。**[新增]** `Canceled` 状态表示执行被用户取消。 |


--- (1551-1581 lines) ---
#### 5.2. NodeVersionRead

表示一个已固化的节点版本。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `id` | integer | 版本的唯一标识符。 |
| `version_number`| integer | 版本号，在单个节点内递增。 |
| `node_instance_id` | integer | 所属节点实例的 ID。 |
| `summary` | string | 对此版本创建原因的简短总结 (例如, "Manually edited...")。 |
| `source` | string (enum) | 版本的来源。可选值: `"AI_GENERATED"`, `"MANUALLY_EDITED"`。 |
| `based_on_version_id` | integer \| null | 此版本所基于的前一个版本的 ID。 |
| `output_data` | object \| null | 节点执行后，经过 HITL 处理的最终输出数据。 |
| `raw_generated_output`| object \| null | AI 或执行引擎生成的原始、未经处理的输出数据。 |
| **`execution_artifacts`** | **object \| null** | **[新增]** 包含了执行此版本时产生的关键产物，用于数据溯源。可能包含：`prompt` (发送给LLM的提示), `generated_code.py` (生成的代码), `execution.log` (代码执行日志)等。 |
| `input_dependencies` | object | 一个映射 `{[upstream_node_id]: [consumed_version_id]}`，记录了执行时使用的上游依赖版本。 |
| `hitl_history` | array (object) | 包含了从创建到批准此版本的所有人机交互记录。 |
| `llm_model_name`| string | 执行此版本时使用的 LLM 模型名称。 |
| `temperature` | number (float) | 执行此版本时使用的 LLM 温度参数。 |

#### 5.3. TemporaryExecutionRead

表示节点在 `Executing` 或 `Awaiting HITL Approval` 状态下的临时结果。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `output_data` | object \| null | AI 或执行引擎生成的当前临时输出。 |
| **`execution_artifacts`** | **object \| null** | **[新增]** 在当前执行周期内产生的关键产物。结构与 `NodeVersionRead` 中的 `execution_artifacts` 类似。 |
| `accumulated_hitl_interactions` | array (object) | 在当前执行周期内累积的人机交互记录。 |
| `error_log` | string \| null | 如果执行失败，这里会包含详细的错误信息和堆栈跟踪。 |



--- (1842-1855 lines) ---
#### **`GET /system/info`**

获取应用版本和静态配置信息。

*   **描述**:
    *   返回关于当前部署的后端应用的静态元数据。这些信息在应用启动时确定，运行时不会改变。

*   **最佳实践与使用场景**:
    *   **一次调用，长期缓存**: 前端应用应在**首次加载时调用此接口一次**，然后将结果保存在内存或本地存储中，供整个会话期间使用。这可以减少不必要的网络请求。
    *   **UI展示**:
        *   在应用的“关于”页面或页脚显示 `app_version`。
        *   在用户提交支持请求或反馈时，可以自动附上 `app_version`，便于问题定位。
    *   **配置驱动的UI**: `llm_model_name` 可以在用户设置界面作为默认模型的提示信息。



--- (1907-1919 lines) ---
### 4. 核心响应模型定义 (Core Response Model Definitions)

本节详细定义了系统与基础设施模块中使用的核心数据对象。

#### 4.1. SystemInfo

`GET /system/info` 返回的应用元数据对象。

| 字段 (Field) | 类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `app_version`| string | 后端应用的版本号。 |
| `llm_model_name` | string | 系统配置中指定的默认 LLM 模型名称。 |



--- (1931-1938 lines) ---
*   **4.1. 节点状态:**
    *   `未开始 (Not Started)`
    *   `执行中 (Executing)`
    *   `等待HITL批准 (Awaiting HITL Approval)`
    *   `已完成 (Completed)`
    *   `执行失败 (Failed)`
    *   `已取消 (Canceled)`: 节点的执行被人为请求中止。


</api>

<front_stack>
--- (3-17 lines) ---
本文档详细梳理了 Deer-Flow 项目前端所使用的全部技术、框架、库和工具，旨在提供一份全面而精确的技术参考。该项目是一个功能丰富的现代化 Web 应用，构建于 Next.js App Router 之上，并采用了业界领先的技术实践。

### 一、 核心框架与构建

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **React** | 项目的核心 UI 库，所有组件都基于 React 构建。 |
| **Next.js** | 应用框架，提供了服务器端渲染 (SSR)、静态站点生成 (SSG)、基于 `app` 目录的文件系统路由、API 路由以及其他现代化 Web 开发功能。 |
| | ↳ **App Router** | 项目采用最新的 App Router 架构，支持 React Server Components (RSC) 和客户端组件。 |
| | ↳ **React Server Components (RSC)** | 在服务端直接执行组件逻辑，如 `app/chat/components/site-header.tsx` 中的 `StarCounter` 组件，它在服务端 `fetch` 数据并渲染，提升了性能和安全性。 |
| | ↳ **`next/dynamic`** | 用于动态导入（懒加载）组件，如 `app/chat/page.tsx` 中对 `Main` 组件的使用，配合 `React.Suspense` 优化了初始页面加载速度。 |
| | ↳ **`next/script`** | 用于控制第三方脚本的加载策略，如在 `app/layout.tsx` 中通过 `strategy="beforeInteractive"` 注入修复 `markdown-it` 问题的脚本。 |
| | ↳ **`next/headers`** | 用于在服务器端组件中访问请求头，如 `src/i18n.ts` 中使用 `cookies()` 函数读取 Cookie 以实现服务端国际化。 |
| **Turbopack** | 在 `app/layout.tsx` 的注释中被提及，表明项目可能使用 Turbopack 作为其高性能的开发服务器和构建工具，以加速开发流程。 |



--- (18-25 lines) ---
### 二、 状态管理

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |



--- (32-44 lines) ---
### 四、 样式与主题

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Tailwind CSS** | 原子化的 CSS 框架，用于构建整个项目的用户界面样式。 |
| **`@tailwindcss/typography`** | Tailwind CSS 的官方插件 (`prose` 类)，用于美化由 Markdown 或富文本编辑器生成的文本块样式。 |
| **`tailwindcss-animate`** | 为 Tailwind CSS 提供了便捷的动画类库。 |
| **next-themes** | 用于实现浅色/深色模式的主题切换功能。 |
| **class-variance-authority (cva)** | 用于创建可组合的、带变体的 UI 组件样式，广泛应用于 `components/ui` 目录。 |
| **tailwind-merge** | 用于智能合并 Tailwind CSS 类名，优雅地解决样式冲突问题。 |
| **clsx** | 一个小巧的工具库，用于根据条件动态地组合 CSS 类名。 |
| **Next.js Font (`next/font`)** | 用于本地化和优化 Web 字体，项目中使用了 `Geist` 字体。 |



--- (45-62 lines) ---
### 五、 UI 组件库与视觉效果

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |
| **Radix UI** | 作为 Shadcn/ui 的底层无头（Headless）组件库，提供了所有核心的交互逻辑和可访问性功能。 |
| **Framer Motion** | 用于实现复杂的声明式动画，如页面元素的进入/退出动画、列表项动画和交互动效。 |
| **Sonner** | 用于显示轻量级的 Toast 通知（消息提示）。 |
| **Magic UI (自定义组件集)** | 项目中 `components/magicui` 目录下的一系列高度定制化的视觉特效组件。 |
| | ↳ `AuroraText` | 极光渐变色文本效果。 |
| | ↳ `BentoGrid` | Bento 风格的网格布局组件。 |
| | ↳ `BorderBeam` | 环绕容器边缘的动态光束动画。 |
| | ↳ `FlickeringGrid` | 随机闪烁的背景网格效果。 |
| | ↳ `NumberTicker` | 数字滚动动画效果。 |
| | ↳ `ShineBorder` | 环绕容器边缘的闪亮边框动画。 |
| **cmdk** | 用于构建命令面板（Command Palette）的组件，在富文本编辑器中用于实现斜杠命令。 |
| **Tippy.js** | 用于在富文本编辑器中创建 `@mention` 功能的浮动提示框 (Tooltip/Popover)。 |



--- (63-82 lines) ---
### 六、 富文本编辑器与 Markdown (Novel/Tiptap 生态)

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **Novel** | 基于 Tiptap 构建的所见即所得（WYSIWYG）富文本编辑器，用于报告编辑功能。 |
| **Tiptap** | 作为 Novel 的核心，是一个无头（Headless）、可扩展的富文本编辑器框架。 |
| **ProseMirror** | Tiptap 底层的核心工具库，提供了编辑器状态管理、视图和事务模型。 |
| **tiptap-markdown** | Tiptap 的扩展，用于在 Markdown 和 Tiptap 的 JSON 格式之间进行双向转换。 |
| **Tiptap 扩展集** | 使用了一系列扩展来增强编辑器功能，包括 `StarterKit`, `Placeholder`, `Link`, `Image`, `TaskList`, `Table`, `CodeBlockLowlight`, `TextStyle`, `Color`, `Highlight`, `Mathematics` 等。 |
| **`MathematicsWithMarkdown`** | 在 `components/editor/math-serializer.ts` 中自定义的 Tiptap 扩展，增强了对 KaTeX 数学公式的 Markdown 序列化支持。 |
| **React Markdown** | 用于在非编辑区域（如聊天消息）安全地渲染 Markdown 内容。 |
| **Remark / Rehype** | Markdown AST (抽象语法树) 生态系统，用于处理和转换 Markdown。 |
| | ↳ `remark-gfm` | 支持 GitHub Flavored Markdown (表格、删除线等)。 |
| | ↳ `remark-math` | 支持 Markdown 中的数学公式语法。 |
| | ↳ `rehype-katex` | 将数学公式 AST 渲染为 HTML。 |
| | ↳ **`unist-util-visit`** | 用于遍历和操作 AST 的核心工具，是编写自定义 Rehype 插件的基础。 |
| **KaTeX** | 用于在 Web 上高性能地排版和渲染数学公式。 |
| **react-syntax-highlighter** | 用于在 `research-activities-block` 中对 Python 代码进行语法高亮。 |
| **lowlight / highlight.js** | 作为 `CodeBlockLowlight` 扩展和 `react-syntax-highlighter` 的底层引擎，提供代码语法高亮能力。 |



--- (97-102 lines) ---
### 九、 数据可视化

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **React Flow (`@xyflow/react`)** | 用于构建和渲染基于节点的图表，在项目中用于在落地页（Landing Page）上展示多智能体架构的可视化流程图。 |



--- (119-119 lines) ---
| **@t3-oss/env-nextjs** | 用于在 `src/env.js` 中校验和强制类型化 Next.js 项目的环境变量，确保应用的健壮性。 |


--- (138-150 lines) ---
项目在 Shadcn/ui 的基础上构建了丰富且高度可复用的应用层组件，集中体现于 `app/chat/components/` 目录。

| 组件/模式 | 描述与复用价值 |
| :--- | :--- |
| **`InputBox`** | 一个功能完备的聊天输入框组件。它封装了：<br>- **富文本输入**: 基于 Tiptap/Novel，支持 `@mention` 等功能。<br>- **异步操作**: 内置“增强提示” (`Enhance Prompt`) 功能，包含加载和动画状态。<br>- **状态同步**: 通过 `useRef` 和 `useImperativeHandle` 暴露 `submit`, `setContent` 等方法，供父组件调用。<br>- **动态 UI**: 使用 `AnimatePresence` 展示用户反馈提示，并带有精美的动画效果。 |
| **`MessageListView` & `MessageListItem`** | 实现了经典的聊天消息列表渲染模式。<br>- **关注点分离**: `MessageListView` 负责列表滚动和布局，`MessageListItem` 则根据消息类型 (`user`, `planner`, `researcher` 等) 委托给不同的子组件 (`MessageBubble`, `PlanCard`, `ResearchCard`) 渲染，代码结构清晰。<br>- **进入动画**: 使用 `framer-motion` 的 `motion.li` 为每条新消息添加入场动画，提升用户体验。 |
| **`ThoughtBlock`** (内嵌于 `MessageListView`) | 一个可折叠的“深度思考”区块。其设计亮点在于：<br>- **流式内容处理**: 能够区分并分别渲染**已完成的静态内容**和**正在流式传输的新内容**，为流式文本提供了更丰富的视觉表现力。<br>- **自动行为**: 当主要内容出现后，会自动折叠，减少信息干扰。 |
| **`ResearchActivitiesBlock`** | 研究活动流的展示组件。它展示了如何渲染一个包含多种异构项（如网页搜索、代码执行、文件读取）的动态列表。每种活动类型都由一个专门的子组件处理（`WebSearchToolCall`, `PythonToolCall` 等），是处理复杂动态内容的绝佳范例。同时，它还包含了**性能优化**实践，如仅对前 N 个列表项应用动画。 |
| **`ResearchBlock`** | 一个集成了标签页 (`Tabs`) 的复合视图组件。它允许用户在“研究报告”和“活动流”之间切换，同时在组件顶部提供了上下文相关的操作按钮（如编辑、复制、下载），是构建复杂信息面板的优秀参考。 |
| **`ConversationStarter`** | 在聊天窗口为空时展示的欢迎界面和问题建议。它通过绝对定位和 `z-index` 叠加在 `InputBox` 上方，展示了如何构建非侵入式的引导用户界面。 |
| **`Link` (自定义)** | 位于 `components/deer-flow/link.tsx`，这是一个增强版的 `<a>` 标签。它会查询 Zustand store 中的工具调用历史，判断一个链接是否在之前的搜索结果中出现过。如果未出现，则会显示一个“链接不可靠”的警告图标。这是一个**将 UI 组件与业务状态深度结合**的创新实践。 |
| **`ScrollContainer`** | 对 Shadcn `ScrollArea` 的封装，集成了 `use-stick-to-bottom` Hook，并添加了上下边缘的渐变阴影效果，简化了创建需自动触底的滚动区域的开发工作。 |



--- (151-162 lines) ---
#### 2. 核心业务逻辑与状态管理模式

项目基于 Zustand 构建了清晰、高效的状态管理架构，核心代码位于 `core/store/`。

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **状态与设置分离** | `store.ts` 负责管理**会话相关的动态状态**（如消息、响应状态），而 `settings-store.ts` 负责管理**用户配置**。这种分离使得状态管理更加清晰，易于维护。 |
| **`sendMessage` 异步流程编排** | 这个核心函数是整个聊天功能的驱动器。它展示了：<br>1. **乐观更新**: 立即将用户消息追加到状态中。<br>2. **流式处理**: 调用 `chatStream` 并通过 `for await...of` 循环处理 SSE 事件。<br>3. **批量更新**: 使用 `setTimeout` 和 `Map` 对来自流的多个消息更新事件进行批处理，减少 React 的重渲染次数，提升性能。<br>4. **错误处理**: 使用 `try...finally` 确保无论成功与否，`responding` 状态都能被正确重置。 |
| **`mergeMessage` 纯函数** | 位于 `core/messages/merge-message.ts`，这是一个独立的、无副作用的函数，负责根据收到的 SSE 事件更新单个消息对象的状态。这种模式将状态变更的复杂逻辑从主流程中剥离，使其易于测试和维护，是 Reducer 模式的体现。 |
| **派生状态选择器 (Selectors)** | 项目定义了多个自定义 Hook (`useMessage`, `useRenderableMessageIds`, `useLastInterruptMessage`) 来从 store 中派生和选择数据。它们结合 `useShallow` 进行性能优化，封装了获取特定状态的逻辑，避免了组件内的重复计算。`useRenderableMessageIds` 尤其巧妙，它预先过滤出需要在 UI 中渲染的消息，从根源上解决了 React 列表渲染时的 `key` 值警告问题。 |
| **LocalStorage 持久化** | `settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数提供了一个简洁明了的模式，用于将 Zustand store 的状态与 `localStorage` 同步，实现了用户设置的持久化。 |



--- (163-171 lines) ---
#### 3. API 通信与数据处理模式

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **模拟流式响应 (`chatReplayStream`)** | `core/api/chat.ts` 中的 `chatReplayStream` 函数是一个极具价值的工具。它能够读取静态文本文件，并**模拟**一个实时的 SSE 流，甚至可以控制快进。这对于开发、调试、演示和编写测试用例都非常有用。 |
| **健壮的 JSON 解析 (`parseJSON`)** | 位于 `core/utils/json.ts`，这个工具函数使用 `best-effort-json-parser` 并结合自定义逻辑来处理来自 LLM 的、可能不完全合规的 JSON 字符串（例如，后面跟着多余的文本）。这对于与大语言模型交互的应用来说至关重要。 |
| **Markdown 预处理** | `core/utils/markdown.ts` 提供了一系列用于清理和规范化 Markdown 文本的函数，特别是 `normalizeMathForEditor` 和 `unescapeLatexInMath`，它们解决了在富文本编辑器中正确处理 LaTeX 数学公式的痛点。 |
| **统一的 API URL 解析** | `core/api/resolve-service-url.ts` 中的 `resolveServiceURL` 函数确保了所有对后端服务的请求都通过一个统一的函数来构建 URL，便于管理和切换 API 基地址。 |



--- (179-185 lines) ---
#### 5. 环境与配置管理

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **类型安全的环境变量** | `src/env.js` 使用 `@t3-oss/env-nextjs` 将环境变量分为 `server` 和 `client` 两部分，并使用 Zod 进行校验和类型定义。`runtimeEnv` 则负责将 `process.env` 的值安全地映射到这些定义上，同时处理了布尔值等类型的转换。这是一个确保应用配置正确、避免运行时错误的最佳实践。 |
| **运行时配置获取** | `core/api/hooks.ts` 中的 `useConfig` Hook 展示了如何从后端异步获取应用配置（如可用的 LLM 模型）。它包含了**重试逻辑**和**超时机制**，并在失败后回退到默认配置，增强了应用的鲁棒性。 |



--- (187-197 lines) ---
### 十四、 高级动画与视觉效果模式

项目巧妙地结合了多种动画技术，以创造流畅且引人入胜的用户体验。这些模式具有高度的可移植性。

| 模式/技术 | 描述与复用价值 |
| :--- | :--- |
| **`Framer Motion` 列表与状态动画** | **列表交错动画**: 在 `conversation-starter.tsx` 和 `message-list-view.tsx` 中，通过在 `motion.li` 的 `transition` prop 中设置 `delay: index * 0.1`，实现了新项目依次入场的精美效果。这是一个可直接应用于任何动态列表的模式。<br>**条件渲染动画**: `input-box.tsx` 使用 `<AnimatePresence>` 组件来包裹根据条件渲染的元素（如用户反馈提示）。这使得元素的出现和消失都带有平滑的动画效果，而不是生硬地切换。 |
| **`Magic UI` 特效组件的集成** | 项目将 `Magic UI` 组件作为独立的、可配置的视觉增强层。例如，`input-box.tsx` 在 "Enhance Prompt" 功能激活时，会动态渲染 `<BorderBeam>` 组件，为组件添加一个临时的、代表"处理中"状态的视觉光环。这展示了如何将视觉特效与组件的内部状态变化相结合。 |
| **纯 CSS 动画与组件** | 项目在 `styles/globals.css` 中定义了复杂的 `@keyframes` 动画，如 `aurora` 和 `spotlight`。这些动画通过独立的组件（如 `aurora-text.tsx`, `ray.tsx`）应用，将动画逻辑与组件结构分离。这种方法性能优异，适用于背景、光效等装饰性动画。 |
| **CSS Modules** | 对于需要特定、隔离样式的组件，如 `loading-animation.tsx`，项目采用了 CSS Modules (`.module.css`)。这确保了动画类名（如 `.bouncing-animation`）的局部作用域，避免了与全局 Tailwind 样式或其它组件样式的冲突。 |



--- (198-208 lines) ---
### 十五、 架构模式与项目组织

项目的目录结构和代码组织方式遵循了现代大型前端应用的**最佳实践**，非常值得借鉴。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **功能切片 (Feature-Sliced) 路由** | `app/` 目录下的结构（如 `app/chat/`, `app/landing/`, `app/settings/`）体现了按功能组织代码的原则。每个功能模块都是一个独立的单元，包含了自身的页面、组件和逻辑，使得项目结构清晰，易于扩展和维护。 |
| **组件分层** | 项目中的 `components/` 目录被清晰地划分为三层：<br>1. **`ui/`**: 基础 UI 组件，源自 Shadcn/ui，是应用的视觉基石。<br>2. **`deer-flow/`**: 应用级的共享组件，如 `Logo`, `Markdown`, `Tooltip` 等。它们封装了通用逻辑，在多个功能模块中复用。<br>3. **`magicui/`**: 高度定制化的视觉特效组件，与业务逻辑解耦，可轻松移植到任何项目中。 |
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |
| **自定义 Hooks 封装** | `hooks/` 目录提供了可复用的 React Hooks，如 `useIntersectionObserver` 和 `useIsMobile`。它们将复杂的浏览器 API 或重复的逻辑封装成简单易用的钩子，简化了组件代码。 |



--- (209-218 lines) ---
### 十六、 样式与主题架构

项目建立了一套强大且灵活的样式与主题系统。

| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **基于 CSS 变量的主题系统** | `styles/globals.css` 中，通过在 `:root` 和 `.dark` 选择器下定义大量的 CSS 自定义属性 (custom properties)，构建了整个应用的主题系统。所有颜色、半径等设计令牌 (design tokens) 都被变量化，使得主题切换（通过 `next-themes`）仅需切换一个顶层 class，浏览器即可高效地重绘。 |
| **Tailwind `@theme` 指令** | 通过 `@theme` 指令，项目将 CSS 变量（如 `--app-background`）与 Tailwind 的配置相结合，创建了语义化的工具类（如 `bg-app`）。这使得在组件中可以直观地使用主题颜色，而无需关心具体的色值。 |
| **`cn` 工具函数** | `lib/utils.ts` 中的 `cn` 函数是整个项目的标准实践。它结合了 `clsx` 和 `tailwind-merge`，解决了在 React 组件中动态、条件性地组合 Tailwind 类名时的所有痛点（如条件判断、样式覆盖冲突），是现代 Tailwind 项目的必备工具。 |



--- (249-249 lines) ---
| **状态更新批处理** | `core/store/store.ts` 中的 `sendMessage` 函数在处理 SSE 流时，并没有在每次收到 `chunk` 时都立即调用 `setState`，而是将待更新的消息放入一个 `pendingUpdates` Map 中，并通过 `setTimeout` 进行批处理。这种“去抖”或“批处理”的模式，将一秒内可能发生的数十次状态更新合并为少数几次，极大地减少了 React 的渲染次数，是流式应用性能优化的关键。 |


--- (278-278 lines) ---
| **Pragmatic Bug Fix** | `app/layout.tsx` 中注入的全局 `window.isSpace` 函数是一个非常务实的解决方案。注释明确指出这是为了修复 `markdown-it` 在 Next.js + Turbopack 环境下的一个特定 bug。这展示了在面对第三方库兼容性问题时，如何通过最小的侵入性“打补丁”来解决问题，而不是等待上游修复。 |

</front_stack>

<deer_flow_frontend_code>
--- (4-63 lines) ---
 - env.js
 - i18n.ts

### env.js Content:

```js
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    AMPLITUDE_API_KEY: z.string().optional(),
    GITHUB_OAUTH_TOKEN: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_URL: z.string().optional(),
    NEXT_PUBLIC_STATIC_WEBSITE_ONLY: z.boolean().optional(),
    NEXT_PUBLIC_MAX_STREAM_BUFFER_SIZE: z.coerce.number().int().positive().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STATIC_WEBSITE_ONLY:
      process.env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY === "true",
    NEXT_PUBLIC_MAX_STREAM_BUFFER_SIZE: process.env.NEXT_PUBLIC_MAX_STREAM_BUFFER_SIZE,
    AMPLITUDE_API_KEY: process.env.AMPLITUDE_API_KEY,
    GITHUB_OAUTH_TOKEN: process.env.GITHUB_OAUTH_TOKEN,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

```


--- (94-173 lines) ---
    ## app
     - layout.tsx

### app/layout.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import { ThemeProviderWrapper } from "~/components/deer-flow/theme-provider-wrapper";
import { env } from "~/env";

import { Toaster } from "../components/deer-flow/toaster";

export const metadata: Metadata = {
  title: "🦌 DeerFlow",
  description:
    "Deep Exploration and Efficient Research, an AI tool that combines language models with specialized tools for research tasks.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  
  return (
    <html lang={locale} className={`${geist.variable}`} suppressHydrationWarning>
      <head>
        {/* Define isSpace function globally to fix markdown-it issues with Next.js + Turbopack
          https://github.com/markdown-it/markdown-it/issues/1082#issuecomment-2749656365 */}
        <Script id="markdown-it-fix" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined' && typeof window.isSpace === 'undefined') {
              window.isSpace = function(code) {
                return code === 0x20 || code === 0x09 || code === 0x0A || code === 0x0B || code === 0x0C || code === 0x0D;
              };
            }
          `}
        </Script>
      </head>
      <body className="bg-app">
        <NextIntlClientProvider messages={messages}>
          <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
          <Toaster />
        </NextIntlClientProvider>
        {
          // NO USER BEHAVIOR TRACKING OR PRIVATE DATA COLLECTION BY DEFAULT
          //
          // When `NEXT_PUBLIC_STATIC_WEBSITE_ONLY` is `true`, the script will be injected
          // into the page only when `AMPLITUDE_API_KEY` is provided in `.env`
        }
        {env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY && env.AMPLITUDE_API_KEY && (
          <>
            <Script src="https://cdn.amplitude.com/script/d2197dd1df3f2959f26295bb0e7e849f.js"></Script>
            <Script id="amplitude-init" strategy="lazyOnload">
              {`window.amplitude.init('${env.AMPLITUDE_API_KEY}', {"fetchRemoteConfig":true,"autocapture":true});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

```


--- (409-427 lines) ---
    ## components
     - theme-provider.tsx

### components/theme-provider.tsx Content:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

```


--- (954-994 lines) ---
### components/deer-flow/rolling-text.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { motion, AnimatePresence } from "framer-motion";

import { cn } from "~/lib/utils";

export function RollingText({
  className,
  children,
}: {
  className?: string;
  children?: string | string[];
}) {
  return (
    <span
      className={cn(
        "relative flex h-[2em] items-center overflow-hidden",
        className,
      )}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          className="absolute w-fit"
          style={{ transition: "all 0.3s ease-in-out" }}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </span>
  );
}

```


--- (1099-1132 lines) ---
### components/deer-flow/theme-provider-wrapper.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { usePathname } from "next/navigation";

import { ThemeProvider } from "~/components/theme-provider";

export function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatPage = pathname?.startsWith("/chat");

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={"dark"}
      enableSystem={isChatPage}
      forcedTheme={isChatPage ? undefined : "dark"}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

```


--- (1134-1205 lines) ---
### components/deer-flow/theme-toggle.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

import { Tooltip } from "./tooltip";

export function ThemeToggle() {
  const { theme = "system", setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip title="Change theme">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span
            className={cn(
              theme === "light" ? "font-bold" : "text-muted-foreground",
            )}
          >
            Light
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span
            className={cn(
              theme === "dark" ? "font-bold" : "text-muted-foreground",
            )}
          >
            Dark
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span
            className={cn(
              theme === "system" ? "font-bold" : "text-muted-foreground",
            )}
          >
            System
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

```


--- (1436-1636 lines) ---
        ## editor
         - extensions.tsx
         - image-upload.ts
         - index.tsx
         - math-serializer.ts
         - slash-command.tsx

### components/editor/extensions.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  AIHighlight,
  CharacterCount,
  CodeBlockLowlight,
  Color,
  CustomKeymap,
  GlobalDragHandle,
  HighlightExtension,
  HorizontalRule,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TextStyle,
  TiptapImage,
  TiptapLink,
  TiptapUnderline,
  Twitter,
  UpdatedImage,
  UploadImagesPlugin,
  Youtube,
} from "novel";
import { Markdown } from "tiptap-markdown";
import { Table } from "@tiptap/extension-table";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { cx } from "class-variance-authority";
import { common, createLowlight } from "lowlight";
import { MathematicsWithMarkdown } from "./math-serializer";

//TODO I am using cx here to get tailwind autocomplete working, idk if someone else can write a regex to just capture the class key in objects
const aiHighlight = AIHighlight;
//You can overwrite the placeholder with your own configuration
const placeholder = Placeholder;
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});

const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
      }),
    ];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
});

const updatedImage = UpdatedImage.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2 "),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex gap-2 items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {},
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {},
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {},
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary"),
    },
  },
  codeBlock: false,
  code: {
    HTMLAttributes: {
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

const codeBlockLowlight = CodeBlockLowlight.configure({
  // configure lowlight: common /  all / use highlightJS in case there is a need to specify certain language grammars only
  // common: covers 37 language grammars which should be good enough in most cases
  lowlight: createLowlight(common),
});

const youtube = Youtube.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
  inline: false,
});

const twitter = Twitter.configure({
  HTMLAttributes: {
    class: cx("not-prose"),
  },
  inline: false,
});

const mathematics = MathematicsWithMarkdown.configure({
  HTMLAttributes: {
    class: cx("text-foreground rounded p-1 hover:bg-accent cursor-pointer"),
  },
  katexOptions: {
    throwOnError: false,
  },
});

const characterCount = CharacterCount.configure();

const table = Table.configure();
const tableRow = TableRow.configure();
const tableCell = TableCell.configure();
const tableHeader = TableHeader.configure();

const markdownExtension = Markdown.configure({
  html: true,
  tightLists: true,
  tightListClass: "tight",
  bulletListMarker: "-",
  linkify: false,
  breaks: false,
  transformPastedText: false,
  transformCopiedText: false,
});

const globalDragHandle = GlobalDragHandle.configure({});

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  updatedImage,
  taskList,
  taskItem,
  table,
  tableRow,
  tableCell,
  tableHeader,
  horizontalRule,
  aiHighlight,
  codeBlockLowlight,
  youtube,
  twitter,
  mathematics,
  characterCount,
  TiptapUnderline,
  markdownExtension,
  HighlightExtension,
  TextStyle,
  Color,
  CustomKeymap,
  globalDragHandle,
];

```


--- (3310-3408 lines) ---
### components/magicui/border-beam.tsx Content:

```tsx
"use client";

import { cn } from "~/lib/utils";
import { motion, type MotionStyle, type Transition } from "motion/react";

interface BorderBeamProps {
  /**
   * The size of the border beam.
   */
  size?: number;
  /**
   * The duration of the border beam.
   */
  duration?: number;
  /**
   * The delay of the border beam.
   */
  delay?: number;
  /**
   * The color of the border beam from.
   */
  colorFrom?: string;
  /**
   * The color of the border beam to.
   */
  colorTo?: string;
  /**
   * The motion transition of the border beam.
   */
  transition?: Transition;
  /**
   * The class name of the border beam.
   */
  className?: string;
  /**
   * The style of the border beam.
   */
  style?: React.CSSProperties;
  /**
   * Whether to reverse the animation direction.
   */
  reverse?: boolean;
  /**
   * The initial offset position (0-100).
   */
  initialOffset?: number;
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
}: BorderBeamProps) => {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] [mask-composite:intersect] [mask-clip:padding-box,border-box]">
      <motion.div
        className={cn(
          "absolute aspect-square",
          "bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent",
          className,
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            ...style,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  );
};

```


--- (3757-5793 lines) ---
        ## ui
         - accordion.tsx
         - badge.tsx
         - button.tsx
         - card.tsx
         - checkbox.tsx
         - collapsible.tsx
         - command.tsx
         - dialog.tsx
         - dropdown-menu.tsx
         - form.tsx
         - input.tsx
         - label.tsx
         - popover.tsx
         - scroll-area.tsx
         - select.tsx
         - separator.tsx
         - sheet.tsx
         - skeleton.tsx
         - slider.tsx
         - switch.tsx
         - tabs.tsx
         - textarea.tsx
         - tooltip.tsx

### components/ui/accordion.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

```

### components/ui/badge.tsx Content:

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

```

### components/ui/button.tsx Content:

```tsx
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        "cursor-pointer active:scale-105",
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };

```

### components/ui/card.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import * as React from "react"

import { cn } from "~/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

```

### components/ui/checkbox.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

```

### components/ui/collapsible.tsx Content:

```tsx
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

```

### components/ui/command.tsx Content:

```tsx
"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "~/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}

```

### components/ui/dialog.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}

```

### components/ui/dropdown-menu.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}

```

### components/ui/form.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "~/lib/utils"
import { Label } from "~/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}

```

### components/ui/input.tsx Content:

```tsx
import * as React from "react"

import { cn } from "~/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }

```

### components/ui/label.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "~/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }

```

### components/ui/popover.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "~/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }

```

### components/ui/scroll-area.tsx Content:

```tsx
"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "~/lib/utils";

function ScrollArea({
  className,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
        // https://github.com/stackblitz-labs/use-stick-to-bottom/issues/15
        ref={ref}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };

```

### components/ui/select.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

```

### components/ui/separator.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "~/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }

```

### components/ui/sheet.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "~/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

```

### components/ui/skeleton.tsx Content:

```tsx
import { cn } from "~/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }

```

### components/ui/slider.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "~/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }

```

### components/ui/switch.tsx Content:

```tsx
"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "~/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

```

### components/ui/tabs.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "~/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

```

### components/ui/textarea.tsx Content:

```tsx
import * as React from "react"

import { cn } from "~/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

```

### components/ui/tooltip.tsx Content:

```tsx
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "~/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

```

            ## icons
             - magic.tsx

### components/ui/icons/magic.tsx Content:

```tsx
export default function Magic({ className }: { className: string }) {
  return (
    <svg
      width="469"
      height="469"
      viewBox="0 0 469 469"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      className={className}
    >
      <title>Magic AI icon</title>

      <path
        d="M237.092 62.3004L266.754 71.4198C267.156 71.5285 267.51 71.765 267.765 72.0934C268.02 72.4218 268.161 72.8243 268.166 73.2399C268.172 73.6555 268.042 74.0616 267.796 74.3967C267.55 74.7318 267.201 74.9777 266.803 75.097L237.141 84.3145C236.84 84.4058 236.566 84.5699 236.344 84.7922C236.121 85.0146 235.957 85.2883 235.866 85.5893L226.747 115.252C226.638 115.653 226.401 116.008 226.073 116.263C225.745 116.517 225.342 116.658 224.926 116.664C224.511 116.669 224.105 116.539 223.77 116.293C223.435 116.047 223.189 115.699 223.069 115.301L213.852 85.6383C213.761 85.3374 213.597 85.0636 213.374 84.8412C213.152 84.6189 212.878 84.4548 212.577 84.3635L182.914 75.2441C182.513 75.1354 182.158 74.8989 181.904 74.5705C181.649 74.2421 181.508 73.8396 181.503 73.424C181.497 73.0084 181.627 72.6023 181.873 72.2672C182.119 71.9321 182.467 71.6863 182.865 71.5669L212.528 62.3494C212.829 62.2582 213.103 62.0941 213.325 61.8717C213.547 61.6494 213.712 61.3756 213.803 61.0747L222.922 31.4121C223.031 31.0109 223.267 30.656 223.596 30.4013C223.924 30.1465 224.327 30.0057 224.742 30.0002C225.158 29.9946 225.564 30.1247 225.899 30.3706C226.234 30.6165 226.48 30.9649 226.599 31.363L235.817 61.0257C235.908 61.3266 236.072 61.6003 236.295 61.8227C236.517 62.0451 236.791 62.2091 237.092 62.3004Z"
        fill="currentColor"
      />
      <path
        d="M155.948 155.848L202.771 168.939C203.449 169.131 204.045 169.539 204.47 170.101C204.895 170.663 205.125 171.348 205.125 172.052C205.125 172.757 204.895 173.442 204.47 174.004C204.045 174.566 203.449 174.974 202.771 175.166L155.899 188.06C155.361 188.209 154.87 188.496 154.475 188.891C154.079 189.286 153.793 189.777 153.644 190.316L140.553 237.138C140.361 237.816 139.953 238.413 139.391 238.838C138.829 239.262 138.144 239.492 137.44 239.492C136.735 239.492 136.05 239.262 135.488 238.838C134.927 238.413 134.519 237.816 134.327 237.138L121.432 190.267C121.283 189.728 120.997 189.237 120.601 188.842C120.206 188.446 119.715 188.16 119.177 188.011L72.3537 174.92C71.676 174.728 71.0795 174.32 70.6547 173.759C70.2299 173.197 70 172.512 70 171.807C70 171.103 70.2299 170.418 70.6547 169.856C71.0795 169.294 71.676 168.886 72.3537 168.694L119.226 155.799C119.764 155.65 120.255 155.364 120.65 154.969C121.046 154.573 121.332 154.082 121.481 153.544L134.572 106.721C134.764 106.043 135.172 105.447 135.734 105.022C136.295 104.597 136.981 104.367 137.685 104.367C138.389 104.367 139.075 104.597 139.637 105.022C140.198 105.447 140.606 106.043 140.798 106.721L153.693 153.593C153.842 154.131 154.128 154.622 154.524 155.018C154.919 155.413 155.41 155.699 155.948 155.848Z"
        fill="currentColor"
      />
      <path
        d="M386.827 289.992C404.33 292.149 403.84 305.828 386.876 307.299C346.623 310.829 298.869 316.271 282.199 360.005C274.844 379.192 269.942 403.2 267.49 432.029C267.427 432.846 267.211 433.626 266.856 434.319C266.501 435.012 266.015 435.602 265.431 436.05C254.988 444.041 251.212 434.186 250.183 425.606C239.2 332.353 214.588 316.909 124.668 306.122C123.892 306.031 123.151 305.767 122.504 305.35C121.857 304.933 121.322 304.375 120.942 303.72C116.399 295.679 119.324 291.038 129.718 289.796C224.688 278.47 236.062 262.83 250.183 169.331C252.177 156.355 257.259 154.083 265.431 162.516C266.51 163.593 267.202 165.099 267.392 166.782C279.257 258.564 293.328 278.617 386.827 289.992Z"
        fill="currentColor"
      />
    </svg>
  );
}

```


--- (5813-5829 lines) ---
### core/api/resolve-service-url.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { env } from "~/env";

export function resolveServiceURL(path: string) {
  let BASE_URL = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/";
  if (!BASE_URL.endsWith("/")) {
    BASE_URL += "/";
  }
  return new URL(path, BASE_URL).toString();
}

```


--- (6169-6300 lines) ---
### core/store/index.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export * from "./settings-store";

```

### core/store/settings-store.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { create } from "zustand";

const SETTINGS_KEY = "deerflow.settings";

const DEFAULT_SETTINGS: SettingsState = {
  general: {
    autoAcceptedPlan: false,
    enableClarification: false,
    maxClarificationRounds: 3,
    enableDeepThinking: false,
    enableBackgroundInvestigation: false,
    maxPlanIterations: 1,
    maxStepNum: 3,
    maxSearchResults: 3,
    reportStyle: "academic",
  },
};

export type SettingsState = {
  general: {
    autoAcceptedPlan: boolean;
    enableClarification: boolean;
    maxClarificationRounds: number;
    enableDeepThinking: boolean;
    enableBackgroundInvestigation: boolean;
    maxPlanIterations: number;
    maxStepNum: number;
    maxSearchResults: number;
    reportStyle: "academic" | "popular_science" | "news" | "social_media" | "strategic_investment";
  };
};

export const useSettingsStore = create<SettingsState>(() => ({
  ...DEFAULT_SETTINGS,
}));

export const useSettings = (key: keyof SettingsState) => {
  return useSettingsStore((state) => state[key]);
};

export const changeSettings = (settings: SettingsState) => {
  useSettingsStore.setState(settings);
};

export const loadSettings = () => {
  if (typeof window === "undefined") {
    return;
  }
  const json = localStorage.getItem(SETTINGS_KEY);
  if (json) {
    const settings = JSON.parse(json);
    for (const key in DEFAULT_SETTINGS.general) {
      if (!(key in settings.general)) {
        settings.general[key as keyof SettingsState["general"]] =
          DEFAULT_SETTINGS.general[key as keyof SettingsState["general"]];
      }
    }

    try {
      useSettingsStore.setState(settings);
    } catch (error) {
      console.error(error);
    }
  }
};

export const saveSettings = () => {
  const latestSettings = useSettingsStore.getState();
  const json = JSON.stringify(latestSettings);
  localStorage.setItem(SETTINGS_KEY, json);
};

export function setReportStyle(
  value: "academic" | "popular_science" | "news" | "social_media" | "strategic_investment",
) {
  useSettingsStore.setState((state) => ({
    general: {
      ...state.general,
      reportStyle: value,
    },
  }));
  saveSettings();
}

export function setEnableDeepThinking(value: boolean) {
  useSettingsStore.setState((state) => ({
    general: {
      ...state.general,
      enableDeepThinking: value,
    },
  }));
  saveSettings();
}

export function setEnableBackgroundInvestigation(value: boolean) {
  useSettingsStore.setState((state) => ({
    general: {
      ...state.general,
      enableBackgroundInvestigation: value,
    },
  }));
  saveSettings();
}

export function setEnableClarification(value: boolean) {
  useSettingsStore.setState((state) => ({
    general: {
      ...state.general,
      enableClarification: value,
    },
  }));
  saveSettings();
}
loadSettings();

```


--- (6793-6806 lines) ---
### lib/utils.ts Content:

```ts
// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```


--- (6812-7036 lines) ---
### styles/globals.css Content:

```css
@import "tailwindcss";
@import "tw-animate-css";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans:
    var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

  --animate-fade-in: fade-in 1s;
  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  --animate-spotlight: spotlight 2s ease 0.75s 1 forwards;
  @keyframes spotlight {
    0% {
      opacity: 0;
      transform: translate(-72%, -62%) scale(0.5);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -40%) scale(1);
    }
  }
}

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-app: var(--app-background);
  --color-brand: var(--brand);
  --animate-aurora: aurora 8s ease-in-out infinite alternate;
  @keyframes aurora {
    0% {
      background-position: 0% 50%;
      transform: rotate(-5deg) scale(0.9);
    }
    25% {
      background-position: 50% 100%;
      transform: rotate(5deg) scale(1.1);
    }
    50% {
      background-position: 100% 50%;
      transform: rotate(-3deg) scale(0.95);
    }
    75% {
      background-position: 50% 0%;
      transform: rotate(3deg) scale(1.05);
    }
    100% {
      background-position: 0% 50%;
      transform: rotate(-5deg) scale(0.9);
    }
  }
  --animate-shine: shine var(--duration) infinite linear;
  @keyframes shine {
    0% {
      background-position: 0% 0%;
    }
    50% {
      background-position: 100% 100%;
    }
    to {
      background-position: 0% 0%;
    }
  }
}

:root {
  --radius: 0.625rem;
  --app-background: #fffaf5;
  --background: oklch(1 0 0);
  --foreground: rgba(0, 0, 0, 0.72);
  --card: oklch(1 0 0);
  --card-foreground: var(--foreground);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  --brand: #007aff;

  --novel-highlight-default: #ffffff;
  --novel-highlight-purple: #f6f3f8;
  --novel-highlight-red: #fdebeb;
  --novel-highlight-yellow: #fbf4a2;
  --novel-highlight-blue: #c1ecf9;
  --novel-highlight-green: #acf79f;
  --novel-highlight-orange: #faebdd;
  --novel-highlight-pink: #faf1f5;
  --novel-highlight-gray: #f1f1ef;
}

.dark {
  --background: oklch(0.145 0 0);
  --app-background: var(--background);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 20%);
  --input: oklch(1 0 0 / 25%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
  --brand: rgb(17, 103, 234);

  --novel-highlight-default: #000000;
  --novel-highlight-purple: #3f2c4b;
  --novel-highlight-red: #5c1a1a;
  --novel-highlight-yellow: #5c4b1a;
  --novel-highlight-blue: #1a3d5c;
  --novel-highlight-green: #1a5c20;
  --novel-highlight-orange: #5c3a1a;
  --novel-highlight-pink: #5c1a3a;
  --novel-highlight-gray: #3a3a3a;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

input,
textarea {
  outline: none;
}

[role="button"],
button {
  cursor: pointer;
}

```


--- (7038-7357 lines) ---
### styles/prosemirror.css Content:

```css
.prose {
  max-width: inherit;
}

.prose.inline-editor * {
  margin: 0;
}

.prose.inline-editor .is-empty {
  display: none;
}

.prose.inline-editor .is-empty.placeholder {
  display: block;
  opacity: 0.65;
  font-size: 14px;
}

.ProseMirror {
  line-height: 1.75;
}

.ProseMirror .is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  height: 0;
}

.ProseMirror p.is-empty::before {
  content: attr(data-placeholder);
  float: left;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  height: 0;
}

.ProseMirror .mention {
  background-color: var(--purple-light);
  border-radius: 0.4rem;
  box-decoration-break: clone;
  color: var(--brand);
  padding: 0.1rem 0.3rem;
}

/* Custom image styles */

.ProseMirror img {
  transition: filter 0.1s ease-in-out;

  &:hover {
    cursor: pointer;
    filter: brightness(90%);
  }

  &.ProseMirror-selectednode {
    outline: 3px solid #5abbf7;
    filter: brightness(90%);
  }
}

.img-placeholder {
  position: relative;

  &:before {
    content: "";
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid var(--novel-stone-200);
    border-top-color: var(--novel-stone-800);
    animation: spinning 0.6s linear infinite;
  }
}

.ProseMirror pre {
  background: #0d0d0d;
  border-radius: 0.5rem;
  color: #fff;
  font-family: "JetBrainsMono", monospace;
  padding: 0.75rem 1rem;

  code {
    background: none;
    color: inherit;
    font-size: 0.8rem;
    padding: 0;
  }

  .hljs-comment,
  .hljs-quote {
    color: #616161;
  }

  .hljs-variable,
  .hljs-template-variable,
  .hljs-attribute,
  .hljs-tag,
  .hljs-name,
  .hljs-regexp,
  .hljs-link,
  .hljs-name,
  .hljs-selector-id,
  .hljs-selector-class {
    color: #f98181;
  }

  .hljs-number,
  .hljs-meta,
  .hljs-built_in,
  .hljs-builtin-name,
  .hljs-literal,
  .hljs-type,
  .hljs-params {
    color: #fbbc88;
  }

  .hljs-string,
  .hljs-symbol,
  .hljs-bullet {
    color: #b9f18d;
  }

  .hljs-title,
  .hljs-section {
    color: #faf594;
  }

  .hljs-keyword,
  .hljs-selector-tag {
    color: #70cff8;
  }

  .hljs-emphasis {
    font-style: italic;
  }

  .hljs-strong {
    font-weight: 700;
  }
}

@keyframes spinning {
  to {
    transform: rotate(360deg);
  }
}

/* Custom TODO list checkboxes – shoutout to this awesome tutorial: https://moderncss.dev/pure-css-custom-checkbox-style/ */

ul[data-type="taskList"] li > label {
  margin-right: 0.2rem;
  user-select: none;
}

@media screen and (max-width: 768px) {
  ul[data-type="taskList"] li > label {
    margin-right: 0.5rem;
  }
}

ul[data-type="taskList"] li > label input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: hsl(var(--background));
  margin: 0;
  cursor: pointer;
  width: 1.2em;
  height: 1.2em;
  position: relative;
  top: 5px;
  border: 2px solid hsl(var(--border));
  margin-right: 0.3rem;
  display: grid;
  place-content: center;

  &:hover {
    background-color: hsl(var(--accent));
  }

  &:active {
    background-color: hsl(var(--accent));
  }

  &::before {
    content: "";
    width: 0.65em;
    height: 0.65em;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em;
    transform-origin: center;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  }

  &:checked::before {
    transform: scale(1);
  }
}

ul[data-type="taskList"] li[data-checked="true"] > div > p {
  color: var(--muted-foreground);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

/* Overwrite tippy-box original max-width */

.tippy-box {
  max-width: 400px !important;
}

.ProseMirror:not(.dragging) .ProseMirror-selectednode {
  outline: none !important;
  background-color: var(--novel-highlight-blue);
  transition: background-color 0.2s;
  box-shadow: none;
}

.drag-handle {
  position: fixed;
  opacity: 1;
  transition: opacity ease-in 0.2s;
  border-radius: 0.25rem;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(0, 0, 0, 0.5)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: calc(0.5em + 0.375rem) calc(0.5em + 0.375rem);
  background-repeat: no-repeat;
  background-position: center;
  width: 1.2rem;
  height: 1.5rem;
  z-index: 50;
  cursor: grab;

  &:hover {
    background-color: var(--novel-stone-100);
    transition: background-color 0.2s;
  }

  &:active {
    background-color: var(--novel-stone-200);
    transition: background-color 0.2s;
    cursor: grabbing;
  }

  &.hide {
    opacity: 0;
    pointer-events: none;
  }

  @media screen and (max-width: 600px) {
    display: none;
    pointer-events: none;
  }
}

.dark .drag-handle {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(255, 255, 255, 0.5)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
}

/* Custom Youtube Video CSS */
iframe {
  border: 8px solid #ffd00027;
  border-radius: 4px;
  min-width: 200px;
  min-height: 200px;
  display: block;
  outline: 0px solid transparent;
}

div[data-youtube-video] > iframe {
  cursor: move;
  aspect-ratio: 16 / 9;
  width: 100%;
}

.ProseMirror-selectednode iframe {
  transition: outline 0.15s;
  outline: 6px solid #fbbf24;
}

@media only screen and (max-width: 480px) {
  div[data-youtube-video] > iframe {
    max-height: 50px;
  }
}

@media only screen and (max-width: 720px) {
  div[data-youtube-video] > iframe {
    max-height: 100px;
  }
}

/* CSS for bold coloring and highlighting issue*/
span[style] > strong {
  color: inherit;
}

mark[style] > strong {
  color: inherit;
}

.prose ol, .prose ul {
  margin-left: 1.2em;
  color: #b0b0b0;
  font-size: 0.98em;
}
.prose ol > li::marker, .prose ul > li::marker {
  color: #b0b0b0;
}

```

</deer_flow_frontend_code>

<architecture>
--- (1-4 lines) ---
## O-Award 建模平台：前端架构设计文档 (Frontend Architecture Design Document)

本文档提供了 O-Award 建模平台前端实现的全面架构设计。该平台旨在实现“专家的思维驾驶舱 (The Expert's Cognitive Cockpit)”体验愿景和“精密未来主义 (Precision Futurism)”美学风格，基于 Deer-Flow 技术栈进行构建和扩展。



--- (27-67 lines) ---
## 2\. 技术栈与选型 (Technology Stack and Rationale)

技术栈基于 Deer-Flow 并进行了必要的扩展。

### 2.1 核心框架与语言

  * **TypeScript**: 主要开发语言，强制类型安全。
  * **React (v18+)**: 核心 UI 库。
  * **Next.js (App Router)**: 应用框架。虽然平台交互密集，主要依赖客户端渲染，但 Next.js 提供了优秀的构建工具链和路由能力。

### 2.2 状态管理与数据流

  * **Zustand**: 全局状态管理。采用切片模式 (Slice Pattern) 组织复杂状态。
  * **React Query (TanStack Query) (推荐引入)**: 用于管理服务器状态缓存、API 请求生命周期和后台同步，与 Zustand 互补。

### 2.3 样式与 UI 组件

  * **Tailwind CSS**: 原子化 CSS 框架，实现设计系统 Token。
  * **Shadcn/ui (基于 Radix UI)**: 基础 UI 组件库，提供可访问性和定制能力。
  * **next-themes + CSS Variables**: 实现主题管理（深色模式优先）。
  * **Geist Fonts (Sans & Mono)**: 指定字体家族。
  * **Lucide Icons**: 主要图标库。

### 2.4 动效与交互

  * **Framer Motion**: 核心动效库。用于微交互、转场和关键的布局动画 (Layout Animations)。
  * **`react-resizable-panels`**: **[关键选型]** 实现三栏式驾驶舱布局，支持面板调整、折叠和持久化。

### 2.5 专业领域组件

  * **Monaco Editor**: **[关键选型]** 用于代码查看、编辑和实时日志展示。提供专业级体验。
  * **Novel (Tiptap/ProseMirror)**: 富文本/Markdown 编辑器，用于人工编辑环节。
  * **`react-markdown` + Remark/Rehype + KaTeX**: 用于渲染 Markdown 和 LaTeX 公式。

### 2.6 通信与工具链

  * **Axios**: HTTP 客户端，用于 REST API 通信，提供拦截器和错误处理能力。
  * **WebSocket API (或 socket.io-client)**: 用于实时通信。
  * **Zod**: 数据结构定义和校验。
  * **React Hook Form**: 表单管理。



--- (70-181 lines) ---
## 3\. 项目结构与模块划分 (Project Structure and Modularity)

采用模块化、职责分离的目录结构。

### 3.1 顶层目录结构 (Top-Level Structure)

```
/src
├── /app/               # Next.js App Router (页面、布局)
├── /components/        # 可复用 UI 组件
├── /constants/         # 全局常量 (Design Tokens, Motion Params, Enums)
├── /core/              # 核心业务逻辑与基础设施 (非 UI)
├── /hooks/             # 通用自定义 Hooks
├── /lib/               # 库集成与工具函数 (e.g., utils.ts, fonts.ts)
├── /styles/            # 全局样式与 CSS 变量
├── /types/             # 全局类型定义
└── env.js              # 环境变量配置 (@t3-oss/env-nextjs)
```

### 3.2 `src/app` 路由结构 (App Router Structure)

使用路由组 `(group)` 组织功能模块。

```
/src/app
├── layout.tsx
├── page.tsx (入口，重定向到 /projects)
│
├── (auth)/             # 认证模块 (Public)
│   ├── login/page.tsx
│   └── register/page.tsx
│
└── (platform)/         # 主应用模块 (Protected)
    ├── layout.tsx      # 平台布局 (Global Header, Auth Check)
    │
    ├── projects/
    │   ├── page.tsx    # 项目列表仪表板
    │   └── [projectId]/
    │       ├── layout.tsx
    │       ├── config/page.tsx      # 项目配置页面
    │       └── workflow/            # 工作流执行界面 (The Cockpit)
    │           ├── page.tsx
    │           └── components/      # Cockpit 核心组件 (详见 3.3.3)
    │
    └── settings/       # 用户设置中心
        └── ...
```

### 3.3 `src/components` 结构 (Component Organization)

组件按复用级别分层。

```
/src/components
├── /ui/                # 基础 UI 组件 (Shadcn/ui)
├── /platform/          # 应用级共享组件
│   ├── layout/         # GlobalHeader, ResizableHandle
│   ├── data-display/   # StatusBadge, StalenessIndicator, Timestamp
│   └── feedback/       # ConfirmationDialog, Toaster
├── /editors/           # 专业编辑器封装
│   ├── MonacoWrapper.tsx
│   ├── CodeViewer.tsx (Monaco Read-only)
│   ├── LogViewer.tsx (Monaco Live Logs)
│   └── RichTextEditor.tsx (Novel/Tiptap)
├── /renderers/         # 内容渲染器
│   └── MarkdownRenderer.tsx (react-markdown + KaTeX)
└── /hitl/              # HITL 交互模式组件
    ├── SCAPanel.tsx
    └── AVLPanel.tsx
```

#### 3.3.3 Cockpit 核心组件结构 (位于 `src/app/projects/[projectId]/workflow/components/`)

```
/workflow/components/
├── CockpitLayout.tsx          # 核心三栏布局实现 (react-resizable-panels)
│
├── Navigator/                 # A. 左侧栏：工作流导航器
│   ├── WorkflowNavigator.tsx
│   ├── WorkflowTree.tsx
│   └── NodeTreeItem.tsx
│
├── Workspace/                 # B. 中心面板：节点交互工作区
│   ├── NodeWorkspace.tsx
│   ├── WorkspaceHeader.tsx (B1)
│   ├── InteractionTranscript.tsx (B2)
│   ├── ActionFooter.tsx (B3)
│   └── blocks/
│       ├── InputsBlock.tsx
│       ├── ArtifactsBlock.tsx
│       └── OutputBlock.tsx
│
└── History/                   # C. 右侧栏：版本历史面板
    ├── VersionHistoryPanel.tsx
    └── VersionCard.tsx
```

### 3.4 `src/core` 结构 (Core Logic)

```
/src/core
├── /api/               # API 服务层
│   ├── client.ts       # Axios 实例配置 (拦截器)
│   ├── auth.service.ts
│   ├── project.service.ts
│   └── workflow.service.ts
├── /websocket/         # WebSocket 管理
│   ├── manager.ts      # 连接管理 (重连、认证)
│   └── dispatcher.ts   # 事件分发到 Zustand
├── /store/             # Zustand 状态管理 (详见第 4 节)
└── /models/            # 数据模型 (TS Interfaces, Zod Schemas)
```


--- (317-328 lines) ---
### 5.1 REST API 客户端 (REST API Client)

#### 5.1.1 Axios 实例配置 (`src/core/api/client.ts`)

配置 Axios 实例，实现全局的认证和错误处理。

1.  **Base URL**: 从环境变量配置。
2.  **请求拦截器**: 自动注入 `Authorization: Bearer <token>`（从 `AuthStore` 获取）。
3.  **响应拦截器**:
      * 全局处理 `401 Unauthorized`（触发登出和重定向）。
      * 处理通用错误码（`403`, `500`），显示全局 Toast。



--- (373-417 lines) ---
## 6\. 核心布局架构：思维驾驶舱 (Core Layout Architecture: The Cockpit)

实现设计文档 3.2.1.C 和 5.1.1 定义的三栏式布局。

### 6.1 布局引擎选型与实现

  * **技术选型**: `react-resizable-panels`。
  * **实现位置**: `src/app/projects/[projectId]/workflow/components/CockpitLayout.tsx`。

### 6.2 布局结构 (Layout Structure)

```tsx
// CockpitLayout.tsx (Conceptual)
<PanelGroup direction="horizontal" autoSaveId="o-award-cockpit-v1">
  {/* A. Navigator */}
  <Panel id="navigator" collapsible={true} minSize={15} className="bg-card">
    <WorkflowNavigator />
  </Panel>
  <CustomResizeHandle />

  {/* B. Workspace */}
  <Panel id="workspace" minSize={50} className="bg-background">
    <NodeWorkspace />
  </Panel>

  {/* C. History (Conditional) */}
  {isHistoryVisible && (
    <>
      <CustomResizeHandle />
      <Panel id="history" collapsible={true} minSize={15} className="bg-card">
        <VersionHistoryPanel />
      </Panel>
    </>
  )}
</PanelGroup>
```

### 6.3 关键实现要求

1.  **全屏高度**: `PanelGroup` 需占满视口高度（减去 Global Header）。
2.  **持久化**: 必须启用 `autoSaveId`，将用户布局偏好存储在 `localStorage`。
3.  **可折叠性**: A 和 C 栏必须支持快速折叠/展开。
4.  **动态可见性 (Panel C)**: `isHistoryVisible` 的逻辑由 `WorkflowSlice` 和 `UIInteractionSlice` 共同决定（仅当选中节点状态为 `Completed` 时显示）。
5.  **视觉层级**: 使用不同的背景色（`bg-card` vs `bg-background`）区分侧边栏和工作区。



--- (493-533 lines) ---
## 8\. 设计系统实现与动效 (Design System Implementation and Motion)

实现“精密未来主义”美学（设计文档阶段 4）。

### 8.1 主题与 Token 实现

#### 8.1.1 CSS Variables 与 Tailwind 配置

  * 在 `styles/globals.css` 中实现设计文档 4.1.1.B 的 CSS 变量定义（HSL 格式）。
  * 在 `tailwind.config.ts` 中配置 Tailwind 使用这些变量。
  * 扩展 Tailwind 配置，实现语义化状态色彩（`status-completed`, `status-executing` 等）（设计文档 4.1.1.D）。

#### 8.1.2 主题策略 (Dark Mode First)

  * 使用 `next-themes`，配置 `defaultTheme="dark"`。

### 8.2 字体与排版

  * 使用 `Geist Sans` 和 `Geist Mono`。
  * 遵循高密度排版规则（UI 默认 `text-sm` 14px）。
  * 定制 `@tailwindcss/typography` (`prose`)，减小默认边距（设计文档 4.1.2.D）。

### 8.3 动效系统 (Framer Motion)

实现精确、高性能的动效（设计文档 4.2）。

#### 8.3.1 动效参数标准化

  * 在 `constants/motion.ts` 中定义 Duration, Easing, Variants Token。

#### 8.3.2 关键动效实现

1.  **布局动画 (Layout Animations)**:
      * **应用场景**: Workflow Navigator (A) 处理动态结构更新。
      * **实现**: 使用 `motion.li`, `layout` 属性和 `AnimatePresence` 实现节点的平滑插入和移动（设计文档 5.2.1）。
2.  **微交互**: 按钮点击反馈 (`whileTap={{ scale: 0.98 }}`)。
3.  **转场动画**: 模态框（`modalPop` variant）、HITL 内容加载（`fadeInUp` variant）。
4.  **状态指示**:
      * `Executing`: `animate-spin` 和可选的 `BorderBeam` 动画。
      * `Staleness`: ⚠️ 图标出现时的微妙脉冲动画。


</architecture>



---

<task>

### 任务 1：项目基础搭建、环境配置与设计系统实现

**目标：** 搭建 O-Award 平台的前端项目骨架，清理 Deer-Flow 遗留业务代码，配置核心依赖库，并实现“精密未来主义”设计系统的核心 Token（色彩、字体、空间、动效）。

**核心关注点：** 设计还原度、主题管理（深色优先）、字体排版规则、项目结构清理。

**实现策略：**

1.  **项目结构调整与清理：**
    *   参考《前端架构设计文档》第 3 节，调整项目结构。移除 Deer-Flow 特有的业务代码（如 `app/chat`, `app/landing`, `core/store/store.ts` 中的聊天逻辑）。
    *   建立 O-Award 的核心目录结构（`src/app/(auth)`, `src/app/(platform)`, `src/core/api`, `src/core/store`, `src/core/models`, `src/constants` 等）。
    *   配置 `src/env.js`，定义新的环境变量（如 `NEXT_PUBLIC_API_BASE_URL`）。
2.  **关键依赖集成：**
    *   安装并配置关键新依赖：`react-resizable-panels` 和 `@monaco-editor/react`。确保 Monaco Editor 能在 Next.js 环境下正确加载。
    *   确保现有核心依赖（Zustand, Tailwind CSS, Shadcn/ui, Framer Motion, Tiptap/Novel, Axios）配置正确。
3.  **设计系统实现（参考 `<design_doc> 4.1`）：**
    *   **色彩与主题：** 在 `styles/globals.css` 中严格实现设计文档 4.1.1.B 的 CSS 变量（HSL 格式）。配置 `next-themes`，确保“深色模式优先”。
    *   **Tailwind 配置：** 在 `tailwind.config.js` 中引用 CSS 变量，并实现语义化状态色彩（`status-completed`, `status-executing` 等，参考 4.1.1.D）。配置圆角（`--radius: 0.5rem`）。
    *   **字体与排版：** 配置 `Geist Sans` 和 `Geist Mono`。设置默认字号（`text-sm` 14px）。定制 `@tailwindcss/typography` (`prose`) 以支持高信息密度（4.1.2.D）。
4.  **动效系统配置：** 在 `src/constants/motion.ts`（新建）中定义 Framer Motion 的动效参数 Token（Duration, Easing, Variants）（设计文档 4.2.2）。
5.  **全局布局：** 在 `app/layout.tsx` 和 `app/(platform)/layout.tsx` 中实现根布局和平台布局，包含全局页眉（Global Header）的骨架。

**输入：** `<deer_flow_frontend_code>`, `<design_doc> Phase 4`, `<architecture> 2, 3, 8`。
**输出：** 一个可运行的基础项目，包含正确的项目结构、配置好的依赖库，以及完整实现的设计系统和全局布局。


</task>


---

你的任务是完成 <task> 中的开发任务，要求：

1. 在开发前务必深入理解 需求背景和项目代码，确保全面把握任务目标与上下文；
2. 尽可能复用及参考现有的组件、框架、库（UI样式、动画等），以提高开发效率和降低出错的概率，这是最重要的原则；
3. 如果现有的技术栈不满足需求，引入其他合适的组件、框架、库，进一步提高开发效率和降低出错的概率；
4. 使用成熟的组件、框架、库、UI样式、动画等；
5. 避免过度设计，过度封装，过度抽象，追求实用性和可维护性；
6. 在确保实现成熟可靠的基础上，**进一步提升UI美观性和优化用户交互体验**；
7. 务必先深入思考，反复推敲，反复权衡，反复反思，然后进行架构设计；
8. 架构设计确定后再进行完整的细节代码实现，确保实现代码的完整性和正确性；
9. 保证与其他任务的逻辑连贯、衔接紧密；
10. 必须确保完成该任务范围内的所有功能点，无遗漏，不涉及其他任务；
11. 必须包含对现有代码必要的修改（如果需要）以及完整新增代码的实现，使用英文注释。

**高标准完成本任务，严格对齐要求，不要遗漏任何功能点，代码简洁健壮无误。深入分析项目架构及依赖，预判风险并持续优化，仅在方案完善后开始开发，确保每一行代码皆有充分理解与把控。对实现的代码进行充分的检查、测试、验证，确保没有bug。**
