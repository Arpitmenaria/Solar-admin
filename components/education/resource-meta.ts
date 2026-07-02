import type { ElementType } from "react";
import { TbArticle, TbVideo, TbBook2, TbFileText } from "react-icons/tb";
import type { ResourceStatus, ResourceType } from "@/constants/education-mock-data";

export { CATEGORY_ICON, CAT_BADGE, CATEGORY_OPTS } from "@/components/education/course-meta";

export const TYPE_ICON: Record<ResourceType, ElementType> = {
  Article: TbArticle,
  Video: TbVideo,
  Guide: TbBook2,
  Document: TbFileText,
};

export const TYPE_BADGE: Record<ResourceType, string> = {
  Article: "border-cyan-500/30 text-cyan-300",
  Video: "border-purple-500/30 text-purple-300",
  Guide: "border-emerald-500/30 text-emerald-300",
  Document: "border-slate-500/30 text-slate-300",
};

export const STATUS_STYLES: Record<ResourceStatus, { dot: string; text: string; label: string }> = {
  DRAFT: { dot: "bg-slate-400", text: "text-slate-400", label: "Draft" },
  PUBLISHED: { dot: "bg-emerald-400", text: "text-emerald-400", label: "Published" },
};

export const TYPE_OPTS: ResourceType[] = ["Article", "Video", "Guide", "Document"];
export const STATUS_OPTS: ResourceStatus[] = ["DRAFT", "PUBLISHED"];
