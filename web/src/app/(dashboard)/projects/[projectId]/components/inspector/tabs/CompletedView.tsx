import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { PlatformEditor, StatusBadge } from "~/components/platform";
import { Markdown } from "~/components/platform/markdown";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import type { ExecutionRequest, NodeDetailView } from "~/core/api";
import type { JsonObject, JsonValue } from "~/core/api/types/common";
import { useInspectorStore } from "~/core/store/InspectorStore";
import { useWorkflowStore } from "~/core/store/WorkflowStore";

interface CompletedViewProps {
  node: NodeDetailView;
}

export function CompletedView({ node }: CompletedViewProps) {
  const activeVersion = node.active_version;
  const reExecuteNode = useWorkflowStore((state) => state.reExecuteNode);
  const submitManualEdit = useWorkflowStore((state) => state.submitManualEdit);
  const { isEditing, enterEditMode, exitEditMode, selectNode } = useInspectorStore((state) => ({
    isEditing: state.isEditing,
    enterEditMode: state.enterEditMode,
    exitEditMode: state.exitEditMode,
    selectNode: state.selectNode,
  }));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryOutput = useMemo(() => {
    return extractBestEffortMarkdown(activeVersion?.output_data ?? null);
  }, [activeVersion?.output_data]);

  const outputJson = useMemo(() => {
    if (!activeVersion?.output_data) return null;
    try {
      return JSON.stringify(activeVersion.output_data, null, 2);
    } catch (error) {
      console.warn("[CompletedView] Failed to stringify output_data", error);
      return null;
    }
  }, [activeVersion?.output_data]);

  const artifactsJson = useMemo(() => {
    if (!activeVersion?.execution_artifacts) return null;
    try {
      return JSON.stringify(activeVersion.execution_artifacts, null, 2);
    } catch (error) {
      console.warn("[CompletedView] Failed to stringify execution_artifacts", error);
      return null;
    }
  }, [activeVersion?.execution_artifacts]);

  const handleDialogChange = (open: boolean) => {
    if (!isSubmitting) {
      setDialogOpen(open);
      if (!open) {
        setComments("");
      }
    }
  };

  const handleReExecute = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = buildReExecutePayload(activeVersion?.id, comments.trim());
      await reExecuteNode(node.id, payload);
      toast.success("Re-execution triggered. The canvas will update once the new run starts.");
      setDialogOpen(false);
      setComments("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to trigger re-execution.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSave = useCallback(
    async (editedOutput: JsonObject, summary: string) => {
      if (!activeVersion) {
        const message = "No base version is available for manual edits.";
        toast.error(message);
        throw new Error(message);
      }
      try {
        await submitManualEdit(node.id, {
          base_version_id: activeVersion.id,
          edited_output_data: editedOutput,
          summary: summary.trim() || undefined,
        });
        toast.success("Manual edit saved and activated.");
        exitEditMode();
        void selectNode(node.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save manual edit.";
        toast.error(message);
        throw error;
      }
    },
    [activeVersion, exitEditMode, node.id, selectNode, submitManualEdit],
  );

  if (isEditing && activeVersion) {
    return (
      <PlatformEditor
        nodeName={node.name}
        versionNumber={activeVersion.version_number}
        outputData={activeVersion.output_data}
        onCancel={exitEditMode}
        onSave={handleManualSave}
      />
    );
  }

  if (!activeVersion) {
    return (
      <section className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <StatusBadge status={node.status} />
          <p>This node has not produced a confirmed output yet.</p>
          <p>Select Retry from the toolbar once an execution attempt completes.</p>
        </div>
      </section>
    );
  }

  const temperatureLabel = Number.isFinite(activeVersion.temperature)
    ? activeVersion.temperature.toFixed(2)
    : "-";

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <StatusBadge status={node.status} />
        <span className="rounded-full bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          Version #{activeVersion.version_number}
        </span>
        {activeVersion.source ? <span>Source: {formatSource(activeVersion.source)}</span> : null}
        <span>Stage: {node.stage_name}</span>
      </header>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={enterEditMode}>
          Manual edit
        </Button>
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button variant="secondary" disabled={isSubmitting}>
              Trigger re-execution
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Re-execute “{node.name}”</DialogTitle>
              <DialogDescription>
                Provide optional modification guidance. The node will start a new run based on the latest upstream data.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              rows={5}
              placeholder="e.g. incorporate the new dataset insights before summarizing."
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              disabled={isSubmitting}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleReExecute} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 size-4" aria-hidden="true" />
                    Re-execute
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Output</p>
          {activeVersion.llm_model_name ? (
            <span className="text-xs text-muted-foreground">
              Model: {activeVersion.llm_model_name} · T={temperatureLabel}
            </span>
          ) : null}
        </div>
        <div className="mt-4 space-y-4">
          {primaryOutput ? (
            <Markdown className="prose-sm max-w-none" enableCopy>
              {primaryOutput}
            </Markdown>
          ) : outputJson ? (
            <pre className="max-h-[420px] overflow-auto rounded-xl bg-muted/60 p-4 text-xs font-mono text-foreground whitespace-pre-wrap">
              {outputJson}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">Output payload is empty.</p>
          )}
        </div>
      </section>

      {artifactsJson ? (
        <section className="rounded-2xl border border-border/60 bg-muted/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Execution artifacts
          </p>
          <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-background/70 p-4 text-xs font-mono text-foreground whitespace-pre-wrap">
            {artifactsJson}
          </pre>
        </section>
      ) : null}
    </div>
  );
}

function buildReExecutePayload(baseVersionId?: number | null, message?: string): ExecutionRequest {
  const payload: ExecutionRequest = {};
  if (baseVersionId) {
    payload.base_version_id = baseVersionId;
  }
  if (message) {
    payload.modification_comments = message;
  }
  return payload;
}

function formatSource(source: string) {
  if (source === "MANUALLY_EDITED") return "Manually edited";
  if (source === "AI_GENERATED") return "AI generated";
  return source;
}

const TEXT_PRIORITY_KEYS = ["markdown", "content", "report", "body", "text", "summary"] as const;
const TEXT_PRIORITY_SET = new Set<string>(TEXT_PRIORITY_KEYS);

function extractBestEffortMarkdown(data: JsonObject | null): string | null {
  if (!data) return null;
  return findFirstString(data, TEXT_PRIORITY_SET);
}

function findFirstString(value: JsonValue | undefined, preferredKeys: Set<string>): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const match = findFirstString(entry, preferredKeys);
      if (match) return match;
    }
    return null;
  }
  if (isJsonObject(value)) {
    for (const key of preferredKeys) {
      const candidate = value[key];
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate;
      }
    }
    for (const key of Object.keys(value)) {
      const match = findFirstString(value[key], preferredKeys);
      if (match) return match;
    }
  }
  return null;
}

function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
