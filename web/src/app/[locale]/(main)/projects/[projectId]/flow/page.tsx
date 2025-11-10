// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "~/navigation";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { WorkflowInstanceRead } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { useProjectWorkspace } from "~/features/workspace/context/ProjectWorkspaceContext";
import { CanvasContainer } from "~/features/workspace/canvas/CanvasContainer";
import { useWorkflow } from "~/features/workspace/hooks/useWorkflowData";
import { InspectorPanel } from "~/features/workspace/inspector";
import { NavigatorPanel } from "~/features/workspace/navigator/NavigatorPanel";

function MobileNodeDetailView({
  workflowId,
  workflow,
}: {
  workflowId: number;
  workflow?: WorkflowInstanceRead;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center border-b p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(pathname)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to list</span>
        </Button>
        <h2 className="ml-2 font-semibold">Node Details</h2>
      </header>
      <Tabs defaultValue="view" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="m-2 shrink-0">
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="inspector">Inspector</TabsTrigger>
        </TabsList>
        <TabsContent value="view" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <CanvasContainer workflow={workflow} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="inspector" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <InspectorPanel workflowId={workflowId} />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProjectFlowPage() {
  const { workflowId } = useProjectWorkspace();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { focusNode, focusedNodeId } = useWorkspaceStore(
    useShallow((state) => ({
      focusNode: state.focusNode,
      focusedNodeId: state.focusedNodeId,
    })),
  );

  const nodeQueryParam = searchParams.get("node");
  const showMobileDetailView = !!nodeQueryParam;
  React.useEffect(() => {
    if (!nodeQueryParam) {
      if (focusedNodeId !== null) {
        focusNode(null);
      }
      return;
    }
    const parsedNodeId = Number(nodeQueryParam);
    const nextFocusedNodeId = Number.isNaN(parsedNodeId)
      ? null
      : parsedNodeId;
    if (nextFocusedNodeId !== focusedNodeId) {
      focusNode(nextFocusedNodeId);
    }
  }, [nodeQueryParam, focusNode, focusedNodeId]);

  const {
    data: workflow,
    isLoading,
    isError,
    error,
  } = useWorkflow(workflowId, { enabled: !Number.isNaN(workflowId) });

  React.useEffect(() => {
    if (focusedNodeId !== null) {
      return;
    }

    const nodes = workflow?.nodes;
    if (!nodes?.length) {
      return;
    }

    const sortedNodes = [...nodes].sort(
      (a, b) => a.order_index - b.order_index,
    );

    const nodeAwaitingHitl = sortedNodes.find(
      (node) => node.status === "Awaiting HITL Approval",
    );
    if (nodeAwaitingHitl) {
      focusNode(nodeAwaitingHitl.id);
      return;
    }

    const executingNode = sortedNodes.find((node) => node.status === "Executing");
    if (executingNode) {
      focusNode(executingNode.id);
    }
  }, [workflow, focusedNodeId, focusNode]);

  const handleMobileNodeSelect = (nodeId: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("node", String(nodeId));
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <>
      <div
        className="h-full md:hidden"
        onClickCapture={(event) => {
          const target = event.target as HTMLElement;
          const button = target.closest("button[data-node-id]");
          if (button) {
            const nodeId = button.getAttribute("data-node-id");
            if (nodeId) {
              event.preventDefault();
              event.stopPropagation();
              handleMobileNodeSelect(Number(nodeId));
            }
          }
        }}
      >
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {isError && (
          <div className="p-4 text-center text-sm text-destructive">
            Failed to load workflow data.
          </div>
        )}
        {workflow &&
          (showMobileDetailView ? (
            <MobileNodeDetailView workflowId={workflowId} workflow={workflow} />
          ) : (
            <NavigatorPanel workflowId={workflowId} />
          ))}
      </div>

      <div className="hidden h-full min-h-0 bg-background text-foreground md:block">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-destructive">
            <p>Failed to load workflow.</p>
            <p className="text-xs text-destructive/80">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        ) : (
          <CanvasContainer workflow={workflow} />
        )}
      </div>
    </>
  );
}
