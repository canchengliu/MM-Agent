"use client";

import Link from "next/link";

import { LoginForm } from "~/features/authentication/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center gap-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your cockpit workspaces.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/register" className="text-primary underline">
          Request access
        </Link>
      </p>
    </div>
  );
}
