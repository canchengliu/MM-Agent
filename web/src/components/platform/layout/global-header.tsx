"use client";

import Link from "next/link";
import { PlusCircle, Workflow } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { ThemeToggle } from "~/components/platform/theme-toggle";
import { UserMenu } from "./user-menu";

export function GlobalHeader() {
  const pathname = usePathname();

  const navItems = [
    { name: "Projects", href: "/projects" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <div className="flex items-center gap-6">
        <Link href="/projects" className="flex items-center gap-2 text-lg font-semibold" aria-label="O-Award Home">
          <Workflow className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">O-Award</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button size="sm" asChild className="hidden sm:flex">
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>

        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
