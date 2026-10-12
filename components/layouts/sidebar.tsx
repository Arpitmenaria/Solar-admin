"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sun,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Gauge,
  Radio,
} from "lucide-react";
import { useState, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";

const SYSTEM_NAME = "Sparrow Solar Admin";

interface NavItemDef {
  label: string;
  href: string;
  icon: ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Solar Plants", href: "#plants", icon: Sun, badge: "5 Active" },
  { label: "Inverter Telemetry", href: "#inverters", icon: Zap, badge: "48/48" },
  { label: "Grid Interconnect", href: "#grid", icon: Activity },
  { label: "Energy Analytics", href: "#analytics", icon: Gauge },
  { label: "System Diagnostics", href: "#diagnostics", icon: Radio },
];

function Tooltip({ label, visible }: { label: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -6, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -4, scale: 0.94 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium shadow-xl"
          style={{
            background: "#151e32",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#e2e8f0",
          }}
        >
          {label}
          <span
            className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
            style={{ borderRightColor: "#151e32" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { setMobileOpen } = useUIStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState("/dashboard");

  return (
    <div className="flex h-full flex-col">
      {/* Brand logo */}
      <div className={cn("pt-3.5 pb-2.5", collapsed ? "px-2" : "px-3")}>
        <div
          className={cn(
            "flex items-center rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-2.5 transition-all duration-200",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/25">
            <Sun className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>

          {!collapsed && (
            <div className="min-w-0 overflow-hidden">
              <p className="font-bold text-white text-[14px] leading-tight tracking-tight">
                Sparrow Solar
              </p>
              <p className="text-[11px] font-medium text-amber-400/90 leading-snug">
                Admin Command Center
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-1 px-2.5 py-2">
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const isCurrent = activeItem === item.href || (item.href === "/dashboard" && pathname === "/dashboard");

          return (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {collapsed && <Tooltip label={item.label} visible={hoveredIndex === i} />}

              <Link
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith("#")) {
                    e.preventDefault();
                    setActiveItem(item.href);
                    const el = document.getElementById(item.href.replace("#", ""));
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    setActiveItem(item.href);
                  }
                  setMobileOpen(false);
                }}
                className={cn(
                  "relative flex items-center rounded-lg transition-all duration-150",
                  collapsed ? "justify-center p-2.5" : "justify-between px-3 py-2.5",
                  isCurrent
                    ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                )}
              >
                <div className={cn("flex items-center", collapsed ? "" : "gap-3")}>
                  <Icon
                    size={18}
                    className={cn(
                      "shrink-0 transition-colors",
                      isCurrent ? "text-amber-400" : "text-slate-400"
                    )}
                  />
                  {!collapsed && (
                    <span className="text-[13px] leading-none whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      isCurrent
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-white/[0.06] text-slate-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* System status footer widget */}
      {!collapsed && (
        <div className="p-3 m-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold tracking-wide uppercase text-emerald-400">
              Grid Synchronized
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-snug">
            48 / 48 Inverters Online · 3.82 MW Peak Capacity
          </p>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileOpen, setMobileOpen } = useUIStore();

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="fixed bottom-0 left-0 top-[52px] z-40 hidden flex-col overflow-hidden border-r border-white/[0.06] bg-[#090d16] lg:flex"
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </motion.aside>

      {/* Border-edge toggle button */}
      <motion.button
        onClick={toggleSidebar}
        animate={{ left: sidebarCollapsed ? 64 - 10 : 240 - 10 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="fixed z-50 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.18] bg-[#0e1625] text-[#5a7090] shadow-md transition-colors hover:border-amber-500/60 hover:bg-[#111f36] hover:text-amber-400 lg:flex"
        style={{ top: 120 }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.88 }}
      >
        {sidebarCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </motion.button>

      {/* Tablet */}
      <aside
        className="fixed bottom-0 left-0 top-[52px] z-40 hidden flex-col overflow-visible border-r border-white/[0.06] bg-[#090d16] md:flex lg:hidden"
        style={{ width: 64 }}
      >
        <SidebarContent collapsed={true} />
      </aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mobile-drawer"
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed bottom-0 left-0 top-0 z-[60] flex flex-col border-r border-white/[0.06] bg-[#090d16] md:hidden"
            style={{ width: 240 }}
          >
            <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
              <span className="font-bold text-[14px] text-amber-400">
                {SYSTEM_NAME}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06]"
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent collapsed={false} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
