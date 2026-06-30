"use client";

import { useRouter } from "next/navigation";
import { PlansHeader } from "@/components/plans/plans-header";
import { PlanList } from "@/components/plans/plan-list";
import { usePlans, usePlanMetrics } from "@/hooks/use-plans";
import type { Plan } from "@/types";

export default function PlansPage() {
  const router = useRouter();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const { data: metrics = [], isLoading: metricsLoading } = usePlanMetrics();

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
      {/* Subtle grid background */}
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

        <PlanList
          plans={plans}
          isLoading={plansLoading}
          onEdit={handleEditPlan}
          onDelete={handleDeletePlan}
        />
      </main>
    </div>
  );
}
