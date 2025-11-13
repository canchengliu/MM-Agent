"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { ConnectionStatusBanner } from "~/components/platform/layout/connection-status-banner";
import { GlobalHeader } from "~/components/platform/layout/global-header";
import { useStore } from "~/core/store";

/**
 * Platform Layout with Authentication Route Guard.
 * Protects all routes within the (platform) group.
 */
export default function PlatformLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isInitialized: state.isInitialized,
    })),
  );

  useEffect(() => {
    // Wait until initialization (handled by AuthInitializer) is complete.
    if (!isInitialized) return;

    // If initialization is complete and the user is NOT authenticated, redirect to login.
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login.");
      // Use replace to prevent the user from navigating back to the protected route
      // Redirect to the new /auth/login path
      router.replace("/auth/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Show loading state if initializing or if we are unauthenticated (while redirecting)
  if (!isInitialized || !isAuthenticated) {
    // We show a loader here because AuthInitializer also shows a loader during the initial load.
    // This ensures a consistent loading experience until the auth state is confirmed and redirection (if any) occurs.
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render the platform layout if authenticated
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <GlobalHeader />
      <ConnectionStatusBanner />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
