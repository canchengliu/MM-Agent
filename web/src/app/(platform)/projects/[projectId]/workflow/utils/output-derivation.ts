import type { OutputReconstructionStrategy } from "~/core/store/slices/ui-interaction.slice";
import { dropMarkdownWrapper } from "~/core/utils/markdown";

// (Task 22): Implementation of Output Derivation and Reconstruction logic.
// This ensures that we can correctly display complex JSON outputs as Markdown
// and reconstruct the JSON structure after manual editing in a rich text editor.

export interface DerivedOutput {
  content: string;
  reconstruct: OutputReconstructionStrategy;
}

// Heuristic keys commonly containing primary Markdown content
const MARKDOWN_KEYS = ['report', 'content', 'markdown', 'analysis', 'summary', 'comparative_analysis', 'result'];
// Default key used when wrapping a string into an object during reconstruction fallback (e.g., when original was empty or structure was replaced)
const DEFAULT_WRAPPER_KEY = 'content';

/**
 * Analyzes the output data structure to determine how to display it (as Markdown)
 * and defines the strategy to reconstruct the data structure after manual editing.
 */
export const deriveOutput = (outputData: Record<string, unknown> | string | null | undefined): DerivedOutput => {
    // Scenario 0: Empty or Null
    if (!outputData || (typeof outputData === 'object' && Object.keys(outputData).length === 0)) {
        return {
            content: "",
            // If original was empty, return edited content wrapped in default key, or empty object if edited content is also empty.
            reconstruct: (editedContent) => editedContent.trim() ? { [DEFAULT_WRAPPER_KEY]: editedContent } : {},
        };
    }

    // Scenario 1: Simple string (Markdown)
    if (typeof outputData === 'string') {
        return {
            content: outputData,
            reconstruct: (editedContent) => {
                // If the original was a string, we return the edited string.
                // We assume the API/backend handles this correctly (accepting string for JsonObjectSchema if appropriate).
                return editedContent;
            },
        };
    }

    // Scenario 2: Object with known Markdown field
    if (typeof outputData === 'object' && outputData !== null) {
        for (const key of MARKDOWN_KEYS) {
            if (key in outputData && typeof (outputData as Record<string, unknown>)[key] === 'string') {
                return {
                    content: (outputData as Record<string, string>)[key],
                    reconstruct: (editedContent, originalData) => {
                        // Reconstruct by updating the specific key in the original object
                        if (typeof originalData === 'object' && originalData !== null) {
                            return {
                                ...(originalData as Record<string, unknown>),
                                [key]: editedContent,
                            };
                        }
                        // Fallback if original data structure is somehow mismatched (e.g. changed from object to string unexpectedly)
                        return { [key]: editedContent };
                    },
                };
            }
        }
    }

    // Scenario 3: Fallback for complex/unknown object (Serialized JSON)
    // We know it's an object with keys here because Scenario 0 handled empty objects.
    if (typeof outputData === 'object') {
        try {
            const jsonString = JSON.stringify(outputData, null, 2);
            // Display as Markdown JSON code block
            const markdownContent = `\`\`\`json\n${jsonString}\n\`\`\``;

            return {
                content: markdownContent,
                reconstruct: (editedContent) => {
                    // Attempt to reconstruct by parsing the edited content, expecting JSON.

                    // Strategy A: Check for ```json wrapper (most explicit)
                    const jsonBlockMatch = editedContent.match(/^\s*```json\s*\n([\s\S]*?)\n\s*```\s*$/m);
                    if (jsonBlockMatch && jsonBlockMatch[1] !== undefined) {
                        const contentToParse = jsonBlockMatch[1].trim();
                        if (contentToParse === "") return {}; // Handle empty content inside block

                        try {
                            return JSON.parse(contentToParse);
                        } catch (e) {
                            // If parsing fails here, it means the user edited the JSON and made it invalid.
                            // We throw a specific error to be handled by the UI (ManualEditSaveDialog).
                            throw new Error("INVALID_JSON_FORMAT");
                        }
                    }

                    // Strategy B: Check for generic ``` wrapper and attempt parse if it looks like JSON
                    const genericBlockMatch = editedContent.match(/^\s*```\s*\n([\s\S]*?)\n\s*```\s*$/m);
                    if (genericBlockMatch && genericBlockMatch[1] !== undefined) {
                       try {
                            const potentialJson = genericBlockMatch[1].trim();
                            if (potentialJson.startsWith('{') || potentialJson.startsWith('[')) {
                                return JSON.parse(potentialJson);
                            }
                       } catch (e) {
                            // If parsing fails, we treat it as a string replacement (fall through).
                            console.warn("Failed to parse edited JSON content from ``` block. Treating as string replacement.", e);
                       }
                    }


                    // Strategy C: Try parsing the clean content directly if it looks like JSON
                    const cleanContent = dropMarkdownWrapper(editedContent);
                    try {
                        const trimmedContent = cleanContent.trim();
                        if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
                            const parsed = JSON.parse(trimmedContent);
                            // If successful, we assume the user intended to replace the structure with this new JSON.
                            return parsed;
                        }
                    } catch (e) {
                        // Not valid JSON, fall through to string replacement.
                    }

                    // Final fallback: If reconstruction fails or user intended a string replacement (e.g. removed JSON structure and wrote Markdown).
                    const finalContent = dropMarkdownWrapper(editedContent);
                    console.warn("User potentially replaced JSON structure with non-JSON content during manual edit. Wrapping in default key.");
                    return finalContent.trim() ? { [DEFAULT_WRAPPER_KEY]: finalContent } : {};
                },
            };
        } catch (e) {
            console.error("Failed to serialize original output data:", e);
            // This should ideally not happen with valid API responses.
            return {
                content: "Error: Output data could not be displayed due to serialization issues.",
                reconstruct: () => ({ error: "Manual edit failed due to internal serialization issues." }),
            };
        }
    }

    // Default fallback for other unlikely types (e.g., numbers, booleans)
    return {
        content: String(outputData),
        reconstruct: (editedContent) => editedContent.trim() ? { [DEFAULT_WRAPPER_KEY]: editedContent } : {},
    };
};

