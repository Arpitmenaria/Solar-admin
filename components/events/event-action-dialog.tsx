"use client";

import { toast } from "sonner";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDeleteEvent, useUpdateEvent } from "@/hooks/use-events";

export type EventAction = "CANCEL" | "REINSTATE" | "DELETE";

export interface PendingEventAction {
  action: EventAction;
  eventId: string;
  eventName: string;
}

const COPY: Record<EventAction, { title: string; description: (name: string) => string; confirmLabel: string; variant: "default" | "destructive"; toastMessage: (name: string) => string }> = {
  CANCEL: {
    title: "Cancel this event?",
    description: (name) => `Attendees will be notified that "${name}" has been cancelled.`,
    confirmLabel: "Cancel Event",
    variant: "destructive",
    toastMessage: (name) => `"${name}" event cancelled.`,
  },
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

  const handleConfirm = () => {
    if (!pending || !copy) return;
    const { action, eventId, eventName } = pending;

    if (action === "DELETE") {
      deleteEvent.mutate(eventId, {
        onSuccess: () => { toast.success(copy.toastMessage(eventName)); onSuccess?.(action); },
        onError: () => toast.error("Something went wrong. Please try again."),
      });
    } else {
      updateEvent.mutate(
        { status: action === "CANCEL" ? "CANCELLED" : "UPCOMING" },
        {
          onSuccess: () => { toast.success(copy.toastMessage(eventName)); onSuccess?.(action); },
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
            {pending && copy ? copy.description(pending.eventName) : ""}
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
