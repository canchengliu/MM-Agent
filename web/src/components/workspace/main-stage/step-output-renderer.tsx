// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { FileWarning } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { WorkflowOutputObject } from "~/core/api/models/workflow";
import {
  type StepOutputConfig,
  type WorkflowOutputType,
  inferOutputType,
} from "~/core/config";

import { EditableMarkdownOutput } from "./outputs/editable-markdown-output";
import { ImageOutput } from "./outputs/image-output";
import { CodeOutput } from "./outputs/code-output";
import { CodeBlock } from "~/components/ui/code-block";

interface StepOutputRendererProps {
  config: StepOutputConfig;
  rawValue: unknown;
  jsonPointer: string;
  isEditable: boolean;
}

interface NormalizedOutput {
  content: string | null;
  assetId: string | null;
  mimeType?: string;
  name?: string;
  deducedType: WorkflowOutputType;
}

export const StepOutputRenderer = ({
  config,
  rawValue,
  jsonPointer,
  isEditable,
}: StepOutputRendererProps) => {
  const normalized = normalizeOutput(rawValue, config);

  return (
    <Card className="border-muted/60 bg-background/95 shadow-sm backdrop-blur">
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base font-semibold">{config.label}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {config.statePath}
          </CardDescription>
        </div>
        {normalized.name ? (
          <span className="text-xs text-muted-foreground/80">{normalized.name}</span>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {renderOutput({
          config,
          normalized,
          jsonPointer,
          isEditable,
        })}
      </CardContent>
    </Card>
  );
};

const renderOutput = ({
  config,
  normalized,
  jsonPointer,
  isEditable,
}: {
  config: StepOutputConfig;
  normalized: NormalizedOutput;
  jsonPointer: string;
  isEditable: boolean;
}) => {
  const resolvedType = normalized.deducedType;

  if (!normalized.content && !normalized.assetId) {
    return (
      <EmptyOutputState
        message="No data available for this output yet."
        hint="This step may still be running or has not produced artifacts."
      />
    );
  }

  switch (resolvedType) {
    case "markdown":
      return (
        <EditableMarkdownOutput
          content={normalized.content ?? ""}
          assetId={normalized.assetId}
          isEditable={isEditable}
          jsonPointer={jsonPointer}
        />
      );
    case "image":
      return (
        <ImageOutput
          assetId={normalized.assetId}
          alt={config.label}
        />
      );
    case "code":
      return (
        <CodeOutput
          value={normalized.content ?? ""}
          language={config.language}
        />
      );
    case "json": {
      const displayValue =
        normalized.content && isProbablyJson(normalized.content)
          ? JSON.stringify(JSON.parse(normalized.content), null, 2)
          : normalized.content ?? "";

      return <CodeBlock language="json" value={displayValue} />;
    }
    default:
      return (
        <EmptyOutputState
          message="Unsupported output type."
          hint="Extend the renderer to handle this artifact type."
        />
      );
  }
};

const normalizeOutput = (rawValue: unknown, config: StepOutputConfig): NormalizedOutput => {
  if (rawValue === null || rawValue === undefined) {
    return {
      content: null,
      assetId: null,
      deducedType: config.type,
    };
  }

  if (typeof rawValue === "string") {
    return {
      content: rawValue,
      assetId: null,
      deducedType: config.type,
    };
  }

  if (typeof rawValue === "object") {
    const objectValue = rawValue as WorkflowOutputObject & {
      value?: unknown;
      data?: unknown;
      type?: string;
    };

    const fallbackContent =
      typeof objectValue.value === "string"
        ? objectValue.value
        : typeof objectValue.data === "string"
          ? objectValue.data
          : null;

    let content =
      typeof objectValue.content === "string" ? objectValue.content : fallbackContent;

    const assetId =
      typeof objectValue.asset_id === "string" && objectValue.asset_id.length > 0
        ? objectValue.asset_id
        : null;

    const mimeType =
      typeof objectValue.mime_type === "string" && objectValue.mime_type.length > 0
        ? objectValue.mime_type
        : undefined;

    const name =
      typeof objectValue.name === "string" && objectValue.name.length > 0
        ? objectValue.name
        : undefined;

    const inferredType =
      config.type === "unknown" ? inferOutputType(mimeType) : config.type;

    if (!content && assetId == null && inferredType === "json") {
      content = JSON.stringify(objectValue, null, 2);
    }

    return {
      content,
      assetId,
      mimeType,
      name,
      deducedType: inferredType,
    };
  }

  return {
    content: String(rawValue),
    assetId: null,
    deducedType: config.type,
  };
};

const isProbablyJson = (value: string) => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

const EmptyOutputState = ({ message, hint }: { message: string; hint: string }) => (
  <div className="flex items-start gap-3 rounded-md border border-dashed border-muted-foreground/40 bg-muted/20 p-4 text-sm text-muted-foreground">
    <FileWarning className="mt-0.5 h-4 w-4 text-muted-foreground/80" aria-hidden />
    <div>
      <p className="font-medium text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground/80">{hint}</p>
    </div>
  </div>
);
