"use client";

import { Info } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useWorkspaceStore } from "~/core/store/workspace.store";
import { useNodeDetail } from "~/features/workspace/hooks/useWorkflowData";

import { DetailsTab } from "./tabs/DetailsTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { InputOutputTab } from "./tabs/InputOutputTab";

function InspectorPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <Info className="h-10 w-10 text-muted-foreground/50" />
      <p className="mt-4 text-sm font-semibold">Inspector Panel</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Select a node from the navigator or canvas to inspect its properties and
        history.
      </p>
    </div>
  );
}

function InspectorLoader() {
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
      <div className="space-y-4 pt-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
}

export function InspectorPanel({ workflowId }: { workflowId: number }) {
  const focusedNodeId = useWorkspaceStore((state) => state.focusedNodeId);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    setActiveTab("details");
  }, [focusedNodeId]);

  const {
    data: node,
    isLoading,
    isError,
    error,
  } = useNodeDetail(focusedNodeId);

  const errorMessage =
    error && error instanceof Error ? error.message : "Unknown error";

  let content: React.ReactNode = null;

  if (!focusedNodeId) {
    content = <InspectorPlaceholder />;
  } else if (isLoading) {
    content = <InspectorLoader />;
  } else if (isError) {
    content = (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-destructive">
        Error loading node details: {errorMessage}
      </div>
    );
  } else if (!node) {
    content = (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        Node not found.
      </div>
    );
  } else {
    content = (
      <div className="flex h-full flex-col p-4">
        <header className="flex-shrink-0 pb-4">
          <h2 className="truncate font-semibold tracking-tight" title={node.name}>
            {node.name}
          </h2>
          <p className="text-xs text-muted-foreground">ID: {node.definition_id}</p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 flex-col"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="io">I/O</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex-1 overflow-y-auto pr-2">
            <TabsContent value="details">
              {activeTab === "details" && (
                <DetailsTab node={node} workflowId={workflowId} />
              )}
            </TabsContent>
            <TabsContent value="history">
              {activeTab === "history" && (
                <HistoryTab node={node} workflowId={workflowId} />
              )}
            </TabsContent>
            <TabsContent value="io">
              {activeTab === "io" && <InputOutputTab node={node} />}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      {content}
    </div>
  );
}
