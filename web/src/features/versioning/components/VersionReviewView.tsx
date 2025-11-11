"use client";

import {
  ArrowLeft,
  Clock,
  Link as LinkIcon,
  Replace,
  ToyBrick,
  Users,
} from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { HITLRecord, NodeInstanceId } from "~/core/domain/version.types";
import { useWorkspaceStore } from "~/core/store/workspace.store";
import { useActivateVersion } from "~/features/workspace/hooks/useNodeActions";
import {
  useNodeDetail,
  useVersionDetail,
} from "~/features/workspace/hooks/useWorkflowData";

interface VersionReviewViewProps {
  nodeId: NodeInstanceId;
  versionId: number;
  workflowId: number;
  isActiveVersion: boolean;
}

function VersionReviewSkeleton() {
  return (
    <div className="h-full space-y-4 p-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

function TimeTravelBanner({
  versionNumber,
  onReturn,
  onActivate,
  isActivating,
  isGenerator,
}: {
  versionNumber: number;
  onReturn: () => void;
  onActivate: () => void;
  isActivating: boolean;
  isGenerator: boolean;
}) {
  const triggerButton = (
    <Button
      variant="default"
      size="sm"
      onClick={onActivate}
      disabled={isActivating || isGenerator}
    >
      <Replace className="mr-2 h-4 w-4" />
      {isActivating ? "Activating..." : "Activate This Version"}
    </Button>
  );

  return (
    <Alert className="mb-4 border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300">
      <AlertTitle className="font-semibold">Time Travel Mode</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
        You are reviewing historical version {versionNumber}.
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReturn}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Active
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">{triggerButton}</div>
              </TooltipTrigger>
              {isGenerator && (
                <TooltipContent>
                  <p>Generator nodes cannot have their versions changed.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </AlertDescription>
    </Alert>
  );
}

function HITLRecordCard({ record }: { record: HITLRecord }) {
  return (
    <Card className="bg-muted/50">
      <CardHeader className="flex-row items-center justify-between p-3">
        <CardTitle className="text-sm font-semibold">
          {record.interaction_type} Interaction
        </CardTitle>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(record.timestamp).toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-xs">
        <pre className="whitespace-pre-wrap rounded bg-background/50 p-2 font-mono">
          {JSON.stringify(record.user_input, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

export function VersionReviewView({
  nodeId,
  versionId,
  workflowId,
  isActiveVersion,
}: VersionReviewViewProps) {
  const { data: node } = useNodeDetail(nodeId);
  const {
    data: version,
    isLoading,
    isError,
  } = useVersionDetail(nodeId, versionId);
  const { inspectVersion, focusNode } = useWorkspaceStore();
  const { mutate: activateVersion, isPending: isActivating } =
    useActivateVersion(workflowId);

  const handleActivate = () => {
    if (!version) return;
    activateVersion({ nodeId, versionId: version.id });
  };

  if (isLoading || !node) {
    return <VersionReviewSkeleton />;
  }

  if (isError || !version) {
    return (
      <div className="p-4 text-destructive">Error loading version details.</div>
    );
  }

  const outputEntries = Object.entries(version.output_data ?? {});
  const inputEntries = Object.entries(version.input_versions ?? {});
  const isGenerator = node.node_type === "Generator";

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        {!isActiveVersion && (
          <TimeTravelBanner
            versionNumber={version.version_number}
            onReturn={() => inspectVersion(null)}
            onActivate={handleActivate}
            isActivating={isActivating}
            isGenerator={isGenerator}
          />
        )}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Version {version.version_number} Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
              <div className="font-semibold text-muted-foreground">
                Version ID
              </div>
              <div className="font-mono">{version.id}</div>
              <div className="font-semibold text-muted-foreground">Source</div>
              <div>
                <Badge variant="outline">{version.source}</Badge>
              </div>
              <div className="font-semibold text-muted-foreground">
                Created At
              </div>
              <div>{new Date(version.created_at).toLocaleString()}</div>
              <div className="font-semibold text-muted-foreground">Summary</div>
              <div className="col-span-full sm:col-span-1">
                {version.summary || "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ToyBrick className="h-5 w-5" />
                Output Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {outputEntries.length > 0 ? (
                outputEntries.map(([key, value]) => (
                  <div key={key}>
                    <h4 className="font-semibold capitalize">
                      {key.replace(/_/g, " ")}
                    </h4>
                    <div className="mt-1 rounded-md border bg-muted/30 p-3">
                      {typeof value === "string" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {value}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-xs">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No output captured for this version.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LinkIcon className="h-5 w-5" />
                Input Dependencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {inputEntries.length > 0 ? (
                  inputEntries.map(([node, ver]) => (
                    <li
                      key={node}
                      className="flex items-center justify-between"
                    >
                      <span>
                        Depends on Node{" "}
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          onClick={() =>
                            focusNode(Number(node) as NodeInstanceId)
                          }
                        >
                          #{node}
                        </Button>
                      </span>
                      <Badge variant="secondary">Version {ver}</Badge>
                    </li>
                  ))
                ) : (
                  <p className="text-muted-foreground">No input dependencies.</p>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                HITL History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {version.hitl_records.length > 0 ? (
                version.hitl_records.map((record, index) => (
                  <HITLRecordCard key={`${record.timestamp}-${index}`} record={record} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No HITL interactions recorded for this version.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
