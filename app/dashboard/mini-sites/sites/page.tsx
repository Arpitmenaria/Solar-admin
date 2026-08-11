"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Radio, Eye as EyeIcon, Lock, KeyRound, Search, RotateCcw,
  ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, ArrowUpDown,
  MoreVertical, ExternalLink,
} from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { CustomSelect } from "@/components/shared/custom-select";
import { DatePicker } from "@/components/shared/date-picker";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { PaginationButton } from "@/components/shared/pagination-button";
import { useMiniSites } from "@/hooks/use-mini-sites";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatNumberFull, formatDate, na, cn } from "@/lib/utils";
import type { MiniSite, SiteStatus, SiteVisibility } from "@/constants/mini-sites-mock-data";

const PAGE_SIZE = 8;
const COLS = "grid-cols-[minmax(220px,2.4fr)_minmax(150px,1.4fr)_120px_130px_100px_130px_60px]";
const MIN_W = "min-w-[1040px]";

/** Demo public URL for a mini site. Swap the base for the real host later. */
export const siteLiveUrl = (slug: string) => `https://sites.kickcatalyst.app/${slug}`;

const STATUS_STYLE: Record<SiteStatus, { label: string; dot: string; text: string }> = {
  LIVE:      { label: "Live",      dot: "bg-emerald-400", text: "text-emerald-300" },
  DRAFT:     { label: "Draft",     dot: "bg-slate-400",   text: "text-slate-300"   },
  SUSPENDED: { label: "Suspended", dot: "bg-red-400",     text: "text-red-300"     },
};

const VIS_STYLE: Record<SiteVisibility, { label: string; icon: typeof Lock; className: string }> = {
  PUBLIC:   { label: "Public",   icon: Globe,    className: "border-blue-500/30 text-blue-300"     },
  PRIVATE:  { label: "Private",  icon: Lock,     className: "border-slate-500/30 text-slate-300"   },
  PASSWORD: { label: "Password", icon: KeyRound, className: "border-amber-500/30 text-amber-300"   },
};

