"use client";

import { Bell, Settings, HelpCircle, Menu } from "lucide-react";
import { useUIStore } from "@/store/ui.store";

export function TopBar() {
  const { setMobileOpen } = useUIStore();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-[52px] items-center justify-between border-b border-white/[0.06] bg-background px-4 md:px-5">
      {/* ── Left: hamburger (mobile only) + brand ── */}
      <div className="flex items-center gap-2">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-icon-muted transition-colors hover:bg-white/[0.06] md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        <span className="text-[15px] font-bold tracking-[-0.2px] text-blue-500">
          Social Flow Admin
        </span>
      </div>

      {/* ── Right: icons + admin profile ── */}
      <div className="flex items-center gap-0.5">
        <TopBtn aria-label="Notifications"><Bell size={16} /></TopBtn>
        <TopBtn aria-label="Settings"><Settings size={16} /></TopBtn>
        <TopBtn aria-label="Help" className="hidden sm:flex"><HelpCircle size={16} /></TopBtn>

        {/* Divider + admin */}
        <div className="ml-3 flex items-center gap-2.5 border-l border-white/[0.07] pl-3">
          <div className="hidden text-right leading-none sm:block">
            <p className="text-[13px] font-semibold leading-none text-white">
              Alex Rivera
            </p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#5a7090]">
              System Admin
            </p>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-[13px] font-bold text-white">
            A
          </div>
        </div>
      </div>
    </header>
  );
}

function TopBtn({
  children,
  className = "",
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`relative flex h-8 w-8 items-center justify-center rounded-lg text-icon-muted transition-colors hover:bg-white/[0.06] ${className}`}
    >
      {children}
    </button>
  );
}
