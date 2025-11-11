import { apiClient } from "~/core/api/client";
import type {
  UserRead,
  UserSettingsRead,
  UserSettingsUpdate,
} from "~/core/domain/user.types";

export const UserService = {
  /**
   * Fetches the authenticated user's profile.
   */
  async getMe(signal?: AbortSignal): Promise<UserRead> {
    return apiClient<UserRead>("/users/me", { signal });
  },

  /**
   * Retrieves persisted user settings for preferences and integrations.
   */
  async getSettings(): Promise<UserSettingsRead> {
    return apiClient<UserSettingsRead>("/users/me/settings");
  },

  /**
   * Partially updates user settings.
   */
  async updateSettings(
    settings: UserSettingsUpdate,
  ): Promise<UserSettingsRead> {
    return apiClient<UserSettingsRead>("/users/me/settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
  },
};
