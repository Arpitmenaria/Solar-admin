"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupsService, type CreateGroupInput, type UpdateGroupInput } from "@/services/groups.service";

export const groupKeys = {
  all: ["groups"] as const,
  list: () => ["groups", "list"] as const,
  stats: () => ["groups", "stats"] as const,
  detail: (id: string) => ["groups", "detail", id] as const,
};

export function useGroups() {
  return useQuery({
    queryKey: groupKeys.list(),
    queryFn: groupsService.getGroups,
    staleTime: 30_000,
  });
}

export function useGroupStats() {
  return useQuery({
    queryKey: groupKeys.stats(),
    queryFn: groupsService.getGroupStats,
    staleTime: 30_000,
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: () => groupsService.getGroupById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useGroupMembers(id: string) {
  return useQuery({
    queryKey: [...groupKeys.detail(id), "members"],
    queryFn: () => groupsService.getGroupMembers(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useGroupPosts(id: string) {
  return useQuery({
    queryKey: [...groupKeys.detail(id), "posts"],
    queryFn: () => groupsService.getGroupPosts(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGroupInput) => groupsService.createGroup(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: groupKeys.all }),
  });
}

export function useUpdateGroup(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateGroupInput) => groupsService.updateGroup(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: groupKeys.all }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsService.deleteGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: groupKeys.all }),
  });
}
