import type {
  CommentReport, PostReportPerson, CommentReportStatus,
  PaginatedCommentReports, CommentReportStats,
} from "@/types";
import { apiClient } from "@/services/api/client";

const BASE = "/api/admin/users/reported-comments";

interface ApiPerson {
  _id?: string;
  fullName?: string;
  avatar?: string;
}

interface ApiCommentReport {
  reportId?: string;
  commentId?: string;
  status?: string;
  commentDeleted?: boolean;
  commentHidden?: boolean;
  reportCount?: number;
  reasons?: string[];
  reportedAt?: string;
  reporters?: ApiPerson[];
  comment?: {
    _id?: string;
    text?: string;
    author?: ApiPerson | null;
    postId?: string;
    postCaption?: string;
  } | null;
}

interface ApiCommentReportList {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  stats: CommentReportStats;
  reports: ApiCommentReport[];
}

function mapPerson(p: ApiPerson | null | undefined): PostReportPerson {
  return {
    id: p?._id ?? "",
    fullName: p?.fullName ?? "",
    avatarUrl: p?.avatar ?? "",
  };
}

function mapReport(r: ApiCommentReport): CommentReport {
  return {
    reportId: r.reportId ?? "",
    commentId: r.commentId ?? r.comment?._id ?? "",
    // API sends lowercase; the UI works in the uppercase convention used
    // everywhere else in the app.
    status: r.status?.toUpperCase() === "RESOLVED" ? "RESOLVED" : "PENDING",
    commentDeleted: r.commentDeleted ?? false,
    commentHidden: r.commentHidden ?? false,
    reportCount: r.reportCount ?? 0,
    reasons: r.reasons ?? [],
    reportedAt: r.reportedAt ?? "",
    reporters: (r.reporters ?? []).map(mapPerson),
    comment: {
      id: r.comment?._id ?? "",
      text: r.comment?.text ?? "",
      author: mapPerson(r.comment?.author),
      postId: r.comment?.postId ?? "",
      postCaption: r.comment?.postCaption ?? "",
    },
  };
}

export interface CommentReportFilters {
  status: CommentReportStatus | "ALL";
  /** Matched server-side against the comment snapshot's text and author name. */
  search: string;
  page: number;
  limit: number;
}

export const commentReportsService = {
  async getReportedComments(filters: Partial<CommentReportFilters> = {}): Promise<PaginatedCommentReports> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.status && filters.status !== "ALL") {
      params.set("status", filters.status.toLowerCase());
    }
    if (filters.search) params.set("search", filters.search);

    const res = await apiClient.get<ApiCommentReportList>(`${BASE}?${params.toString()}`);

    return {
      data: (res.reports ?? []).map(mapReport),
      total: res.total ?? 0,
      page: res.page ?? page,
      totalPages: res.totalPages ?? 1,
      stats: res.stats ?? { total: 0, pending: 0, resolved: 0 },
    };
  },

  /** Hides the comment from the public feed (not deleted) and resolves its reports. */
  async hideComment(commentId: string): Promise<void> {
    await apiClient.patch(`${BASE}/${commentId}/hide`, {});
  },

  /** Takes no action on the comment, resolves its pending reports. */
  async dismissReports(commentId: string): Promise<void> {
    await apiClient.patch(`${BASE}/${commentId}/dismiss`, {});
  },
};
