"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbDownload, TbPlus, TbSearch, TbRefresh,
  TbLock, TbWorld,
  TbChevronsLeft, TbChevronsRight, TbChevronLeft, TbChevronRight,
  TbDatabaseImport,
  TbDotsVertical, TbEye, TbTrash,
} from "react-icons/tb";
import { CustomSelect } from "@/components/shared/custom-select";
import { formatNumberFull, formatDateTime, cn } from "@/lib/utils";
import type { Group, GroupCategory, GroupPrivacy, GroupStatus } from "@/constants/mock-data";
import { useGroups } from "@/hooks/use-groups";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CATEGORY_ICON, CAT_BADGE, STATUS_STYLES } from "@/components/groups/group-meta";
import { GroupActionDialog, type PendingGroupAction } from "@/components/groups/group-action-dialog";

/* ── Nav tabs — text only, no numbers ───────── */
const GROUP_TABS = [
  { label: "TOTAL GROUPS",     id: "total"     },
  { label: "PENDING APPROVAL", id: "pending"   },
  { label: "PRIVATE GROUPS",   id: "private"   },
  { label: "PUBLIC GROUPS",    id: "public"    },
  { label: "SUSPENDED",        id: "suspended" },
] as const;

type TabId = typeof GROUP_TABS[number]["id"];

const PRIVACY_TABS: { label: string; value: "ALL" | GroupPrivacy }[] = [
  { label: "All", value: "ALL" }, { label: "Public", value: "Public" }, { label: "Private", value: "Private" },
];
/** Status filter is a live view switch: all/active groups, or soft-deleted ones. */
const STATUS_OPTS: { value: "ALL" | "ACTIVE" | "DELETED"; label: string }[] = [
  { value: "ALL",     label: "All Status" },
  { value: "ACTIVE",  label: "Active"     },
  { value: "DELETED", label: "Deleted"    },
];
const CATEGORY_OPTS: ("ALL" | GroupCategory)[] = ["ALL", "Tech", "Design", "Finance", "Security", "Gaming", "Social"];

