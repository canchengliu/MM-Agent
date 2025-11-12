import type { Metadata } from "next";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Register | O-Award Platform",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
