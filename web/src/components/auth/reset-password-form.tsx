"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
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
import {
  ResetPasswordRequest,
  ResetPasswordRequestSchema,
} from "~/core/models/auth.model";

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ResetPasswordRequest>({
    resolver: zodResolver(ResetPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ResetPasswordRequest) {
    setIsLoading(true);
    try {
      // API 1.3.1: Request password reset (Stub implementation)
      // We follow the future expectation that the email will be sent.
      await AuthService.requestPasswordReset(values);

      // API 1.3.1: Always show success message to prevent user enumeration attacks.
      toast.success("Request Received");
      setIsSubmitted(true);
    } catch (error) {
      // Handle network errors
      toast.error(
        "An error occurred. Please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/50 p-6 text-center">
        <h3 className="mb-2 text-lg font-semibold">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          {/* API 1.3.1 Required Message behavior */}
          If an account with the email{" "}
          <strong>{form.getValues("email")}</strong> exists, a password reset
          link has been sent.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="user@example.com"
                    {...field}
                    type="email"
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
        </form>
      </Form>
    </div>
  );
}
