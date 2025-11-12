"use client";

import MonacoEditor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReportEditor from "~/components/editor";
import { Badge } from "~/components/ui/badge";
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
import type { JsonObject, JsonValue } from "~/core/api/types/common";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

type EditorMode = "rich-text" | "code" | "json";

type StringTarget = {
  path: string[];
  key: string;
  value: string;
  parent?: JsonObject;
};

const TEXT_PRIORITY_KEYS = ["markdown", "content", "report", "body", "text", "summary"] as const;
const CODE_PRIORITY_KEYS = [
  "code",
  "script",
  "sql",
  "sql_query",
  "python",
  "python_code",
  "notebook",
  "implementation",
] as const;

const MODE_LABELS: Record<EditorMode, string> = {
  "rich-text": "Rich text",
  code: "Code",
  json: "JSON",
};

const MODE_HELPERS: Record<EditorMode, string> = {
  "rich-text": "Use the rich text editor for narrative outputs.",
  code: "Edit executable snippets with Monaco's code tooling.",
  json: "Directly edit the structured JSON payload.",
};

const MONACO_BASE_OPTIONS = {
  minimap: { enabled: false },
  fontFamily: "var(--font-geist-mono)",
  fontLigatures: true,
  fontSize: 13,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  wordWrap: "on" as const,
  renderWhitespace: "none" as const,
  tabSize: 2,
  detectIndentation: true,
  padding: { top: 12, bottom: 12 },
};

export interface PlatformEditorProps {
  nodeName: string;
  versionNumber: number;
  outputData: JsonObject | null;
  onCancel: () => void;
  onSave: (editedContent: JsonObject, summary: string) => Promise<void> | void;
}

