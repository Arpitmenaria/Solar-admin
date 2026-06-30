import type { Plan, PlanMetric } from "@/types";
import { MOCK_PLANS, MOCK_PLAN_METRICS } from "@/constants/plans";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "plan";
}

export type CreatePlanInput = Omit<Plan, "id" | "sortOrder">;
export type UpdatePlanInput = Partial<CreatePlanInput>;

export const plansService = {
  async getPlans(): Promise<Plan[]> {
    await delay(250);
    return MOCK_PLANS.map((p) => ({ ...p })).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async getPlanMetrics(): Promise<PlanMetric[]> {
    await delay(200);
    return MOCK_PLAN_METRICS;
  },

  async getPlanById(id: string): Promise<Plan | null> {
    await delay(200);
    const plan = MOCK_PLANS.find((p) => p.id === id);
    return plan ? { ...plan } : null;
  },

  async createPlan(input: CreatePlanInput): Promise<Plan> {
    await delay(400);
    const sortOrder = MOCK_PLANS.reduce((max, p) => Math.max(max, p.sortOrder), 0) + 1;
    const plan: Plan = { ...input, id: `plan-${slugify(input.name)}-${Date.now().toString(36)}`, sortOrder };
    MOCK_PLANS.push(plan);
    return { ...plan };
  },

  async updatePlan(id: string, input: UpdatePlanInput): Promise<Plan> {
    await delay(400);
    const plan = MOCK_PLANS.find((p) => p.id === id);
    if (!plan) throw new Error("Plan not found");
    Object.assign(plan, input);
    return { ...plan };
  },

  async deletePlan(id: string): Promise<void> {
    await delay(300);
    const index = MOCK_PLANS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Plan not found");
    MOCK_PLANS.splice(index, 1);
  },
};
