"use client";

import { motion } from "framer-motion";
import { TbCheck, TbPencil, TbTrash } from "react-icons/tb";
import type { Plan } from "@/types";

interface PlanCardProps {
  plan: Plan;
  index?: number;
  onEdit?: (plan: Plan) => void;
  onDelete?: (plan: Plan) => void;
}

export function PlanCard({ plan, index = 0, onEdit, onDelete }: PlanCardProps) {
  const formattedPrice = `${plan.currency}${plan.price.toLocaleString()}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.2 }}
      className="w-[380px] shrink-0 rounded-xl border border-white/[0.08] bg-card p-6 transition-all duration-200 hover:border-blue-500/40 hover:bg-blue-500/[0.04] hover:-translate-y-[2px] hover:shadow-xl hover:shadow-blue-500/10 md:w-[420px] md:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold uppercase tracking-wide text-white md:text-2xl">
            {plan.name}
          </h2>
          {plan.description && (
            <p className="mt-1.5 max-w-md text-[12.5px] text-caption">{plan.description}</p>
          )}
          <p className="mt-3 flex flex-wrap items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-[#99CBFF] md:text-5xl">
              {formattedPrice}
            </span>
            <span className="text-sm font-semibold uppercase tracking-wider text-caption">
              {plan.billingPeriod}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(plan)}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label={`Edit ${plan.name}`}
          >
            <TbPencil size={12} /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(plan)}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-red-400"
            aria-label={`Delete ${plan.name}`}
          >
            <TbTrash size={12} /> Delete
          </button>
        </div>
      </div>

      <div className="mt-8 border-t border-white/[0.06] pt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-caption">
          Key Performance Indicators
        </p>
        <div className="mt-1 mb-5 h-px w-full bg-white/[0.06]" />

        <ul className="space-y-4">
          {plan.features.map((feature, i) => (
            <motion.li
              key={`${plan.id}-${feature}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 + i * 0.04 }}
              className="flex items-center gap-3"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <TbCheck size={12} className="text-white" aria-hidden />
              </span>
              <span className="text-[13px] font-medium text-white">{feature}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
