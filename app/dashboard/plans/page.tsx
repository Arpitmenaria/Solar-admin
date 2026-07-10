// app/dashboard/plans/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlansHeader } from "@/components/plans/plans-header";
import { PlanList } from "@/components/plans/plan-list";
import { PlanTabs } from "@/components/plans/plan-tabs";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { usePlans, usePlanMetrics, useDeletePlan } from "@/hooks/use-plans";
import type { Plan, PlanTier } from "@/types";

function tierLabel(tier: PlanTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export default function PlansPage() {
  const router = useRouter();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const { data: metrics = [], isLoading: metricsLoading } = usePlanMetrics();
  const [activeTier, setActiveTier] = useState<PlanTier>("gold");
  const [pendingDelete, setPendingDelete] = useState<Plan | null>(null);
  const deletePlan = useDeletePlan();
  const filteredPlans = plans.filter((p) => p.tier === activeTier);

  const handleAddPlan = () => {
    router.push("/dashboard/plans/create");
  };

  const handleEditPlan = (plan: Plan) => {
    router.push(`/dashboard/plans/${plan.id}/edit`);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { id, tier } = pendingDelete;
    deletePlan.mutate(id, {
      onSuccess: () => toast.success(`${tierLabel(tier)} plan deleted.`),
      onError: (err) => toast.error(err.message || "Couldn't delete the plan. Please try again."),
    });
    setPendingDelete(null);
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
          isLoading={plansLoading}
          onEdit={handleEditPlan}
          onDelete={setPendingDelete}
        />
      </main>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && `This permanently removes the "${tierLabel(pendingDelete.tier)}" subscription tier. Subscribers already on this plan are not affected.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
