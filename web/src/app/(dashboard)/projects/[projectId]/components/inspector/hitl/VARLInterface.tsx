"use client";

import { FileText, Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Markdown } from "~/components/platform/markdown";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { HitlInteractionData, NodeDetailView, TemporaryExecutionRead } from "~/core/api";
import type { JsonObject, JsonValue } from "~/core/api/types/common";

interface VARLInterfaceProps {
  node: NodeDetailView;
  pendingResult: TemporaryExecutionRead;
  onInteractionChange: (data: HitlInteractionData | null, meta?: { isValid?: boolean }) => void;
}

type SectionType = "markdown" | "list";

interface VarSection {
  id: string;
  title: string;
  type: SectionType;
  content?: string;
  items?: string[];
}

interface VARLData {
  summary: string | null;
  highlights: string[];
  sections: VarSection[];
  metaBadges: Array<{ label: string; value: string }>;
}

const SUMMARY_KEYS = ["summary", "analysis", "result", "overview", "report", "content"] as const;
const HIGHLIGHT_KEYS = ["highlights", "key_points", "key_takeaways", "risks", "actions", "next_steps"] as const;
const META_KEYS = ["confidence", "impact", "effort", "priority", "risk_level", "timeline"] as const;
const RESERVED_KEYS = new Set<string>([
  "candidates",
  "comparative_analysis",
  "critiques",
  "critique_items",
  "adversarial_critiques",
]);

