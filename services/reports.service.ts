import type { Report, ReportStats, ReportStatus, ReportCategory } from "@/types";
import { apiClient } from "@/services/api/client";

const GROUP_REPORTS_BASE = "/api/admin/groups/reports";
const EVENT_REPORTS_BASE = "/api/admin/events/reports";

const REPORT_STATUSES: ReportStatus[] = ["PENDING", "RESOLVED", "DISMISSED"];
const REPORT_CATEGORIES: ReportCategory[] = [
  "Spam", "Harassment", "Inappropriate Content", "Scam / Fraud",
  "Fake or Misleading", "Hate Speech", "Other",
];

interface ApiReport {
  _id?: string;
  id?: string;
  target?: { id?: string; _id?: string; name?: string; avatar?: string; avatarUrl?: string; meta?: string } | null;
  reportedBy?: { username?: string; name?: string; avatar?: string; avatarUrl?: string } | null;
  category?: string;
  description?: string;
  status?: string;
  reportedAt?: string;
}

interface ApiReportList {
  success: boolean;
  reports: ApiReport[];
  total: number;
  page: number;
  totalPages: number;
  stats: ReportStats;
}

function mapReportStatus(s?: string): ReportStatus {
  const upper = (s ?? "").toUpperCase();
  return REPORT_STATUSES.includes(upper as ReportStatus) ? (upper as ReportStatus) : "PENDING";
}

function mapReportCategory(c?: string): ReportCategory {
  return REPORT_CATEGORIES.includes(c as ReportCategory) ? (c as ReportCategory) : "Other";
}

function mapReport(r: ApiReport): Report {
  return {
    id: r._id ?? r.id ?? "",
    target: {
      id: r.target?.id ?? r.target?._id ?? "",
      name: r.target?.name ?? "",
      avatarUrl: r.target?.avatarUrl ?? r.target?.avatar,
      meta: r.target?.meta ?? "",
    },
    reportedBy: {
      username: r.reportedBy?.username ?? r.reportedBy?.name ?? "",
      avatarUrl: r.reportedBy?.avatarUrl ?? r.reportedBy?.avatar,
    },
    category: mapReportCategory(r.category),
    description: r.description ?? "",
    status: mapReportStatus(r.status),
    reportedAt: r.reportedAt ?? "",
  };
}

const EMPTY_REPORT_STATS: ReportStats = { total: 0, pending: 0, resolved: 0, dismissed: 0 };

export const reportsService = {
  async getGroupReports(): Promise<Report[]> {
    const res = await apiClient.get<ApiReportList>(`${GROUP_REPORTS_BASE}?page=1&limit=200`);
    return (res.reports ?? []).map(mapReport);
  },
  async getGroupReportStats(): Promise<ReportStats> {
    const res = await apiClient.get<ApiReportList>(`${GROUP_REPORTS_BASE}?page=1&limit=1`);
    return res.stats ?? EMPTY_REPORT_STATS;
  },
  async getGroupReportById(id: string): Promise<Report | null> {
    const res = await apiClient.get<{ success: boolean; report: ApiReport | null }>(`${GROUP_REPORTS_BASE}/${id}`);
    return res.report ? mapReport(res.report) : null;
  },
  async updateGroupReportStatus(id: string, status: ReportStatus): Promise<Report | null> {
    // The API responds with just { success, message } — no updated report — so
    // only map when one is actually returned. The caller ignores the value.
    const res = await apiClient.patch<{ success: boolean; report?: ApiReport }>(
      `${GROUP_REPORTS_BASE}/${id}`,
      { status: status.toLowerCase() },
    );
    return res.report ? mapReport(res.report) : null;
  },

  async getEventReports(): Promise<Report[]> {
    const res = await apiClient.get<ApiReportList>(`${EVENT_REPORTS_BASE}?page=1&limit=200`);
    return (res.reports ?? []).map(mapReport);
  },
  async getEventReportStats(): Promise<ReportStats> {
    const res = await apiClient.get<ApiReportList>(`${EVENT_REPORTS_BASE}?page=1&limit=1`);
    return res.stats ?? EMPTY_REPORT_STATS;
  },
  async getEventReportById(id: string): Promise<Report | null> {
    const res = await apiClient.get<{ success: boolean; report: ApiReport | null }>(`${EVENT_REPORTS_BASE}/${id}`);
    return res.report ? mapReport(res.report) : null;
  },
  /** The event-reports API only supports dismissing — "resolved" happens implicitly when the event is deleted. */
  async updateEventReportStatus(id: string, status: ReportStatus): Promise<Report | null> {
    const res = await apiClient.patch<{ success: boolean; report?: ApiReport }>(
      `${EVENT_REPORTS_BASE}/${id}`,
      { status: status.toLowerCase() },
    );
    return res.report ? mapReport(res.report) : null;
  },
};
