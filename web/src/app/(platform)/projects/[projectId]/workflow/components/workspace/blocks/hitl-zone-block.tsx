"use client";

import { HistoryIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { NodeDetailView, NodeVersionRead } from "~/core/models/node.model";
import type { TranscriptData } from "../useTranscriptData";
import { TranscriptBlock } from "./transcript-block";
import { NodeStatus } from "~/constants/enums";
import { CodeViewer } from "~/components/editors/CodeViewer";
import { HITLPanelRenderer } from "../../hitl/hitl-interaction-manager";

interface HITLZoneBlockProps {
  node: NodeDetailView;
  dataSource: TranscriptData;
}

/**
 * Block 4: HITL Interaction Zone.
 * Displays the active HITL interface (SCA/AVL/VARL) or the HITL history.
 * (Design Doc 3.1.3.B2 Block 4)
 */
export function HITLZoneBlock({ node, dataSource }: HITLZoneBlockProps) {

  // Determine the mode of the HITL Zone
  // Active Interaction: Status is Awaiting HITL AND we are viewing the latest state (not historical)
  const isAwaitingHITL = node.status === NodeStatus.AwaitingHITLApproval && !dataSource.isHistorical;

  // History Review: We are viewing a finalized version (not pending).
  const isHistoryReview = !dataSource.isPending;

  // Extract HITL history (only available in NodeVersionRead)
  const hitlHistory = (isHistoryReview && dataSource.data)
    ? (dataSource.data as NodeVersionRead).hitl_history
    : null;

  const hasHistory = hitlHistory && hitlHistory.length > 0;

  // Extract accumulated interactions (only available in TemporaryExecutionRead during HITL cycles)
  const accumulatedInteractions = (dataSource.isPending && dataSource.data)
    ? dataSource.data.accumulated_hitl_interactions
    : null;

  const hasAccumulated = accumulatedInteractions && accumulatedInteractions.length > 0;

  // Define animation variants (Design Doc 5.2.3.1: Workspace Content Transition - fadeInUp)
  const transition = { duration: 0.3 }; // Duration.MEDIUM
  const variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    // Use a slight negative y on exit for a smoother transition when switching between modes
    exit: { opacity: 0, y: -10 },
  };

  return (
    // Design Doc 2.4.B: HITL Zone default expanded (managed by UIInteractionSlice defaults)
    <TranscriptBlock blockKey="hitl_zone" title="Human-in-the-Loop (HITL) Zone">
      {/* AnimatePresence for smooth transition between states (Awaiting HITL, History Review, Executing) */}
      <AnimatePresence mode="wait">
        {isAwaitingHITL ? (
          // --- Active Interaction (Design Doc 3.1.1.E) ---
          <motion.div
            key="active-hitl"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="space-y-6"
          >
            {/* Render the specialized HITL Panel (VARL, SCA, AVL) */}
            {/* HITLPanelRenderer uses the HITLInteractionContext provided by HITLInteractionManager */}
            <HITLPanelRenderer />

            {hasAccumulated && (
              <AccumulatedInteractions interactions={accumulatedInteractions} />
            )}
          </motion.div>

        ) : isHistoryReview ? (
          // --- History Review ---
          <motion.div
            key="history-review"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            <HistoryReview history={hitlHistory} hasHistory={hasHistory} />
          </motion.div>

        ) : (
          // --- Pending/Executing State ---
          <motion.div
            key="pending-executing"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="text-sm text-muted-foreground italic p-4 border rounded-lg bg-muted/50"
          >
            HITL interactions are not available while the node is executing or pending results.
          </motion.div>
        )}
      </AnimatePresence>
    </TranscriptBlock>
  );
}

// --- Helper Components (Extracted for clarity) ---

function AccumulatedInteractions({ interactions }: { interactions: any[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
        <HistoryIcon className="h-4 w-4" />
        Accumulated Interactions (This Session)
      </h4>
      {/* Display accumulated interactions using CodeViewer for structure */}
      {/* Limit height for readability */}
      <div className="max-h-64">
        <CodeViewer
          code={JSON.stringify(interactions, null, 2)}
          language="json"
          fileName="accumulated_interactions.json"
        />
      </div>
    </div>
  );
}

function HistoryReview({ history, hasHistory }: { history: any[] | null, hasHistory: boolean }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
        <HistoryIcon className="h-4 w-4" />
        Interaction History
      </h4>
      {hasHistory ? (
        // Display history using CodeViewer for structure
        <div className="max-h-64">
          <CodeViewer
            code={JSON.stringify(history, null, 2)}
            language="json"
            fileName="hitl_history.json"
          />
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic p-4 border rounded-lg bg-muted/50">
          No human interactions were recorded for this version.
        </div>
      )}
    </div>
  );
}
