import { Workflow } from "lucide-react";
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
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Workflow className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">O-Award Platform</h1>
        </div>
        <CardTitle className="text-center text-xl">
          Create an Account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your details to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
