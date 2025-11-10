import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QueryKeys } from "~/core/api/queryKeys";
import { UserService } from "~/core/api/services/user.service";
import type { UserSettingsUpdate } from "~/core/domain";

/**
 * Fetches the current user's settings.
 */
export const useUserSettings = () => {
  return useQuery({
    queryKey: QueryKeys.userSettings(),
    queryFn: UserService.getSettings,
  });
};

/**
 * Creates a mutation handler for updating user settings.
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<UserSettingsUpdate>) =>
      UserService.updateSettings(settings),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.userSettings() });
      toast.success("Settings have been saved successfully.");
    },
    onError: (error) => {
      const description =
        error instanceof Error
          ? error.message
          : "An unknown error occurred.";

      toast.error("Failed to save settings", { description });
    },
  });
};
