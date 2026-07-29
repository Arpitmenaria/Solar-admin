"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationSettingsService } from "@/services/notification-settings.service";
import type { ApiError } from "@/services/api/client";
import type { NotificationSettings } from "@/types";

const notificationSettingsKey = ["notification-settings"] as const;

export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationSettingsKey,
    queryFn: notificationSettingsService.getSettings,
    staleTime: 60_000,
  });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation<NotificationSettings, ApiError, NotificationSettings, { previous?: NotificationSettings }>({
    mutationFn: (settings) => notificationSettingsService.updateSettings(settings),
    // Optimistic: each switch should flip instantly rather than waiting on
    // the round-trip. Snapshot the prior value so onError can roll back.
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: notificationSettingsKey });
      const previous = qc.getQueryData<NotificationSettings>(notificationSettingsKey);
      qc.setQueryData(notificationSettingsKey, next);
      return { previous };
    },
    onError: (_err, _next, context) => {
      if (context?.previous) qc.setQueryData(notificationSettingsKey, context.previous);
    },
    onSuccess: (settings) => qc.setQueryData(notificationSettingsKey, settings),
  });
}
