import type { PlanMetric } from "@/types";

// No metrics endpoint exists yet — placeholder until the backend exposes one.
export const MOCK_PLAN_METRICS: PlanMetric[] = [
  {
    id: "total-subscribers",
    label: "TOTAL SUBSCRIBERS",
    value: 12842,
    icon: "subscribers",
    breakdown: { weekly: 412, monthly: 1840, quarterly: 4920, yearly: 12842 },
  },
  {
    id: "free-trial-subscribers",
    label: "FREE TRIAL SUBSCRIBERS",
    value: 954,
    icon: "trial",
    breakdown: { weekly: 88, monthly: 320, quarterly: 640, yearly: 954 },
  },
  {
    id: "gold-tier-subscribers",
    label: "GOLD TIER SUBSCRIBERS",
    value: 6512,
    icon: "gold",
    breakdown: { weekly: 210, monthly: 940, quarterly: 2510, yearly: 6512 },
  },
  {
    id: "premium-tier-subscribers",
    label: "PREMIUM TIER SUBSCRIBERS",
    value: 2410,
    icon: "premium",
    breakdown: { weekly: 96, monthly: 380, quarterly: 980, yearly: 2410 },
  },
];
