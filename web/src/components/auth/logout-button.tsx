// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

"use client";

import type { ComponentProps, ReactNode } from "react";

import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useLogout } from "~/core/api/hooks/useAuth";
import { Button } from "~/components/ui/button";

interface LogoutButtonProps extends ComponentProps<typeof Button> {
  children?: ReactNode;
}

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
  const router = useRouter();
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully.");
      },
      onError: (error) => {
        console.error("Logout API call failed:", error);
      },
      onSettled: () => {
        router.push("/login");
      },
    });
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isPending} {...props}>
      {isPending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Logging out...
        </>
      ) : (
        children ?? "Logout"
      )}
    </Button>
  );
}
