--- (10-11 lines) ---
| **Next.js** | 应用框架，提供了服务器端渲染 (SSR)、静态站点生成 (SSG)、基于 `app` 目录的文件系统路由、API 路由以及其他现代化 Web 开发功能。 |
| | ↳ **App Router** | 项目采用最新的 App Router 架构，支持 React Server Components (RSC) 和客户端组件。 |


--- (22-24 lines) ---
| **Zustand** | 一个轻量、快速的状态管理库，用于管理应用的全局状态，如聊天消息、UI 状态和用户设置。 |
| | ↳ **`zustand/react/shallow`** | 用于在 React 组件中进行浅比较，避免不必要的重渲染，优化性能。 |
| **`localStorage`** | 浏览器 `localStorage` API 被用于持久化用户设置。`core/store/settings-store.ts` 中的 `loadSettings` 和 `saveSettings` 函数明确使用它来存储配置，确保刷新页面后设置不丢失。 |


--- (39-39 lines) ---
| **next-themes** | 用于实现浅色/深色模式的主题切换功能。 |


--- (52-52 lines) ---
| **Sonner** | 用于显示轻量级的 Toast 通知（消息提示）。 |


--- (95-95 lines) ---
| **next-intl** | 为 Next.js 应用提供完整的国际化解决方案，包括翻译文本管理、语言环境路由和服务器端集成。 |


--- (174-177 lines) ---
| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **服务端 Cookie 读取** | `src/i18n.ts` 中使用 `next/headers` 的 `cookies()` 函数，在**服务端**直接读取 `NEXT_LOCALE` Cookie。这使得在 RSC 或服务器端渲染时就能确定用户的语言偏好，无需等待客户端加载。 |
| **动静结合的语言切换** | `components/deer-flow/language-switcher.tsx` 组件展示了一种实用的语言切换策略：通过客户端 JavaScript 设置 Cookie (`document.cookie = ...`)，然后强制刷新页面 (`window.location.reload()`)。虽然会刷新页面，但这种方法简单可靠，能确保服务端的 `i18n.ts` 能立即读到最新的 Cookie 值并应用正确的语言包。 |


--- (202-208 lines) ---
| 模式/实践 | 描述与复用价值 |
| :--- | :--- |
| **功能切片 (Feature-Sliced) 路由** | `app/` 目录下的结构（如 `app/chat/`, `app/landing/`, `app/settings/`）体现了按功能组织代码的原则。每个功能模块都是一个独立的单元，包含了自身的页面、组件和逻辑，使得项目结构清晰，易于扩展和维护。 |
| **组件分层** | 项目中的 `components/` 目录被清晰地划分为三层：<br>1. **`ui/`**: 基础 UI 组件，源自 Shadcn/ui，是应用的视觉基石。<br>2. **`deer-flow/`**: 应用级的共享组件，如 `Logo`, `Markdown`, `Tooltip` 等。它们封装了通用逻辑，在多个功能模块中复用。<br>3. **`magicui/`**: 高度定制化的视觉特效组件，与业务逻辑解耦，可轻松移植到任何项目中。 |
| **核心逻辑与 UI 分离** | `core/` 目录是项目的“大脑”，包含了所有非 UI 的核心逻辑，如 API 通信 (`api/`)、状态管理 (`store/`)、消息处理 (`messages/`) 和通用工具 (`utils/`)。这种彻底的分离使得业务逻辑可以独立于 React 组件进行测试和演进，是构建可维护应用的关键。 |
| **自定义 Hooks 封装** | `hooks/` 目录提供了可复用的 React Hooks，如 `useIntersectionObserver` 和 `useIsMobile`。它们将复杂的浏览器 API 或重复的逻辑封装成简单易用的钩子，简化了组件代码。 |



--- (217-217 lines) ---
| **`cn` 工具函数** | `lib/utils.ts` 中的 `cn` 函数是整个项目的标准实践。它结合了 `clsx` 和 `tailwind-merge`，解决了在 React 组件中动态、条件性地组合 Tailwind 类名时的所有痛点（如条件判断、样式覆盖冲突），是现代 Tailwind 项目的必备工具。 |
