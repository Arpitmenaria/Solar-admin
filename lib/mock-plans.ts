// lib/mock-plans.ts
import type { Plan } from "@/types";

export const MOCK_PLANS: Plan[] = [
  {
    id: "free-1",
    tier: "free",
    name: "Free Starter",
    currency: "$",
    price: 0,
    amount: 0,
    billingPeriod: "month",
    features: [
      "Basic Node Support",
      "Standard API Access",
      "99% Uptime Guarantee",
      "Community Support",
    ],
  },
  {
    id: "gold-1",
    tier: "gold",
    name: "Gold Infrastructure",
    currency: "$",
    price: 49,
    amount: 49,
    billingPeriod: "month",
    recommended: true,
    features: [
      "Advanced Node Support",
      "Priority API Scaling",
      "99.9% Uptime Guarantee",
      "Dedicated Tech Account Manager",
    ],
  },
  {
    id: "premium-1",
    tier: "premium",
    name: "Premium Enterprise",
    currency: "$",
    price: 199,
    amount: 199,
    billingPeriod: "month",
    features: [
      "Unlimited Node Support",
      "Real-time API Scaling",
      "99.99% Uptime Guarantee",
      "24/7 Dedicated Engineering Team",
      "Custom SLA",
      "White-glove Onboarding",
    ],
  },
];