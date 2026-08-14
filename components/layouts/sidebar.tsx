"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  TbLayoutDashboard,
  TbUsers,
  TbUsersGroup,
  TbCreditCard,
  TbChevronLeft,
  TbChevronRight,
  TbChevronDown,
  TbX,
  TbCalendarEvent,
  TbSchool,
  TbBell,
  TbHistory,
  TbWorldWww,
} from "react-icons/tb";

import { FaRegStar } from "react-icons/fa";

import { useState, type ElementType } from "react";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";

type IconKey =
  | "Dashboard"
  | "Users"
  | "Groups"
  | "Events"
  | "Education"
  | "MiniSites"
  | "Plans"
  | "Notifications"
  | "Audit";

interface NavChild {
  label: string;
  href: string;
}

interface NavLinkItem {
  type: "link";
  label: string;
  href: string;
  icon: IconKey;
}

interface NavGroupItem {
  type: "group";
  label: string;
  icon: IconKey;
  children: NavChild[];
}

type NavEntry = NavLinkItem | NavGroupItem;

const SYSTEM_NAME = "Kink Analyst Admin";

const NAV_ITEMS: NavEntry[] = [
  { type: "link", label: "Dashboard", href: "/dashboard", icon: "Dashboard" },
  {
    type: "group",
    label: "User Management",
    icon: "Users",
    children: [
      { label: "Users", href: "/dashboard/users" },
      { label: "Reported Posts", href: "/dashboard/post-reports" },
      { label: "Reported Comments", href: "/dashboard/reported-comments" },
      { label: "Reported Chats", href: "/dashboard/reported-messages" },
    ],
  },
  {
    type: "group",
    label: "Group Management",
    icon: "Groups",
    children: [
      { label: "Groups", href: "/dashboard/groups" },
      { label: "Reported Groups", href: "/dashboard/group-reports" },
    ],
  },
  {
    type: "group",
    label: "Event Management",
    icon: "Events",
    children: [
      { label: "Events", href: "/dashboard/events" },
      { label: "Reported Events", href: "/dashboard/event-reports" },
    ],
  },
  {
    type: "group",
    label: "Education",
    icon: "Education",
    children: [
      { label: "Courses", href: "/dashboard/education/courses" },
      { label: "Reported Courses", href: "/dashboard/course-reports" },
      { label: "Library", href: "/dashboard/education/library" },
    ],
  },
  {
    type: "group",
    label: "Mini Sites",
    icon: "MiniSites",
    children: [
      { label: "Sites", href: "/dashboard/mini-sites/sites" },
      { label: "Site Reports", href: "/dashboard/mini-sites/reports" },
    ],
  },
  { type: "link", label: "Audit Log", href: "/dashboard/audit-logs", icon: "Audit" },
  { type: "link", label: "Plans & Subscriptions", href: "/dashboard/plans", icon: "Plans" },
  { type: "link", label: "Notification Settings", href: "/dashboard/notifications", icon: "Notifications" },
];

const ICON_MAP: Record<IconKey, ElementType> = {
  Dashboard: TbLayoutDashboard,
  Users: TbUsers,
  Groups: TbUsersGroup,
  Events: TbCalendarEvent,
  Education: TbSchool,
  MiniSites: TbWorldWww,
  Plans: TbCreditCard,
  Notifications: TbBell,
  Audit: TbHistory,
};

const isPathActive = (href: string, pathname: string) =>
  href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

