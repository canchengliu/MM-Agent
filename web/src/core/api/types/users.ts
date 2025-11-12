import type { Nullable } from "./common";

export type UserLanguage = "en" | "zh";
export type UserTheme = "light" | "dark";
export type HitlProfilePreference = "Novice" | "Experienced" | "Expert";
export type ThinkingDepthPreference = "Instant" | "Medium" | "Heavy";

export interface UserRead {
  id: number;
  email: string;
  display_name: Nullable<string>;
  is_active: boolean;
  is_verified: boolean;
}

export type UserProfile = UserRead;

export interface UserSettingsRead {
  language: UserLanguage;
  theme: UserTheme;
  hitl_profile: HitlProfilePreference;
  thinking_depth: ThinkingDepthPreference;
  llm_model_name: Nullable<string>;
  llm_base_url: Nullable<string>;
  has_llm_api_key: boolean;
  has_e2b_api_key: boolean;
}

export interface UserSettingsUpdate {
  language?: UserLanguage;
  theme?: UserTheme;
  hitl_profile?: HitlProfilePreference;
  thinking_depth?: ThinkingDepthPreference;
  llm_model_name?: Nullable<string>;
  llm_base_url?: Nullable<string>;
  llm_api_key?: Nullable<string>;
  e2b_api_key?: Nullable<string>;
}

export interface PasswordChangePayload {
  current_password: string;
  new_password: string;
}

export type PasswordChange = PasswordChangePayload;
