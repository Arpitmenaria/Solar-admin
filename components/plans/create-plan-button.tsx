"use client";

import Link from "next/link";
import { TbPlus } from "react-icons/tb";
import { cn } from "@/lib/utils";

interface CreatePlanButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  label?: string;
}

export function CreatePlanButton({
  href = "/dashboard/plans/create",
  onClick,
  className,
  label = "Add Plans",
}: CreatePlanButtonProps) {
  const styles = cn(
    "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2",
    "text-[11px] font-bold uppercase tracking-wider",
    "bg-[#facc15] text-[#0a0f1a]",
    "transition-all duration-150",
    "hover:bg-[#fde047] hover:shadow-lg hover:shadow-yellow-500/20",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080c16]",
    className
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={styles} aria-label={label}>
        <TbPlus size={14} />
        {label}
      </button>
    );
  }

  return (
    <Link href={href} className={styles} aria-label={label}>
      <TbPlus size={14} />
      {label}
    </Link>
  );
}
