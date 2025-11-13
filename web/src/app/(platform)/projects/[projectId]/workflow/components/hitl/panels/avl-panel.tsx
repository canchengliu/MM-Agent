"use client";

import React, { useEffect, useMemo } from "react";
import { type z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, XCircle, MessageSquareText, Info, AlertTriangle } from "lucide-react";

import { MarkdownRenderer } from "~/components/renderers/MarkdownRenderer";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Form } from "~/components/ui/form";
import {
  AVLOutputDataSchema,
  type AVLOutputData,
  type AVLCritique,
  type AVLSeverity,
  AVLPanelFormSchema,
  type AVLPanelFormValues,
  type AVLDecision,
} from "~/core/models/hitl.model";
import { useHITLInteraction } from "../hitl-interaction-manager";
// Import the newly created controls component
import { AdjudicationControls } from "./avl/adjudication-controls";
import { cn } from "~/lib/utils";

interface AVLPanelProps {
  outputData: Record<string, any> | null;
}

/**
 * Adversarial Validation Loop (AVL) Panel.
 * Allows users to review and adjudicate AI-generated critiques.
 * (Design Doc H3.2, 4.3.B.5)
 */
export function AVLPanel({ outputData }: AVLPanelProps) {
  const { setInteractionData } = useHITLInteraction();

  // 1. Parse and Validate Input Data
  const parseResult = useMemo(() => AVLOutputDataSchema.safeParse(outputData), [outputData]);

  const avlData: AVLOutputData | null = parseResult.success ? parseResult.data : null;
  const critiques = avlData?.critiques ?? [];

  // 2. Dynamic Form Schema Generation (Design Doc 4.3.B.5 Key implementation)
  // The validation requirement (all critiques must be adjudicated) depends on the actual critique IDs present.
  const dynamicFormSchema = useMemo(() => {
    // We refine the base schema to ensure the 'adjudications' record contains an entry for every critique ID.
    return AVLPanelFormSchema.refine(
      (data) => {
        const adjudicatedIds = Object.keys(data.adjudications ?? {});
        // Check if every critique ID from the input data is present in the form's adjudications map.
        // Since the item schema (AVLAdjudicationFormItemSchema) requires 'decision', this ensures full adjudication.
        return critiques.every((critique) => adjudicatedIds.includes(critique.id));
      },
      {
        message: "All critiques must be adjudicated before submission.",
        // Apply the error globally rather than to a specific field.
      }
    );
  }, [critiques]);

  // 3. Initialize React Hook Form
  const form = useForm<AVLPanelFormValues>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      adjudications: {},
    },
    mode: "onChange", // Validate continuously as the user interacts
  });

  const { watch, formState } = form;
  const watchedAdjudications = watch("adjudications");

  // 4. Synchronize Form State with HITL Interaction Manager
  useEffect(() => {
    // Handle the edge case where 0 critiques are provided (implicit pass)
    if (critiques.length === 0) {
        // If validation passed automatically (no critiques), submit empty adjudication array (API 5.3).
        setInteractionData({ adjudication: [] });
        return;
    }

    if (formState.isValid) {
      const formData = form.getValues();
      // Transform the form data (map structure) into the required API format (array of adjudications - API 5.3).
      const interactionData = {
        adjudication: Object.entries(formData.adjudications ?? {}).map(
          ([critique_id, adjudication]) => ({
            critique_id,
            decision: adjudication.decision,
            // Ensure comment is null if empty string or undefined/null
            comment: adjudication.comment || null,
          })
        ),
      };
      setInteractionData(interactionData);
    } else {
      // If invalid (not all adjudicated), signal that submission is not possible.
      setInteractionData(null);
    }
    // Dependency array ensures sync happens on validity change or adjudication updates.
  }, [formState.isValid, watchedAdjudications, setInteractionData, form, critiques.length]);

  // --- Rendering Logic ---

  if (!parseResult.success) {
    return <AVLParseError error={parseResult.error} />;
  }

  if (critiques.length === 0) {
    // Handle case where AI generated no critiques (automatic pass).
    return <AVLNoCritiques summary={avlData?.validation_summary} />;
  }

  // UX Optimization: Automatically open High/Critical severity critiques by default.
  const defaultOpenItems = critiques
    .filter(c => c.severity === 'High' || c.severity === 'Critical')
    .map(c => c.id);

  // If no high/critical, open the first one if the list isn't too long
  if (defaultOpenItems.length === 0 && critiques.length > 0 && critiques.length < 10) {
    defaultOpenItems.push(critiques[0].id);
  }

  return (
    <div className="space-y-6">
      <AVLHeader validationSummary={avlData?.validation_summary} critiquesCount={critiques.length} />

      {/* Provide RHF context to the form elements */}
      <Form {...form}>
        {/* Native form element is useful for accessibility, though submission is handled by HITLInteractionManager */}
        <form>
          {/* Use Accordion to display critiques (Design Doc 1419) */}
          <Accordion type="multiple" defaultValue={defaultOpenItems} className="w-full border rounded-lg shadow-sm">
            {critiques.map((critique) => (
              <CritiqueItem
                key={critique.id}
                critique={critique}
                // Pass the current adjudication state for this specific critique from the form watch
                adjudication={watchedAdjudications?.[critique.id] ?? null}
              />
            ))}
          </Accordion>
        </form>
      </Form>

      {/* Display overall status and guidance */}
      <AVLStatusFooter isValid={formState.isValid} />
    </div>
  );
}

