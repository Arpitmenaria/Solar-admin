"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbDownload, TbPlus, TbSearch, TbRefresh,
  TbCode, TbShieldCheck, TbDeviceGamepad2, TbUsers, TbLock, TbWorld,
  TbChevronsLeft, TbChevronsRight, TbChevronLeft, TbChevronRight,
  TbBan, TbPalette, TbCurrencyDollar, TbAlertTriangle,
  TbDatabaseImport, TbClock,
  TbDotsVertical, TbEye, TbPencil, TbTrash,
} from "react-icons/tb";
import { CustomSelect } from "@/components/shared/custom-select";
import { formatNumberFull, cn } from "@/lib/utils";
import { MOCK_GROUPS, MOCK_GROUP_STATS } from "@/constants/mock-data";
import type { GroupCategory, GroupPrivacy, GroupStatus } from "@/constants/mock-data";

/* ── Nav tabs — text only, no numbers ───────── */
const GROUP_TABS = [
  { label: "TOTAL GROUPS",     id: "total"     },
  { label: "PENDING APPROVAL", id: "pending"   },
  { label: "PRIVATE GROUPS",   id: "private"   },
  { label: "PUBLIC GROUPS",    id: "public"    },
  { label: "REPORTED GROUPS",  id: "reported"  },
  { label: "SUSPENDED",        id: "suspended" },
] as const;

type TabId = typeof GROUP_TABS[number]["id"];

/* ── Stat cards shown when Total Groups is active ── */
const STAT_CARDS = [
  { label: "TOTAL GROUPS",     value: MOCK_GROUP_STATS.totalGroups,     sub: "+12.5% vs last month",    icon: TbDatabaseImport, color: "#99CBFF"  },
  { label: "PENDING APPROVAL", value: MOCK_GROUP_STATS.pendingApproval, sub: "Avg processing: 4.2h",    icon: TbClock,          color: "#e2e8f0"  },
  { label: "PRIVATE GROUPS",   value: MOCK_GROUP_STATS.privateGroups,   sub: "29% of ecosystem",        icon: TbLock,           color: "#e2e8f0"  },
  { label: "PUBLIC GROUPS",    value: MOCK_GROUP_STATS.publicGroups,    sub: "71% of ecosystem",        icon: TbWorld,          color: "#e2e8f0"  },
  { label: "REPORTED GROUPS",  value: MOCK_GROUP_STATS.reportedGroups,  sub: "Urgent Review Required",  icon: TbAlertTriangle,  color: "#f97316"  },
  { label: "SUSPENDED",        value: MOCK_GROUP_STATS.suspended,       sub: "-2 from yesterday",       icon: TbBan,            color: "#e2e8f0"  },
];

/* ── Table helpers ───────────────────────────── */
const CATEGORY_ICON: Record<GroupCategory, React.ElementType> = {
  Tech: TbCode, Design: TbPalette, Finance: TbCurrencyDollar,
  Security: TbShieldCheck, Gaming: TbDeviceGamepad2, Social: TbUsers,
};
const CAT_BADGE: Record<GroupCategory, string> = {
  Tech:     "border-blue-500/30 text-blue-300",
  Design:   "border-purple-500/30 text-purple-300",
  Finance:  "border-emerald-500/30 text-emerald-300",
  Security: "border-slate-500/30 text-slate-300",
  Gaming:   "border-orange-500/30 text-orange-300",
  Social:   "border-cyan-500/30 text-cyan-300",
};
const STATUS_STYLES: Record<GroupStatus, { dot: string; text: string; label: string }> = {
  ACTIVE:    { dot: "bg-emerald-400", text: "text-emerald-400", label: "Active"    },
  SUSPENDED: { dot: "bg-red-400",     text: "text-red-400",     label: "Suspended" },
  PENDING:   { dot: "bg-yellow-400",  text: "text-yellow-400",  label: "Pending"   },
  REPORTED:  { dot: "bg-orange-400",  text: "text-orange-400",  label: "Reported"  },
};

const PRIVACY_TABS: { label: string; value: "ALL" | GroupPrivacy }[] = [
  { label: "All", value: "ALL" }, { label: "Public", value: "Public" }, { label: "Private", value: "Private" },
];
const STATUS_OPTS:   ("ALL" | GroupStatus)[]   = ["ALL", "ACTIVE", "SUSPENDED", "PENDING", "REPORTED"];
const CATEGORY_OPTS: ("ALL" | GroupCategory)[] = ["ALL", "Tech", "Design", "Finance", "Security", "Gaming", "Social"];

/* ── ActionMenu (portal, fixed) ─────────────── */
const ACTION_ITEMS = (status: GroupStatus) => [
  { label: "View Details",  icon: TbEye,    cls: "text-white hover:bg-[rgba(255,255,255,0.07)]"    },
  { label: "Edit Group",    icon: TbPencil, cls: "text-white hover:bg-[rgba(255,255,255,0.07)]"    },
  { label: status === "SUSPENDED" ? "Unsuspend" : "Suspend",
                            icon: TbBan,    cls: "text-orange-400 hover:bg-[rgba(249,115,22,0.12)]" },
  { label: "Delete Group",  icon: TbTrash,  cls: "text-red-400 hover:bg-[rgba(239,68,68,0.12)]"   },
];

