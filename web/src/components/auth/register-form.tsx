"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  RegisterRequest,
  RegisterRequestSchema,
} from "~/core/models/auth.model";

// Extend the schema to include password confirmation for the UI form validation
const RegisterFormSchema = RegisterRequestSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Set error on confirmPassword field
});

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      display_name: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);

    // Prepare the request payload (exclude confirmPassword)
    const payload: RegisterRequest = {
      email: values.email,
      password: values.password,
      // Send undefined if display_name is an empty string so the backend handles defaults correctly
      display_name: values.display_name || undefined,
    };

    try {
      await AuthService.register(payload);

      // API 1.2.1 Integration Guide: Redirect to a dedicated "please verify your email" page.
      toast.success("Registration successful!");

      // Redirect to the instructions page, passing the email for better UX.
      router.push(
        `/auth/verify-email-instructions?email=${encodeURIComponent(values.email)}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "UNKNOWN_ERROR";
      handleRegisterError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRegisterError(errorCode: string) {
    switch (errorCode) {
      case "USER_ALREADY_EXISTS":
        // API 1 (Common Errors): Handle 409 Conflict
        form.setError("email", {
          type: "manual",
          message: "This email address is already registered.",
        });
        toast.error("Registration Failed");
        break;
      default:
        toast.error("Registration Failed", {
          description: "An unexpected error occurred. Please try again.",
        });
        break;
    }
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
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane Doe"
                    {...field}
                    autoComplete="name"
                  />
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
                  <Input
                    type="password"
                    {...field}
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </Form>
    </div>
  );
}
