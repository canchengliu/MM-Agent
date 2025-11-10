// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import {
  AlertCircle,
  ArrowLeft,
  Book,
  Check,
  ChevronRight,
  Code2,
  GitCommit,
  Loader2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { shallow } from "zustand/react/shallow";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { NodeStateVersion } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { useActivateVersion } from "~/features/workspace/hooks/useNodeActions";
import { useVersionDetail } from "~/features/workspace/hooks/useWorkflowData";

interface VersionReviewViewProps {
  nodeId: number;
  versionId: number;
  workflowId: number;
  isHistorical: boolean;
  nodeName: string;
}

function TimeTravelBanner({
  nodeId,
  version,
  workflowId,
}: {
  nodeId: number;
  version: NodeStateVersion;
  workflowId: number;
}) {
  const inspectVersion = useWorkspaceStore((state) => state.inspectVersion);
  const activateVersionMutation = useActivateVersion();

  const handleActivate = () => {
    activateVersionMutation.mutate(
      {
        nodeId,
        versionId: version.id,
        workflowId,
        versionNumber: version.version_number,
      },
      {
        onSuccess: () => {
          inspectVersion(null);
        },
      },
    );
  };

  return (
    <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-full border border-primary/20 bg-background/80 p-2 pl-4 text-sm shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <p>You are viewing a historical version.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => inspectVersion(null)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Active View
        </Button>
        <Button
          size="sm"
          onClick={handleActivate}
          disabled={activateVersionMutation.isPending}
        >
          {activateVersionMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Activate This Version
        </Button>
      </div>
    </div>
  );
}

export function VersionReviewView({
  nodeId,
  versionId,
  workflowId,
  isHistorical,
  nodeName,
}: VersionReviewViewProps) {
  const {
    data: version,
    isLoading,
    isError,
    error,
  } = useVersionDetail(nodeId, versionId);

  const { focusNode, inspectVersion } = useWorkspaceStore(
    (state) => ({
      focusNode: state.focusNode,
      inspectVersion: state.inspectVersion,
    }),
    shallow,
  );

  const handleDependencyClick = (
    upstreamNodeId: string,
    upstreamVersionId: number,
  ) => {
    focusNode(Number(upstreamNodeId));
    inspectVersion(upstreamVersionId);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-4 text-muted-foreground">Loading version details...</p>
      </div>
    );
  }

  if (isError || !version) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p>Failed to load version details.</p>
        <p className="text-xs text-destructive/80">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  const title = isHistorical
    ? `Reviewing v${version.version_number} of "${nodeName}"`
    : `Active Version (v${version.version_number}) of "${nodeName}"`;

  return (
    <div className="relative h-full w-full">
      {isHistorical && (
        <TimeTravelBanner
          nodeId={nodeId}
          version={version}
          workflowId={workflowId}
        />
      )}
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-4xl space-y-6 p-8 pt-10 md:pt-20">
          <h1 className="text-2xl font-semibold">{title}</h1>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Book className="h-4 w-4" /> Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {version.summary ?? "No summary provided."}
              </p>
            </CardContent>
          </Card>

          {Object.keys(version.input_versions).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitCommit className="h-4 w-4" /> Input Dependencies
                </CardTitle>
                <CardDescription>
                  This version was generated using these specific upstream
                  versions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Object.entries(version.input_versions).map(
                    ([upstreamNodeId, upstreamVersionId]) => (
                      <li key={upstreamNodeId}>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-sm"
                          onClick={() =>
                            handleDependencyClick(
                              upstreamNodeId,
                              upstreamVersionId,
                            )
                          }
                        >
                          Input from Node {upstreamNodeId}
                          <ChevronRight className="h-4 w-4" />
                          Version {upstreamVersionId}
                        </Button>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Code2 className="h-4 w-4" /> Final Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[500px] overflow-auto rounded-md bg-muted/50 p-4 text-xs">
                {JSON.stringify(version.output_data, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {version.hitl_records?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4" /> HITL Interaction
                  History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-[500px] overflow-auto rounded-md bg-muted/50 p-4 text-xs">
                  {JSON.stringify(version.hitl_records, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
