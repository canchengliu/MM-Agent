import { toast } from "sonner";

import { UserService } from "~/core/api/user.service";
import type {
  UserSettingsRead,
  UserSettingsUpdate,
} from "~/core/models/settings.model";
import { type SliceCreator } from "~/core/store";

export interface SettingsSlice {
  // State
  settings: UserSettingsRead | null;
  isLoadingSettings: boolean;
  isUpdatingSettings: boolean;

  // Actions
  fetchSettings: () => Promise<UserSettingsRead | null>;
  updateSettings: (data: UserSettingsUpdate) => Promise<boolean>;
}

// The SettingsSlice relies on the AuthSlice being initialized and authenticated.
export const createSettingsSlice: SliceCreator<SettingsSlice> = (set, get) => ({
  settings: null,
  isLoadingSettings: false,
  isUpdatingSettings: false,

  fetchSettings: async () => {
    // Ensure user is authenticated before fetching
    if (!get().isAuthenticated) {
      return null;
    }

    // Avoid re-fetching if already loading or loaded
    if (get().isLoadingSettings || get().settings) return get().settings;

    set({ isLoadingSettings: true });
    try {
      const settings = await UserService.getCurrentUserSettings();
      set({ settings });
      return settings;
    } catch (error) {
      console.error("Failed to fetch user settings:", error);
      toast.error("Failed to load settings. Please try refreshing the page.");
      return null;
    } finally {
      set({ isLoadingSettings: false });
    }
  },

  updateSettings: async (data) => {
    if (!get().isAuthenticated) {
      return false;
    }

    // Optimization: Don't send empty updates
    if (Object.keys(data).length === 0) {
      return true;
    }

    set({ isUpdatingSettings: true });
    try {
      // The API returns the full updated settings object (API 2.2.2)
      const updatedSettings = await UserService.updateCurrentUserSettings(data);
      set({ settings: updatedSettings });
      toast.success("Settings updated successfully.");
      return true;
    } catch (error) {
      console.error("Failed to update user settings:", error);
      // Specific error handling based on API response might be added here.
      toast.error("Failed to update settings. Please check the values and try again.");
      return false;
    } finally {
      set({ isUpdatingSettings: false });
    }
  },
});
