import { authApiClient, apiClient } from "~/core/api/client";
import type { UserRead, UserRegister } from "~/core/domain/user.types";

export const AuthService = {
  /**
   * Logs in a user using email and password via a form-encoded request.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; token_type: string }> {
    return authApiClient.login(email, password);
  },

  /**
   * Registers a new user account.
   */
  async register(credentials: UserRegister): Promise<UserRead> {
    return apiClient<UserRead>("/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Requests a password reset email. Always responds with success-like payload.
   */
  async requestPasswordReset(): Promise<{ message: string }> {
    return apiClient<{ message: string }>("/auth/reset-password", {
      method: "POST",
    });
  },
};