export function PlatformEditor({ nodeName, versionNumber, outputData, onCancel, onSave }: PlatformEditorProps) {
  const initialDraft = useMemo(() => cloneJson(outputData), [outputData]);
  const textTarget = useMemo(() => findStringTarget(outputData, TEXT_PRIORITY_KEYS), [outputData]);
  const codeTarget = useMemo(() => findStringTarget(outputData, CODE_PRIORITY_KEYS), [outputData]);

  const availableModes = useMemo(() => {
    const modes: EditorMode[] = [];
    if (textTarget) modes.push("rich-text");
    if (codeTarget) modes.push("code");
    modes.push("json");
    return modes;
  }, [textTarget, codeTarget]);

  const [mode, setMode] = useState<EditorMode>(availableModes[0] ?? "json");
  const [draftObject, setDraftObject] = useState<JsonObject>(initialDraft);
  const [richTextValue, setRichTextValue] = useState<string>(textTarget?.value ?? "");
  const [codeValue, setCodeValue] = useState<string>(codeTarget?.value ?? "");
  const [jsonValue, setJsonValue] = useState<string>(() => JSON.stringify(initialDraft, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { resolvedTheme = "dark" } = useTheme();
  const monacoTheme = resolvedTheme === "light" ? "vs-light" : "vs-dark";

  useEffect(() => {
    setDraftObject(initialDraft);
    setJsonValue(JSON.stringify(initialDraft, null, 2));
    setJsonError(null);
  }, [initialDraft]);

  useEffect(() => {
    setRichTextValue(textTarget?.value ?? "");
  }, [textTarget]);

  useEffect(() => {
    setCodeValue(codeTarget?.value ?? "");
  }, [codeTarget]);

  useEffect(() => {
    if (!availableModes.includes(mode)) {
      setMode(availableModes[0] ?? "json");
    }
  }, [availableModes, mode]);

  useEffect(() => {
    if (mode !== "json") {
      setJsonValue(JSON.stringify(draftObject, null, 2));
      setJsonError(null);
    }
  }, [draftObject, mode]);

  const updateDraftAtPath = useCallback((path: string[] | undefined, nextValue: string) => {
    if (!path || path.length === 0) return;
    setDraftObject((prev) => {
      const next = cloneJson(prev);
      setValueAtPath(next, path, nextValue);
      return next;
    });
  }, []);

  const handleRichTextChange = useCallback(
    (markdown: string) => {
      if (!textTarget) return;
      setRichTextValue(markdown);
      updateDraftAtPath(textTarget.path, markdown);
    },
    [textTarget, updateDraftAtPath],
  );

  const handleCodeChange = useCallback(
    (value?: string) => {
      if (!codeTarget) return;
      const safeValue = value ?? "";
      setCodeValue(safeValue);
      updateDraftAtPath(codeTarget.path, safeValue);
    },
    [codeTarget, updateDraftAtPath],
  );

  const handleJsonChange = useCallback((value?: string) => {
    const next = value ?? "";
    setJsonValue(next);
    if (!next.trim()) {
      setJsonError("JSON payload cannot be empty.");
      return;
    }
    try {
      const parsed = JSON.parse(next);
      if (!isJsonObject(parsed)) {
        setJsonError("Manual edits must resolve to a JSON object.");
        return;
      }
      setDraftObject(parsed);
      setJsonError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON syntax.";
      setJsonError(message);
    }
  }, []);

  const handleSummaryDialogChange = (open: boolean) => {
    if (isSaving) return;
    setSummaryDialogOpen(open);
    if (!open) {
      setSummary("");
    }
  };

  const handleConfirmSave = async () => {
    if (mode === "json" && jsonError) {
      toast.error("Fix the JSON payload before saving.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = cloneJson(draftObject);
      const summaryText = summary.trim();
      await onSave(payload, summaryText);
      setSummary("");
      setSummaryDialogOpen(false);
    } catch (error) {
      // Parent handler emits user-facing feedback. We keep the dialog open for correction.
      console.warn("[PlatformEditor] Failed to save manual edit", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveDisabled = mode === "json" && Boolean(jsonError);
  const codeLanguage = useMemo(() => inferLanguage(codeTarget?.key, codeTarget?.parent), [codeTarget]);

  return (
    <section className="flex h-full min-h-[460px] flex-col rounded-2xl border border-border/70 bg-card/80 shadow-sm">
      <header className="border-b border-border/60 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Manual edit</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-lg font-semibold text-foreground">{nodeName}</p>
          <Badge variant="secondary">Editing V{versionNumber}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Update the artifact below. Saving will create and activate a new version immediately.
        </p>

        {availableModes.length > 1 ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Editor mode</span>
            <div className="flex flex-wrap gap-2">
              {availableModes.map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={item === mode ? "default" : "ghost"}
                  className={cn(
                    "rounded-full px-4",
                    item === mode ? "shadow-sm" : "text-muted-foreground",
                  )}
                  onClick={() => setMode(item)}
                >
                  {MODE_LABELS[item]}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">Editing full JSON payload.</p>
        )}
      </header>

      <div className="flex flex-1 flex-col overflow-hidden px-5 py-4">
        {renderEditor(mode, {
          richTextValue,
          codeValue,
          jsonValue,
          jsonError,
          codeLanguage,
          monacoTheme,
          onRichTextChange: handleRichTextChange,
          onCodeChange: handleCodeChange,
          onJsonChange: handleJsonChange,
          textTargetExists: Boolean(textTarget),
          codeTargetExists: Boolean(codeTarget),
        })}
        <p className="mt-3 text-xs text-muted-foreground">{MODE_HELPERS[mode]}</p>
      </div>

      <footer className="border-t border-border/60 px-5 py-4">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>

          <Dialog open={summaryDialogOpen} onOpenChange={handleSummaryDialogChange}>
            <DialogTrigger asChild>
              <Button type="button" disabled={isSaving || isSaveDisabled}>
                Save & Activate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Summarize your edit</DialogTitle>
                <DialogDescription>
                  Provide a short reason for this manual revision. This summary will be stored with the new version.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                rows={4}
                placeholder="e.g. Clarified section 2.3 and fixed the SQL filter criteria."
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                disabled={isSaving}
              />
              <DialogFooter>
                <Button type="button" variant="outline" disabled={isSaving} onClick={() => handleSummaryDialogChange(false)}>
                  Back
                </Button>
                <Button type="button" onClick={handleConfirmSave} disabled={isSaving || isSaveDisabled}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                      Saving
                    </>
                  ) : (
                    "Save & Activate"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </footer>
    </section>
  );
}

type RenderEditorParams = {
  richTextValue: string;
  codeValue: string;
  jsonValue: string;
  jsonError: string | null;
  codeLanguage: string;
  monacoTheme: string;
  onRichTextChange: (markdown: string) => void;
  onCodeChange: (value?: string) => void;
  onJsonChange: (value?: string) => void;
  textTargetExists: boolean;
  codeTargetExists: boolean;
};

function renderEditor(mode: EditorMode, params: RenderEditorParams) {
  const {
    richTextValue,
    codeValue,
    jsonValue,
    jsonError,
    codeLanguage,
    monacoTheme,
    onRichTextChange,
    onCodeChange,
    onJsonChange,
    textTargetExists,
    codeTargetExists,
  } = params;

  if (mode === "rich-text") {
    if (!textTargetExists) {
      return <EmptyState message="This artifact does not expose a plain text field." />;
    }
    return (
      <div className="flex-1 overflow-hidden rounded-2xl border border-border/70">
        <ReportEditor content={richTextValue} onMarkdownChange={onRichTextChange} />
      </div>
    );
  }

  if (mode === "code") {
    if (!codeTargetExists) {
      return <EmptyState message="No executable snippet detected. Switch to JSON mode instead." />;
    }
    return (
      <div className="flex-1 overflow-hidden rounded-2xl border border-border/70 bg-background/70">
        <MonacoEditor
          height="100%"
          defaultLanguage={codeLanguage || "plaintext"}
          language={codeLanguage || "plaintext"}
          theme={monacoTheme}
          value={codeValue}
          onChange={onCodeChange}
          options={MONACO_BASE_OPTIONS}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-hidden rounded-2xl border border-border/70 bg-background/70">
        <MonacoEditor
          height="100%"
          defaultLanguage="json"
          language="json"
          theme={monacoTheme}
          value={jsonValue}
          onChange={onJsonChange}
          options={{ ...MONACO_BASE_OPTIONS, wordWrap: "off" as const }}
        />
      </div>
      <p className={cn("mt-2 text-xs", jsonError ? "text-destructive" : "text-muted-foreground")}>
        {jsonError ?? "JSON edits must be valid before you can save."}
      </p>
    </div>
  );
}

function cloneJson(value: JsonObject | null | undefined): JsonObject {
  if (!value) return {};
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function setValueAtPath(target: JsonObject, path: string[], nextValue: string) {
  if (path.length === 0) return;
  let cursor: JsonObject = target;
  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index];
    if (typeof key === "undefined") {
      return;
    }
    const existing = cursor[key] as JsonValue | undefined;
    if (isJsonObject(existing)) {
      cursor = existing;
    } else {
      const replacement: JsonObject = {};
      cursor[key] = replacement;
      cursor = replacement;
    }
  }
  const finalKey = path[path.length - 1];
  if (typeof finalKey === "undefined") return;
  cursor[finalKey] = nextValue;
}

function findStringTarget(value: JsonObject | null, priorityKeys: readonly string[]): StringTarget | null {
  if (!value) return null;

  const visitObject = (obj: JsonObject, trail: string[]): StringTarget | null => {
    for (const key of priorityKeys) {
      const candidate = obj[key];
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return { path: [...trail, key], key, value: candidate, parent: obj };
      }
    }

    for (const key of Object.keys(obj)) {
      const candidate = obj[key];
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return { path: [...trail, key], key, value: candidate, parent: obj };
      }
      if (isJsonObject(candidate)) {
        const nested = visitObject(candidate, [...trail, key]);
        if (nested) return nested;
      }
    }
    return null;
  };

  return visitObject(value, []);
}

function inferLanguage(key?: string, parent?: JsonObject): string {
  if (!key) {
    const parentLanguage = readLanguageHint(parent);
    return parentLanguage ?? "plaintext";
  }
  const normalized = key.toLowerCase();
  if (normalized.includes("sql")) return "sql";
  if (normalized.includes("python") || normalized.endsWith("_py")) return "python";
  if (normalized.includes("ts")) return "typescript";
  if (normalized.includes("js")) return "javascript";
  if (normalized.includes("bash") || normalized.includes("shell")) return "shell";
  if (normalized.includes("json")) return "json";
  if (normalized.includes("yaml") || normalized.includes("yml")) return "yaml";
  return readLanguageHint(parent) ?? "plaintext";
}

function readLanguageHint(parent?: JsonObject) {
  if (!parent) return null;
  const candidate = parent.language ?? parent.lang;
  if (typeof candidate === "string" && candidate.trim()) {
    return candidate.trim().toLowerCase();
  }
  return null;
}

function isJsonObject(value: JsonValue | null | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/40 p-6 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
