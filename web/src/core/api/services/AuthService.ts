import { apiClient } from "../ApiClient";
import type {
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResendVerificationEmailRequest,
  TokenResponse,
  UserRead,
  VerifyEmailRequest,
} from "../types";

function toLoginFormData(credentials: LoginRequest) {
  const payload = new URLSearchParams();
  payload.set("username", credentials.username);
  payload.set("password", credentials.password);
  return payload;
}

export const AuthService = {
  login(credentials: LoginRequest) {
    return apiClient.post<TokenResponse>("/auth/login", toLoginFormData(credentials));
  },
  register(payload: RegisterRequest) {
    return apiClient.post<UserRead>("/auth/register", payload);
  },
  verifyEmail(payload: VerifyEmailRequest) {
    return apiClient.post<UserRead>("/auth/verify-email", payload);
  },
  requestPasswordReset() {
    return apiClient.post<MessageResponse>("/auth/reset-password");
  },
  resendVerificationEmail(payload: ResendVerificationEmailRequest) {
    return apiClient.post<MessageResponse>("/auth/resend-verification-email", payload);
  },
};
