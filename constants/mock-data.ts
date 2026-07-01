import type { User, DashboardStats, ModerationItem, ChartDataPoint, Report, ReportStats } from "@/types";

export const MOCK_USERS: User[] = [
  {
    id: "flow-mchen-8892",
    username: "@marcus_v",
    displayName: "Marcus Chen",
    fullName: "Marcus Chen",
    email: "marcus.v@socialflow.io",
    phone: "+1(555) 234-5678",
    website: "https://marcuschen.dev",
    bio: "Product Designer & Tech Enthusiast",
    location: "San Francisco, CA",
    profession: "Senior Product Designer",
    gender: "Male",
    relationshipStatus: "Single",
    dateOfBirth: "1990-10-20",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    status: "PREMIUM",
    accountTier: "PREMIUM",
    registrationDate: "2023-10-14",
    stats: { friends: 2450, followers: 24502, following: 841, reportedPosts: 12, createdPosts: 154, profileViews: 4820 },
    groups: { total: 15, created: 3, joined: 12 },
    events: { total: 13, created: 5, joined: 8 },
    subscription: { plan: "Platinum Elite", status: "ACTIVE", validUntil: "Oct 24, 2025", paymentMethod: "Visa ending in 4242" },
  },
  {
    id: "flow-erod-2341",
    username: "@elena_r",
    displayName: "Elena Rodriguez",
    fullName: "Elena Rodriguez",
    email: "elena.rod@vortex.dev",
    phone: "+1(555) 876-5432",
    website: "https://elenarodriguez.io",
    bio: "UX Researcher & Visual Designer",
    location: "Austin, TX",
    profession: "UX Researcher",
    gender: "Female",
    relationshipStatus: "Married",
    dateOfBirth: "1992-03-15",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    status: "ACTIVE",
    accountTier: "PREMIUM",
    registrationDate: "2024-01-02",
    stats: { friends: 1820, followers: 112891, following: 2410, reportedPosts: 0, createdPosts: 89, profileViews: 12400 },
    groups: { total: 8, created: 1, joined: 7 },
    events: { total: 22, created: 4, joined: 18 },
    subscription: { plan: "Gold Plan", status: "ACTIVE", validUntil: "Jan 02, 2026", paymentMethod: "Mastercard ending in 7891" },
  },
  {
    id: "flow-shadow-882",
    username: "@shadow_882",
    displayName: "Shadow_User_882",
    fullName: "Unknown",
    email: "suspicious_activity_log",
    phone: "N/A",
    website: "",
    bio: "",
    location: "Unknown",
    profession: "Unknown",
    gender: "Unknown",
    relationshipStatus: "Unknown",
    dateOfBirth: "2000-01-01",
    avatarUrl: "",
    status: "FLAGGED",
    accountTier: "FREE",
    registrationDate: "2024-03-15",
    stats: { friends: 0, followers: 14, following: 0, reportedPosts: 24, createdPosts: 0, profileViews: 88 },
    groups: { total: 0, created: 0, joined: 0 },
    events: { total: 0, created: 0, joined: 0 },
    subscription: { plan: "Free", status: "ACTIVE", validUntil: "N/A", paymentMethod: "None" },
  },
  {
    id: "flow-sjm-5520",
    username: "@sjm_82",
    displayName: "Sarah J. Miller",
    fullName: "Sarah J. Miller",
    email: "sjm_82@flow.com",
    phone: "+1(555) 321-9870",
    website: "https://sarahmiller.co",
    bio: "Content Creator & Social Media Manager",
    location: "Chicago, IL",
    profession: "Content Creator",
    gender: "Female",
    relationshipStatus: "Single",
    dateOfBirth: "1995-07-28",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    status: "NEW",
    accountTier: "FREE",
    registrationDate: "2024-05-20",
    stats: { friends: 124, followers: 432, following: 12, reportedPosts: 0, createdPosts: 12, profileViews: 540 },
    groups: { total: 2, created: 0, joined: 2 },
    events: { total: 3, created: 0, joined: 3 },
    subscription: { plan: "Starter", status: "ACTIVE", validUntil: "Jun 20, 2025", paymentMethod: "Visa ending in 1234" },
  },
  {
    id: "flow-kbry-9901",
    username: "@kb_enterprise",
    displayName: "Kevin Bryant",
    fullName: "Kevin Bryant",
    email: "kb@enterprise.net",
    phone: "+1(555) 654-3210",
    website: "https://kevinbryant.biz",
    bio: "Enterprise Solutions Architect",
    location: "New York, NY",
    profession: "Solutions Architect",
    gender: "Male",
    relationshipStatus: "Married",
    dateOfBirth: "1985-11-12",
    avatarUrl: "",
    status: "ACTIVE",
    accountTier: "ENTERPRISE",
    registrationDate: "2023-11-30",
    stats: { friends: 890, followers: 8202, following: 42, reportedPosts: 1, createdPosts: 67, profileViews: 3200 },
    groups: { total: 6, created: 2, joined: 4 },
    events: { total: 9, created: 3, joined: 6 },
    subscription: { plan: "Enterprise Elite", status: "ACTIVE", validUntil: "Nov 30, 2025", paymentMethod: "Corporate Card ending in 9999" },
  },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalUsers: 1200000,
  activeUsers: 850000,
  newRegistrations: 12450,
  flaggedUsers: 412804,
  newSignups: 1402,
  premiumUsers: 142502,
  totalEarnings: 145200,
  monthlyEarnings: 3000,
  totalPremiumUsers: 500000,
};

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
}

