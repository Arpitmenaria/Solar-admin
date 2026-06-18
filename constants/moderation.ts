import type { ModerationItem } from "@/types";

export const VIOLATION_BADGE: Record<ModerationItem["type"], string> = {
  "Policy Violation": "bg-[#ff6b2b]/15 text-[#ff8c55] border border-[#ff6b2b]/30",
  "Spam Detection":   "bg-blue-600/15 text-blue-400 border border-blue-600/30",
  "Harassment":       "bg-red-500/15 text-red-400 border border-red-500/30",
};
