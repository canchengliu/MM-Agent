"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AuthService } from "~/core/api/auth.service";

// Dedicated page shown after successful registration (API 1.2.1 Integration Guide)
export default function VerifyEmailInstructionsPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleResend = async () => {
    if (!email) return;
    try {
      // API 1.3.3: Resend verification email
      await AuthService.resendVerificationEmail(email);
      // Always show success to prevent user enumeration
      toast.success("Verification email resent.", {
        description: `Please check ${email} for the activation link.`,
      });
    } catch {
      // Handle potential network errors
      toast.error(
        "Failed to resend verification email. Please check your connection.",
      );
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-4 text-center">
        <MailCheck className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-2xl">Verify Your Email Address</CardTitle>
        <CardDescription>
          Registration successful! A verification email has been sent to
          {email ? (
            <strong className="mt-1 block text-foreground">{email}</strong>
          ) : (
            " your registered email address."
          )}
          <br />
          <br />
          Please click the link in the email to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          If you didn&apos;t receive the email, please check your spam folder.
        </p>

        {email && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            className="mb-4"
          >
            Resend Verification Email
          </Button>
        )}

        <div className="mt-4">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
