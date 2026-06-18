"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbLayoutDashboard, TbUsers, TbUsersGroup,
  TbHelpCircle, TbLogout, TbChevronLeft, TbChevronRight, TbX,
} from "react-icons/tb";
import { FaRegStar } from "react-icons/fa";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";

type IconKey = "Dashboard" | "Users" | "Groups" | "Support" | "SignOut";

const ICON_MAP: Record<IconKey, React.ElementType> = {
  Dashboard: TbLayoutDashboard,
  Users:     TbUsers,
  Groups:    TbUsersGroup,
  Support:   TbHelpCircle,
  SignOut:   TbLogout,
};

const NAV_MAIN = [
  { label: "Dashboard",        href: "/dashboard",        icon: "Dashboard" },
  { label: "Users",            href: "/dashboard/users",  icon: "Users"     },
  { label: "Group Management", href: "/dashboard/groups", icon: "Groups"    },
] as const;

const NAV_BOTTOM = [
  { label: "Support",  href: "/dashboard/support", icon: "Support"  },
  { label: "Sign Out", href: "/",                  icon: "SignOut"   },
] as const;

/* ── Animated icon ─────────────────────────── */
function AnimatedIcon({ icon: Icon, active, collapsed }: {
  icon: React.ElementType; active: boolean; collapsed: boolean;
}) {
  return (
    <motion.div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: 22, height: 22 }}
      whileHover="hovered"
      whileTap="tapped"
      animate={active ? "active" : "idle"}
      variants={{
        idle:    { scale: 1 },
        active:  { scale: 1.08 },
        hovered: { scale: 1.28 },
        tapped:  { scale: 0.88 },
      }}
      transition={{ type: "spring", stiffness: 480, damping: 24 }}
    >
      
      {collapsed && (
        <motion.span
          className="absolute inset-0 rounded-lg"
          variants={{
            idle:    { opacity: 0, scale: 0.7 },
            active:  { opacity: 0.22, scale: 1 },
            hovered: { opacity: 0.30, scale: 1.4 },
            tapped:  { opacity: 0.1, scale: 0.9 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{ background: active ? "#3b82f6" : "#8899b4", filter: "blur(6px)" }}
        />
      )}
      <Icon
        size={active ? 18 : 17}
        style={{ color: active ? "#ADB5CE" : "#BEC7D4", position: "relative", zIndex: 1 }}
      />
    </motion.div>
  );
}

/* ── Tooltip (collapsed mode) ──────────────── */
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
            background: "#1e2d45",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#dce8f8",
            fontFamily: "var(--font-pjs), 'Plus Jakarta Sans', sans-serif",
            letterSpacing: "0.2px",
          }}
        >
          {label}
          <span
            className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
            style={{ borderRightColor: "#1e2d45" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Nav item ──────────────────────────────── */
function NavItem({
  label, href, icon, active, collapsed, pillId, index,
}: {
  label: string; href: string; icon: IconKey;
  active: boolean; collapsed: boolean; pillId: string; index: number;
}) {
  const Icon = ICON_MAP[icon];
  const { setMobileOpen } = useUIStore();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.045, type: "spring", stiffness: 380, damping: 30 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {collapsed && <Tooltip label={label} visible={hovered} />}

      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "relative flex items-center overflow-hidden rounded-lg transition-colors duration-150",
          collapsed ? "justify-center px-0 py-[10px]" : "gap-3 px-3 py-[9px]",
          active ? "text-nav-active" : "text-nav-inactive"
        )}
        style={{
          fontFamily: "var(--font-pjs), 'Plus Jakarta Sans', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.15px",
        }}
      >
        {/* Hover bg */}
        {!collapsed && (
          <motion.span
            className="absolute inset-0 rounded-lg"
            animate={{ opacity: hovered && !active ? 1 : 0 }}
            transition={{ duration: 0.12 }}
            style={{ background: "rgba(255,255,255,0.03)", zIndex: -1 }}
          />
        )}

        {/* Active pill */}
        {active && (
          <motion.span
            layoutId={pillId}
            className="absolute inset-0 rounded-lg"
            style={{ background: "#3E465C", zIndex: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 36 }}
          />
        )}

        {/* Left accent stripe */}
        {active && !collapsed && (
          <motion.span
            layoutId={`${pillId}-stripe`}
            className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full bg-blue-500"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

        {/* Active glow icon-only */}
        {active && collapsed && (
          <motion.span
            className="absolute inset-0 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: "radial-gradient(circle at center, rgba(59,130,246,0.12) 0%, transparent 70%)",
              zIndex: -1,
            }}
          />
        )}

        <AnimatedIcon icon={Icon} active={active} collapsed={collapsed} />

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="overflow-hidden whitespace-nowrap leading-none"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}

