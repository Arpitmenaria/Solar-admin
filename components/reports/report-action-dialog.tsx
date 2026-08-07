"use client";

import { toast } from "sonner";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ActionReasonDialog } from "@/components/shared/action-reason-dialog";
import { ACTION_COPY, ACTION_TO_STATUS, type ReportAction } from "@/components/reports/report-actions";
import { useUpdateReportStatus, type ReportKind } from "@/hooks/use-reports";
import { useDeleteEvent } from "@/hooks/use-events";

export interface PendingReportAction {
  action: ReportAction;
  reportId: string;
  targetId: string;
  targetName: string;
}

interface ReportActionDialogProps {
  kind: ReportKind;
  pending: PendingReportAction | null;
  onClose: () => void;
}

const TONE_VARIANT = {
  neutral: "default",
  positive: "default",
  destructive: "destructive",
} as const;

const TONE_CLASS: Record<string, string> = {
  positive: "bg-emerald-600 text-white hover:bg-emerald-700",
};

export function ReportActionDialog({ kind, pending, onClose }: ReportActionDialogProps) {
  const mutation = useUpdateReportStatus(kind);
  const deleteEvent = useDeleteEvent();
  const copy = pending ? ACTION_COPY[pending.action] : null;
  const isDelete = pending?.action === "DELETE";

  const handleDeleteConfirm = ({ reason, notes }: { reason: string; notes: string }) => {
    if (!pending || !copy) return;
    deleteEvent.mutate(
      { id: pending.targetId, reason, notes },
      {
        onSuccess: () => toast.success(copy.toastMessage(pending.targetName)),
        onError: () => toast.error("Something went wrong. Please try again."),
      }
    );
    onClose();
  };

  const handleStatusConfirm = () => {
    if (!pending || !copy || pending.action === "DELETE") return;
    mutation.mutate(
      { id: pending.reportId, status: ACTION_TO_STATUS[pending.action] },
      {
        onSuccess: () => toast.success(copy.toastMessage(pending.targetName)),
        onError: () => toast.error("Something went wrong. Please try again."),
      }
    );
    onClose();
  };

  if (isDelete) {
    return (
      <ActionReasonDialog
        open={!!pending}
        title={copy?.confirmTitle ?? ""}
        description={pending && copy ? copy.confirmDescription(pending.targetName) : ""}
        confirmLabel={copy?.label ?? "Confirm"}
        variant="destructive"
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
          <AlertDialogTitle>{copy?.confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {pending && copy ? copy.confirmDescription(pending.targetName) : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={copy ? TONE_VARIANT[copy.tone] : "default"}
            className={copy ? TONE_CLASS[copy.tone] : undefined}
            onClick={handleStatusConfirm}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
