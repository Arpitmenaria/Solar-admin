import type { Plan, PlanMetric } from "@/types";
import { MOCK_PLANS, MOCK_PLAN_METRICS } from "@/constants/plans";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const plansService = {
  async getPlans(): Promise<Plan[]> {
    await delay(250);
    return [...MOCK_PLANS].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async getPlanMetrics(): Promise<PlanMetric[]> {
    await delay(200);
    return MOCK_PLAN_METRICS;
  },
};
