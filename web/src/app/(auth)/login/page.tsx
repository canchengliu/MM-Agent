// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import Link from "next/link";

import { LoginForm } from "~/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="mb-4 text-3xl font-bold">🦌 DeerFlow</div>
        <CardTitle className="text-2xl">Log In</CardTitle>
        <CardDescription>
          Welcome back. Enter your credentials to access your projects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary underline hover:text-primary/90">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
