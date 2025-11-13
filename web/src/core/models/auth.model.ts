import { z } from "zod";

// --- Request Schemas ---

// API 1.1: Login (used for form validation)
// The actual request must be application/x-www-form-urlencoded with 'username' and 'password' fields.
export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// API 1.2: Register
export const RegisterRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  // API Spec 1.2.1 requirement: minimum 8 characters
  password: z.string().min(8, "Password must be at least 8 characters long"),
  display_name: z.string().optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// API 3.1: Request Password Reset (future development expectation)
export const ResetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// --- Response Schemas ---

// API 4.1: Token Response
export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
});
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
