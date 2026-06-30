"use client";

import { useQuery } from "@tanstack/react-query";
import { plansService } from "@/services/plans.service";

export const planKeys = {
  all: ["plans"] as const,
  list: () => ["plans", "list"] as const,
  metrics: () => ["plans", "metrics"] as const,
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
