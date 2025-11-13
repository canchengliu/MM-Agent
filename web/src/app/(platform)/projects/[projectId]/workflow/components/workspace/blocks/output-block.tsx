"use client";

import React, { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { MarkdownRenderer } from "~/components/renderers/MarkdownRenderer";
// (Task 22): Import RichTextEditor for editing mode
import { RichTextEditor } from "~/components/editors/RichTextEditor";
import type { NodeDetailView } from "~/core/models/node.model";
import type { TranscriptData } from "../useTranscriptData";
import { TranscriptBlock } from "./transcript-block";
import { useStore } from "~/core/store";
// (Task 22): Import the derivation utility
import { deriveOutput } from "../../../utils/output-derivation";

interface OutputBlockProps {
  node: NodeDetailView;
  dataSource: TranscriptData;
}

/**
 * B2.Block 3: Generated Output
 * Displays the primary result of the node execution.
 * Handles View-to-Edit mode switching (Design Doc 3.1.1.D).
 */
export function OutputBlock({ node, dataSource }: OutputBlockProps) {
    // (Task 22): Enhanced state access to include context registration
    const { isEditing, updateLocalEditContent, localEditContent, registerOutputContext } = useStore(
        useShallow((state) => ({
            // We only enter edit mode if the user explicitly started it via the toolbar
            isEditing: state.isEditing,
            // State management for the local draft (managed in UIInteractionSlice)
            updateLocalEditContent: state.updateLocalEditContent,
            localEditContent: state.localEditContent,
            // Action to register the reconstruction strategy and base content
            registerOutputContext: state.registerOutputContext,
        })),
    );

  const outputData = dataSource.data?.output_data;

  // (Task 22): Determine content and reconstruction strategy using the utility.
  // This replaces the previous heuristic-based useMemo for 'content'.
  const { content, reconstruct } = useMemo(() => deriveOutput(outputData), [outputData]);

  // (Task 22): Register the context (strategy and base content) with the store if viewing the latest version.
  useEffect(() => {
    if (!dataSource.isHistorical) {
        // When viewing the latest version, this block is the source of truth for the editing context.
        registerOutputContext(reconstruct, content);
    }
    // We do not explicitly clear the context here when switching to historical,
    // as the UIInteractionSlice handles clearing context during viewHistoricalVersion action.

    // Cleanup function: clear context when component unmounts (e.g. node deselected)
    return () => {
        // We must check if the currently registered context belongs to this specific render (using the specific reconstruct function instance)
        // to avoid prematurely clearing context during React strict mode double renders or fast switching.
        const currentStrategy = useStore.getState().outputReconstructionStrategy;
        if (currentStrategy === reconstruct) {
            registerOutputContext(null, null);
        }
    };
  // We depend on the derived context (reconstruct, content) and the historical status.
  }, [dataSource.isHistorical, reconstruct, content, registerOutputContext]);

  const isEmpty = content.trim() === "";

  // We should only show the editor if the global state isEditing is true AND we are viewing the latest version (Design Doc 3.1.1.D)
  const showEditor = isEditing && !dataSource.isHistorical;

  return (
    // Design Doc 2.4.B: Output default expanded (managed by UIInteractionSlice defaults)
    <TranscriptBlock blockKey="output" title="Generated Output">
      {isEmpty && !showEditor ? (
        <div className="text-sm text-muted-foreground italic p-4 border rounded-lg bg-muted/50">
          No primary output generated. Check the HITL Zone or Artifacts if applicable.
        </div>
      ) : showEditor ? (
        // Edit Mode: RichTextEditor (Novel/Tiptap) (Design Doc 5.1.3.B2)
        // Use a slightly different background and border to signify edit mode.
        <div className="-m-4 p-4 bg-background/50 rounded-lg border border-input shadow-inner">
            <RichTextEditor
                // Initialize with the local draft if available (user started typing), otherwise use the base content.
                // localEditContent is updated by the editor's onCreate (crucial for initialization) and onUpdate handlers.
                initialContent={localEditContent ?? content}
                onUpdate={updateLocalEditContent}
                // Provide ample space for editing
                className="min-h-[500px]"
            />
        </div>
      ) : (
        // View Mode: MarkdownRenderer (Design Doc 5.1.3.B2)
        // The renderer handles Markdown and the JSON fallback (which is wrapped in ```json).
        <MarkdownRenderer content={content} />
      )}
    </TranscriptBlock>
  );
}

