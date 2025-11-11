"use client";

import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import {
  ApiError,
  clearToken,
  getToken,
  setToken as storeToken,
} from "~/core/api/client";
import { AuthService } from "~/core/api/services/auth.service";
import { UserService } from "~/core/api/services/user.service";
import type { UserRead, UserRegister } from "~/core/domain/user.types";
import { queryClient } from "~/lib/queryClient";

interface AuthContextType {
  user: UserRead | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (credentials: UserRegister) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    queryClient.clear();
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const abortController = new AbortController();

    const initializeAuth = async () => {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const userData = await UserService.getMe(abortController.signal);
          setUser(userData);
        } catch (error) {
          if ((error as Error).name !== "AbortError") {
            console.error("Token validation failed, logging out.", error);
            logout();
          }
        }
      }

      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    };

    void initializeAuth();

    return () => {
      abortController.abort();
    };
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoggingIn(true);
      try {
        const { access_token } = await AuthService.login(email, password);
        storeToken(access_token);
        const userData = await UserService.getMe();
        setUser(userData);
        router.push("/dashboard");
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 403) {
            toast.error(
              "Login failed: Your account is not verified. Please check your email.",
            );
          } else {
            toast.error("Login failed: Invalid email or password.");
          }
        } else {
          toast.error("An unknown error occurred during login.");
        }
        throw error;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [router],
  );

  const register = useCallback(
    async (credentials: UserRegister) => {
      setIsRegistering(true);
      try {
        await AuthService.register(credentials);
        toast.success(
          "Registration successful! Please check your email to activate your account, then sign in.",
        );
        router.push("/login");
      } catch (error) {
        if (error instanceof ApiError && error.code === "USER_ALREADY_EXISTS") {
          toast.error("Registration failed: This email is already registered.");
        } else if (error instanceof ApiError) {
          toast.error(`Registration failed: ${error.message}`);
        } else {
          toast.error("An unknown error occurred during registration.");
        }
        throw error;
      } finally {
        setIsRegistering(false);
      }
    },
    [router],
  );

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isLoggingIn,
      isRegistering,
      login,
      register,
      logout,
    }),
    [user, isLoading, isLoggingIn, isRegistering, login, register, logout],
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        Initializing Session...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
