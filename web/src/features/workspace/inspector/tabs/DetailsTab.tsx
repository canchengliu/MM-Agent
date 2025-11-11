"use client";

import { Loader2 } from "lucide-react";
import React, { useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { NodeDetailView } from "~/core/domain/node.types";
import { useWorkspaceStore } from "~/core/store/workspace.store";
import {
  useReExecuteNode,
  useRetryNode,
} from "~/features/workspace/hooks/useNodeActions";

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="grid grid-cols-[110px_1fr] items-center gap-2 text-sm">
    <dt className="truncate text-muted-foreground" title={label}>
      {label}
    </dt>
    <dd className="truncate text-right font-mono text-foreground">{value}</dd>
  </div>
);

function ReExecuteDialog({
  node,
  workflowId,
}: {
  node: NodeDetailView;
  workflowId: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const { mutate: reExecute, isPending } = useReExecuteNode(workflowId);
  const isGenerator = node.node_type === "Generator";

  const handleConfirm = () => {
    reExecute(
      {
        nodeId: node.id,
        payload: { modification_comments: comment || undefined },
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setComment("");
        },
      },
    );
  };

  const triggerButton = (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending || isGenerator}
      onClick={() => {
        if (!isGenerator) {
          setIsOpen(true);
        }
      }}
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Re-execute
    </Button>
  );

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">{triggerButton}</div>
          </TooltipTrigger>
          {isGenerator && (
            <TooltipContent>
              <p>Generator nodes cannot be re-executed.</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Re-execute Node: {node.name}</DialogTitle>
            <DialogDescription>
              Start a new execution for this completed node. Optionally include
              comments for the run.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Optional comments or instructions..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Re-execution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RetryDialog({
  node,
  workflowId,
}: {
  node: NodeDetailView;
  workflowId: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const { mutate: retry, isPending } = useRetryNode(workflowId);

  const handleConfirm = () => {
    retry(
      {
        nodeId: node.id,
        payload: { modification_comments: comment || undefined },
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setComment("");
        },
      },
    );
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => setIsOpen(true)}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Retry
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retry Failed Node: {node.name}</DialogTitle>
            <DialogDescription>
              Resolve external issues, leave an optional note, and trigger
              another attempt.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Optional: summarize the fix before retrying..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Retry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DetailsTab({
  node,
  workflowId,
}: {
  node: NodeDetailView;
  workflowId: number;
}) {
  const setManualEditing = useWorkspaceStore(
    (state) => state.setManualEditing,
  );
  const isGenerator = node.node_type === "Generator";

  return (
    <div className="space-y-6">
      <section>
        <h4 className="mb-3 text-sm font-semibold">Node Properties</h4>
        <dl className="space-y-2">
          <DetailItem
            label="Status"
            value={<Badge variant="outline">{node.status}</Badge>}
          />
          <DetailItem label="Type" value={node.node_type} />
          <DetailItem label="HITL Mode" value={node.hitl_mode} />
          <DetailItem label="Order Index" value={node.order_index} />
          <DetailItem label="Phase" value={node.phase_id ?? "N/A"} />
        </dl>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold">Active Version</h4>
        {node.active_version ? (
          <dl className="space-y-2">
            <DetailItem label="Version ID" value={node.active_version.id} />
            <DetailItem
              label="Version No."
              value={node.active_version.version_number}
            />
            <DetailItem label="Source" value={node.active_version.source} />
            <DetailItem
              label="Created"
              value={new Date(node.active_version.created_at).toLocaleString()}
            />
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            No active version for this node.
          </p>
        )}
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold">Actions</h4>
        <div className="flex flex-wrap items-center gap-2">
          {node.status === "Completed" && (
            <>
              <ReExecuteDialog node={node} workflowId={workflowId} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isGenerator}
                        onClick={() => {
                          if (!isGenerator) {
                            setManualEditing(true);
                          }
                        }}
                      >
                        Manual Edit
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {isGenerator && (
                    <TooltipContent>
                      <p>Generator nodes cannot be manually edited.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          {node.status === "Failed" && (
            <RetryDialog node={node} workflowId={workflowId} />
          )}
          {node.status !== "Completed" && node.status !== "Failed" && (
            <p className="text-xs text-muted-foreground">
              No actions available for the current node status.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
