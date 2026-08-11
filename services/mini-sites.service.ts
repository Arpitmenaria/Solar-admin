import type {
  MiniSite, MiniSiteStats, SiteReport, SiteReportStats,
  SiteStatus, SiteVisibility, SiteReportStatus, SiteReportReason,
} from "@/constants/mini-sites-mock-data";
import { apiClient, type ApiError } from "@/services/api/client";

const BASE = "/api/admin/mini-sites";

const STATUSES: SiteStatus[] = ["LIVE", "DRAFT", "SUSPENDED"];
const VISIBILITIES: SiteVisibility[] = ["PUBLIC", "PRIVATE", "PASSWORD"];
const REPORT_STATUSES: SiteReportStatus[] = ["PENDING", "RESOLVED", "DISMISSED"];
const REPORT_REASONS: SiteReportReason[] = [
  "Spam", "Phishing / Scam", "Malware", "Inappropriate Content", "Copyright", "Other",
];

/* ── Site mapping ── */
interface ApiSite {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  url?: string;
  creator?: { name?: string; avatar?: string; avatarUrl?: string } | null;
  status?: string;
  visibility?: string;
  views?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

function mapStatus(s?: string): SiteStatus {
  const u = (s ?? "").toUpperCase();
  return STATUSES.includes(u as SiteStatus) ? (u as SiteStatus) : "DRAFT";
}
function mapVisibility(v?: string): SiteVisibility {
  const u = (v ?? "").toUpperCase();
  return VISIBILITIES.includes(u as SiteVisibility) ? (u as SiteVisibility) : "PUBLIC";
}

function mapSite(s: ApiSite): MiniSite {
  return {
    id: s._id ?? s.id ?? "",
    name: s.name ?? "",
    slug: s.slug ?? "",
    url: s.url,
    creator: { name: s.creator?.name ?? "Unknown", avatarUrl: s.creator?.avatarUrl ?? s.creator?.avatar },
    status: mapStatus(s.status),
    visibility: mapVisibility(s.visibility),
    views: s.views ?? 0,
    description: s.description,
    createdAt: s.createdAt ?? "",
    updatedAt: s.updatedAt ?? "",
  };
}

const EMPTY_SITE_STATS: MiniSiteStats = {
  totalSites: 0, liveSites: 0, publicSites: 0, privateSites: 0, passwordSites: 0,
};

interface ApiSiteList {
  success: boolean;
  sites: ApiSite[];
  total: number;
  page: number;
  totalPages: number;
  stats: MiniSiteStats;
}

/* ── Report mapping ── */
interface ApiSiteReport {
  _id?: string;
  id?: string;
  site?: { id?: string; _id?: string; name?: string; slug?: string; creator?: string; status?: string } | null;
  reportedBy?: { username?: string; name?: string; avatar?: string; avatarUrl?: string } | null;
  reason?: string;
  description?: string;
  status?: string;
  reportedAt?: string;
}

interface ApiSiteReportList {
  success: boolean;
  reports: ApiSiteReport[];
  total: number;
  page: number;
  totalPages: number;
  stats: { total: number; pending: number; resolved: number };
}

function mapReportStatus(s?: string): SiteReportStatus {
  const u = (s ?? "").toUpperCase();
  return REPORT_STATUSES.includes(u as SiteReportStatus) ? (u as SiteReportStatus) : "PENDING";
}
function mapReason(r?: string): SiteReportReason {
  return REPORT_REASONS.includes(r as SiteReportReason) ? (r as SiteReportReason) : "Other";
}

function mapReport(r: ApiSiteReport): SiteReport {
  return {
    id: r._id ?? r.id ?? "",
    site: {
      id: r.site?.id ?? r.site?._id ?? "",
      name: r.site?.name ?? "",
      slug: r.site?.slug ?? "",
      creator: r.site?.creator ?? "",
      status: mapStatus(r.site?.status),
    },
    reportedBy: {
      username: r.reportedBy?.username ?? r.reportedBy?.name ?? "",
      avatarUrl: r.reportedBy?.avatarUrl ?? r.reportedBy?.avatar,
    },
    reason: mapReason(r.reason),
    description: r.description ?? "",
    status: mapReportStatus(r.status),
    reportedAt: r.reportedAt ?? "",
  };
}

export interface SiteFilters {
  search: string;
  status: SiteStatus | "";
  visibility: SiteVisibility | "";
  startDate: string;
  endDate: string;
  sort: "views" | "createdAt" | "updatedAt";
  page: number;
  limit: number;
}

export interface PaginatedSites {
  data: MiniSite[];
  total: number;
  page: number;
  totalPages: number;
  stats: MiniSiteStats;
}

export interface PaginatedSiteReports {
  data: SiteReport[];
  total: number;
  page: number;
  totalPages: number;
  stats: SiteReportStats;
}

export const miniSitesService = {
  async getSites(filters: Partial<SiteFilters> = {}): Promise<PaginatedSites> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.visibility) params.set("visibility", filters.visibility);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    // Backend sorts descending with a leading "-".
    if (filters.sort) params.set("sort", `-${filters.sort}`);

    const res = await apiClient.get<ApiSiteList>(`${BASE}?${params.toString()}`);
    return {
      data: (res.sites ?? []).map(mapSite),
      total: res.total ?? 0,
      page: res.page ?? page,
      totalPages: res.totalPages ?? 1,
      stats: res.stats ?? EMPTY_SITE_STATS,
    };
  },

  async getSiteById(id: string): Promise<MiniSite | null> {
    try {
      const res = await apiClient.get<{ success: boolean; site: ApiSite | null }>(`${BASE}/${id}`);
      return res.site ? mapSite(res.site) : null;
    } catch (err) {
      if ((err as ApiError)?.status === 404) return null;
      throw err;
    }
  },

  async getSiteReports(filters: { status?: SiteReportStatus | "ALL"; page?: number; limit?: number } = {}): Promise<PaginatedSiteReports> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 200;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.status && filters.status !== "ALL") params.set("status", filters.status.toLowerCase());

    const res = await apiClient.get<ApiSiteReportList>(`${BASE}/reports?${params.toString()}`);
    const s = res.stats ?? { total: 0, pending: 0, resolved: 0 };
    return {
      data: (res.reports ?? []).map(mapReport),
      total: res.total ?? 0,
      page: res.page ?? page,
      totalPages: res.totalPages ?? 1,
      stats: { total: s.total ?? 0, pending: s.pending ?? 0, resolved: s.resolved ?? 0 },
    };
  },

  /** Audited actions — each requires a reason (min 5 chars) + optional notes. */
  async suspendSite(id: string, reason: string, notes = ""): Promise<void> {
    await apiClient.patch(`${BASE}/${id}/suspend`, { reason, notes });
  },
  async unsuspendSite(id: string, reason: string, notes = ""): Promise<void> {
    await apiClient.patch(`${BASE}/${id}/unsuspend`, { reason, notes });
  },
  async deleteSite(id: string, reason: string, notes = ""): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`, { reason, notes });
  },

  /** Dismiss a report — no action on the site. */
  async dismissReport(reportId: string): Promise<void> {
    await apiClient.patch(`${BASE}/reports/${reportId}`, { status: "dismissed" });
  },
};
