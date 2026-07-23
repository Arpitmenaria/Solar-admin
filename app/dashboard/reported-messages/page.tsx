"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Flag, Clock, CheckCircle2, MoreVertical, Eye, Trash2, ShieldCheck,
  Users, MessageCircle, Search,
  ChevronFirst, ChevronLast, ChevronLeft, ChevronRight,
} from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { PaginationButton } from "@/components/shared/pagination-button";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useConversationReports, useDeleteConversation, useDismissConversationReports } from "@/hooks/use-message-reports";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatNumberFull, formatDate, na, cn } from "@/lib/utils";
import type { ConversationReportStatus, ConversationReportSummary } from "@/types";

const COLS = "grid-cols-[minmax(260px,2.2fr)_92px_minmax(160px,1.5fr)_minmax(150px,1.2fr)_105px_110px_60px]";
const MIN_W = "min-w-[1080px]";

const STATUS_TABS: { label: string; value: ConversationReportStatus | "ALL" }[] = [
  { label: "ALL",      value: "ALL"      },
  { label: "PENDING",  value: "PENDING"  },
  { label: "RESOLVED", value: "RESOLVED" },
];

const STATUS_STYLES: Record<ConversationReportStatus, { label: string; dot: string; text: string }> = {
  PENDING:  { label: "Pending",  dot: "bg-amber-400",   text: "text-amber-300"   },
  RESOLVED: { label: "Resolved", dot: "bg-emerald-400", text: "text-emerald-300" },
};

type PendingAction = { kind: "delete" | "dismiss"; conversation: ConversationReportSummary };

/* ── Unique reasons across this conversation's reporters ── */
function uniqueReasons(report: ConversationReportSummary): string[] {
  return Array.from(new Set(report.reporters.map((r) => r.reason).filter(Boolean)));
}

/* ── Report count — the queue's primary signal, so it scales with severity ── */
function ReportCount({ count }: { count: number }) {
  const tone =
    count >= 5 ? "border-red-500/40 bg-red-500/[0.14] text-red-300"
    : count >= 3 ? "border-amber-500/40 bg-amber-500/[0.14] text-amber-300"
    : "border-white/[0.12] bg-white/[0.05] text-slate-300";

  return (
    <span className={cn("inline-flex w-fit items-center gap-1 rounded-md border px-2 py-[3px] text-[11px] font-bold", tone)}>
      <Flag size={10} strokeWidth={2.4} />
      {formatNumberFull(count)}
    </span>
  );
}

/* ── Chat context badge — the field that tells admin "group or DM" ── */
function ChatBadge({ report }: { report: ConversationReportSummary }) {
  const Icon = report.chat.type === "group" ? Users : MessageCircle;
  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1 truncate rounded border px-1.5 py-[2px] text-[10px] font-semibold tracking-wide",
        report.chat.type === "group"
          ? "border-blue-500/30 text-blue-300"
          : "border-purple-500/30 text-purple-300"
      )}
    >
      <Icon size={9} strokeWidth={2.4} className="shrink-0" />
      {report.chat.type === "group" ? "Group Chat" : "Direct Message"}
    </span>
  );
}

