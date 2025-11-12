"use client";

import { GitBranch, Loader2, PlugZap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import type { ProjectDetail } from "~/core/api/types";
import { useWorkflowStore } from "~/core/store/WorkflowStore";
import { webSocketManager } from "~/core/websocket";

import { WorkflowCanvas } from "../canvas/WorkflowCanvas";

interface ExecutionViewProps {
  project: ProjectDetail;
}

export function ExecutionView({ project }: ExecutionViewProps) {
  const workflowId = project.workflow_instance_id ?? null;
  const t = useTranslations("workspace.execution");

  const { workflow, isLoading } = useWorkflowStore((state) => ({
    workflow: state.workflow,
    isLoading: state.isLoading,
  }));
  const loadWorkflow = useWorkflowStore((state) => state.loadWorkflow);
  const clearWorkflow = useWorkflowStore((state) => state.clearWorkflow);

  useEffect(() => {
    if (!workflowId) {
      clearWorkflow();
      webSocketManager.disconnect();
      return;
    }

    void loadWorkflow(workflowId).catch((error) => {
      console.error("[ExecutionView] Failed to load workflow", error);
    });

    webSocketManager.connect(workflowId);

    return () => {
      webSocketManager.disconnect();
      clearWorkflow();
    };
  }, [workflowId, loadWorkflow, clearWorkflow]);

  if (!workflowId) {
    return (
      <section className="flex h-full flex-col items-center justify-center gap-3 bg-background px-6 text-center text-sm text-muted-foreground">
        <PlugZap className="size-6 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{t("notStarted.title")}</p>
          <p>{t("notStarted.description")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex h-full flex-1 flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_1px,_transparent_1px)] [background-size:32px_32px]" />
      <div className="relative flex flex-1 flex-col p-6">
        <header className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
          <GitBranch className="size-5 text-primary" aria-hidden="true" />
          <span>{t("header")}</span>
        </header>
        <div className="flex flex-1 items-stretch justify-center rounded-2xl border border-border/70 bg-background/80 backdrop-blur">
          {isLoading && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
              <p>{t("loadingGraph")}</p>
            </div>
          )}

          {!isLoading && workflow && (
            <div className="relative flex flex-1 overflow-hidden p-4">
              <WorkflowCanvas />
            </div>
          )}

          {!isLoading && !workflow && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <PlugZap className="size-6 text-muted-foreground" aria-hidden="true" />
              <p>{t("loadFailed")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
