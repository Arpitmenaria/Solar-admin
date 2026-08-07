import { CheckCircle2, Ban, Trash2, type LucideIcon } from "lucide-react";
import type { ReportStatus } from "@/types";
import type { ReportKind } from "@/hooks/use-reports";

export type ReportAction = "RESOLVE" | "DISMISS" | "DELETE";

/** Only RESOLVE/DISMISS are status transitions — DELETE removes the underlying event instead. */
export const ACTION_TO_STATUS: Record<"RESOLVE" | "DISMISS", ReportStatus> = {
  RESOLVE: "RESOLVED",
  DISMISS: "DISMISSED",
};

export interface ActionCopy {
  label: string;
  icon: LucideIcon;
  tone: "neutral" | "positive" | "destructive";
  confirmTitle: string;
  confirmDescription: (targetName: string) => string;
  toastMessage: (targetName: string) => string;
}

export const ACTION_COPY: Record<ReportAction, ActionCopy> = {
  RESOLVE: {
    label: "Resolve & Take Action",
    icon: CheckCircle2,
    tone: "positive",
    confirmTitle: "Resolve this report?",
    confirmDescription: (name) => `This resolves the report against "${name}" and records that moderation action was taken.`,
    toastMessage: (name) => `Report against "${name}" resolved.`,
  },
  DISMISS: {
    label: "Dismiss Report",
    icon: Ban,
    tone: "destructive",
    confirmTitle: "Dismiss this report?",
    confirmDescription: (name) => `This dismisses the report against "${name}" with no action taken.`,
    toastMessage: (name) => `Report against "${name}" dismissed.`,
  },
  DELETE: {
    label: "Delete Event",
    icon: Trash2,
    tone: "destructive",
    confirmTitle: "Delete this event?",
    confirmDescription: (name) => `This permanently removes "${name}" and cannot be undone.`,
    toastMessage: (name) => `"${name}" event deleted.`,
  },
};

/** Which actions remain valid given the report's current status and kind. */
export function availableActions(status: ReportStatus, kind: ReportKind): ReportAction[] {
  if (status !== "PENDING") return [];
  return kind === "event" ? ["DELETE", "DISMISS"] : ["RESOLVE", "DISMISS"];
}

export const STATUS_STYLES: Record<ReportStatus, { dot: string; text: string; label: string }> = {
  PENDING:   { dot: "bg-yellow-400",  text: "text-yellow-400",  label: "Pending"   },
  RESOLVED:  { dot: "bg-emerald-400", text: "text-emerald-400", label: "Resolved"  },
  DISMISSED: { dot: "bg-slate-400",   text: "text-slate-400",   label: "Dismissed" },
};
