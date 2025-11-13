import { z } from "zod";

/**
 * Generic schema factory for paginated responses (API 3.1.2, 4.1.2).
 * @param itemSchema The Zod schema for the items in the list.
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    total: z.number().int(),
    items: z.array(itemSchema),
  });

/**
 * Type helper for PaginatedResponse.
 * Aligns with the interface defined in core/api/types.ts.
 */
export type PaginatedResponse<T> = {
  total: number;
  items: T[];
};

// Generic schema for dynamic JSON structures (e.g., LLM outputs, HITL interactions)
export const JsonObjectSchema = z.record(z.string(), z.any());

// Define the structure for Execution Artifacts (API 5.5.2, 5.5.3, Design Doc 2.1.2.B)
// We use .passthrough() to allow keys beyond the documented ones, ensuring flexibility.
export const ExecutionArtifactsSchema = z
  .object({
    prompt: z.string().optional(),
    raw_llm_response: z.string().optional(),
    "generated_code.py": z.string().optional(),
    "execution.log": z.string().optional(),
    tool_call_log: z.any().optional(), // Tool logs can be complex objects or arrays
  })
  .passthrough()
  .nullable();
export type ExecutionArtifacts = z.infer<typeof ExecutionArtifactsSchema>;
