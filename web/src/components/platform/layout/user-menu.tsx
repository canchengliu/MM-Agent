"use client";

import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useStore } from "~/core/store";

export function UserMenu() {
  // Get user data and logout function from the Zustand store
  const { user, logout } = useStore(
    useShallow((state) => ({
      user: state.user,
      logout: state.logout,
    })),
  );

  // Fallback if user data is somehow missing (should be prevented by PlatformLayout guard)
  if (!user) return null;

  // Determine display name, fallback to email prefix if name is null
  const displayName = user.display_name || user.email.split("@")[0] || "User";
  const email = user.email;
  const avatarUrl = null; // Avatars are not supported in the current API

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    // Trigger logout action with redirection enabled
    logout(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
