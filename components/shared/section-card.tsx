import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}

export function SectionCard({ title, icon: Icon, children, className, headerRight }: SectionCardProps) {
  return (
    <div className={cn("rounded-xl border border-white/[0.08] bg-[#0d1321]", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={16} className="text-[#3b82f6]" />}
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        {headerRight}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
