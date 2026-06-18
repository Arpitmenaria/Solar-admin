export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Users", href: "/dashboard/users", icon: "Users" },
  { label: "Content Moderation", href: "/dashboard/moderation", icon: "Shield" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart2" },
  { label: "Financials", href: "/dashboard/financials", icon: "Wallet" },
  { label: "System Logs", href: "/dashboard/logs", icon: "Monitor" },
] as const;

export const NAV_BOTTOM = [
  { label: "Support", href: "/dashboard/support", icon: "HelpCircle" },
  { label: "Sign Out", href: "/auth/logout", icon: "LogOut" },
] as const;

export const SYSTEM_VERSION = "v1.4.2-STABLE";
export const SYSTEM_NAME = "Social Flow Admin";
export const SYSTEM_SUBTITLE = "Admin Control Plane";
