"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsService, type CreateEventInput, type UpdateEventInput, type EventFilters, type AttendeeFilters } from "@/services/events.service";

export const eventKeys = {
  all: ["events"] as const,
  list: (filters: Partial<EventFilters>) => ["events", "list", filters] as const,
  detail: (id: string) => ["events", "detail", id] as const,
  categories: () => ["events", "categories"] as const,
};

export function useEvents(filters: Partial<EventFilters> = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventsService.getEvents(filters),
    staleTime: 30_000,
  });
}

export function useEventCategories() {
  return useQuery({
    queryKey: eventKeys.categories(),
    queryFn: eventsService.getEventCategories,
    staleTime: 5 * 60_000,
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

export function useEventAttendees(id: string, filters: Partial<AttendeeFilters> = {}) {
  return useQuery({
    queryKey: [...eventKeys.detail(id), "attendees", filters],
    queryFn: () => eventsService.getEventAttendees(id, filters),
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

interface EventActionArgs {
  id: string;
  reason: string;
  notes: string;
}

/** Audited actions invalidate both the event list and the audit log. */
function useEventAction(fn: (a: EventActionArgs) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.all });
      qc.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}

export function useDeleteEvent() {
  return useEventAction(({ id, reason, notes }) => eventsService.deleteEvent(id, reason, notes));
}
