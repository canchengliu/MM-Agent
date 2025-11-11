--- (15-15 lines) ---
| | ↳ **`next/headers`** | 用于在服务器端组件中访问请求头，如 `src/i18n.ts` 中使用 `cookies()` 函数读取 Cookie 以实现服务端国际化。 |


--- (49-49 lines) ---
| **Shadcn/ui** | 项目的基础组件库，`components/ui` 目录下的所有组件（如 `Button`, `Card`, `Dialog` 等）都基于此构建，提供了优秀的设计和可访问性。 |


--- (91-96 lines) ---
### 八、 国际化 (i18n)

| 技术/工具 | 描述与应用场景 |
| :--- | :--- |
| **next-intl** | 为 Next.js 应用提供完整的国际化解决方案，包括翻译文本管理、语言环境路由和服务器端集成。 |



--- (118-118 lines) ---
| **`useIsMobile`** | 自定义 Hook，用于检测当前设备是否为移动端，以实现响应式布局。 |


--- (172-178 lines) ---
#### 4. 国际化 (i18n) 实现模式

| 模式/函数 | 描述与复用价值 |
| :--- | :--- |
| **服务端 Cookie 读取** | `src/i18n.ts` 中使用 `next/headers` 的 `cookies()` 函数，在**服务端**直接读取 `NEXT_LOCALE` Cookie。这使得在 RSC 或服务器端渲染时就能确定用户的语言偏好，无需等待客户端加载。 |
| **动静结合的语言切换** | `components/deer-flow/language-switcher.tsx` 组件展示了一种实用的语言切换策略：通过客户端 JavaScript 设置 Cookie (`document.cookie = ...`)，然后强制刷新页面 (`window.location.reload()`)。虽然会刷新页面，但这种方法简单可靠，能确保服务端的 `i18n.ts` 能立即读到最新的 Cookie 值并应用正确的语言包。 |



--- (207-207 lines) ---
| **自定义 Hooks 封装** | `hooks/` 目录提供了可复用的 React Hooks，如 `useIntersectionObserver` 和 `useIsMobile`。它们将复杂的浏览器 API 或重复的逻辑封装成简单易用的钩子，简化了组件代码。 |


--- (260-260 lines) ---
| **直接导入 Markdown 内容** | 项目配置了 Webpack (或 Turbopack) 加载器，允许直接 `import` `.md` 文件作为字符串。如 `app/settings/tabs/about-tab.tsx` 中 `import aboutEn from "./about-en.md";`。配合 `typings/md.d.ts` 中的类型声明，这为处理静态文本内容（如“关于”页面、文档）提供了极为便捷和类型安全的方式。 |
