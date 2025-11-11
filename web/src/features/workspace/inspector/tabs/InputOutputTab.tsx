"use client";

import type { NodeDetailView } from "~/core/domain/node.types";

export function InputOutputTab({ node }: { node: NodeDetailView }) {
  return (
    <div className="space-y-2 text-sm">
      <h4 className="font-semibold">Inputs & Outputs</h4>
      <p className="text-muted-foreground">
        Detailed input dependencies and output data for the active version of
        node {node.id} will be shown here.
      </p>
    </div>
  );
}
