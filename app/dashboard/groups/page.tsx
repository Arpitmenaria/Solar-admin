"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbDownload, TbPlus, TbSearch, TbRefresh, TbArrowLeft,
  TbCode, TbShieldCheck, TbDeviceGamepad2, TbUsers, TbLock, TbWorld,
  TbChevronsLeft, TbChevronsRight, TbChevronLeft, TbChevronRight,
  TbActivity, TbClock, TbBan, TbSparkles,
  TbDatabaseImport, TbPalette, TbCurrencyDollar, TbAlertTriangle,
} from "react-icons/tb";
import { Header } from "@/components/layouts/header";
import { formatNumberFull } from "@/lib/utils";
import { MOCK_GROUPS, MOCK_GROUP_STATS } from "@/constants/mock-data";
import type { GroupCategory, GroupPrivacy, GroupStatus } from "@/constants/mock-data";

/* ── stat card → filter mapping ─────────────── */
type StatFilter = {
  status?:  "ALL" | GroupStatus;
  privacy?: "ALL" | GroupPrivacy;
};

const GROUP_STATS: {
  label: string; value: number; sub: string;
  icon: React.ElementType; valueColor: string;
  filter: StatFilter;
}[] = [
  { label: "TOTAL GROUPS",        value: MOCK_GROUP_STATS.totalGroups,     sub: "+12.5% vs last month",    icon: TbDatabaseImport, valueColor: "#e2e8f0", filter: {}                                 },
  { label: "ACTIVE GROUPS",       value: MOCK_GROUP_STATS.activeGroups,    sub: "89.1% Activity Rate",     icon: TbActivity,       valueColor: "#99CBFF", filter: { status: "ACTIVE"    }            },
  { label: "PENDING APPROVAL",    value: MOCK_GROUP_STATS.pendingApproval, sub: "Avg processing: 4.2h",    icon: TbClock,          valueColor: "#e2e8f0", filter: { status: "PENDING"   }            },
  { label: "PRIVATE GROUPS",      value: MOCK_GROUP_STATS.privateGroups,   sub: "29% of ecosystem",        icon: TbLock,           valueColor: "#e2e8f0", filter: { privacy: "Private"  }            },
  { label: "PUBLIC GROUPS",       value: MOCK_GROUP_STATS.publicGroups,    sub: "71% of ecosystem",        icon: TbWorld,          valueColor: "#e2e8f0", filter: { privacy: "Public"   }            },
  { label: "REPORTED GROUPS",     value: MOCK_GROUP_STATS.reportedGroups,  sub: "Urgent Review Required",  icon: TbAlertTriangle,  valueColor: "#f97316", filter: { status: "REPORTED"  }            },
  { label: "SUSPENDED",           value: MOCK_GROUP_STATS.suspended,       sub: "-2 from yesterday",       icon: TbBan,            valueColor: "#e2e8f0", filter: { status: "SUSPENDED" }            },
  { label: "NEWLY CREATED (24H)", value: MOCK_GROUP_STATS.newlyCreated24h, sub: "Velocity: 3.5 groups/hr", icon: TbSparkles,       valueColor: "#e2e8f0", filter: {}                                 },
];

/* ── icon / badge / status maps ─────────────── */
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

