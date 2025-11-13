import { AxiosError } from "axios";

import type {
  UserSettingsRead,
  UserSettingsUpdate,
} from "~/core/models/settings.model";
import type { PasswordChangeRequest, UserRead } from "~/core/models/user.model";

import apiClient from "./client";

export const UserService = {
  /**
   * Gets the profile information of the currently authenticated user (API 2.1.1).
   */
  getCurrentUser: async (): Promise<UserRead> => {
    const response = await apiClient.get<UserRead>("/users/me");
    return response.data;
  },

  /**
   * Changes the password of the currently authenticated user (API 2.1.2).
   */
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    try {
      // Expect 204 No Content on success
      await apiClient.patch("/users/me/password", data, {
        validateStatus: (status) => status === 204,
      });
    } catch (error) {
      // Handle 403 Forbidden (Incorrect current password)
      if (error instanceof AxiosError && error.response?.status === 403) {
        throw new Error("INCORRECT_CURRENT_PASSWORD");
      }
      throw error;
    }
  },

  /**
   * Gets the personalized settings of the currently authenticated user (API 2.2.1).
   */
  getCurrentUserSettings: async (): Promise<UserSettingsRead> => {
    const response = await apiClient.get<UserSettingsRead>("/users/me/settings");
    return response.data;
  },

  /**
   * Updates the personalized settings of the currently authenticated user (API 2.2.2).
   */
  updateCurrentUserSettings: async (
    data: UserSettingsUpdate,
  ): Promise<UserSettingsRead> => {
    const response = await apiClient.patch<UserSettingsRead>("/users/me/settings", data);
    return response.data;
  },
};
