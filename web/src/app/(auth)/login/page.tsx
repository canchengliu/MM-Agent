import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login | O-Award Platform",
};

export default function LoginPage() {
  return <LoginForm />;
}
