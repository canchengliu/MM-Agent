import { CircleSlash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "~/components/platform";
import { Button } from "~/components/ui/button";
import type { NodeDetailView } from "~/core/api";
import { useWorkflowStore } from "~/core/store/WorkflowStore";

interface ExecutingViewProps {
  node: NodeDetailView;
}

export function ExecutingView({ node }: ExecutingViewProps) {
  const cancelNode = useWorkflowStore((state) => state.cancelNode);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      await cancelNode(node.id);
      toast.success("Cancel request submitted. The node will transition once the backend confirms.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel execution.";
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm">
      <header className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <StatusBadge status={node.status} />
        <span>
          Current stage: <span className="font-semibold text-foreground">{node.current_stage}</span>
        </span>
      </header>

      <div className="mt-5 flex items-start gap-4 text-sm text-muted-foreground">
        <Loader2 className="size-8 shrink-0 animate-spin text-primary" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">Execution in progress</p>
          <p>
            This node is actively running. Results will stream into the inspector as soon as the current stage
            completes.
          </p>
        </div>
      </div>

      <footer className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleCancel} disabled={isCancelling}>
          {isCancelling ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              Canceling...
            </>
          ) : (
            <>
              <CircleSlash2 className="mr-2 size-4" aria-hidden="true" />
              Cancel execution
            </>
          )}
        </Button>
      </footer>
    </section>
  );
}
