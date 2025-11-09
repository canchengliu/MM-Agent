// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { fetcher } from "../fetcher";
import type { SettingsRead, SettingsUpdate } from "../models/settings";

export const settingsService = {
  getSettings: async () => {
    return fetcher<SettingsRead>("settings");
  },

  updateSettings: async (data: SettingsUpdate) => {
    return fetcher<SettingsRead>("settings", {
      method: "PUT",
      body: data,
    });
  },
};
