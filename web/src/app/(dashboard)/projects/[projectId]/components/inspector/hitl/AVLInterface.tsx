"use client";

import { Gavel, ShieldCheck, ShieldQuestion, ThumbsDown, ThumbsUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Markdown } from "~/components/platform/markdown";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import type { HitlInteractionData, NodeDetailView, TemporaryExecutionRead } from "~/core/api";
import type { JsonObject, JsonValue } from "~/core/api/types/common";
import { cn } from "~/lib/utils";

interface AVLInterfaceProps {
  node: NodeDetailView;
  pendingResult: TemporaryExecutionRead;
  onInteractionChange: (data: HitlInteractionData | null, meta?: { isValid?: boolean }) => void;
}

type Decision = "Accepted" | "Rejected";

interface AdjudicationState {
  decision: Decision;
  comment?: string;
}

interface CritiqueRecord {
  id: string;
  title?: string;
  summary?: string;
  critique?: string;
  description?: string;
  observation?: string;
  recommendation?: string;
  remediation?: string;
  guidance?: string;
  risk?: string;
  severity?: string;
  category?: string;
  evidence?: string | string[] | JsonObject;
  suggestion?: string;
  type?: string;
  status?: string;
  [key: string]: JsonValue | undefined;
}

interface AVLData {
  coreOutput: string | null;
  critiques: CritiqueRecord[];
}

const CORE_OUTPUT_KEYS = [
  "core_output",
  "primary_output",
  "summary",
  "analysis",
  "result",
  "report",
  "content",
] as const;

const CRITIQUE_COLLECTION_KEYS = [
  "critiques",
  "critique_items",
  "adversarial_critiques",
  "validation_findings",
  "findings",
  "issues",
  "objections",
  "red_team_findings",
] as const;

const CRITIQUE_TEXT_FIELDS = [
  { key: "critique", label: "Critique" },
  { key: "description", label: "Description" },
  { key: "observation", label: "Observation" },
  { key: "risk", label: "Risk" },
  { key: "recommendation", label: "Recommendation" },
  { key: "suggestion", label: "Suggestion" },
  { key: "guidance", label: "Guidance" },
  { key: "remediation", label: "Remediation" },
  { key: "evidence", label: "Evidence" },
] as const;

const severityThemes: Record<string, string> = {
  critical: "border-destructive/70 bg-destructive/10 text-destructive",
  high: "border-destructive/60 bg-destructive/10 text-destructive",
  medium: "border-amber-500/50 bg-amber-500/10 text-amber-500",
  low: "border-emerald-500/50 bg-emerald-500/10 text-emerald-500",
};

export function AVLInterface({ node, pendingResult, onInteractionChange }: AVLInterfaceProps) {
  const data = useMemo(
    () => extractAVLData(pendingResult.output_data, pendingResult.execution_artifacts),
    [pendingResult.execution_artifacts, pendingResult.output_data],
  );

  const [adjudications, setAdjudications] = useState<Record<string, AdjudicationState>>({});

  useEffect(() => {
    setAdjudications({});
  }, [node.id, pendingResult.output_data, pendingResult.execution_artifacts]);

  const resolvedCount = data.critiques.filter((critique) => adjudications[critique.id]?.decision).length;
  const allResolved = data.critiques.length > 0 && resolvedCount === data.critiques.length;

  useEffect(() => {
    if (!data.critiques.length) {
      onInteractionChange(null, { isValid: true });
      return;
    }

    if (!allResolved) {
      onInteractionChange(null, { isValid: false });
      return;
    }

    const payload = data.critiques.map((critique) => {
      const state = adjudications[critique.id];
      const trimmedComment = state?.comment?.trim();
      return {
        critique_id: critique.id,
        decision: state?.decision ?? "Accepted",
        ...(trimmedComment ? { comment: trimmedComment } : {}),
      };
    });

    onInteractionChange({ adjudication: payload }, { isValid: true });
  }, [adjudications, allResolved, data.critiques, onInteractionChange]);

  const handleDecisionChange = useCallback((id: string, decision: Decision) => {
    setAdjudications((prev) => ({
      ...prev,
      [id]: {
        decision,
        comment: prev[id]?.comment ?? "",
      },
    }));
  }, []);

  const handleCommentChange = useCallback((id: string, comment: string) => {
    setAdjudications((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: { ...current, comment },
      };
    });
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-6">
        {data.coreOutput ? (
          <section className="rounded-2xl border border-border/70 bg-muted/20 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Core Output Snapshot
            </div>
            <Separator className="my-4 bg-border/60" />
            <Markdown className="prose-sm dark:prose-invert">{data.coreOutput}</Markdown>
          </section>
        ) : null}

        <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Adversarial critiques</p>
              <p className="text-xs text-muted-foreground">
                Resolve every critique to unlock approval. Each decision guides the next execution loop.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Gavel className="size-4 text-primary" aria-hidden="true" />
              {data.critiques.length ? (
                <>
                  {resolvedCount}/{data.critiques.length} resolved
                </>
              ) : (
                "No critiques"
              )}
            </div>
          </div>
        </section>

        {data.critiques.length ? (
          <div className="space-y-4">
            {data.critiques.map((critique, index) => (
              <CritiqueCard
                key={critique.id}
                critique={critique}
                sequence={index + 1}
                decision={adjudications[critique.id]}
                onDecisionChange={handleDecisionChange}
                onCommentChange={handleCommentChange}
              />
            ))}
          </div>
        ) : (
          <EmptyCritiqueState />
        )}
      </div>
    </div>
  );
}

