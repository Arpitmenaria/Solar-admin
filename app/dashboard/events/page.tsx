"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbDownload, TbPlus, TbSearch, TbRefresh,
  TbMapPin,
  TbChevronsLeft, TbChevronsRight, TbChevronLeft, TbChevronRight,
  TbBan, TbCircleCheck,
  TbDatabaseImport,
  TbDotsVertical, TbEye, TbPencil, TbTrash,
} from "react-icons/tb";
import { CustomSelect } from "@/components/shared/custom-select";
import { formatNumberFull, cn } from "@/lib/utils";
import type { EventCategory, EventItem, EventStatus } from "@/constants/mock-data";
import { useEvents, useEventStats } from "@/hooks/use-events";
import { CATEGORY_ICON, CAT_BADGE, STATUS_STYLES } from "@/components/events/event-meta";
import { EventActionDialog, type PendingEventAction } from "@/components/events/event-action-dialog";

/* ── Nav tabs — text only, no numbers ───────── */
const EVENT_TABS = [
  { label: "TOTAL EVENTS", id: "total"     },
  { label: "UPCOMING",     id: "upcoming"  },
  { label: "ONGOING",      id: "ongoing"   },
  { label: "COMPLETED",    id: "completed" },
  { label: "CANCELLED",    id: "cancelled" },
] as const;

type TabId = typeof EVENT_TABS[number]["id"];

const STATUS_OPTS:   ("ALL" | EventStatus)[]   = ["ALL", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];
const CATEGORY_OPTS: ("ALL" | EventCategory)[] = ["ALL", "Music", "Tech", "Business", "Art", "Workshop", "Social"];

