// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

export type UITheme = "light" | "dark" | "system";

export interface LLMConfigRead {
  llm_provider: string | null;
  llm_model_name: string | null;
  llm_base_url: string | null;
  has_api_key: boolean | null;
}

export interface SettingsRead {
  ui_theme: UITheme;
  llm_config: LLMConfigRead | null;
}

export interface UIPreferencesUpdate {
  ui_theme?: UITheme;
}

export interface LLMConfigUpdate {
  llm_provider?: string | null;
  llm_model_name?: string | null;
  llm_api_key?: string;
  llm_base_url?: string | null;
}

export interface SettingsUpdate {
  ui_preferences?: UIPreferencesUpdate | null;
  llm_config?: LLMConfigUpdate | null;
}
