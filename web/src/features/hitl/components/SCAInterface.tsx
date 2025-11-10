import { useEffect, useState } from "react";

import { Markdown } from "~/components/deer-flow/markdown";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

import type { InteractionHandler } from "../HITLController";

// Represents a candidate based on API Doc 5.1.1 `pending_result` example.
export interface Candidate {
  id: string;
  name: string;
  description?: string;
  [key: string]: unknown;
}

// Expected data structure for SCA interactions.
export interface SCAData {
  candidates: Candidate[];
  comparative_analysis: string;
}

interface SCAInterfaceProps {
  data: SCAData | null | undefined;
  onInteractionChange: InteractionHandler;
  allowMultiple?: boolean;
}

/**
 * Implements the SCA (Strategic Choice Architecture) HITL interface.
 * Presents a comparative analysis and lets reviewers select preferred strategies.
 */
export function SCAInterface({
  data,
  onInteractionChange,
  allowMultiple = true,
}: SCAInterfaceProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    onInteractionChange({
      data: { selected_ids: selectedIds },
      isComplete: selectedIds.length > 0,
    });
  }, [selectedIds, onInteractionChange]);

  const handleSelect = (candidateId: string) => {
    setSelectedIds((prev) => {
      if (allowMultiple) {
        return prev.includes(candidateId)
          ? prev.filter((id) => id !== candidateId)
          : [...prev, candidateId];
      }
      return prev.includes(candidateId) ? [] : [candidateId];
    });
  };

  if (!data || !data.candidates || data.candidates.length === 0) {
    return (
      <p className="text-muted-foreground">No candidate strategies to display.</p>
    );
  }

  return (
    <div className="flex h-full flex-col gap-8">
      {data.comparative_analysis && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Comparative Analysis</h3>
          <div className="prose prose-sm max-w-none rounded-md border bg-background p-4 dark:prose-invert">
            <Markdown>{data.comparative_analysis}</Markdown>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Select Preferred Strategy/ies</h3>
        <ScrollArea className="w-full">
          <div className="flex w-max space-x-4 p-1">
            {data.candidates.map((candidate) => {
              const isSelected = selectedIds.includes(candidate.id);
              return (
                <Card
                  key={candidate.id}
                  className={cn(
                    "w-72 cursor-pointer transition-all hover:border-primary/50",
                    isSelected && "border-cyan-400 ring-2 ring-cyan-400/50",
                  )}
                  onClick={() => handleSelect(candidate.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-base">{candidate.name}</CardTitle>
                      <Checkbox
                        checked={isSelected}
                        onClick={(event) => event.stopPropagation()}
                        onCheckedChange={() => handleSelect(candidate.id)}
                        aria-label={`Select ${candidate.name}`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {candidate.description ||
                        `Details for strategy ${candidate.id}.`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
