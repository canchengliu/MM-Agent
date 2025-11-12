import type { Metadata } from "next";

import { VerifyEmailView } from "./verify-email-view";

export const metadata: Metadata = {
  title: "Verify Email | O-Award Platform",
};

export default function VerifyEmailPage() {
  return <VerifyEmailView />;
}
