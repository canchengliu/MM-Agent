import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AuthService } from "../api/services/AuthService";
import { UserService } from "../api/services/UserService";
import type { RegisterRequest, UserRead } from "../api/types";

import { useSettingsStore } from "./SettingsStore";

interface AuthState {
  token: string | null;
  user: UserRead | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: RegisterRequest) => Promise<UserRead>;
  verifyEmail: (token: string) => Promise<UserRead>;
  logout: () => void;
  initialize: () => Promise<void>;
}

const baseState: Omit<AuthState, "login" | "register" | "logout" | "initialize"> = {
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
};

const createSessionStorage = () =>
  typeof window === "undefined"
    ? ({
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
        clear: () => undefined,
        key: () => null,
        get length() {
          return 0;
        },
      } satisfies Storage)
    : window.sessionStorage;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...baseState,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const tokenData = await AuthService.login({ username: email, password });
          set({
            token: tokenData.access_token,
            isAuthenticated: true,
          });

          const settingsPromise = useSettingsStore.getState().fetchSettings();
          const user = await UserService.getProfile();
          await settingsPromise;

          set({
            user,
            isInitialized: true,
          });
          return true;
        } catch (error) {
          get().logout();
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (payload) => {
        return AuthService.register(payload);
      },

      verifyEmail: async (token) => {
        return AuthService.verifyEmail({ token });
      },

      logout: () => {
        useSettingsStore.getState().reset();
        set({
          ...baseState,
          isInitialized: true,
        });
      },

      initialize: async () => {
        if (get().isInitialized) {
          return;
        }

        const token = get().token;
        if (!token) {
          useSettingsStore.getState().reset();
          set({
            ...baseState,
            isInitialized: true,
          });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await UserService.getProfile();
          set({
            user,
            isAuthenticated: true,
            isInitialized: true,
          });
          await useSettingsStore.getState().fetchSettings();
        } catch {
          get().logout();
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },
    }),
    {
      name: "o-award-auth",
      storage: createJSONStorage(createSessionStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
