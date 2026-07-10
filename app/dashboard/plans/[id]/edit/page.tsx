"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlanForm } from "@/components/plans/plan-form";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { usePlan, useUpdatePlan } from "@/hooks/use-plans";
import type { CreatePlanInput } from "@/services/plans.service";

export default function EditPlanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: plan, isLoading } = usePlan(id);
  const updatePlan = useUpdatePlan(id);

  const handleSubmit = (input: CreatePlanInput) => {
    updatePlan.mutate(input, {
      onSuccess: (updated) => {
        toast.success(`${updated.tier} plan updated.`);
        router.push("/dashboard/plans");
      },
      onError: (err) => toast.error(err.message || "Couldn't update the plan. Please try again."),
    });
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

      {isLoading ? (
        <div className="flex-1 space-y-5 p-4 md:p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : !plan ? (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">Plan not found</div>
      ) : (
        <PlanForm
          defaultValues={plan}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          isSubmitting={updatePlan.isPending}
        />
      )}
    </div>
  );
}