/* ── ActionMenu (portal, fixed) ─────────────── */
function ActionMenu({ event, onAction }: { event: EventItem; onAction: (action: "CANCEL" | "REINSTATE" | "DELETE") => void }) {
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
        aria-label={`Actions for ${event.name}`}
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
                href={`/dashboard/events/${event.id}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.07)]"
              >
                <TbEye size={14} /> View Details
              </Link>
              <Link
                href={`/dashboard/events/${event.id}/edit`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.07)]"
              >
                <TbPencil size={14} /> Edit Event
              </Link>
              {event.status === "CANCELLED" ? (
                <button
                  onClick={() => { setOpen(false); onAction("REINSTATE"); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-emerald-400 transition-colors hover:bg-[rgba(16,185,129,0.12)]"
                >
                  <TbCircleCheck size={14} /> Reinstate
                </button>
              ) : (
                <button
                  onClick={() => { setOpen(false); onAction("CANCEL"); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-orange-400 transition-colors hover:bg-[rgba(249,115,22,0.12)]"
                >
                  <TbBan size={14} /> Cancel
                </button>
              )}
              <button
                onClick={() => { setOpen(false); onAction("DELETE"); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-red-400 transition-colors hover:bg-[rgba(239,68,68,0.12)]"
              >
                <TbTrash size={14} /> Delete Event
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
export default function EventsPage() {
  const { data: events = [] } = useEvents();
  const { data: stats } = useEventStats();
  const [activeTab, setActiveTab] = useState<TabId>("total");
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState<"ALL" | EventCategory>("ALL");
  const [status,    setStatus]    = useState<"ALL" | EventStatus>("ALL");
  const [page,      setPage]      = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingEventAction | null>(null);

  const handleTabClick = (id: TabId) => {
    setActiveTab(id);
    setSearch(""); setCategory("ALL"); setStatus("ALL"); setPage(1);
  };

  // Tab-level base filter applied on top of user's manual filters
  const TAB_CONFIG: Record<TabId, {
    label: string; statValue: number; sub: string; icon: React.ElementType;
    baseFilter: (e: EventItem) => boolean;
  }> = {
    total:     { label: "TOTAL EVENTS", statValue: stats?.totalEvents ?? 0, sub: "+8.2% vs last month", icon: TbDatabaseImport, baseFilter: () => true },
    upcoming:  { label: "UPCOMING",     statValue: stats?.upcoming ?? 0,    sub: "Scheduled ahead",     icon: TbDatabaseImport, baseFilter: (e) => e.status === "UPCOMING"  },
    ongoing:   { label: "ONGOING",      statValue: stats?.ongoing ?? 0,     sub: "Happening now",       icon: TbDatabaseImport, baseFilter: (e) => e.status === "ONGOING"   },
    completed: { label: "COMPLETED",    statValue: stats?.completed ?? 0,   sub: "Wrapped up",          icon: TbDatabaseImport, baseFilter: (e) => e.status === "COMPLETED" },
    cancelled: { label: "CANCELLED",    statValue: stats?.cancelled ?? 0,   sub: "Called off",          icon: TbDatabaseImport, baseFilter: (e) => e.status === "CANCELLED" },
  };

  const tabCfg = TAB_CONFIG[activeTab];

  const filtered = events.filter((e) => {
    if (!tabCfg.baseFilter(e)) return false;
    if (search   && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "ALL" && e.category !== category) return false;
    if (status   !== "ALL" && e.status   !== status)   return false;
    return true;
  });

  const resetFilters = () => {
    setSearch(""); setCategory("ALL"); setStatus("ALL"); setPage(1);
  };

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">

        {/* ── Flat nav tab bar ── */}
        <div className="overflow-x-auto border-b border-white/[0.08]" style={{ scrollbarWidth: "none" }}>
          <div className="flex min-w-max">
            {EVENT_TABS.map((tab, i) => (
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
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-caption">Status</span>
                    <CustomSelect size="sm" value={status} onChange={(v) => { setStatus(v as typeof status); setPage(1); }}
                      options={STATUS_OPTS.map((s) => ({ value: s, label: s === "ALL" ? "All Status" : s.charAt(0) + s.slice(1).toLowerCase() }))} />
                  </div>
                  <div className="relative">
                    <TbSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-caption" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      placeholder="Search events..."
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
                      href="/dashboard/events/create"
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <TbPlus size={12} /> Create New Event
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Event Directory table */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.22 }}
                className="overflow-hidden rounded-xl border border-white/[0.08] bg-card"
              >

                {/* Table header */}
                <div className="grid grid-cols-[2.5fr_120px_140px_160px_110px_120px_120px_60px] gap-4 border-b border-white/[0.07] bg-white/[0.025] px-6 py-4">
                  {[
                    { label: "EVENT NAME",   cls: ""            },
                    { label: "CATEGORY",     cls: ""            },
                    { label: "LOCATION",     cls: ""            },
                    { label: "HOST",         cls: ""            },
                    { label: "ATTENDEES",    cls: "text-center" },
                    { label: "EVENT DATE",   cls: ""            },
                    { label: "STATUS",       cls: ""            },
                    { label: "ACTIONS",      cls: "text-center" },
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
                {filtered.map((event, i) => {
                  const CatIcon = CATEGORY_ICON[event.category];
                  const st = STATUS_STYLES[event.status];
                  return (
                    <motion.div key={event.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-[2.5fr_120px_140px_160px_110px_120px_120px_60px] items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: event.iconColor + "33", border: `1px solid ${event.iconColor}55` }}>
                          <CatIcon size={16} style={{ color: event.iconColor }} />
                        </div>
                        <span className="truncate text-[13px] font-semibold text-white">{event.name}</span>
                      </div>

                      <span className={`inline-flex w-fit items-center rounded border px-2 py-[3px] text-[10px] font-semibold tracking-wide ${CAT_BADGE[event.category]}`}>
                        {event.category}
                      </span>

                      <div className="flex min-w-0 items-center gap-1.5 text-[12px] text-slate-300">
                        <TbMapPin size={13} className="shrink-0 text-caption" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      <div className="flex min-w-0 items-center gap-2">
                        {event.host.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={event.host.avatarUrl} alt={event.host.name} className="h-7 w-7 shrink-0 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a2744] text-[10px] font-bold text-blue-400">
                            {event.host.initials}
                          </div>
                        )}
                        <span className="truncate text-[12px] text-slate-200">{event.host.name}</span>
                      </div>

                      <span className="text-center text-[13px] font-medium text-slate-200">{formatNumberFull(event.attendees)}</span>

                      <span className="text-[12px] text-caption">{event.eventDate}</span>

                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        <span className={`text-[11px] font-semibold ${st.text}`}>{st.label}</span>
                      </div>

                      <ActionMenu
                        event={event}
                        onAction={(action) => setPendingAction({ action, eventId: event.id, eventName: event.name })}
                      />
                    </motion.div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="py-12 text-center text-sm text-caption">No events match the current filters.</div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-white/[0.04] px-6 py-4">
                  <p className="text-[11px] text-caption">Showing 1–{filtered.length} of {formatNumberFull(stats?.totalEvents ?? filtered.length)} entries</p>
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

      <EventActionDialog pending={pendingAction} onClose={() => setPendingAction(null)} />
    </div>
  );
}