/* ── ActionMenu (portal, fixed) ─────────────── */
function ActionMenu({ group, onAction }: { group: Group; onAction: (action: "SUSPEND" | "UNSUSPEND" | "DELETE") => void }) {
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
    <div className="flex justify-center">
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label={`Actions for ${group.name}`}
        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
          open ? "bg-white/[0.12] text-white" : "text-caption hover:bg-white/[0.08] hover:text-white"
        }`}
      >
        <TbDotsVertical size={15} />
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
                href={`/dashboard/groups/${group.id}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.07)]"
              >
                <TbEye size={14} /> View Details
              </Link>
              <button
                onClick={() => { setOpen(false); onAction("DELETE"); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-red-400 transition-colors hover:bg-[rgba(239,68,68,0.12)]"
              >
                <TbTrash size={14} /> Delete Group
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

/* ───────────────────────────────────────────── */
const PAGE_SIZE = 10;

/** Up to three page numbers, sliding to keep the current page in view. */
function pageWindow(current: number, total: number): number[] {
  const start = Math.max(1, Math.min(current - 1, total - 2));
  return Array.from({ length: Math.min(3, total) }, (_, i) => start + i);
}

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("total");
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState<"ALL" | GroupCategory>("ALL");
  const [privacy,   setPrivacy]   = useState<"ALL" | GroupPrivacy>("ALL");
  const [status,    setStatus]    = useState<"ALL" | "ACTIVE" | "DELETED">("ALL");
  const [page,      setPage]      = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingGroupAction | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const isDeleted = status === "DELETED";

  // A tab implies a status/privacy filter; manual selections override it.
  const tabStatus: GroupStatus | "" = activeTab === "pending" ? "PENDING" : activeTab === "suspended" ? "SUSPENDED" : "";
  const tabPrivacy: GroupPrivacy | "" = activeTab === "private" ? "Private" : activeTab === "public" ? "Public" : "";

  const effectiveStatus: GroupStatus | "" = isDeleted || status === "ALL" ? tabStatus : status;
  const effectivePrivacy = privacy !== "ALL" ? privacy : tabPrivacy;

  const { data, isLoading } = useGroups({
    search: debouncedSearch,
    status: effectiveStatus,
    privacy: effectivePrivacy,
    category: category !== "ALL" ? category : "",
    deleted: isDeleted,
    page,
    limit: PAGE_SIZE,
  });

  const groups = data?.data ?? [];
  const stats = data?.stats;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleTabClick = (id: TabId) => {
    setActiveTab(id);
    setSearch(""); setCategory("ALL"); setPrivacy("ALL"); setStatus("ALL"); setPage(1);
  };

  const TAB_CONFIG: Record<TabId, { label: string; statValue: number; sub: string; icon: React.ElementType }> = {
    total:     { label: "TOTAL GROUPS",    statValue: stats?.totalGroups ?? 0,     sub: "+12.5% vs last month", icon: TbDatabaseImport },
    pending:   { label: "PENDING APPROVAL",statValue: stats?.pendingApproval ?? 0, sub: "Awaiting review",      icon: TbDatabaseImport },
    private:   { label: "PRIVATE GROUPS",  statValue: stats?.privateGroups ?? 0,   sub: "Members-only access",  icon: TbDatabaseImport },
    public:    { label: "PUBLIC GROUPS",   statValue: stats?.publicGroups ?? 0,    sub: "Open to everyone",     icon: TbDatabaseImport },
    suspended: { label: "SUSPENDED",       statValue: stats?.suspended ?? 0,       sub: "Access restricted",    icon: TbDatabaseImport },
  };

  const tabCfg = TAB_CONFIG[activeTab];

  // Server already filtered + paginated — render as-is.
  const filtered = groups;

  const resetFilters = () => {
    setSearch(""); setCategory("ALL"); setPrivacy("ALL"); setStatus("ALL"); setPage(1);
  };

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">

        {/* ── Flat nav tab bar — no card box, matches Figma ── */}
        <div className="overflow-x-auto border-b border-white/[0.08]" style={{ scrollbarWidth: "none" }}>
          <div className="flex min-w-max">
            {GROUP_TABS.map((tab, i) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "relative px-8 py-4 text-left shrink-0 border-b-2 transition-colors duration-150",
                  activeTab === tab.id
                    ? "border-blue-500 text-white"
                    : "border-transparent text-caption hover:text-slate-300 hover:border-white/[0.12]"
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap">
                  {tab.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Content area ── */}
        <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* ── Top row: stat card + controls ── */}
              <div className="flex flex-col xl:flex-row items-stretch gap-5">

                {/* Tab stat card — dynamic per active tab */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full xl:w-[240px] shrink-0 rounded-xl border border-white/[0.08] bg-card p-5 flex flex-col justify-between transition-all duration-200 hover:border-blue-500/40 hover:bg-blue-500/[0.04] hover:-translate-y-[2px] hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-caption leading-snug pr-2">
                      {tabCfg.label}
                    </p>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04]">
                      <TbDatabaseImport size={15} style={{ color: "#4d6b90" }} />
                    </div>
                  </div>
                  <p className="text-[34px] font-bold leading-none tracking-tight text-[#99CBFF]">
                    {formatNumberFull(tabCfg.statValue)}
                  </p>
                  <p className="mt-2.5 text-[11px] text-[#99CBFF]">{tabCfg.sub}</p>
                </motion.div>

                {/* Controls: filters + actions */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-card px-5 py-3.5 flex items-center gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-caption">Category</span>
                    <CustomSelect size="sm" value={category} onChange={(v) => { setCategory(v as typeof category); setPage(1); }}
                      options={CATEGORY_OPTS.map((c) => ({ value: c, label: c === "ALL" ? "All Categories" : c }))} />
                  </div>
                  <div className="h-4 w-px bg-white/[0.08] shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-caption">Privacy</span>
                    <div className="flex items-center rounded-lg border border-white/[0.10] bg-white/[0.03] p-0.5">
                      {PRIVACY_TABS.map((t) => (
                        <button key={t.value} onClick={() => { setPrivacy(t.value); setPage(1); }}
                          className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-all ${privacy === t.value ? "bg-blue-600 text-white" : "text-caption hover:text-slate-300"}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-4 w-px bg-white/[0.08] shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-caption">Status</span>
                    <CustomSelect size="sm" value={status} onChange={(v) => { setStatus(v as typeof status); setPage(1); }}
                      options={STATUS_OPTS} />
                  </div>
                  <div className="relative">
                    <TbSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-caption" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      placeholder="Search groups..."
                      className="w-40 rounded-lg border border-white/[0.08] bg-white/[0.03] py-1.5 pl-7 pr-3 text-[11px] text-slate-200 placeholder:text-caption focus:border-blue-500/40 focus:outline-none" />
                  </div>
                  <button onClick={resetFilters} className="flex items-center gap-1 text-[11px] font-medium text-[#99CBFF] transition-colors hover:text-white">
                    <TbRefresh size={12} /> Reset
                  </button>
                  <div className="ml-auto flex items-center gap-2 shrink-0">
                    <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06]">
                      <TbDownload size={12} /> Export CSV
                    </button>
                    <Link
                      href="/dashboard/groups/create"
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <TbPlus size={12} /> Create New Group
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Group Directory table */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.22 }}
                className="overflow-hidden rounded-xl border border-white/[0.08] bg-card"
              >

                {/* Table header */}
                <div className="grid grid-cols-[2.5fr_120px_110px_160px_110px_100px_120px_120px_60px] gap-4 border-b border-white/[0.07] bg-white/[0.025] px-6 py-4">
                  {[
                    { label: "GROUP NAME",    cls: ""            },
                    { label: "CATEGORY",      cls: ""            },
                    { label: "PRIVACY",       cls: ""            },
                    { label: "OWNER/ADMIN",   cls: ""            },
                    { label: "MEMBERS",       cls: "text-center" },
                    { label: "POSTS",         cls: "text-center" },
                    { label: "STATUS",        cls: ""            },
                    { label: "CREATED DATE",  cls: ""            },
                    { label: "ACTIONS",       cls: "text-center" },
                  ].map(({ label, cls }) => (
                    <span
                      key={label}
                      className={`text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 ${cls}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* Table rows */}
                {filtered.map((group, i) => {
                  const CatIcon = CATEGORY_ICON[group.category];
                  const st = STATUS_STYLES[group.status];
                  return (
                    <motion.div key={group.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-[2.5fr_120px_110px_160px_110px_100px_120px_120px_60px] items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: group.iconColor + "33", border: `1px solid ${group.iconColor}55` }}>
                          <CatIcon size={16} style={{ color: group.iconColor === "#b91c1c" ? "#f87171" : group.iconColor === "#374151" ? "#94a3b8" : "#93c5fd" }} />
                        </div>
                        <span className="truncate text-[13px] font-semibold text-white">{group.name}</span>
                      </div>

                      <span className={`inline-flex w-fit items-center rounded border px-2 py-[3px] text-[10px] font-semibold tracking-wide ${CAT_BADGE[group.category]}`}>
                        {group.category}
                      </span>

                      <div className="flex items-center gap-1.5 text-[12px] text-slate-300">
                        {group.privacy === "Public" ? <TbWorld size={13} className="text-caption" /> : <TbLock size={13} className="text-caption" />}
                        {group.privacy}
                      </div>

                      <div className="flex min-w-0 items-center gap-2">
                        {group.owner.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={group.owner.avatarUrl} alt={group.owner.name} className="h-7 w-7 shrink-0 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a2744] text-[10px] font-bold text-blue-400">
                            {group.owner.initials}
                          </div>
                        )}
                        <span className="truncate text-[12px] text-slate-200">{group.owner.name}</span>
                      </div>

                      <span className="text-center text-[13px] font-medium text-slate-200">{formatNumberFull(group.members)}</span>
                      <span className="text-center text-[13px] font-medium text-slate-200">
                        {group.posts >= 1000 ? (group.posts / 1000).toFixed(1) + "k" : formatNumberFull(group.posts)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isDeleted ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            <span className="text-[11px] font-semibold text-red-400">Deleted</span>
                          </>
                        ) : (
                          <>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            <span className={`text-[11px] font-semibold ${st.text}`}>{st.label}</span>
                          </>
                        )}
                      </div>

                      <span className="text-[12px] text-caption">
                        {isDeleted && group.deletedAt
                          ? `Deleted ${formatDateTime(group.deletedAt)}`
                          : formatDateTime(group.createdAt)}
                      </span>

                      <ActionMenu
                        group={group}
                        onAction={(action) => setPendingAction({ action, groupId: group.id, groupName: group.name })}
                      />
                    </motion.div>
                  );
                })}

                {isLoading && filtered.length === 0 && (
                  <div className="py-12 text-center text-sm text-caption">Loading groups…</div>
                )}
                {!isLoading && filtered.length === 0 && (
                  <div className="py-12 text-center text-sm text-caption">No groups match the current filters.</div>
                )}

                {/* Pagination — driven by the API's total/totalPages */}
                <div className="flex items-center justify-between border-t border-white/[0.04] px-6 py-4">
                  <p className="text-[11px] text-caption">
                    {total > 0
                      ? `Showing ${formatNumberFull((page - 1) * PAGE_SIZE + 1)}–${formatNumberFull(Math.min(page * PAGE_SIZE, total))} of ${formatNumberFull(total)} entries`
                      : "No entries"}
                  </p>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => setPage(1)} disabled={page === 1} aria-label="First page"
                      className="flex h-7 w-7 items-center justify-center rounded text-caption transition-colors hover:bg-white/[0.06] hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40">
                      <TbChevronsLeft size={13} />
                    </button>
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} aria-label="Previous page"
                      className="flex h-7 w-7 items-center justify-center rounded text-caption transition-colors hover:bg-white/[0.06] hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40">
                      <TbChevronLeft size={13} />
                    </button>

                    {pageWindow(page, totalPages).map((n) => (
                      <button key={n} onClick={() => setPage(n)}
                        aria-current={page === n ? "page" : undefined}
                        className={`h-7 w-7 rounded-full text-xs font-medium transition-colors ${
                          page === n ? "bg-blue-600 text-white" : "text-caption hover:bg-white/[0.06]"
                        }`}>{n}</button>
                    ))}
                    {totalPages > 3 && page < totalPages - 1 && (
                      <span className="px-2 text-[11px] text-caption">… {formatNumberFull(totalPages)}</span>
                    )}

                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} aria-label="Next page"
                      className="flex h-7 w-7 items-center justify-center rounded text-caption transition-colors hover:bg-white/[0.06] hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40">
                      <TbChevronRight size={13} />
                    </button>
                    <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} aria-label="Last page"
                      className="flex h-7 w-7 items-center justify-center rounded text-caption transition-colors hover:bg-white/[0.06] hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40">
                      <TbChevronsRight size={13} />
                    </button>

                    <div className="ml-3 flex items-center gap-2 text-[11px] text-caption">
                      <span>Go to page:</span>
                      <input
                        type="number" min={1} max={totalPages} value={page}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (n >= 1 && n <= totalPages) setPage(n);
                        }}
                        className="w-12 rounded border border-white/[0.08] bg-transparent px-2 py-1 text-center text-xs text-slate-300 focus:border-blue-500/40 focus:outline-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
        </AnimatePresence>

      </main>

      <GroupActionDialog pending={pendingAction} onClose={() => setPendingAction(null)} />
    </div>
  );
}
