// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { FileCode } from "lucide-react";

import { CodeBlock } from "~/components/ui/code-block";

interface CodeOutputProps {
  value: string;
  language?: string;
}

export const CodeOutput = ({ value, language }: CodeOutputProps) => {
  if (!value) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-dashed border-muted-foreground/40 bg-muted/20 p-4 text-sm text-muted-foreground">
        <FileCode className="h-4 w-4" aria-hidden />
        <span>Generated code will appear here once available.</span>
      </div>
    );
  }

  return <CodeBlock language={language ?? "plaintext"} value={value} />;
};
