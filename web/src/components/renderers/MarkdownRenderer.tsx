"use client";

/**
 * Professional Markdown and LaTeX Renderer Component.
 * Implements Design Doc requirement 3.2.1 (Professional Markdown/LaTeX Renderer).
 * Utilizes react-markdown with GFM, Math (KaTeX) support, and customized high-density typography.
 */

import React, { useMemo } from "react";
import ReactMarkdown, { type Options as ReactMarkdownOptions } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Import KaTeX CSS for formula rendering
import "katex/dist/katex.min.css";

import { katexOptions } from "~/core/markdown/katex";
import { autoFixMarkdown, normalizeMathForDisplay, dropMarkdownWrapper } from "~/core/utils/markdown";
import { rehypeSplitWordsIntoSpans } from "~/core/rehype";
import { cn } from "~/lib/utils";

export interface MarkdownRendererProps extends Omit<ReactMarkdownOptions, 'children'> {
  /** The Markdown content string to render. */
  content: string;
  /** Optional CSS class name for the container div. */
  className?: string;
  /**
   * Enable animated rendering (e.g., for streaming content).
   * Splits words into spans for fade-in effects (requires corresponding CSS).
   */
  animated?: boolean;
  /**
   * Controls whether to automatically clean up LLM wrappers (e.g., ```markdown ... ```).
   * @default true
   */
  cleanWrapper?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  className,
  content,
  animated = false,
  cleanWrapper = true,
  ...props
}) => {

  // Define custom components for specific elements
  const components: ReactMarkdownOptions["components"] = useMemo(() => {
    return {
      // Ensure all links open in a new tab securely
      a: ({ href, children }) => {
        const rel = "noopener noreferrer";
        const link = (href as string | undefined) ?? "#";
        return (
          <a href={link} target="_blank" rel={rel}>
            {children}
          </a>
        );
      },
      // Basic image rendering
      img: ({ src, alt }) => (
        <img className="rounded-md border" src={src as string} alt={alt ?? ""} />
      ),
      // Ensure code blocks use Geist Mono (Design Doc 4.1.2.B)
      pre: ({ children }) => (
          <pre className="font-mono">{children}</pre>
      ),
      code: ({ children }) => (
          <code className="font-mono">{children}</code>
      )
    };
  }, []);

  // Configure Rehype plugins
  const rehypePlugins = useMemo<NonNullable<ReactMarkdownOptions["rehypePlugins"]>>(() => {
    const plugins: NonNullable<ReactMarkdownOptions["rehypePlugins"]> = [
        // Add KaTeX rendering plugin
        [rehypeKatex, katexOptions]
    ];
    // Add animation plugin if enabled
    if (animated) {
      plugins.push(rehypeSplitWordsIntoSpans);
    }
    return plugins;
  }, [animated]);

  // Preprocess the markdown content
  const processedContent = useMemo(() => {
    if (!content) return "";
    let markdown = content;
    if (cleanWrapper) {
        markdown = dropMarkdownWrapper(markdown);
    }
    // Normalize LaTeX delimiters and apply automatic fixes
    return autoFixMarkdown(normalizeMathForDisplay(markdown));
  }, [content, cleanWrapper]);


  return (
    <div
      // Apply Tailwind Typography classes ('prose') for professional styling (Design Doc 4.1.2.D).
      // 'max-w-none' ensures it fills the container.
      className={cn("prose dark:prose-invert max-w-none", className)}
    >
      <ReactMarkdown
        // Configure Remark plugins for GFM and Math syntax
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={rehypePlugins}
        components={components}
        {...props}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

