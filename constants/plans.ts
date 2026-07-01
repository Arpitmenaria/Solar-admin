import type { Plan, PlanMetric } from "@/types";

export const MOCK_PLANS: Plan[] = [
  {
    id: "plan-free",
    name: "Free Infrastructure",
    description: "Get started with the essentials, no cost.",
    tier: "free",
    price: 0,
    currency: "$",
    billingPeriod: "/MONTH",
    sortOrder: 1,
    features: [
      "Basic Node Access",
      "Standard API Rate Limits",
      "Community Support",
      "Core Analytics Dashboard",
    ],
  },
  {
    id: "plan-gold",
    name: "Gold Infrastructure",
    description: "Priority scaling and support for growing teams.",
    tier: "gold",
    price: 49,
    currency: "$",
    billingPeriod: "/MONTH",
    sortOrder: 2,
    features: [
      "Advanced Node Support",
      "Priority API Scaling",
      "99.9% Uptime Guarantee",
      "Dedicated Tech Account Manager",
    ],
  },
  {
    id: "plan-premium",
    name: "Premium Infrastructure",
    description: "Enterprise-grade throughput, SLA, and white-glove support.",
    tier: "premium",
    price: 99,
    currency: "$",
    billingPeriod: "/MONTH",
    sortOrder: 3,
    features: [
      "Unlimited Node Provisioning",
      "Enterprise API Throughput",
      "99.99% Uptime SLA",
      "24/7 Priority Support",
      "Custom Integration Support",
    ],
  },
];

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
