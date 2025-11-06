// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ScrollToOptions } from "@tanstack/react-virtual";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { usePrefersReducedMotion } from "~/lib/a11y/motion-preferences";
import { duration, easing } from "~/lib/motion-tokens";
import { cn } from "~/lib/utils";

const STICKY_EPSILON_PX = 12;
const DEFAULT_ITEM_ESTIMATE = 28;
const DEFAULT_OVERSCAN = 16;

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string | number | Date;
  scope?: string | null;
  context?: ReactNode;
  metadata?: Record<string, unknown> | string | null;
}

export interface LogViewerHandle {
  scrollToLatest(options?: ScrollToOptions): void;
}

export interface LogViewerProps {
  entries: LogEntry[];
  className?: string;
  estimatedItemHeight?: number;
  overscan?: number;
  renderEntry?: (entry: LogEntry) => ReactNode;
  emptyPlaceholder?: ReactNode;
  autoScrollBehavior?: ScrollToOptions["behavior"];
  onStickToBottomChange?: (sticking: boolean) => void;
}

const LEVEL_CONFIG: Record<
  LogLevel,
  {
    label: string;
    badgeClassName: string;
    messageClassName: string;
  }
> = {
  debug: {
    label: "DEBUG",
    badgeClassName:
      "border-border-subtle bg-background-secondary text-text-tertiary",
    messageClassName: "text-text-secondary",
  },
  info: {
    label: "INFO",
    badgeClassName:
      "border-border-interactive bg-background-tertiary/70 text-text-primary",
    messageClassName: "text-text-primary",
  },
  warn: {
    label: "WARN",
    badgeClassName:
      "border-border-interactive bg-background-secondary/80 text-text-warning",
    messageClassName: "text-text-warning",
  },
  error: {
    label: "ERROR",
    badgeClassName:
      "border-border-danger bg-background-danger/30 text-text-danger",
    messageClassName: "text-text-danger",
  },
};

function formatTimestamp(input: LogEntry["timestamp"], formatter: Intl.DateTimeFormat): string {
  if (input instanceof Date) {
    return formatter.format(input);
  }

  if (typeof input === "number") {
    return formatter.format(new Date(input));
  }

  if (typeof input === "string") {
    const parsed = Number.isNaN(Number(input)) ? new Date(input) : new Date(Number(input));
    if (!Number.isNaN(parsed.getTime())) {
      return formatter.format(parsed);
    }
  }

  return "";
}

function formatMetadata(metadata: LogEntry["metadata"]): string | null {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === "string") {
    return metadata;
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch (error) {
    console.warn("[LogViewer] Failed to stringify metadata", error);
    return null;
  }
}

