"use client";

import { Link as LinkIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import type { NodeDetailView, NodeVersionRead } from "~/core/models/node.model";
import type { TranscriptData } from "../useTranscriptData";
import { TranscriptBlock } from "./transcript-block";
import { useStore } from "~/core/store";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface InputsBlockProps {
  node: NodeDetailView;
  dataSource: TranscriptData;
}

/**
 * Block 1: Inputs & Dependencies.
 * Displays the upstream node versions consumed to generate the current view.
 * (Design Doc 3.1.3.B2 Block 1)
 */
export function InputsBlock({ node, dataSource }: InputsBlockProps) {
  const { selectNode, nodesById } = useStore(useShallow((state) => ({
      selectNode: state.selectNode,
      nodesById: state.nodesById,
  })));

  // Input dependencies are only available on finalized versions (NodeVersionRead).
  // Pending results (TemporaryExecutionRead) do not have finalized input_dependencies yet (API 5.5.2 vs 5.5.3).
  const dependencies = (dataSource.data && !dataSource.isPending)
    ? (dataSource.data as NodeVersionRead).input_dependencies
    : null;

  const hasDependencies = dependencies && Object.keys(dependencies).length > 0;

  return (
    // Design Doc 2.4.B: Inputs default collapsed (managed by UIInteractionSlice defaults)
    <TranscriptBlock blockKey="inputs" title="Inputs & Dependencies">
      {hasDependencies ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This result was generated using the following upstream versions:
          </p>
          <div className="flex flex-col gap-3">
            {Object.entries(dependencies).map(([upstreamNodeIdStr, versionId]) => {
              const upstreamNodeId = parseInt(upstreamNodeIdStr, 10);
              // Look up the node name from the global store for better context
              const upstreamNode = nodesById.get(upstreamNodeId);
              const nodeName = upstreamNode ? upstreamNode.name : `Node ID: ${upstreamNodeId}`;
              const definitionId = upstreamNode ? upstreamNode.definition_id : "N/A";

              return (
                <div
                  key={upstreamNodeId}
                  className="flex items-center justify-between rounded-md border bg-secondary/30 p-3 text-sm transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                        <p className="font-medium truncate" title={nodeName}>{nodeName}</p>
                        <p className="text-xs text-muted-foreground">ID: {definitionId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Badge variant="secondary">Version {versionId}</Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectNode(upstreamNodeId)}
                        disabled={!upstreamNode}
                    >
                        View Node
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic p-4 border rounded-lg bg-muted/50">
          {dataSource.isPending
            ? "Input dependencies will be finalized upon completion."
            : (node.order_index === 0
                ? "This is the starting node; it has no upstream dependencies."
                : "No upstream dependencies recorded for this version.")
          }
        </div>
      )}
    </TranscriptBlock>
  );
}

