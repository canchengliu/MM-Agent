"use client";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useHITLInteraction } from "../hitl-interaction-manager";

interface VARLPanelProps {
  // VARL panel generally doesn't need the output data itself, as the user reviews it in Block 3.
  outputData: Record<string, any> | null;
}

/**
 * VARL (Verify, Approve, Reject Loop) Panel.
 * The most basic HITL mode. Simply requires the user to review the output and decide.
 * No specific interaction data is needed. (Design Doc 3.1.1.E, H3.3)
 */
export function VARLPanel({ outputData }: VARLPanelProps) {
  const { setInteractionData } = useHITLInteraction();

  // In VARL mode, there's no specific interaction data to collect from the panel.
  // We ensure the interaction data is reset (null) when this panel mounts.
  // The manager's isInteractionValid will return true for VARL regardless of this data.
  useEffect(() => {
    setInteractionData(null);
  }, [setInteractionData]);

  return (
    <div className="pt-4">
      {/* Use the 'awaiting' status color (Amber 500) for visual indication (Design Doc 4.1.3) */}
      <Alert variant="default" className="border-status-awaiting bg-status-awaiting/10">
        <CheckCircle className="h-4 w-4 text-status-awaiting" />
        <AlertTitle className="font-semibold">Review Required (VARL Mode)</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          {/* Standardized instruction (Design Doc 3.2.1) */}
          Please review the generated output in Block 3 above. Use the actions in the footer (B3) below to Approve, Reject with feedback, or Discard this execution attempt.
        </AlertDescription>
      </Alert>
    </div>
  );
}

