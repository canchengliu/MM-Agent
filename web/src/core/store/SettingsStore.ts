import { create } from "zustand";

import { UserService } from "../api/services/UserService";
import type { UserSettingsRead, UserSettingsUpdate } from "../api/types";

interface SettingsState {
  settings: UserSettingsRead;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<UserSettingsRead>;
  updateSettings: (changes: UserSettingsUpdate) => Promise<UserSettingsRead>;
  reset: () => void;
}

const defaultSettings: UserSettingsRead = {
  language: "en",
  theme: "dark",
  hitl_profile: "Experienced",
  thinking_depth: "Medium",
  llm_model_name: null,
  llm_base_url: null,
  has_llm_api_key: false,
  has_e2b_api_key: false,
};

const cloneDefaultSettings = (): UserSettingsRead => ({
  ...defaultSettings,
});

const hasSecretValue = (value: string | null | undefined) => {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return Boolean(value);
};

const applyOptimisticChanges = (
  current: UserSettingsRead,
  changes: UserSettingsUpdate,
): UserSettingsRead => {
  const next: UserSettingsRead = { ...current };

  if (changes.language !== undefined) {
    next.language = changes.language;
  }
  if (changes.theme !== undefined) {
    next.theme = changes.theme;
  }
  if (changes.hitl_profile !== undefined) {
    next.hitl_profile = changes.hitl_profile;
  }
  if (changes.thinking_depth !== undefined) {
    next.thinking_depth = changes.thinking_depth;
  }
  if (changes.llm_model_name !== undefined) {
    next.llm_model_name = changes.llm_model_name ?? null;
  }
  if (changes.llm_base_url !== undefined) {
    next.llm_base_url = changes.llm_base_url ?? null;
  }
  if ("llm_api_key" in changes) {
    next.has_llm_api_key = hasSecretValue(changes.llm_api_key ?? undefined);
  }
  if ("e2b_api_key" in changes) {
    next.has_e2b_api_key = hasSecretValue(changes.e2b_api_key ?? undefined);
  }

  return next;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: cloneDefaultSettings(),
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await UserService.getSettings();
      set({ settings, isLoading: false, error: null });
      return settings;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load settings.",
      });
      throw error;
    }
  },

  updateSettings: async (changes) => {
    const previous = get().settings;
    const optimistic = applyOptimisticChanges(previous, changes);
    set({ settings: optimistic });

    try {
      const updated = await UserService.updateSettings(changes);
      set({ settings: updated, error: null });
      return updated;
    } catch (error) {
      set({
        settings: previous,
        error: error instanceof Error ? error.message : "Failed to update settings.",
      });
      throw error;
    }
  },

  reset: () => {
    set({ settings: cloneDefaultSettings(), isLoading: false, error: null });
  },
}));
