// components/plans/plan-tabs.tsx
"use client";

import { cn } from "@/lib/utils";

const TABS = [
  { value: "free", label: "Free Tier", recommended: false },
  { value: "gold", label: "Gold Tier", recommended: true },
  { value: "premium", label: "Premium Tier", recommended: false },
] as const;

export type PlanTier = (typeof TABS)[number]["value"];

interface PlanTabsProps {
  value: PlanTier;
  onChange: (tier: PlanTier) => void;
}

export function PlanTabs({ value, onChange }: PlanTabsProps) {
  return (
    <div className="relative border-b border-white/[0.08]">
      <div className="flex gap-8">
        {TABS.map((tab) => {
          const isActive = value === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={cn(
                "relative flex items-center gap-2 pb-3 text-xs font-semibold uppercase tracking-wider transition-colors",
                isActive ? "text-sky-400" : "text-caption hover:text-white"
              )}
            >
              {tab.recommended && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-sky-500/90 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white">
                  RECOMMENDED
                </span>
              )}
              {tab.label}
              {isActive && (
                <span className="absolute -bottom-px left-0 h-[2px] w-full bg-sky-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
