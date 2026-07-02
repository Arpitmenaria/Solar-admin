"use client";

import { toast } from "sonner";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDeleteResource, useUpdateResource } from "@/hooks/use-library";

export type ResourceAction = "PUBLISH" | "UNPUBLISH" | "DELETE";

export interface PendingResourceAction {
  action: ResourceAction;
  resourceId: string;
  resourceName: string;
}

const COPY: Record<ResourceAction, { title: string; description: (name: string) => string; confirmLabel: string; variant: "default" | "destructive"; toastMessage: (name: string) => string }> = {
  PUBLISH: {
    title: "Publish this resource?",
    description: (name) => `"${name}" will become visible in the library immediately.`,
    confirmLabel: "Publish Resource",
    variant: "default",
    toastMessage: (name) => `"${name}" published.`,
  },
  UNPUBLISH: {
    title: "Unpublish this resource?",
    description: (name) => `"${name}" will move back to Draft and be hidden from the library.`,
    confirmLabel: "Move to Draft",
    variant: "destructive",
    toastMessage: (name) => `"${name}" moved to Draft.`,
  },
  DELETE: {
    title: "Delete this resource?",
    description: (name) => `This permanently removes "${name}" and cannot be undone.`,
    confirmLabel: "Delete Resource",
    variant: "destructive",
    toastMessage: (name) => `"${name}" deleted.`,
  },
};

interface ResourceActionDialogProps {
  pending: PendingResourceAction | null;
  onClose: () => void;
  onSuccess?: (action: ResourceAction) => void;
}

export function ResourceActionDialog({ pending, onClose, onSuccess }: ResourceActionDialogProps) {
  const updateResource = useUpdateResource(pending?.resourceId ?? "");
  const deleteResource = useDeleteResource();
  const copy = pending ? COPY[pending.action] : null;

  const handleConfirm = () => {
    if (!pending || !copy) return;
    const { action, resourceId, resourceName } = pending;

    if (action === "DELETE") {
      deleteResource.mutate(resourceId, {
        onSuccess: () => { toast.success(copy.toastMessage(resourceName)); onSuccess?.(action); },
        onError: () => toast.error("Something went wrong. Please try again."),
      });
    } else {
      updateResource.mutate(
        { status: action === "PUBLISH" ? "PUBLISHED" : "DRAFT" },
        {
          onSuccess: () => { toast.success(copy.toastMessage(resourceName)); onSuccess?.(action); },
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
            {pending && copy ? copy.description(pending.resourceName) : ""}
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
