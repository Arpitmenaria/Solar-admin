"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageReportsService, type ConversationReportFilters } from "@/services/message-reports.service";

export const conversationReportKeys = {
  all: ["conversation-reports"] as const,
  list: (filters: Partial<ConversationReportFilters>) => ["conversation-reports", "list", filters] as const,
  detail: (id: string) => ["conversation-reports", "detail", id] as const,
};

export function useConversationReports(filters: Partial<ConversationReportFilters> = {}) {
  return useQuery({
    queryKey: conversationReportKeys.list(filters),
    queryFn: () => messageReportsService.getReportedConversations(filters),
    staleTime: 30_000,
  });
}

export function useConversationReportDetail(conversationId: string) {
  return useQuery({
    queryKey: conversationReportKeys.detail(conversationId),
    queryFn: () => messageReportsService.getConversationReports(conversationId),
    enabled: !!conversationId,
    staleTime: 30_000,
  });
}

/** Both actions resolve the conversation's reports, so both invalidate the same list. */
export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => messageReportsService.deleteConversation(conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: conversationReportKeys.all }),
  });
}

export function useDismissConversationReports() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => messageReportsService.dismissReports(conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: conversationReportKeys.all }),
  });
}
