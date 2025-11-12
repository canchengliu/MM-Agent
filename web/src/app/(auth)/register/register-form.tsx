"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ApiError } from "~/core/api/ApiClient";
import { useAuthStore } from "~/core/store/AuthStore";

const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(60, "显示名称不能超过 60 个字符")
    .refine((value) => value.length === 0 || value.length >= 2, {
      message: "显示名称至少需要 2 个字符",
    })
    .optional(),
  email: z.string().min(1, "请输入邮箱地址").email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少 8 个字符"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const registerUser = useAuthStore((state) => state.register);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const handleSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    setSuccessEmail(null);
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        display_name: values.displayName?.trim() ? values.displayName.trim() : undefined,
      });
      setSuccessEmail(values.email);
      form.reset({
        displayName: values.displayName ?? "",
        email: values.email,
        password: "",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 422) {
          applyValidationErrors(error, form);
          return;
        }
        if (error.status === 409) {
          setFormError(extractConflictMessage(error.data));
          return;
        }
      }
      setFormError("注册失败，请稍后重试。");
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="border border-border/60 bg-card/90 shadow-lg backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">创建工作区账号</CardTitle>
        <CardDescription>注册后我们会向您的邮箱发送一封验证邮件以激活账户。</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>显示名称</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" placeholder="Ada Lovelace" {...field} />
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
                    <Input autoComplete="new-password" placeholder="至少 8 位字符" type="password" {...field} />
                  </FormControl>
                  <FormDescription>建议使用至少 1 个数字与特殊字符提升安全性。</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {successEmail ? (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
                <CheckCircle2 className="mt-0.5 size-4 flex-none" />
                <span>
                  注册成功！验证邮件已发送至 <strong>{successEmail}</strong>，请前往邮箱完成激活后再登录。若未收到，请检查垃圾邮件或稍后重试。
                </span>
              </div>
            ) : formError ? (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 flex-none" />
                <span>{formError}</span>
              </div>
            ) : null}
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  正在创建...
                </>
              ) : (
                "创建账号"
              )}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          已有账号？{" "}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/login">
            返回登录
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function applyValidationErrors(error: ApiError, form: UseFormReturn<RegisterFormValues>) {
  const details = Array.isArray((error.data as { detail?: unknown })?.detail)
    ? ((error.data as { detail?: Array<{ loc?: Array<string | number>; msg?: string }> }).detail ?? [])
    : [];

  details.forEach((detail) => {
    if (!detail?.loc?.length) return;
    const fieldKey = detail.loc[detail.loc.length - 1];
    if (!fieldKey) return;
    let formField: keyof RegisterFormValues | null = null;
    if (fieldKey === "email") {
      formField = "email";
    } else if (fieldKey === "password") {
      formField = "password";
    } else if (fieldKey === "display_name") {
      formField = "displayName";
    }

    if (formField) {
      form.setError(formField, {
        message: detail.msg ?? "字段填写不正确",
      });
    }
  });
}

function extractConflictMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "message" in (payload as Record<string, unknown>)) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return "该邮箱已存在，请直接登录或尝试找回密码。";
}
