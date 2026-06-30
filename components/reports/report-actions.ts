import { ShieldCheck, CheckCircle2, Ban, type LucideIcon } from "lucide-react";
import type { ReportStatus } from "@/types";

export type ReportAction = "REVIEW" | "RESOLVE" | "DISMISS";

export const ACTION_TO_STATUS: Record<ReportAction, ReportStatus> = {
  REVIEW: "REVIEWED",
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
  REVIEW: {
    label: "Mark Reviewed",
    icon: ShieldCheck,
    tone: "neutral",
    confirmTitle: "Mark report as reviewed?",
    confirmDescription: (name) => `This marks the report against "${name}" as reviewed and under investigation.`,
    toastMessage: (name) => `Report against "${name}" marked as reviewed.`,
  },
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
};

/** Which actions remain valid given the report's current status. */
export function availableActions(status: ReportStatus): ReportAction[] {
  const actions: ReportAction[] = [];
  if (status !== "REVIEWED" && status !== "RESOLVED") actions.push("REVIEW");
  if (status !== "RESOLVED") actions.push("RESOLVE");
  if (status !== "DISMISSED") actions.push("DISMISS");
  return actions;
}

export const STATUS_STYLES: Record<ReportStatus, { dot: string; text: string; label: string }> = {
  PENDING:   { dot: "bg-yellow-400",  text: "text-yellow-400",  label: "Pending"   },
  REVIEWED:  { dot: "bg-blue-400",    text: "text-blue-400",    label: "Reviewed"  },
  RESOLVED:  { dot: "bg-emerald-400", text: "text-emerald-400", label: "Resolved"  },
  DISMISSED: { dot: "bg-slate-400",   text: "text-slate-400",   label: "Dismissed" },
};
