"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QueryKeys } from "~/core/api/queryKeys";
import { UserService } from "~/core/api/services/user.service";
import type { UserSettingsUpdate } from "~/core/domain/user.types";

/**
 * Hook to fetch user settings.
 */
export function useUserSettings() {
  return useQuery({
    queryKey: QueryKeys.userSettings(),
    queryFn: ({ signal }) => UserService.getSettings(signal),
  });
}

/**
 * Hook to update user settings.
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UserSettingsUpdate) =>
      UserService.updateSettings(settings),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(QueryKeys.userSettings(), updatedSettings);
      toast.success("Settings updated successfully.");
    },
    onError: (error) => {
      console.error("Failed to update settings:", error);
      toast.error(
        `Failed to update settings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    },
  });
}