function CritiqueCard({
  critique,
  sequence,
  decision,
  onDecisionChange,
  onCommentChange,
}: {
  critique: CritiqueRecord;
  sequence: number;
  decision?: AdjudicationState;
  onDecisionChange: (id: string, decision: Decision) => void;
  onCommentChange: (id: string, comment: string) => void;
}) {
  const title = getCritiqueTitle(critique, sequence);
  const subtitle = typeof critique.summary === "string" ? critique.summary : null;
  const severity = typeof critique.severity === "string" ? critique.severity : null;
  const category = typeof critique.category === "string" ? critique.category : null;

  const sections = CRITIQUE_TEXT_FIELDS.map(({ key, label }) => {
    const content = getRichContent(critique[key]);
    if (!content) return null;
    return (
      <div key={key} className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {Array.isArray(content) ? (
          <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
            {content.map((item, idx) => (
              <li key={`${critique.id}-${key}-${idx}`}>
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Markdown className="prose-sm dark:prose-invert">{content}</Markdown>
        )}
      </div>
    );
  }).filter(Boolean);

  return (
    <article
      className={cn(
        "rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm transition-colors",
        decision?.decision === "Accepted" && "border-emerald-500/60 bg-emerald-500/5",
        decision?.decision === "Rejected" && "border-destructive/60 bg-destructive/5",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Critique #{sequence}</p>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {severity ? (
            <Badge
              variant="outline"
              className={cn("border text-xs font-semibold uppercase tracking-wide", severityThemes[severity.toLowerCase()] ?? "border-amber-500/50 text-amber-500")}
            >
              {severity}
            </Badge>
          ) : null}
          {category ? (
            <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wide">
              {category}
            </Badge>
          ) : null}
        </div>
      </header>

      {sections.length ? (
        <div className="space-y-4 py-4">{sections}</div>
      ) : (
        <p className="py-4 text-sm text-muted-foreground">No additional context was provided for this critique.</p>
      )}

      <div className="space-y-3 border-t border-border/60 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Adjudication</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={decision?.decision === "Accepted" ? "default" : "outline"}
            onClick={() => onDecisionChange(critique.id, "Accepted")}
          >
            <ThumbsUp className="size-4" aria-hidden="true" />
            Accept
          </Button>
          <Button
            type="button"
            size="sm"
            variant={decision?.decision === "Rejected" ? "destructive" : "outline"}
            onClick={() => onDecisionChange(critique.id, "Rejected")}
          >
            <ThumbsDown className="size-4" aria-hidden="true" />
            Reject
          </Button>
        </div>
        <Textarea
          placeholder="Add optional context for this decision..."
          value={decision?.comment ?? ""}
          onChange={(event) => onCommentChange(critique.id, event.target.value)}
          disabled={!decision}
          rows={3}
        />
      </div>
    </article>
  );
}

function EmptyCritiqueState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
      <ShieldQuestion className="size-6 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">No critiques pending</p>
        <p>The orchestration engine did not surface adversarial findings for this execution.</p>
      </div>
    </div>
  );
}

function extractAVLData(output: JsonObject | null, artifacts: JsonObject | null): AVLData {
  const coreOutput = pickFirstString(output, CORE_OUTPUT_KEYS) ?? pickFirstString(artifacts, CORE_OUTPUT_KEYS) ?? null;
  const critiques = collectCritiques(output);
  return { coreOutput, critiques };
}

function collectCritiques(output: JsonObject | null): CritiqueRecord[] {
  if (!isRecord(output)) return [];
  const seen = new Map<string, CritiqueRecord>();
  CRITIQUE_COLLECTION_KEYS.forEach((key) => {
    const value = output[key];
    if (!Array.isArray(value)) return;
    value.forEach((candidate, index) => {
      if (!isRecord(candidate)) return;
      const idValue = typeof candidate.id === "string" ? candidate.id : `${key}-${index + 1}`;
      if (seen.has(idValue)) return;
      seen.set(idValue, { id: idValue, ...candidate });
    });
  });
  return Array.from(seen.values());
}

function pickFirstString(record: JsonObject | null, keys: readonly string[]): string | null {
  if (!isRecord(record)) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length) {
      return value;
    }
  }
  return null;
}

function getCritiqueTitle(critique: CritiqueRecord, sequence: number) {
  if (typeof critique.title === "string" && critique.title.trim().length) return critique.title;
  if (typeof critique.summary === "string" && critique.summary.trim().length) return critique.summary;
  if (typeof critique.category === "string" && critique.category.trim().length) return critique.category;
  return `Finding #${sequence}`;
}

function getRichContent(value: unknown): string | string[] | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const items = value
      .map((item) => {
        if (typeof item === "string") return item;
        if (isRecord(item)) {
          return Object.entries(item)
            .map(([key, inner]) => `${formatLabel(key)}: ${formatValue(inner)}`)
            .join(" • ");
        }
        return formatValue(item);
      })
      .filter((entry): entry is string => Boolean(entry));
    return items.length ? items : null;
  }
  if (isRecord(value)) {
    const lines = Object.entries(value)
      .map(([key, inner]) => `**${formatLabel(key)}:** ${formatValue(inner)}`)
      .join("\n");
    return lines || null;
  }
  return null;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .filter(Boolean)
      .join(", ");
  }
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, inner]) => `${formatLabel(key)}: ${formatValue(inner)}`)
      .join("; ");
  }
  return "";
}

function formatLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
