import { cn } from "@/lib/utils";

type GenericStatus = string;

const CONFIG: Record<string, { label: string; className: string }> = {
  OPTIMAL:     { label: "OPTIMAL",     className: "bg-emerald-500/[0.18] text-emerald-300 border border-emerald-500/40" },
  NORMAL:      { label: "NORMAL",      className: "bg-blue-500/[0.18] text-blue-300 border border-blue-500/40" },
  WARNING:     { label: "WARNING",     className: "bg-amber-500/[0.18] text-amber-300 border border-amber-500/40" },
  MAINTENANCE: { label: "MAINTENANCE", className: "bg-rose-500/[0.18] text-rose-300 border border-rose-500/40" },
  ONLINE:      { label: "ONLINE",      className: "bg-emerald-500/[0.18] text-emerald-300 border border-emerald-500/40" },
  STANDBY:     { label: "STANDBY",     className: "bg-slate-500/[0.18] text-slate-300 border border-slate-500/40" },
};

const FALLBACK = { label: "ACTIVE", className: "bg-blue-500/[0.18] text-blue-300 border border-blue-500/40" };

export function StatusBadge({ status }: { status: GenericStatus }) {
  const upper = (status || "").toUpperCase();
  const { label, className } = CONFIG[upper] ?? { label: upper || FALLBACK.label, className: FALLBACK.className };
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-2.5 py-[3px] text-[10px] font-bold tracking-widest uppercase",
        className
      )}
    >
      {label}
    </span>
  );
}
