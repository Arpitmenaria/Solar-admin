"use client";

// Security: Clean build deployed - malicious code removed
console.log("[Dashboard] Loaded securely");

import dynamic from "next/dynamic";
import { useState } from "react";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardSkeleton } from "@/components/shared/loading-skeleton";
import { useDashboardStats, useChartData } from "@/hooks/use-users";
import { formatNumber, formatCurrency, cn } from "@/lib/utils";
import { Users, UserCheck, UserPlus, Flag } from "lucide-react";
import { motion } from "framer-motion";
import type { ChartPeriod } from "@/types";

const PERIODS: { key: ChartPeriod; label: string }[] = [
  { key: "daily",   label: "Daily"   },
  { key: "weekly",  label: "Weekly"  },
  { key: "monthly", label: "Monthly" },
  { key: "yearly",  label: "Yearly"  },
];

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
  const [period, setPeriod] = useState<ChartPeriod>("weekly");
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: chart, isLoading: chartLoading, isError: chartError, error: chartErrorObj } = useChartData(period);

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Engagement Statistics</h3>
            <p className="mt-0.5 text-xs text-caption">Total vs. premium user growth across all regions</p>
          </div>
          <div className="flex flex-col items-start gap-2.5 sm:items-end">
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.02] p-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                    period === p.key
                      ? "bg-blue-600 text-white"
                      : "text-caption hover:text-white"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-[12px] text-caption">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" /> Total Users
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "#f5b642" }} /> Premium Users
              </span>
            </div>
          </div>
        </div>

        {/* Chart — flex-1 so it fills remaining card height, no blank gap */}
        <div className="mt-5 flex-1 min-h-[220px]">
          {chartError ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 rounded-lg border border-red-500/20 bg-red-500/[0.03] text-center">
              <p className="text-[13px] font-medium text-red-400">Couldn&apos;t load engagement data</p>
              <p className="max-w-xs text-[12px] text-caption">
                {(chartErrorObj as { message?: string } | null)?.message || "Unknown error"}
              </p>
            </div>
          ) : chart && chart.length > 0 ? (
            // key={period} forces a full remount per period — Recharts'
            // ResponsiveContainer only re-measures on an actual container
            // resize, so swapping just the `data` prop in place can leave a
            // stale (or blank) SVG when switching tabs without resizing.
            <EngagementChart key={period} data={chart} />
          ) : chartLoading ? (
            <div className="h-full animate-pulse rounded-lg bg-white/[0.03]" />
          ) : (
            <div className="flex h-full items-center justify-center text-[13px] text-caption">
              No engagement data for this period yet.
            </div>
          )}
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
