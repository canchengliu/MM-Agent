"use client";

import { Layers3, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ShineBorder } from "~/components/magicui/shine-border";
import { Markdown } from "~/components/platform/markdown";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import type { HitlInteractionData, NodeDetailView, TemporaryExecutionRead } from "~/core/api";
import type { JsonObject, JsonValue } from "~/core/api/types/common";
import { cn } from "~/lib/utils";

interface SCAInterfaceProps {
  node: NodeDetailView;
  pendingResult: TemporaryExecutionRead;
  onInteractionChange: (data: HitlInteractionData | null, meta?: { isValid?: boolean }) => void;
}

interface CandidateRecord {
  id: string;
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  rationale?: string;
  highlights?: string[];
  strengths?: string[];
  risks?: string[];
  considerations?: string[];
  differentiators?: string[];
  key_actions?: string[];
  [key: string]: JsonValue | undefined;
}

interface SCAData {
  comparativeAnalysis: string | null;
  candidates: CandidateRecord[];
}

const BULLET_SECTIONS = [
  { key: "highlights", label: "Highlights" },
  { key: "strengths", label: "Strengths" },
  { key: "differentiators", label: "Differentiators" },
  { key: "considerations", label: "Considerations" },
  { key: "risks", label: "Risks" },
  { key: "key_actions", label: "Key actions" },
] as const;

const SCALAR_FIELDS = [
  { key: "confidence", label: "Confidence" },
  { key: "impact", label: "Impact" },
  { key: "effort", label: "Effort" },
  { key: "timeline", label: "Timeline" },
  { key: "score", label: "Score" },
] as const;

export function SCAInterface({ node, pendingResult, onInteractionChange }: SCAInterfaceProps) {
  const data = useMemo(() => extractSCAData(pendingResult.output_data), [pendingResult.output_data]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(null);
    onInteractionChange(null, { isValid: false });
  }, [node.id, pendingResult.output_data, onInteractionChange]);

  useEffect(() => {
    if (selectedId) {
      onInteractionChange({ selected_ids: [selectedId] }, { isValid: true });
    } else {
      onInteractionChange(null, { isValid: false });
    }
  }, [selectedId, onInteractionChange]);

  const hasCandidates = data.candidates.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-6">
        {data.comparativeAnalysis ? (
          <Card className="border border-border/70 bg-muted/30">
            <CardHeader className="gap-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Layers3 className="size-4 text-primary" aria-hidden="true" />
                Comparative Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Markdown className="prose prose-sm dark:prose-invert">
                {data.comparativeAnalysis}
              </Markdown>
            </CardContent>
          </Card>
        ) : null}

        <section className="space-y-3">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Candidate architectures</p>
              <p className="text-xs text-muted-foreground">Select one option to continue execution.</p>
            </div>
            <Badge variant="outline">{node.hitl_mode}</Badge>
          </header>

          {hasCandidates ? (
            <RadioGroup value={selectedId ?? undefined} onValueChange={setSelectedId} className="space-y-4">
              {data.candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  selected={candidate.id === selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </RadioGroup>
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  selected,
  onSelect,
}: {
  candidate: CandidateRecord;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const title = String(candidate.name ?? candidate.title ?? candidate.id);
  const summary = candidate.summary ?? candidate.description ?? candidate.rationale ?? null;
  const badgeFields = getScalarFields(candidate);

  return (
    <div
      className={cn(
        "relative cursor-pointer select-none rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md",
        selected && "border-primary/70 bg-primary/5 ring-2 ring-primary/20",
      )}
      onClick={() => onSelect(candidate.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(candidate.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
    >
      <RadioGroupItem value={candidate.id} className="sr-only" aria-label={`Select ${title}`} />
      {selected && <ShineBorder borderWidth={2} shineColor="hsla(var(--primary),0.6)" />}
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-foreground">{title}</p>
            {summary ? <p className="text-sm text-muted-foreground">{summary}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {badgeFields.map((field) => (
              <span
                key={field.key}
                className="rounded-full border border-border/50 px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {field.label}: <span className="text-foreground">{field.value}</span>
              </span>
            ))}
          </div>
        </div>

        {BULLET_SECTIONS.map(({ key, label }) => {
          const items = asStringList(candidate[key]);
          if (!items.length) return null;
          return (
            <div key={key} className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {items.map((item, index) => (
                  <li key={`${candidate.id}-${key}-${index}`}>
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
      <Sparkles className="size-5 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">Awaiting candidate payload</p>
        <p>The orchestration engine did not return any options for this review cycle.</p>
      </div>
    </div>
  );
}

function extractSCAData(output: JsonObject | null): SCAData {
  if (!isRecord(output)) {
    return { comparativeAnalysis: null, candidates: [] };
  }

  const comparativeAnalysis =
    typeof output.comparative_analysis === "string" ? output.comparative_analysis : null;

  const candidatesRaw = Array.isArray(output.candidates) ? (output.candidates as unknown[]) : [];
  const candidates = candidatesRaw.filter(isCandidateRecord);

  return { comparativeAnalysis, candidates };
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCandidateRecord(value: unknown): value is CandidateRecord {
  if (!isRecord(value)) return false;
  return typeof value.id === "string";
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") return item;
      if (isRecord(item)) {
        return Object.entries(item)
          .map(([key, entry]) =>
            `${key}: ${
              typeof entry === "object" && entry !== null ? JSON.stringify(entry) : String(entry)
            }`,
          )
          .join("; ");
      }
      return String(item);
    });
  }
  if (typeof value === "string") {
    return value.split("\n").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function getScalarFields(candidate: CandidateRecord) {
  return SCALAR_FIELDS.reduce<Array<{ key: string; label: string; value: string }>>((acc, field) => {
    const value = candidate[field.key];
    if (typeof value === "number" || typeof value === "string") {
      acc.push({ key: field.key, label: field.label, value: String(value) });
    }
    return acc;
  }, []);
}
