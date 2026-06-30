"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Search, Download, RotateCcw, Flag, Clock, CheckCircle2, XCircle,
  MoreVertical, Eye,
  ChevronFirst, ChevronLast, ChevronLeft, ChevronRight,
} from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { CustomSelect } from "@/components/shared/custom-select";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { PaginationButton } from "@/components/shared/pagination-button";
import { formatNumberFull, formatDate, cn } from "@/lib/utils";
import type { Report, ReportReason, ReportStats, ReportStatus } from "@/types";
import { ACTION_COPY, availableActions, STATUS_STYLES, type ReportAction } from "@/components/reports/report-actions";
import { ReportActionDialog, type PendingReportAction } from "@/components/reports/report-action-dialog";
import type { ReportKind } from "@/hooks/use-reports";

const TONE_TEXT_CLASS: Record<"neutral" | "positive" | "destructive", string> = {
  neutral:     "text-blue-400 hover:bg-[rgba(59,130,246,0.12)]",
  positive:    "text-emerald-400 hover:bg-[rgba(16,185,129,0.12)]",
  destructive: "text-red-400 hover:bg-[rgba(239,68,68,0.12)]",
};

const STATUS_TABS: { label: string; value: "ALL" | ReportStatus }[] = [
  { label: "All",       value: "ALL"       },
  { label: "Pending",   value: "PENDING"   },
  { label: "Reviewed",  value: "REVIEWED"  },
  { label: "Resolved",  value: "RESOLVED"  },
  { label: "Dismissed", value: "DISMISSED" },
];

const REASON_OPTS: ("ALL" | ReportReason)[] = [
  "ALL", "Spam", "Harassment", "Inappropriate Content", "Scam / Fraud", "Fake or Misleading", "Hate Speech", "Other",
];

