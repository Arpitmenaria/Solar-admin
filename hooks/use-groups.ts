"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupsService, type CreateGroupInput, type UpdateGroupInput, type GroupFilters } from "@/services/groups.service";

export const groupKeys = {
  all: ["groups"] as const,
  list: (filters: Partial<GroupFilters>) => ["groups", "list", filters] as const,
  detail: (id: string) => ["groups", "detail", id] as const,
};

export function useGroups(filters: Partial<GroupFilters> = {}) {
  return useQuery({
    queryKey: groupKeys.list(filters),
    queryFn: () => groupsService.getGroups(filters),
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

interface GroupActionArgs {
  id: string;
  reason: string;
  notes: string;
}

/** Audited actions invalidate both the group list and the audit log. */
function useGroupAction(fn: (a: GroupActionArgs) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: groupKeys.all });
      qc.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}

export function useSuspendGroup() {
  return useGroupAction(({ id, reason, notes }) => groupsService.suspendGroup(id, reason, notes));
}

export function useUnsuspendGroup() {
  return useGroupAction(({ id, reason, notes }) => groupsService.unsuspendGroup(id, reason, notes));
}

export function useDeleteGroup() {
  return useGroupAction(({ id, reason, notes }) => groupsService.deleteGroup(id, reason, notes));
}
