// Utilities for processing Markdown strings, focusing on compatibility between
// display (react-markdown) and editing (Tiptap/Novel), especially concerning LaTeX.

/**
 * Applies various fixes to Markdown strings for better rendering consistency.
 */
export function autoFixMarkdown(markdown: string): string {
  return autoCloseTrailingLink(markdown);
}

/**
 * Unescape markdown-escaped characters within math delimiters.
 * Tiptap-markdown often escapes characters like *, _, [, ] which corrupts LaTeX formulas.
 * This function restores the original LaTeX by unescaping within $...$ and $$...$$.
 * Crucial when exporting Markdown from the editor (Front Stack Ref: Markdown Preprocessing).
 */
export function unescapeLatexInMath(markdown: string): string {
  let result = markdown;

  // Process inline math: $...$
  result = result.replace(/\$([^\$]+?)\$/g, (match, mathContent) => {
    const unescaped = unescapeMarkdownSpecialChars(mathContent);
    return `$${unescaped}$`;
  });

  // Process display math: $$...$$
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (match, mathContent) => {
    const unescaped = unescapeMarkdownSpecialChars(mathContent);
    return `$$${unescaped}$$`;
  });

  return result;
}

/**
 * Reverse markdown escaping for special characters.
 * Order matters: process \\ last to avoid re-escaping characters we just unescaped.
 */
function unescapeMarkdownSpecialChars(text: string): string {
  return text
    .replace(/\\\*/g, "*") // \* → *
    .replace(/\\_/g, "_") // \_ → _
    .replace(/\\\[/g, "[") // \[ → [
    .replace(/\\\]/g, "]") // \] → ]
    .replace(/\\\{/g, "{") // \{ → {
    .replace(/\\\}/g, "}") // \} → }
    .replace(/\\\\/g, "\\"); // \\ → \ (Must be last)
}

/**
 * Normalize math delimiters for editor consumption (Tiptap).
 * Converts standard LaTeX delimiters (e.g. \[...\]) to the $...$ and $$...$$ format Tiptap expects.
 */
export function normalizeMathForEditor(markdown: string): string {
  let normalized = markdown;

  // Convert display math delimiters (\[...\] and \\[...\\])
  // Handle double backslash first
  normalized = normalized
    .replace(/\\\\\[([\s\S]*?)\\\\\]/g, (_match, content) => `$$${content}$$`) // \\[...\\] → $$...$$
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, content) => `$$${content}$$`); // \[...\] → $$...$$

  // Convert inline math delimiters (\(...\) and \\(...\\))
  normalized = normalized
    .replace(/\\\\\(([\s\S]*?)\\\\\)/g, (_match, content) => `$${content}$`) // \\(...\\) → $...$
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, content) => `$${content}$`); // \(...\) → $...$

  // Normalize backslashes within math contexts (sometimes LLMs output double backslashes)
  normalized = normalizeBackslashesInMath(normalized);

  return normalized;
}

/**
 * Normalize math delimiters for display consumption (react-markdown/remark-math).
 */
export function normalizeMathForDisplay(markdown: string): string {
  // The normalization logic is generally the same for display and editing.
  return normalizeMathForEditor(markdown);
}

/**
 * Fixes unclosed Markdown links or images at the end of a string.
 * Useful for streaming outputs.
 */
function autoCloseTrailingLink(markdown: string): string {
  let fixedMarkdown: string = markdown;

  // Fix unclosed image/link syntax ![...](... or [...](... at the end of the string
  const patterns = [
    { regex: /!\[([^\]]*)\]\(([^)]*)$/g, replacement: (m: string, alt: string, url: string) => `![${alt}](${url})` },
    { regex: /\[([^\]]*)\]\(([^)]*)$/g, replacement: (m: string, text: string, url: string) => `[${text}](${url})` },
    { regex: /!\[([^\]]*)$/g, replacement: (m: string, alt: string) => `![${alt}]` },
    { regex: /\[([^\]]*)$/g, replacement: (m: string, text: string) => `[${text}]` },
  ];

  patterns.forEach(({ regex, replacement }) => {
    fixedMarkdown = fixedMarkdown.replace(regex, replacement as any);
  });

  return fixedMarkdown;
}

/**
 * Helper to replace double backslashes with single ones within math contexts.
 */
function normalizeBackslashesInMath(markdown: string): string {
  let normalized = markdown;

  // For inline math: $...$
  normalized = normalized.replace(/\$([^\$]+?)\$/g, (match, mathContent) => {
    return `$${mathContent.replace(/\\\\/g, "\\")}$`;
  });

  // For display math: $$...$$
  normalized = normalized.replace(/\$\$([\s\S]+?)\$\$/g, (match, mathContent) => {
    return `$$${mathContent.replace(/\\\\/g, "\\")}$$`;
  });

  return normalized;
}

/**
 * Removes surrounding Markdown code block delimiters (```markdown, ```text, ```) if present.
 * Useful for cleaning up LLM outputs.
 */
export function dropMarkdownWrapper(markdown?: string | null): string {
    if (!markdown) return "";

    let result = markdown.trim();

    const patterns = [
        /^```markdown\n([\s\S]*?)\n```$/m,
        /^```text\n([\s\S]*?)\n```$/m,
        /^```\n([\s\S]*?)\n```$/m,
    ];

    for (const pattern of patterns) {
        const match = result.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }

    // Handle cases where the closing delimiter might be missing (e.g., during streaming)
    if (result.startsWith("```markdown\n") && !result.endsWith("```")) {
        return result.substring(12).trim();
    }
    if (result.startsWith("```text\n") && !result.endsWith("```")) {
        return result.substring(8).trim();
    }
    if (result.startsWith("```\n") && !result.endsWith("```")) {
        return result.substring(4).trim();
    }

    return result;
}
