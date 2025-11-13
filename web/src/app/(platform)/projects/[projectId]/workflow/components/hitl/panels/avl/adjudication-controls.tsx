"use client";

import { useFormContext } from "react-hook-form";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Textarea } from "~/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import type { AVLPanelFormValues } from "~/core/models/hitl.model";
import { Check, X } from "lucide-react";
import { cn } from "~/lib/utils";

interface AdjudicationControlsProps {
  critiqueId: string;
}

/**
 * Renders the Accept/Reject controls and the optional comment box for a single critique.
 * Must be used within a React Hook Form context (provided by AVLPanel).
 * (Design Doc 1421)
 */
export function AdjudicationControls({ critiqueId }: AdjudicationControlsProps) {
  // Access the form context provided by AVLPanel
  const form = useFormContext<AVLPanelFormValues>();

  // Define the specific field names within the nested form structure
  // We use nested paths for RHF: adjudications.{critiqueId}.decision
  const decisionFieldName = `adjudications.${critiqueId}.decision` as const;
  const commentFieldName = `adjudications.${critiqueId}.comment` as const;

  return (
    <div className="space-y-4">
      {/* Decision (Accept/Reject) - Using ToggleGroup for clear, mutually exclusive selection */}
      <FormField
        control={form.control}
        name={decisionFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium text-muted-foreground">Decision</FormLabel>
            <FormControl>
              {/* ToggleGroup acts as a stylized RadioGroup */}
              <ToggleGroup
                type="single"
                variant="outline"
                className="grid grid-cols-2 gap-2 w-full"
                // When a value is selected, RHF updates the form state.
                // Since the form initialization starts empty, this action also adds the critiqueId key to the 'adjudications' map.
                onValueChange={field.onChange}
                value={field.value}
              >
                {/* Accept Button */}
                <ToggleGroupItem
                    value="Accepted"
                    aria-label="Accept critique"
                    // Apply specific styling when selected (state=on) using data attributes
                    className={cn(
                        "data-[state=on]:bg-green-100 data-[state=on]:text-green-800 data-[state=on]:border-green-500",
                        "dark:data-[state=on]:bg-green-900/50 dark:data-[state=on]:text-green-400 dark:data-[state=on]:border-green-600"
                    )}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </ToggleGroupItem>
                {/* Reject Button */}
                <ToggleGroupItem
                    value="Rejected"
                    aria-label="Reject critique"
                    className={cn(
                        "data-[state=on]:bg-red-100 data-[state=on]:text-red-800 data-[state=on]:border-red-500",
                        "dark:data-[state=on]:bg-red-900/50 dark:data-[state=on]:text-red-400 dark:data-[state=on]:border-red-600"
                    )}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </ToggleGroupItem>
              </ToggleGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Optional Comment */}
      <FormField
        control={form.control}
        name={commentFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium text-muted-foreground">Comment (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide context or reasoning for your decision..."
                className="min-h-[80px] text-sm"
                {...field}
                // Ensure controlled component by handling potential null/undefined values from RHF
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

