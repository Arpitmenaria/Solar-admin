import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";

export interface OrganizationStats {
  totalOrganizations: number;
  pendingOrganizations: number;
  approvedOrganizations: number;
  rejectedOrganizations: number;
}

export interface Creator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: "business" | "non-profit" | "educational" | "community";
  shortDescription: string;
  fullDescription: string;
  logo: string;
  coverImage: string;
  slug: string;
  status: "pending" | "approved" | "rejected";
  memberCount: number;
  miniSitesCount?: number;
  createdBy: Creator;
  approvedBy?: Creator;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const organizationsKey = () => ["organizations"];
export const organizationStatsKey = () => ["organizations", "stats"];

export function useOrganizationStats() {
  return useQuery({
    queryKey: organizationStatsKey(),
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: OrganizationStats;
      }>("/api/admin/organizations/stats");
      return response.data;
    },
  });
}

export function useOrganizations(
  page: number = 1,
  limit: number = 10,
  status: string = "",
  search: string = ""
) {
  return useQuery({
    queryKey: [...organizationsKey(), { page, limit, status, search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(search && { search }),
      });

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Organization[];
        pagination: Pagination;
      }>(`/api/admin/organizations?${params}`);

      return response;
    },
  });
}

export function usePendingOrganizations(page: number = 1, limit: number = 10, search: string = "") {
  return useQuery({
    queryKey: [...organizationsKey(), "pending", { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Organization[];
        pagination: Pagination;
      }>(`/api/admin/organizations/pending?${params}`);

      return response;
    },
  });
}

export function useOrganizationDetail(organizationId: string) {
  return useQuery({
    queryKey: [...organizationsKey(), organizationId],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: Organization & { members: Member[] };
      }>(`/api/admin/organizations/${organizationId}`);
      return response.data;
    },
    enabled: !!organizationId,
  });
}

export function useApproveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationId: string) => {
      return apiClient.post<{ success: boolean; message: string; data: Organization }>(
        `/api/admin/organizations/${organizationId}/approve`,
        {}
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKey() });
      queryClient.invalidateQueries({ queryKey: organizationStatsKey() });
    },
  });
}

export function useRejectOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, reason }: { organizationId: string; reason: string }) => {
      return apiClient.post<{ success: boolean; message: string; data: Organization }>(
        `/api/admin/organizations/${organizationId}/reject`,
        { reason }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKey() });
      queryClient.invalidateQueries({ queryKey: organizationStatsKey() });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, reason }: { organizationId: string; reason: string }) => {
      return apiClient.delete<{ success: boolean; message: string }>(
        `/api/admin/organizations/${organizationId}`,
        { reason }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKey() });
      queryClient.invalidateQueries({ queryKey: organizationStatsKey() });
    },
  });
}
