"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { plansService, type CreatePlanInput, type UpdatePlanInput } from "@/services/plans.service";

export const planKeys = {
  all: ["plans"] as const,
  list: () => ["plans", "list"] as const,
  metrics: () => ["plans", "metrics"] as const,
  detail: (id: string) => ["plans", "detail", id] as const,
};

export function usePlans() {
  return useQuery({
    queryKey: planKeys.list(),
    queryFn: plansService.getPlans,
    staleTime: 60_000,
  });
}

export function usePlanMetrics() {
  return useQuery({
    queryKey: planKeys.metrics(),
    queryFn: plansService.getPlanMetrics,
    staleTime: 60_000,
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: planKeys.detail(id),
    queryFn: () => plansService.getPlanById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlanInput) => plansService.createPlan(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: planKeys.all }),
  });
}

export function useUpdatePlan(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePlanInput) => plansService.updatePlan(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: planKeys.all }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansService.deletePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: planKeys.all }),
  });
}
