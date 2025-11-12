import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { NodeVersionRead } from "~/core/api";
import type { JsonValue } from "~/core/api/types/common";

interface VersionReviewDialogProps {
  nodeName: string;
  version: NodeVersionRead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionReviewDialog({ nodeName, version, open, onOpenChange }: VersionReviewDialogProps) {
  if (!version) return null;

  const dependencies = Object.entries(version.input_dependencies ?? {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Version V{version.version_number} · {nodeName}
          </DialogTitle>
          <DialogDescription>
            Captured from a {formatSource(version.source)} run. Snapshots are read-only for audit and comparison.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[65vh] flex-col overflow-hidden">
          <ScrollArea className="h-full pr-3">
            <div className="space-y-6">
              <section>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Version V{version.version_number}</Badge>
                  {version.based_on_version_id ? (
                    <Badge variant="outline">Based on V{version.based_on_version_id}</Badge>
                  ) : null}
                  <Badge variant="outline">{formatSource(version.source)}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {version.summary?.trim() || "No summary was provided when this version was approved."}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-xs text-muted-foreground sm:grid-cols-4">
                  <Metadata label="LLM Model" value={version.llm_model_name || "Unspecified"} />
                  <Metadata label="Temperature" value={formatTemperature(version.temperature)} />
                  <Metadata label="Dependencies captured" value={`${dependencies.length}`} />
                  <Metadata
                    label="HITL interactions"
                    value={version.hitl_history?.length ? `${version.hitl_history.length}` : "0"}
                  />
                </dl>
              </section>

              <section>
                <SectionTitle title="Input dependencies" />
                {dependencies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    This snapshot did not record upstream dependencies.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm">
                    {dependencies.map(([key, consumedVersion]) => (
                      <li
                        key={`${key}-${consumedVersion}`}
                        className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2"
                      >
                        <span className="font-medium text-foreground">{formatDependencyLabel(key)}</span>
                        <span className="font-mono text-xs text-muted-foreground">V{consumedVersion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-4">
                <SectionTitle title="Outputs & artifacts" />
                <JsonPreview
                  label="Structured output"
                  value={version.output_data}
                  emptyMessage="No structured output payload was stored."
                />
                <JsonPreview
                  label="Raw generated output"
                  value={version.raw_generated_output}
                  emptyMessage="The executor did not keep a raw output trace."
                />
                <JsonPreview
                  label="Execution artifacts"
                  value={version.execution_artifacts}
                  emptyMessage="No artifacts were attached to this run."
                />
              </section>

              <section>
                <SectionTitle title="HITL history" />
                <JsonPreview
                  label="Interactions"
                  value={version.hitl_history}
                  emptyMessage="No human-in-the-loop interactions were recorded."
                />
              </section>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
      {title}
    </p>
  );
}

function JsonPreview({
  label,
  value,
  emptyMessage,
}: {
  label: string;
  value: JsonValue | JsonValue[] | null | undefined;
  emptyMessage: string;
}) {
  const hasContent = hasDisplayableContent(value);
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">{label}</p>
      {hasContent ? (
        <pre className="mt-2 max-h-60 overflow-auto rounded-xl bg-muted/40 p-4 text-xs font-mono text-foreground whitespace-pre-wrap">
          {safeStringify(value)}
        </pre>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </div>
  );
}

function hasDisplayableContent(value: JsonValue | JsonValue[] | null | undefined) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "object") {
    return Object.keys(value as Record<string, JsonValue>).length > 0;
  }
  return true;
}

function safeStringify(value: JsonValue | JsonValue[] | null | undefined) {
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    console.warn("[VersionReviewDialog] Failed to stringify payload", error);
    return "[Unable to render JSON payload]";
  }
}

function formatSource(source: NodeVersionRead["source"]) {
  if (source === "MANUALLY_EDITED") return "manually edited";
  if (source === "AI_GENERATED") return "AI generated";
  return source ?? "unknown";
}

function formatDependencyLabel(key: string) {
  const numericId = Number(key);
  if (!Number.isNaN(numericId)) {
    return `Node ${numericId}`;
  }
  return key;
}

function formatTemperature(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "–";
  }
  return value.toFixed(2);
}
