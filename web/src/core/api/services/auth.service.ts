// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { fetcher } from "../fetcher";
import type { TokenResponse, UserCreate, UserRead } from "../models/user";

export const authService = {
  register: async (data: UserCreate) => {
    return fetcher<UserRead>("auth/register", {
      method: "POST",
      body: data,
    });
  },

  login: async (credentials: { username: string; password: string }) => {
    return fetcher<TokenResponse>("auth/jwt/login", {
      method: "POST",
      body: credentials,
      isFormUrlEncoded: true,
    });
  },

  logout: async () => {
    return fetcher<{ status: string; message: string }>("auth/jwt/logout", {
      method: "POST",
    });
  },
};
