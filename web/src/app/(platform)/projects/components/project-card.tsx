"use client";

import {
  MoreVertical,
  Settings,
  Trash2,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ProjectStatusBadge } from "~/components/platform/data-display/project-status-badge";
import { Timestamp } from "~/components/platform/data-display/timestamp";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { ProjectSummaryRead } from "~/core/models/project.model";

import { DeleteProjectDialog } from "./delete-project-dialog";

interface ProjectCardProps {
  project: ProjectSummaryRead;
}

/**
 * Compact summary card for a project with quick actions.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const primaryHref = project.workflow_instance_id
    ? `/projects/${project.id}/workflow`
    : `/projects/${project.id}/config`;

  const workflowSummary = project.workflow_instance_id
    ? "Workflow in progress. Continue where you left off."
    : "Workflow not started. Configure the project to begin execution.";

  return (
    <>
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <Link href={primaryHref} className="flex-1 hover:underline">
              <CardTitle className="line-clamp-2 text-lg">
                {project.name}
              </CardTitle>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  aria-label={`Project actions for ${project.name}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <ProjectStatusBadge status={project.status} />
            {project.problem_type !== "-" ? (
              <span className="text-xs font-medium text-muted-foreground">
                Problem {project.problem_type}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex-1 text-sm text-muted-foreground">
          <p className="line-clamp-3">{workflowSummary}</p>
          <dl className="mt-4 space-y-2 text-xs uppercase tracking-wide text-muted-foreground">
            <div className="flex items-center justify-between">
              <dt>Workflow</dt>
              <dd className="font-medium normal-case text-foreground">
                {project.workflow_instance_id ? "Active" : "Not started"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Project ID</dt>
              <dd className="font-mono text-foreground">#{project.id}</dd>
            </div>
          </dl>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <span className="text-xs text-muted-foreground">
            Updated <Timestamp time={project.updated_at} />
          </span>
          <Button size="sm" variant="outline" asChild>
            <Link href={primaryHref}>
              {project.workflow_instance_id ? (
                <>
                  <Workflow className="mr-2 h-4 w-4" />
                  Workflow
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </>
              )}
            </Link>
          </Button>
        </CardFooter>
      </Card>
      <DeleteProjectDialog
        project={project}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
