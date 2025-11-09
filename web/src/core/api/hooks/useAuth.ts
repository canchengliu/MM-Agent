// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UserCreate } from "../models/user";
import { authService } from "../services/auth.service";
import { clearAccessToken, setAccessToken } from "../token-storage";
import { userKeys } from "./useUser";

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreate) => authService.register(data),
    onSuccess: async (user) => {
      console.log("Registration successful:", user.email);
      await queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      authService.login(credentials),
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      console.log("Login successful. Access token stored.");
      await queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAccessToken();
      console.log("Logout process completed. Access token cleared.");
      queryClient.clear();
    },
  });
};
