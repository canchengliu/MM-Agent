"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, FileText, LightbulbIcon, ListChecks, EyeIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { MarkdownRenderer } from "~/components/renderers/MarkdownRenderer";
import { useHITLInteraction } from "../hitl-interaction-manager";
import {
    SCAOutputDataSchema,
    type SCACandidate,
    SCAPanelFormSchema,
    type SCAPanelFormValues
} from "~/core/models/hitl.model";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { cn } from "~/lib/utils";

interface SCAPanelProps {
  outputData: Record<string, any> | null;
}

/**
 * Strategic Choice Architecture (SCA) Panel.
 * Allows users to review analysis and select from generated candidates.
 * (Design Doc H3.1, 4.3.B.5)
 */
export function SCAPanel({ outputData }: SCAPanelProps) {
  const { setInteractionData } = useHITLInteraction();

  // 1. Validate and parse input data using the defined schema
  const validationResult = useMemo(() => SCAOutputDataSchema.safeParse(outputData), [outputData]);

  // 2. Initialize React Hook Form
  const form = useForm<SCAPanelFormValues>({
    resolver: zodResolver(SCAPanelFormSchema),
    mode: "onChange", // Validate on change to update interaction validity immediately
  });

  const selectedId = form.watch("selected_id");
  
  // 3. Determine Validity and Synchronize with HITLInteractionManager
  useEffect(() => {
    if (!validationResult.success) {
        setInteractionData(null);
        return;
    }

    const candidatesCount = validationResult.data.candidates.length;

    // Case A: No candidates generated. Interaction is valid, submission will have empty selected_ids.
    if (candidatesCount === 0) {
        setInteractionData({ selected_ids: [] });
        return;
    }

    // Case B: Candidates exist. A selection is required.
    if (selectedId) {
      setInteractionData({
        // API 5.3 requires selected_ids as an array
        selected_ids: [selectedId],
      });
    } else {
      // If no selection, interaction data is null. This disables the "Approve" button.
      setInteractionData(null);
    }
  }, [selectedId, setInteractionData, validationResult]);

  // 4. Handle invalid data structure (Robustness)
  if (!validationResult.success) {
    console.error("Invalid SCA data structure:", validationResult.error, outputData);
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Rendering Options</AlertTitle>
            <AlertDescription>
                The AI generated output does not match the expected structure.
                Please reject and ask the AI to provide options in the required format.
            </AlertDescription>
        </Alert>
    );
  }

  const data = validationResult.data;
  const { candidates, comparative_analysis } = data;

  // 5. Handle zero candidates case
  if (candidates.length === 0) {
    return (
        <Alert variant="default">
            <LightbulbIcon className="h-4 w-4" />
            <AlertTitle>No Candidates Generated</AlertTitle>
            <AlertDescription>
                The AI did not generate any candidates for review. You can Approve to continue or Reject to request regeneration.
            </AlertDescription>
        </Alert>
    );
  }

  const hasAnalysis = !!comparative_analysis && comparative_analysis.length > 0;
  // Default to analysis if present and substantial, otherwise candidates list.
  const defaultTab = hasAnalysis ? "analysis" : "candidates";

  const selectedCandidateDetails = candidates.find(c => c.id === selectedId);

  // 6. Render the SCA UI (Tabs for Analysis, Candidates, and Preview)
  return (
    <div className="space-y-6">
      {/* Instructional Header (Design Doc 4.2.E.1) */}
      <Alert variant="info">
        <LightbulbIcon className="h-4 w-4"/>
        <AlertTitle>Strategic Decision Required</AlertTitle>
        <AlertDescription>
            {/* (Design Doc 3.2.2.E.1 SCA Instruction) */}
            The AI has generated multiple approaches. Review the comparative analysis and select the preferred option to proceed.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          {hasAnalysis && (
            <TabsTrigger value="analysis">
                <FileText className="h-4 w-4"/>
                Comparative Analysis
            </TabsTrigger>
          )}
          <TabsTrigger value="candidates">
            <ListChecks className="h-4 w-4"/>
            Candidates ({candidates.length})
          </TabsTrigger>
          {/* Preview tab: visible when a selection is made */}
          {selectedId && selectedCandidateDetails && (
            <TabsTrigger value="preview">
                <EyeIcon className="h-4 w-4"/>
                Preview Selection
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab 1: Comparative Analysis */}
        {hasAnalysis && (
            <TabsContent value="analysis" className="pt-4">
            <Card>
                <CardHeader>
                <CardTitle>Analysis of Options</CardTitle>
                <CardDescription>An evaluation of the strengths and weaknesses of each approach.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MarkdownRenderer content={comparative_analysis} />
                </CardContent>
            </Card>
            </TabsContent>
        )}

        {/* Tab 2: Candidates & Selection */}
        <TabsContent value="candidates" className="pt-4">
          <Form {...form}>
            {/* The form submission is handled via the Action Footer (Approve button). */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <FormField
                control={form.control}
                name="selected_id"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-4"
                      >
                        {candidates.map((candidate) => (
                          <div key={candidate.id} className="flex items-start space-x-3">
                            <RadioGroupItem 
                              value={candidate.id} 
                              id={`candidate-${candidate.id}`}
                              className="mt-1"
                            />
                            <CandidateCard
                              candidate={candidate}
                              candidateId={candidate.id}
                              isSelected={field.value === candidate.id}
                              onSelect={() => field.onChange(candidate.id)}
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    {/* Informational message when nothing is selected */}
                    {!selectedId && <p className="text-sm text-muted-foreground italic mt-4 pt-4 border-t">Select a candidate above to enable approval and continue the workflow.</p>}
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </TabsContent>

        {/* Tab 3: Preview Selection */}
        {selectedId && selectedCandidateDetails && (
            <TabsContent value="preview" className="pt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedCandidateDetails.name}</CardTitle>
                        <CardDescription>Detailed view of the currently selected approach.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CandidateContentRenderer content={selectedCandidateDetails.content} />
                    </CardContent>
                </Card>
            </TabsContent>
        )}

      </Tabs>
    </div>
  );
}

// --- Helper Components ---

interface CandidateCardProps {
  candidate: SCACandidate;
  candidateId: string;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Helper component for rendering the candidate selection card.
 * (Design Doc 4.3.B.5: Use RadioGroup with Card.)
 */
function CandidateCard({ candidate, candidateId, isSelected, onSelect }: CandidateCardProps) {
  return (
    <div
      className="flex-1 cursor-pointer"
      onClick={() => onSelect()}
      onKeyDown={(e) => {
        // Make keyboard accessible (Space or Enter)
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Select ${candidate.name}`}
    >
      <Card
        // Highlight the selected card with distinct visual feedback
        className={cn(
          "transition-all duration-200",
          isSelected
            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-md"
            : "hover:bg-muted/50 shadow-sm hover:border-primary/50"
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle>{candidate.name}</CardTitle>
              {candidate.summary && <CardDescription className="mt-1">{candidate.summary}</CardDescription>}
            </div>
            {/* Custom visual radio indicator aligned with the design system */}
            <div
              className={cn(
                "h-5 w-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center shrink-0 mt-0.5",
                isSelected ? "bg-primary border-primary" : "border-input bg-background"
              )}
            >
              {isSelected && (
                // Inner dot for selected state
                <div className="h-2 w-2 rounded-full bg-primary-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        {/* Display content preview if summary is not present or if content is substantial */}
        {(!candidate.summary || (typeof candidate.content === "string" && candidate.content.length > 100)) && (
          <CardContent>
            <div className="text-sm text-muted-foreground line-clamp-4">
              {/* Simplified rendering for the list view */}
              {typeof candidate.content === "string" ? candidate.content : JSON.stringify(candidate.content)}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

interface CandidateContentRendererProps {
    content: SCACandidate['content'];
}

/**
 * Renders the content of a candidate, handling Markdown strings or structured objects.
 */
function CandidateContentRenderer({ content }: CandidateContentRendererProps) {
    if (content === null || content === undefined) {
        return <p className="text-sm text-muted-foreground italic">No detailed content provided for this candidate.</p>;
    }

    // Render markdown if it's a string
    if (typeof content === 'string') {
        return <MarkdownRenderer content={content} />;
    }

    // Render structured object (e.g., JSON) if it's an object
    if (typeof content === 'object') {
        // Display as formatted JSON for visibility.
        return (
            <div className="mt-2 w-full overflow-auto rounded-md bg-muted p-4 text-sm font-mono">
                <pre>
                    <code>{JSON.stringify(content, null, 2)}</code>
                </pre>
            </div>
        );
    }

    return null;
}
