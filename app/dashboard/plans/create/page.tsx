"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlanForm } from "@/components/plans/plan-form";
import { useCreatePlan } from "@/hooks/use-plans";
import type { CreatePlanInput } from "@/services/plans.service";

export default function CreatePlanPage() {
  const router = useRouter();
  const createPlan = useCreatePlan();

  const handleSubmit = (input: CreatePlanInput) => {
    createPlan.mutate(input, {
      onSuccess: (plan) => {
        toast.success(`"${plan.name}" plan created.`);
        router.push("/dashboard/plans");
      },
      onError: () => toast.error("Couldn't create the plan. Please try again."),
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
      <PlanForm
        submitLabel="Submit"
        onSubmit={handleSubmit}
        isSubmitting={createPlan.isPending}
      />
    </div>
  );
}
