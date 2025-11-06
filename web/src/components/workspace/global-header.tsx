// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo } from "react";

import {
  Command,
  ChevronRight,
  CircleUser,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "~/components/deer-flow/logo";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ExportStatus } from "~/core/api/types";
import {
  selectActiveExportJobs,
  useExportStore,
} from "~/core/store/export-store";
import { useTriggerExport } from "~/lib/hooks/use-export";
import { cn } from "~/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface GlobalHeaderProps extends React.HTMLAttributes<HTMLElement> {
  breadcrumbs?: BreadcrumbItem[];
  onCommandPaletteToggle?: () => void;
  projectId?: string | null;
}

export function GlobalHeader({
  breadcrumbs,
  onCommandPaletteToggle,
  projectId,
  className,
  ...props
}: GlobalHeaderProps) {
  const {
    mutate: triggerExport,
    isPending: isTriggering,
    error: triggerError,
    reset: resetTriggerError,
  } = useTriggerExport();
  const activeJobs = useExportStore(selectActiveExportJobs);

  const hasRunningExport = useMemo(() => {
    if (!projectId) {
      return false;
    }

    return Array.from(activeJobs.values()).some(
      (job) =>
        job.projectId === projectId &&
        (job.status === ExportStatus.Queued ||
          job.status === ExportStatus.InProgress),
    );
  }, [activeJobs, projectId]);

  const isExportBusy = hasRunningExport || isTriggering;
  const isExportDisabled = !projectId || isExportBusy;

  const handleTriggerExport = useCallback(() => {
    if (!projectId || isExportBusy) {
      return;
    }
    triggerExport(projectId);
  }, [projectId, isExportBusy, triggerExport]);

  useEffect(() => {
    if (!triggerError) {
      return;
    }

    const message =
      triggerError instanceof Error
        ? triggerError.message
        : "导出任务启动失败，请稍后重试。";
    toast.error(message);
    resetTriggerError();
  }, [resetTriggerError, triggerError]);

  const items = useMemo<BreadcrumbItem[]>(() => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      return breadcrumbs;
    }
    return [
      { label: "仪表盘", href: "/dashboard" },
      { label: "项目：未知项目" },
    ];
  }, [breadcrumbs]);

  return (
    <header
      className={cn(
        "glassmorphism sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border-default px-6",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-6">
        <Logo />
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-text-secondary">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              const content = item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-text-primary",
                    isLast && "pointer-events-none text-text-primary",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "text-text-secondary",
                    isLast && "text-text-primary",
                  )}
                >
                  {item.label}
                </span>
              );

              return (
                <li key={`${item.label}-${index}`} className="flex items-center">
                  {content}
                  {!isLast ? (
                    <ChevronRight
                      aria-hidden
                      className="ml-2 size-4 text-text-tertiary"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleTriggerExport}
          disabled={isExportDisabled}
          aria-busy={isExportBusy}
        >
          {isExportBusy ? (
            <Loader2 aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <Download aria-hidden className="size-4" />
          )}
          <span>导出结果</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCommandPaletteToggle}
          className="rounded-full border border-border-subtle text-text-primary hover:border-border-default"
        >
          <Command className="size-5" />
          <span className="sr-only">Open command palette</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full border border-border-subtle text-text-primary hover:border-border-default"
            >
              <CircleUser className="size-5" />
              <span className="sr-only">Open user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-text-secondary">
              当前账户
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">设置</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/logout">退出登录</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
