"use client";

import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useStore } from "~/core/store";

/**
 * Read-only display of user information (S1.1).
 * API 2 does not currently support updating profile details (e.g., display_name).
 */
export function AccountSettingsForm() {
  const user = useStore((state) => state.user);

  // The Wrapper ensures user is not null, but we handle it defensively.
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Account Information</h3>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={user.display_name ?? ""}
            placeholder="Not set"
            readOnly
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Updating display name is not currently supported.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="flex items-center gap-3">
            <Input
              id="email"
              type="email"
              value={user.email}
              readOnly
              disabled
            />
            {/* Display verification status */}
            {user.is_verified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="warning">Unverified</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
