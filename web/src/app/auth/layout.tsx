"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useStore } from "~/core/store";

/**
 * Auth Layout with Route Guard.
 * Prevents authenticated users from accessing auth pages (login, register, etc.).
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isInitialized: state.isInitialized,
    })),
  );

  useEffect(() => {
    // Wait until initialization is complete.
    if (!isInitialized) return;

    // If the user is authenticated, redirect them away from auth pages to the main app.
    if (isAuthenticated) {
      console.log("User already authenticated, redirecting to projects.");
      router.replace("/projects");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Show loading state if initializing or if we are authenticated (while redirecting)
  if (!isInitialized || isAuthenticated) {
    // Minimal loader during redirection.
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render the auth layout if not authenticated
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
