"use client";

import dynamic from "next/dynamic";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardSkeleton } from "@/components/shared/loading-skeleton";
import { useDashboardStats, useChartData } from "@/hooks/use-users";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { Users, UserCheck, UserPlus, Flag } from "lucide-react";
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
  const { data: chart } = useChartData();

  return (
    <main className="flex-1 space-y-5 p-4 md:p-6">
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

      {/* ── 4 Stat cards ── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate="show"
      >
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <motion.div variants={fadeUp} className="flex">
              <StatCard label="Total Users" value={formatNumber(stats?.totalUsers ?? 0)} icon={Users} className="flex-1" />
            </motion.div>
            <motion.div variants={fadeUp} className="flex">
              <StatCard label="Premium Users" value={formatNumber(stats?.premiumUsers ?? 0)} icon={UserCheck} className="flex-1" />
            </motion.div>
            <motion.div variants={fadeUp} className="flex">
              <StatCard label="New Sign Up" value={formatNumber(stats?.newSignups ?? 0)} icon={UserPlus} sub="Today" className="flex-1" />
            </motion.div>
            <motion.div variants={fadeUp} className="flex">
              <StatCard label="Flagged Users" value={formatNumber(stats?.flaggedUsers ?? 0)} icon={Flag} sub="Needs review" className="flex-1" />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* ── Engagement Statistics ── */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.12 }}
        className="flex w-full flex-col rounded-xl border border-white/[0.07] bg-card p-5"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
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

        {/* Chart — flex-1 so it fills remaining card height, no blank gap */}
        <div className="mt-5 flex-1 min-h-[220px]">
          {chart && chart.length > 0
            ? <EngagementChart data={chart} />
            : <div className="h-full animate-pulse rounded-lg bg-white/[0.03]" />
          }
        </div>

        {/* Financial sub-stats — pinned to bottom via mt-auto */}
        <div className="mt-auto grid grid-cols-1 gap-3 border-t border-white/[0.05] pt-5 sm:grid-cols-3">
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
    </main>
  );
}
