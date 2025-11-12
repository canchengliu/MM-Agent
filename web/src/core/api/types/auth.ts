import type { Nullable } from "./common";

export interface TokenResponse {
  access_token: string;
  token_type: "bearer" | string;
}

export type Token = TokenResponse;
export type AuthSession = TokenResponse;

export interface LoginCredentials {
  username: string;
  password: string;
}

export type LoginRequest = LoginCredentials;

export interface RegisterPayload {
  email: string;
  password: string;
  display_name?: Nullable<string>;
}

export type RegisterRequest = RegisterPayload;

export interface VerifyEmailPayload {
  token: string;
}

export type VerifyEmailRequest = VerifyEmailPayload;

export interface ResendVerificationEmailPayload {
  email: string;
}

export type ResendVerificationEmailRequest = ResendVerificationEmailPayload;

export interface MessageResponse {
  message: string;
}
