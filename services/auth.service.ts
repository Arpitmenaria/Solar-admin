import { apiClient } from "@/services/api/client";
import type { AdminUser } from "@/store/auth.store";

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: AdminUser;
}

export const authService = {
  adminLogin(input: AdminLoginInput): Promise<AdminLoginResponse> {
    return apiClient.post<AdminLoginResponse>("/api/auth/admin/login", input);
  },
};
