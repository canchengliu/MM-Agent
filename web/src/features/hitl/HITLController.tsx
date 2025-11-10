import { useCallback, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { NodeDetailView } from "~/core/domain";

import { HITLActionBar } from "./components/HITLActionBar";
import { AVLInterface, type AVLData } from "./components/AVLInterface";
import { SCAInterface, type SCAData } from "./components/SCAInterface";
import { VARLInterface } from "./components/VARLInterface";
import { useSubmitHITL } from "./hooks/useHITL";

interface HITLControllerProps {
  node: NodeDetailView;
  workflowId: number;
}

export interface InteractionUpdate {
  data: Record<string, any> | null;
  isComplete: boolean;
}

export type InteractionHandler = (update: InteractionUpdate) => void;

export function HITLController({ node, workflowId }: HITLControllerProps) {
  const { mutate: submit, isPending: isSubmitting } = useSubmitHITL();

  const [interactionData, setInteractionData] = useState<Record<string, any> | null>(null);
  const [isInteractionComplete, setInteractionComplete] = useState(false);

  const handleInteractionChange = useCallback<InteractionHandler>((update) => {
    setInteractionData(update.data ?? null);
    setInteractionComplete(update.isComplete);
  }, []);

  const handleApprove = () => {
    submit({
      nodeId: node.id,
      workflowId,
      payload: {
        action: "Continue",
        interaction_data: interactionData,
      },
    });
  };

  const handleReject = (feedback: string) => {
    submit({
      nodeId: node.id,
      workflowId,
      payload: {
        action: "RejectAndProvideModificationComments",
        feedback_comment: feedback,
      },
    });
  };

  const handleDiscard = () => {
    submit({
      nodeId: node.id,
      workflowId,
      payload: {
        action: "Discard",
      },
    });
  };

  const renderContent = () => {
    switch (node.hitl_mode) {
      case "SCA":
        return (
          <SCAInterface
            data={node.pending_result?.output_data as SCAData}
            onInteractionChange={handleInteractionChange}
            allowMultiple={true}
          />
        );
      case "AVL":
        return (
          <AVLInterface
            data={node.pending_result?.output_data as AVLData}
            onInteractionChange={handleInteractionChange}
          />
        );
      case "VARL":
        return (
          <VARLInterface
            content={node.pending_result?.output_data}
            onInteractionChange={handleInteractionChange}
          />
        );
      default:
        return (
          <p className="text-sm text-destructive">
            Unknown HITL Mode: {node.hitl_mode}
          </p>
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <Card className="mx-auto h-full max-w-4xl border-amber-400/50 bg-card shadow-lg shadow-amber-500/5">
          <CardHeader>
            <CardTitle>Decision Point: {node.name}</CardTitle>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </div>
      <HITLActionBar
        onApprove={handleApprove}
        onReject={handleReject}
        onDiscard={handleDiscard}
        isSubmitting={isSubmitting}
        isApprovalDisabled={!isInteractionComplete}
      />
    </div>
  );
}
