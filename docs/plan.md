您好，感谢您提供新的错误信息。这个错误堆栈非常有价值，它帮助我们锁定了问题的真正根源。

您遇到的 `Maximum update depth exceeded` 错误，结合新的堆栈跟踪，表明问题**不是**由 `ScrollContainer` 或 `useStickToBottom` 引起的，而是由 `ProjectFlowPage` 内部两个相互冲突的 `useEffect` 钩子（Hooks）引起的无限循环。

`ScrollArea` 组件（及其 `useComposedRefs` 内部逻辑）只是这个无限循环的**受害者**。当 React 陷入无限渲染循环时，它会不断地创建和销毁组件，这导致 `ref` 回调被疯狂触发，最终在 `ScrollArea` 内部崩溃。

-----

### 问题的真正根源

在 `src/app/[locale]/(main)/projects/[projectId]/flow/page.tsx` 文件中，存在两个 `useEffect` 钩子，它们在移动设备视图下会“互相争斗”，导致无限循环。

**冲突的钩子 A（第 127 行）**：
这个 `useEffect` 负责将 URL 中的 `node` 查询参数（`nodeQueryParam`）同步到 `focusedNodeId` 状态。

  * **它的逻辑是**：“如果 URL 中*没有* `node` 参数（`!nodeQueryParam`），并且 `focusedNodeId` *不是* `null`，就*强制*调用 `focusNode(null)`。”

**冲突的钩子 B（第 142 行）**：
这个 `useEffect` 负责在没有节点被聚焦时，*自动聚焦*到重要节点（如“等待中”或“执行中”的节点）。

  * **它的逻辑是**：“如果 `focusedNodeId` 是 `null`，就去寻找一个重要节点并调用 `focusNode(node.id)`。”

**无限循环（仅在移动视图）**：

1.  页面加载（移动视图，无 `node` 参数）。
2.  `钩子 B` 运行。`focusedNodeId` 为 `null`。它找到了一个“等待中”的节点（例如 ID 123），并调用 `focusNode(123)`。
3.  React 状态更新，组件重新渲染。`focusedNodeId` 现在是 `123`。
4.  `钩子 A` 运行。`nodeQueryParam` 仍然是 `null`。
5.  `钩子 A` 发现 `focusedNodeId` 是 `123`（不是 `null`），于是它*强制*调用 `focusNode(null)` 来“纠正”状态。
6.  React 状态更新，组件重新渲染。`focusedNodeId` 现在是 `null`。
7.  `钩子 B` 运行。`focusedNodeId` 为 `null`。它找到了“等待中”的节点（ID 123），并调用 `focusNode(123)`。
8.  **循环回到第 3 步**。

-----

### 解决方案

要解决这个问题，我们需要修改这两个 `useEffect` 钩子，打破这个循环。最简单的方法是**阻止“自动聚焦”（钩子 B）在移动视图上运行**，让 URL（`nodeQueryParam`）成为移动视图上唯一的焦点来源。

请打开 `src/app/[locale]/(main)/projects/[projectId]/flow/page.tsx` 文件并进行以下修改：

**1. 导入 `useIsMobile` 钩子：**

在文件顶部的 `import` 语句中，添加 `useIsMobile`：

```tsx
// src/app/[locale]/(main)/projects/[projectId]/flow/page.tsx

// ... 其他 import ...
import { useIsMobile } from "~/hooks/use-mobile";
// ... 其他 import ...
```

**2. 在组件内部调用 `useIsMobile`：**

在 `ProjectFlowPage` 函数的顶部，添加 `isMobile` 状态：

```tsx
// src/app/[locale]/(main)/projects/[projectId]/flow/page.tsx

export default function ProjectFlowPage() {
  const isMobile = useIsMobile(); // <--- 添加这一行
  const { workflowId } = useProjectWorkspace();
  const router = useRouter();
  // ... (剩余的代码)
```

**3. 修改“自动聚焦”的 `useEffect` (钩子 B)：**

找到位于大约**第 142 行**的 `useEffect`，在它内部添加一个检查，如果 `isMobile` 为 `true`，则直接 `return`。

```tsx
// src/app/[locale]/(main)/projects/[projectId]/flow/page.tsx

  // ...
  // (这是自动聚焦的 useEffect)
  React.useEffect(() => {
    if (isMobile) { // <--- 添加这一行
      return; // 在移动端，让 URL query param 成为唯一的焦点来源
    } // <--- 添加这一行

    if (focusedNodeId !== null) {
      return;
    }
  // ... (useEffect 的剩余部分保持不变)
  // ...

  // 将 isMobile 添加到依赖项数组中
  }, [workflow, focusedNodeId, focusNode, isMobile]); // <--- 在这里添加 isMobile
```
