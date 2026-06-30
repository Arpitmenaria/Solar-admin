"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GroupForm, type GroupFormValues } from "@/components/groups/group-form";
import { useCreateGroup } from "@/hooks/use-groups";

export default function CreateGroupPage() {
  const router = useRouter();
  const createGroup = useCreateGroup();

  const handleSubmit = (values: GroupFormValues) => {
    createGroup.mutate(
      {
        name: values.name,
        category: values.category,
        privacy: values.privacy,
        ownerName: values.ownerName,
        ownerAvatarUrl: values.ownerAvatarUrl || undefined,
      },
      {
        onSuccess: (group) => {
          toast.success(`"${group.name}" group created.`);
          router.push("/dashboard/groups");
        },
        onError: () => toast.error("Couldn't create the group. Please try again."),
      }
    );
  };

  return <GroupForm submitLabel="Create Group" onSubmit={handleSubmit} isSubmitting={createGroup.isPending} />;
}
