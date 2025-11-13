"use client";

import type { NodeDetailView } from "~/core/models/node.model";
import { type TranscriptData } from "./useTranscriptData";
import { InputsBlock } from "./blocks/inputs-block";
import { ArtifactsBlock } from "./blocks/artifacts-block";
import { OutputBlock } from "./blocks/output-block";
import { HITLZoneBlock } from "./blocks/hitl-zone-block";

interface InteractionTranscriptProps {
  // B2 requires the full details (NodeDetailView) for context (e.g., status).
  node: NodeDetailView;
  // The specific data source (version or pending result) determined by useTranscriptData.
  dataSource: TranscriptData;
}

/**
 * B2. Interaction Transcript (Scrollable Content)
 * Displays the complete context of the currently viewed version.
 * (Design Doc 5.1.3.B2)
 */
export function InteractionTranscript({ node, dataSource }: InteractionTranscriptProps) {
  // If dataSource.data is null, it means there is nothing to show (e.g., Not Started, or Completed without data)
  if (!dataSource.data) {
    return <EmptyTranscript />;
  }

  // Design Doc 5.1.3.B2: Layout: space-y-6 p-6.
  return (
    <div className="space-y-6 p-6">
      {/* Block 1: Inputs & Dependencies */}
      <InputsBlock node={node} dataSource={dataSource} />

      {/* Block 2: Execution Artifacts */}
      <ArtifactsBlock node={node} dataSource={dataSource} />

      {/* Block 3: Generated Output */}
      <OutputBlock node={node} dataSource={dataSource} />

      {/* Block 4: HITL Interaction Zone */}
      <HITLZoneBlock node={node} dataSource={dataSource} />
    </div>
  );
}

function EmptyTranscript() {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
        This node has not generated any outputs or artifacts for the selected view.
      </div>
    </div>
  );
}

