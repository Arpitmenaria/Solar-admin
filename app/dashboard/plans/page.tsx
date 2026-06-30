// app/dashboard/plans/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlansHeader } from "@/components/plans/plans-header";
import { PlanList } from "@/components/plans/plan-list";
import { PlanTabs, type PlanTier } from "@/components/plans/plan-tabs";
import { usePlans, usePlanMetrics } from "@/hooks/use-plans";
import { MOCK_PLANS } from "@/lib/mock-plans";
import type { Plan } from "@/types";

const USE_MOCK_DATA = true; // flip to false once real API data is ready

export default function PlansPage() {
  const router = useRouter();
  const { data: fetchedPlans = [], isLoading: plansLoading } = usePlans();
  const { data: metrics = [], isLoading: metricsLoading } = usePlanMetrics();
  const [activeTier, setActiveTier] = useState<PlanTier>("gold");

  const plans = USE_MOCK_DATA ? MOCK_PLANS : fetchedPlans;
  const filteredPlans = plans.filter((plan) => plan.tier === activeTier);

  const handleAddPlan = () => {
    router.push("/dashboard/plans/create");
  };

  const handleEditPlan = (plan: Plan) => {
    router.push(`/dashboard/plans/${plan.id}/edit`);
  };

  const handleDeletePlan = (_plan: Plan) => {
    // Wire to delete confirmation + API mutation
  };

  return (
    <div className="relative flex flex-1 flex-col">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,179,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <main className="relative flex-1 space-y-6 p-4 md:p-6">
        <PlansHeader
          metrics={metrics}
          isLoading={metricsLoading}
          onAddPlan={handleAddPlan}
        />

        <PlanTabs value={activeTier} onChange={setActiveTier} />

        <PlanList
          plans={filteredPlans}
          isLoading={USE_MOCK_DATA ? false : plansLoading}
          onEdit={handleEditPlan}
          onDelete={handleDeletePlan}
        />
      </main>
    </div>
  );
}