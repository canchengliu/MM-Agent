"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { UserService } from "~/core/api/user.service";
import { PasswordChangeRequestSchema } from "~/core/models/user.model";
import type { PasswordChangeRequest } from "~/core/models/user.model";

// Extend the schema for the form to include password confirmation validation
const ChangePasswordFormSchema = PasswordChangeRequestSchema.extend({
  confirmNewPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.new_password === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

type ChangePasswordFormValues = z.infer<typeof ChangePasswordFormSchema>;

// Implements U1.6 (Password Modification)
export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    setIsLoading(true);

    // Prepare the request payload (exclude confirmNewPassword)
    const requestPayload: PasswordChangeRequest = {
      current_password: values.current_password,
      new_password: values.new_password,
    };

    try {
      // API 2.1.2: Change Password
      await UserService.changePassword(requestPayload);

      // API 2.1.2 Integration Guide: Success handling
      toast.success("Password updated successfully.");
      form.reset(); // Clear the form
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "UNKNOWN_ERROR";

      // API 2.1.2 Integration Guide: Error handling (403)
      if (errorMessage === "INCORRECT_CURRENT_PASSWORD") {
        form.setError("current_password", {
          type: "manual",
          message: "Incorrect current password.",
        });
        toast.error("Update Failed");
      } else {
        toast.error("Failed to change password", {
          description: "An unexpected error occurred.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Change Password</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="current_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} autoComplete="current-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} autoComplete="new-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} autoComplete="new-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Button is disabled if loading or if the form hasn't been touched */}
          <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </Form>
    </div>
  );
}