/* ── ActionMenu (portal, fixed) ─────────────── */
function ActionMenu({
  report, detailHref, onAction,
}: {
  report: Report; detailHref: string; onAction: (action: ReportAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, right: 0 });
  const btnRef  = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const actions = availableActions(report.status);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="flex justify-center">
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label="Report actions"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
          open ? "bg-white/[0.12] text-white" : "text-caption hover:bg-white/[0.08] hover:text-white"
        )}
      >
        <MoreVertical size={15} />
      </button>

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.88, y: -8 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.88, y: -8 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "fixed", top: pos.top, right: pos.right, transformOrigin: "top right", zIndex: 40 }}
              className="w-52 overflow-hidden rounded-xl border border-white/[0.10] bg-[#0d1424] shadow-2xl shadow-black/70"
            >
              <Link
                href={detailHref}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.07)]"
              >
                <Eye size={14} /> View Details
              </Link>
              {actions.map((action) => {
                const copy = ACTION_COPY[action];
                const Icon = copy.icon;
                return (
                  <button
                    key={action}
                    onClick={() => { setOpen(false); onAction(action); }}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium transition-colors ${TONE_TEXT_CLASS[copy.tone]}`}
                  >
                    <Icon size={14} /> {copy.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

interface ReportsDirectoryProps {
  kind: ReportKind;
  basePath: string;
  pageTitle: string;
  pageSubtitle: string;
  targetColumnLabel: string;
  targetIcon: LucideIcon;
  reports?: Report[];
  stats?: ReportStats;
  isLoading: boolean;
}

export function ReportsDirectory({
  kind, basePath, pageTitle, pageSubtitle, targetColumnLabel, targetIcon: TargetIcon,
  reports, stats, isLoading,
}: ReportsDirectoryProps) {
  const [statusTab, setStatusTab] = useState<"ALL" | ReportStatus>("ALL");
  const [reason,    setReason]    = useState<"ALL" | ReportReason>("ALL");
  const [search,    setSearch]    = useState("");
  const [pendingAction, setPendingAction] = useState<PendingReportAction | null>(null);
  const [page,      setPage]      = useState(1);

  const resetFilters = () => {
    setStatusTab("ALL"); setReason("ALL"); setSearch(""); setPage(1);
  };

  const filtered = (reports ?? []).filter((r) => {
    if (statusTab !== "ALL" && r.status !== statusTab) return false;
    if (reason !== "ALL" && r.reason !== reason) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.target.name.toLowerCase().includes(q) && !r.reportedBy.username.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pageSubtitle}</p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="TOTAL REPORTS" value={formatNumberFull(stats?.total ?? 0)} icon={Flag} />
              <StatCard label="PENDING" value={formatNumberFull(stats?.pending ?? 0)} icon={Clock} sub="Needs review" />
              <StatCard label="RESOLVED" value={formatNumberFull(stats?.resolved ?? 0)} icon={CheckCircle2} badge="Actioned" />
              <StatCard label="DISMISSED" value={formatNumberFull(stats?.dismissed ?? 0)} icon={XCircle} dot />
            </>
          )}
        </div>

        {/* Directory card */}
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-card">
          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <div className="relative w-[220px] shrink-0 sm:w-[260px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4d6a]" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={`Search ${targetColumnLabel.toLowerCase()}s or reporters...`}
                aria-label="Search reports"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-[12px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-blue-500/40 focus:bg-white/[0.05] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setStatusTab(tab.value); setPage(1); }}
                  aria-pressed={statusTab === tab.value}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-widest transition-all",
                    statusTab === tab.value
                      ? "bg-blue-600 text-white"
                      : "border border-white/[0.12] text-caption hover:border-white/[0.22] hover:text-slate-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <CustomSelect
              size="sm"
              value={reason}
              onChange={(v) => { setReason(v as typeof reason); setPage(1); }}
              options={REASON_OPTS.map((r) => ({ value: r, label: r === "ALL" ? "All Reasons" : r }))}
            />

            <button onClick={resetFilters} className="flex items-center gap-1 text-[11px] font-medium text-[#99CBFF] transition-colors hover:text-white">
              <RotateCcw size={12} /> Reset
            </button>

            <button className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3.5 py-2 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06]">
              <Download size={12} />
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border-t border-white/[0.06]">
            <div className="grid min-w-[980px] grid-cols-[2fr_1.3fr_1.1fr_2fr_100px_120px_60px] gap-4 border-b border-white/[0.05] bg-white/[0.025] px-6 py-3">
              {[targetColumnLabel.toUpperCase(), "REPORTED BY", "REASON", "DESCRIPTION", "DATE", "STATUS", "ACTIONS"].map((label, i) => (
                <span key={label} className={cn("text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400", i === 6 && "text-center")}>
                  {label}
                </span>
              ))}
            </div>

            {isLoading ? (
              <div className="px-6">
                {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
              </div>
            ) : (
              <div className="min-w-[980px]">
                {filtered.map((report, i) => {
                  const st = STATUS_STYLES[report.status];
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-[2fr_1.3fr_1.1fr_2fr_100px_120px_60px] items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.05]">
                          <TargetIcon size={16} strokeWidth={1.8} className="text-stat-icon" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-white">{report.target.name}</p>
                          <p className="truncate text-[11px] text-caption">{report.target.meta}</p>
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center gap-2">
                        <UserAvatar src={report.reportedBy.avatarUrl} name={report.reportedBy.username} size="sm" />
                        <span className="truncate text-[12px] text-slate-200">{report.reportedBy.username}</span>
                      </div>

                      <span className="inline-flex w-fit items-center rounded border border-orange-500/30 px-2 py-[3px] text-[10px] font-semibold tracking-wide text-orange-300">
                        {report.reason}
                      </span>

                      <p className="truncate text-[12px] text-slate-300" title={report.description}>{report.description}</p>

                      <span className="text-[12px] text-caption">{formatDate(report.reportedAt)}</span>

                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        <span className={`text-[11px] font-semibold ${st.text}`}>{st.label}</span>
                      </div>

                      <ActionMenu
                        report={report}
                        detailHref={`${basePath}/${report.id}`}
                        onAction={(action) => setPendingAction({ action, reportId: report.id, targetName: report.target.name })}
                      />
                    </motion.div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="py-12 text-center text-sm text-caption">No reports match the current filters.</div>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-[11px] text-caption">Showing {filtered.length} of {formatNumberFull(stats?.total ?? filtered.length)} reports</p>
              <div className="flex items-center gap-0.5">
                <PaginationButton label="First page"    icon={<ChevronFirst size={13} />} onClick={() => setPage(1)}                    disabled={page === 1} />
                <PaginationButton label="Previous page" icon={<ChevronLeft size={13} />}  onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} />
                <span className="h-7 min-w-7 rounded-full bg-blue-600 px-2 text-center text-xs font-medium leading-7 text-white">{page}</span>
                <PaginationButton label="Next page" icon={<ChevronRight size={13} />} onClick={() => setPage(page + 1)} disabled={false} />
                <PaginationButton label="Last page"  icon={<ChevronLast size={13} />}  onClick={() => setPage(page)}     disabled={false} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ReportActionDialog kind={kind} pending={pendingAction} onClose={() => setPendingAction(null)} />
    </div>
  );
}
