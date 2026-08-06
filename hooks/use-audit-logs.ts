"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogsService, type AuditLogFilters } from "@/services/audit-logs.service";

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  list: (filters: Partial<AuditLogFilters>) => ["audit-logs", "list", filters] as const,
  byUser: (userId: string, page: number) => ["audit-logs", "by-user", userId, page] as const,
  byAdmin: (adminId: string, page: number) => ["audit-logs", "by-admin", adminId, page] as const,
  detail: (logId: string) => ["audit-logs", "detail", logId] as const,
};

export function useAuditLogs(filters: Partial<AuditLogFilters> = {}) {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => auditLogsService.list(filters),
    staleTime: 30_000,
  });
}

/** Actions taken against a specific user — for the user detail panel. */
export function useUserAuditLogs(userId: string, page = 1, limit = 50, enabled = true) {
  return useQuery({
    queryKey: auditLogKeys.byUser(userId, page),
    queryFn: () => auditLogsService.byUser(userId, page, limit),
    enabled: enabled && !!userId,
    staleTime: 30_000,
  });
}

export function useAdminAuditLogs(adminId: string, page = 1, enabled = true) {
  return useQuery({
    queryKey: auditLogKeys.byAdmin(adminId, page),
    queryFn: () => auditLogsService.byAdmin(adminId, page),
    enabled: enabled && !!adminId,
    staleTime: 30_000,
  });
}

/** Full detail — fetched only while the detail modal is open. */
export function useAuditLogDetail(logId: string | null) {
  return useQuery({
    queryKey: auditLogKeys.detail(logId ?? ""),
    queryFn: () => auditLogsService.detail(logId!),
    enabled: !!logId,
    staleTime: 60_000,
  });
}
