"use client";

import { cva, type VariantProps } from "class-variance-authority";

import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import type {
  ProjectStatus,
  ProjectSummaryRead,
} from "~/core/domain/project.types";
import { cn } from "~/lib/utils";

const statusBadgeVariants = cva("capitalize", {
  variants: {
    status: {
      Configuring: "bg-muted-foreground/20 text-muted-foreground",
      Running:
        "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      Completed:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  },
});

type StatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  status: ProjectStatus;
};

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusBadgeVariants({ status }))}>
      {status}
    </Badge>
  );
}

export function ProjectCard({ project }: { project: ProjectSummaryRead }) {
  return (
    <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg dark:group-hover:shadow-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="line-clamp-2 text-base leading-snug">
            {project.name}
          </CardTitle>
          <StatusBadge status={project.status} />
        </div>
        <CardDescription>Type: {project.problem_type}</CardDescription>
      </CardHeader>
      <CardFooter className="flex-col items-start pt-0">
        <p className="text-xs text-muted-foreground">
          Updated: {new Date(project.updated_at).toLocaleString()}
        </p>
      </CardFooter>
    </Card>
  );
}
