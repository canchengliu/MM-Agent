// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { fetcher } from "../fetcher";
import type {
  PasswordChangeRequest,
  UserRead,
  UserUpdate,
} from "../models/user";

export const userService = {
  getMe: async () => {
    return fetcher<UserRead>("users/me", { suppress401Toast: true });
  },

  updateMe: async (data: UserUpdate) => {
    return fetcher<UserRead>("users/me", {
      method: "PATCH",
      body: data,
    });
  },

  changePassword: async (data: PasswordChangeRequest) => {
    return fetcher<{ detail: string }>("settings/password", {
      method: "POST",
      body: data,
    });
  },

  getUserById: async (id: string) => {
    return fetcher<UserRead>(`users/${id}`);
  },

  updateUserById: async (id: string, data: UserUpdate) => {
    return fetcher<UserRead>(`users/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  deleteUserById: async (id: string) => {
    return fetcher<null>(`users/${id}`, { method: "DELETE" });
  },
};
