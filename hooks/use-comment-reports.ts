"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentReportsService, type CommentReportFilters } from "@/services/comment-reports.service";

export const commentReportKeys = {
  all: ["comment-reports"] as const,
  list: (filters: Partial<CommentReportFilters>) => ["comment-reports", "list", filters] as const,
};

export function useCommentReports(filters: Partial<CommentReportFilters> = {}) {
  return useQuery({
    queryKey: commentReportKeys.list(filters),
    queryFn: () => commentReportsService.getReportedComments(filters),
    staleTime: 30_000,
  });
}

/** Both actions resolve the comment's reports, so both invalidate the same list. */
export function useHideComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentReportsService.hideComment(commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentReportKeys.all }),
  });
}

export function useDismissCommentReports() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentReportsService.dismissReports(commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentReportKeys.all }),
  });
}
