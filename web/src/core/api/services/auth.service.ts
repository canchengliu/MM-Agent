// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import type { UserRead } from "~/core/domain";

import { apiClient, authApiClient } from "../client";

/**
 * Payload for creating a new user account.
 * Mirrors API Doc 1, Section 2.1.
 */
interface RegisterPayload {
  email: string;
  password: string;
  display_name?: string;
}

/**
 * Service for handling user authentication API endpoints.
 */
export const AuthService = {
  /**
   * Logs in a user using email and password.
   * This uses the specialized authApiClient for `application/x-www-form-urlencoded` requests.
   * @param username - The user's email address.
   * @param password - The user's password.
   * @returns A promise resolving to the access token and token type.
   */
  login: (
    username: string,
    password: string,
  ): Promise<{ access_token: string; token_type: "bearer" }> => {
    return authApiClient.login(username, password);
  },

  /**
   * Registers a new user account.
   * @param payload - The user registration data.
   * @returns A promise resolving to the newly created user's data.
   */
  register: (payload: RegisterPayload): Promise<UserRead> => {
    return apiClient<UserRead>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