function ActionMenu({ status }: { status: GroupStatus }) {
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
              style={{ position: "fixed", top: pos.top, right: pos.right, transformOrigin: "top right", zIndex: 9999 }}
              className="w-44 overflow-hidden rounded-xl border border-white/[0.10] bg-[#0d1424] shadow-2xl shadow-black/70"
            >
              {ACTION_ITEMS(status).map(({ label, icon: Icon, cls }) => (
                <button key={label} onClick={() => setOpen(false)}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium transition-colors ${cls}`}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

/* ───────────────────────────────────────────── */
export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("total");
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState<"ALL" | GroupCategory>("ALL");
  const [privacy,   setPrivacy]   = useState<"ALL" | GroupPrivacy>("ALL");
  const [status,    setStatus]    = useState<"ALL" | GroupStatus>("ALL");
  const [page,      setPage]      = useState(1);

  const handleTabClick = (id: TabId) => {
    setActiveTab(id);
    setSearch(""); setCategory("ALL"); setPrivacy("ALL"); setStatus("ALL"); setPage(1);
  };

  // Tab-level base filter applied on top of user's manual filters
  const TAB_CONFIG: Record<TabId, {
    label: string; statValue: number; sub: string; icon: React.ElementType;
    baseFilter: (g: (typeof MOCK_GROUPS)[0]) => boolean;
  }> = {
    total:     { label: "TOTAL GROUPS",    statValue: MOCK_GROUP_STATS.totalGroups,     sub: "+12.5% vs last month", icon: TbDatabaseImport, baseFilter: () => true },
    pending:   { label: "PENDING APPROVAL",statValue: MOCK_GROUP_STATS.pendingApproval, sub: "Awaiting review",      icon: TbDatabaseImport, baseFilter: (g) => g.status === "PENDING"   },
    private:   { label: "PRIVATE GROUPS",  statValue: MOCK_GROUP_STATS.privateGroups,   sub: "Members-only access",  icon: TbDatabaseImport, baseFilter: (g) => g.privacy === "PRIVATE"  },
    public:    { label: "PUBLIC GROUPS",   statValue: MOCK_GROUP_STATS.publicGroups,    sub: "Open to everyone",     icon: TbDatabaseImport, baseFilter: (g) => g.privacy === "PUBLIC"   },
    reported:  { label: "REPORTED GROUPS", statValue: MOCK_GROUP_STATS.reportedGroups,  sub: "Under investigation",  icon: TbDatabaseImport, baseFilter: (g) => g.status === "REPORTED"  },
    suspended: { label: "SUSPENDED",       statValue: MOCK_GROUP_STATS.suspended,       sub: "Access restricted",    icon: TbDatabaseImport, baseFilter: (g) => g.status === "SUSPENDED" },
  };

  const tabCfg = TAB_CONFIG[activeTab];

  const filtered = MOCK_GROUPS.filter((g) => {
    if (!tabCfg.baseFilter(g)) return false;
    if (search   && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "ALL" && g.category !== category) return false;
    if (privacy  !== "ALL" && g.privacy  !== privacy)  return false;
    if (status   !== "ALL" && g.status   !== status)   return false;
    return true;
  });

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
                      options={STATUS_OPTS.map((s) => ({ value: s, label: s === "ALL" ? "All Status" : s.charAt(0) + s.slice(1).toLowerCase() }))} />
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
                    <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-blue-700">
                      <TbPlus size={12} /> Create New Group
                    </button>
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
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        <span className={`text-[11px] font-semibold ${st.text}`}>{st.label}</span>
                      </div>

                      <span className="text-[12px] text-caption">{group.createdAt}</span>

                      <ActionMenu status={group.status} />
                    </motion.div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="py-12 text-center text-sm text-caption">No groups match the current filters.</div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-white/[0.04] px-6 py-4">
                  <p className="text-[11px] text-caption">Showing 1–{filtered.length} of 1,482 entries</p>
                  <div className="flex items-center gap-0.5">
                    {([TbChevronsLeft, TbChevronLeft] as React.ElementType[]).map((Icon, i) => (
                      <button key={i} onClick={() => setPage(Math.max(1, page - 1))}
                        className="flex h-7 w-7 items-center justify-center rounded text-caption transition-colors hover:bg-white/[0.06] hover:text-slate-300">
                        <Icon size={13} />
                      </button>
                    ))}
                    {[1, 2, 3].map((n) => (
                      <button key={n} onClick={() => setPage(n)}
                        className={`h-7 w-7 rounded-full text-xs font-medium transition-colors ${
                          page === n ? "bg-blue-600 text-white" : "text-caption hover:bg-white/[0.06]"
                        }`}>{n}</button>
                    ))}
                    <span className="px-2 text-[11px] text-caption">… 149</span>
                    {([TbChevronRight, TbChevronsRight] as React.ElementType[]).map((Icon, i) => (
                      <button key={i} onClick={() => setPage(page + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded text-caption transition-colors hover:bg-white/[0.06] hover:text-slate-300">
                        <Icon size={13} />
                      </button>
                    ))}
                    <div className="ml-3 flex items-center gap-2 text-[11px] text-caption">
                      <span>Go to page:</span>
                      <input type="number" defaultValue={1} min={1} max={149}
                        className="w-12 rounded border border-white/[0.08] bg-transparent px-2 py-1 text-center text-xs text-slate-300 focus:border-blue-500/40 focus:outline-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
        </AnimatePresence>

      </main>
    </div>
  );
}
