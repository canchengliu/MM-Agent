// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useChangePassword, useCurrentUser } from "~/core/api/hooks/useUser";

const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, {
      message: "Current password is required.",
    }),
    new_password: z.string().min(8, {
      message: "New password must be at least 8 characters long.",
    }),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

export function AccountForm() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutateAsync: changePassword, isPending } = useChangePassword();

  const form = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: PasswordChangeValues) => {
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      form.reset();
    } catch (error) {
      console.error("Password change failed", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Loading user information...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">User Information</h3>
        <p className="text-sm text-muted-foreground">
          Your registered account details.
        </p>
        <div className="mt-4 space-y-4">
          <div className="grid max-w-md gap-2">
            <Label>Email Address</Label>
            <Input value={user?.email ?? ""} readOnly disabled />
          </div>
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <h3 className="text-lg font-medium">Change Password</h3>
            <p className="text-sm text-muted-foreground">
              Update your account password.
            </p>
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </Form>
    </div>
  );
}
