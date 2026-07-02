import type { ElementType } from "react";
import {
  TbPalette, TbCode, TbBriefcase, TbCpu, TbSpeakerphone, TbCurrencyDollar, TbHeartHandshake,
} from "react-icons/tb";
import type { CourseCategory, CourseDifficulty, CourseStatus } from "@/constants/education-mock-data";

export const CATEGORY_ICON: Record<CourseCategory, ElementType> = {
  Design: TbPalette,
  Development: TbCode,
  Business: TbBriefcase,
  Technology: TbCpu,
  Marketing: TbSpeakerphone,
  Finance: TbCurrencyDollar,
  "Soft Skills": TbHeartHandshake,
};

export const CAT_BADGE: Record<CourseCategory, string> = {
  Design: "border-purple-500/30 text-purple-300",
  Development: "border-blue-500/30 text-blue-300",
  Business: "border-amber-500/30 text-amber-300",
  Technology: "border-violet-500/30 text-violet-300",
  Marketing: "border-pink-500/30 text-pink-300",
  Finance: "border-cyan-500/30 text-cyan-300",
  "Soft Skills": "border-orange-500/30 text-orange-300",
};

export const DIFFICULTY_BADGE: Record<CourseDifficulty, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-300",
  Intermediate: "bg-amber-500/15 text-amber-300",
  Advanced: "bg-red-500/15 text-red-300",
};

export const STATUS_STYLES: Record<CourseStatus, { dot: string; text: string; label: string }> = {
  DRAFT: { dot: "bg-slate-400", text: "text-slate-400", label: "Draft" },
  PUBLISHED: { dot: "bg-emerald-400", text: "text-emerald-400", label: "Published" },
  ARCHIVED: { dot: "bg-orange-400", text: "text-orange-400", label: "Archived" },
};

export const CATEGORY_OPTS: CourseCategory[] = [
  "Design", "Development", "Business", "Technology", "Marketing", "Finance", "Soft Skills",
];
export const DIFFICULTY_OPTS: CourseDifficulty[] = ["Beginner", "Intermediate", "Advanced"];
export const STATUS_OPTS: CourseStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
