"use client";

import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { PendingResult } from "~/core/domain/node.types";

interface VARLInterfaceProps {
  data: PendingResult;
  onInteractionChange: (
    data: Record<string, unknown>,
    isReady: boolean,
  ) => void;
}

/**
 * Renders the Vetting & Review Loop (VARL) HITL interface which is a
 * generic approval gate for AI output.
 */
export function VARLInterface({ data, onInteractionChange }: VARLInterfaceProps) {
  // VARL does not collect extra metadata, so approvals are always ready.
  useEffect(() => {
    onInteractionChange({}, true);
  }, [onInteractionChange]);

  const outputEntries = Object.entries(
    (data?.output_data ?? {}) as Record<string, unknown>,
  );

  return (
    <div className="space-y-6 p-4">
      <header>
        <h3 className="mb-2 text-lg font-semibold">Review & Approve Output</h3>
        <p className="text-sm text-muted-foreground">
          Review the generated content below, then approve or reject to continue
          the workflow.
        </p>
      </header>

      <div className="space-y-4">
        {outputEntries.length > 0 ? (
          outputEntries.map(([key, value]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-base capitalize">
                  {key.replace(/_/g, " ")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {typeof value === "string" ? (
                  <ReactMarkdown className="prose prose-sm dark:prose-invert" remarkPlugins={[remarkGfm]}>
                    {value}
                  </ReactMarkdown>
                ) : (
                  <pre className="whitespace-pre-wrap rounded border bg-muted/50 p-4 font-mono text-xs">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No output data to display.
          </div>
        )}
      </div>
    </div>
  );
}
