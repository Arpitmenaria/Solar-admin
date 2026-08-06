"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { PaginationButton } from "@/components/shared/pagination-button";
import { ActionReasonDialog } from "@/components/shared/action-reason-dialog";
import { useUsers, useUserStats, useToggleSuspend } from "@/hooks/use-users";
import { USER_FILTER_TABS } from "@/constants/users";
import { formatNumberFull, formatDate, na, cn } from "@/lib/utils";
import type { User, UserStatus } from "@/types";
import {
  Search, Download,
  ChevronFirst, ChevronLast, ChevronLeft, ChevronRight,
  Flag, UserPlus, Users, Crown,
  MoreVertical, Eye, Ban, RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* Figma column layout: USER NODE wide, STATUS compact, rest fixed */
const COLS = "grid-cols-[minmax(220px,2.5fr)_130px_140px_130px_90px_110px]";

/* Up to three page buttons, sliding to keep the current page in view. */
function pageWindow(current: number, total: number): number[] {
  const start = Math.max(1, Math.min(current - 1, total - 2));
  return Array.from({ length: Math.min(3, total) }, (_, i) => start + i);
}

/* ── ActionMenu (portal, fixed) ─────────────── */
function ActionMenu({
  user, onToggleSuspend, pending,
}: { user: User; onToggleSuspend: () => void; pending: boolean }) {
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

  return (
    <div className="flex justify-end">
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label={`Actions for ${user.displayName}`}
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
              className="w-44 overflow-hidden rounded-xl border border-white/[0.10] bg-[#0d1424] shadow-2xl shadow-black/70"
            >
              <Link
                href={`/dashboard/users/${user.id}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.07)]"
              >
                <Eye size={14} /> View Details
              </Link>
              {/* The endpoint toggles, so the label has to follow the user's
                  current state — a fixed "Suspend" would silently reinstate
                  an already-suspended account. */}
              <button
                onClick={() => { setOpen(false); onToggleSuspend(); }}
                disabled={pending}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  user.isSuspended
                    ? "text-emerald-400 hover:bg-[rgba(16,185,129,0.12)]"
                    : "text-red-400 hover:bg-[rgba(239,68,68,0.12)]"
                )}
              >
                {user.isSuspended
                  ? <><RotateCcw size={14} /> Reactivate Account</>
                  : <><Ban size={14} /> Make Account Suspend</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pendingSuspend, setPendingSuspend] = useState<User | null>(null);

  const { data: users, isLoading: usersLoading } = useUsers({ search, status: statusFilter, page, pageSize });
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const toggleSuspend = useToggleSuspend();

  const totalPages = users?.totalPages ?? 1;

  const confirmSuspend = ({ reason, notes }: { reason: string; notes: string }) => {
    if (!pendingSuspend) return;
    const { id, displayName, isSuspended } = pendingSuspend;
    toggleSuspend.mutate({ id, reason, notes }, {
      // Report the state the server landed on, not the one we predicted.
      onSuccess: (nowSuspended) =>
        toast.success(
          nowSuspended
            ? `"${displayName}" suspended and notified by email.`
            : `"${displayName}" has been reactivated.`
        ),
      onError: () =>
        toast.error(
          isSuspended
            ? "Couldn't reactivate this user. Please try again."
            : "Couldn't suspend this user. Please try again."
        ),
    });
    setPendingSuspend(null);
  };

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="TOTAL USERS"    value={formatNumberFull(stats?.totalUsers ?? 0)}    icon={Users} />
              <StatCard label="PREMIUM USERS"  value={formatNumberFull(stats?.premiumUsers ?? 0)}  icon={Crown} />
              <StatCard label="NEW SIGN UP"     value={formatNumberFull(stats?.newSignups ?? 0)}    icon={UserPlus} sub="Last 30 days" />
              <StatCard label="FLAGGED USERS"   value={formatNumberFull(stats?.flaggedUsers ?? 0)}  icon={Flag} sub="Needs review" />
            </>
          )}
        </div>

        {/* ── User Directory card ── */}
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-card">

          {/* Single controls row: search + filters + sort + export */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-white/[0.06]">

            {/* Search */}
            <div className="relative w-[220px] sm:w-[260px] shrink-0">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4d6a]" />
              <input
                id="user-search"
                type="text"
                placeholder="Search users…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                aria-label="Search users"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-[12px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-blue-500/40 focus:bg-white/[0.05] focus:outline-none"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5">
              {USER_FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                  aria-pressed={statusFilter === tab.value}
                  className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-widest transition-all ${
                    statusFilter === tab.value
                      ? "bg-blue-600 text-white"
                      : "border border-white/[0.12] text-caption hover:border-white/[0.22] hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Export CSV */}
            <button className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3.5 py-2 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06]">
              <Download size={12} />
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="border-t border-white/[0.06] overflow-x-auto">

            {/* Table header */}
            <div className={`grid ${COLS} gap-4 border-b border-white/[0.05] bg-white/[0.025] px-6 py-3`}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">USER NODE</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">STATUS</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">REGISTRATION</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 text-center">FOLLOWERS</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 text-center">POSTS</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 text-right">ACTIONS</span>
            </div>

            {/* Table body */}
            {usersLoading ? (
              <div className="px-6">
                {Array.from({ length: Math.min(pageSize, 10) }).map((_, i) => <TableRowSkeleton key={i} />)}
              </div>
            ) : (
              <div>
                {(users?.data ?? []).map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`grid ${COLS} items-center gap-4 border-b border-white/[0.04] px-6 py-5 transition-colors hover:bg-white/[0.02]`}
                  >
                    {/* User node */}
                    <div className="flex min-w-0 items-center gap-3.5">
                      <UserAvatar
                        src={user.avatarUrl}
                        name={user.displayName}
                        size="md"
                        online={user.status === "ACTIVE" || user.status === "PREMIUM"}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-white">{na(user.displayName)}</p>
                        <p className={`truncate text-[11px] mt-0.5 ${user.status === "FLAGGED" ? "text-red-400" : "text-caption"}`}>
                          {na(user.email)}
                        </p>
                      </div>
                    </div>

                    {/* Status is account state only — active vs suspended.
                        Tier (PREMIUM) and recency (NEW) are separate axes and
                        don't belong in this column, so drive it off isSuspended
                        rather than the derived status. */}
                    <div className="flex items-center">
                      <StatusBadge status={user.isSuspended ? "INACTIVE" : "ACTIVE"} />
                    </div>

                    <span className="text-[12px] text-slate-300">
                      {formatDate(user.registrationDate)}
                    </span>

                    <span className="text-center text-[13px] font-medium text-slate-200">
                      {formatNumberFull(user.stats.followers)}
                    </span>

                    <span className="text-center text-[13px] font-medium text-slate-200">
                      {formatNumberFull(user.stats.createdPosts)}
                    </span>

                    <ActionMenu
                      user={user}
                      onToggleSuspend={() => setPendingSuspend(user)}
                      pending={toggleSuspend.isPending}
                    />
                  </motion.div>
                ))}

                {(users?.data.length ?? 0) === 0 && (
                  <p className="px-6 py-12 text-center text-[12px] text-caption">
                    No users match these filters.
                  </p>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2.5 text-[11px] text-caption">
                <span className="font-medium">Rows:</span>
                {/* A select rather than a number input: discrete values mean one
                    request per change, and no way to type 0 or 99999. */}
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  aria-label="Rows per page"
                  className="rounded border border-white/[0.08] bg-transparent px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500/40"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n} className="bg-[#0d1424] text-slate-300">{n}</option>
                  ))}
                </select>
                {users && users.total > 0 && (
                  <span className="ml-1">
                    {formatNumberFull((page - 1) * pageSize + 1)}–
                    {formatNumberFull(Math.min(page * pageSize, users.total))} of {formatNumberFull(users.total)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-0.5">
                <PaginationButton label="First page"    icon={<ChevronFirst size={13} />} onClick={() => setPage(1)}                    disabled={page === 1} />
                <PaginationButton label="Previous page" icon={<ChevronLeft size={13} />}  onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} />

                {pageWindow(page, totalPages).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    aria-current={page === n ? "page" : undefined}
                    className={`h-7 w-7 rounded-full text-xs font-medium transition-colors ${
                      page === n
                        ? "bg-blue-600 text-white"
                        : "text-caption hover:bg-white/[0.06] hover:text-slate-300"
                    }`}
                  >
                    {n}
                  </button>
                ))}

                {totalPages > 3 && (
                  <span className="px-2 text-[11px] text-caption">… {formatNumberFull(totalPages)}</span>
                )}

                <PaginationButton label="Next page" icon={<ChevronRight size={13} />} onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} />
                <PaginationButton label="Last page"  icon={<ChevronLast size={13} />}  onClick={() => setPage(totalPages)}                     disabled={page >= totalPages} />
              </div>
            </div>

          </div>
        </div>
      </main>

      <ActionReasonDialog
        open={!!pendingSuspend}
        title={pendingSuspend?.isSuspended ? "Reactivate this account?" : "Suspend this account?"}
        description={pendingSuspend && (pendingSuspend.isSuspended
          ? `Restores "${pendingSuspend.displayName}"'s access to the platform.`
          : `Blocks "${pendingSuspend.displayName}" from the platform, signs them out, and notifies them by email.`)}
        confirmLabel={pendingSuspend?.isSuspended ? "Reactivate Account" : "Suspend Account"}
        variant={pendingSuspend?.isSuspended ? "default" : "destructive"}
        pending={toggleSuspend.isPending}
        onConfirm={confirmSuspend}
        onClose={() => setPendingSuspend(null)}
      />
    </div>
  );
}
