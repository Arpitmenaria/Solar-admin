import type {
  ChatType, ConversationMessageReport, ConversationReportDetail, ConversationReporter,
  ConversationReportStatus, ConversationReportSummary, MessageReportPerson, PaginatedConversationReports,
  ConversationTranscript, ConversationMessage,
} from "@/types";
import { apiClient } from "@/services/api/client";

const BASE = "/api/admin/conversations";

interface ApiPerson {
  id?: string;
  name?: string;
  avatar?: string | null;
}

interface ApiReporter extends ApiPerson {
  reason?: string;
}

interface ApiConversationSummary {
  id?: string;
  type?: string;
  name?: string;
  memberCount?: number;
  totalReports?: number;
  status?: string;
  reporters?: ApiReporter[];
  lastReportedAt?: string;
}

interface ApiConversationList {
  success: boolean;
  conversations: ApiConversationSummary[];
  total: number;
  page: number;
  pageSize: number;
}

interface ApiConversationReportItem {
  id?: string;
  reportedBy?: ApiPerson | null;
  reason?: string;
  status?: string;
  reportedAt?: string;
}

interface ApiConversationReportDetail {
  success: boolean;
  conversation?: { id?: string; type?: string; name?: string; memberCount?: number } | null;
  reports?: ApiConversationReportItem[];
  total?: number;
}

interface ApiConversationMessage {
  sender?: ApiPerson | null;
  text?: string;
  timestamp?: string;
}

interface ApiReportDetails {
  success: boolean;
  conversation?: {
    type?: string;
    name?: string;
    members?: ApiPerson[];
    messages?: ApiConversationMessage[];
  } | null;
}

function mapPerson(p: ApiPerson | null | undefined): MessageReportPerson {
  return { id: p?.id ?? "", fullName: p?.name ?? "", avatarUrl: p?.avatar ?? "" };
}

function mapReporter(p: ApiReporter): ConversationReporter {
  return { ...mapPerson(p), reason: p.reason ?? "" };
}

function mapChatType(t?: string): ChatType {
  return t === "direct" ? "direct" : "group";
}

function mapStatus(s?: string): ConversationReportStatus {
  return s?.toLowerCase() === "resolved" ? "RESOLVED" : "PENDING";
}

function mapSummary(c: ApiConversationSummary): ConversationReportSummary {
  const conversationId = c.id ?? "";
  return {
    conversationId,
    chat: { type: mapChatType(c.type), id: conversationId, name: c.name ?? "" },
    status: mapStatus(c.status),
    reportCount: c.totalReports ?? 0,
    memberCount: c.type === "direct" ? undefined : c.memberCount,
    reporters: (c.reporters ?? []).map(mapReporter),
    lastReportedAt: c.lastReportedAt ?? "",
  };
}

export interface ConversationReportFilters {
  status: ConversationReportStatus | "ALL";
  search: string;
  page: number;
  limit: number;
}

function buildParams(filters: Partial<ConversationReportFilters>): URLSearchParams {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 10),
  });
  if (filters.status && filters.status !== "ALL") params.set("status", filters.status.toLowerCase());
  if (filters.search) params.set("search", filters.search);
  return params;
}

export const messageReportsService = {
  async getReportedConversations(filters: Partial<ConversationReportFilters> = {}): Promise<PaginatedConversationReports> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    // The list endpoint returns no aggregate stats or totalPages, so the stat
    // cards come from two lightweight parallel calls (all vs. pending) and
    // totalPages is derived from `total`/`limit`.
    const [res, allRes, pendingRes] = await Promise.all([
      apiClient.get<ApiConversationList>(`${BASE}/reported?${buildParams(filters).toString()}`),
      apiClient.get<ApiConversationList>(`${BASE}/reported?${buildParams({ status: "ALL", page: 1, limit: 1 }).toString()}`),
      apiClient.get<ApiConversationList>(`${BASE}/reported?${buildParams({ status: "PENDING", page: 1, limit: 1 }).toString()}`),
    ]);

    const total = res.total ?? 0;
    const totalAll = allRes.total ?? 0;
    const totalPending = pendingRes.total ?? 0;

    return {
      data: (res.conversations ?? []).map(mapSummary),
      total,
      page: res.page ?? page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats: { total: totalAll, pending: totalPending, resolved: totalAll - totalPending },
    };
  },

  async getConversationReports(conversationId: string): Promise<ConversationReportDetail> {
    const res = await apiClient.get<ApiConversationReportDetail>(`${BASE}/${conversationId}/reports`);
    const conv = res.conversation;

    return {
      conversationId: conv?.id ?? conversationId,
      chat: { type: mapChatType(conv?.type), id: conv?.id ?? conversationId, name: conv?.name ?? "" },
      memberCount: conv?.type === "direct" ? undefined : conv?.memberCount,
      reports: (res.reports ?? []).map((r): ConversationMessageReport => ({
        reportId: r.id ?? "",
        reason: r.reason ?? "",
        reportedAt: r.reportedAt ?? "",
        status: mapStatus(r.status),
        reporter: mapPerson(r.reportedBy),
      })),
    };
  },

  /**
   * Full context for the moderation view: every member and the complete
   * message history, sorted chronologically. Separate from getConversationReports
   * so the reports list (one row per reporter) stays intact.
   */
  async getConversationContent(conversationId: string): Promise<ConversationTranscript> {
    const res = await apiClient.get<ApiReportDetails>(`${BASE}/${conversationId}/report-details`);
    const conv = res.conversation;
    return {
      members: (conv?.members ?? []).map(mapPerson),
      messages: (conv?.messages ?? []).map((m): ConversationMessage => ({
        sender: mapPerson(m.sender),
        text: m.text ?? "",
        timestamp: m.timestamp ?? "",
      })),
    };
  },

  /** Hard-deletes the conversation and all its messages, and notifies the
   *  creator. Requires a reason for the audit log. */
  async deleteConversation(conversationId: string, reason: string, notes = ""): Promise<void> {
    await apiClient.delete(`${BASE}/${conversationId}`, { reason, notes });
  },

  /** Keeps the conversation, resolves all its pending reports. */
  async dismissReports(conversationId: string, reason: string, notes = ""): Promise<void> {
    await apiClient.patch(`${BASE}/${conversationId}/reports/dismiss`, { reason, notes });
  },
};
