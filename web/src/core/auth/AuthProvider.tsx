// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { clearToken, getToken, setToken } from "~/core/api/client";
import { AuthService } from "~/core/api/services/auth.service";
import { UserService } from "~/core/api/services/user.service";
import type { UserRead } from "~/core/domain";

/**
 * Defines the shape of the authentication context provided to the app.
 */
interface AuthContextType {
  user: UserRead | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication state and actions to its children.
 * Manages the user session lifecycle, including token validation and storage.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  /**
   * Logs the user out, clears their session token, and purges all cached data.
   */
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setError(null);
    queryClient.clear();
  }, [queryClient]);

  /**
   * Initializes the auth state on application load.
   * Checks for a stored token and validates it by fetching the user profile.
   */
  const initializeAuth = useCallback(async () => {
    const storedToken = getToken();
    if (storedToken) {
      try {
        const userData = await UserService.getMe();
        setUser(userData);
      } catch (error_) {
        console.error("Token validation failed, logging out.", error_);
        logout();
      }
    }
    setIsLoading(false);
  }, [logout]);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  /**
   * Clears the authentication error state.
   * Useful for UI components to call when the user starts a new action.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Logs in a user, stores the new token, and fetches the user profile.
   * Handles login errors internally and updates the `error` state.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      clearError();
      try {
        const { access_token } = await AuthService.login(email, password);
        setToken(access_token);
        const userData = await UserService.getMe();
        setUser(userData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred during login.");
        }
      }
    },
    [clearError],
  );

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
