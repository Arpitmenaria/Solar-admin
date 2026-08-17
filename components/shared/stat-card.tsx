import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  badge?: string;
  badgeClassName?: string;
  dot?: boolean;
  sub?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, badge, badgeClassName, dot, sub, className }: StatCardProps) {
  return (
    <div className={cn(
      "group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-card p-4 sm:p-5",
      "transition-all duration-200 cursor-default",
      "hover:border-blue-500/40 hover:bg-blue-500/[0.04]",
      "hover:-translate-y-[2px] hover:shadow-xl hover:shadow-blue-500/10",
      className
    )}>
      {/* Bottom glow accent */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-60" />

      {/* Row 1 — icon + badge/dot */}
      <div className="flex items-start justify-between">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.05]">
            <Icon size={17} strokeWidth={1.8} className="text-stat-icon" />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {badge && (
            <span className={cn(
              "rounded-full border border-emerald-400/25 bg-emerald-400/[0.12] px-2 py-0.5 text-[11px] font-semibold text-emerald-400",
              badgeClassName
            )}>
              {badge}
            </span>
          )}
          {dot && <span className="h-2 w-2 rounded-full bg-blue-500" />}
        </div>
      </div>

      {/* Row 2 — label */}
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">
        {label}
      </p>

      {/* Row 3 — value */}
      <p className="mt-1.5 text-[28px] sm:text-[40px] font-bold leading-none tracking-tight text-white">
        {value}
      </p>

      {/* Row 4 — sub */}
      {sub && <p className="mt-2 text-xs text-subtle">{sub}</p>}
    </div>
  );
}
