"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postReportsService, type PostReportFilters } from "@/services/post-reports.service";

export const postReportKeys = {
  all: ["post-reports"] as const,
  list: (filters: Partial<PostReportFilters>) => ["post-reports", "list", filters] as const,
  authors: ["post-reports", "authors"] as const,
};

export function usePostReports(filters: Partial<PostReportFilters> = {}) {
  return useQuery({
    queryKey: postReportKeys.list(filters),
    queryFn: () => postReportsService.getReportedPosts(filters),
    staleTime: 30_000,
  });
}

/** Authors who have reported posts — populates the author filter dropdown. */
export function usePostReportAuthors() {
  return useQuery({
    queryKey: postReportKeys.authors,
    queryFn: () => postReportsService.getAuthors(),
    staleTime: 60_000,
  });
}

interface ActionArgs {
  postId: string;
  reason: string;
  notes: string;
}

/** Both actions resolve the post's reports, so both invalidate the same list. */
export function useHidePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, reason, notes }: ActionArgs) => postReportsService.hidePost(postId, reason, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: postReportKeys.all }),
  });
}

export function useDismissPostReports() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, reason, notes }: ActionArgs) => postReportsService.dismissReports(postId, reason, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: postReportKeys.all }),
  });
}
