"use client";

import dynamic from "next/dynamic";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardSkeleton } from "@/components/shared/loading-skeleton";
import { useDashboardStats, useModerationQueue, useChartData } from "@/hooks/use-users";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { VIOLATION_BADGE } from "@/constants/moderation";
import { Users, PauseCircle, UserPlus, MoreVertical, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ModerationItem } from "@/types";
import { motion } from "framer-motion";

const EngagementChart = dynamic(
  () => import("@/components/shared/engagement-chart").then((m) => m.EngagementChart),
  {
    ssr: false,
    loading: () => <div className="h-[180px] animate-pulse rounded-lg bg-white/[0.03]" />,
  }
);

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const FINANCIAL_STATS = (stats: ReturnType<typeof useDashboardStats>["data"]) => [
  { label: "Total Earnings",      value: formatCurrency(stats?.totalEarnings ?? 0),   color: "#99CBFF" },
  { label: "Monthly Earnings",    value: formatCurrency(stats?.monthlyEarnings ?? 0), color: "#ffffff" },
  { label: "Total Premium Users", value: formatNumber(stats?.totalPremiumUsers ?? 0), color: "#ffffff" },
];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: moderation } = useModerationQueue();
  const { data: chart } = useChartData();

  return (
    <main className="flex-1 space-y-5 p-6">
      {/* ── Page heading ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-[26px] font-bold text-white leading-snug">
          System Performance Overview
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-caption">
          Real-time telemetry from Social Flow&apos;s core infrastructure. High engagement detected in
          European clusters.
        </p>
      </motion.div>

      {/* ── 3 Stat cards ── */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate="show"
      >
        {statsLoading ? (
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <motion.div variants={fadeUp}>
              <StatCard label="Total Users" value={formatNumber(stats?.totalUsers ?? 0)} icon={Users} badge="+12%" />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard label="Active Users" value={formatNumber(stats?.activeUsers ?? 0)} icon={PauseCircle} dot sub="71% of total" />
            </motion.div>
            <motion.div variants={fadeUp}>
              <StatCard label="New Registrations" value={formatNumber(stats?.newRegistrations ?? 0)} icon={UserPlus} sub="This Month" />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* ── Chart + Moderation row ── */}
      <div className="grid grid-cols-[1fr_308px] gap-4">

        {/* Engagement chart card */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.12 }}
          className="flex flex-col rounded-xl border border-white/[0.07] bg-card p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Engagement Statistics</h3>
              <p className="mt-0.5 text-xs text-caption">Daily Active User (DAU) trends across all regions</p>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-caption">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" /> DAU
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-500" /> MAU
              </span>
            </div>
          </div>

          <div className="mt-5 h-[180px]">
            <EngagementChart data={chart ?? []} />
          </div>

          {/* Financial sub-stats */}
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.05] pt-5">
            {FINANCIAL_STATS(stats).map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-caption">{label}</p>
                <p className="mt-1.5 text-[18px] font-bold" style={{ color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Moderation Queue ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.16 }}
          className="flex flex-col rounded-xl border border-white/[0.07] bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Moderation Queue</h3>
            <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em] text-red-400">
              CRITICAL
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-caption">24 Pending Violations</p>

          <div className="mt-4 flex-1 space-y-2.5">
            {(moderation ?? []).map((item: ModerationItem) => (
              <div key={item.id} className="rounded-xl border border-white/[0.06] bg-surface-alt p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a2744] text-[10px] font-bold text-blue-400">
                      {item.username.replace("@", "").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold leading-none text-white">{item.username}</p>
                      <p className="mt-[3px] text-[10px] text-caption">Reported {item.reportedAt}</p>
                    </div>
                  </div>
                  <button aria-label="More options" className="text-dim transition-colors hover:text-slate-400">
                    <MoreVertical size={13} />
                  </button>
                </div>

                <div className="mt-2.5">
                  <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${VIOLATION_BADGE[item.type]}`}>
                    {item.type}
                  </span>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-caption">{item.excerpt}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/moderation"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.07] py-2.5 text-[12px] font-medium text-[#4a5a7a] transition-colors hover:bg-white/[0.03] hover:text-slate-300"
          >
            View All Reports <ArrowRight size={12} />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
