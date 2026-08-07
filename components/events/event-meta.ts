import {
  TbCalendarEvent, TbMusic, TbMicrophone2, TbCode, TbRocket, TbBallFootball,
  TbPalette, TbToolsKitchen2, TbBriefcase, TbSchool, TbMovie, TbMoodSmile,
  TbHeartbeat, TbShirt, TbUsers, TbTools,
} from "react-icons/tb";
import type { ElementType } from "react";
import type { EventStatus } from "@/constants/mock-data";

/**
 * Category taxonomy is dynamic (GET /api/admin/events/categories) — icons are
 * matched by name (case-insensitive) with sensible aliases for label variants
 * that show up on older events, falling back to a generic calendar icon.
 */
const CATEGORY_ICON_MAP: Record<string, ElementType> = {
  "music": TbMusic,
  "live music": TbMicrophone2,
  "technology": TbCode,
  "tech": TbCode,
  "tech & startup": TbRocket,
  "sports": TbBallFootball,
  "arts": TbPalette,
  "art": TbPalette,
  "arts & culture": TbPalette,
  "food": TbToolsKitchen2,
  "food & drink": TbToolsKitchen2,
  "business": TbBriefcase,
  "education": TbSchool,
  "entertainment": TbMovie,
  "comedy": TbMoodSmile,
  "health": TbHeartbeat,
  "health & wellness": TbHeartbeat,
  "fashion": TbShirt,
  "social": TbUsers,
  "workshop": TbTools,
};

export function categoryIcon(name: string): ElementType {
  return CATEGORY_ICON_MAP[name.trim().toLowerCase()] ?? TbCalendarEvent;
}

const DEFAULT_CATEGORY_COLOR = "#64748b";

/** Inline badge/icon coloring from the category's hex color (falls back to slate when unknown). */
export function categoryColor(color?: string): string {
  return color && /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : DEFAULT_CATEGORY_COLOR;
}

export const STATUS_STYLES: Record<EventStatus, { dot: string; text: string; label: string }> = {
  UPCOMING:  { dot: "bg-blue-400",    text: "text-blue-400",    label: "Upcoming"  },
  ONGOING:   { dot: "bg-emerald-400", text: "text-emerald-400", label: "Ongoing"   },
  COMPLETED: { dot: "bg-slate-400",   text: "text-slate-400",   label: "Completed" },
  CANCELLED: { dot: "bg-red-400",     text: "text-red-400",     label: "Cancelled" },
};

export const STATUS_OPTS: EventStatus[] = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];
