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
    billingMode: "recurring",
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
    billingMode: "recurring",
    recommended: true,
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
    billingMode: "recurring",
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
  { id: "total-subscribers", label: "TOTAL SUBSCRIBERS", value: 12842, changePercent: 4.2,  icon: "subscribers" },
  { id: "active-subs",       label: "ACTIVE SUBS",       value: 8921,  changePercent: 2.8,  icon: "active"      },
  { id: "free-plan",         label: "FREE PLAN",         value: 2410,  changePercent: -0.5, icon: "free"        },
  { id: "trial-users",       label: "TRIAL USERS",       value: 954,   changePercent: 12,   icon: "trial"       },
];
