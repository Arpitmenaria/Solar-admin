"use client";

import { motion } from "framer-motion";
import { Award, CircleCheck, Timer, Users } from "lucide-react";
import { CreatePlanButton } from "@/components/plans/create-plan-button";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardSkeleton } from "@/components/shared/loading-skeleton";
import { formatNumberFull } from "@/lib/utils";
import type { PlanMetric } from "@/types";

const METRIC_ICON_MAP = {
  subscribers: Users,
  active: CircleCheck,
  free: Award,
  trial: Timer,
} as const;

const BLUE_BADGE =
  "rounded-full border-[#99CBFF]/30 bg-[#99CBFF]/15 text-[#99CBFF]";

function formatChangePercent(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value}%`;
}

interface PlansHeaderProps {
  metrics: PlanMetric[];
  isLoading?: boolean;
  onAddPlan?: () => void;
}

export function PlansHeader({ metrics, isLoading, onAddPlan }: PlansHeaderProps) {
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
            Plans
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
              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <StatCard
                    label={metric.label}
                    value={formatNumberFull(metric.value)}
                    icon={Icon}
                    badge={formatChangePercent(metric.changePercent)}
                    badgeClassName={BLUE_BADGE}
                  />
                </motion.div>
              );
            })}
      </div>
    </div>
  );
}
