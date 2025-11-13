"use client";

import { ChevronLeft, Loader2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShallow } from "zustand/react/shallow";

import { CockpitLayout } from "./cockpit-layout";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkflowConnection } from "~/core/hooks/use-workflow-connection";
import { useStore } from "~/core/store";
import type { WorkflowInstanceRead } from "~/core/models/workflow.model";

interface ProjectWorkflowContainerProps {
  projectId: number;
}

export function ProjectWorkflowContainer({
  projectId,
}: ProjectWorkflowContainerProps) {
  const {
    currentProject,
    isLoadingProjectDetail,
    loadProjectDetail,
    clearCurrentProject,
    workflowInstance,
    workflowIsLoading,
    workflowIsSyncing,
    loadWorkflow,
    activeNodeId,
    selectNode,
  } = useStore(
    useShallow((state) => ({
      currentProject: state.currentProject,
      isLoadingProjectDetail: state.isLoadingProjectDetail,
      loadProjectDetail: state.loadProjectDetail,
      clearCurrentProject: state.clearCurrentProject,
      workflowInstance: state.workflowInstance,
      workflowIsLoading: state.isLoading,
      workflowIsSyncing: state.isSyncing,
      loadWorkflow: state.loadWorkflow,
      activeNodeId: state.activeNodeId,
      selectNode: state.selectNode,
    })),
  );

  const [projectError, setProjectError] = useState<string | null>(null);
  const [isWorkflowRefreshing, setIsWorkflowRefreshing] = useState(false);
  const hasRequestedWorkflow = useRef(false);

  const fetchProject = useCallback(async () => {
    setProjectError(null);
    const project = await loadProjectDetail(projectId);
    if (!project) {
      setProjectError(
        "We couldn't load this project. It may have been deleted or you may not have access.",
      );
    }
  }, [loadProjectDetail, projectId]);

  useEffect(() => {
    void fetchProject();
    return () => {
      clearCurrentProject();
      hasRequestedWorkflow.current = false;
    };
  }, [clearCurrentProject, fetchProject]);

  const workflowId = currentProject?.workflow_instance_id ?? null;
  useWorkflowConnection(workflowId);

  useEffect(() => {
    if (!workflowId) {
      hasRequestedWorkflow.current = false;
      return;
    }
    if (hasRequestedWorkflow.current) return;
    hasRequestedWorkflow.current = true;
    void loadWorkflow(workflowId);
  }, [workflowId, loadWorkflow]);

  useEffect(() => {
    if (!workflowInstance) return;
    if (activeNodeId) return;
    const defaultNodeId = getDefaultNodeId(workflowInstance);
    if (defaultNodeId) {
      selectNode(defaultNodeId);
    }
  }, [workflowInstance, activeNodeId, selectNode]);

  const workflowMetrics = useMemo(() => {
    if (!workflowInstance) return null;
    const phaseCount = workflowInstance.phases.length;
    const nodeCount = workflowInstance.phases.reduce((phaseTotal, phase) => {
      return (
        phaseTotal +
        phase.stages.reduce(
          (stageTotal, stage) => stageTotal + stage.nodes.length,
          0,
        )
      );
    }, 0);
    return { phaseCount, nodeCount };
  }, [workflowInstance]);

  const handleWorkflowRefresh = useCallback(async () => {
    if (!workflowId) return;
    setIsWorkflowRefreshing(true);
    try {
      await loadWorkflow(workflowId);
    } finally {
      setIsWorkflowRefreshing(false);
    }
  }, [loadWorkflow, workflowId]);

  const showProjectLoader =
    isLoadingProjectDetail && !currentProject && !projectError;
  const showWorkflowLoader =
    workflowId !== null &&
    workflowInstance === null &&
    (workflowIsLoading || workflowIsSyncing);

  return (
    <div className="flex h-full flex-col bg-background p-6">
      <Button variant="ghost" asChild className="mb-4 w-fit">
        <Link href="/projects">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>

      <div className="flex-1 overflow-y-auto rounded-lg border bg-card p-6">
        {showProjectLoader ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {projectError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load project</AlertTitle>
            <AlertDescription>{projectError}</AlertDescription>
          </Alert>
        ) : null}

        {!currentProject && !showProjectLoader && !projectError ? (
          <Alert>
            <AlertTitle>No project selected</AlertTitle>
            <AlertDescription>
              Please return to the projects list and select a valid project.
            </AlertDescription>
          </Alert>
        ) : null}

        {currentProject ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Project #{currentProject.id}
                </p>
                <h1 className="text-2xl font-semibold">
                  {currentProject.name}
                </h1>
              </div>

              {workflowId ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => void handleWorkflowRefresh()}
                  disabled={
                    isWorkflowRefreshing ||
                    workflowIsLoading ||
                    workflowIsSyncing
                  }
                >
                  {isWorkflowRefreshing || workflowIsSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              ) : null}
            </div>

            {!workflowId ? (
              <Alert>
                <AlertTitle>Workflow not started</AlertTitle>
                <AlertDescription>
                  Start the workflow from the project configuration page to
                  unlock the cockpit view.
                </AlertDescription>
              </Alert>
            ) : null}

            {workflowId ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Workflow ID #{workflowId}
                  </p>
                  <p className="text-muted-foreground">
                    Monitor execution progress, inspect nodes, and review
                    revisions in the cockpit below.
                  </p>
                </div>

                {showWorkflowLoader ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} className="h-24 rounded-lg" />
                      ))}
                    </div>
                    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                ) : null}

                {!showWorkflowLoader && workflowInstance ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg border bg-muted/40 p-4">
                        <p className="text-sm text-muted-foreground">
                          Workflow Name
                        </p>
                        <p className="text-lg font-semibold">
                          {workflowInstance.name}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-muted/40 p-4">
                        <p className="text-sm text-muted-foreground">
                          Current Status
                        </p>
                        <p className="text-lg font-semibold">
                          {workflowInstance.status}
                        </p>
                      </div>
                      {workflowMetrics ? (
                        <div className="rounded-lg border bg-muted/40 p-4">
                          <p className="text-sm text-muted-foreground">
                            Structure Overview
                          </p>
                          <p className="text-lg font-semibold">
                            {workflowMetrics.phaseCount} phases •{" "}
                            {workflowMetrics.nodeCount} nodes
                          </p>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex h-[70vh] min-h-[28rem]">
                      <CockpitLayout
                        workflow={workflowInstance}
                        isSyncing={workflowIsSyncing || isWorkflowRefreshing}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getDefaultNodeId(workflow: WorkflowInstanceRead): number | null {
  for (const phase of workflow.phases) {
    for (const stage of phase.stages) {
      for (const node of stage.nodes) {
        if (node.status !== "Completed") {
          return node.id;
        }
      }
    }
  }

  const phases = workflow.phases;
  if (!phases.length) return null;
  const lastPhase = phases[phases.length - 1];
  if (!lastPhase) return null;
  const stages = lastPhase.stages;
  if (!stages.length) return null;
  const lastStage = stages[stages.length - 1];
  if (!lastStage) return null;
  const nodes = lastStage.nodes;
  if (!nodes.length) return null;
  const lastNode = nodes[nodes.length - 1];
  return lastNode?.id ?? null;
}
