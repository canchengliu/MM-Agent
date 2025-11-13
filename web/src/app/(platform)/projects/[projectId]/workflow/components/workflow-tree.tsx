"use client";

import { Fragment, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { NodeTreeItem } from "./node-tree-item";
import type { WorkflowInstanceRead } from "~/core/models/workflow.model";
import { useStore } from "~/core/store";
import { Duration, Easing } from "~/constants/motion";
import { cn } from "~/lib/utils";

interface WorkflowTreeProps {
  workflow: WorkflowInstanceRead;
}

export function WorkflowTree({ workflow }: WorkflowTreeProps) {
  const {
    activeNodeId,
    selectNode,
    collapsedPhases,
    collapsedStages,
    togglePhaseCollapse,
    toggleStageCollapse,
  } = useStore(
    useShallow((state) => ({
      activeNodeId: state.activeNodeId,
      selectNode: state.selectNode,
      collapsedPhases: state.collapsedPhases,
      collapsedStages: state.collapsedStages,
      togglePhaseCollapse: state.togglePhaseCollapse,
      toggleStageCollapse: state.toggleStageCollapse,
    })),
  );

  const { nodeOrderLookup, executionFrontierNodeId } = useMemo(() => {
    let runningIndex = 0;
    const lookup = new Map<number, number>();
    const flattened: number[] = [];

    workflow.phases.forEach((phase) => {
      phase.stages.forEach((stage) => {
        stage.nodes.forEach((node) => {
          lookup.set(node.id, runningIndex);
          flattened.push(node.status === "Completed" ? -1 : node.id);
          runningIndex += 1;
        });
      });
    });

    const frontierNodeId =
      flattened.find((nodeId) => nodeId !== -1) ?? null;

    return { nodeOrderLookup: lookup, executionFrontierNodeId: frontierNodeId };
  }, [workflow]);

  const frontierOrder =
    executionFrontierNodeId !== null
      ? nodeOrderLookup.get(executionFrontierNodeId) ?? null
      : null;

  const isNodeBeyondFrontier = useCallback(
    (nodeId: number) => {
      if (frontierOrder === null) return false;
      const nodeOrder = nodeOrderLookup.get(nodeId);
      if (nodeOrder === undefined) return false;
      return nodeOrder > frontierOrder;
    },
    [frontierOrder, nodeOrderLookup],
  );

  const handleNodeSelect = useCallback(
    (nodeId: number) => {
      selectNode(nodeId);
    },
    [selectNode],
  );

  if (!workflow.phases.length) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-card/30 p-4 text-sm text-muted-foreground">
        Workflow structure will appear once execution begins.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workflow.phases.map((phase, phaseIndex) => {
        const phaseKey = getPhaseKey(phase, phaseIndex);
        const isPhaseCollapsed = collapsedPhases.has(phaseKey);

        return (
          <div
            key={phaseKey}
            className="overflow-hidden rounded-xl border border-border/50 bg-card/40"
          >
            <button
              type="button"
              onClick={() => togglePhaseCollapse(phaseKey)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <span>{phase.name}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isPhaseCollapsed && "-rotate-90",
                )}
              />
            </button>

            {/* Phase Collapse/Expand Animation Container */}
            <AnimatePresence initial={false}>
              {!isPhaseCollapsed && (
                <motion.div
                  key={`${phaseKey}-content`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: Duration.FAST, ease: Easing.STANDARD }}
                  className="overflow-hidden space-y-1 border-t border-border/40 bg-card/20 py-2"
                >
                  {phase.stages.map((stage, stageIndex) => {
                    const isStageCollapsed = collapsedStages.has(stage.id);
                    return (
                      <Fragment key={stage.id}>
                        <button
                          type="button"
                          onClick={() => toggleStageCollapse(stage.id)}
                          className={cn(
                            "flex w-full items-center justify-between px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80",
                            stageIndex === 0 ? "pt-1" : "pt-2",
                          )}
                        >
                          <span>{stage.name}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isStageCollapsed && "-rotate-90",
                            )}
                          />
                        </button>

                        {/* Stage Collapse/Expand Animation Container (Refactored for robustness) */}
                        {/* (Task 25): Changed from motion.ul to motion.div. This separates the collapse animation (height/opacity) from the layout animation (inner ul). */}
                        <AnimatePresence initial={false}>
                          {!isStageCollapsed && (
                            <motion.div
                              key={`${stage.id}-nodes-container`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{
                                duration: Duration.FAST,
                                ease: Easing.STANDARD,
                              }}
                              className="overflow-hidden px-3 pb-2"
                            >
                              {/* Node List Layout Animation Container (Design Doc 5.2.1 Step 1) */}
                              {/* motion.ul with layout enables smooth resizing as nodes are added/removed */}
                              <motion.ul layout className="space-y-1">
                                {/* (Task 25): AnimatePresence manages entry/exit animations for individual nodes during structure updates (WORKFLOW_STRUCTURE_UPDATED) */}
                                {/* initial={false} prevents animation on first load (Design Doc 5.2.1) */}
                                <AnimatePresence initial={false}>
                                  {stage.nodes.map((node) => (
                                    <NodeTreeItem
                                      key={node.id}
                                      node={node}
                                      isActive={node.id === activeNodeId}
                                      isDisabled={isNodeBeyondFrontier(node.id)}
                                      onSelect={handleNodeSelect}
                                    />
                                  ))}
                                </AnimatePresence>
                              </motion.ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Fragment>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function getPhaseKey(
  phase: WorkflowInstanceRead["phases"][number],
  fallbackIndex: number,
) {
  for (const stage of phase.stages) {
    for (const node of stage.nodes) {
      if (node.phase_id) {
        return node.phase_id;
      }
    }
  }
  return `phase-${fallbackIndex}`;
}
