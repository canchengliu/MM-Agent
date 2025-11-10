// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type {
  UserRead,
  UserSettingsRead,
  UserSettingsUpdate,
} from "~/core/domain";

import { apiClient } from "../client";

/**
 * Service for handling user profile related API endpoints.
 */
export const UserService = {
  /**
   * Fetches the profile of the currently authenticated user.
   * This is the primary method for validating an existing session token.
   * @returns A promise resolving to the current user's data.
   */
  getMe: (): Promise<UserRead> => {
    return apiClient<UserRead>("/users/me", {
      method: "GET",
    });
  },

  /**
   * Fetches the personalized settings of the currently authenticated user.
   * @returns A promise resolving to the user's settings.
   */
  getSettings: (): Promise<UserSettingsRead> => {
    return apiClient<UserSettingsRead>("/users/me/settings", {
      method: "GET",
    });
  },

  /**
   * Partially updates settings for the current user.
   * @param settings - Settings payload containing changed fields only.
   * @returns Updated user settings from the server.
   */
  updateSettings: (
    settings: Partial<UserSettingsUpdate>,
  ): Promise<UserSettingsRead> => {
    return apiClient<UserSettingsRead>("/users/me/settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
  },
};
