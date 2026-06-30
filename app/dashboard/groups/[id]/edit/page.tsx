"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { GroupForm, type GroupFormValues } from "@/components/groups/group-form";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useGroup, useUpdateGroup } from "@/hooks/use-groups";

export default function EditGroupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: group, isLoading } = useGroup(id);
  const updateGroup = useUpdateGroup(id);

  const handleSubmit = (values: GroupFormValues) => {
    updateGroup.mutate(
      {
        name: values.name,
        category: values.category,
        privacy: values.privacy,
        status: values.status,
        ownerName: values.ownerName,
        ownerAvatarUrl: values.ownerAvatarUrl,
      },
      {
        onSuccess: (updated) => {
          toast.success(`"${updated.name}" group updated.`);
          router.push("/dashboard/groups");
        },
        onError: () => toast.error("Couldn't update the group. Please try again."),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!group) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Group not found</div>;
  }

  return (
    <GroupForm
      defaultValues={group}
      submitLabel="Save Changes"
      showStatus
      onSubmit={handleSubmit}
      isSubmitting={updateGroup.isPending}
    />
  );
}
