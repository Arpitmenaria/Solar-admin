"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsService } from "@/services/reports.service";
import type { ReportStatus } from "@/types";

export type ReportKind = "group" | "event";

export function useGroupReports() {
  return useQuery({
    queryKey: ["reports", "group", "list"],
    queryFn: reportsService.getGroupReports,
    staleTime: 30_000,
  });
}

export function useGroupReportStats() {
  return useQuery({
    queryKey: ["reports", "group", "stats"],
    queryFn: reportsService.getGroupReportStats,
    staleTime: 30_000,
  });
}

export function useGroupReport(id: string) {
  return useQuery({
    queryKey: ["reports", "group", "detail", id],
    queryFn: () => reportsService.getGroupReportById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useEventReports() {
  return useQuery({
    queryKey: ["reports", "event", "list"],
    queryFn: reportsService.getEventReports,
    staleTime: 30_000,
  });
}

export function useEventReportStats() {
  return useQuery({
    queryKey: ["reports", "event", "stats"],
    queryFn: reportsService.getEventReportStats,
    staleTime: 30_000,
  });
}

export function useEventReport(id: string) {
  return useQuery({
    queryKey: ["reports", "event", "detail", id],
    queryFn: () => reportsService.getEventReportById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/** Shared status-transition mutation for both group and event reports. */
export function useUpdateReportStatus(kind: ReportKind) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReportStatus }) =>
      kind === "group"
        ? reportsService.updateGroupReportStatus(id, status)
        : reportsService.updateEventReportStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports", kind] });
    },
  });
}
