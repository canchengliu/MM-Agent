"use client";

import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleSlash2,
  Loader2,
  Play,
  Settings2,
  UserCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { NodeStatus } from "~/core/api/types/workflow";
import type { ProjectStatus } from "~/core/api/types/project";
import { cn } from "~/lib/utils";

import { Badge } from "../ui/badge";

type StatusValue = NodeStatus | ProjectStatus;

export interface StatusVisualConfig {
  label: string;
  icon?: LucideIcon;
  badgeClassName: string;
  iconClassName?: string;
}

const STATUS_VISUALS: Record<StatusValue, StatusVisualConfig> = {
  Configuring: {
    label: "Configuring",
    icon: Settings2,
    badgeClassName: "border-slate-400/40 bg-slate-600/10 text-slate-700 dark:text-slate-200",
  },
  Running: {
    label: "Running",
    icon: Play,
    badgeClassName: "border-sky-400/40 bg-sky-500/10 text-sky-600 dark:text-sky-100",
  },
  Completed: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClassName:
      "border-[hsl(var(--success))/0.4] bg-[hsl(var(--success))/0.12] text-[hsl(var(--success))]",
  },
  "Not Started": {
    label: "Not Started",
    icon: CircleDashed,
    badgeClassName: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
  },
  Executing: {
    label: "Executing",
    icon: Loader2,
    iconClassName: "animate-spin",
    badgeClassName:
      "border-[hsl(var(--primary))/0.35] bg-[hsl(var(--primary))/0.12] text-[hsl(var(--primary))]",
  },
  "Awaiting HITL Approval": {
    label: "Awaiting HITL Approval",
    icon: UserCheck,
    badgeClassName:
      "border-[hsl(var(--warning))/0.45] bg-[hsl(var(--warning))/0.14] text-[hsl(var(--warning))]",
  },
  Failed: {
    label: "Failed",
    icon: XCircle,
    badgeClassName:
      "border-[hsl(var(--destructive))/0.45] bg-[hsl(var(--destructive))/0.12] text-[hsl(var(--destructive))]",
  },
  Canceled: {
    label: "Canceled",
    icon: CircleSlash2,
    badgeClassName: "border-orange-400/40 bg-orange-500/10 text-orange-600 dark:text-orange-200",
  },
};

const STATUS_LABEL_KEYS: Partial<Record<StatusValue, string>> = {
  Configuring: "project.configuring",
  Running: "project.running",
  Completed: "project.completed",
  "Not Started": "node.notStarted",
  Executing: "node.executing",
  "Awaiting HITL Approval": "node.awaitingHitl",
  Failed: "node.failed",
  Canceled: "node.canceled",
};

const DEFAULT_VISUAL: StatusVisualConfig = {
  label: "Unknown",
  icon: Circle,
  badgeClassName: "border-border/60 bg-muted/40 text-muted-foreground",
};

export function getStatusVisual(status: StatusValue): StatusVisualConfig {
  return STATUS_VISUALS[status] ?? DEFAULT_VISUAL;
}

interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const t = useTranslations("status");
  const { icon: Icon, label: fallbackLabel, badgeClassName, iconClassName } = getStatusVisual(status);
  const labelKey = STATUS_LABEL_KEYS[status] ?? "common.unknown";
  const label = t(labelKey);
  const ariaLabel = t("common.ariaLabel", { status: label ?? fallbackLabel });

  return (
    <Badge
      data-status={status}
      className={cn(
        "rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        badgeClassName,
        className,
      )}
      aria-label={ariaLabel}
    >
      {showIcon && Icon ? (
        <Icon className={cn("size-3.5", iconClassName)} aria-hidden="true" />
      ) : null}
      <span className="truncate">{label}</span>
    </Badge>
  );
}