function DefaultLogEntry({
  entry,
  formatter,
}: {
  entry: LogEntry;
  formatter: Intl.DateTimeFormat;
}) {
  const levelStyles = LEVEL_CONFIG[entry.level] ?? LEVEL_CONFIG.info;
  const timestamp = formatTimestamp(entry.timestamp, formatter);
  const metadata = formatMetadata(entry.metadata);

  return (
    <div className="flex w-full items-start gap-4 rounded-md px-5 py-3 text-body-medium">
      <div className="flex w-24 shrink-0 justify-end text-xs text-text-tertiary tabular-nums">
        {timestamp}
      </div>
      <Badge className={cn("shrink-0", levelStyles.badgeClassName)}>{levelStyles.label}</Badge>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {entry.scope ? (
          <span className="text-xs uppercase tracking-[0.3em] text-text-tertiary">{entry.scope}</span>
        ) : null}
        <p
          className={cn(
            "whitespace-pre-wrap break-words text-body-medium leading-relaxed",
            levelStyles.messageClassName,
          )}
        >
          {entry.message}
        </p>
        {entry.context ? (
          <div className="text-xs leading-relaxed text-text-secondary/80">{entry.context}</div>
        ) : null}
        {metadata ? (
          <pre className="max-h-48 overflow-auto rounded-md border border-border-subtle/60 bg-background-secondary/80 p-3 text-xs leading-relaxed text-text-secondary">
            {metadata}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

function useStickyState(onStickToBottomChange?: (sticking: boolean) => void) {
  const [isSticking, setIsSticking] = useState(true);

  const update = useCallback(
    (next: boolean) => {
      setIsSticking((prev) => {
        if (prev !== next) {
          onStickToBottomChange?.(next);
        }
        return next;
      });
    },
    [onStickToBottomChange],
  );

  return { isSticking, update };
}

export const LogViewer = forwardRef<LogViewerHandle, LogViewerProps>(
  (
    {
      entries,
      className,
      estimatedItemHeight = DEFAULT_ITEM_ESTIMATE,
      overscan = DEFAULT_OVERSCAN,
      renderEntry,
      emptyPlaceholder = (
        <div className="flex h-full items-center justify-center text-sm text-text-secondary">
          暂无日志。执行流程开始后会在此显示最新输出。
        </div>
      ),
      autoScrollBehavior = "smooth",
      onStickToBottomChange,
    },
    ref,
  ) => {
    const parentRef = useRef<HTMLDivElement | null>(null);
    const prevCountRef = useRef(entries.length);
    const prevLastIdRef = useRef(entries.at(-1)?.id ?? null);

    const { isSticking, update } = useStickyState(onStickToBottomChange);
    const prefersReducedMotion = usePrefersReducedMotion();

    const timeFormatter = useMemo(
      () =>
        new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      [],
    );

    const estimateSize = useCallback(() => estimatedItemHeight, [estimatedItemHeight]);

    const virtualizer = useVirtualizer({
      count: entries.length,
      getScrollElement: () => parentRef.current,
      estimateSize,
      overscan,
      getItemKey: (index) => entries[index]?.id ?? index,
      indexAttribute: "data-log-index",
    });

    const measureElement = useCallback(
      (node: Element | null) => {
        if (node) {
          virtualizer.measureElement(node);
        }
      },
      [virtualizer],
    );

    const scrollToLatest = useCallback(
      (options?: ScrollToOptions) => {
        if (entries.length === 0) {
          return;
        }

        virtualizer.scrollToIndex(entries.length - 1, {
          align: "end",
          behavior: options?.behavior ?? autoScrollBehavior,
        });
      },
      [entries.length, virtualizer, autoScrollBehavior],
    );

    useImperativeHandle(
      ref,
      () => ({
        scrollToLatest: (options?: ScrollToOptions) => {
          requestAnimationFrame(() => {
            scrollToLatest(options);
          });
        },
      }),
      [scrollToLatest],
    );

    const handleScroll = useCallback(() => {
      const element = parentRef.current;
      if (!element) {
        return;
      }

      const distanceToBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight;
      const isNearBottom = distanceToBottom <= STICKY_EPSILON_PX;
      update(isNearBottom);
    }, [update]);

    useEffect(() => {
      handleScroll();
    }, [handleScroll, entries.length]);

    useEffect(() => {
      const hasCountIncreased = entries.length > prevCountRef.current;
      const currentLastId = entries.at(-1)?.id ?? null;
      const hasNewTail = currentLastId !== prevLastIdRef.current;

      if ((hasCountIncreased || hasNewTail) && isSticking) {
        scrollToLatest();
      }

      prevCountRef.current = entries.length;
      prevLastIdRef.current = currentLastId;
    }, [entries, isSticking, scrollToLatest]);

    const renderedEntry = useCallback(
      (entry: LogEntry) => {
        if (renderEntry) {
          return renderEntry(entry);
        }
        return <DefaultLogEntry entry={entry} formatter={timeFormatter} />;
      },
      [renderEntry, timeFormatter],
    );

    const virtualItems = virtualizer.getVirtualItems();
    const shouldShowScrollHint = !isSticking && entries.length > 0;

    return (
      <div className={cn("relative flex h-full flex-col overflow-hidden font-mono", className)}>
        <div
          ref={parentRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-y-auto rounded-lg bg-background-primary/40"
        >
          {entries.length === 0 ? (
            emptyPlaceholder
          ) : (
            <div
              className="relative w-full"
              style={{
                height: virtualizer.getTotalSize(),
              }}
            >
              {virtualItems.map((virtualItem) => {
                const entry = entries[virtualItem.index];
                if (!entry) {
                  return null;
                }

                return (
                  <div
                    key={virtualItem.key}
                    data-log-index={virtualItem.index}
                    ref={measureElement}
                    className="absolute left-0 top-0 w-full border-b border-border-subtle/40"
                    style={{
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    {renderedEntry(entry)}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {prefersReducedMotion ? (
          shouldShowScrollHint ? (
            <div className="pointer-events-none absolute bottom-6 right-6 z-[5] opacity-100">
              <Button
                variant="secondary"
                size="sm"
                className="pointer-events-auto shadow-lg shadow-black/20"
                onClick={() => {
                  scrollToLatest({ behavior: "smooth" });
                  update(true);
                }}
              >
                回到最新
              </Button>
            </div>
          ) : null
        ) : (
          <AnimatePresence>
            {shouldShowScrollHint ? (
              <motion.div
                className="pointer-events-none absolute bottom-6 right-6 z-[5]"
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: duration.fast, ease: easing.standard },
                }}
                exit={{
                  opacity: 0,
                  y: 8,
                  transition: { duration: duration.fast, ease: easing.standard },
                }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="pointer-events-auto shadow-lg shadow-black/20"
                  onClick={() => {
                    scrollToLatest({ behavior: "smooth" });
                    update(true);
                  }}
                >
                  回到最新
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}
      </div>
    );
  },
);

LogViewer.displayName = "LogViewer";
