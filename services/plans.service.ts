import type { Plan, PlanMetric, PlanTier, PlanBillingType } from "@/types";
import { apiClient } from "@/services/api/client";

const TIER_ORDER: Record<PlanTier, number> = { free: 0, gold: 1, platinum: 2 };

// Backend metric ids match the icon vocabulary 1:1 except "total", which maps
// to the "subscribers" icon — everything else falls back to "subscribers" too
// rather than crashing if the backend ever adds a new metric id.
const METRIC_ICON_MAP: Record<string, PlanMetric["icon"]> = {
  total: "subscribers",
  trial: "trial",
  gold: "gold",
  premium: "premium",
};

interface ApiPlanMetric {
  id: string;
  label: string;
  value: number;
  breakdown: PlanMetric["breakdown"];
}

function mapApiPlanMetric(m: ApiPlanMetric): PlanMetric {
  return {
    id: m.id,
    label: m.label,
    value: m.value,
    icon: METRIC_ICON_MAP[m.id] ?? "subscribers",
    breakdown: m.breakdown,
  };
}

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
    const res = await apiClient.get<{ success: boolean; metrics: ApiPlanMetric[] }>("/api/admin/plans/metrics");
    return (res.metrics ?? []).map(mapApiPlanMetric);
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