export const MOCK_GROUPS: Group[] = [
  { id: "g1", name: "Dev_Infrastructure",      category: "Tech",     privacy: "Public",  owner: { name: "Marcus Thorne",   initials: "MT", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" }, members: 12482, posts: 45200,  status: "ACTIVE",    iconColor: "#1d4ed8", createdAt: "06/02/2023" },
  { id: "g2", name: "Global_Design_Collective", category: "Design",   privacy: "Private", owner: { name: "Elena Voss",     initials: "EV", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop" }, members:  8103, posts: 112000, status: "ACTIVE",    iconColor: "#374151", createdAt: "08/14/2023" },
  { id: "g3", name: "Shadow_Traders_Elite",     category: "Finance",  privacy: "Private", owner: { name: "Unknown Entity",  initials: "UK" },                                                                                                members:   542, posts:   1200, status: "SUSPENDED", iconColor: "#b91c1c", createdAt: "01/06/2024" },
  { id: "g4", name: "Alpha_Moderators",         category: "Security", privacy: "Public",  owner: { name: "Soren Kierk",    initials: "SK", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop" }, members:    42, posts:   9800, status: "PENDING",   iconColor: "#1e3a5f", createdAt: "11/20/2023" },
  { id: "g5", name: "Crypto_Builders_Hub",      category: "Finance",  privacy: "Public",  owner: { name: "Ryan Nakamura",  initials: "RN", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop" }, members:  3410, posts:  22100, status: "ACTIVE",    iconColor: "#065f46", createdAt: "03/18/2024" },
  { id: "g6", name: "UX_Craft_Society",         category: "Design",   privacy: "Public",  owner: { name: "Priya Sharma",   initials: "PS", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop" }, members:  5820, posts:  34800, status: "ACTIVE",    iconColor: "#6b21a8", createdAt: "09/05/2023" },
  { id: "g7", name: "Esports_Arena_Pro",        category: "Gaming",   privacy: "Public",  owner: { name: "Jake Torres",    initials: "JT" },                                                                                                members: 28400, posts: 198000, status: "REPORTED",  iconColor: "#92400e", createdAt: "12/01/2022" },
  { id: "g8", name: "Social_Innovators_Lab",    category: "Social",   privacy: "Private", owner: { name: "Amara Okonkwo",  initials: "AO", avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=60&h=60&fit=crop" }, members:  1290, posts:   8400, status: "ACTIVE",    iconColor: "#0e7490", createdAt: "05/30/2024" },
  { id: "g9", name: "Backend_Wizards",          category: "Tech",     privacy: "Private", owner: { name: "Chen Wei",       initials: "CW" },                                                                                                members:  2100, posts:  15600, status: "ACTIVE",    iconColor: "#1d4ed8", createdAt: "02/11/2024" },
  { id: "g10",name: "Creative_Freelancers",     category: "Design",   privacy: "Public",  owner: { name: "Sofia Reyes",    initials: "SR", avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&h=60&fit=crop" }, members:  4750, posts:  29700, status: "ACTIVE",    iconColor: "#374151", createdAt: "07/22/2023" },
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

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { day: "Mon", dau: 280, mau: 520 },
  { day: "Tue", dau: 320, mau: 580 },
  { day: "Wed", dau: 290, mau: 540 },
  { day: "Thu", dau: 380, mau: 620 },
  { day: "Fri", dau: 420, mau: 680 },
  { day: "Sat", dau: 520, mau: 750 },
  { day: "Sun (Live)", dau: 650, mau: 820 },
];
