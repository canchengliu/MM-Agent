import { AxiosError } from "axios";

import type {
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
} from "~/core/models/auth.model";
import type { UserRead } from "~/core/models/user.model";

import apiClient from "./client";

export const AuthService = {
  /**
   * Logs in a user (API 1.1.1).
   * IMPORTANT: Uses application/x-www-form-urlencoded.
   */
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    // The API expects 'username' field for the email (OAuth2 standard)
    formData.append("username", data.email);
    formData.append("password", data.password);

    try {
      const response = await apiClient.post<TokenResponse>("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    } catch (error) {
      // Specific error handling based on API 1.1 Integration Guide
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        if (status === 401) {
          // Throw a specific error code for the UI to catch
          throw new Error("INVALID_CREDENTIALS");
        }
        if (status === 403) {
          const detail = (error.response.data as { detail?: string })?.detail;
          if (detail?.includes("not verified")) {
            throw new Error("ACCOUNT_NOT_VERIFIED");
          }
          throw new Error("ACCOUNT_DISABLED");
        }
      }
      throw error; // Re-throw other errors
    }
  },

  /**
   * Registers a new user account (API 1.2.1).
   */
  register: async (data: RegisterRequest): Promise<UserRead> => {
    try {
      // Expect 201 Created
      const response = await apiClient.post<UserRead>("/auth/register", data, {
        validateStatus: (status) => status === 201,
      });
      return response.data;
    } catch (error) {
      // Handle 409 Conflict (User already exists) - API 1 Common Errors
      if (error instanceof AxiosError && error.response?.status === 409) {
        const errorCode = (error.response.data as { error_code?: string })?.error_code;
        if (errorCode === "USER_ALREADY_EXISTS") {
          throw new Error("USER_ALREADY_EXISTS");
        }
      }
      throw error;
    }
  },

  /**
   * Verifies the user's email address (API 1.3.2).
   */
  verifyEmail: async (token: string): Promise<UserRead> => {
    try {
      const response = await apiClient.post<UserRead>("/auth/verify-email", { token });
      return response.data;
    } catch (error) {
      // Handle 401 Unauthorized (Invalid or expired token)
      if (error instanceof AxiosError && error.response?.status === 401) {
        throw new Error("TOKEN_INVALID_OR_EXPIRED");
      }
      throw error;
    }
  },

  /**
   * Resends the verification email (API 1.3.3).
   */
  resendVerificationEmail: async (email: string): Promise<void> => {
    // Expect 202 Accepted. The API handles the "always return success" logic.
    await apiClient.post(
      "/auth/resend-verification-email",
      { email },
      {
        validateStatus: (status) => status === 202,
      },
    );
  },

  /**
   * Requests a password reset (stub implementation) (API 1.3.1).
   */
  requestPasswordReset: async (data: ResetPasswordRequest): Promise<void> => {
    // Expect 202 Accepted. The API handles the "always return success" logic.
    await apiClient.post("/auth/reset-password", data, {
      validateStatus: (status) => status === 202,
    });
  },
};
