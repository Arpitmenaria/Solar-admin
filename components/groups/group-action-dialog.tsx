"use client";

import { toast } from "sonner";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDeleteGroup, useUpdateGroup } from "@/hooks/use-groups";

export type GroupAction = "SUSPEND" | "UNSUSPEND" | "DELETE";

export interface PendingGroupAction {
  action: GroupAction;
  groupId: string;
  groupName: string;
}

const COPY: Record<GroupAction, { title: string; description: (name: string) => string; confirmLabel: string; variant: "default" | "destructive"; toastMessage: (name: string) => string }> = {
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
  /** Called after a successful mutation — use to navigate away from a detail screen, for example. */
  onSuccess?: (action: GroupAction) => void;
}

export function GroupActionDialog({ pending, onClose, onSuccess }: GroupActionDialogProps) {
  const updateGroup = useUpdateGroup(pending?.groupId ?? "");
  const deleteGroup = useDeleteGroup();
  const copy = pending ? COPY[pending.action] : null;

  const handleConfirm = () => {
    if (!pending || !copy) return;
    const { action, groupId, groupName } = pending;

    if (action === "DELETE") {
      deleteGroup.mutate(groupId, {
        onSuccess: () => { toast.success(copy.toastMessage(groupName)); onSuccess?.(action); },
        onError: () => toast.error("Something went wrong. Please try again."),
      });
    } else {
      updateGroup.mutate(
        { status: action === "SUSPEND" ? "SUSPENDED" : "ACTIVE" },
        {
          onSuccess: () => { toast.success(copy.toastMessage(groupName)); onSuccess?.(action); },
          onError: () => toast.error("Something went wrong. Please try again."),
        }
      );
    }
    onClose();
  };

  return (
    <AlertDialog open={!!pending} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy?.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {pending && copy ? copy.description(pending.groupName) : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={copy?.variant ?? "default"} onClick={handleConfirm}>
            {copy?.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
