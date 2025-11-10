// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ProjectStatus, ProjectSummaryRead } from "~/core/domain";

const statusCopy: Record<
  ProjectStatus,
  { badgeClass: string; label: string; helper: string }
> = {
  Configuring: {
    label: "Configuring",
    helper: "Finish setup to start the workflow.",
    badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-500/20",
  },
  Running: {
    label: "Running",
    helper: "Workflow in progress. Monitor in Flow view.",
    badgeClass: "bg-sky-100 text-sky-900 dark:bg-sky-500/20",
  },
  Completed: {
    label: "Completed",
    helper: "View artifacts and download results.",
    badgeClass: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20",
  },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

interface ProjectCardProps {
  project: ProjectSummaryRead;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusCopy[project.status];
  const href =
    project.status === "Configuring"
      ? `/projects/${project.id}/config`
      : `/projects/${project.id}/flow`;

  return (
    <Link
      href={href}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
      prefetch={false}
    >
      <Card className="h-full transition hover:border-primary/50 hover:shadow-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className={status.badgeClass}>
              {status.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Problem {project.problem_type}
            </Badge>
          </div>
          <CardTitle className="line-clamp-2 text-xl">{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end justify-between gap-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p>{status.helper}</p>
            <div className="flex items-center gap-1 text-xs uppercase tracking-wide">
              <CalendarDays className="h-4 w-4" />
              <span>Updated {dateFormatter.format(new Date(project.updated_at))}</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
        </CardContent>
      </Card>
    </Link>
  );
}
