"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsService, type CreateEventInput, type UpdateEventInput } from "@/services/events.service";

export const eventKeys = {
  all: ["events"] as const,
  list: () => ["events", "list"] as const,
  stats: () => ["events", "stats"] as const,
  detail: (id: string) => ["events", "detail", id] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.list(),
    queryFn: eventsService.getEvents,
    staleTime: 30_000,
  });
}

export function useEventStats() {
  return useQuery({
    queryKey: eventKeys.stats(),
    queryFn: eventsService.getEventStats,
    staleTime: 30_000,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsService.getEventById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useEventAttendees(id: string) {
  return useQuery({
    queryKey: [...eventKeys.detail(id), "attendees"],
    queryFn: () => eventsService.getEventAttendees(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) => eventsService.createEvent(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useUpdateEvent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateEventInput) => eventsService.updateEvent(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsService.deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}
