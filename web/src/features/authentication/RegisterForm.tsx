"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { useAuth } from "~/core/auth/hooks";
import type { UserRegister } from "~/core/domain/user.types";

const formSchema = z.object({
  display_name: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export function RegisterForm() {
  const { register: signUp, isRegistering } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      display_name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const credentials: UserRegister = {
        email: values.email,
        password: values.password,
      };
      if (values.display_name) {
        credentials.display_name = values.display_name;
      }
      await signUp(credentials);
    } catch (error) {
      // Errors are already surfaced through toasts in AuthProvider.
      console.error("Registration attempt failed:", error);
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Ann" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
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
                <Input type="password" placeholder="8+ characters" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={isRegistering}
        >
          {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Request access
        </Button>
      </form>
    </Form>
  );
}
