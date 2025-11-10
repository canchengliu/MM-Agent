// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { AlertTriangle, FileJson, Save, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";
import type { NodeDetailView } from "~/core/domain";
import { useWorkspaceStore } from "~/core/store";
import { useManualEdit } from "~/features/workspace/hooks/useNodeActions";

const coerceValue = (text: string, originalValue: unknown): unknown => {
  if (typeof originalValue === "number") {
    const num = Number.parseFloat(text);
    return Number.isNaN(num) ? text : num;
  }
  if (typeof originalValue === "boolean") {
    const normalized = text.toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
    return text;
  }
  return text;
};

interface EditableFieldProps {
  fieldKey: string;
  initialValue: unknown;
  onUpdate: (key: string, value: unknown, isValid: boolean) => void;
  isPending: boolean;
}

function EditableField({
  fieldKey,
  initialValue,
  onUpdate,
  isPending,
}: EditableFieldProps) {
  const isComplex =
    initialValue !== null && typeof initialValue === "object";
  const getInitialText = () => {
    if (isComplex) {
      return JSON.stringify(initialValue, null, 2);
    }
    if (
      typeof initialValue === "string" ||
      typeof initialValue === "number" ||
      typeof initialValue === "boolean"
    ) {
      return String(initialValue);
    }
    return "";
  };
  const [textValue, setTextValue] = React.useState(getInitialText);
  const [isValid, setIsValid] = React.useState(true);

  const debouncedOnUpdate = useDebouncedCallback(onUpdate, 300);

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const newText = event.target.value;
    setTextValue(newText);

    if (isComplex) {
      try {
        const parsed = JSON.parse(newText);
        setIsValid(true);
        debouncedOnUpdate(fieldKey, parsed, true);
      } catch {
        setIsValid(false);
        debouncedOnUpdate(fieldKey, null, false);
      }
    } else {
      const coerced = coerceValue(newText, initialValue);
      debouncedOnUpdate(fieldKey, coerced, true);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldKey} className="flex items-center gap-2 font-mono">
        {fieldKey}
        {!isValid && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" /> Invalid JSON
          </span>
        )}
      </Label>
      <Textarea
        id={fieldKey}
        value={textValue}
        onChange={handleChange}
        disabled={isPending}
        className="min-h-24 font-mono text-xs"
        data-invalid={!isValid}
      />
    </div>
  );
}

interface ManualEditorViewProps {
  node: NodeDetailView;
  workflowId: number;
}

export function ManualEditorView({ node, workflowId }: ManualEditorViewProps) {
  const stopEditing = useWorkspaceStore((state) => state.stopEditingNode);
  const { mutate: save, isPending } = useManualEdit(workflowId);

  const initialData = node.active_version?.output_data ?? {};
  const [editedData, setEditedData] = React.useState(initialData);
  const [validationState, setValidationState] = React.useState<
    Record<string, boolean>
  >(() =>
    Object.keys(initialData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<string, boolean>,
    ),
  );
  const [summary, setSummary] = React.useState("");

  const handleFieldUpdate = React.useCallback(
    (key: string, value: unknown, isValid: boolean) => {
      if (isValid) {
        setEditedData((prev) => ({ ...prev, [key]: value }));
      }
      setValidationState((prev) => ({ ...prev, [key]: isValid }));
    },
    [],
  );

  const allFieldsValid =
    Object.values(validationState).length === 0 ||
    Object.values(validationState).every((v) => v === true);

  const handleSave = () => {
    if (!allFieldsValid) {
      toast.error("Invalid data", {
        description: "Please correct the invalid fields before saving.",
      });
      return;
    }

    const baseVersionId = node.active_version?.id;
    if (!baseVersionId) {
      toast.error("Missing base version", {
        description: "Cannot save an edit without a base version to branch from.",
      });
      return;
    }

    save(
      {
        nodeId: node.id,
        payload: {
          base_version_id: baseVersionId,
          edited_output_data: editedData,
          summary: summary.trim() || "Manually edited output.",
        },
      },
      {
        onSuccess: () => {
          stopEditing();
        },
      },
    );
  };

  return (
    <div className="flex h-full flex-col bg-background p-6">
      <header className="mb-4 flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="flex items-center gap-3 text-xl font-bold">
            <FileJson />
            Manually Editing: <span className="text-primary">{node.name}</span>
          </h2>
          <p className="text-muted-foreground">
            Directly modify the output fields. Your changes will create a new,
            manually sourced version.
          </p>
        </div>
      </header>
      <ScrollArea className="flex-1 pr-4">
        {Object.keys(initialData).length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No output fields available to edit.
          </div>
        ) : (
          <div className="grid gap-6">
            {Object.entries(initialData).map(([key, value]) => (
              <EditableField
                key={key}
                fieldKey={key}
                initialValue={value}
                onUpdate={handleFieldUpdate}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </ScrollArea>
      <footer className="mt-4 flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
        <div className="grid w-full max-w-md items-center gap-1.5">
          <Label htmlFor="summary">Edit Summary (Optional)</Label>
          <Input
            id="summary"
            placeholder="e.g., Corrected the problem statement for clarity."
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="ghost" onClick={stopEditing} disabled={isPending}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={!allFieldsValid || isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Saving..." : "Save as New Version"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
