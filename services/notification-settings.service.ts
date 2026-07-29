import type { NotificationSettings } from "@/types";
import { apiClient } from "@/services/api/client";

export const notificationSettingsService = {
  async getSettings(): Promise<NotificationSettings> {
    const res = await apiClient.get<{ success: boolean; settings: NotificationSettings }>(
      "/api/admin/notification-settings"
    );
    return res.settings;
  },

  async updateSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    const res = await apiClient.put<{ success: boolean; settings: NotificationSettings }>(
      "/api/admin/notification-settings",
      settings
    );
    return res.settings;
  },
};