/* ── Animated icon ─────────────────────────── */
function AnimatedIcon({ icon: Icon, active, collapsed }: {
  icon: ElementType; active: boolean; collapsed: boolean;
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
        {!collapsed && (
          <motion.span
            className="absolute inset-0 rounded-lg"
            animate={{ opacity: hovered && !active ? 1 : 0 }}
            transition={{ duration: 0.12 }}
            style={{ background: "rgba(255,255,255,0.03)", zIndex: -1 }}
          />
        )}

        {active && (
          <motion.span
            layoutId={pillId}
            className="absolute inset-0 rounded-lg"
            style={{ background: "#3E465C", zIndex: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 36 }}
          />
        )}

        {active && !collapsed && (
          <motion.span
            layoutId={`${pillId}-stripe`}
            className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full bg-blue-500"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

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
              className="overflow-hidden whitespace-nowrap leading-[1.4]"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}

/* ── Collapsible nav group (Groups / Events) ── */
function NavGroup({
  item, collapsed, pillId, index, pathname,
}: {
  item: NavGroupItem; collapsed: boolean; pillId: string; index: number; pathname: string;
}) {
  const Icon = ICON_MAP[item.icon];
  const { setMobileOpen } = useUIStore();
  const [hovered, setHovered] = useState(false);
  const childActive = item.children.some((c) => isPathActive(c.href, pathname));
  // Starts expanded if a child route is already active (e.g. on page load),
  // but the user can freely collapse/expand afterward regardless of route.
  const [open, setOpen] = useState(() => childActive);

  if (collapsed) {
    // No room for a submenu in icon-rail mode — link straight to the first child.
    return (
      <NavItem
        label={item.label}
        href={item.children[0].href}
        icon={item.icon}
        active={childActive}
        collapsed={collapsed}
        pillId={pillId}
        index={index}
      />
    );
  }

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.045, type: "spring", stiffness: 380, damping: 30 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "relative flex w-full items-center gap-3 overflow-hidden rounded-lg px-3 py-[9px] transition-colors duration-150",
          childActive ? "text-nav-active" : "text-nav-inactive"
        )}
        style={{
          fontFamily: "var(--font-pjs), 'Plus Jakarta Sans', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.15px",
        }}
      >
        <motion.span
          className="absolute inset-0 rounded-lg"
          animate={{ opacity: hovered && !childActive ? 1 : 0 }}
          transition={{ duration: 0.12 }}
          style={{ background: "rgba(255,255,255,0.03)", zIndex: -1 }}
        />

        {childActive && (
          <motion.span
            layoutId={pillId}
            className="absolute inset-0 rounded-lg"
            style={{ background: "#3E465C", zIndex: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 36 }}
          />
        )}

        {childActive && (
          <motion.span
            layoutId={`${pillId}-stripe`}
            className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full bg-blue-500"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

        <AnimatedIcon icon={Icon} active={childActive} collapsed={false} />

        <span className="flex-1 overflow-hidden whitespace-nowrap text-left leading-[1.4]">
          {item.label}
        </span>

        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.16 }}
          className="shrink-0"
        >
          <TbChevronDown size={13} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-[27px] mt-[2px] space-y-[2px] border-l border-white/[0.08] pl-3">
              {item.children.map((child) => {
                const active = isPathActive(child.href, pathname);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block rounded-lg px-2.5 py-[7px] text-[12.5px] transition-colors duration-150",
                      active ? "bg-white/[0.06] text-nav-active" : "text-nav-inactive hover:bg-white/[0.03] hover:text-slate-300"
                    )}
                    style={{ fontFamily: "var(--font-pjs), 'Plus Jakarta Sans', sans-serif", letterSpacing: "0.15px" }}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Sidebar content ────────────────────────── */
function SidebarContent({ collapsed, instanceId }: { collapsed: boolean; instanceId: string }) {
  const pathname = usePathname();
  const pillId = `nav-pill-${instanceId}`;

  return (
    <div className="flex h-full flex-col">
      {/* Brand — click to open profile */}
      <div className={cn("pt-3 pb-2", collapsed ? "px-2" : "px-3")}>
        <Link
          href="/dashboard/profile"
          className={cn(
            "flex items-center rounded-xl border border-[#1a2744] bg-[#0f1728] transition-all duration-200 hover:border-blue-500/30 hover:bg-[#111f36]",
            collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-3"
          )}
        >
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
                  {SYSTEM_NAME}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-[2px] overflow-y-auto px-2 py-2">
        {NAV_ITEMS.map((item, i) =>
          item.type === "link" ? (
            <NavItem
              key={item.href}
              index={i}
              label={item.label}
              href={item.href}
              icon={item.icon}
              active={isPathActive(item.href, pathname)}
              collapsed={collapsed}
              pillId={pillId}
            />
          ) : (
            <NavGroup
              key={item.label}
              index={i}
              item={item}
              collapsed={collapsed}
              pillId={pillId}
              pathname={pathname}
            />
          )
        )}
      </nav>
    </div>
  );
}

/* ── Export ─────────────────────────────────── */
export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileOpen, setMobileOpen } = useUIStore();

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

      {/* Border-edge toggle */}
      <motion.button
        onClick={toggleSidebar}
        animate={{ left: sidebarCollapsed ? 64 - 10 : 238 - 10 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="fixed z-50 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.18] bg-[#0e1625] text-[#5a7090] shadow-md transition-colors hover:border-blue-500/60 hover:bg-[#111f36] hover:text-blue-400 lg:flex"
        style={{ top: 136 }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.88 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={sidebarCollapsed ? "right" : "left"}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.12 }}
            className="flex items-center justify-center"
          >
            {sidebarCollapsed ? <TbChevronRight size={11} /> : <TbChevronLeft size={11} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

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
                {SYSTEM_NAME}
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
