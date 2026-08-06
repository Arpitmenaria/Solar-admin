"use client";

import { toast } from "sonner";
import { ActionReasonDialog } from "@/components/shared/action-reason-dialog";
import { useSuspendGroup, useUnsuspendGroup, useDeleteGroup } from "@/hooks/use-groups";

export type GroupAction = "SUSPEND" | "UNSUSPEND" | "DELETE";

export interface PendingGroupAction {
  action: GroupAction;
  groupId: string;
  groupName: string;
}

const COPY: Record<GroupAction, {
  title: string;
  description: (name: string) => string;
  confirmLabel: string;
  variant: "default" | "destructive";
  toastMessage: (name: string) => string;
}> = {
  SUSPEND: {
    title: "Suspend this group?",
    description: (name) => `Members will lose access to "${name}" until it's unsuspended.`,
    confirmLabel: "Suspend Group",
    variant: "destructive",
    toastMessage: (name) => `"${name}" group suspended.`,
  },
  UNSUSPEND: {
    title: "Unsuspend this group?",
    description: (name) => `This restores member access to "${name}".`,
    confirmLabel: "Unsuspend Group",
    variant: "default",
    toastMessage: (name) => `"${name}" group unsuspended.`,
  },
  DELETE: {
    title: "Delete this group?",
    description: (name) => `This permanently removes "${name}" and cannot be undone.`,
    confirmLabel: "Delete Group",
    variant: "destructive",
    toastMessage: (name) => `"${name}" group deleted.`,
  },
};

interface GroupActionDialogProps {
  pending: PendingGroupAction | null;
  onClose: () => void;
  /** Called after a successful mutation — e.g. to navigate away from a detail screen. */
  onSuccess?: (action: GroupAction) => void;
}

export function GroupActionDialog({ pending, onClose, onSuccess }: GroupActionDialogProps) {
  const suspendGroup = useSuspendGroup();
  const unsuspendGroup = useUnsuspendGroup();
  const deleteGroup = useDeleteGroup();
  const copy = pending ? COPY[pending.action] : null;

  const busy = suspendGroup.isPending || unsuspendGroup.isPending || deleteGroup.isPending;

  const handleConfirm = ({ reason, notes }: { reason: string; notes: string }) => {
    if (!pending || !copy) return;
    const { action, groupId, groupName } = pending;
    const mutation = action === "DELETE" ? deleteGroup : action === "SUSPEND" ? suspendGroup : unsuspendGroup;

    mutation.mutate(
      { id: groupId, reason, notes },
      {
        onSuccess: () => { toast.success(copy.toastMessage(groupName)); onSuccess?.(action); },
        onError: () => toast.error("Something went wrong. Please try again."),
      },
    );
    onClose();
  };

  return (
    <ActionReasonDialog
      open={!!pending}
      title={copy?.title ?? ""}
      description={pending && copy ? copy.description(pending.groupName) : ""}
      confirmLabel={copy?.confirmLabel ?? "Confirm"}
      variant={copy?.variant ?? "default"}
      pending={busy}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}
