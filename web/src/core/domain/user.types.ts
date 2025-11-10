/**
 * Represents the core identity information of a user.
 * Based on API Doc 2, Section 1.1 `GET /users/me`.
 */
export interface UserRead {
  id: number;
  email: string;
  display_name: string;
  is_active: boolean;
  is_verified: boolean;
}

/**
 * Application UI theme options.
 * From API Doc 2, Section 2.2 `UserSettingsUpdate`.
 */
export type Theme = "light" | "dark";

/**
 * AI behavior profile in Human-in-the-Loop interactions.
 * From API Doc 2, Section 2.2 `UserSettingsUpdate`.
 */
export type HITLProfile = "Novice" | "Experienced" | "Expert";

/**
 * AI thinking depth, affecting response time and complexity.
 * From API Doc 2, Section 2.2 `UserSettingsUpdate`.
 */
export type ThinkingDepth = "Instant" | "Medium" | "Heavy";

/**
 * Represents the complete personalized settings for a user.
 * Based on API Doc 2, Section 2.1 `GET /users/me/settings`.
 */
export interface UserSettingsRead {
  language: "en" | "zh";
  theme: Theme;
  hitl_profile: HITLProfile;
  thinking_depth: ThinkingDepth;
  llm_model_name: string | null;
  llm_base_url: string | null;
  has_llm_api_key: boolean;
  has_e2b_api_key: boolean;
}

/**
 * Represents the updatable fields for a user's settings.
 */
export interface UserSettingsUpdate {
  language?: "en" | "zh";
  theme?: Theme;
  hitl_profile?: HITLProfile;
  thinking_depth?: ThinkingDepth;
  llm_model_name?: string | null;
  llm_base_url?: string | null;
  llm_api_key?: string | null;
  e2b_api_key?: string | null;
}
