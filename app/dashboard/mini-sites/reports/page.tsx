"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Flag, Clock, CheckCircle2, MoreVertical, Ban, RotateCcw, Trash2, Globe,
  Eye, ShieldCheck, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight,
} from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { PaginationButton } from "@/components/shared/pagination-button";
import { ActionReasonDialog } from "@/components/shared/action-reason-dialog";
import { useSiteReports, useSuspendSite, useUnsuspendSite, useDeleteSite, useDismissSiteReport } from "@/hooks/use-mini-sites";
import { formatNumberFull, formatDate, na, cn } from "@/lib/utils";
import type { SiteReport, SiteReportStatus } from "@/constants/mini-sites-mock-data";

const PAGE_SIZE = 8;
const COLS = "grid-cols-[minmax(200px,2fr)_minmax(140px,1.3fr)_140px_minmax(180px,1.8fr)_110px_110px_60px]";
const MIN_W = "min-w-[1080px]";

const STATUS_TABS: { label: string; value: SiteReportStatus | "ALL" }[] = [
  { label: "ALL",       value: "ALL"       },
  { label: "PENDING",   value: "PENDING"   },
  { label: "RESOLVED",  value: "RESOLVED"  },
  { label: "DISMISSED", value: "DISMISSED" },
];

const STATUS_STYLE: Record<SiteReportStatus, { label: string; dot: string; text: string }> = {
  PENDING:   { label: "Pending",   dot: "bg-amber-400",   text: "text-amber-300"   },
  RESOLVED:  { label: "Resolved",  dot: "bg-emerald-400", text: "text-emerald-300" },
  DISMISSED: { label: "Dismissed", dot: "bg-slate-400",   text: "text-slate-300"   },
};

type Pending =
  | { kind: "suspend" | "unsuspend" | "delete" | "dismiss"; report: SiteReport };

