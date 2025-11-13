"use client";

import { Loader2 } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useStore } from "~/core/store";

/**
 * Responsible for initializing the application state on first load (Architecture 4.3.1).
 * 1. Initializes Authentication (checks for stored token and validates it).
 * 2. Fetches initial settings if authenticated.
 */
export function AuthInitializer({ children }: { children: ReactNode }) {
  const { initializeAuth, isInitialized, isAuthenticated, fetchSettings } = useStore(
    useShallow((state) => ({
      initializeAuth: state.initializeAuth,
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      fetchSettings: state.fetchSettings,
    })),
  );

  // Use a ref to ensure initialization logic runs exactly once on mount.
  const initializationStarted = useRef(false);

  // 1. Start Auth Initialization
  useEffect(() => {
    if (!initializationStarted.current) {
      initializationStarted.current = true;
      console.log("Starting Auth Initialization...");
      initializeAuth();
    }
  }, [initializeAuth]);

  // 2. Fetch Settings once Auth is initialized and user is confirmed authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      console.log("Auth Initialized and Authenticated. Fetching Settings...");
      // We don't await this, it runs in the background
      fetchSettings();
    }
  }, [isInitialized, isAuthenticated, fetchSettings]);

  // Show a global loading spinner while the initial authentication check is running.
  // Route guards in layouts rely on isInitialized being true.
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
