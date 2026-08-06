import type { ModerationItem, Report, ReportStats } from "@/types";

export const MOCK_MODERATION: ModerationItem[] = [
  { id: "1", username: "@johndoe_92", reportedAt: "12m ago", type: "Policy Violation", excerpt: '"This is a suspicious link that was flagged by the...' },
  { id: "2", username: "@anonymous_star", reportedAt: "45m ago", type: "Spam Detection", excerpt: "Mass DM activity detected from a single IP range." },
  { id: "3", username: "@sarah_dev", reportedAt: "2h ago", type: "Harassment", excerpt: "Multiple reports on a specific thread thread interaction." },
];

export type GroupStatus   = "ACTIVE" | "SUSPENDED" | "PENDING" | "REPORTED";
export type GroupPrivacy  = "Public" | "Private";
export type GroupCategory = "Tech" | "Design" | "Finance" | "Security" | "Gaming" | "Social";

export interface Group {
  id: string;
  name: string;
  category: GroupCategory;
  privacy: GroupPrivacy;
  owner: { name: string; avatarUrl?: string; initials: string; };
  members: number;
  posts: number;
  status: GroupStatus;
  iconColor: string;
  createdAt: string;
  /** Present only for groups from the deleted-groups endpoint. */
  deletedAt?: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
}

/** Deterministic placeholder images for demo groups — no group photo/cover is stored yet. */
export const dummyAvatar = (seed: string) => `https://picsum.photos/seed/${seed}/300/300`;
export const dummyCover = (seed: string) => `https://picsum.photos/seed/${seed}-cover/1200/400`;

