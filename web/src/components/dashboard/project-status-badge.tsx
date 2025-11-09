// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { ProjectStatus } from "~/core/api/models/enums";
import { cn } from "~/lib/utils";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusConfig: Record<
  ProjectStatus,
  {
    label: string;
    icon: typeof Loader2Icon;
    className: string;
    iconClassName?: string;
  }
> = {
  [ProjectStatus.IDLE]: {
    label: "空闲",
    icon: ClockIcon,
    className: "bg-secondary/20 text-secondary-foreground border-secondary/50",
  },
  [ProjectStatus.RUNNING]: {
    label: "运行中",
    icon: Loader2Icon,
    className:
      "bg-blue-100/60 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600",
    iconClassName: "animate-spin",
  },
  [ProjectStatus.PAUSED]: {
    label: "等待操作 (HITL)",
    icon: AlertTriangleIcon,
    className:
      "bg-amber-100/60 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-600",
  },
  [ProjectStatus.COMPLETED]: {
    label: "已完成",
    icon: CheckCircleIcon,
    className:
      "bg-green-100/60 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600",
  },
  [ProjectStatus.ERROR]: {
    label: "错误",
    icon: XCircleIcon,
    className: "bg-destructive/10 text-destructive border-destructive/50",
  },
};

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig[ProjectStatus.IDLE];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium gap-1.5", config.className, className)}
    >
      <Icon className={cn("size-3.5", config.iconClassName)} />
      <span>{config.label}</span>
    </Badge>
  );
}

