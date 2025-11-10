// components/deer-flow/scroll-container.tsx
// 
// 已修复版本：移除了有问题的 useStickToBottom 钩子，
// 并在组件内部重新实现了自动滚动和手动滚动逻辑。

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

// 接口定义保持不变
export interface ScrollContainerProps {
  className?: string;
  children?: ReactNode;
  scrollShadow?: boolean;
  scrollShadowColor?: string;
  autoScrollToBottom?: boolean;
  ref?: React.RefObject<ScrollContainerRef | null>; // 使用 React.RefObject
}

export interface ScrollContainerRef {
  scrollToBottom(): void;
}

// 使用 React.forwardRef 来接收 ref
export const ScrollContainer = forwardRef<
  ScrollContainerRef,
  ScrollContainerProps
>(
  (
    {
      className,
      children,
      scrollShadow = true,
      scrollShadowColor = "var(--background)",
      autoScrollToBottom = false,
    },
    ref, // 接收来自父组件的 ref
  ) => {
    // 1. 创建稳定的 ref 用于 ScrollArea 的视口
    const viewportRef = useRef<HTMLDivElement>(null);
    // 2. 创建稳定的 ref 用于观察内容区域的尺寸变化
    const contentRef = useRef<HTMLDivElement>(null);

    // 3. 跟踪用户是否已经手动向上滚动
    const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

    // 4. 创建一个可被 useImperativeHandle 调用的、稳定的滚动函数
    const manualScrollToBottom = useCallback(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
        setIsUserScrolledUp(false); // 手动触发滚动时，重置用户滚动状态
      }
    }, []);

    // 5. 通过 useImperativeHandle 暴露 scrollToBottom 方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        scrollToBottom: manualScrollToBottom,
      }),
      [manualScrollToBottom],
    );

    // 6. 处理用户的滚动行为
    const handleScroll = useCallback(() => {
      const node = viewportRef.current;
      if (!node) return;

      const { scrollTop, scrollHeight, clientHeight } = node;
      
      // 检查是否滚动到了底部（保留 10px 容错）
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

      // 更新状态，以便在用户滚动到非底部时停止自动滚动
      if (isAtBottom) {
        if (isUserScrolledUp) setIsUserScrolledUp(false);
      } else {
        if (!isUserScrolledUp) setIsUserScrolledUp(true);
      }
    }, [isUserScrolledUp]); // 依赖 isUserScrolledUp 以避免陈旧状态

    // 7. 核心逻辑：实现自动滚动
    useEffect(() => {
      if (!autoScrollToBottom || !contentRef.current || !viewportRef.current) {
        return;
      }

      const contentNode = contentRef.current;

      // 定义当内容变化时要执行的操作
      const autoScroll = () => {
        // 只有当用户没有手动向上滚动时，才自动滚动到底部
        if (!isUserScrolledUp) {
          manualScrollToBottom();
        }
      };

      // 立即执行一次滚动，以防内容已加载
      autoScroll();

      // 使用 ResizeObserver 监听内容 div 的尺寸变化
      // 这是检测“新内容”最可靠的方式
      const resizeObserver = new ResizeObserver(autoScroll);
      resizeObserver.observe(contentNode);

      // 清理
      return () => {
        resizeObserver.disconnect();
      };
    }, [autoScrollToBottom, isUserScrolledUp, manualScrollToBottom]);

    return (
      <div className={cn("relative", className)}>
        {scrollShadow && (
          <>
            <div
              className={cn(
                "pointer-events-none absolute top-0 right-0 left-0 z-10 h-10 bg-gradient-to-t",
                `from-transparent to-[var(--scroll-shadow-color)]`,
              )}
              style={
                {
                  "--scroll-shadow-color": scrollShadowColor,
                } as React.CSSProperties
              }
            />
            <div
              className={cn(
                "pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-10 bg-gradient-to-b",
                `from-transparent to-[var(--scroll-shadow-color)]`,
              )}
              style={
                {
                  "--scroll-shadow-color": scrollShadowColor,
                } as React.CSSProperties
              }
            />
          </>
        )}
        <ScrollArea
          viewportRef={viewportRef} // 传递我们稳定创建的 ref
          className="h-full w-full"
          onScroll={handleScroll} // 监听滚动事件
        >
          {/* 我们需要一个内部 div 来包裹 children，以便 ResizeObserver 观察 */}
          <div className="h-fit w-full" ref={contentRef}>
            {children}
          </div>
        </ScrollArea>
      </div>
    );
  },
);

// 添加 displayName 有助于 React 调试
ScrollContainer.displayName = "ScrollContainer";