import Link from "next/link";

import { env } from "~/env";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const platformName = env.NEXT_PUBLIC_PLATFORM_NAME ?? "O-Award Platform";
  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1fr,0.85fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-background text-primary-foreground lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_20%_20%,rgba(255,255,255,0.25),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_320px_at_80%_30%,rgba(255,255,255,0.2),transparent)]" />
        </div>
        <div className="relative flex flex-1 flex-col justify-between p-10">
          <div className="flex items-center justify-between text-sm text-primary-foreground/80">
            <span className="font-semibold tracking-tight">{platformName}</span>
            <Link className="transition hover:text-primary-foreground" href="/projects">
              Back to app
            </Link>
          </div>
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-primary-foreground/60">O-Award</p>
            <h1 className="text-3xl font-semibold leading-tight text-primary-foreground">
              Human-in-the-loop orchestration for your next moonshot.
            </h1>
            <p className="text-primary-foreground/80">
              Provision seats, manage execution plans, and keep every project audit-ready with a single
              secure workspace.
            </p>
          </div>
        </div>
      </aside>
      <main className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
