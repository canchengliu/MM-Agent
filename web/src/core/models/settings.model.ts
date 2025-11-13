import { z } from "zod";

// Enums based on FRS 7.2, 7.4, 7.5 and API 2.2
export const LanguageEnum = z.enum(["en", "zh"]);
export type Language = z.infer<typeof LanguageEnum>;

// We use "system" internally for next-themes UI, but the API expects only light/dark.
export const ThemeEnumUI = z.enum(["light", "dark", "system"]);
export type ThemeUI = z.infer<typeof ThemeEnumUI>;

export const ThemeEnumAPI = z.enum(["light", "dark"]);
export type ThemeAPI = z.infer<typeof ThemeEnumAPI>;

export const HitlProfileEnum = z.enum(["Novice", "Experienced", "Expert"]);
export type HitlProfile = z.infer<typeof HitlProfileEnum>;

export const ThinkingDepthEnum = z.enum(["Instant", "Medium", "Heavy"]);
export type ThinkingDepth = z.infer<typeof ThinkingDepthEnum>;

// API 3.2 (User Management): UserSettingsRead
// This model is used for GET responses. It NEVER includes secrets.
export const UserSettingsReadSchema = z.object({
  language: LanguageEnum,
  theme: ThemeEnumAPI, // Backend stores explicit light or dark
  hitl_profile: HitlProfileEnum,
  thinking_depth: ThinkingDepthEnum,
  llm_model_name: z.string().nullable(),
  // Allow empty string which might be parsed from inputs before validation
  llm_base_url: z.string().url().nullable().or(z.literal("")),
  // Security Indicators (Write-After-Forgotten - S3.3)
  has_llm_api_key: z.boolean(),
  has_e2b_api_key: z.boolean(),
});
export type UserSettingsRead = z.infer<typeof UserSettingsReadSchema>;

// API 2.2 (User Management): UserSettingsUpdate (PATCH Request)
// This model is used for PATCH requests. All fields are optional.
// It allows sending secrets (明文) for update, or null/"" for deletion.
export const UserSettingsUpdateSchema = z.object({
  language: LanguageEnum.optional(),
  theme: ThemeEnumAPI.optional(),
  hitl_profile: HitlProfileEnum.optional(),
  thinking_depth: ThinkingDepthEnum.optional(),
  llm_model_name: z.string().nullable().optional(),
  llm_base_url: z.string().url().nullable().optional().or(z.literal("")),
  // Writable secrets. Send null or "" to clear.
  llm_api_key: z.string().nullable().optional(),
  e2b_api_key: z.string().nullable().optional(),
});
export type UserSettingsUpdate = z.infer<typeof UserSettingsUpdateSchema>;
