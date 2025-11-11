"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  AVLInteractionData,
  SCAInteractionData,
} from "~/core/domain";
import type { NodeDetailView } from "~/core/domain/node.types";

import { AVLInterface } from "./components/AVLInterface";
import { HITLActionBar } from "./components/HITLActionBar";
import { SCAInterface } from "./components/SCAInterface";
import { VARLInterface } from "./components/VARLInterface";

type InteractionPayload =
  | SCAInteractionData
  | AVLInteractionData
  | Record<string, unknown>;

interface HITLControllerProps {
  node: NodeDetailView;
  workflowId: number;
}

export function HITLController({ node, workflowId }: HITLControllerProps) {
  const [interactionData, setInteractionData] = useState<InteractionPayload | null>(
    null,
  );
  const [isApprovalReady, setIsApprovalReady] = useState(false);

  useEffect(() => {
    setInteractionData(null);
    setIsApprovalReady(false);
  }, [node.id]);

  const handleInteractionChange = useCallback(
    (data: InteractionPayload | null, isReady: boolean) => {
      setInteractionData(data);
      setIsApprovalReady(isReady);
    },
    [],
  );

  const getInteractionData = useCallback(
    () => interactionData,
    [interactionData],
  );

  const renderSpecificInterface = () => {
    if (!node.pending_result) {
      return (
        <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
          No pending result to review for this node.
        </div>
      );
    }

    switch (node.hitl_mode) {
      case "SCA":
        return (
          <SCAInterface
            data={node.pending_result}
            onInteractionChange={handleInteractionChange}
          />
        );
      case "AVL":
        return (
          <AVLInterface
            data={node.pending_result}
            onInteractionChange={handleInteractionChange}
          />
        );
      case "VARL":
        return (
          <VARLInterface
            data={node.pending_result}
            onInteractionChange={handleInteractionChange}
          />
        );
      default:
        return (
          <div className="flex h-full items-center justify-center p-4 text-destructive">
            Unknown HITL mode: {node.hitl_mode}
          </div>
        );
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-grow overflow-y-auto">{renderSpecificInterface()}</div>
      {/* The action bar handles all submission logic */}
      <HITLActionBar
        nodeId={node.id}
        workflowId={workflowId}
        getInteractionData={getInteractionData}
        isApprovalReady={isApprovalReady}
      />
    </div>
  );
}
