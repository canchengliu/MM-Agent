import { z } from "zod";

// API 4.2 (Auth) / 3.1 (User Management): UserRead
export const UserReadSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  is_active: z.boolean(),
  is_verified: z.boolean(),
});
export type UserRead = z.infer<typeof UserReadSchema>;

// API 1.2 (User Management): PasswordChange
export const PasswordChangeRequestSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  // API Spec 2.1.2 requirement: minimum 8 characters
  new_password: z.string().min(8, "New password must be at least 8 characters long"),
});
export type PasswordChangeRequest = z.infer<typeof PasswordChangeRequestSchema>;
