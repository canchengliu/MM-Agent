"use client";

import { ChevronDown } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { useStore } from "~/core/store";
import { cn } from "~/lib/utils";

interface TranscriptBlockProps {
  // Unique key for this block (e.g., 'inputs', 'artifacts', 'output') used for state management
  blockKey: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  // Optional: Allow forcing the block open regardless of the store state (e.g., during execution)
  forceOpen?: boolean;
}

/**
 * Reusable wrapper component for blocks within the Interaction Transcript (B2).
 * Implements Design Doc 5.1.3.B2: Uses Shadcn/ui Card and Collapsible.
 * Manages expansion state via Zustand (UIInteractionSlice).
 */
export function TranscriptBlock({
  blockKey,
  title,
  children,
  className,
  forceOpen = false,
}: TranscriptBlockProps) {
  const { isExpanded, toggleBlockExpansion } = useStore(
    useShallow((state) => ({
      // Check if this specific block key is in the expandedBlocks Set
      isExpanded: state.expandedBlocks.has(blockKey),
      toggleBlockExpansion: state.toggleBlockExpansion,
    })),
  );

  // The block is open if forced open OR if the user state dictates it.
  const isOpen = forceOpen || isExpanded;

  const handleOpenChange = (open: boolean) => {
    // If forceOpen is true, we prevent closing via user interaction on the toggle.
    if (forceOpen && !open) return;
    toggleBlockExpansion(blockKey, open);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn("transition-all duration-300", className)}
    >
      {/* Design Doc 5.1.3.B2: Use Card as container */}
      <Card className="shadow-sm transition-shadow duration-300 hover:shadow-md">
        <CardHeader className="p-4">
          {/* Use CollapsibleTrigger to handle the interaction */}
          <CollapsibleTrigger asChild disabled={forceOpen}>
            {/* Use a div wrapper for layout and cursor control */}
            <div className={cn("flex items-center justify-between group", !forceOpen ? "cursor-pointer" : "cursor-default")}>
              <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">{title}</CardTitle>
              {/* Hide the chevron if forced open, otherwise show and animate it */}
              {!forceOpen && (
                  <ChevronDown
                    className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:text-primary",
                        { "rotate-180": isOpen },
                    )}
                    aria-hidden="true"
                  />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        {/* forceMount ensures the content (like Monaco) initializes correctly even if initially collapsed */}
        <CollapsibleContent forceMount className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-hidden">
          {/* Add a top border only when content is visible for visual separation */}
          <CardContent className="border-t border-border/70 p-4">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

