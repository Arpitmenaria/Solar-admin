"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { miniSitesService, type SiteFilters } from "@/services/mini-sites.service";
import type { SiteReportStatus } from "@/constants/mini-sites-mock-data";

export const miniSiteKeys = {
  all: ["mini-sites"] as const,
  sites: (filters: Partial<SiteFilters>) => ["mini-sites", "sites", filters] as const,
  detail: (id: string) => ["mini-sites", "detail", id] as const,
  reports: (status: SiteReportStatus | "ALL") => ["mini-sites", "reports", status] as const,
};

export function useMiniSites(filters: Partial<SiteFilters> = {}) {
  return useQuery({
    queryKey: miniSiteKeys.sites(filters),
    queryFn: () => miniSitesService.getSites(filters),
    staleTime: 30_000,
  });
}

export function useMiniSite(id: string) {
  return useQuery({
    queryKey: miniSiteKeys.detail(id),
    queryFn: () => miniSitesService.getSiteById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useSiteReports(status: SiteReportStatus | "ALL" = "ALL") {
  return useQuery({
    queryKey: miniSiteKeys.reports(status),
    queryFn: () => miniSitesService.getSiteReports({ status }),
    staleTime: 30_000,
  });
}

interface SiteActionArgs { id: string; reason: string; notes: string }

/** Audited actions invalidate both the sites data and the audit log. */
function useSiteAction(fn: (a: SiteActionArgs) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: miniSiteKeys.all });
      qc.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}

export function useSuspendSite() {
  return useSiteAction(({ id, reason, notes }) => miniSitesService.suspendSite(id, reason, notes));
}
export function useUnsuspendSite() {
  return useSiteAction(({ id, reason, notes }) => miniSitesService.unsuspendSite(id, reason, notes));
}
export function useDeleteSite() {
  return useSiteAction(({ id, reason, notes }) => miniSitesService.deleteSite(id, reason, notes));
}

export function useDismissSiteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => miniSitesService.dismissReport(reportId),
    onSuccess: () => qc.invalidateQueries({ queryKey: miniSiteKeys.all }),
  });
}
