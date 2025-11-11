import type { Brand } from "./common.types";

export type UserId = Brand<number, "UserId">;

/**
 * Core identity information for the authenticated user.
 * Mirrors API Doc 2 current-user schema.
 */
export interface UserRead {
  id: UserId;
  email: string;
  display_name: string | null;
  is_active: boolean;
  is_verified: boolean;
}

/**
 * Payload for creating a new user account.
 */
export interface UserRegister {
  email: string;
  password: string;
  display_name?: string;
}

/**
 * Personalized application preferences returned from the backend.
 * API keys are never returned, only presence flags.
 */
export interface UserSettingsRead {
  language: "en" | "zh";
  theme: "light" | "dark";
  hitl_profile: "Novice" | "Experienced" | "Expert";
  thinking_depth: "Instant" | "Medium" | "Heavy";
  llm_model_name: string | null;
  llm_base_url: string | null;
  has_llm_api_key: boolean;
  has_e2b_api_key: boolean;
}

/**
 * Payload for updating user settings. Mirrors the /users/me/settings PATCH request.
 * API keys are write-only; send null or "" to clear them.
 */
export type UserSettingsUpdate = Partial<{
  language: "en" | "zh";
  theme: "light" | "dark";
  hitl_profile: "Novice" | "Experienced" | "Expert";
  thinking_depth: "Instant" | "Medium" | "Heavy";
  llm_model_name: string | null;
  llm_base_url: string | null;
  llm_api_key: string | null;
  e2b_api_key: string | null;
}>;
