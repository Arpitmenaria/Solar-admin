"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { MessageSquareWarning, Calendar } from "lucide-react";

import { BackButton } from "@/components/shared/back-button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Report } from "@/types";
import type { ReportKind } from "@/hooks/use-reports";
import { ACTION_COPY, availableActions, STATUS_STYLES } from "@/components/reports/report-actions";
import { ReportActionDialog, type PendingReportAction } from "@/components/reports/report-action-dialog";

interface ReportDetailProps {
  kind: ReportKind;
  basePath: string;
  targetLabel: string;
  targetIcon: LucideIcon;
  report?: Report | null;
  isLoading: boolean;
}

export function ReportDetail({
  kind, basePath, targetLabel, targetIcon: TargetIcon, report, isLoading,
}: ReportDetailProps) {
  const [pendingAction, setPendingAction] = useState<PendingReportAction | null>(null);

  if (isLoading) return <ReportDetailSkeleton />;

  if (!report) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center text-muted-foreground">Report not found</div>
      </div>
    );
  }

  const st = STATUS_STYLES[report.status];
  const actions = availableActions(report.status, kind);

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <BackButton href={basePath} />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{report.target.name}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] px-2.5 py-1 text-[11px] font-semibold">
              <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
              <span className={st.text}>{st.label}</span>
            </span>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="show"
        >
          {/* Left: target + reporter */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            className="flex flex-col gap-5"
          >
            <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4 md:p-6">
              <p className="text-label mb-3">{targetLabel.toUpperCase()} NAME</p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.05]">
                  <TargetIcon size={20} strokeWidth={1.8} className="text-stat-icon" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{report.target.name}</p>
                  <p className="truncate text-xs text-caption">{report.target.meta}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4 md:p-6">
              <p className="text-label mb-3">REPORTED BY</p>
              <div className="flex items-center gap-3">
                <UserAvatar name={report.reportedBy.username} src={report.reportedBy.avatarUrl} size="md" />
                <p className="text-sm font-semibold text-white">{report.reportedBy.username}</p>
              </div>
            </div>
          </motion.div>

          {/* Right: category, description, actions */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            className="flex flex-col gap-5"
          >
            <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4 md:p-6">
              <div className="mb-1 flex items-center gap-2">
                <MessageSquareWarning size={16} className="text-orange-400" />
                <h2 className="text-sm font-semibold text-white">Report Details</h2>
              </div>
              <div className="mb-4 flex items-center gap-2 text-xs text-caption">
                <Calendar size={13} />
                <span>Reported on {formatDate(report.reportedAt)}</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-label mb-1.5">CATEGORY</p>
                  <span className="inline-flex w-fit items-center rounded border border-orange-500/30 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-orange-300">
                    {report.category}
                  </span>
                </div>
                <div>
                  <p className="text-label mb-1.5">DESCRIPTION</p>
                  <p className="text-sm leading-relaxed text-slate-200">{report.description}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4 md:p-6">
              <h2 className="mb-4 text-sm font-semibold text-white">Take Action</h2>
              {actions.length === 0 ? (
                <p className="text-sm text-muted-foreground">This report has already been actioned — no further steps available.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {actions.map((action) => {
                    const copy = ACTION_COPY[action];
                    const Icon = copy.icon;
                    return (
                      <Button
                        key={action}
                        variant={copy.tone === "destructive" ? "destructive" : "default"}
                        className={copy.tone === "positive" ? "bg-emerald-600 text-white hover:bg-emerald-700" : undefined}
                        onClick={() => setPendingAction({ action, reportId: report.id, targetId: report.target.id, targetName: report.target.name })}
                      >
                        <Icon size={14} />
                        {copy.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>

      <ReportActionDialog kind={kind} pending={pendingAction} onClose={() => setPendingAction(null)} />
    </div>
  );
}

function ReportDetailSkeleton() {
  return (
    <div className="flex-1 space-y-5 p-4 md:p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]">
        <div className="space-y-5">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
