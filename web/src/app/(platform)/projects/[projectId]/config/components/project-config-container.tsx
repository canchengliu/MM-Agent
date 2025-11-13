"use client";

import {
  AlertCircle,
  ChevronLeft,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useShallow } from "zustand/react/shallow";

import { ProjectStatusBadge } from "~/components/platform/data-display/project-status-badge";
import { Timestamp } from "~/components/platform/data-display/timestamp";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useStore } from "~/core/store";

import { FileManagement } from "./file-management";
import { InitializeHistoricalDialog } from "./initialize-historical-dialog";
import { ProblemTypeSelector } from "./problem-type-selector";
import { ProjectDetailsForm } from "./project-details-form";
import { WorkflowStartControl } from "./workflow-start-control";

interface ProjectConfigContainerProps {
  projectId: number;
}

export function ProjectConfigContainer({
  projectId,
}: ProjectConfigContainerProps) {
  const {
    currentProject,
    isLoadingProjectDetail,
    loadProjectDetail,
    clearCurrentProject,
  } = useStore(
    useShallow((state) => ({
      currentProject: state.currentProject,
      isLoadingProjectDetail: state.isLoadingProjectDetail,
      loadProjectDetail: state.loadProjectDetail,
      clearCurrentProject: state.clearCurrentProject,
    })),
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoadError(null);
    setIsRefreshing(true);
    try {
      const project = await loadProjectDetail(projectId);
      if (!project) {
        setLoadError(
          "We couldn't load this project. It may have been deleted or you may not have access.",
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [loadProjectDetail, projectId]);

  useEffect(() => {
    void fetchProject();
    return () => {
      clearCurrentProject();
    };
  }, [clearCurrentProject, fetchProject]);

  const projectMeta = useMemo(() => {
    if (!currentProject) return null;
    const items: Array<{ label: string; value: ReactNode }> = [
      { label: "Project ID", value: `#${currentProject.id}` },
      {
        label: "Created",
        value: <Timestamp time={currentProject.created_at} />,
      },
      {
        label: "Updated",
        value: <Timestamp time={currentProject.updated_at} />,
      },
      {
        label: "Workflow",
        value: currentProject.workflow_instance_id ? "Started" : "Not started",
      },
    ];
    if (currentProject.historical_problem_id) {
      items.push({
        label: "Initialized From",
        value: `Case ID #${currentProject.historical_problem_id}`,
      });
    }
    return items;
  }, [currentProject]);

  const showLoader = isLoadingProjectDetail && !currentProject && !loadError;

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      {/* Use a slightly wider max-width for the new layout */}
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        {/* Header Section: Navigation, Status, and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Side: Back navigation */}
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link href="/projects">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>

          {/* Right Side: Status, Actions, Refresh */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Info */}
            {currentProject && (
              <div className="hidden items-center gap-3 text-sm text-muted-foreground sm:flex">
                <ProjectStatusBadge status={currentProject.status} />
                <span>
                  Last updated <Timestamp time={currentProject.updated_at} />
                </span>
              </div>
            )}

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchProject()}
              disabled={isRefreshing || isLoadingProjectDetail}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>

            {/* Initialize Action (Task 7) */}
            {currentProject && (
              <InitializeHistoricalDialog project={currentProject} />
            )}
          </div>
        </div>

        {loadError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to load project</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        {showLoader ? (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed bg-background">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {/* Main configuration layout (Reorganized) */}
        {currentProject ? (
          // Grid layout: 2/3 for configuration, 1/3 for actions/metadata
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Core Configuration (2/3 width) */}
            <div className="space-y-6 lg:col-span-2">
              <ProjectDetailsForm project={currentProject} />
              <ProblemTypeSelector project={currentProject} />
              <FileManagement project={currentProject} />
            </div>

            {/* Right Column: Actions and Metadata (1/3 width) */}
            <div className="space-y-6 lg:col-span-1">
              {/* Primary Action: Start Workflow (Task 7) */}
              <WorkflowStartControl project={currentProject} />

              {/* Metadata Snapshot */}
              {projectMeta ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Snapshot</CardTitle>
                    <CardDescription>
                      Quick reference for auditing and workflow readiness.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-3 text-sm">
                      {projectMeta.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between"
                        >
                          <dt className="text-muted-foreground">
                            {item.label}
                          </dt>
                          <dd className="font-medium text-foreground">
                            {item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
