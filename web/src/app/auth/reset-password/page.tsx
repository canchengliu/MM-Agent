import { Info, KeyRound } from "lucide-react";
import Link from "next/link";

import { ResetPasswordForm } from "~/components/auth/reset-password-form";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <KeyRound className="mx-auto mb-4 h-10 w-10 text-primary" />
        <CardTitle className="text-xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address to receive a password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Informational alert regarding the stub implementation (API 1.3.1) */}
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Note: The functionality to actually send the email and complete the
            reset process will be implemented in a future iteration.
          </AlertDescription>
        </Alert>
        <ResetPasswordForm />
        <div className="mt-4 text-center text-sm">
          <Link href="/auth/login" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
