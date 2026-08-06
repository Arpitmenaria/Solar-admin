"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ScrollText, RotateCcw, Eye, Check, X as XIcon, ArrowRight,
  ChevronFirst, ChevronLast, ChevronLeft, ChevronRight,
} from "lucide-react";

import { CustomSelect } from "@/components/shared/custom-select";
import { DatePicker } from "@/components/shared/date-picker";
import { UserAvatar } from "@/components/shared/user-avatar";
import { TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { PaginationButton } from "@/components/shared/pagination-button";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import { AUDIT_ACTION_LABELS, auditActionLabel } from "@/services/audit-logs.service";
import { formatNumberFull, na, cn } from "@/lib/utils";
import type { AuditLog } from "@/types";
import { AuditLogDetailModal } from "@/components/audit/audit-log-detail-modal";

const LIMIT = 50;
const COLS = "grid-cols-[minmax(150px,1.3fr)_minmax(160px,1.4fr)_minmax(150px,1.4fr)_minmax(180px,1.8fr)_130px_120px_64px]";
const MIN_W = "min-w-[1080px]";

const TONE_CHIP: Record<string, string> = {
  red:     "border-red-500/40 bg-red-500/[0.12] text-red-300",
  amber:   "border-amber-500/40 bg-amber-500/[0.12] text-amber-300",
  emerald: "border-emerald-500/40 bg-emerald-500/[0.12] text-emerald-300",
  blue:    "border-blue-500/40 bg-blue-500/[0.12] text-blue-300",
};

function ActionChip({ action }: { action: string }) {
  const tone = AUDIT_ACTION_LABELS[action]?.tone ?? "blue";
  return (
    <span className={cn("inline-flex w-fit items-center rounded-md border px-2 py-[3px] text-[10px] font-bold uppercase tracking-wide", TONE_CHIP[tone])}>
      {auditActionLabel(action)}
    </span>
  );
}

function NotifFlag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[10px]", ok ? "text-emerald-300" : "text-caption")}>
      {ok ? <Check size={10} /> : <XIcon size={10} />} {label}
    </span>
  );
}

function fmtDateTime(ts: string): string {
  if (!ts) return "NA";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "NA";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  ...Object.entries(AUDIT_ACTION_LABELS).map(([value, { label }]) => ({ value, label })),
];

function AuditLogsInner() {
  const searchParams = useSearchParams();
  // Deep-link from a user detail page: /dashboard/audit-logs?targetId=<userId>
  const targetId = searchParams.get("targetId") ?? "";

  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading } = useAuditLogs({ action, startDate, endDate, targetId, page, limit: LIMIT });
  const logs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const resetFilters = () => { setAction(""); setStartDate(""); setEndDate(""); setPage(1); };
  const change = (fn: () => void) => { fn(); setPage(1); };

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every moderation action taken by an admin — who, what, why, and when.
          </p>
        </motion.div>

        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-card">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <CustomSelect
              size="sm"
              value={action}
              onChange={(v) => change(() => setAction(v))}
              options={ACTION_OPTIONS}
            />
            <DatePicker size="sm" value={startDate} onChange={(v) => change(() => setStartDate(v))} placeholder="From" />
            <DatePicker size="sm" value={endDate} onChange={(v) => change(() => setEndDate(v))} placeholder="To" />
            <button onClick={resetFilters} className="flex items-center gap-1 text-[11px] font-medium text-[#99CBFF] transition-colors hover:text-white">
              <RotateCcw size={12} /> Reset
            </button>
            {targetId && (
              <span className="ml-auto rounded-full border border-blue-500/30 bg-blue-500/[0.1] px-2.5 py-1 text-[10px] font-semibold text-blue-300">
                Filtered to one user
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto border-t border-white/[0.06]">
            <div className={cn("grid gap-4 border-b border-white/[0.05] bg-white/[0.025] px-6 py-3", COLS, MIN_W)}>
              {["ACTION", "ADMIN", "TARGET", "REASON", "STATUS", "NOTIFIED", ""].map((h, i) => (
                <span key={i} className={cn("text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400", i === 6 && "text-center")}>{h}</span>
              ))}
            </div>

            {isLoading ? (
              <div className="px-6">{Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
            ) : (
              <div className={MIN_W}>
                {logs.map((log: AuditLog, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn("grid items-center gap-4 border-b border-white/[0.04] px-6 py-3.5 transition-colors hover:bg-white/[0.02]", COLS)}
                  >
                    <div className="flex flex-col gap-1">
                      <ActionChip action={log.action} />
                      <span className="text-[10px] text-caption">{fmtDateTime(log.createdAt)}</span>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                      <UserAvatar name={log.adminName} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-slate-200">{na(log.adminName)}</p>
                        <p className="truncate text-[10px] text-caption">{log.adminEmail}</p>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[12px] text-slate-200">{na(log.targetAuthorName)}</p>
                      <p className="truncate text-[10px] text-caption capitalize">{log.targetType}</p>
                    </div>

                    <p className="truncate text-[12px] text-slate-300" title={log.reason}>{na(log.reason)}</p>

                    <div className="flex items-center gap-1 text-[11px]">
                      {log.statusBefore || log.statusAfter ? (
                        <>
                          <span className="text-caption">{log.statusBefore || "—"}</span>
                          <ArrowRight size={10} className="text-caption" />
                          <span className="text-slate-200">{log.statusAfter || "—"}</span>
                        </>
                      ) : <span className="text-caption">—</span>}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <NotifFlag ok={log.userNotified} label="User" />
                      <NotifFlag ok={log.emailSent} label="Email" />
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => setDetailId(log.id)}
                        aria-label="View details"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-caption transition-colors hover:bg-white/[0.08] hover:text-white"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {logs.length === 0 && (
                  <div className="py-14 text-center">
                    <ScrollText size={22} className="mx-auto mb-2 text-caption/60" />
                    <p className="text-sm text-caption">No admin actions match these filters.</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-[11px] text-caption">
                {data && data.total > 0
                  ? `${formatNumberFull((page - 1) * LIMIT + 1)}–${formatNumberFull(Math.min(page * LIMIT, data.total))} of ${formatNumberFull(data.total)} actions`
                  : "No actions logged"}
              </p>
              <div className="flex items-center gap-0.5">
                <PaginationButton label="First page"    icon={<ChevronFirst size={13} />} onClick={() => setPage(1)}                     disabled={page === 1} />
                <PaginationButton label="Previous page" icon={<ChevronLeft size={13} />}  onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} />
                <span className="h-7 min-w-7 rounded-full bg-blue-600 px-2 text-center text-xs font-medium leading-7 text-white">{page}</span>
                <span className="px-2 text-[11px] text-caption">of {formatNumberFull(totalPages)}</span>
                <PaginationButton label="Next page" icon={<ChevronRight size={13} />} onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} />
                <PaginationButton label="Last page"  icon={<ChevronLast size={13} />}  onClick={() => setPage(totalPages)}                     disabled={page >= totalPages} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuditLogDetailModal logId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <Suspense fallback={null}>
      <AuditLogsInner />
    </Suspense>
  );
}
