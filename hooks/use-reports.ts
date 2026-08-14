"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsService } from "@/services/reports.service";
import type { ReportStatus } from "@/types";

export type ReportKind = "group" | "event" | "course";

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

export function useCourseReports() {
  return useQuery({
    queryKey: ["reports", "course", "list"],
    queryFn: reportsService.getCourseReports,
    staleTime: 30_000,
  });
}

export function useCourseReportStats() {
  return useQuery({
    queryKey: ["reports", "course", "stats"],
    queryFn: reportsService.getCourseReportStats,
    staleTime: 30_000,
  });
}

export function useCourseReport(id: string) {
  return useQuery({
    queryKey: ["reports", "course", "detail", id],
    queryFn: () => reportsService.getCourseReportById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

const UPDATE_STATUS_BY_KIND: Record<ReportKind, (id: string, status: ReportStatus) => Promise<unknown>> = {
  group: reportsService.updateGroupReportStatus,
  event: reportsService.updateEventReportStatus,
  course: reportsService.updateCourseReportStatus,
};

/** Shared status-transition mutation for group, event, and course reports. */
export function useUpdateReportStatus(kind: ReportKind) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReportStatus }) => UPDATE_STATUS_BY_KIND[kind](id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports", kind] });
    },
  });
}
