"use client";

import { LogOut, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAuthStore } from "~/core/store/AuthStore";
import { cn } from "~/lib/utils";

import { ConnectionStatusIndicator } from "./connection-status-indicator";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/projects", labelKey: "links.projects" },
  { href: "/settings", labelKey: "links.settings" },
];

interface GlobalNavbarProps {
  platformName: string;
}

export function GlobalNavbar({ platformName }: GlobalNavbarProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const t = useTranslations("dashboard.navbar");
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));

  const displayName = user?.display_name || user?.email || t("profile.unnamed");
  const email = user?.email || t("profile.unboundEmail");
  const avatarLabel = createAvatarLabel(displayName);

  const handleLogout = () => {
    logout();
    router.replace("/login");
    router.refresh();
  };

  const navLinks = NAV_LINKS.map((link) => ({
    ...link,
    label: t(link.labelKey),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <Link className="text-base font-semibold tracking-tight text-foreground" href="/projects">
            {platformName}
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-border/60 bg-background/80 px-1 py-0.5 text-sm text-muted-foreground md:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  className={cn(
                    "rounded-full px-3 py-1 font-medium transition hover:text-foreground",
                    isActive && "bg-foreground/10 text-foreground",
                  )}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="md:hidden" size="icon" variant="ghost">
                <Menu className="size-5" />
                <span className="sr-only">{t("actions.openNavigation")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} onSelect={() => router.push(link.href)}>
                  {link.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ConnectionStatusIndicator />
          <ThemeToggle />
          <div className="hidden min-w-[140px] flex-col text-right leading-tight md:flex">
            <span className="text-sm font-semibold text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label={t("actions.openProfile")}
                className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-gradient-to-br from-primary/10 to-primary/5 text-sm font-semibold text-primary shadow-inner outline-hidden transition hover:scale-105"
                type="button"
              >
                {avatarLabel}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span>{displayName}</span>
                <span className="text-xs font-normal text-muted-foreground">{email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push("/settings")}>
                <Settings className="size-4" />
                {t("actions.userSettings")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout} variant="destructive">
                <LogOut className="size-4" />
                {t("actions.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function createAvatarLabel(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return "U";
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}
