"use client";

import { useMutation } from "@tanstack/react-query";
import { authService, type AdminLoginInput, type AdminLoginResponse } from "@/services/auth.service";
import type { ApiError } from "@/services/api/client";

export function useAdminLogin() {
  return useMutation<AdminLoginResponse, ApiError, AdminLoginInput>({
    mutationFn: (input: AdminLoginInput) => authService.adminLogin(input),
  });
}
