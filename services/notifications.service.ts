import type { AdminNotification } from "@/types";
import { apiClient } from "@/services/api/client";

export interface NotificationsPage {
  notifications: AdminNotification[];
  unreadCount: number;
  total: number;
  page: number;
  hasMore: boolean;
}

export const notificationsService = {
  async getNotifications(page = 1, limit = 20, unreadOnly = false): Promise<NotificationsPage> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (unreadOnly) params.set("unreadOnly", "true");
    const res = await apiClient.get<{ success: boolean } & NotificationsPage>(
      `/api/admin/notifications?${params.toString()}`
    );
    return {
      notifications: res.notifications ?? [],
      unreadCount: res.unreadCount ?? 0,
      total: res.total ?? 0,
      page: res.page ?? page,
      hasMore: res.hasMore ?? false,
    };
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/api/admin/notifications/${id}/read`, {});
  },

  async markAllRead(): Promise<void> {
    await apiClient.post("/api/admin/notifications/read-all", {});
  },
};
