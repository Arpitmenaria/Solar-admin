"use client";

import { PlanCard } from "@/components/plans/plan-card";
import { StatCardSkeleton } from "@/components/shared/loading-skeleton";
import type { Plan } from "@/types";

interface PlanListProps {
  plans: Plan[];
  isLoading?: boolean;
  onEdit?: (plan: Plan) => void;
  onDelete?: (plan: Plan) => void;
}

export function PlanList({ plans, isLoading, onEdit, onDelete }: PlanListProps) {
  if (isLoading) {
    return (
      <div className="flex gap-5 overflow-x-auto pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} className="h-64 w-[380px] shrink-0 md:w-[420px]" />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.10] bg-card/50 px-6 py-16 text-center">
        <p className="text-sm font-medium text-white">No plans configured yet</p>
        <p className="mt-1 text-xs text-caption">Use Add Plans to create your first subscription tier.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-5 overflow-x-auto pb-2">
      {plans.map((plan, index) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
