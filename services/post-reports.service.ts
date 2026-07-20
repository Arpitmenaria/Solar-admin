import type {
  PostReport, PostReportPerson, PostReportStatus, PostMedia,
  PaginatedPostReports, PostReportStats,
} from "@/types";
import { apiClient } from "@/services/api/client";

const BASE = "/api/admin/users/reported-posts";

interface ApiPerson {
  _id?: string;
  fullName?: string;
  avatar?: string;
}

interface ApiPostReport {
  reportId?: string;
  postId?: string;
  status?: string;
  postDeleted?: boolean;
  reportCount?: number;
  reasons?: string[];
  reportedAt?: string;
  reporters?: ApiPerson[];
  /** Pre-snapshot API shape; kept so a stale backend doesn't blank the column. */
  reporter?: ApiPerson | null;
  post?: {
    _id?: string;
    caption?: string;
    media?: PostMedia[];
    author?: ApiPerson | null;
  } | null;
}

interface ApiPostReportList {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  stats: PostReportStats;
  reports: ApiPostReport[];
}

function mapPerson(p: ApiPerson | null | undefined): PostReportPerson {
  return {
    id: p?._id ?? "",
    fullName: p?.fullName ?? "",
    avatarUrl: p?.avatar ?? "",
  };
}

function mapReport(r: ApiPostReport): PostReport {
  return {
    reportId: r.reportId ?? "",
    postId: r.postId ?? r.post?._id ?? "",
    // API sends lowercase; the UI works in the uppercase convention used
    // everywhere else in the app.
    status: r.status?.toUpperCase() === "RESOLVED" ? "RESOLVED" : "PENDING",
    postDeleted: r.postDeleted ?? false,
    reportCount: r.reportCount ?? 0,
    reasons: r.reasons ?? [],
    reportedAt: r.reportedAt ?? "",
    reporters: (r.reporters ?? (r.reporter ? [r.reporter] : [])).map(mapPerson),
    post: {
      id: r.post?._id ?? "",
      caption: r.post?.caption ?? "",
      // A deleted or media-less post still has to render a row.
      media: (r.post?.media ?? []).filter((m) => m?.url),
      author: mapPerson(r.post?.author),
    },
  };
}

export interface PostReportFilters {
  status: PostReportStatus | "ALL";
  /** Matched server-side against the post snapshot's caption and author name. */
  search: string;
  page: number;
  limit: number;
}

export const postReportsService = {
  async getReportedPosts(filters: Partial<PostReportFilters> = {}): Promise<PaginatedPostReports> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.status && filters.status !== "ALL") {
      params.set("status", filters.status.toLowerCase());
    }
    if (filters.search) params.set("search", filters.search);

    const res = await apiClient.get<ApiPostReportList>(`${BASE}?${params.toString()}`);

    return {
      data: (res.reports ?? []).map(mapReport),
      total: res.total ?? 0,
      page: res.page ?? page,
      totalPages: res.totalPages ?? 1,
      stats: res.stats ?? { total: 0, pending: 0, resolved: 0 },
    };
  },

  /** Deletes the post and resolves every report filed against it. */
  async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`${BASE}/${postId}`);
  },

  /** Keeps the post, resolves its pending reports. */
  async dismissReports(postId: string): Promise<void> {
    await apiClient.patch(`${BASE}/${postId}/dismiss`, {});
  },
};
