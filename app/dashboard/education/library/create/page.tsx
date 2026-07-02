"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ResourceForm, type ResourceFormValues } from "@/components/education/resource-form";
import { useCreateResource } from "@/hooks/use-library";

export default function CreateResourcePage() {
  const router = useRouter();
  const createResource = useCreateResource();

  function handleSubmit(values: ResourceFormValues) {
    createResource.mutate(values, {
      onSuccess: () => {
        toast.success(`"${values.title}" created.`);
        router.push("/dashboard/education/library");
      },
      onError: () => toast.error("Something went wrong. Please try again."),
    });
  }

  return <ResourceForm submitLabel="Create Resource" onSubmit={handleSubmit} isSubmitting={createResource.isPending} />;
}
