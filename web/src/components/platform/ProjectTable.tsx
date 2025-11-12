"use client";

import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ProjectSummaryRead } from "~/core/api/types";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { StatusBadge } from "./StatusBadge";

interface ProjectTableProps {
  projects: ProjectSummaryRead[];
  isLoading?: boolean;
  emptyState?: ReactNode;
  onProjectClick?: (project: ProjectSummaryRead) => void;
  onEdit?: (project: ProjectSummaryRead) => void;
  onRequestDelete?: (project: ProjectSummaryRead) => void;
  referenceTime: number;
}

type Translator = (key: string, values?: Record<string, unknown>) => string;

function formatRelativeTime(value: string, now: number, t: Translator) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return t("relativeTime.unknown");
  }

  const diffMs = Math.max(0, now - date.getTime());
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t("relativeTime.justNow");
  if (minutes < 60) return t("relativeTime.minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("relativeTime.hours", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t("relativeTime.days", { count: days });
  return date.toLocaleDateString();
}

function getProblemTypeLabel(type: ProjectSummaryRead["problem_type"], t: Translator) {
  return type === "-" ? t("problemType.unassigned") : t("problemType.assigned", { type });
}

function ProjectTableComponent({
  projects,
  isLoading,
  emptyState,
  onProjectClick,
  onEdit,
  onRequestDelete,
  referenceTime,
}: ProjectTableProps) {
  const t = useTranslations("projects.table");
  const statusT = useTranslations("status");
  const showEmptyState = !isLoading && projects.length === 0;
  const showSkeleton = isLoading && projects.length === 0;
  const [currentTime, setCurrentTime] = useState(referenceTime);
  const defaultEmptyState = useMemo(
    () => (
      <div className="flex flex-col items-center gap-2 px-8 py-16 text-center text-sm text-muted-foreground">
        <p>{t("empty.title")}</p>
        <p className="max-w-md text-xs text-muted-foreground/80">{t("empty.subtitle")}</p>
      </div>
    ),
    [t],
  );

  useEffect(() => {
    setCurrentTime(referenceTime);
  }, [referenceTime]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <Card className="overflow-hidden border-border bg-card shadow-md">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-card">
              <TableHead>{t("headers.name")}</TableHead>
              <TableHead>{t("headers.status")}</TableHead>
              <TableHead>{t("headers.typeAndUpdated")}</TableHead>
              <TableHead className="text-right">{t("headers.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!showSkeleton &&
              projects.map((project) => (
                <TableRow
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  onClick={() => onProjectClick?.(project)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onProjectClick?.(project);
                    }
                  }}
                >
                  <TableCell className="font-medium text-base">
                    {project.name}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {getProblemTypeLabel(project.problem_type, t)}
                      </span>
                      <span className="text-xs uppercase tracking-wide">
                        {t("lastUpdated", { time: formatRelativeTime(project.updated_at, currentTime, t) })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={(event) => event.stopPropagation()}
                          type="button"
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">{t("actions.openMenu")}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit?.(project);
                          }}
                        >
                          <Pencil className="size-4" />
                          {t("actions.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={(event) => {
                            event.stopPropagation();
                            onRequestDelete?.(project);
                          }}
                        >
                          <Trash2 className="size-4" />
                          {t("actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {showEmptyState && (emptyState ?? defaultEmptyState)}
      </CardContent>
    </Card>
  );
}

export const ProjectTable = memo(ProjectTableComponent);
