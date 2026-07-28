"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postReportsService, type PostReportFilters } from "@/services/post-reports.service";

export const postReportKeys = {
  all: ["post-reports"] as const,
  list: (filters: Partial<PostReportFilters>) => ["post-reports", "list", filters] as const,
};

export function usePostReports(filters: Partial<PostReportFilters> = {}) {
  return useQuery({
    queryKey: postReportKeys.list(filters),
    queryFn: () => postReportsService.getReportedPosts(filters),
    staleTime: 30_000,
  });
}

/** Both actions resolve the post's reports, so both invalidate the same list. */
export function useHidePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => postReportsService.hidePost(postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: postReportKeys.all }),
  });
}

export function useDismissPostReports() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => postReportsService.dismissReports(postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: postReportKeys.all }),
  });
}
