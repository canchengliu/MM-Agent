// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import { useWorkspaceStore } from "~/core/store";
import { useNodeDetail } from "~/features/workspace/hooks/useWorkflowData";

import {
  CurrentVersionTab,
  CurrentVersionTabSkeleton,
} from "./components/CurrentVersionTab";
import { HistoryTab } from "./components/HistoryTab";
import { InputOutputTab } from "./components/InputOutputTab";

interface InspectorPanelProps {
  workflowId: number;
}

export function InspectorPanel({ workflowId }: InspectorPanelProps) {
  const focusedNodeId = useWorkspaceStore((state) => state.focusedNodeId);
  const {
    data: node,
    isLoading,
    isError,
    error,
    refetch,
  } = useNodeDetail(focusedNodeId);

  if (!focusedNodeId) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
        Select a node from the navigator to inspect its execution details.
      </div>
    );
  }

  if (isLoading) {
    return <CurrentVersionTabSkeleton />;
  }

  if (isError || !node) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Unable to load node details."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="current" className="flex h-full flex-col gap-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold">{node.name}</p>
        <p className="text-xs text-muted-foreground">Definition {node.definition_id}</p>
      </div>
      <TabsList className="w-full">
        <TabsTrigger value="current">Current Version</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="io">Input / Output</TabsTrigger>
      </TabsList>
      <TabsContent value="current" className="flex-1 overflow-y-auto">
        <CurrentVersionTab node={node} />
      </TabsContent>
      <TabsContent value="history" className="flex-1 overflow-y-auto">
        <HistoryTab
          activeVersionId={node.active_version_id}
          workflowId={workflowId}
        />
      </TabsContent>
      <TabsContent value="io" className="flex-1 overflow-y-auto">
        <InputOutputTab node={node} />
      </TabsContent>
    </Tabs>
  );
}
