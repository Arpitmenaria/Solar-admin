import type { ElementType } from "react";
import {
  TbCode, TbShieldCheck, TbDeviceGamepad2, TbUsers, TbPalette, TbCurrencyDollar,
} from "react-icons/tb";
import type { GroupCategory, GroupPrivacy, GroupStatus } from "@/constants/mock-data";

export const CATEGORY_ICON: Record<GroupCategory, ElementType> = {
  Tech: TbCode, Design: TbPalette, Finance: TbCurrencyDollar,
  Security: TbShieldCheck, Gaming: TbDeviceGamepad2, Social: TbUsers,
};

export const CAT_BADGE: Record<GroupCategory, string> = {
  Tech:     "border-blue-500/30 text-blue-300",
  Design:   "border-purple-500/30 text-purple-300",
  Finance:  "border-emerald-500/30 text-emerald-300",
  Security: "border-slate-500/30 text-slate-300",
  Gaming:   "border-orange-500/30 text-orange-300",
  Social:   "border-cyan-500/30 text-cyan-300",
};

export const STATUS_STYLES: Record<GroupStatus, { dot: string; text: string; label: string }> = {
  ACTIVE:    { dot: "bg-emerald-400", text: "text-emerald-400", label: "Active"    },
  SUSPENDED: { dot: "bg-red-400",     text: "text-red-400",     label: "Suspended" },
  PENDING:   { dot: "bg-yellow-400",  text: "text-yellow-400",  label: "Pending"   },
  REPORTED:  { dot: "bg-orange-400",  text: "text-orange-400",  label: "Reported"  },
};

export const CATEGORY_OPTS: GroupCategory[] = ["Tech", "Design", "Finance", "Security", "Gaming", "Social"];
export const PRIVACY_OPTS: GroupPrivacy[] = ["Public", "Private"];
export const STATUS_OPTS: GroupStatus[] = ["ACTIVE", "SUSPENDED", "PENDING", "REPORTED"];
