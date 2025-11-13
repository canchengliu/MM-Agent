"use client";

import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import type { StalenessInfo } from "~/core/models/workflow.model";

interface StalenessBannerProps {
  report: StalenessInfo[];
}

/**
 * B1.1 Staleness Banner (Conditional).
 * Displayed below the main header content within B1 if the node is stale.
 * (Design Doc 5.1.3.B1.1) (Task 24.3, 24.4, 24.5)
 */
export function StalenessBanner({ report }: StalenessBannerProps) {
  if (!report || report.length === 0) return null;

  // Use 'warning' variant (Amber). (Design Doc 5.1.3.B1.1)
  // Full width, no rounding, border-x-0 to sit flush.
  return (
    <Alert
      variant="warning"
      className="shrink-0 rounded-none border-x-0 shadow-sm"
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-semibold">
        {/* Design Doc 3.3.D.2 concept: Inputs Changed */}
        Warning: Upstream Data Updated (Stale Inputs)
      </AlertTitle>
      <AlertDescription className="text-sm">
        {/* Provides clear explanation and guidance (Design Doc 3.3.D.2) (Task 24.5) */}
        <p>
          This node was executed using older data from upstream dependencies.
          It is highly recommended to <strong>Re-execute</strong> this node to
          incorporate the latest changes.
        </p>
        {/* Detailed report display (Task 24.4) */}
        <div className="mt-2 text-xs font-medium">
          <strong>Details of Changes:</strong>
          <ul className="list-disc pl-4">
            {/* Iterate over the report to show exactly what changed (API 5.1.1 staleness_report) */}
            {report.map((item) => (
              <li key={item.upstream_node_id}>
                Node <strong>{item.upstream_definition_id}</strong> updated from V{item.consumed_version_id} to V{item.current_active_version_id ?? 'N/A'}.
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}

