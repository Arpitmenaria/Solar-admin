"use client";

import { toast } from "sonner";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ActionReasonDialog } from "@/components/shared/action-reason-dialog";
import { useDeleteEvent, useUpdateEvent } from "@/hooks/use-events";

/** Admins cannot cancel events (no product surface for it) — REINSTATE only ever applies to events a host already cancelled. */
export type EventAction = "REINSTATE" | "DELETE";

export interface PendingEventAction {
  action: EventAction;
  eventId: string;
  eventName: string;
}

const COPY: Record<EventAction, { title: string; description: (name: string) => string; confirmLabel: string; variant: "default" | "destructive"; toastMessage: (name: string) => string }> = {
  REINSTATE: {
    title: "Reinstate this event?",
    description: (name) => `This restores "${name}" to upcoming and notifies attendees.`,
    confirmLabel: "Reinstate Event",
    variant: "default",
    toastMessage: (name) => `"${name}" event reinstated.`,
  },
  DELETE: {
    title: "Delete this event?",
    description: (name) => `This permanently removes "${name}" and cannot be undone.`,
    confirmLabel: "Delete Event",
    variant: "destructive",
    toastMessage: (name) => `"${name}" event deleted.`,
  },
};

interface EventActionDialogProps {
  pending: PendingEventAction | null;
  onClose: () => void;
  /** Called after a successful mutation — use to navigate away from a detail screen, for example. */
  onSuccess?: (action: EventAction) => void;
}

export function EventActionDialog({ pending, onClose, onSuccess }: EventActionDialogProps) {
  const updateEvent = useUpdateEvent(pending?.eventId ?? "");
  const deleteEvent = useDeleteEvent();
  const copy = pending ? COPY[pending.action] : null;
  const isDelete = pending?.action === "DELETE";

  const handleDeleteConfirm = ({ reason, notes }: { reason: string; notes: string }) => {
    if (!pending || !copy) return;
    const { eventId, eventName } = pending;
    deleteEvent.mutate(
      { id: eventId, reason, notes },
      {
        onSuccess: () => { toast.success(copy.toastMessage(eventName)); onSuccess?.("DELETE"); },
        onError: () => toast.error("Something went wrong. Please try again."),
      }
    );
    onClose();
  };

  const handleStatusConfirm = () => {
    if (!pending || !copy || pending.action === "DELETE") return;
    const { action, eventName } = pending;
    updateEvent.mutate(
      { status: "UPCOMING" },
      {
        onSuccess: () => { toast.success(copy.toastMessage(eventName)); onSuccess?.(action); },
        onError: () => toast.error("Something went wrong. Please try again."),
      }
    );
    onClose();
  };

  if (isDelete) {
    return (
      <ActionReasonDialog
        open={!!pending}
        title={copy?.title ?? ""}
        description={pending && copy ? copy.description(pending.eventName) : ""}
        confirmLabel={copy?.confirmLabel ?? "Confirm"}
        variant={copy?.variant ?? "default"}
        pending={deleteEvent.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={onClose}
      />
    );
  }

  return (
    <AlertDialog open={!!pending} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy?.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {pending && copy ? copy.description(pending.eventName) : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={copy?.variant ?? "default"} onClick={handleStatusConfirm}>
            {copy?.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
