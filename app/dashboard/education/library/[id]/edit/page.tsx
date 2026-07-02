"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ResourceForm, type ResourceFormValues } from "@/components/education/resource-form";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useResource, useUpdateResource } from "@/hooks/use-library";

export default function EditResourcePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: resource, isLoading } = useResource(id);
  const updateResource = useUpdateResource(id);

  const handleSubmit = (values: ResourceFormValues) => {
    updateResource.mutate(values, {
      onSuccess: (updated) => {
        toast.success(`"${updated.title}" resource updated.`);
        router.push("/dashboard/education/library");
      },
      onError: () => toast.error("Couldn't update the resource. Please try again."),
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!resource) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Resource not found</div>;
  }

  return (
    <ResourceForm
      defaultValues={resource}
      submitLabel="Save Changes"
      showStatus
      onSubmit={handleSubmit}
      isSubmitting={updateResource.isPending}
    />
  );
}