/* ── Sidebar content ────────────────────────── */
function SidebarContent({ collapsed, instanceId }: { collapsed: boolean; instanceId: string }) {
  const pathname = usePathname();
  const { toggleSidebar, setMobileOpen } = useUIStore();
  const pillId = `nav-pill-${instanceId}`;

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col">

      {/* Brand */}
      <div className={cn("pt-3 pb-2", collapsed ? "px-2" : "px-3")}>
        <div className={cn(
          "flex items-center rounded-xl border border-[#1a2744] bg-[#0f1728] transition-all duration-200",
          collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-3"
        )}>
          <motion.div
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-blue-700"
            whileHover={{ scale: 1.12, rotate: 8 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <FaRegStar size={16} color="#fff" />
          </motion.div>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="brand-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="min-w-0 overflow-hidden"
              >
                <p style={{ fontFamily: "var(--font-pjs)", fontSize: 14, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                  Admin Console
                </p>
                <p style={{ fontFamily: "var(--font-pjs)", fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2a3d5c", marginTop: 5, whiteSpace: "nowrap" }}>
                  Infrastructure Control
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-[2px] overflow-y-auto px-2 py-2">
        {NAV_MAIN.map((item, i) => (
          <NavItem
            key={item.href}
            index={i}
            label={item.label}
            href={item.href}
            icon={item.icon as IconKey}
            active={isActive(item.href)}
            collapsed={collapsed}
            pillId={pillId}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="space-y-[2px] border-t border-white/[0.05] px-2 py-2">
        {NAV_BOTTOM.map((item, i) => (
          <NavItem
            key={item.href}
            index={NAV_MAIN.length + i}
            label={item.label}
            href={item.href}
            icon={item.icon as IconKey}
            active={false}
            collapsed={collapsed}
            pillId={pillId}
          />
        ))}
      </div>

      {/* Admin chip */}
      <div className={cn("pb-3", collapsed ? "px-2" : "px-3")}>
        <div className={cn(
          "flex items-center rounded-lg border border-[#141e33] bg-[#0f1728] transition-all duration-200",
          collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5"
        )}>
          <motion.div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a2a44] text-[11px] font-bold text-[#4a7cc7]"
            style={{ fontFamily: "var(--font-pjs)" }}
            whileHover={{ scale: 1.18 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            A
          </motion.div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="admin-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="min-w-0 overflow-hidden"
              >
                <p style={{ fontFamily: "var(--font-pjs)", fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>Admin</p>
                <p style={{ fontFamily: "var(--font-pjs)", fontSize: 10, color: "#2a3d5c", whiteSpace: "nowrap" }}>Sys-Log 01</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle (desktop only) */}
      <motion.button
        onClick={toggleSidebar}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="mx-3 mb-3 hidden h-8 items-center justify-center rounded-lg border border-white/[0.07] text-[#5a7090] lg:flex"
        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      >
        {collapsed ? <TbChevronRight size={15} /> : <TbChevronLeft size={15} />}
      </motion.button>
    </div>
  );
}

/* ── Export ─────────────────────────────────── */
export function Sidebar() {
  const { sidebarCollapsed, mobileOpen, setMobileOpen } = useUIStore();

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 238 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="fixed bottom-0 left-0 top-[52px] z-40 hidden flex-col overflow-hidden border-r border-white/[0.06] bg-surface-sidebar lg:flex"
      >
        <SidebarContent collapsed={sidebarCollapsed} instanceId="desktop" />
      </motion.aside>

      {/* Tablet */}
      <aside
        className="fixed bottom-0 left-0 top-[52px] z-40 hidden flex-col overflow-visible border-r border-white/[0.06] bg-surface-sidebar md:flex lg:hidden"
        style={{ width: 64 }}
      >
        <SidebarContent collapsed={true} instanceId="tablet" />
      </aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
            initial={{ x: -238 }} animate={{ x: 0 }} exit={{ x: -238 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed bottom-0 left-0 top-0 z-[60] flex flex-col border-r border-white/[0.06] bg-surface-sidebar md:hidden"
            style={{ width: 238 }}
          >
            <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
              <span style={{ fontFamily: "var(--font-pjs)", fontSize: 14, fontWeight: 700, color: "#3b82f6" }}>
                Social Flow
              </span>
              <motion.button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-icon-muted"
                whileHover={{ scale: 1.12, backgroundColor: "rgba(255,255,255,0.06)" }}
                whileTap={{ scale: 0.9 }}
              >
                <TbX size={16} />
              </motion.button>
            </div>
            <SidebarContent collapsed={false} instanceId="mobile" />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
