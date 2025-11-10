// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  useCallback,
  useImperativeHandle,
  useRef,
  type MutableRefObject,
  type ReactNode,
  type RefCallback,
  type RefObject,
} from "react";
import { useStickToBottom } from "use-stick-to-bottom";

import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

export interface ScrollContainerProps {
  className?: string;
  children?: ReactNode;
  scrollShadow?: boolean;
  scrollShadowColor?: string;
  autoScrollToBottom?: boolean;
  ref?: RefObject<ScrollContainerRef | null>;
}

export interface ScrollContainerRef {
  scrollToBottom(): void;
}

export function ScrollContainer({
  className,
  children,
  scrollShadow = true,
  scrollShadowColor = "var(--background)",
  autoScrollToBottom = false,
  ref,
}: ScrollContainerProps) {
  // This hook provides refs for auto-scrolling functionality.
  const {
    scrollRef: autoScrollViewportRef, // This ref MUST be attached to the scrollable viewport.
    contentRef: autoScrollContentRef,
    scrollToBottom,
  } = useStickToBottom({ initial: "instant" });

  // Fallback ref for when auto-scrolling is disabled.
  const manualViewportRef = useRef<HTMLDivElement>(null);

  // Declaratively choose which ref to use based on the prop.
  // This avoids side-effects and infinite loops.
  const activeViewportRef = autoScrollToBottom
    ? autoScrollViewportRef
    : manualViewportRef;
  const activeContentRef = autoScrollToBottom ? autoScrollContentRef : null;
  const viewportRef = useStableRef<HTMLDivElement>(activeViewportRef);
  const contentRef = useStableRef<HTMLDivElement>(activeContentRef);

  // Expose a `scrollToBottom` method to parent components.
  useImperativeHandle(
    ref,
    () => ({
      scrollToBottom() {
        if (autoScrollToBottom) {
          scrollToBottom(); // Use the hook's function when available.
        } else if (manualViewportRef.current) {
          // Manual implementation for the non-sticky case.
          manualViewportRef.current.scrollTop =
            manualViewportRef.current.scrollHeight;
        }
      },
    }),
    [autoScrollToBottom, scrollToBottom],
  );

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
      <ScrollArea viewportRef={viewportRef} className="h-full w-full">
        <div className="h-fit w-full" ref={contentRef}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

type PossibleRef<T extends HTMLElement> =
  | MutableRefObject<T | null>
  | RefCallback<T>
  | null;

function useStableRef<T extends HTMLElement>(
  ref: PossibleRef<T>,
): PossibleRef<T> {
  const latestRef = useRef<PossibleRef<T>>(ref);
  latestRef.current = ref;

  const stableCallback = useCallback<RefCallback<T>>(
    (node) => {
      const target = latestRef.current;
      if (!target) {
        return;
      }
      if (typeof target === "function") {
        target(node);
      } else {
        target.current = node;
      }
    },
    [],
  );

  if (typeof ref === "function") {
    return stableCallback;
  }

  return ref;
}
