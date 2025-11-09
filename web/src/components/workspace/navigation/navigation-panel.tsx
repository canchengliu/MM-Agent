// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { GitBranch, Workflow } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useWorkspaceStore, type ViewMode } from "~/core/store/workspace-store";

import { ExecutionView } from "./execution-view";
import { HistoryView } from "./history-view";

/**
 * Dual-mode navigation for the workspace.
 */
export const NavigationPanel = () => {
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);

  const handleTabChange = (value: string) => {
    if (value === "EXECUTION" || value === "HISTORY") {
      setViewMode(value as ViewMode);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border-r bg-background/90 backdrop-blur-sm">
      <Tabs
        value={viewMode}
        onValueChange={handleTabChange}
        className="flex h-full flex-col gap-0"
      >
        <div className="shrink-0 border-b p-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="EXECUTION">
              <Workflow className="mr-2 h-4 w-4" />
              Execution
            </TabsTrigger>
            <TabsTrigger value="HISTORY">
              <GitBranch className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="EXECUTION" className="m-0 h-full">
            <ExecutionView />
          </TabsContent>
          <TabsContent value="HISTORY" className="m-0 h-full">
            <HistoryView />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
