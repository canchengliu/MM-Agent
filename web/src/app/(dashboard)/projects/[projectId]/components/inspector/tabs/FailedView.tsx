import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "~/components/platform";
import { Button } from "~/components/ui/button";
import type { NodeDetailView } from "~/core/api";
import { useWorkflowStore } from "~/core/store/WorkflowStore";

interface FailedViewProps {
  node: NodeDetailView;
}

export function FailedView({ node }: FailedViewProps) {
  const retryNode = useWorkflowStore((state) => state.retryNode);
  const [isRetrying, setIsRetrying] = useState(false);

  const errorLog = node.pending_result?.error_log ?? "Execution log is not available yet.";

  const handleRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      await retryNode(node.id);
      toast.success("Retry request submitted. Watch for status updates via the live feed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to retry execution.";
      toast.error(message);
    } finally {
      setIsRetrying(false);
    }
  };

  const isCanceled = node.status === "Canceled";

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm">
        <header className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <StatusBadge status={node.status} />
          <span>
            Stage: <span className="font-semibold text-foreground">{node.stage_name}</span>
          </span>
        </header>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          <AlertCircle className="mt-0.5 size-5 text-destructive" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              {isCanceled ? "Execution was canceled" : "Execution failed"}
            </p>
            <p className="text-muted-foreground">
              {isCanceled
                ? "The node was manually stopped. Re-run it once inputs are ready."
                : "Review the runtime log for details and retry after resolving blocking issues."}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Error log
          </p>
          <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-muted/60 p-4 text-xs font-mono text-foreground whitespace-pre-wrap">
            {errorLog}
          </pre>
        </div>

        <footer className="mt-6 flex flex-wrap gap-3">
          <Button onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Retrying...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 size-4" aria-hidden="true" />
                Retry execution
              </>
            )}
          </Button>
        </footer>
      </div>
    </section>
  );
}
