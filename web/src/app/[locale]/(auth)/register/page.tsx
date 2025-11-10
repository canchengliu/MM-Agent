// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import { useRouter } from "~/navigation";
import { useEffect } from "react";

import { Skeleton } from "~/components/ui/skeleton";
import { useAuth } from "~/core/auth/hooks";
import { RegisterForm } from "~/features/authentication/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="w-full max-w-md">
        <Skeleton className="h-[550px] w-full" />
      </div>
    );
  }

  return <RegisterForm />;
}
