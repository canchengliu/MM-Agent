"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import type { Options as ReactMarkdownOptions } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

import { Button } from "~/components/ui/button";
import { rehypeSplitWordsIntoSpans } from "~/core/rehype";
import { katexOptions } from "~/core/markdown/katex";
import { autoFixMarkdown, normalizeMathForDisplay } from "~/core/utils/markdown";
import { cn } from "~/lib/utils";

import PlatformImage from "./image";
import { Tooltip } from "./tooltip";

export interface MarkdownProps extends ReactMarkdownOptions {
  className?: string;
  enableCopy?: boolean;
  style?: React.CSSProperties;
  animated?: boolean;
}

export function Markdown({
  className,
  children,
  style,
  enableCopy,
  animated = false,
  ...props
}: MarkdownProps) {
  const components = useMemo<ReactMarkdownOptions["components"]>(() => {
    return {
      a: ({ href, children }) => (
        <a className="underline underline-offset-4" href={href ?? "#"} rel="noreferrer" target="_blank">
          {children}
        </a>
      ),
      img: ({ src, alt }) => (
        <a href={(src as string) ?? "#"} rel="noreferrer" target="_blank">
          <PlatformImage alt={alt ?? ""} className="rounded" src={src as string} />
        </a>
      ),
    };
  }, []);

  const rehypePlugins = useMemo<NonNullable<ReactMarkdownOptions["rehypePlugins"]>>(() => {
    const plugins: NonNullable<ReactMarkdownOptions["rehypePlugins"]> = [[rehypeKatex, katexOptions]];
    if (animated) {
      plugins.push(rehypeSplitWordsIntoSpans);
    }
    return plugins;
  }, [animated]);

  return (
    <div className={cn(className, "prose dark:prose-invert")} style={style}>
      <ReactMarkdown
        components={components}
        rehypePlugins={rehypePlugins}
        remarkPlugins={[remarkGfm, remarkMath]}
        {...props}
      >
        {autoFixMarkdown(
          dropMarkdownQuote(normalizeMathForDisplay(children ?? "")) ?? "",
        )}
      </ReactMarkdown>
      {enableCopy && typeof children === "string" && (
        <div className="flex">
          <CopyButton content={children} />
        </div>
      )}
    </div>
  );
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip title="Copy">
      <Button
        className="rounded-full"
        size="sm"
        variant="outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
          } catch (error) {
            console.error("Failed to copy markdown", error);
          }
        }}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </Tooltip>
  );
}

function dropMarkdownQuote(markdown?: string | null): string | null {
  if (!markdown) return null;

  const patternsToRemove = [
    { prefix: "```markdown\n", suffix: "\n```", prefixLen: 12 },
    { prefix: "```text\n", suffix: "\n```", prefixLen: 8 },
    { prefix: "```\n", suffix: "\n```", prefixLen: 4 },
  ];

  let result = markdown;

  for (const { prefix, suffix, prefixLen } of patternsToRemove) {
    if (result.startsWith(prefix) && !result.endsWith(suffix)) {
      result = result.slice(prefixLen);
      break;
    }
  }

  let changed = true;

  while (changed) {
    changed = false;

    for (const { prefix, suffix, prefixLen } of patternsToRemove) {
      let startIndex = 0;
      while ((startIndex = result.indexOf(prefix, startIndex)) !== -1) {
        const endIndex = result.indexOf(suffix, startIndex + prefixLen);
        if (endIndex !== -1) {
          const before = result.slice(0, startIndex);
          const content = result.slice(startIndex + prefixLen, endIndex);
          const after = result.slice(endIndex + suffix.length);
          result = before + content + after;
          changed = true;
          startIndex = before.length + content.length;
        } else {
          startIndex += prefixLen;
        }
      }
    }
  }

  return result;
}