/* ── ActionMenu (portal, fixed) ── */
function ActionMenu({ report, onAction }: { report: SiteReport; onAction: (kind: Pending["kind"]) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const suspended = report.site.status === "SUSPENDED";
  const isPending = report.status === "PENDING";

  return (
    <div className="flex justify-center">
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label="Site actions"
        className={cn("flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
          open ? "bg-white/[0.12] text-white" : "text-caption hover:bg-white/[0.08] hover:text-white")}
      >
        <MoreVertical size={15} />
      </button>

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.88, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: -8 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "fixed", top: pos.top, right: pos.right, transformOrigin: "top right", zIndex: 40 }}
              className="w-48 overflow-hidden rounded-xl border border-white/[0.10] bg-[#0d1424] shadow-2xl shadow-black/70"
            >
              {/* Always available */}
              <Link
                href={`/dashboard/mini-sites/sites/${report.site.id}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.07)]"
              >
                <Eye size={14} /> View Details
              </Link>

              {/* Moderation actions only on pending reports */}
              {isPending && (
                <>
                  {suspended ? (
                    <button onClick={() => { setOpen(false); onAction("unsuspend"); }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-emerald-400 transition-colors hover:bg-[rgba(16,185,129,0.12)]">
                      <RotateCcw size={14} /> Unsuspend Site
                    </button>
                  ) : (
                    <button onClick={() => { setOpen(false); onAction("suspend"); }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-orange-400 transition-colors hover:bg-[rgba(249,115,22,0.12)]">
                      <Ban size={14} /> Suspend Site
                    </button>
                  )}
                  <button onClick={() => { setOpen(false); onAction("delete"); }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-red-400 transition-colors hover:bg-[rgba(239,68,68,0.12)]">
                    <Trash2 size={14} /> Delete Site
                  </button>
                  <button onClick={() => { setOpen(false); onAction("dismiss"); }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-slate-300 transition-colors hover:bg-[rgba(255,255,255,0.07)]">
                    <ShieldCheck size={14} /> Dismiss Report
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

export default function SiteReportsPage() {
  const { data, isLoading } = useSiteReports("ALL");
  const reports = data?.data ?? [];
  const stats = data?.stats;
  const statsLoading = isLoading;

  const suspendSite = useSuspendSite();
  const unsuspendSite = useUnsuspendSite();
  const deleteSite = useDeleteSite();
  const dismissReport = useDismissSiteReport();

  const [statusTab, setStatusTab] = useState<SiteReportStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<Pending | null>(null);

  const busy = suspendSite.isPending || unsuspendSite.isPending || deleteSite.isPending || dismissReport.isPending;

  const filtered = reports.filter((r) => statusTab === "ALL" || r.status === statusTab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const confirmAction = ({ reason, notes }: { reason: string; notes: string }) => {
    if (!pending) return;
    const { kind, report } = pending;
    const name = na(report.site.name);
    const id = report.site.id;

    if (kind === "delete") {
      deleteSite.mutate({ id, reason, notes }, {
        onSuccess: () => toast.success(`Site "${name}" deleted.`),
        onError: () => toast.error("Couldn't delete this site. Please try again."),
      });
    } else if (kind === "dismiss") {
      dismissReport.mutate(report.id, {
        onSuccess: () => toast.success(`Report on "${name}" dismissed.`),
        onError: () => toast.error("Couldn't dismiss this report. Please try again."),
      });
    } else if (kind === "suspend") {
      suspendSite.mutate({ id, reason, notes }, {
        onSuccess: () => toast.success(`Site "${name}" suspended.`),
        onError: () => toast.error("Couldn't suspend this site. Please try again."),
      });
    } else {
      unsuspendSite.mutate({ id, reason, notes }, {
        onSuccess: () => toast.success(`Site "${name}" reactivated.`),
        onError: () => toast.error("Couldn't reactivate this site. Please try again."),
      });
    }
    setPending(null);
  };

  const dialogCopy = () => {
    if (!pending) return { title: "", description: "", confirmLabel: "", variant: "default" as const };
    const name = na(pending.report.site.name);
    if (pending.kind === "delete") return { title: "Delete this site?", description: `Permanently removes "${name}" and resolves its reports.`, confirmLabel: "Delete Site", variant: "destructive" as const };
    if (pending.kind === "suspend") return { title: "Suspend this site?", description: `Takes "${name}" offline until it's unsuspended.`, confirmLabel: "Suspend Site", variant: "destructive" as const };
    if (pending.kind === "dismiss") return { title: "Dismiss this report?", description: `Keeps "${name}" as is and marks the report resolved — no action taken.`, confirmLabel: "Dismiss Report", variant: "default" as const };
    return { title: "Unsuspend this site?", description: `Restores public access to "${name}".`, confirmLabel: "Unsuspend Site", variant: "default" as const };
  };
  const copy = dialogCopy();

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Reported Sites</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review reported mini sites, then suspend or remove them.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="TOTAL REPORTS" value={formatNumberFull(stats?.total ?? 0)}    icon={Flag} />
              <StatCard label="PENDING"       value={formatNumberFull(stats?.pending ?? 0)}  icon={Clock} sub="Needs review" />
              <StatCard label="RESOLVED"      value={formatNumberFull(stats?.resolved ?? 0)} icon={CheckCircle2} badge="Actioned" />
            </>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-1.5">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setStatusTab(tab.value); setPage(1); }}
                  aria-pressed={statusTab === tab.value}
                  className={cn("rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-widest transition-all",
                    statusTab === tab.value ? "bg-blue-600 text-white" : "border border-white/[0.12] text-caption hover:border-white/[0.22] hover:text-slate-300")}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border-t border-white/[0.06]">
            <div className={cn("grid gap-4 border-b border-white/[0.05] bg-white/[0.025] px-6 py-3", COLS, MIN_W)}>
              {["REPORTED SITE", "REPORTED BY", "REASON", "DESCRIPTION", "DATE", "STATUS", "ACTIONS"].map((h, i) => (
                <span key={h} className={cn("text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400", i === 6 && "text-center")}>{h}</span>
              ))}
            </div>

            {isLoading ? (
              <div className="px-6">{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
            ) : (
              <div className={MIN_W}>
                {paginated.map((report, i) => {
                  const st = STATUS_STYLE[report.status];
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn("grid items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors hover:bg-white/[0.02]", COLS)}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.05]">
                          <Globe size={16} strokeWidth={1.8} className="text-stat-icon" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-white">{na(report.site.name)}</p>
                          <p className="truncate text-[11px] text-caption">by {na(report.site.creator)}</p>
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center gap-2">
                        <UserAvatar src={report.reportedBy.avatarUrl} name={report.reportedBy.username} size="sm" />
                        <span className="truncate text-[12px] text-slate-200">{na(report.reportedBy.username)}</span>
                      </div>

                      <span className="inline-flex w-fit items-center rounded border border-orange-500/30 px-2 py-[3px] text-[10px] font-semibold tracking-wide text-orange-300">
                        {report.reason}
                      </span>

                      <p className="truncate text-[12px] text-slate-300" title={report.description}>{report.description}</p>

                      <span className="text-[12px] text-caption">{formatDate(report.reportedAt)}</span>

                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
                        <span className={cn("text-[11px] font-semibold", st.text)}>{st.label}</span>
                      </div>

                      <ActionMenu report={report} onAction={(kind) => setPending({ kind, report })} />
                    </motion.div>
                  );
                })}

                {paginated.length === 0 && (
                  <div className="py-14 text-center text-sm text-caption">No reported sites match this filter.</div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-[11px] text-caption">
                {filtered.length > 0
                  ? `Showing ${formatNumberFull((safePage - 1) * PAGE_SIZE + 1)}–${formatNumberFull(Math.min(safePage * PAGE_SIZE, filtered.length))} of ${formatNumberFull(filtered.length)} reports`
                  : "No reports"}
              </p>
              <div className="flex items-center gap-0.5">
                <PaginationButton label="First page"    icon={<ChevronFirst size={13} />} onClick={() => setPage(1)}                        disabled={safePage === 1} />
                <PaginationButton label="Previous page" icon={<ChevronLeft size={13} />}  onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage === 1} />
                <span className="h-7 min-w-7 rounded-full bg-blue-600 px-2 text-center text-xs font-medium leading-7 text-white">{safePage}</span>
                <span className="px-2 text-[11px] text-caption">of {formatNumberFull(totalPages)}</span>
                <PaginationButton label="Next page" icon={<ChevronRight size={13} />} onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage >= totalPages} />
                <PaginationButton label="Last page"  icon={<ChevronLast size={13} />}  onClick={() => setPage(totalPages)}                        disabled={safePage >= totalPages} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ActionReasonDialog
        open={!!pending}
        title={copy.title}
        description={copy.description}
        confirmLabel={copy.confirmLabel}
        variant={copy.variant}
        pending={busy}
        onConfirm={confirmAction}
        onClose={() => setPending(null)}
      />
    </div>
  );
}
