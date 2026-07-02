"use client";

import { useQuery } from "@tanstack/react-query";
import { educationActivityService } from "@/services/education-activity.service";

export const activityKeys = {
  all: ["education-activity"] as const,
  list: () => ["education-activity", "list"] as const,
};

export function useEducationActivity() {
  return useQuery({ queryKey: activityKeys.list(), queryFn: educationActivityService.getEducationActivity, staleTime: 15_000 });
}