// --- Helper Components ---

function AVLHeader({ validationSummary, critiquesCount }: { validationSummary?: string | null, critiquesCount: number }) {
  // Design Doc 866: Instruction prompt
  return (
    <Alert variant="default" className="bg-card">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-base font-semibold">AI Critic Validation Results ({critiquesCount})</AlertTitle>
      <AlertDescription className="text-sm space-y-3">
        <p>
          The AI Critic has identified potential issues. Please adjudicate each critique (Accept/Reject) to complete the validation cycle.
        </p>
        {/* Display the AI-generated summary if available */}
        {validationSummary && (
           <div className="prose dark:prose-invert max-w-none p-4 border rounded-md bg-background/50">
             <h4 className="text-sm font-medium mb-2">Validation Summary</h4>
             <MarkdownRenderer content={validationSummary} />
           </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface CritiqueItemProps {
  critique: AVLCritique;
  adjudication: { decision: AVLDecision, comment?: string | null } | null;
}

function CritiqueItem({ critique, adjudication }: CritiqueItemProps) {
  const isAdjudicated = !!adjudication;

  return (
    <AccordionItem value={critique.id} className="last:border-b-0">
      {/* Accordion Header/Trigger */}
      <AccordionTrigger className={cn(
        "px-4 py-3 hover:bg-muted/50 transition-colors rounded-none",
        // Highlight unadjudicated items visually (Design Doc 1422)
        !isAdjudicated && "font-semibold text-foreground bg-yellow-500/10 dark:bg-yellow-500/20 hover:bg-yellow-500/15"
      )}>
        <div className="flex items-center gap-4 w-full">
          <AdjudicationStatusIcon decision={adjudication?.decision} />
          <span className="flex-1 text-left truncate">{critique.title}</span>
          {critique.severity && <SeverityBadge severity={critique.severity} />}
          {/* Icon indicating if a comment was provided */}
          {adjudication?.comment && <MessageSquareText className="w-4 h-4 text-muted-foreground" title="Comment provided"/>}
        </div>
      </AccordionTrigger>

      {/* Accordion Content (Details and Controls) */}
      <AccordionContent className="px-4 pt-2 pb-6 border-t bg-background">
        {/* Use a grid layout for details (left) and controls (right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1 & 2: Critique Description */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
            <div className="prose dark:prose-invert max-w-none text-sm">
              <MarkdownRenderer content={critique.description} />
            </div>
          </div>
          {/* Column 3: Adjudication Controls */}
          <div className="md:col-span-1 space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Your Adjudication</h4>
            {/* The AdjudicationControls component hooks into the RHF context */}
            <AdjudicationControls critiqueId={critique.id} />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// Visual indicator of the adjudication status (Accepted, Rejected, Pending)
function AdjudicationStatusIcon({ decision }: { decision?: AVLDecision }) {
  if (decision === "Accepted") {
    return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />;
  }
  if (decision === "Rejected") {
    return <XCircle className="w-5 h-5 text-red-600 dark:text-red-500" />;
  }
  // Unadjudicated (Pending) state
  return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />;
}

// Styled badge for critique severity
function SeverityBadge({ severity }: { severity: AVLSeverity }) {
  // Define styling variants for different severity levels
  const variants: Record<AVLSeverity, { variant: string, className: string }> = {
    Low: { variant: "secondary", className: "" },
    Medium: { variant: "default", className: "bg-yellow-100 text-yellow-800 border-yellow-500/50 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-600/50" },
    High: { variant: "default", className: "bg-orange-100 text-orange-800 border-orange-500/50 dark:bg-orange-900/50 dark:text-orange-400 dark:border-orange-600/50" },
    Critical: { variant: "destructive", className: "" },
  };

  const config = variants[severity] || variants.Low;

  return (
    // Apply variant and custom color classes
    <Badge variant={config.variant as any} className={cn("text-xs font-medium", config.className)}>
      {severity}
    </Badge>
  );
}

// Footer displaying overall validation status and guidance for the user.
function AVLStatusFooter({ isValid }: { isValid: boolean }) {
    if (isValid) {
        return (
            <Alert variant="default" className="border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-900/20">
                <CheckCircle2 className="h-4 w-4 !text-green-600 dark:!text-green-500"/>
                <AlertTitle>Ready for Submission</AlertTitle>
                <AlertDescription>
                    All critiques have been adjudicated. You can now proceed using the &quot;Approve & Continue&quot; button. This will trigger the next iteration (AVLLoop) or finalize the node based on your input.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Alert variant="default" className="border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:bg-yellow-900/20">
            <Info className="h-4 w-4 !text-yellow-600 dark:!text-yellow-500"/>
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
                There are remaining critiques requiring adjudication. The &quot;Approve & Continue&quot; button is disabled until all items are resolved.
            </AlertDescription>
        </Alert>
    );
}


// State when AI generates zero critiques.
function AVLNoCritiques({ summary }: { summary?: string | null }) {
  // If there are no critiques, the form is automatically valid (handled in useEffect).
  return (
    <Alert variant="default" className="border-green-500 bg-green-500/10 dark:bg-green-900/20">
      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
      <AlertTitle className="text-base font-semibold">Validation Passed: No Critiques Found</AlertTitle>
      <AlertDescription className="text-sm space-y-2">
        <p>The AI Critic did not identify any issues during this validation cycle.
        You can proceed using the &quot;Approve & Continue&quot; button.</p>
        {summary && (
            <div className="prose dark:prose-invert prose-sm max-w-none mt-3 pt-3 border-t border-green-300/50 dark:border-green-700/50">
                <MarkdownRenderer content={summary} />
            </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

// State when input data fails Zod validation.
function AVLParseError({ error }: { error: z.ZodError }) {
  console.error("Failed to parse AVL output data:", error.errors);
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error Loading AVL Interface</AlertTitle>
      <AlertDescription>
        The data required for the Adversarial Validation Loop (AVL) could not be processed due to structural issues. Please try rejecting and regenerating the output.
        <details className="mt-2 text-xs">
          <summary>Error Details</summary>
          <pre className="mt-1 p-2 bg-red-800/20 rounded overflow-auto">{JSON.stringify(error.errors.map(e => `${e.path.join('.')}: ${e.message}`), null, 2)}</pre>
        </details>
      </AlertDescription>
    </Alert>
  );
}
