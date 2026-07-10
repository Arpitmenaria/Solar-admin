import type { Plan, PlanMetric, PlanTier, PlanBillingType } from "@/types";
import { MOCK_PLAN_METRICS } from "@/constants/plans";
import { apiClient } from "@/services/api/client";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const TIER_ORDER: Record<PlanTier, number> = { free: 0, gold: 1, platinum: 2 };

interface ApiPlan {
  _id: string;
  type: string;
  tier: PlanTier;
  price: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapApiPlan(p: ApiPlan): Plan {
  return {
    id: p._id,
    tier: p.tier,
    type: p.type as PlanBillingType,
    price: p.price,
    // API entries can bundle multiple features into one newline-joined string
    features: p.features.flatMap((f) => f.split("\n")).map((f) => f.trim()).filter(Boolean),
    isActive: p.isActive,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export interface CreatePlanInput {
  tier: PlanTier;
  type: PlanBillingType;
  price: number;
  features: string[];
}
export type UpdatePlanInput = Partial<CreatePlanInput>;

export const plansService = {
  async getPlans(): Promise<Plan[]> {
    const res = await apiClient.get<{ success: boolean; plans: ApiPlan[] }>("/api/admin/plans");
    return res.plans.map(mapApiPlan).sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
  },

  async getPlanMetrics(): Promise<PlanMetric[]> {
    // No metrics endpoint yet — placeholder until the backend exposes one.
    await delay(200);
    return MOCK_PLAN_METRICS;
  },

  async getPlanById(id: string): Promise<Plan | null> {
    const plans = await this.getPlans();
    return plans.find((p) => p.id === id) ?? null;
  },

  async createPlan(input: CreatePlanInput): Promise<Plan> {
    const res = await apiClient.post<{ success: boolean; plan: ApiPlan }>("/api/admin/plans", input);
    return mapApiPlan(res.plan);
  },

  async updatePlan(id: string, input: UpdatePlanInput): Promise<Plan> {
    const res = await apiClient.put<{ success: boolean; plan: ApiPlan }>(`/api/admin/plans/${id}`, input);
    return mapApiPlan(res.plan);
  },

  async deletePlan(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/plans/${id}`);
  },
};
