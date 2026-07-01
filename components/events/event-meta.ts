import type { ElementType } from "react";
import {
  TbMusic, TbCode, TbBriefcase, TbBrush, TbTools, TbUsers,
} from "react-icons/tb";
import type { EventCategory, EventStatus } from "@/constants/mock-data";

export const CATEGORY_ICON: Record<EventCategory, ElementType> = {
  Music: TbMusic, Tech: TbCode, Business: TbBriefcase,
  Art: TbBrush, Workshop: TbTools, Social: TbUsers,
};

export const CAT_BADGE: Record<EventCategory, string> = {
  Music:    "border-purple-500/30 text-purple-300",
  Tech:     "border-blue-500/30 text-blue-300",
  Business: "border-emerald-500/30 text-emerald-300",
  Art:      "border-pink-500/30 text-pink-300",
  Workshop: "border-fuchsia-500/30 text-fuchsia-300",
  Social:   "border-cyan-500/30 text-cyan-300",
};

export const STATUS_STYLES: Record<EventStatus, { dot: string; text: string; label: string }> = {
  UPCOMING:  { dot: "bg-blue-400",    text: "text-blue-400",    label: "Upcoming"  },
  ONGOING:   { dot: "bg-emerald-400", text: "text-emerald-400", label: "Ongoing"   },
  COMPLETED: { dot: "bg-slate-400",   text: "text-slate-400",   label: "Completed" },
  CANCELLED: { dot: "bg-red-400",     text: "text-red-400",     label: "Cancelled" },
};

export const CATEGORY_OPTS: EventCategory[] = ["Music", "Tech", "Business", "Art", "Workshop", "Social"];
export const STATUS_OPTS: EventStatus[] = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];