const STATUS_OPTS = [
  { value: "ALL", label: "All Status" },
  { value: "LIVE", label: "Live" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUSPENDED", label: "Suspended" },
];
const VIS_OPTS = [
  { value: "ALL", label: "All Visibility" },
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Private" },
  { value: "PASSWORD", label: "Password" },
];
const SORT_OPTS = [
  { value: "views", label: "Sort: Views" },
  { value: "updatedAt", label: "Sort: Updated" },
  { value: "createdAt", label: "Sort: Created" },
];

type SortKey = "views" | "updatedAt" | "createdAt";

export default function MiniSitesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | SiteStatus>("ALL");
  const [visibility, setVisibility] = useState<"ALL" | SiteVisibility>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortKey>("views");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading } = useMiniSites({
    search: debouncedSearch,
    status: status === "ALL" ? "" : status,
    visibility: visibility === "ALL" ? "" : visibility,
    startDate: from,
    endDate: to,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  const paginated = data?.data ?? [];
  const stats = data?.stats;
  const statsLoading = isLoading;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const safePage = Math.min(page, totalPages);

  const resetFilters = () => {
    setSearch(""); setStatus("ALL"); setVisibility("ALL"); setFrom(""); setTo(""); setSort("views"); setPage(1);
  };

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Mini Sites</h1>
          <p className="mt-1 text-sm text-muted-foreground">All published mini sites across the platform — read-only.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {statsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="TOTAL SITES"    value={formatNumberFull(stats?.totalSites ?? 0)}    icon={Globe} />
              <StatCard label="LIVE SITES"     value={formatNumberFull(stats?.liveSites ?? 0)}     icon={Radio} sub="Published" />
              <StatCard label="PUBLIC"         value={formatNumberFull(stats?.publicSites ?? 0)}   icon={EyeIcon} />
              <StatCard label="PRIVATE"        value={formatNumberFull(stats?.privateSites ?? 0)}  icon={Lock} />
              <StatCard label="PASSWORD"       value={formatNumberFull(stats?.passwordSites ?? 0)} icon={KeyRound} />
            </>
          )}
        </div>

        {/* Directory */}
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <div className="relative w-[220px] shrink-0 sm:w-[240px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4d6a]" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search name, creator, slug…"
                aria-label="Search sites"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-[12px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-blue-500/40 focus:bg-white/[0.05] focus:outline-none"
              />
            </div>
            <CustomSelect size="sm" value={status} onChange={(v) => { setStatus(v as typeof status); setPage(1); }} options={STATUS_OPTS} />
            <CustomSelect size="sm" value={visibility} onChange={(v) => { setVisibility(v as typeof visibility); setPage(1); }} options={VIS_OPTS} />
            <DatePicker size="sm" value={from} onChange={(v) => { setFrom(v); setPage(1); }} placeholder="From" />
            <DatePicker size="sm" value={to} onChange={(v) => { setTo(v); setPage(1); }} placeholder="To" />
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={12} className="text-caption" />
              <CustomSelect size="sm" value={sort} onChange={(v) => setSort(v as SortKey)} options={SORT_OPTS} />
            </div>
            <button onClick={resetFilters} className="flex items-center gap-1 text-[11px] font-medium text-[#99CBFF] transition-colors hover:text-white">
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <div className="overflow-x-auto border-t border-white/[0.06]">
            <div className={cn("grid gap-4 border-b border-white/[0.05] bg-white/[0.025] px-6 py-3", COLS, MIN_W)}>
              {["SITE", "CREATOR", "STATUS", "VISIBILITY", "VIEWS", "UPDATED", "ACTIONS"].map((h, i) => (
                <span key={h} className={cn("text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400", i === 4 && "text-center", i === 6 && "text-center")}>{h}</span>
              ))}
            </div>

            {isLoading ? (
              <div className="px-6">{Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
            ) : (
              <div className={MIN_W}>
                {paginated.map((site, i) => <SiteRow key={site.id} site={site} index={i} />)}
                {paginated.length === 0 && (
                  <div className="py-14 text-center text-sm text-caption">No sites match the current filters.</div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-[11px] text-caption">
                {total > 0
                  ? `Showing ${formatNumberFull((safePage - 1) * PAGE_SIZE + 1)}–${formatNumberFull(Math.min(safePage * PAGE_SIZE, total))} of ${formatNumberFull(total)} sites`
                  : "No sites"}
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
    </div>
  );
}

function SiteRow({ site, index }: { site: MiniSite; index: number }) {
  const st = STATUS_STYLE[site.status];
  const vis = VIS_STYLE[site.visibility];
  const VisIcon = vis.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className={cn("grid items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors hover:bg-white/[0.02]", COLS)}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.05]">
          <Globe size={16} strokeWidth={1.8} className="text-stat-icon" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-white">{na(site.name)}</p>
          <p className="truncate text-[11px] text-caption">/{site.slug}</p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <UserAvatar src={site.creator.avatarUrl} name={site.creator.name} size="sm" />
        <span className="truncate text-[12px] text-slate-200">{na(site.creator.name)}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
        <span className={cn("text-[11px] font-semibold", st.text)}>{st.label}</span>
      </div>

      <span className={cn("inline-flex w-fit items-center gap-1 rounded border px-2 py-[3px] text-[10px] font-semibold", vis.className)}>
        <VisIcon size={10} /> {vis.label}
      </span>

      <span className="text-center text-[13px] font-medium text-slate-200">{formatNumberFull(site.views)}</span>

      <span className="text-[12px] text-caption">{formatDate(site.updatedAt)}</span>

      <SiteActionMenu site={site} />
    </motion.div>
  );
}

/* ── ActionMenu (portal, fixed) — View Details + Open live site ── */
function SiteActionMenu({ site }: { site: MiniSite }) {
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

  return (
    <div className="flex justify-center">
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label={`Actions for ${site.name}`}
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
              <Link
                href={`/dashboard/mini-sites/sites/${site.id}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.07)]"
              >
                <EyeIcon size={14} /> View Details
              </Link>
              <a
                href={site.url || siteLiveUrl(site.slug)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-[#99CBFF] transition-colors hover:bg-[rgba(255,255,255,0.07)]"
              >
                <ExternalLink size={14} /> Open Live Site
              </a>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
