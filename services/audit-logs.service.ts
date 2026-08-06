import type {
  AuditLog, AuditLogDetail, AuditLogReportRef, PaginatedAuditLogs,
} from "@/types";
import { apiClient } from "@/services/api/client";

const BASE = "/api/admin/users/audit-logs";

/** A field the API may return as an id string or a populated object. */
type IdOrObject = string | { _id?: string; id?: string; fullName?: string; name?: string; email?: string } | null;

interface ApiAuditLog {
  _id?: string;
  id?: string;
  adminId?: IdOrObject;
  adminName?: string;
  adminEmail?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  targetAuthorId?: IdOrObject;
  targetAuthorName?: string;
  reason?: string;
  notes?: string;
  statusBefore?: string;
  statusAfter?: string;
  userNotified?: boolean;
  notificationSent?: boolean;
  emailSent?: boolean;
  createdAt?: string;
}

interface ApiAuditLogDetail extends ApiAuditLog {
  ipAddress?: string;
  reportIds?: { _id?: string; id?: string; reason?: string; reporterName?: string; reportedBy?: { fullName?: string; name?: string } }[];
}

interface ApiAuditList {
  success: boolean;
  logs: ApiAuditLog[];
  total: number;
  page: number;
  pages: number;
}

/** Pull an id out of a field that may be a string or a populated object. */
const idOf = (v: IdOrObject): string =>
  typeof v === "string" ? v : v?._id ?? v?.id ?? "";

/** Pull a display name out of a populated object, if present. */
const nameOf = (v: IdOrObject): string =>
  typeof v === "string" || !v ? "" : v.fullName ?? v.name ?? "";

function mapLog(l: ApiAuditLog): AuditLog {
  return {
    id: l._id ?? l.id ?? "",
    adminId: idOf(l.adminId ?? null),
    adminName: l.adminName ?? nameOf(l.adminId ?? null),
    adminEmail: l.adminEmail ?? (typeof l.adminId === "object" ? l.adminId?.email ?? "" : ""),
    action: l.action ?? "",
    targetType: l.targetType ?? "",
    targetId: l.targetId ?? "",
    targetAuthorId: idOf(l.targetAuthorId ?? null),
    targetAuthorName: l.targetAuthorName ?? nameOf(l.targetAuthorId ?? null),
    reason: l.reason ?? "",
    notes: l.notes ?? "",
    statusBefore: l.statusBefore ?? "",
    statusAfter: l.statusAfter ?? "",
    userNotified: l.userNotified ?? false,
    notificationSent: l.notificationSent ?? false,
    emailSent: l.emailSent ?? false,
    createdAt: l.createdAt ?? "",
  };
}

function mapDetail(l: ApiAuditLogDetail): AuditLogDetail {
  return {
    ...mapLog(l),
    ipAddress: l.ipAddress ?? "",
    relatedReports: (l.reportIds ?? []).map((r): AuditLogReportRef => ({
      id: r._id ?? r.id ?? "",
      reason: r.reason ?? "",
      reporterName: r.reporterName ?? r.reportedBy?.fullName ?? r.reportedBy?.name ?? "",
    })),
  };
}

export interface AuditLogFilters {
  action: string;
  adminId: string;
  targetId: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

function toPaginated(res: ApiAuditList, page: number, limit: number): PaginatedAuditLogs {
  const total = res.total ?? 0;
  return {
    data: (res.logs ?? []).map(mapLog),
    total,
    page: res.page ?? page,
    totalPages: res.pages ?? Math.max(1, Math.ceil(total / limit)),
  };
}

export const auditLogsService = {
  async list(filters: Partial<AuditLogFilters> = {}): Promise<PaginatedAuditLogs> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.action) params.set("action", filters.action);
    if (filters.adminId) params.set("adminId", filters.adminId);
    if (filters.targetId) params.set("targetId", filters.targetId);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);

    const res = await apiClient.get<ApiAuditList>(`${BASE}/list?${params.toString()}`);
    return toPaginated(res, page, limit);
  },

  async byUser(userId: string, page = 1, limit = 50): Promise<PaginatedAuditLogs> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await apiClient.get<ApiAuditList>(`${BASE}/by-user/${userId}?${params.toString()}`);
    return toPaginated(res, page, limit);
  },

  async byAdmin(adminId: string, page = 1, limit = 50): Promise<PaginatedAuditLogs> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await apiClient.get<ApiAuditList>(`${BASE}/by-admin/${adminId}?${params.toString()}`);
    return toPaginated(res, page, limit);
  },

  async detail(logId: string): Promise<AuditLogDetail | null> {
    const res = await apiClient.get<{ success: boolean; log: ApiAuditLogDetail | null }>(`${BASE}/detail/${logId}`);
    return res.log ? mapDetail(res.log) : null;
  },
};

/** Human labels + tone for known action slugs; falls back for anything new. */
export const AUDIT_ACTION_LABELS: Record<string, { label: string; tone: "red" | "amber" | "emerald" | "blue" }> = {
  post_deleted:      { label: "Post Deleted",      tone: "red"     },
  post_hidden:       { label: "Post Hidden",       tone: "amber"   },
  reports_dismissed: { label: "Reports Dismissed", tone: "emerald" },
  user_suspended:    { label: "User Suspended",    tone: "red"     },
  user_reactivated:  { label: "User Reactivated",  tone: "emerald" },
  comment_deleted:   { label: "Comment Deleted",   tone: "red"     },
};

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action]?.label
    ?? action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
