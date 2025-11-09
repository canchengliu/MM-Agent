// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { SettingsUpdate } from "../models/settings";
import { settingsService } from "../services/settings.service";

const settingsKeys = {
  all: ["settings"] as const,
};

export const useSettings = () => {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: settingsService.getSettings,
    staleTime: 10 * 60 * 1000,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SettingsUpdate) => settingsService.updateSettings(data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(settingsKeys.all, updatedSettings);
      toast.success("Settings updated successfully.");
    },
  });
};
