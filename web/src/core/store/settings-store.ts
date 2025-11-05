// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { create } from "zustand";

const SETTINGS_KEY = "workspace.settings";

export type SettingsState = {
  account: Record<string, never>;
  interface: {
    theme: "system" | "light" | "dark";
  };
  workflow: {
    autosave: boolean;
  };
};

const createDefaultState = (): SettingsState => ({
  account: {},
  interface: {
    theme: "system",
  },
  workflow: {
    autosave: true,
  },
});

export const useSettingsStore = create<SettingsState>(() => createDefaultState());

export const resetSettings = () => {
  useSettingsStore.setState(createDefaultState());
  saveSettings();
};

export const updateSettings = (partial: Partial<SettingsState>) => {
  useSettingsStore.setState((state) => ({
    account: { ...state.account, ...(partial.account ?? {}) },
    interface: { ...state.interface, ...(partial.interface ?? {}) },
    workflow: { ...state.workflow, ...(partial.workflow ?? {}) },
  }));
  saveSettings();
};

export const loadSettings = () => {
  if (typeof window === "undefined") {
    return;
  }

  const json = localStorage.getItem(SETTINGS_KEY);
  if (!json) {
    return;
  }

  try {
    const settings = JSON.parse(json) as Partial<SettingsState>;
    updateSettings(settings);
  } catch (error) {
    console.error(error);
    resetSettings();
  }
};

export const saveSettings = () => {
  if (typeof window === "undefined") {
    return;
  }
  const latestSettings = useSettingsStore.getState();
  const json = JSON.stringify(latestSettings);
  localStorage.setItem(SETTINGS_KEY, json);
};

loadSettings();
