"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkspaceStore } from "~/core/store/workspace.store";
import { normalizePositions } from "~/features/workflow-graph/execution-view/layout.utils";
import {
  useStalenessReport,
  useWorkflow,
} from "~/features/workspace/hooks/useWorkflowData";

import { NodeListItem } from "./NodeListItem";

/**
 * Renders the left-side navigation panel for the workflow,
 * displaying a linear list of all nodes and their real-time status.
 */
export function NavigatorPanel({ workflowId }: { workflowId: number }) {
  const { data: workflow, isLoading, isError } = useWorkflow(workflowId);
  const { data: stalenessReport } = useStalenessReport(workflowId);
  const { focusedNodeId, focusNode } = useWorkspaceStore();

  if (isLoading) {
    return (
      <div className="flex h-full flex-col p-4">
        <header className="mb-4 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </header>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !workflow) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-destructive" />
        <p className="text-sm font-semibold text-destructive">
          Error Loading Workflow
        </p>
        <p className="text-xs text-muted-foreground">
          Could not retrieve workflow data. Please try again later.
        </p>
      </div>
    );
  }

  const sortedNodes = normalizePositions(workflow.nodes);

  return (
    <div className="flex h-full flex-col p-2">
      <header className="flex-shrink-0 px-2 pt-2 pb-4">
        <h2 className="font-semibold tracking-tight">Workflow Navigator</h2>
        <p
          className="truncate text-xs text-muted-foreground"
          title={workflow.name}
        >
          {workflow.name}
        </p>
      </header>
      <ScrollArea className="flex-1">
        {/* Animate list changes to highlight new nodes */}
        <motion.ul layout className="space-y-1 pr-2">
          <AnimatePresence>
            {sortedNodes.map((node) => (
              <motion.li
                key={node.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <NodeListItem
                  node={node}
                  isStale={!!stalenessReport?.[String(node.id)]}
                  stalenessDetails={stalenessReport?.[String(node.id)] ?? null}
                  isFocused={node.id === focusedNodeId}
                  onClick={() => focusNode(node.id)}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </ScrollArea>
    </div>
  );
}
