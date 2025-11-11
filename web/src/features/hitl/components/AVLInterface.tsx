"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardHeader } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import type { AVLInteractionData } from "~/core/domain";
import type { PendingResult } from "~/core/domain/node.types";

interface AVLInterfaceProps {
  data: PendingResult;
  onInteractionChange: (
    data: AVLInteractionData | null,
    isReady: boolean,
  ) => void;
}

/**
 * Renders the Adjudicate & Verify Loop (AVL) HITL interface.
 * Users must adjudicate each AI-generated critique.
 */
type Critique = {
  critique_id: string;
  content: string;
};

export function AVLInterface({ data, onInteractionChange }: AVLInterfaceProps) {
  const critiques = useMemo(() => {
    const rawCritiques = data.output_data?.critiques;
    return Array.isArray(rawCritiques) ? (rawCritiques as Critique[]) : [];
  }, [data]);
  const [adjudications, setAdjudications] = useState<
    Record<string, "Accepted" | "Rejected">
  >({});

  useEffect(() => {
    setAdjudications({});
  }, [data]);

  const handleAdjudication = (
    critiqueId: string,
    decision: "Accepted" | "Rejected",
  ) => {
    setAdjudications((prev) => ({ ...prev, [critiqueId]: decision }));
  };

  useEffect(() => {
    if (critiques.length === 0) {
      onInteractionChange({ adjudication: [] }, true);
      return;
    }

    const allAdjudicated = critiques.every((critique) =>
      Object.prototype.hasOwnProperty.call(adjudications, critique.critique_id),
    );

    const interactionData: AVLInteractionData | null = allAdjudicated
      ? {
          adjudication: Object.entries(adjudications).map(
            ([critique_id, decision]) => ({ critique_id, decision }),
          ),
        }
      : null;

    onInteractionChange(interactionData, allAdjudicated);
  }, [adjudications, critiques, onInteractionChange]);

  return (
    <div className="p-4">
      <h3 className="mb-2 text-lg font-semibold">Adjudicate & Verify Loop</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Please review and adjudicate each critique to refine the result.
      </p>
      <div className="space-y-4">
        {critiques.length > 0 ? (
          critiques.map((critique) => (
            <Card key={critique.critique_id}>
              <CardHeader className="p-4">
                <p className="mb-3 text-sm">{critique.content}</p>
                <RadioGroup
                  onValueChange={(value: "Accepted" | "Rejected") =>
                    handleAdjudication(critique.critique_id, value)
                  }
                  value={adjudications[critique.critique_id]}
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Accepted"
                      id={`accept-${critique.critique_id}`}
                    />
                    <Label htmlFor={`accept-${critique.critique_id}`}>
                      Accept
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Rejected"
                      id={`reject-${critique.critique_id}`}
                    />
                    <Label htmlFor={`reject-${critique.critique_id}`}>
                      Reject
                    </Label>
                  </div>
                </RadioGroup>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            No critiques to display.
          </p>
        )}
      </div>
    </div>
  );
}
