"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Crown, Timer, Users, type LucideIcon } from "lucide-react";
import { CreatePlanButton } from "@/components/plans/create-plan-button";
import { StatCardSkeleton } from "@/components/shared/loading-skeleton";
import { cn, formatNumberFull } from "@/lib/utils";
import type { PlanMetric } from "@/types";

const METRIC_ICON_MAP: Record<PlanMetric["icon"], LucideIcon> = {
  subscribers: Users,
  trial: Timer,
  gold: Award,
  premium: Crown,
};

const PERIOD_ROWS: { key: keyof PlanMetric["breakdown"]; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "yearly", label: "Yearly" },
];

interface PlansHeaderProps {
  metrics: PlanMetric[];
  isLoading?: boolean;
  onAddPlan?: () => void;
}

export function PlansHeader({ metrics, isLoading, onAddPlan }: PlansHeaderProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Title row + CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0"
        >
          <h1 className="text-[26px] font-bold leading-snug text-white">
            Plans &amp; Subscriptions
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-caption">
            Manage pricing tiers, monitor subscriber metrics, and configure plan features.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="shrink-0 self-start sm:self-auto"
        >
          <CreatePlanButton onClick={onAddPlan} />
        </motion.div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : metrics.map((metric, i) => {
              const Icon = METRIC_ICON_MAP[metric.icon];
              const expanded = expandedId === metric.id;
              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : metric.id)}
                    aria-expanded={expanded}
                    className={cn(
                      "group relative flex w-full flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-card p-5 text-left",
                      "transition-all duration-200",
                      "hover:border-blue-500/40 hover:bg-blue-500/[0.04]",
                      "hover:-translate-y-[2px] hover:shadow-xl hover:shadow-blue-500/10",
                      expanded && "border-blue-500/50 bg-blue-500/[0.05]"
                    )}
                  >
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-60" />

                    <div className="flex items-start justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.05]">
                        <Icon size={17} strokeWidth={1.8} className="text-stat-icon" />
                      </div>
                    </div>

                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">
                      {metric.label}
                    </p>

                    <p className="mt-1.5 text-[40px] font-bold leading-none tracking-tight text-white">
                      {formatNumberFull(metric.value)}
                    </p>

                    <p className="mt-2 text-[11px] font-medium text-[#99CBFF]">
                      {expanded ? "Hide breakdown" : "View by period"}
                    </p>
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-[#0d1321] p-3">
                          {PERIOD_ROWS.map((row) => (
                            <div key={row.key} className="rounded-lg bg-white/[0.03] px-3 py-2">
                              <p className="text-[9px] font-semibold uppercase tracking-wider text-caption">
                                {row.label}
                              </p>
                              <p className="mt-0.5 text-[15px] font-bold text-white">
                                {formatNumberFull(metric.breakdown[row.key])}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
      </div>
    </div>
  );
}
