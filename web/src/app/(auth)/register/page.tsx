// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import Link from "next/link";

import { RegisterForm } from "~/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="mb-4 text-3xl font-bold">🦌 DeerFlow</div>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Get started with DeerFlow. Enter your details to create a new account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline hover:text-primary/90">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
