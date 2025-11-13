import { toast } from "sonner";

import { UserService } from "~/core/api/user.service";
import type { UserRead } from "~/core/models/user.model";
import { type SliceCreator } from "~/core/store";

// Using localStorage as a common fallback if HttpOnly cookies are not used (API 1. Core Mechanism).
const TOKEN_STORAGE_KEY = "o-award-auth-token";

export interface AuthSlice {
  // State
  token: string | null;
  user: UserRead | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // True after the initial auth check is complete

  // Actions
  initializeAuth: () => Promise<void>;
  // Used by components after successful login/verification
  handleAuthenticationSuccess: (token: string, user: UserRead) => void;
  logout: (redirectToLogin?: boolean, message?: string) => void;
  updateUserProfile: (user: UserRead) => void;
}

export const createAuthSlice: SliceCreator<AuthSlice> = (set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  initializeAuth: async () => {
    // 1. Check for token in storage
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      set({ isInitialized: true, isAuthenticated: false, user: null });
      return;
    }

    // 2. Set the token tentatively so the API client interceptor can use it
    set({ token: storedToken });

    // 3. Validate the token by fetching the user profile
    try {
      const user = await UserService.getCurrentUser();
      set({ isAuthenticated: true, user, isInitialized: true });
    } catch (error) {
      console.error("Error during auth initialization (token validation failed):", error);
      // If validation fails (e.g., 401), the API interceptor might trigger logout.
      // We ensure the initialized flag is set regardless.
      // If the interceptor didn't clear the state, we do it here as a fallback.
      if (get().token === storedToken) {
        get().logout(false, "Session validation failed.");
      }
      set({ isInitialized: true });
    }
  },

  handleAuthenticationSuccess: (token, user) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    set({ token, user, isAuthenticated: true, isInitialized: true });
  },

  logout: (redirectToLogin = true, message) => {
    // Clear token and user state
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
    // Also clear settings state when logging out (as settings depend on auth)
    set({ settings: null });

    if (message) {
      toast.info(message);
    }

    // Redirect using window.location if needed, as router might not be accessible here (e.g., called from API interceptor)
    if (redirectToLogin && typeof window !== "undefined") {
      // Check if we are already on an auth page to avoid unnecessary redirects
      // We use startsWith('/auth') based on the routing structure.
      if (!window.location.pathname.startsWith("/auth")) {
        // Use window.location.href for a clean navigation upon logout
        window.location.href = "/auth/login";
      }
    }
  },

  updateUserProfile: (user) => {
    set({ user });
  },
});
