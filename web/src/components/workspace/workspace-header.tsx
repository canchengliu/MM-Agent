"use client";

import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckIcon,
  PauseIcon,
} from "lucide-react";

import { ExportProjectButton } from "~/components/projects/export-project-button";
import { Badge } from "~/components/ui/badge";

type ProjectStatus = "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED" | "ERROR";

interface WorkspaceHeaderProps {
  projectId: string;
}

const statusBadge = (status: ProjectStatus) => {
  switch (status) {
    case "RUNNING":
      return (
        <Badge className="bg-blue-500 text-white hover:bg-blue-600">
          <ActivityIcon className="h-3 w-3 animate-pulse" />
          Running
        </Badge>
      );
    case "PAUSED":
      return (
        <Badge className="bg-purple-500 text-white hover:bg-purple-600" variant="secondary">
          <PauseIcon className="h-3 w-3" />
          Paused (HITL)
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="bg-green-600 text-white hover:bg-green-700">
          <CheckIcon className="h-3 w-3" />
          Completed
        </Badge>
      );
    case "ERROR":
      return (
        <Badge variant="destructive">
          <AlertTriangleIcon className="h-3 w-3" />
          Error
        </Badge>
      );
    default:
      return <Badge variant="outline">Idle</Badge>;
  }
};

export function WorkspaceHeader({ projectId }: WorkspaceHeaderProps) {
  const projectName = `Logistics Optimization (ID: ${projectId.substring(0, 8)})`;
  const status: ProjectStatus = "RUNNING";

  return (
    <header className="flex h-12 shrink-0 items-center justify-between bg-background/80 px-4 backdrop-blur-sm border-b">
      <div className="flex items-center space-x-4 overflow-hidden">
        <h1 className="truncate text-base font-semibold" title={projectName}>
          {projectName}
        </h1>
        {statusBadge(status)}
      </div>
      <div className="flex shrink-0 items-center space-x-2">
        <ExportProjectButton projectId={projectId} />
      </div>
    </header>
  );
}
