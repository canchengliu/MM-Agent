// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkflow } from "~/features/workspace/hooks/useWorkflowData";
import { NodeListItem } from "./NodeListItem";

interface NavigatorPanelProps {
  workflowId: number;
}

/**
 * Left-side navigator for workflow nodes with animated updates.
 */
export function NavigatorPanel({ workflowId }: NavigatorPanelProps) {
  const {
    data: workflow,
    isLoading,
    isError,
    error,
  } = useWorkflow(workflowId);

  const sortedNodes = useMemo(() => {
    if (!workflow?.nodes) {
      return [];
    }
    return [...workflow.nodes].sort((a, b) => a.order_index - b.order_index);
  }, [workflow?.nodes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-sm text-destructive">
        <p>Failed to load workflow.</p>
        <p className="text-xs">
          {error instanceof Error ? error.message : String(error ?? "")}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <AnimatePresence>
        <motion.div
          className="space-y-1 p-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {sortedNodes.map((node) => (
            <motion.div key={node.id} variants={itemVariants}>
              <NodeListItem node={node} workflowId={workflowId} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </ScrollArea>
  );
}
