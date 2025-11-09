// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { Info } from "lucide-react";

import { Separator } from "~/components/ui/separator";
import { useWorkspaceStore } from "~/core/store/workspace-store";

import { PanelContainer, PanelContent, PanelHeader } from "../panel-placeholders";
import { NodeInspector } from "./node-inspector";

const LiveInspectorPlaceholder = () => (
  <PanelContent>
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Live context</p>
        <p className="text-xs text-muted-foreground">
          Workflow logs and step metadata will appear here while in live mode.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
        <Info className="h-6 w-6 text-muted-foreground/80" aria-hidden />
        <p>Switch to a workflow step to view contextual information.</p>
      </div>
    </div>
  </PanelContent>
);

export const ContextualPanel = () => {
  const uiMode = useWorkspaceStore((state) => state.uiMode);

  return (
    <PanelContainer className="border-l bg-background/90 backdrop-blur-sm">
      <PanelHeader title="[C] Contextual Panel" />
      {uiMode === "history_review" ? <NodeInspector /> : <LiveInspectorPlaceholder />}
    </PanelContainer>
  );
};
