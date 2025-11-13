"use client";

import { AlertTriangle } from "lucide-react";
// Import AnimatePresence for entry/exit animations (Design Doc 5.2.4)
import { AnimatePresence, motion } from "framer-motion";

import { NodeStatusIcon } from "~/components/platform/workflow/node-status-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { Duration, Easing } from "~/constants/motion";
import { cn } from "~/lib/utils";

interface NodeTreeItemProps {
  node: NodeInstanceRead;
  isActive: boolean;
  /**
   * Indicates if the node is beyond the execution frontier (SRS 5.2, Design Doc N3.2).
   */
  isDisabled: boolean;
  onSelect: (nodeId: number) => void;
}

/**
 * Represents a single node in the Workflow Navigator Tree.
 * Handles visualization of status, staleness, selection state, and execution frontier constraints.
 * (Design Doc 5.1.2.A)
 */
export function NodeTreeItem({
  node,
  isActive,
  isDisabled,
  onSelect,
}: NodeTreeItemProps) {
  return (
    // (Task 25): motion.li implementation according to Design Doc 5.2.1 for Layout Animations (Arch Doc 7.1.2).
    // This enables smooth transitions when the workflow structure changes dynamically.
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{
        // Use spring physics for natural layout movement when other nodes move (Design Doc 5.2.1).
        layout: { type: "spring", stiffness: 350, damping: 30 },
        // Use standard easing for the insertion/exit animation itself (Design Doc 5.2.1).
        default: { duration: Duration.MEDIUM, ease: Easing.ENTER },
      }}
      className="overflow-hidden"
    >
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) {
            onSelect(node.id);
          }
        }}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "group relative flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "h-8", // Explicit height h-8 (32px) (Design Doc 5.1.2.A2)
          "border-l-4 border-transparent",
          "hover:bg-accent/40",
          // Active State (Design Doc 5.1.2.A2): bg-accent, border-l-4 border-primary
          isActive && "border-primary bg-accent/60 text-foreground shadow-sm",
          // Disabled State (Execution Frontier) (Design Doc 5.1.2.A2): opacity-50, cursor-not-allowed
          isDisabled &&
            "cursor-not-allowed opacity-50 hover:bg-transparent focus-visible:ring-0",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {/* Status Icon (Design Doc 5.1.2.A3) */}
          <NodeStatusIcon status={node.status} />
          <span className="truncate font-medium">{node.name}</span>
        </span>

        {/* Staleness Indicator (Design Doc 5.1.2.A4, V4.1) (Task 24.2) */}
        {/* Use AnimatePresence to enable the subtle entry/exit animation */}
        <AnimatePresence>
          {node.is_stale && (
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Apply spring animation as specified in Design Doc (Lines 1691-1712) (Task 24.2 Animation) */}
                <motion.span
                  key="stale-indicator"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 20,
                  }}
                  // Use semantic color for awaiting/warning (Amber) (Design Doc 5.1.2.A4)
                  className="inline-flex items-center text-status-awaiting"
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Node output is stale.</span>
                </motion.span>
              </TooltipTrigger>
              <TooltipContent align="end">
                {/* Required tooltip content (Design Doc 5.1.2.A4) */}
                Stale: Upstream dependency has changed.
              </TooltipContent>
            </Tooltip>
          )}
        </AnimatePresence>
      </button>
    </motion.li>
  );
}