export const MOCK_GROUPS: Group[] = [
  { id: "g1", name: "Dev_Infrastructure",      category: "Tech",     privacy: "Public",  owner: { name: "Marcus Thorne",   initials: "MT", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" }, members: 12482, posts: 45200,  status: "ACTIVE",    iconColor: "#1d4ed8", createdAt: "06/02/2023", description: "A hub for backend engineers and DevOps practitioners sharing infrastructure patterns, tooling, and scaling war stories.", avatarUrl: dummyAvatar("g1"), coverUrl: dummyCover("g1") },
  { id: "g2", name: "Global_Design_Collective", category: "Design",   privacy: "Private", owner: { name: "Elena Voss",     initials: "EV", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop" }, members:  8103, posts: 112000, status: "ACTIVE",    iconColor: "#374151", createdAt: "08/14/2023", description: "A worldwide community of product and visual designers exchanging critique, process, and craft.", avatarUrl: dummyAvatar("g2"), coverUrl: dummyCover("g2") },
  { id: "g3", name: "Shadow_Traders_Elite",     category: "Finance",  privacy: "Private", owner: { name: "Unknown Entity",  initials: "UK" },                                                                                                members:   542, posts:   1200, status: "SUSPENDED", iconColor: "#b91c1c", createdAt: "01/06/2024", description: "Private trading signals group — currently suspended pending a fraud investigation.", avatarUrl: dummyAvatar("g3"), coverUrl: dummyCover("g3") },
  { id: "g4", name: "Alpha_Moderators",         category: "Security", privacy: "Public",  owner: { name: "Soren Kierk",    initials: "SK", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop" }, members:    42, posts:   9800, status: "PENDING",   iconColor: "#1e3a5f", createdAt: "11/20/2023", description: "Coordination space for platform moderators to align on policy and escalation workflows.", avatarUrl: dummyAvatar("g4"), coverUrl: dummyCover("g4") },
  { id: "g5", name: "Crypto_Builders_Hub",      category: "Finance",  privacy: "Public",  owner: { name: "Ryan Nakamura",  initials: "RN", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop" }, members:  3410, posts:  22100, status: "ACTIVE",    iconColor: "#065f46", createdAt: "03/18/2024", description: "Builders shipping crypto and blockchain tooling, from wallets to on-chain analytics.", avatarUrl: dummyAvatar("g5"), coverUrl: dummyCover("g5") },
  { id: "g6", name: "UX_Craft_Society",         category: "Design",   privacy: "Public",  owner: { name: "Priya Sharma",   initials: "PS", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop" }, members:  5820, posts:  34800, status: "ACTIVE",    iconColor: "#6b21a8", createdAt: "09/05/2023", description: "Practitioners refining their UX research and interaction design craft together.", avatarUrl: dummyAvatar("g6"), coverUrl: dummyCover("g6") },
  { id: "g7", name: "Esports_Arena_Pro",        category: "Gaming",   privacy: "Public",  owner: { name: "Jake Torres",    initials: "JT" },                                                                                                members: 28400, posts: 198000, status: "REPORTED",  iconColor: "#92400e", createdAt: "12/01/2022", description: "Tournament organizers and players coordinating esports events and brackets.", avatarUrl: dummyAvatar("g7"), coverUrl: dummyCover("g7") },
  { id: "g8", name: "Social_Innovators_Lab",    category: "Social",   privacy: "Private", owner: { name: "Amara Okonkwo",  initials: "AO", avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=60&h=60&fit=crop" }, members:  1290, posts:   8400, status: "ACTIVE",    iconColor: "#0e7490", createdAt: "05/30/2024", description: "Changemakers experimenting with community-led social impact projects.", avatarUrl: dummyAvatar("g8"), coverUrl: dummyCover("g8") },
  { id: "g9", name: "Backend_Wizards",          category: "Tech",     privacy: "Private", owner: { name: "Chen Wei",       initials: "CW" },                                                                                                members:  2100, posts:  15600, status: "ACTIVE",    iconColor: "#1d4ed8", createdAt: "02/11/2024", description: "Deep dives into distributed systems, databases, and backend architecture.", avatarUrl: dummyAvatar("g9"), coverUrl: dummyCover("g9") },
  { id: "g10",name: "Creative_Freelancers",     category: "Design",   privacy: "Public",  owner: { name: "Sofia Reyes",    initials: "SR", avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&h=60&fit=crop" }, members:  4750, posts:  29700, status: "ACTIVE",    iconColor: "#374151", createdAt: "07/22/2023", description: "Independent creatives sharing gigs, rates, and freelance business advice.", avatarUrl: dummyAvatar("g10"), coverUrl: dummyCover("g10") },
];

export interface GroupMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: "Admin" | "Moderator" | "Member";
  joinedAt: string;
}

export const MOCK_GROUP_MEMBERS: GroupMember[] = [
  { id: "gm1", name: "Elena Voss",     avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop", role: "Moderator", joinedAt: "07/11/2023" },
  { id: "gm2", name: "Ryan Nakamura",  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop", role: "Member",    joinedAt: "08/22/2023" },
  { id: "gm3", name: "Priya Sharma",   avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop",    role: "Member",    joinedAt: "09/03/2023" },
  { id: "gm4", name: "Chen Wei",                                                                                                      role: "Member",    joinedAt: "10/15/2023" },
  { id: "gm5", name: "Sofia Reyes",    avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&h=60&fit=crop",  role: "Moderator", joinedAt: "11/28/2023" },
  { id: "gm6", name: "Jake Torres",                                                                                                    role: "Member",    joinedAt: "01/09/2024" },
  { id: "gm7", name: "Amara Okonkwo",  avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=60&h=60&fit=crop",  role: "Member",    joinedAt: "02/17/2024" },
  { id: "gm8", name: "Soren Kierk",    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop",  role: "Member",    joinedAt: "03/30/2024" },
];

export interface GroupPost {
  id: string;
  author: { name: string; avatarUrl?: string };
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export const MOCK_GROUP_POSTS: GroupPost[] = [
  { id: "gp1", author: { name: "Elena Voss", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop" }, content: "Just shipped the new onboarding flow — early metrics show a 12% bump in activation. Full writeup coming soon.", imageUrl: dummyCover("gp1"), createdAt: "06/28/2026", likes: 214, comments: 18 },
  { id: "gp2", author: { name: "Ryan Nakamura", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop" }, content: "Anyone else hitting rate limits on the staging API today? Looking into it now.", createdAt: "06/25/2026", likes: 42, comments: 9 },
  { id: "gp3", author: { name: "Priya Sharma", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop" }, content: "Wrapped up user interviews this week — sharing the top 3 pain points at Friday's sync.", imageUrl: dummyCover("gp3"), createdAt: "06/21/2026", likes: 128, comments: 24 },
  { id: "gp4", author: { name: "Sofia Reyes", avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&h=60&fit=crop" }, content: "Reminder: monthly community call is this Thursday at 10am. Drop your agenda items below.", createdAt: "06/17/2026", likes: 76, comments: 12 },
  { id: "gp5", author: { name: "Chen Wei" }, content: "Published a deep dive on our caching layer redesign — cut p99 latency by 40%.", imageUrl: dummyCover("gp5"), createdAt: "06/12/2026", likes: 301, comments: 37 },
];

export const MOCK_GROUP_STATS = {
  totalGroups:     39079,
  activeGroups:    34838,
  pendingApproval:   129,
  privateGroups:   11313,
  publicGroups:    27765,
  reportedGroups:     25,
  suspended:          13,
  newlyCreated24h:    76,
};

export type EventStatus   = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type EventCategory = "Music" | "Tech" | "Business" | "Art" | "Workshop" | "Social";

export interface EventItem {
  id: string;
  name: string;
  category: EventCategory;
  location: string;
  host: { name: string; avatarUrl?: string; initials: string };
  attendees: number;
  capacity: number;
  status: EventStatus;
  iconColor: string;
  eventDate: string;
  createdAt: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
}

export const MOCK_EVENTS: EventItem[] = [
  { id: "e1", name: "Neon Beats: Electronic Night",   category: "Music",    location: "Austin, TX",      host: { name: "Marcus Thorne",  initials: "MT", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" }, attendees: 1200, capacity: 1600, status: "UPCOMING",  iconColor: "#7c3aed", eventDate: "10/24/2026", createdAt: "01/15/2026", description: "Austin's most anticipated underground electronic music event, featuring headlining DJs and an immersive 360-degree audio-visual experience.", avatarUrl: dummyAvatar("e1"), coverUrl: dummyCover("e1") },
  { id: "e2", name: "Future of AI: Innovation Summit", category: "Tech",     location: "San Francisco, CA", host: { name: "Elena Voss",    initials: "EV", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop" }, attendees: 2500, capacity: 2620, status: "UPCOMING",  iconColor: "#1d4ed8", eventDate: "11/15/2026", createdAt: "02/02/2026", description: "Industry leaders dive deep into the next generation of artificial intelligence and technology.", avatarUrl: dummyAvatar("e2"), coverUrl: dummyCover("e2") },
  { id: "e3", name: "Executive Networking Mixer",      category: "Business", location: "New York, NY",    host: { name: "Ryan Nakamura", initials: "RN", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop" }, attendees:  800, capacity:  825, status: "UPCOMING",  iconColor: "#065f46", eventDate: "12/02/2026", createdAt: "03/10/2026", description: "An exclusive evening for senior executives and entrepreneurs to connect in a premium setting.", avatarUrl: dummyAvatar("e3"), coverUrl: dummyCover("e3") },
  { id: "e4", name: "Canvas & Color Workshop",         category: "Art",      location: "London, UK",      host: { name: "Priya Sharma",  initials: "PS", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop" }, attendees:  64,  capacity:  80,  status: "UPCOMING",  iconColor: "#be185d", eventDate: "12/12/2026", createdAt: "03/28/2026", description: "A hands-on painting workshop exploring color theory and mixed-media technique.", avatarUrl: dummyAvatar("e4"), coverUrl: dummyCover("e4") },
  { id: "e5", name: "Late Night Gaming Tournament",    category: "Social",   location: "Chicago, IL",     host: { name: "Jake Torres",   initials: "JT" },                                                                                                    attendees: 340,  capacity:  400, status: "ONGOING",   iconColor: "#92400e", eventDate: "07/04/2026", createdAt: "04/05/2026", description: "Bracket-style esports tournament with cash prizes across three game titles.", avatarUrl: dummyAvatar("e5"), coverUrl: dummyCover("e5") },
  { id: "e6", name: "Design Systems Workshop",         category: "Workshop", location: "Berlin, DE",      host: { name: "Sofia Reyes",   initials: "SR", avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&h=60&fit=crop" }, attendees: 180,  capacity:  200, status: "COMPLETED", iconColor: "#6b21a8", eventDate: "07/09/2026", createdAt: "01/20/2026", description: "A full-day intensive on scaling design systems across product teams.", avatarUrl: dummyAvatar("e6"), coverUrl: dummyCover("e6") },
  { id: "e7", name: "Underground Trading Signals",     category: "Business", location: "Miami, FL",       host: { name: "Unknown Entity", initials: "UK" },                                                                                                    attendees:  92,  capacity:  500, status: "CANCELLED", iconColor: "#b91c1c", eventDate: "07/13/2026", createdAt: "02/18/2026", description: "Event removed after organizer misrepresented a celebrity guest appearance.", avatarUrl: dummyAvatar("e7"), coverUrl: dummyCover("e7") },
  { id: "e8", name: "Community Karaoke Night",         category: "Social",   location: "Seattle, WA",     host: { name: "Amara Okonkwo", initials: "AO", avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=60&h=60&fit=crop" }, attendees: 210,  capacity:  250, status: "COMPLETED", iconColor: "#0e7490", eventDate: "07/19/2026", createdAt: "03/01/2026", description: "A monthly community favorite — casual karaoke, snacks, and good company.", avatarUrl: dummyAvatar("e8"), coverUrl: dummyCover("e8") },
];

export const MOCK_EVENT_STATS = {
  totalEvents:  1482,
  upcoming:      612,
  ongoing:        48,
  completed:     742,
  cancelled:      80,
};

export interface EventAttendee {
  id: string;
  name: string;
  avatarUrl?: string;
  status: "Going" | "Interested" | "Checked In";
  rsvpAt: string;
}

export const MOCK_EVENT_ATTENDEES: EventAttendee[] = [
  { id: "ea1", name: "Elena Voss",     avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop", status: "Going",       rsvpAt: "07/11/2026" },
  { id: "ea2", name: "Ryan Nakamura",  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop", status: "Checked In",  rsvpAt: "08/22/2026" },
  { id: "ea3", name: "Priya Sharma",   avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop",    status: "Going",       rsvpAt: "09/03/2026" },
  { id: "ea4", name: "Chen Wei",                                                                                                      status: "Interested",  rsvpAt: "10/15/2026" },
  { id: "ea5", name: "Sofia Reyes",    avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&h=60&fit=crop",  status: "Going",       rsvpAt: "11/28/2026" },
  { id: "ea6", name: "Jake Torres",                                                                                                    status: "Checked In",  rsvpAt: "01/09/2026" },
  { id: "ea7", name: "Amara Okonkwo",  avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=60&h=60&fit=crop",  status: "Interested",  rsvpAt: "02/17/2026" },
  { id: "ea8", name: "Soren Kierk",    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop",  status: "Going",       rsvpAt: "03/30/2026" },
];

export const MOCK_GROUP_REPORTS: Report[] = [
  { id: "gr1", target: { id: "g7", name: "Esports_Arena_Pro", meta: "28,400 members" }, reportedBy: { username: "@johndoe_92" }, category: "Hate Speech", description: "Multiple members posting targeted slurs in the general channel during tournament chat.", status: "PENDING", reportedAt: "2026-06-29" },
  { id: "gr2", target: { id: "g3", name: "Shadow_Traders_Elite", meta: "542 members" }, reportedBy: { username: "@anonymous_star" }, category: "Scam / Fraud", description: "Admins are promoting a fake investment scheme and asking members to wire funds.", status: "PENDING", reportedAt: "2026-06-28" },
  { id: "gr3", target: { id: "g9", name: "Backend_Wizards", meta: "2,100 members" }, reportedBy: { username: "@sarah_dev" }, category: "Spam", description: "Group is being flooded with repeated promotional links unrelated to the group topic.", status: "PENDING", reportedAt: "2026-06-27" },
  { id: "gr4", target: { id: "g4", name: "Alpha_Moderators", meta: "42 members" }, reportedBy: { username: "@kb_enterprise" }, category: "Inappropriate Content", description: "Pinned post contains explicit imagery not suitable for the platform.", status: "RESOLVED", reportedAt: "2026-06-24" },
  { id: "gr5", target: { id: "g5", name: "Crypto_Builders_Hub", meta: "3,410 members" }, reportedBy: { username: "@elena_r" }, category: "Fake or Misleading", description: "Group claims official partnership with a major exchange that does not exist.", status: "DISMISSED", reportedAt: "2026-06-22" },
  { id: "gr6", target: { id: "g1", name: "Dev_Infrastructure", meta: "12,482 members" }, reportedBy: { username: "@marcus_v" }, category: "Harassment", description: "A member is repeatedly DMing other users after being asked to stop.", status: "PENDING", reportedAt: "2026-06-21" },
  { id: "gr7", target: { id: "g8", name: "Social_Innovators_Lab", meta: "1,290 members" }, reportedBy: { username: "@shadow_882" }, category: "Other", description: "Group description was changed to impersonate a verified brand account.", status: "RESOLVED", reportedAt: "2026-06-18" },
  { id: "gr8", target: { id: "g2", name: "Global_Design_Collective", meta: "8,103 members" }, reportedBy: { username: "@sjm_82" }, category: "Spam", description: "Several members posting identical affiliate links across multiple threads.", status: "RESOLVED", reportedAt: "2026-06-15" },
];

export const MOCK_GROUP_REPORT_STATS: ReportStats = {
  total: 312,
  pending: 184,
  resolved: 104,
  dismissed: 24,
};

export const MOCK_EVENT_REPORTS: Report[] = [
  { id: "er1", target: { id: "e1", name: "Crypto Founders Meetup", meta: "Sat, Aug 16 · 7:00 PM" }, reportedBy: { username: "@anonymous_star" }, category: "Scam / Fraud", description: "Organizer is collecting an upfront 'registration fee' that isn't disclosed in the event policy.", status: "PENDING", reportedAt: "2026-06-29" },
  { id: "er2", target: { id: "e2", name: "Late Night Gaming Tournament", meta: "Fri, Jul 04 · 9:00 PM" }, reportedBy: { username: "@sarah_dev" }, category: "Inappropriate Content", description: "Event banner image contains graphic content flagged by multiple attendees.", status: "PENDING", reportedAt: "2026-06-28" },
  { id: "er3", target: { id: "e3", name: "Design Systems Workshop", meta: "Wed, Jul 09 · 2:00 PM" }, reportedBy: { username: "@kb_enterprise" }, category: "Spam", description: "Event listing duplicated 6 times by the same host to game search rankings.", status: "PENDING", reportedAt: "2026-06-26" },
  { id: "er4", target: { id: "e4", name: "Underground Trading Signals", meta: "Sun, Jul 13 · 6:00 PM" }, reportedBy: { username: "@elena_r" }, category: "Fake or Misleading", description: "Event claims a celebrity guest speaker who has publicly denied involvement.", status: "RESOLVED", reportedAt: "2026-06-20" },
  { id: "er5", target: { id: "e5", name: "Community Karaoke Night", meta: "Sat, Jul 19 · 8:00 PM" }, reportedBy: { username: "@marcus_v" }, category: "Harassment", description: "Comments section used to target and harass a specific attendee.", status: "DISMISSED", reportedAt: "2026-06-17" },
  { id: "er6", target: { id: "e6", name: "Open Mic Comedy Hour", meta: "Thu, Jul 24 · 8:30 PM" }, reportedBy: { username: "@shadow_882" }, category: "Hate Speech", description: "Event description includes language targeting a protected group.", status: "PENDING", reportedAt: "2026-06-14" },
  { id: "er7", target: { id: "e7", name: "Startup Pitch Night", meta: "Tue, Jul 29 · 6:30 PM" }, reportedBy: { username: "@sjm_82" }, category: "Other", description: "Listed venue does not exist at the stated address.", status: "RESOLVED", reportedAt: "2026-06-12" },
];

export const MOCK_EVENT_REPORT_STATS: ReportStats = {
  total: 187,
  pending: 96,
  resolved: 74,
  dismissed: 17,
};

