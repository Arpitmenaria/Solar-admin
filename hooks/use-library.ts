"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { libraryService, type CreateResourceInput, type UpdateResourceInput } from "@/services/library.service";

export const libraryKeys = {
  all: ["library"] as const,
  list: () => ["library", "list"] as const,
  stats: () => ["library", "stats"] as const,
  detail: (id: string) => ["library", "detail", id] as const,
  tags: () => ["library", "tags"] as const,
};

export function useResources() {
  return useQuery({ queryKey: libraryKeys.list(), queryFn: libraryService.getResources, staleTime: 30_000 });
}

export function useResourceStats() {
  return useQuery({ queryKey: libraryKeys.stats(), queryFn: libraryService.getResourceStats, staleTime: 30_000 });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: libraryKeys.detail(id),
    queryFn: () => libraryService.getResourceById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useTags() {
  return useQuery({ queryKey: libraryKeys.tags(), queryFn: libraryService.getTags, staleTime: 30_000 });
}

export function useCreateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateResourceInput) => libraryService.createResource(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: libraryKeys.all }),
  });
}

export function useUpdateResource(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateResourceInput) => libraryService.updateResource(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: libraryKeys.all }),
  });
}

export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => libraryService.deleteResource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: libraryKeys.all }),
  });
}

export function useRenameTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ oldLabel, newLabel }: { oldLabel: string; newLabel: string }) => libraryService.renameTag(oldLabel, newLabel),
    onSuccess: () => qc.invalidateQueries({ queryKey: libraryKeys.all }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (label: string) => libraryService.deleteTag(label),
    onSuccess: () => qc.invalidateQueries({ queryKey: libraryKeys.all }),
  });
}
