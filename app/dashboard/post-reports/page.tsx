"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Flag, Clock, CheckCircle2, MoreVertical, Eye, EyeOff, Trash2, ShieldCheck,
  FileText, Play, X, Search, ImageOff,
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
import { usePostReports, useHidePost, useDismissPostReports } from "@/hooks/use-post-reports";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatNumberFull, formatDate, na, cn } from "@/lib/utils";
import type { PostReport, PostReportStatus } from "@/types";

const COLS = "grid-cols-[minmax(280px,2.4fr)_92px_minmax(160px,1.5fr)_minmax(150px,1.2fr)_105px_110px_60px]";
const MIN_W = "min-w-[1100px]";

const STATUS_TABS: { label: string; value: PostReportStatus | "ALL" }[] = [
  { label: "ALL",      value: "ALL"      },
  { label: "PENDING",  value: "PENDING"  },
  { label: "RESOLVED", value: "RESOLVED" },
];

const STATUS_STYLES: Record<PostReportStatus, { label: string; dot: string; text: string }> = {
  PENDING:  { label: "Pending",  dot: "bg-amber-400",   text: "text-amber-300"   },
  RESOLVED: { label: "Resolved", dot: "bg-emerald-400", text: "text-emerald-300" },
};

type PendingAction = { kind: "hide" | "dismiss"; report: PostReport };

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

/* ── Post thumbnail, or a placeholder for text-only posts ── */
function PostThumb({ report, onPreview }: { report: PostReport; onPreview: () => void }) {
  // Snapshot media URLs can 404 once the post is gone — fall back to an icon
  // rather than rendering a broken image.
  const [broken, setBroken] = useState(false);
  const first = report.post.media[0];
  const isVideo = first?.type?.toLowerCase().includes("video");

  if (!first || broken) {
    const Icon = broken ? ImageOff : FileText;
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.05]">
        <Icon size={16} strokeWidth={1.8} className="text-stat-icon" />
      </div>
    );
  }

  return (
    <button
      onClick={onPreview}
      aria-label="Preview reported post"
      className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/[0.07] transition-colors hover:border-blue-500/50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={first.url} alt="" onError={() => setBroken(true)} className="h-full w-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
        <Eye size={14} className="text-white" />
      </span>
      {isVideo && (
        <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 p-0.5">
          <Play size={8} className="fill-white text-white" />
        </span>
      )}
      {report.post.media.length > 1 && (
        <span className="absolute left-0.5 top-0.5 rounded bg-black/70 px-1 text-[9px] font-bold text-white">
          {report.post.media.length}
        </span>
      )}
    </button>
  );
}

