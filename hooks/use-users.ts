"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, dashboardService } from "@/services/users.service";
import type { UserFilters, RelationKind, ChartPeriod } from "@/types";

export const userKeys = {
  all: ["users"] as const,
  list: (filters: Partial<UserFilters>) => ["users", "list", filters] as const,
  detail: (id: string) => ["users", "detail", id] as const,
  stats: ["users", "stats"] as const,
  relations: (id: string, kind: RelationKind, page: number) =>
    ["users", "relations", id, kind, page] as const,
  reporters: (id: string, page: number) => ["users", "reporters", id, page] as const,
};

export function useUsers(filters: Partial<UserFilters> = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => usersService.getUsers(filters),
    staleTime: 30_000,
  });
}

/** Fetches a relation list only while `enabled` — i.e. the modal is open. */
export function useUserRelations(
  id: string,
  kind: RelationKind,
  page: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: userKeys.relations(id, kind, page),
    queryFn: () => usersService.getRelations(id, kind, page),
    enabled: enabled && !!id,
    staleTime: 30_000,
  });
}

/** Fetches the "reported by" list only while `enabled` (the modal is open). */
export function useUserReporters(id: string, page: number, enabled: boolean) {
  return useQuery({
    queryKey: userKeys.reporters(id, page),
    queryFn: () => usersService.getReporters(id, page),
    enabled: enabled && !!id,
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

export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats,
    queryFn: usersService.getUserStats,
    staleTime: 60_000,
  });
}

/**
 * The endpoint toggles isSuspended rather than setting it, so callers must
 * check the user's current state to know which direction a click will go.
 */
export function useToggleSuspend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, notes }: { id: string; reason: string; notes: string }) =>
      usersService.toggleSuspend(id, reason, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      // The user's audit trail changed too.
      qc.invalidateQueries({ queryKey: ["audit-logs"] });
    },
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

export function useChartData(period: ChartPeriod = "weekly") {
  return useQuery({
    queryKey: ["dashboard", "chart", period],
    queryFn: () => dashboardService.getChartData(period),
    staleTime: 60_000,
  });
}
