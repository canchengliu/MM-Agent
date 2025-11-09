// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "~/components/ui/badge";
import ReportEditor from "~/components/editor";
import { Markdown } from "~/components/deer-flow/markdown";
import { useUpdateAssetContent } from "~/core/api/hooks/useAssets";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface EditableMarkdownOutputProps {
  content: string;
  assetId: string | null;
  jsonPointer: string;
  isEditable: boolean;
}

export const EditableMarkdownOutput = ({
  content,
  assetId,
  jsonPointer,
  isEditable,
}: EditableMarkdownOutputProps) => {
  const updateAssetContent = useUpdateAssetContent();
  const [editorContent, setEditorContent] = useState(content);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const lastSyncedContent = useRef(content);

  const canEdit = Boolean(isEditable && assetId);

  useEffect(() => {
    if (content !== lastSyncedContent.current) {
      setEditorContent(content);
      lastSyncedContent.current = content;
    }
  }, [content]);

  const debouncedSave = useDebouncedCallback(
    async (nextContent: string) => {
      if (!assetId || !canEdit) {
        return;
      }

      try {
        setStatus("saving");
        await updateAssetContent.mutateAsync({
          assetId,
          data: {
            content: nextContent,
            state_update_path: jsonPointer || undefined,
            content_type: "text/markdown",
          },
        });
        lastSyncedContent.current = nextContent;
        setStatus("saved");
      } catch (error) {
        console.error("Failed to save markdown output", error);
        toast.error("Failed to save changes");
        setStatus("error");
      }
    },
    1500,
  );

  useEffect(() => () => debouncedSave.cancel(), [debouncedSave]);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "saving":
        return "Saving…";
      case "saved":
        return "Saved";
      case "error":
        return "Error";
      default:
        return canEdit ? "Idle" : "Read-only";
    }
  }, [status, canEdit]);

  const statusClassName = useMemo(() => {
    switch (status) {
      case "saving":
        return "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-200";
      case "saved":
        return "border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
      case "error":
        return "border-destructive/60 bg-destructive/10 text-destructive";
      default:
        return "border-muted/60 bg-muted/30 text-muted-foreground";
    }
  }, [status]);

  const handleMarkdownChange = (nextValue: string) => {
    setEditorContent(nextValue);

    if (!canEdit) {
      return;
    }

    setStatus("idle");
    debouncedSave(nextValue);
  };

  if (!canEdit) {
    if (!content) {
      return (
        <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/20 p-4 text-sm text-muted-foreground">
          No markdown content available yet.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Badge variant="outline" className="border-muted/50 text-muted-foreground">
          Read-only
        </Badge>
        <Markdown>{content}</Markdown>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className={cn("text-xs", statusClassName)}>
          {statusLabel}
        </Badge>
        {!assetId ? (
          <span className="text-xs text-muted-foreground">
            Asset ID missing. Changes will not persist.
          </span>
        ) : null}
      </div>
      <ReportEditor
        key={`${assetId ?? "no-asset"}-${hashString(lastSyncedContent.current)}`}
        content={editorContent}
        onMarkdownChange={handleMarkdownChange}
      />
    </div>
  );
};

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
};
