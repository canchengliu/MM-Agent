"use client";

import { Bot, Pencil } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { NodeVersionRead } from "~/core/models/node.model";
import { VersionSource } from "~/constants/enums";
// Assuming Tooltip components are available in the project structure.
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

interface VersionCardProps {
  version: NodeVersionRead;
  isActive: boolean; // Is this the globally active version?
  isViewing: boolean; // Is this the version currently loaded in the workspace?
  onReview: () => void;
  onActivate: () => void;
  disabled: boolean; // Disable actions when an operation is in progress or forbidden
  // (Task 23 Enhancement): Optional reason for disabling, used for tooltips.
  disableReason?: string;
}

/**
 * C2. Version Card Component.
 * Displays a compact summary of a historical version.
 * (Design Doc 5.1.4.C2)
 */
export function VersionCard({
  version,
  isActive,
  isViewing,
  onReview,
  onActivate,
  disabled,
  disableReason,
}: VersionCardProps) {
  // Determine the source icon (🤖/✏️) (Design Doc 5.1.4.C2)
  const isAiGenerated = version.source === VersionSource.AI_GENERATED;
  const SourceIcon = isAiGenerated ? Bot : Pencil;

  // Placeholder for timestamp formatting.
  // As the provided API definition (NodeVersionRead) lacks a timestamp field (e.g., created_at), we use a mock value.
  const formattedTimestamp = "Timestamp N/A"; // TODO: Replace when API provides timestamp

  // (Task 23.2): Handle activation click
  const handleActivateClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onReview when clicking the button
    if (!disabled) {
      onActivate();
    }
  };

  const handleCardClick = () => {
    // Trigger review only if the card is not already being viewed.
    if (!isViewing) {
        onReview();
    }
  };

  const activateButtonTitle = disabled
    ? disableReason || "Activation disabled."
    : "Set as Active Version";

  return (
    // Use motion.div for layout animations when the list updates (e.g., new version added or activation changes order/layout).
    <motion.div layout transition={{ type: "spring", stiffness: 350, damping: 25 }}>
        <Card
        onClick={handleCardClick}
        // Apply accessibility attributes
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent scroll on spacebar
                handleCardClick();
            }
        }}
        // Styling (Design Doc 5.1.4.C2: Compact layout p-3)
        className={cn(
            // Override default Card styling (which often has larger padding/gaps) for compact layout
            "block gap-0 p-3 shadow-sm transition-all duration-200 group",
            // Interactive styling
            !isViewing && "cursor-pointer hover:bg-secondary/50",
            // Visual indicator for the currently viewed version in the workspace
            isViewing && "bg-secondary/80 shadow-md ring-1 ring-ring/50",
            // Active State Styling (Design Doc 5.1.4.C2): border-primary
            isActive && "border-primary border-2",
        )}
        >
        <div className="flex items-start justify-between gap-3">
            {/* Left side: Version Info, Icon, Timestamp */}
            <div className="flex items-center gap-3">
            {/* Source Icon Visualization with thematic color */}
            <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                isAiGenerated 
                    ? "bg-blue-50 border-blue-300 text-blue-500 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400"
                    : "bg-amber-50 border-amber-300 text-amber-500 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400"
            )}>
                <SourceIcon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-sm font-semibold">
                V{version.version_number}
                </p>
                <p className="text-xs text-muted-foreground">
                {formattedTimestamp}
                </p>
            </div>
            </div>

            {/* Right side: Active Badge */}
            {isActive && (
            // (Task 23.5) (Design Doc 5.2.4): Use Framer Motion layoutId for smooth transition of the badge between cards.
            <motion.div layoutId="active-version-badge" transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                <Badge variant="default" className="text-xs uppercase tracking-wide shadow-sm">
                Active
                </Badge>
            </motion.div>
            )}
        </div>

        {/* Summary (Design Doc 5.1.4.C2) */}
        <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
            {version.summary || <span className="italic">No summary provided.</span>}
        </p>

        {/* Action Button (Inactive State) (Design Doc 5.1.4.C2) */}
        {!isActive && (
            <div className="mt-3">
                {/* Use Tooltip to display the disableReason if the button is disabled */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* Wrap button in span when disabled to ensure tooltip works (Radix UI requirement) */}
                            <span tabIndex={disabled ? 0 : undefined}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "w-full transition-opacity duration-200",
                                        // Fade in on hover/focus if not viewing AND enabled.
                                        // If disabled, it remains visible but inactive.
                                        !isViewing && !disabled && "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                                    )}
                                    onClick={handleActivateClick}
                                    disabled={disabled}
                                    // Use title for basic accessibility backup
                                    title={activateButtonTitle}
                                >
                                    Set as Active Version
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {disabled && disableReason && (
                            <TooltipContent>
                                <p>{disableReason}</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>
        )}
        </Card>
    </motion.div>
  );
}

