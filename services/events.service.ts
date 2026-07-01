import type { EventAttendee, EventCategory, EventItem, EventStatus } from "@/constants/mock-data";
import { MOCK_EVENTS, MOCK_EVENT_ATTENDEES, MOCK_EVENT_STATS, dummyAvatar, dummyCover } from "@/constants/mock-data";
import { getInitials } from "@/lib/utils";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CATEGORY_ICON_COLOR: Record<EventCategory, string> = {
  Music: "#7c3aed",
  Tech: "#1d4ed8",
  Business: "#065f46",
  Art: "#be185d",
  Workshop: "#6b21a8",
  Social: "#0e7490",
};

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
}

function formatToday(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

export interface CreateEventInput {
  name: string;
  category: EventCategory;
  location: string;
  eventDate: string;
  capacity: number;
  hostName: string;
  hostAvatarUrl?: string;
  description?: string;
}

export type UpdateEventInput = Partial<{
  name: string;
  category: EventCategory;
  location: string;
  eventDate: string;
  capacity: number;
  status: EventStatus;
  hostName: string;
  hostAvatarUrl: string;
  description: string;
}>;

export const eventsService = {
  async getEvents(): Promise<EventItem[]> {
    await delay(250);
    return MOCK_EVENTS.map((e) => ({ ...e, host: { ...e.host } }));
  },

  async getEventStats() {
    await delay(150);
    return MOCK_EVENT_STATS;
  },

  async getEventById(id: string): Promise<EventItem | null> {
    await delay(200);
    const event = MOCK_EVENTS.find((e) => e.id === id);
    return event ? { ...event, host: { ...event.host } } : null;
  },

  async getEventAttendees(id: string): Promise<EventAttendee[]> {
    await delay(200);
    const event = MOCK_EVENTS.find((e) => e.id === id);
    const host: EventAttendee = {
      id: `${id}-host`,
      name: event?.host.name ?? "Unknown",
      avatarUrl: event?.host.avatarUrl,
      status: "Going",
      rsvpAt: event?.createdAt ?? "",
    };
    return [host, ...MOCK_EVENT_ATTENDEES.filter((a) => a.name !== host.name)];
  },

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
      iconColor: CATEGORY_ICON_COLOR[input.category],
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
    if (input.category !== undefined) { event.category = input.category; event.iconColor = CATEGORY_ICON_COLOR[input.category]; }
    if (input.location !== undefined) event.location = input.location;
    if (input.eventDate !== undefined) event.eventDate = input.eventDate;
    if (input.capacity !== undefined) event.capacity = input.capacity;
    if (input.status !== undefined) event.status = input.status;
    if (input.hostName !== undefined) { event.host.name = input.hostName; event.host.initials = getInitials(input.hostName); }
    if (input.hostAvatarUrl !== undefined) event.host.avatarUrl = input.hostAvatarUrl;
    if (input.description !== undefined) event.description = input.description;
    return { ...event, host: { ...event.host } };
  },

  async deleteEvent(id: string): Promise<void> {
    await delay(300);
    const index = MOCK_EVENTS.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Event not found");
    MOCK_EVENTS.splice(index, 1);
  },
};
