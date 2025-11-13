import { Workflow } from "lucide-react";
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
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Workflow className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">O-Award Platform</h1>
        </div>
        <CardTitle className="text-center text-xl">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-4 space-y-2 text-center text-sm">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <p>
            <Link href="/auth/reset-password" className="text-sm text-muted-foreground hover:underline">
              Forgot password?
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
