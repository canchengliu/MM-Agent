import { z } from "zod";

// API 7.4.1: SystemInfo (Application metadata and configuration)
export const SystemInfoSchema = z.object({
  app_version: z.string(),
  llm_model_name: z.string(), // System default LLM
  // Include potential future fields for robustness (API 7.3 Future-Proofing)
  commit_hash: z.string().optional(),
  build_timestamp: z.string().optional(),
  documentation_url: z.string().optional(),
  feature_flags: z.record(z.string(), z.boolean()).optional(),
});
export type SystemInfo = z.infer<typeof SystemInfoSchema>;

// API 7.1: Liveness Probe Response
export const LivenessResponseSchema = z.object({
  message: z.string(),
});
export type LivenessResponse = z.infer<typeof LivenessResponseSchema>;

// API 7.2: Health Check (Readiness Probe) Response
export const HealthCheckResponseSchema = z.object({
  status: z.literal("ok"),
});
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
