// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "./button";

interface CodeBlockProps {
  language?: string;
  value: string;
}

/**
 * Reusable syntax-highlighted code block with copy support.
 */
export const CodeBlock = React.memo(({ language = "plaintext", value }: CodeBlockProps) => {
  const { resolvedTheme } = useTheme();
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = React.useCallback(() => {
    if (!value) {
      return;
    }

    if (!navigator.clipboard?.writeText) {
      toast.error("Copy to clipboard not supported.");
      return;
    }

    navigator.clipboard
      .writeText(value)
      .then(() => {
        setIsCopied(true);
        toast.success("Code copied to clipboard.");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy code.");
      });
  }, [value]);

  if (!value) {
    return null;
  }

  const isDark = resolvedTheme === "dark";
  const highlightStyle = isDark ? dark : docco;

  return (
    <div className="relative w-full overflow-hidden rounded-lg border font-mono text-sm shadow-sm">
      <SyntaxHighlighter
        language={language}
        style={highlightStyle}
        customStyle={{
          margin: 0,
          padding: "1.25rem",
          overflowX: "auto",
          backgroundColor: isDark ? "#1e293b" : "#f8fafc",
        }}
        showLineNumbers
      >
        {value}
      </SyntaxHighlighter>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 text-muted-foreground transition-colors hover:text-foreground"
        onClick={copyToClipboard}
        aria-label="Copy code"
      >
        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";
