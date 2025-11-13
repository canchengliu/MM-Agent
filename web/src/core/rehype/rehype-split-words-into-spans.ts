/**
 * Rehype plugin to split words within certain elements into individual spans.
 * This enables per-word animations (e.g., fade-in effects) often used during streaming text generation.
 */

import type { Element, Root, ElementContent } from "hast";
import { visit } from "unist-util-visit";
import type { BuildVisitor } from "unist-util-visit";

// Elements where word splitting should be applied
const TARGET_TAGS = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "strong", "em", "span"];

export function rehypeSplitWordsIntoSpans() {
  return (tree: Root) => {
    // Visit all element nodes in the HAST tree
    visit(tree, "element", ((node: Element) => {
      if (TARGET_TAGS.includes(node.tagName) && node.children) {
        const newChildren: Array<ElementContent> = [];

        node.children.forEach((child) => {
          if (child.type === "text") {
            // Use Intl.Segmenter for locale-aware word segmentation
            const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
            const segments = segmenter.segment(child.value);

            Array.from(segments).forEach((segment) => {
                // Handle whitespace preservation
                if (!segment.segment.trim() && segment.segment.length > 0) {
                    newChildren.push({ type: "text", value: segment.segment });
                    return;
                }

                if (segment.segment.length > 0) {
                    newChildren.push({
                        type: "element",
                        tagName: "span",
                        properties: {
                            // Class applied for animation (requires corresponding CSS keyframes)
                            className: "animate-word-fade-in",
                             style: "display: inline-block;" // Ensure spans behave like words
                        },
                        children: [{ type: "text", value: segment.segment }],
                    });
                }
            });
          } else {
            // Keep non-text children as they are
            newChildren.push(child);
          }
        });
        node.children = newChildren;
      }
    }) as BuildVisitor<Root, "element">);
  };
}
