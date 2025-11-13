import { Mathematics } from "novel";

/**
 * Extended Mathematics extension with custom markdown serialization support.
 * This is crucial for ensuring that LaTeX formulas are correctly converted back
 * to standard Markdown delimiters ($...$ and $$...$$) when saving the content.
 */
export const MathematicsWithMarkdown = Mathematics.extend({
  addStorage() {
    return {
      // Define how this node should be serialized when using tiptap-markdown extension
      markdown: {
        serialize(state: any, node: any) {
          const latex = node.attrs?.latex || "";
          // The 'display' attribute determines if it's inline or block math
          const isBlock = node.attrs?.display === true;

          if (isBlock) {
            // Block/display math: $$...$$
            state.write("$$");
            state.write(latex);
            state.write("$$");
            // Ensure block separation in Markdown output
            state.closeBlock(node);
          } else {
            // Inline math: $...$
            state.write("$");
            state.write(latex);
            state.write("$");
          }
        },
      },
    };
  },
});

