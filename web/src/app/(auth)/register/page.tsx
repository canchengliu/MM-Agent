"use client";

import Link from "next/link";

import { RegisterForm } from "~/features/authentication/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center gap-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Request workspace access</h1>
        <p className="text-sm text-muted-foreground">
          Provide your details and we will provision a cockpit instance.
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have access?{" "}
        <Link href="/login" className="text-primary underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