/* ── Conversation cell: chat-type icon + name + badge + member count ── */
function ConversationCell({ report, onView }: { report: ConversationReportSummary; onView: () => void }) {
  const Icon = report.chat.type === "group" ? Users : MessageCircle;
  return (
    <button onClick={onView} className="flex min-w-0 items-center gap-3 text-left">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.05] transition-colors hover:border-blue-500/50">
        <Icon size={16} strokeWidth={1.8} className="text-stat-icon" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] text-slate-200" title={report.chat.name || undefined}>
          {na(report.chat.name)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <ChatBadge report={report} />
          {report.chat.type === "group" && report.memberCount != null && (
            <span className="text-[10px] text-caption">{formatNumberFull(report.memberCount)} members</span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ── Reporters: first name, plus an overflow count (merged across the conversation) ── */
function Reporters({ report }: { report: ConversationReportSummary }) {
  const [first, ...rest] = report.reporters;

  if (!first) {
    return <span className="text-[12px] text-caption">NA</span>;
  }

  return (
    <div
      className="flex min-w-0 items-center gap-2"
      title={report.reporters.map((r) => r.fullName).filter(Boolean).join(", ")}
    >
      <UserAvatar src={first.avatarUrl} name={first.fullName} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-[12px] text-slate-200">{na(first.fullName)}</p>
        {rest.length > 0 && (
          <p className="text-[10px] text-caption">+{rest.length} other{rest.length > 1 ? "s" : ""}</p>
        )}
      </div>
    </div>
  );
}

/* ── ActionMenu (portal, fixed) ─────────────── */
function ActionMenu({
  report, onView, onAction, pending,
}: {
  report: ConversationReportSummary;
  onView: () => void;
  onAction: (kind: "delete" | "dismiss") => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, right: 0 });
  const btnRef  = useRef<HTMLButtonElement>(null);
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
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const resolved = report.status === "RESOLVED";

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
              <button
                onClick={() => { setOpen(false); onView(); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.07)]"
              >
                <Eye size={14} /> View Details
              </button>

              {/* Both actions resolve the reports, so neither is offered once
                  the conversation has already been actioned. */}
              {!resolved && (
                <>
                  <button
                    onClick={() => { setOpen(false); onAction("dismiss"); }}
                    disabled={pending}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-emerald-400 transition-colors hover:bg-[rgba(16,185,129,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShieldCheck size={14} /> Dismiss Reports
                  </button>
                  <button
                    onClick={() => { setOpen(false); onAction("delete"); }}
                    disabled={pending}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-red-400 transition-colors hover:bg-[rgba(239,68,68,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Delete Conversation
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default function ReportedMessagesPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ConversationReportStatus | "ALL">("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Search is server-side, so debounce it — the raw value would fire a request
  // per keystroke.
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading } = useConversationReports({ status, search: debouncedSearch, page, limit: 10 });
  const deleteConversation = useDeleteConversation();
  const dismissReports = useDismissConversationReports();

  const stats = data?.stats;
  const reports = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const busy = deleteConversation.isPending || dismissReports.isPending;

  const viewDetails = (conversationId: string) => {
    router.push(`/dashboard/reported-messages/${conversationId}`);
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const { kind, conversation } = pendingAction;
    const name = na(conversation.chat.name);

    if (kind === "delete") {
      deleteConversation.mutate(conversation.conversationId, {
        onSuccess: () => toast.success(`Conversation "${name}" deleted and its reports resolved.`),
        onError: () => toast.error("Couldn't delete this conversation. Please try again."),
      });
    } else {
      dismissReports.mutate(conversation.conversationId, {
        onSuccess: () => toast.success(`Reports on "${name}" dismissed.`),
        onError: () => toast.error("Couldn't dismiss these reports. Please try again."),
      });
    }
    setPendingAction(null);
  };

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Reported Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review conversations reported from group chats and direct messages, then remove the conversation or dismiss the reports.
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="TOTAL REPORTS" value={formatNumberFull(stats?.total ?? 0)}    icon={Flag} />
              <StatCard label="PENDING"       value={formatNumberFull(stats?.pending ?? 0)}  icon={Clock} sub="Needs review" />
              <StatCard label="RESOLVED"      value={formatNumberFull(stats?.resolved ?? 0)} icon={CheckCircle2} badge="Actioned" />
            </>
          )}
        </div>

        {/* Directory card */}
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-card">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <div className="relative w-[220px] shrink-0 sm:w-[260px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4d6a]" />
              <input
                type="text"
                value={search}
                // Reset the page here, not in an effect on the debounced value —
                // searching from page 3 would otherwise land out of range.
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search conversations…"
                aria-label="Search reported conversations"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-[12px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-blue-500/40 focus:bg-white/[0.05] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setStatus(tab.value); setPage(1); }}
                  aria-pressed={status === tab.value}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-widest transition-all",
                    status === tab.value
                      ? "bg-blue-600 text-white"
                      : "border border-white/[0.12] text-caption hover:border-white/[0.22] hover:text-slate-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <p className="ml-auto text-[11px] text-caption">Most reported first</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border-t border-white/[0.06]">
            <div className={cn("grid gap-4 border-b border-white/[0.05] bg-white/[0.025] px-6 py-3", COLS, MIN_W)}>
              {["CONVERSATION", "REPORTS", "REASONS", "REPORTED BY", "LAST REPORTED", "STATUS", "ACTIONS"].map((label, i) => (
                <span
                  key={label}
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400",
                    i === 6 && "text-center"
                  )}
                >
                  {label}
                </span>
              ))}
            </div>

            {isLoading ? (
              <div className="px-6">
                {Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} />)}
              </div>
            ) : (
              <div className={MIN_W}>
                {reports.map((report, i) => {
                  const st = STATUS_STYLES[report.status];
                  const reasons = uniqueReasons(report);
                  return (
                    <motion.div
                      key={report.conversationId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        "grid items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors hover:bg-white/[0.02]",
                        COLS
                      )}
                    >
                      <ConversationCell report={report} onView={() => viewDetails(report.conversationId)} />

                      <ReportCount count={report.reportCount} />

                      {/* Reasons: two chips, then a +N overflow */}
                      <div className="flex min-w-0 flex-wrap items-center gap-1">
                        {reasons.slice(0, 2).map((reason) => (
                          <span
                            key={reason}
                            title={reason}
                            className="max-w-full truncate rounded border border-orange-500/30 px-2 py-[3px] text-[10px] font-semibold tracking-wide text-orange-300"
                          >
                            {reason}
                          </span>
                        ))}
                        {reasons.length > 2 && (
                          <span
                            title={reasons.slice(2).join(", ")}
                            className="rounded border border-white/[0.12] px-1.5 py-[3px] text-[10px] font-semibold text-caption"
                          >
                            +{reasons.length - 2}
                          </span>
                        )}
                        {reasons.length === 0 && <span className="text-[11px] text-caption">NA</span>}
                      </div>

                      <Reporters report={report} />

                      <span className="text-[12px] text-caption">{formatDate(report.lastReportedAt)}</span>

                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
                        <span className={cn("text-[11px] font-semibold", st.text)}>{st.label}</span>
                      </div>

                      <ActionMenu
                        report={report}
                        pending={busy}
                        onView={() => viewDetails(report.conversationId)}
                        onAction={(kind) => setPendingAction({ kind, conversation: report })}
                      />
                    </motion.div>
                  );
                })}

                {reports.length === 0 && (
                  <div className="py-14 text-center">
                    <ShieldCheck size={22} className="mx-auto mb-2 text-emerald-400/60" />
                    <p className="text-sm text-caption">
                      {debouncedSearch
                        ? `No reported conversations match "${debouncedSearch}".`
                        : status === "PENDING"
                          ? "Nothing awaiting review."
                          : "No reports match this filter."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-[11px] text-caption">
                {data && data.total > 0
                  ? `${formatNumberFull((page - 1) * 10 + 1)}–${formatNumberFull(Math.min(page * 10, data.total))} of ${formatNumberFull(data.total)} reported conversations`
                  : "No reported conversations"}
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

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.kind === "delete" ? "Delete this conversation?" : "Dismiss these reports?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction && (pendingAction.kind === "delete"
                ? `This permanently deletes "${na(pendingAction.conversation.chat.name)}" and all its messages, and resolves all ${pendingAction.conversation.reportCount} report(s) against it. Members will be notified.`
                : `This keeps the conversation and marks all ${pendingAction.conversation.reportCount} report(s) as resolved.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingAction?.kind === "delete" ? "destructive" : "default"}
              onClick={confirmAction}
            >
              {pendingAction?.kind === "delete" ? "Delete Conversation" : "Dismiss Reports"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
