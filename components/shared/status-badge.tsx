import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types";

const CONFIG: Record<UserStatus, { label: string; className: string }> = {
  PREMIUM:  { label: "PREMIUM",  className: "bg-yellow-500/[0.18] text-yellow-300 border border-yellow-500/40" },
  ACTIVE:   { label: "ACTIVE",   className: "bg-emerald-500/[0.18] text-emerald-300 border border-emerald-500/40" },
  INACTIVE: { label: "INACTIVE", className: "bg-slate-500/[0.18] text-slate-300 border border-slate-500/40" },
  FLAGGED:  { label: "FLAGGED",  className: "bg-red-500/[0.18] text-red-300 border border-red-500/40" },
  NEW:      { label: "NEW",      className: "bg-blue-500/[0.18] text-blue-300 border border-blue-500/40" },
};

export function StatusBadge({ status }: { status: UserStatus }) {
  const { label, className } = CONFIG[status];
  return (
    /* w-fit prevents the span from stretching inside a CSS Grid cell */
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-3 py-[5px] text-[10px] font-bold tracking-widest",
        className
      )}
    >
      {label}
    </span>
  );
}
