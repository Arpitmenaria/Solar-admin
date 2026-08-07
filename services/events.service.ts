import type { EventAttendee, EventItem, EventStatus, EventVenue } from "@/constants/mock-data";
import { MOCK_EVENTS, dummyAvatar, dummyCover } from "@/constants/mock-data";
import { getInitials } from "@/lib/utils";
import { apiClient } from "@/services/api/client";

const BASE = "/api/admin/events";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STATUSES: EventStatus[] = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
}

function formatToday(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

interface ApiEventHost {
  name?: string;
  avatar?: string;
  avatarUrl?: string;
}

interface ApiEventVenue {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
}

interface ApiEvent {
  _id?: string;
  id?: string;
  name?: string;
  category?: string;
  location?: string;
  host?: ApiEventHost | null;
  attendees?: number;
  capacity?: number;
  status?: string;
  eventDate?: string;
  createdAt?: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  about?: string;
  tagline?: string;
  eventType?: string;
  pricingType?: string;
  startTime?: string;
  endTime?: string;
  venue?: ApiEventVenue | null;
}

export interface EventStats {
  totalEvents: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  cancelled: number;
}

const EMPTY_STATS: EventStats = { totalEvents: 0, upcoming: 0, ongoing: 0, completed: 0, cancelled: 0 };

interface ApiEventList {
  success: boolean;
  events: ApiEvent[];
  total: number;
  page: number;
  totalPages: number;
  stats: EventStats;
}

export interface EventCategoryOption {
  name: string;
  color: string;
}

interface ApiAttendee {
  _id?: string;
  id?: string;
  name?: string;
  avatar?: string;
  avatarUrl?: string;
  status?: string;
  rsvpAt?: string;
}

function mapStatus(s?: string): EventStatus {
  const upper = (s ?? "").toUpperCase();
  return STATUSES.includes(upper as EventStatus) ? (upper as EventStatus) : "UPCOMING";
}

function mapVenue(v?: ApiEventVenue | null): EventVenue | undefined {
  if (!v) return undefined;
  return { name: v.name, street: v.street, city: v.city, state: v.state, country: v.country, pinCode: v.pinCode };
}

function mapEvent(e: ApiEvent): EventItem {
  const hostName = e.host?.name ?? "Unknown";
  return {
    id: e._id ?? e.id ?? "",
    name: e.name ?? "",
    category: e.category ?? "Other",
    location: e.location ?? "",
    host: { name: hostName, initials: getInitials(hostName), avatarUrl: e.host?.avatarUrl ?? e.host?.avatar },
    attendees: e.attendees ?? 0,
    capacity: e.capacity ?? 0,
    status: mapStatus(e.status),
    eventDate: e.eventDate ?? "",
    createdAt: e.createdAt ?? "",
    description: e.description,
    avatarUrl: e.avatarUrl,
    coverUrl: e.coverUrl,
    about: e.about,
    tagline: e.tagline,
    eventType: e.eventType === "online" ? "online" : e.eventType === "offline" ? "offline" : undefined,
    pricingType: e.pricingType === "free" ? "free" : e.pricingType === "paid" ? "paid" : undefined,
    startTime: e.startTime,
    endTime: e.endTime,
    venue: mapVenue(e.venue),
  };
}

function mapAttendee(a: ApiAttendee): EventAttendee {
  const status = (a.status ?? "").toLowerCase();
  return {
    id: a._id ?? a.id ?? "",
    name: a.name ?? "",
    avatarUrl: a.avatarUrl ?? a.avatar,
    status: status === "host" ? "Host" : status === "checked in" ? "Checked In" : status === "interested" ? "Interested" : "Going",
    rsvpAt: a.rsvpAt ?? "",
  };
}

export interface EventFilters {
  search: string;
  status: EventStatus | "";
  category: string;
  page: number;
  limit: number;
}

export interface PaginatedEvents {
  data: EventItem[];
  total: number;
  page: number;
  totalPages: number;
  stats: EventStats;
}

export interface CreateEventInput {
  name: string;
  category: string;
  location: string;
  eventDate: string;
  capacity: number;
  hostName: string;
  hostAvatarUrl?: string;
  description?: string;
}

export type UpdateEventInput = Partial<{
  name: string;
  category: string;
  location: string;
  eventDate: string;
  capacity: number;
  status: EventStatus;
  hostName: string;
  hostAvatarUrl: string;
  description: string;
}>;

export const eventsService = {
  async getEvents(filters: Partial<EventFilters> = {}): Promise<PaginatedEvents> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.category) params.set("category", filters.category);

    const res = await apiClient.get<ApiEventList>(`${BASE}?${params.toString()}`);
    return {
      data: (res.events ?? []).map(mapEvent),
      total: res.total ?? 0,
      page: res.page ?? page,
      totalPages: res.totalPages ?? 1,
      stats: res.stats ?? EMPTY_STATS,
    };
  },

  async getEventById(id: string): Promise<EventItem | null> {
    const res = await apiClient.get<{ success: boolean; event: ApiEvent | null }>(`${BASE}/${id}`);
    return res.event ? mapEvent(res.event) : null;
  },

  async getEventAttendees(id: string): Promise<EventAttendee[]> {
    const res = await apiClient.get<{ success: boolean; attendees: ApiAttendee[] }>(`${BASE}/${id}/attendees`);
    return (res.attendees ?? []).map(mapAttendee);
  },

  /** Audited action — requires a reason (min 5 chars) + optional notes. */
  async deleteEvent(id: string, reason: string, notes = ""): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`, { reason, notes });
  },

  async getEventCategories(): Promise<EventCategoryOption[]> {
    const res = await apiClient.get<{ success: boolean; categories: EventCategoryOption[] }>(`${BASE}/categories`);
    return res.categories ?? [];
  },

  /**
   * No create/update endpoint exists on the admin API yet — these operate on
   * an in-memory mock array and won't persist or affect the real event list.
   */
  async createEvent(input: CreateEventInput): Promise<EventItem> {
    await delay(400);
    const event: EventItem = {
      id: `e-${slugify(input.name)}-${Date.now().toString(36)}`,
      name: input.name,
      category: input.category,
      location: input.location,
      host: { name: input.hostName, initials: getInitials(input.hostName), avatarUrl: input.hostAvatarUrl },
      attendees: 0,
      capacity: input.capacity,
      status: "UPCOMING",
      eventDate: input.eventDate,
      createdAt: formatToday(),
      description: input.description,
      avatarUrl: dummyAvatar(slugify(input.name)),
      coverUrl: dummyCover(slugify(input.name)),
    };
    MOCK_EVENTS.push(event);
    return { ...event, host: { ...event.host } };
  },

  async updateEvent(id: string, input: UpdateEventInput): Promise<EventItem> {
    await delay(400);
    const event = MOCK_EVENTS.find((e) => e.id === id);
    if (!event) throw new Error("Event not found");
    if (input.name !== undefined) event.name = input.name;
    if (input.category !== undefined) event.category = input.category;
    if (input.location !== undefined) event.location = input.location;
    if (input.eventDate !== undefined) event.eventDate = input.eventDate;
    if (input.capacity !== undefined) event.capacity = input.capacity;
    if (input.status !== undefined) event.status = input.status;
    if (input.hostName !== undefined) { event.host.name = input.hostName; event.host.initials = getInitials(input.hostName); }
    if (input.hostAvatarUrl !== undefined) event.host.avatarUrl = input.hostAvatarUrl;
    if (input.description !== undefined) event.description = input.description;
    return { ...event, host: { ...event.host } };
  },
};
