"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { AuthService } from "~/core/api/auth.service";
import { UserService } from "~/core/api/user.service";
import { LoginRequest, LoginRequestSchema } from "~/core/models/auth.model";
import { useStore } from "~/core/store";

export function LoginForm() {
  const router = useRouter();
  const handleAuthenticationSuccess = useStore((state) => state.handleAuthenticationSuccess);
  const [isLoading, setIsLoading] = useState(false);
  // State to track specific error scenarios required by API 1.1 Integration Guide
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginRequest) {
    setIsLoading(true);
    setUnverifiedEmail(null); // Clear previous errors
    try {
      // 1. Login (Get Token)
      const tokenResponse = await AuthService.login(values);

      // 2. Temporarily update the store token so the interceptor picks it up for the next call.
      // This is crucial for fetching the profile immediately after getting the token.
      useStore.setState({ token: tokenResponse.access_token });

      // 3. Fetch User Profile (API 2.1.1)
      const userProfile = await UserService.getCurrentUser();

      // 4. Finalize authentication in the store (persists token, sets user, updates isAuthenticated)
      handleAuthenticationSuccess(tokenResponse.access_token, userProfile);

      toast.success("Login successful!");
      // Redirect to the main application dashboard
      router.push("/projects");
    } catch (error) {
      // Ensure token is cleared if login flow fails at any step
      useStore.setState({ token: null });

      const errorMessage = error instanceof Error ? error.message : "UNKNOWN_ERROR";
      handleLoginError(errorMessage, values.email);
    } finally {
      setIsLoading(false);
    }
  }

  function handleLoginError(errorCode: string, email: string) {
    switch (errorCode) {
      case "INVALID_CREDENTIALS":
        // API 1.1 Guide: Show generic error in the form
        form.setError("password", { type: "manual", message: "Incorrect email or password." });
        break;
      case "ACCOUNT_NOT_VERIFIED":
        // API 1.1 Guide: Show specific message and offer to resend verification
        setUnverifiedEmail(email);
        toast.warning("Account Not Verified");
        break;
      case "ACCOUNT_DISABLED":
        toast.error("Login Failed", { description: "Your account has been disabled." });
        break;
      default:
        toast.error("Login Failed", { description: "An unexpected error occurred. Please try again." });
        break;
    }
  }

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    try {
      await AuthService.resendVerificationEmail(unverifiedEmail);
      // API 3.3 dictates we show success regardless of actual user existence
      toast.success("If the account exists, a verification email has been sent.", {
        description: `Please check ${unverifiedEmail} for the activation link.`,
      });
      setUnverifiedEmail(null); // Hide the alert
    } catch (error) {
      toast.error("Failed to send verification email.");
    }
  };

  return (
    <div className="grid gap-6">
      {/* Alert for Unverified Accounts */}
      {unverifiedEmail && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Account Not Activated</AlertTitle>
          <AlertDescription>
            Please check your email ({unverifiedEmail}) to verify your account.
            <Button
              variant="link"
              size="sm"
              className="ml-1 h-auto p-0 font-semibold"
              onClick={handleResendVerification}
              type="button"
            >
              Resend verification email?
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="user@example.com" {...field} type="email" autoComplete="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} autoComplete="current-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>
    </div>
  );
}