export function VARLInterface({ node, pendingResult, onInteractionChange }: VARLInterfaceProps) {
  const data = useMemo(
    () => extractVARLData(pendingResult.output_data, pendingResult.execution_artifacts),
    [pendingResult.execution_artifacts, pendingResult.output_data],
  );

  useEffect(() => {
    onInteractionChange(null, { isValid: true });
  }, [node.id, onInteractionChange, pendingResult.execution_artifacts, pendingResult.output_data]);

  const showEmptyState = !data.summary && !data.highlights.length && !data.sections.length;

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-6">
        {data.summary ? (
          <Card className="border border-border/70 bg-muted/20">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <FileText className="size-4 text-primary" aria-hidden="true" />
                Result summary
              </div>
              {data.metaBadges.length ? (
                <div className="flex flex-wrap gap-2">
                  {data.metaBadges.map((badge) => (
                    <Badge key={badge.label} variant="outline" className="text-xs font-semibold uppercase tracking-wide">
                      {badge.label}: <span className="ml-1 text-foreground">{badge.value}</span>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardHeader>
            <CardContent>
              <Markdown className="prose-sm dark:prose-invert">{data.summary}</Markdown>
            </CardContent>
          </Card>
        ) : null}

        {data.highlights.length ? (
          <Card className="border border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Key highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {data.highlights.map((item, index) => (
                  <li key={`highlight-${index}`} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-primary/70" aria-hidden="true" />
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {data.sections.length ? (
          <div className="space-y-4">
            {data.sections.map((section) => (
              <Card key={section.id} className="border border-border/70 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {section.type === "markdown" && section.content ? (
                    <Markdown className="prose-sm dark:prose-invert">{section.content}</Markdown>
                  ) : null}
                  {section.type === "list" && section.items ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {section.items.map((item, index) => (
                        <li key={`${section.id}-${index}`}>
                          <span className="text-foreground/90">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {showEmptyState ? <EmptyVARLState /> : null}
      </div>
    </div>
  );
}

function EmptyVARLState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
      <Sparkles className="size-6 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">No structured payload</p>
        <p>The orchestration engine did not provide additional context for this VARL review.</p>
      </div>
    </div>
  );
}

function extractVARLData(output: JsonObject | null, artifacts: JsonObject | null): VARLData {
  const summarySource = findFirstSourceWithKey([output, artifacts], SUMMARY_KEYS);
  const summary = summarySource?.value ?? null;

  const highlightSource = findFirstListSource([output, artifacts], HIGHLIGHT_KEYS);
  const highlights = highlightSource?.value ?? [];

  const metaBadges = collectMetaBadges([output, artifacts]);

  const sections = collectSections([output, artifacts], {
    summaryKey: summarySource?.key ?? null,
    highlightKey: highlightSource?.key ?? null,
  });

  return { summary, highlights, sections, metaBadges };
}

function collectMetaBadges(sources: Array<JsonObject | null>) {
  const result: Array<{ label: string; value: string }> = [];
  sources.forEach((record) => {
    if (!isRecord(record)) return;
    META_KEYS.forEach((key) => {
      const value = record[key];
      if (
        value !== null &&
        (typeof value === "string" || typeof value === "number") &&
        !result.find((badge) => badge.label === formatLabel(key))
      ) {
        result.push({ label: formatLabel(key), value: String(value) });
      }
    });
  });
  return result;
}

function collectSections(
  sources: Array<JsonObject | null>,
  options: { summaryKey: string | null; highlightKey: string | null },
): VarSection[] {
  const sections: VarSection[] = [];
  sources.forEach((record, sourceIndex) => {
    if (!isRecord(record)) return;
    Object.entries(record).forEach(([key, value]) => {
      if (
        RESERVED_KEYS.has(key) ||
        key === options.summaryKey ||
        key === options.highlightKey ||
        META_KEYS.includes(key as (typeof META_KEYS)[number])
      ) {
        return;
      }

      if (value === null || value === undefined) return;

      const title = formatLabel(key);
      const id = `${sourceIndex}-${key}`;

      if (typeof value === "string") {
        if (!value.trim().length) return;
        sections.push({ id, title, type: "markdown", content: value });
        return;
      }

      if (typeof value === "number" || typeof value === "boolean") {
        sections.push({ id, title, type: "markdown", content: String(value) });
        return;
      }

      if (Array.isArray(value)) {
        const items = flattenToList(value);
        if (items.length) {
          sections.push({ id, title, type: "list", items });
        }
        return;
      }

      if (isRecord(value)) {
        const items = Object.entries(value)
          .map(([innerKey, innerValue]) => `${formatLabel(innerKey)}: ${formatAny(innerValue)}`)
          .filter((item) => item.trim().length);
        if (items.length) {
          sections.push({ id, title, type: "list", items });
        }
      }
    });
  });
  return sections;
}

function flattenToList(values: JsonValue[]): string[] {
  return values
    .map((value) => {
      if (typeof value === "string") return value;
      if (typeof value === "number" || typeof value === "boolean") return String(value);
      if (Array.isArray(value)) {
        const nested = flattenToList(value);
        return nested.length ? nested.join(" • ") : null;
      }
      if (isRecord(value)) {
        return Object.entries(value)
          .map(([key, innerValue]) => `${formatLabel(key)}: ${formatAny(innerValue)}`)
          .join(", ");
      }
      return null;
    })
    .filter((item): item is string => Boolean(item?.trim().length));
}

function findFirstSourceWithKey(
  records: Array<JsonObject | null>,
  keys: readonly string[],
): { value: string; key: string } | null {
  for (const record of records) {
    if (!isRecord(record)) continue;
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim().length) {
        return { value, key };
      }
    }
  }
  return null;
}

function findFirstListSource(
  records: Array<JsonObject | null>,
  keys: readonly string[],
): { value: string[]; key: string } | null {
  for (const record of records) {
    if (!isRecord(record)) continue;
    for (const key of keys) {
      const list = record[key];
      if (Array.isArray(list)) {
        const items = flattenToList(list);
        if (items.length) {
          return { value: items, key };
        }
      }
    }
  }
  return null;
}

function formatAny(value: JsonValue): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return flattenToList(value).join("; ");
  }
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, inner]) => `${formatLabel(key)}: ${formatAny(inner)}`)
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

function isRecord(value: unknown): value is Record<string, JsonValue> {
  return typeof value === "object" && value !== null;
}
