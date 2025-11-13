"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { settingsNavItems } from "./settings-config";

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    // Horizontal scrolling nav for mobile, vertical nav for desktop (lg:)
    <nav className="flex space-x-2 overflow-x-auto px-4 lg:flex-col lg:space-x-0 lg:space-y-1 lg:px-0">
      {settingsNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            // Active state styling
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start whitespace-nowrap",
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
