// Authentication and user-facing account DTOs.

import type { UUID } from './common';

export interface UserRead {
  id: UUID;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface LogoutResponse {
  status: string;
  message: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}
