import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl flex-col gap-12 py-16">
      <section className="space-y-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Cognitive Cockpit
        </p>
        <h1 className="text-4xl font-semibold md:text-5xl">
          Unified control surface for multi-agent workflows.
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Configure projects, monitor staleness, and collaborate on HITL tasks
          from a single cockpit experience.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/(auth)/login"
            className="rounded bg-primary px-6 py-3 font-medium text-primary-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/(auth)/register"
            className="rounded border border-border px-6 py-3 font-medium"
          >
            Request access
          </Link>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {["Workflow Graph", "Dashboard", "HITL Bridge"].map((item) => (
          <div
            key={item}
            className="rounded border border-border bg-card p-4 text-left"
          >
            <h3 className="text-lg font-semibold">{item}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Placeholder content describing how {item} fits in the cockpit.
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
