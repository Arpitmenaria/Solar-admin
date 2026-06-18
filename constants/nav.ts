export const NAV_ITEMS = [
  { label: "Dashboard",        href: "/dashboard",        icon: "Dashboard" },
  { label: "Users",            href: "/dashboard/users",  icon: "Users"     },
  { label: "Group Management", href: "/dashboard/groups", icon: "Groups"    },
] as const;

export const NAV_BOTTOM = [
  { label: "Support",   href: "/dashboard/support", icon: "Support"  },
  { label: "Sign Out",  href: "/",                  icon: "SignOut"  },
] as const;

export const SYSTEM_VERSION = "v1.4.2-STABLE";
export const SYSTEM_NAME    = "Social Platform Admin";
export const SYSTEM_SUBTITLE = "Admin Control Plane";
