## 最终清理方案：聚焦数学建模平台

### **一、核心目标与策略**

**目标**：将 `deer-flow` 前端代码库精简为一个纯粹的、受保护的数学建模平台。

**策略**：系统性地移除所有与公开演示、独立聊天机器人、市场营销和非核心功能（如播客）相关的代码，同时确保平台的核心用户流程（登录 -> 仪表盘 -> 项目创建 -> 项目工作区）功能完好无损。

**重要前提**：在开始前，请确保您的代码已通过 Git 等版本控制工具进行了备份，以防万一。

### **二、清理总览**

我们将按以下步骤，彻底移除以下模块：

1.  **独立的聊天/演示界面** (`/chat` 路由及其所有依赖)
2.  **播客 (Podcast) 生成功能**
3.  **公开的登陆/营销页面** (`/landing` 路由)
4.  **开源项目推广与用户追踪代码** (Amplitude, GitHub Stars)
5.  **提示词增强 (Prompt Enhancer) 功能**
6.  **残留的装饰性及辅助代码**
7.  **修复因代码删除引起的核心组件依赖问题** (关键步骤)

---

### **三、详细清理步骤**

#### **第 1 步：移除独立的聊天界面及其依赖项**

**理由**：这是最核心的清理步骤。此界面及其状态管理与项目工作区无关，是冗余功能。

**1.1. 文件/目录删除**

| 路径 | 说明 |
| :--- | :--- |
| `src/app/chat/` | 整个聊天界面的路由和组件。 |
| `src/app/settings/` | 聊天界面专用的设置对话框及其所有子组件。 |
| `src/core/api/chat.ts` | 聊天界面的 API 调用逻辑，包括 Replay/Mock 模式。 |
| `src/core/replay/` | 整个 Replay（演示回放）系统。 |
| `src/core/store/store.ts` | 聊天界面专用的 Zustand Store。 |

**1.2. 文件内容修改**

*   **`src/core/store/index.ts`**
    *   删除此行：`export * from "./store";`
*   **`src/core/api/index.ts`**
    *   删除此行：`export * from "./chat";`

#### **第 2 步：移除播客 (Podcast) 生成功能**

**理由**：与数学建模平台的核心功能完全无关。

**2.1. 文件/目录删除**

| 路径 | 说明 |
| :--- | :--- |
| `src/core/api/podcast.ts` | 播客生成的 API 调用。 |

**2.2. 文件内容修改**

*   **`src/core/messages/types.ts`**
    *   在 `Message` 接口的 `agent` 类型定义中，删除 `"podcast"`。
    *   **修改为**:
        ```ts
        agent?:
          | "coordinator"
          | "planner"
          | "researcher"
          | "coder"
          | "reporter";
        ```

*   **`src/core/api/index.ts`**
    *   删除此行：`export * from "./podcast";`

#### **第 3 步：移除公开登陆页面 (Landing Page)**

**理由**：平台入口是登录后的仪表盘，公开的营销页面是多余的。

**3.1. 文件/目录删除**

| 路径 | 说明 |
| :--- | :--- |
| `src/app/landing/` | 整个登陆页面的路由和组件。 |

#### **第 4 步：移除项目推广与用户追踪代码**

**理由**：这些代码用于开源项目推广，与平台业务功能无关。

**4.1. 文件内容修改**

*   **`src/app/layout.tsx`**
    *   删除所有与 **Amplitude** 相关的 `<Script>` 标签。
*   **`src/env.js`**
    *   从 `server` schema 中删除 `AMPLITUDE_API_KEY` 和 `GITHUB_OAUTH_TOKEN`。
    *   从 `runtimeEnv` 对象中删除 `AMPLITUDE_API_KEY` 和 `GITHUB_OAUTH_TOKEN`。
    *   **修改后的 `server` 和 `runtimeEnv` 部分**:
        ```javascript
        server: {
          NODE_ENV: z.enum(["development", "test", "production"]),
        },
        // ...
        runtimeEnv: {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          NEXT_PUBLIC_STATIC_WEBSITE_ONLY:
            process.env.NEXT_PUBLIC_STATIC_WEBSITE_ONLY === "true",
          NEXT_PUBLIC_MAX_STREAM_BUFFER_SIZE: process.env.NEXT_PUBLIC_MAX_STREAM_BUFFER_SIZE,
        },
        ```

#### **第 5 步：移除提示词增强 (Prompt Enhancer) 功能**

**理由**：这是为已删除的聊天输入框提供的服务，已成孤立代码。

**5.1. 文件/目录删除**

| 路径 | 说明 |
| :--- | :--- |
| `src/core/api/prompt-enhancer.ts` | 提示词增强的 API 调用。 |

**5.2. 文件内容修改**

*   **`src/core/api/index.ts`**
    *   删除此行：`export * from "./prompt-enhancer";`

#### **第 6 步：清理次要及装饰性代码**

**理由**：移除纯粹为了视觉效果或已被废弃的辅助代码。

**6.1. 文件/目录删除**

| 路径 | 说明 |
| :--- | :--- |
| `src/core/rehype/rehype-split-words-into-spans.ts` | 用于 Markdown 文本逐字淡入动画的插件。 |
| `src/components/deer-flow/icons/` | 删除 `detective.tsx`, `enhance.tsx`, `magic.tsx`, `report-style.tsx` 文件。 |
| `src/components/magicui/` | 整个目录。这些是用于已删除页面的 UI 特效组件。 |

**6.2. 文件内容修改**

*   **`src/core/rehype/index.ts`**
    *   删除此行：`export * from "./rehype-split-words-into-spans";`
*   **`src/components/deer-flow/markdown.tsx`**
    *   删除 `rehypeSplitWordsIntoSpans` 的导入。
    *   从函数签名中移除 `animated = false` prop。
    *   将 `rehypePlugins` 的 `useMemo` 钩子修改为：
        ```tsx
        const rehypePlugins = useMemo<NonNullable<ReactMarkdownOptions["rehypePlugins"]>>(() => {
          return [[rehypeKatex, katexOptions]];
        }, []);
        ```

#### **第 7 步：关键修复 - 修正 `Link` 组件依赖**

**理由**：这是**必须执行的关键步骤**，以防止因删除了 `core/store/store.ts` 而导致 Markdown 渲染时应用崩溃。

**7.1. 文件内容修改**

*   **`src/components/deer-flow/link.tsx`**
    *   **完全替换**文件内容为以下简化版本：
        ```tsx
        // src/components/deer-flow/link.tsx (替换后)
        export const Link = ({
          href,
          children,
        }: {
          href: string | undefined;
          children: React.ReactNode;
        }) => {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        };
        ```

*   **`src/components/deer-flow/markdown.tsx`**
    *   从函数签名中移除 `checkLinkCredibility = false` prop。
    *   修改 `components` 的 `useMemo` 钩子，移除 `checkLinkCredibility` prop 的传递：
        ```tsx
        // ...
        const components: ReactMarkdownOptions["components"] = useMemo(() => {
          return {
            a: ({ href, children }) => (
              <Link href={href}>
                {children}
              </Link>
            ),
            // ... 其他组件
          };
        }, []); // 依赖项数组为空
        // ...
        ```

---

