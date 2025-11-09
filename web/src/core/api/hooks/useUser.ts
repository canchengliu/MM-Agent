// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  PasswordChangeRequest,
  UserRead,
  UserUpdate,
} from "../models/user";
import { userService } from "../services/user.service";

export const userKeys = {
  me: ["users", "me"] as const,
  detail: (id: string) => ["users", id] as const,
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: userService.getMe,
    staleTime: 5 * 60 * 1000, // Keep user data fresh for 5 minutes
    retry: (failureCount, error) => {
      const status = (error as { status?: number } | undefined)?.status;
      if (status === 401 || status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserUpdate) => userService.updateMe(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.me, updatedUser);
      toast.success("Profile updated successfully.");
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: PasswordChangeRequest) => userService.changePassword(data),
    onSuccess: (response) => {
      toast.success(response.detail);
    },
  });
};

export const useUserById = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: Boolean(id),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate }) =>
      userService.updateUserById(id, data),
    onSuccess: (updatedUser, { id }) => {
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      const currentUser = queryClient.getQueryData<UserRead>(userKeys.me);
      if (currentUser?.id === id) {
        queryClient.setQueryData(userKeys.me, updatedUser);
      }
      toast.success("User updated successfully.");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteUserById(id),
    onSuccess: (_, id) => {
      void queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      toast.success("User deleted successfully.");
    },
  });
};
