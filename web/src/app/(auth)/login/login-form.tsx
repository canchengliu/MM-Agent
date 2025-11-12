"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ApiError } from "~/core/api/ApiClient";
import { useAuthStore } from "~/core/store/AuthStore";

const loginSchema = z.object({
  email: z.string().min(1, "请输入邮箱地址").email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      router.replace("/projects");
      router.refresh();
    } catch (error) {
      setFormError(resolveLoginError(error));
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="border border-border/60 bg-card/90 shadow-lg backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">欢迎回来</CardTitle>
        <CardDescription>使用企业邮箱登录以继续管理项目与协作。</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input autoComplete="email" inputMode="email" placeholder="team@o-award.ai" type="email" {...field} />
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
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input autoComplete="current-password" placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formError ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            ) : null}
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  正在登录...
                </>
              ) : (
                "继续"
              )}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          还没有账号？{" "}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/register">
            立即注册
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function resolveLoginError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "电子邮件或密码不正确。";
    }

    if (error.status === 403) {
      const detail = extractErrorDetail(error.data);
      if (detail.toLowerCase().includes("not verified")) {
        return "您的账户尚未激活，请前往注册邮箱完成验证。如需重新发送验证邮件，请联系管理员。";
      }
      return "您的账户已被禁用，请联系管理员处理。";
    }
  }

  return "无法完成登录，请稍后重试。";
}

function extractErrorDetail(payload: unknown): string {
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