/* ── Reporters: first name, plus an overflow count ── */
function Reporters({ report }: { report: PostReport }) {
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
  report, onPreview, onAction, pending,
}: {
  report: PostReport;
  onPreview: () => void;
  onAction: (kind: "hide" | "dismiss") => void;
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
                onClick={() => { setOpen(false); onPreview(); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.07)]"
              >
                <Eye size={14} /> View Post
              </button>

              {/* Both actions resolve the reports, so neither is offered once
                  the post has already been actioned. */}
              {!resolved && (
                <>
                  <button
                    onClick={() => { setOpen(false); onAction("hide"); }}
                    disabled={pending}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-amber-400 transition-colors hover:bg-[rgba(245,158,11,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <EyeOff size={14} /> Hide Post from Feed
                  </button>
                  <button
                    onClick={() => { setOpen(false); onAction("dismiss"); }}
                    disabled={pending}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-slate-300 transition-colors hover:bg-[rgba(255,255,255,0.07)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShieldCheck size={14} /> No Action
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

/* ── Full post preview ──────────────────────── */
function PostPreview({ report, onClose }: { report: PostReport | null; onClose: () => void }) {
  useEffect(() => {
    if (!report) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [report, onClose]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {report && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.10] bg-[#0d1321] shadow-2xl shadow-black/70"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar src={report.post.author.avatarUrl} name={report.post.author.fullName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-white">
                    {report.post.author.fullName.trim() || "Unknown author"}
                  </p>
                  <p className="text-[11px] text-caption">Reported {formatDate(report.reportedAt)}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close preview"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-caption transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {report.postDeleted && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/[0.10] px-3 py-2">
                  <Trash2 size={13} className="shrink-0 text-red-300" />
                  <p className="text-[11px] text-red-200">
                    This post was deleted. Shown from the snapshot taken when it was reported.
                  </p>
                </div>
              )}

              {report.postHidden && !report.postDeleted && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.10] px-3 py-2">
                  <EyeOff size={13} className="shrink-0 text-amber-300" />
                  <p className="text-[11px] text-amber-200">
                    This post is hidden from the public feed. Admins can still view it here.
                  </p>
                </div>
              )}

              {report.post.caption.trim() ? (
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-200">
                  {report.post.caption}
                </p>
              ) : (
                <p className="text-[13px] italic text-caption">
                  {report.postDeleted ? "Content unavailable" : "No caption"}
                </p>
              )}

              {report.post.media.map((m, i) => (
                m.type?.toLowerCase().includes("video") ? (
                  <video key={i} src={m.url} controls className="w-full rounded-lg border border-white/[0.07]" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={m.url} alt="" className="w-full rounded-lg border border-white/[0.07]" />
                )
              ))}

              <div className="space-y-2 border-t border-white/[0.06] pt-4">
                <p className="text-label">REPORTED FOR</p>
                <div className="flex flex-wrap gap-1.5">
                  {report.reasons.length > 0 ? report.reasons.map((r) => (
                    <span key={r} className="rounded border border-orange-500/30 px-2 py-[3px] text-[10px] font-semibold tracking-wide text-orange-300">
                      {r}
                    </span>
                  )) : <span className="text-[12px] text-caption">NA</span>}
                </div>
              </div>

              <div className="space-y-2 border-t border-white/[0.06] pt-4">
                <p className="text-label">
                  REPORTED BY ({formatNumberFull(report.reporters.length || report.reportCount)})
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {report.reporters.length > 0 ? report.reporters.map((r, i) => (
                    <div key={r.id || i} className="flex min-w-0 items-center gap-2">
                      <UserAvatar src={r.avatarUrl} name={r.fullName} size="sm" />
                      <span className="truncate text-[12px] text-slate-200">{na(r.fullName)}</span>
                    </div>
                  )) : <span className="text-[12px] text-caption">NA</span>}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default function PostReportsPage() {
  const [status, setStatus] = useState<PostReportStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<PostReport | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Search is server-side, so debounce it — the raw value would fire a request
  // per keystroke.
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading } = usePostReports({ status, search: debouncedSearch, page, limit: 10 });
  const hidePost = useHidePost();
  const dismissReports = useDismissPostReports();

  const stats = data?.stats;
  const reports = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const busy = hidePost.isPending || dismissReports.isPending;

  const confirmAction = () => {
    if (!pendingAction) return;
    const { kind, report } = pendingAction;
    const author = na(report.post.author.fullName);

    if (kind === "hide") {
      hidePost.mutate(report.postId, {
        onSuccess: () => toast.success(`Post by "${author}" hidden from the feed and its reports resolved.`),
        onError: () => toast.error("Couldn't hide this post. Please try again."),
      });
    } else {
      dismissReports.mutate(report.postId, {
        onSuccess: () => toast.success(`No action taken on "${author}"'s post; reports resolved.`),
        onError: () => toast.error("Couldn't resolve these reports. Please try again."),
      });
    }
    setPendingAction(null);
  };

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Reported Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review posts reported by users, then hide the post from the feed or take no action.
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
                placeholder="Search captions or authors…"
                aria-label="Search reported posts"
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
              {["REPORTED POST", "REPORTS", "REASONS", "REPORTED BY", "DATE", "STATUS", "ACTIONS"].map((label, i) => (
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
                  const caption = report.post.caption.trim();
                  const author = report.post.author.fullName.trim();
                  return (
                    <motion.div
                      key={report.reportId || report.postId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        "grid items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors hover:bg-white/[0.02]",
                        COLS
                      )}
                    >
                      {/* Post: thumbnail + caption + author */}
                      <div className="flex min-w-0 items-center gap-3">
                        <PostThumb report={report} onPreview={() => setPreview(report)} />
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <p
                              className={cn(
                                "truncate text-[13px]",
                                !caption
                                  ? "italic text-caption"
                                  : report.postDeleted
                                    ? "text-caption line-through"
                                    : "text-slate-200"
                              )}
                              title={caption || undefined}
                            >
                              {/* Explain the absence rather than printing NA: a
                                  post can legitimately have no caption, and a
                                  pre-snapshot report has nothing to show. */}
                              {caption || (report.postDeleted ? "Content unavailable" : "No caption")}
                            </p>
                            {report.postDeleted && (
                              <span className="shrink-0 rounded border border-red-500/30 bg-red-500/[0.12] px-1.5 py-[2px] text-[9px] font-bold tracking-wide text-red-300">
                                DELETED
                              </span>
                            )}
                            {report.postHidden && !report.postDeleted && (
                              <span className="shrink-0 rounded border border-amber-500/30 bg-amber-500/[0.12] px-1.5 py-[2px] text-[9px] font-bold tracking-wide text-amber-300">
                                HIDDEN
                              </span>
                            )}
                          </div>
                          {/* No author is better than "by NA". */}
                          {author && (
                            <p className="mt-0.5 truncate text-[11px] text-caption">by {author}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <ReportCount count={report.reportCount} />
                      </div>

                      {/* Reasons: two chips, then a +N overflow */}
                      <div className="flex min-w-0 flex-wrap items-center gap-1">
                        {report.reasons.slice(0, 2).map((reason) => (
                          <span
                            key={reason}
                            title={reason}
                            className="max-w-full truncate rounded border border-orange-500/30 px-2 py-[3px] text-[10px] font-semibold tracking-wide text-orange-300"
                          >
                            {reason}
                          </span>
                        ))}
                        {report.reasons.length > 2 && (
                          <span
                            title={report.reasons.slice(2).join(", ")}
                            className="rounded border border-white/[0.12] px-1.5 py-[3px] text-[10px] font-semibold text-caption"
                          >
                            +{report.reasons.length - 2}
                          </span>
                        )}
                        {report.reasons.length === 0 && <span className="text-[11px] text-caption">NA</span>}
                      </div>

                      <Reporters report={report} />

                      <span className="text-[12px] text-caption">{formatDate(report.reportedAt)}</span>

                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
                        <span className={cn("text-[11px] font-semibold", st.text)}>{st.label}</span>
                      </div>

                      <ActionMenu
                        report={report}
                        pending={busy}
                        onPreview={() => setPreview(report)}
                        onAction={(kind) => setPendingAction({ kind, report })}
                      />
                    </motion.div>
                  );
                })}

                {reports.length === 0 && (
                  <div className="py-14 text-center">
                    <ShieldCheck size={22} className="mx-auto mb-2 text-emerald-400/60" />
                    <p className="text-sm text-caption">
                      {debouncedSearch
                        ? `No reported posts match "${debouncedSearch}".`
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
                  ? `${formatNumberFull((page - 1) * 10 + 1)}–${formatNumberFull(Math.min(page * 10, data.total))} of ${formatNumberFull(data.total)} reported posts`
                  : "No reported posts"}
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

      <PostPreview report={preview} onClose={() => setPreview(null)} />

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.kind === "hide" ? "Hide this post from the feed?" : "Take no action on these reports?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction && (pendingAction.kind === "hide"
                ? `This hides the post by "${na(pendingAction.report.post.author.fullName)}" from the public feed (it is not deleted) and resolves all ${pendingAction.report.reportCount} report(s) against it.`
                : `This keeps the post visible and marks all ${pendingAction.report.reportCount} pending report(s) as resolved, with no action taken on the post.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingAction?.kind === "hide" ? "destructive" : "default"}
              onClick={confirmAction}
            >
              {pendingAction?.kind === "hide" ? "Hide Post" : "No Action"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
