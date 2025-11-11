"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import type { SCAInteractionData } from "~/core/domain";
import type { PendingResult } from "~/core/domain/node.types";

interface SCAInterfaceProps {
  data: PendingResult;
  onInteractionChange: (
    data: SCAInteractionData | null,
    isReady: boolean,
  ) => void;
}

/**
 * Renders the Strategic Candidate/s (SCA) HITL interface which lets
 * reviewers pick one or more proposed strategies before approving.
 */
type SCACandidate = {
  id: string;
  name: string;
  comparative_analysis?: string;
};

export function SCAInterface({ data, onInteractionChange }: SCAInterfaceProps) {
  const candidates = useMemo(() => {
    const rawCandidates = data.output_data?.candidates;
    return Array.isArray(rawCandidates)
      ? (rawCandidates as SCACandidate[])
      : [];
  }, [data]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Reset selection when the underlying node result changes
  useEffect(() => {
    setSelectedIds([]);
  }, [data]);

  const handleSelectionChange = (candidateId: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, candidateId] : prev.filter((id) => id !== candidateId),
    );
  };

  useEffect(() => {
    const isReady = selectedIds.length > 0;
    const interactionData = isReady ? { selected_ids: selectedIds } : null;
    onInteractionChange(interactionData, isReady);
  }, [selectedIds, onInteractionChange]);

  return (
    <div className="p-4">
      <h3 className="mb-2 text-lg font-semibold">Select a Strategic Candidate</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Review the proposed options and select one or more to proceed.
      </p>
      <div className="space-y-4">
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <Card key={candidate.id}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                <Checkbox
                  id={`sca-${candidate.id}`}
                  checked={selectedIds.includes(candidate.id)}
                  onCheckedChange={(checked) =>
                    handleSelectionChange(candidate.id, !!checked)
                  }
                />
                <Label
                  htmlFor={`sca-${candidate.id}`}
                  className="w-full cursor-pointer"
                >
                  <CardTitle className="text-base">{candidate.name}</CardTitle>
                </Label>
              </CardHeader>
              {candidate.comparative_analysis && (
                <CardContent className="border-t p-4 text-sm text-muted-foreground">
                  {candidate.comparative_analysis}
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            No candidates to display.
          </p>
        )}
      </div>
    </div>
  );
}