/* ───────────────────────────────────────────── */
export default function GroupsPage() {
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState<"ALL" | GroupCategory>("ALL");
  const [privacy,    setPrivacy]     = useState<"ALL" | GroupPrivacy>("ALL");
  const [status,     setStatus]      = useState<"ALL" | GroupStatus>("ALL");
  const [page,       setPage]        = useState(1);

  /* directory is hidden by default — only shown after clicking TOTAL GROUPS */
  const [showDirectory, setShowDirectory] = useState(false);

  const handleStatClick = (stat: typeof GROUP_STATS[number]) => {
    if (stat.label !== "TOTAL GROUPS") return; // only Total Groups opens directory
    setStatus("ALL");
    setPrivacy("ALL");
    setSearch("");
    setCategory("ALL");
    setPage(1);
    setShowDirectory(true);
  };

  const handleBack = () => {
    setShowDirectory(false);
    setStatus("ALL");
    setPrivacy("ALL");
    setSearch("");
    setCategory("ALL");
    setPage(1);
  };

  const filtered = MOCK_GROUPS.filter((g) => {
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
      <Header
        title="Group Management"
        breadcrumbs={[
          { label: "Admin",      href: "/dashboard"        },
          { label: "Management", href: "/dashboard/groups" },
          { label: "Group List"                            },
        ]}
      />

      <main className="flex-1 space-y-6 p-6">

        {/* ── 8 stat cards — always visible ── */}
        <div>
              {/* 2-row grid (4 per row), scrollable horizontally on small screens */}
              <div className="overflow-x-auto pb-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}>
                <div className="grid grid-cols-4 gap-4 min-w-[720px]">
                  {GROUP_STATS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.button
                        key={s.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleStatClick(s)}
                        className={`rounded-xl border bg-card p-5 text-left transition-all ${
                          s.label === "TOTAL GROUPS"
                            ? "border-blue-500/20 hover:border-blue-500/50 hover:bg-white/[0.03] cursor-pointer"
                            : "border-white/[0.07] cursor-default opacity-90"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle leading-tight pr-2">
                            {s.label}
                          </p>
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] shrink-0">
                            <Icon size={14} style={{ color: "#4d6b90" }} />
                          </div>
                        </div>
                        <p className="text-[32px] font-bold leading-none tracking-tight" style={{ color: s.valueColor }}>
                          {formatNumberFull(s.value)}
                        </p>
                        <p className="mt-2 text-[11px]" style={{
                          color: s.valueColor === "#f97316" ? "#f97316"
                               : s.valueColor === "#99CBFF" ? "#99CBFF"
                               : "#4d6480"
                        }}>
                          {s.sub}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
        </div>

        {/* ── Group Directory — only shown after clicking TOTAL GROUPS ── */}
        <AnimatePresence>
        {showDirectory && (
        <motion.div
          key="directory"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden rounded-xl border border-white/[0.08] bg-card"
        >

          {/* Card header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
            <div className="flex items-center gap-3">
              {/* Back button — shown in directory-only mode */}
              <AnimatePresence>
                {showDirectory && (
                  <motion.button
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    onClick={handleBack}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-caption transition-colors hover:text-slate-200 hover:bg-white/[0.06]"
                  >
                    <TbArrowLeft size={13} /> Back
                  </motion.button>
                )}
              </AnimatePresence>

              <h2 className="text-xl font-bold text-white">Group Directory</h2>

              <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-caption">
                1,482 Total Nodes
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.06]">
                <TbDownload size={13} /> Export CSV
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700">
                <TbPlus size={13} /> Create New Group
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 border-b border-white/[0.05] px-6 py-4">
            {/* Category */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-caption">Category</span>
              <select value={category} onChange={(e) => { setCategory(e.target.value as typeof category); setPage(1); }}
                className="rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none appearance-none pr-7 cursor-pointer"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7a99' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}>
                {CATEGORY_OPTS.map((c) => <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>)}
              </select>
            </div>

            {/* Privacy */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-caption">Privacy</span>
              <div className="flex items-center rounded-lg border border-white/[0.10] bg-white/[0.03] p-0.5">
                {PRIVACY_TABS.map((t) => (
                  <button key={t.value} onClick={() => { setPrivacy(t.value); setPage(1); }}
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all ${
                      privacy === t.value ? "bg-blue-600 text-white" : "text-caption hover:text-slate-300"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-caption">Status</span>
              <select value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }}
                className="rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none appearance-none pr-7 cursor-pointer"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7a99' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}>
                {STATUS_OPTS.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Status" : s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
              </select>
            </div>

            {/* Search */}
            <div className="relative ml-auto">
              <TbSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-caption" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search groups..."
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-8 pr-4 text-xs text-slate-200 placeholder:text-caption focus:border-blue-500/40 focus:outline-none w-52" />
            </div>

            <button onClick={resetFilters}
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#99CBFF] transition-colors hover:text-white">
              <TbRefresh size={13} /> Reset All Filters
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2.5fr_120px_110px_160px_110px_100px_120px] gap-4 border-b border-white/[0.05] px-6 py-3 text-label">
            <span>GROUP NAME</span>
            <span>CATEGORY</span>
            <span>PRIVACY</span>
            <span>OWNER/ADMIN</span>
            <span className="text-center">MEMBERS</span>
            <span className="text-center">POSTS</span>
            <span>STATUS</span>
          </div>

          {/* Table rows */}
          {filtered.map((group, i) => {
            const CatIcon = CATEGORY_ICON[group.category];
            const st = STATUS_STYLES[group.status];
            return (
              <motion.div key={group.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[2.5fr_120px_110px_160px_110px_100px_120px] items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors hover:bg-white/[0.02]"
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
              {[TbChevronsLeft, TbChevronLeft].map((Icon, i) => (
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
              {[TbChevronRight, TbChevronsRight].map((Icon, i) => (
                <button key={i} onClick={() => setPage(page + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded text-caption transition-colors hover:bg-white/[0.06] hover:text-slate-300">
                  <Icon size={13} />
                </button>
              ))}
              <div className="ml-3 flex items-center gap-2 text-[11px] text-caption">
                <span>Go to page:</span>
                <input type="number" defaultValue={1} min={1} max={149}
                  className="w-12 rounded border border-white/[0.08] bg-transparent px-2 py-1 text-center text-xs text-slate-300 focus:outline-none focus:border-blue-500/40" />
              </div>
            </div>
          </div>
        </motion.div>
        )}
        </AnimatePresence>

      </main>
    </div>
  );
}
