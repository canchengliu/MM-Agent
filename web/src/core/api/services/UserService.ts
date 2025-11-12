import { apiClient } from "../ApiClient";
import type {
  PasswordChange,
  UserRead,
  UserSettingsRead,
  UserSettingsUpdate,
} from "../types";

export const UserService = {
  getProfile() {
    return apiClient.get<UserRead>("/users/me");
  },
  changePassword(payload: PasswordChange) {
    return apiClient.patch<void>("/users/me/password", payload);
  },
  getSettings() {
    return apiClient.get<UserSettingsRead>("/users/me/settings");
  },
  updateSettings(payload: UserSettingsUpdate) {
    return apiClient.patch<UserSettingsRead>("/users/me/settings", payload);
  },
};
