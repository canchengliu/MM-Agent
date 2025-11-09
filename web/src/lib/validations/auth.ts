// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { z } from "zod";

// Based on API 2.1 User Registration constraints
export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Based on API 2.2 User Login requirements
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginInput = z.infer<typeof loginSchema>;
