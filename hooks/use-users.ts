"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, dashboardService } from "@/services/users.service";
import type { UserFilters, ProfileFormValues } from "@/types";

export const userKeys = {
  all: ["users"] as const,
  list: (filters: Partial<UserFilters>) => ["users", "list", filters] as const,
  detail: (id: string) => ["users", "detail", id] as const,
};

export function useUsers(filters: Partial<UserFilters> = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => usersService.getUsers(filters),
    staleTime: 30_000,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<ProfileFormValues>) => usersService.updateUser(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.blockUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardService.getStats,
    staleTime: 60_000,
  });
}

export function useModerationQueue() {
  return useQuery({
    queryKey: ["dashboard", "moderation"],
    queryFn: dashboardService.getModeration,
    staleTime: 30_000,
  });
}

export function useChartData() {
  return useQuery({
    queryKey: ["dashboard", "chart"],
    queryFn: dashboardService.getChartData,
    staleTime: 60_000,
  });
}
