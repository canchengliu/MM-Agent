"use client";

import { CheckCircle, Loader2, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { AuthService } from "~/core/api/auth.service";
import { useStore } from "~/core/store";

type VerificationStatus = "loading" | "success" | "error" | "missing_token";

// This page handles the actual verification when the user clicks the link (API 1.3.2)
export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const updateUserProfile = useStore((state) => state.updateUserProfile);

  useEffect(() => {
    if (!token) {
      setStatus("missing_token");
      return;
    }

    const verify = async () => {
      try {
        // API 1.3.2: Verify the email using the token
        const updatedUser = await AuthService.verifyEmail(token);

        // Update profile if the user is currently logged in (edge case)
        const currentUser = useStore.getState().user;
        if (
          useStore.getState().isAuthenticated &&
          currentUser?.id === updatedUser.id
        ) {
          updateUserProfile(updatedUser);
        }

        // Success. Prompt user to log in.
        setStatus("success");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "UNKNOWN_ERROR";
        // API 1.3.2 Error handling
        if (errorMessage === "TOKEN_INVALID_OR_EXPIRED") {
          setStatus("error");
        } else {
          setStatus("error");
          console.error("Email verification failed:", error);
        }
      }
    };

    void verify();
  }, [token, updateUserProfile]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center gap-4 p-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Verifying your email address...
            </p>
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center gap-4 p-10 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h2 className="text-xl font-bold">Email Verified Successfully!</h2>
            <p>Your account is now active. You can now proceed to log in.</p>
            <Button asChild className="mt-4">
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center gap-4 p-10 text-center">
            <XCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold">Verification Failed</h2>
            <p>The verification link is invalid or has expired.</p>
            <p className="text-sm text-muted-foreground">
              Please request a new verification email from the login page if
              your account is not yet verified.
            </p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </div>
        );
      case "missing_token":
        return (
          <div className="flex flex-col items-center gap-4 p-10 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <h2 className="text-xl font-bold">Invalid Link</h2>
            <p>
              The verification token is missing from the URL. Please check the
              link in your email.
            </p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
