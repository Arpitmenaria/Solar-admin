"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService, type NotificationsPage } from "@/services/notifications.service";

export const notificationsKey = ["admin-notifications"] as const;

export function useAdminNotifications() {
  return useQuery({
    queryKey: notificationsKey,
    queryFn: () => notificationsService.getNotifications(1, 20),
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<NotificationsPage>(notificationsKey, (prev) => {
        if (!prev) return prev;
        const wasUnread = prev.notifications.find((n) => n.id === id && !n.read);
        return {
          ...prev,
          notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
        };
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      qc.setQueryData<NotificationsPage>(notificationsKey, (prev) =>
        prev ? { ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })), unreadCount: 0 } : prev
      );
    },
  });
}
