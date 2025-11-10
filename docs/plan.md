这是一个经典的 React 无限循环渲染（infinite re-render loop）错误，导致 React 抛出 “Maximum update depth exceeded” 异常。

### 错误原因深入分析

这个问题的核心在于 **“在渲染过程中触发了状态更新”**，而这个状态更新又导致了组件的重新渲染，如此循环往复。

堆栈跟踪（Stack Trace）为我们提供了关键线索：

1.  **错误起点**: `dispatchSetState` (一个 `setState` 调用)。
2.  **触发位置**: `ScrollArea.useComposedRefs[composedRefs] (scroll-area.tsx:87:66)`。
3.  **调用路径**: `setRef (compose-refs.tsx:11:12)`。

这表明，一个 **ref 回调 (ref callback)** 正在同步调用 `setState`。在 React 中，ref 回调（即 `ref={node => ...}`）在组件挂载和卸载（或 ref 变更）时执行。在这些阶段同步调用 `setState` 极易引发无限循环。

-----

### 问题定位：`scroll-container.tsx`

尽管堆栈跟踪指向了 `scroll-area.tsx`，但这个 UI 组件（来自 shadcn/Radix）本身通常是稳定的。问题更有可能出在 *使用* 它的地方，即 `components/deer-flow/scroll-container.tsx`。

我们来分析 `scroll-container.tsx` 的代码：

```tsx
// components/deer-flow/scroll-container.tsx

export function ScrollContainer({
  // ...
  autoScrollToBottom = false,
  ref,
}: ScrollContainerProps) {
  
  // 1. 关键：调用 useStickToBottom 钩子
  const {
    scrollRef: autoScrollViewportRef, // 这是一个 ref
    contentRef: autoScrollContentRef,
    scrollToBottom,
  } = useStickToBottom({ initial: "instant" });

  const manualViewportRef = useRef<HTMLDivElement>(null);

  // 2. 根据 props 选择要激活的 ref
  const activeViewportRef = autoScrollToBottom
    ? autoScrollViewportRef
    : manualViewportRef;

  // ... (useImperativeHandle) ...

  return (
    <div ...>
      {/* ... */}
      {/* 3. 将 ref 传递给 ScrollArea */}
      <ScrollArea
        viewportRef={activeViewportRef} // autoScrollViewportRef 被传到这里
        className="h-full w-full"
      >
        <div className="h-fit w-full" ref={activeContentRef}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}
```

### 无限循环的产生过程

问题几乎可以肯定是出在 `useStickToBottom` 这个自定义钩子上（该钩子的代码未在上下文中提供）。

**根本原因：`useStickToBottom` 钩子返回了不稳定的 Ref 回调函数。**

一个（有缺陷的）`useStickToBottom` 钩子可能在内部是这样实现的：

```javascript
// use-stick-to-bottom (假设的错误实现)
function useStickToBottom() {
  const [node, setNode] = useState(null); // <-- 内部有状态

  // 错误：这个 ref 回调函数没有被 useCallback 包裹
  const scrollRef = (instance) => {
    setNode(instance); // <-- 在 ref 回调中调用了 setState！
  };
  
  // ... (其他逻辑)

  return { scrollRef, ... };
}
```

当 `ScrollContainer` 使用了这个有缺陷的钩子时，无限循环就产生了：

1.  **Render (第1次):**
      * `ScrollContainer` 渲染。
      * `useStickToBottom` 被调用，它创建了一个 *新* 的 `scrollRef` 函数 (我们称之为 `ref_A`)。
      * `ref_A` 作为 `activeViewportRef` 被传递给 `<ScrollArea viewportRef={ref_A}>`。
2.  **Commit (第1次):**
      * React 挂载 `ScrollArea` 的 `Viewport`。
      * React 调用 ref 回调：`ref_A(domNode)`。
      * `ref_A` 内部的 `setNode(domNode)` 被触发，这更新了 `useStickToBottom` 钩子内部的状态。
3.  **Render (第2次):**
      * `setNode` 触发了 `ScrollContainer` 的重新渲染。
      * `useStickToBottom` *再次* 被调用，它创建了 *另一个新* 的 `scrollRef` 函数 (我们称之为 `ref_B`)。
4.  **Commit (第2次):**
      * React 发现 `ScrollArea` 的 `viewportRef` 属性从 `ref_A` 变成了 `ref_B`。
      * React 必须先卸载旧的 ref，再挂载新的 ref。
      * React 调用 `ref_A(null)` (卸载)。这触发了 `setNode(null)`。
      * React 调用 `ref_B(domNode)` (挂载)。这触发了 `setNode(domNode)`。
5.  **Render (第3次, 第4次, ...):**
      * 上一步中的 *两次* `setNode` 调用，又触发了 `ScrollContainer` 的重新渲染。
      * 这个过程（Render -\> 创建新 ref -\> Commit -\> `setState` -\> Render）无限重复，直到 React 崩溃并抛出 `Maximum update depth exceeded` 错误。

-----

### 关于堆栈跟踪的困惑

> `at ScrollArea.useComposedRefs[composedRefs] (scroll-area.tsx:87:66)`

你提供的 `components/ui/scroll-area.tsx` 文件只有 63 行，并且没有 `useComposedRefs`。

这是因为堆栈跟踪指向的不是你的 `scroll-area.tsx` 封装代码，而是它内部使用的 **Radix UI 基元 (`ScrollAreaPrimitive`)** 的代码（或者它依赖的 `compose-refs` 工具）。

`ScrollArea` 组件内部需要将你传入的 `viewportRef` 和它自己的内部 ref 合并（Compose）起来。当它检测到你传入的 `viewportRef` 在每次渲染时都是一个新函数时，它会不断地执行“卸载旧 ref / 挂载新 ref”的操作，从而触发了你 `useStickToBottom` 钩子中（有缺陷的）`setState`，导致了循环。

-----

### 解决方案

**必须修复 `use-stick-to-bottom` 钩子，使其返回稳定的 (memoized) ref 回调。**

如果这个钩子是你的自定义代码，你需要使用 `React.useCallback` 来包裹返回的 ref：

```javascript
// use-stick-to-bottom (正确的实现)
import { useState, useCallback } from 'react';

function useStickToBottom() {
  const [node, setNode] = useState(null);

  // 正确：使用 useCallback 并传入空依赖数组 []
  // 这能确保 scrollRef 在组件的整个生命周期中是同一个函数实例。
  const scrollRef = useCallback((instance) => {
    setNode(instance);
  }, []); // <-- 空依赖数组是关键

  // ... (其他逻辑，例如返回的 scrollToBottom 也应该被 useCallback 包裹)

  return { scrollRef, ... };
}
```

通过这个修复，`ScrollContainer` 在后续的渲染中会收到 *完全相同* 的 `scrollRef` 函数实例，React 不会再触发 ref 的卸载和重挂载，无限循环就被打破了。