"use client";

import { Loader2, MailCheck, MailQuestion, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ApiError } from "~/core/api/ApiClient";
import { useAuthStore } from "~/core/store/AuthStore";

type Status = "idle" | "loading" | "success" | "error";

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState<string>(
    token ? "正在验证您的邮箱..." : "验证链接缺少必要的 token，无法继续。",
  );

  const runVerification = useCallback(async () => {
    if (!token) {
      setStatus("error");
      setMessage("验证链接缺少必要的 token，无法继续。");
      return;
    }

    setStatus("loading");
    setMessage("正在验证您的邮箱...");
    try {
      const user = await verifyEmail(token);
      setStatus("success");
      setMessage(`邮箱 ${user.email} 已完成验证，现在可以返回登录页面。`);
    } catch (error) {
      setStatus("error");
      setMessage(resolveVerifyError(error));
    }
  }, [token, verifyEmail]);

  useEffect(() => {
    void runVerification();
  }, [runVerification]);

  const leadingIcon = useMemo(() => {
    if (status === "success") {
      return <MailCheck className="size-6 text-emerald-400" />;
    }
    if (status === "error") {
      return <MailQuestion className="size-6 text-destructive" />;
    }
    return <ShieldCheck className="size-6 text-primary" />;
  }, [status]);

  const isLoading = status === "loading";

  return (
    <Card className="border border-border/60 bg-card/90 shadow-lg backdrop-blur">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          {isLoading ? <Loader2 className="size-6 animate-spin text-primary" /> : leadingIcon}
        </div>
        <CardTitle>邮箱验证</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
        {!token ? (
          <p>请确认您使用的是最新的验证链接，或在登录页选择重新发送验证邮件。</p>
        ) : status === "success" ? (
          <p>已完成邮箱验证，您现在可以使用新账号登录系统。</p>
        ) : status === "error" ? (
          <p>验证失败，请确认链接未过期或稍后重试。</p>
        ) : (
          <p>我们正在为您激活账户，这只需要几秒钟。</p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {status === "error" ? (
            <Button disabled={isLoading} onClick={runVerification} variant="outline">
              重新验证
            </Button>
          ) : null}
          <Button disabled={isLoading} onClick={() => router.replace("/login")}>
            返回登录
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function resolveVerifyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "验证链接已失效或 token 无效，请重新发送验证邮件。";
    }
    if (error.status >= 500) {
      return "服务暂时不可用，请稍后再试。";
    }
    const detail = extractDetail(error.data);
    if (detail) {
      return detail;
    }
  }
  return "无法完成邮箱验证，请稍后重试或联系管理员。";
}

function extractDetail(payload: unknown): string {
  if (!payload) {
    return "";
  }
  if (typeof payload === "string") {
    return payload;
  }
  if (typeof payload === "object" && "detail" in (payload as Record<string, unknown>)) {
    const detail = (payload as { detail?: unknown }).detail;
    return typeof detail === "string" ? detail : "";
  }
  return "";
}
