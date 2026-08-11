/* ── Mini Sites module — demo data (mock, no backend yet) ── */

export type SiteStatus = "LIVE" | "DRAFT" | "SUSPENDED";
export type SiteVisibility = "PUBLIC" | "PRIVATE" | "PASSWORD";

export interface MiniSite {
  id: string;
  name: string;
  slug: string;
  /** Published public URL. */
  url?: string;
  creator: { name: string; avatarUrl?: string };
  status: SiteStatus;
  visibility: SiteVisibility;
  views: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MiniSiteStats {
  totalSites: number;
  liveSites: number;
  publicSites: number;
  privateSites: number;
  passwordSites: number;
}

export type SiteReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";
export type SiteReportReason =
  | "Spam"
  | "Phishing / Scam"
  | "Malware"
  | "Inappropriate Content"
  | "Copyright"
  | "Other";

export interface SiteReport {
  id: string;
  site: { id: string; name: string; slug: string; creator: string; status: SiteStatus };
  reportedBy: { username: string; avatarUrl?: string };
  reason: SiteReportReason;
  description: string;
  status: SiteReportStatus;
  reportedAt: string;
}

export interface SiteReportStats {
  total: number;
  pending: number;
  resolved: number;
}

const av = (seed: string) => `https://i.pravatar.cc/80?u=${seed}`;

export const MOCK_MINI_SITES: MiniSite[] = [
  { id: "s1",  name: "Aurora Portfolio",   slug: "aurora-portfolio",   creator: { name: "Elena Voss",     avatarUrl: av("elena") },   status: "LIVE",      visibility: "PUBLIC",   views: 48210, createdAt: "2026-05-14T10:22:00Z", updatedAt: "2026-08-01T08:12:00Z" },
  { id: "s2",  name: "Nomad Coffee Co.",   slug: "nomad-coffee",       creator: { name: "Marcus Chen",    avatarUrl: av("marcus") },  status: "LIVE",      visibility: "PUBLIC",   views: 129430, createdAt: "2026-03-02T14:05:00Z", updatedAt: "2026-07-28T19:40:00Z" },
  { id: "s3",  name: "Internal Wiki",      slug: "internal-wiki",      creator: { name: "Priya Sharma",   avatarUrl: av("priya") },   status: "LIVE",      visibility: "PRIVATE",  views: 1203,  createdAt: "2026-06-19T09:00:00Z", updatedAt: "2026-08-04T11:15:00Z" },
  { id: "s4",  name: "Launch Teaser",      slug: "launch-teaser",      creator: { name: "Ryan Nakamura",  avatarUrl: av("ryan") },    status: "DRAFT",     visibility: "PASSWORD", views: 88,    createdAt: "2026-07-30T16:30:00Z", updatedAt: "2026-08-05T10:02:00Z" },
  { id: "s5",  name: "Freelance Rates",    slug: "freelance-rates",    creator: { name: "Sofia Reyes",    avatarUrl: av("sofia") },   status: "LIVE",      visibility: "PASSWORD", views: 3420,  createdAt: "2026-04-11T12:45:00Z", updatedAt: "2026-07-20T22:00:00Z" },
  { id: "s6",  name: "Crypto Signals",     slug: "crypto-signals",     creator: { name: "Unknown Entity" },                            status: "SUSPENDED", visibility: "PUBLIC",   views: 24100, createdAt: "2026-02-08T08:20:00Z", updatedAt: "2026-06-15T07:30:00Z" },
  { id: "s7",  name: "Wedding Invite",     slug: "wedding-invite",     creator: { name: "Amara Okonkwo",  avatarUrl: av("amara") },   status: "LIVE",      visibility: "PASSWORD", views: 640,   createdAt: "2026-07-01T18:10:00Z", updatedAt: "2026-08-03T14:25:00Z" },
  { id: "s8",  name: "Startup Landing",    slug: "startup-landing",    creator: { name: "Chen Wei",       avatarUrl: av("chen") },    status: "LIVE",      visibility: "PUBLIC",   views: 76500, createdAt: "2026-01-25T11:00:00Z", updatedAt: "2026-07-31T09:55:00Z" },
  { id: "s9",  name: "Photography Set",    slug: "photography-set",    creator: { name: "Jake Torres",    avatarUrl: av("jake") },    status: "LIVE",      visibility: "PRIVATE",  views: 2110,  createdAt: "2026-05-30T13:40:00Z", updatedAt: "2026-08-02T16:48:00Z" },
  { id: "s10", name: "Menu Board",         slug: "menu-board",         creator: { name: "Sofia Reyes",    avatarUrl: av("sofia") },   status: "DRAFT",     visibility: "PRIVATE",  views: 12,    createdAt: "2026-08-04T20:00:00Z", updatedAt: "2026-08-05T09:10:00Z" },
  { id: "s11", name: "Event RSVP",         slug: "event-rsvp",         creator: { name: "Marcus Chen",    avatarUrl: av("marcus") },  status: "LIVE",      visibility: "PUBLIC",   views: 9830,  createdAt: "2026-06-05T10:30:00Z", updatedAt: "2026-07-27T12:00:00Z" },
  { id: "s12", name: "Resume One-Pager",   slug: "resume-one-pager",   creator: { name: "Elena Voss",     avatarUrl: av("elena") },   status: "LIVE",      visibility: "PUBLIC",   views: 5400,  createdAt: "2026-03-19T15:20:00Z", updatedAt: "2026-07-15T08:35:00Z" },
];

export const MOCK_MINI_SITE_STATS: MiniSiteStats = {
  totalSites: 12,
  liveSites: 8,
  publicSites: 5,
  privateSites: 3,
  passwordSites: 3,
};

export const MOCK_SITE_REPORTS: SiteReport[] = [
  { id: "sr1", site: { id: "s6",  name: "Crypto Signals",   slug: "crypto-signals",   creator: "Unknown Entity", status: "SUSPENDED" }, reportedBy: { username: "@watchdog_42", avatarUrl: av("wd") },   reason: "Phishing / Scam",         description: "Site collects wallet seed phrases behind a fake airdrop form.", status: "PENDING",   reportedAt: "2026-08-05T09:12:00Z" },
  { id: "sr2", site: { id: "s2",  name: "Nomad Coffee Co.", slug: "nomad-coffee",     creator: "Marcus Chen",    status: "LIVE" },      reportedBy: { username: "@rival_cafe",  avatarUrl: av("rc") },   reason: "Copyright",               description: "Uses our brand logo and product photos without permission.", status: "PENDING",   reportedAt: "2026-08-04T17:40:00Z" },
  { id: "sr3", site: { id: "s8",  name: "Startup Landing",  slug: "startup-landing",  creator: "Chen Wei",       status: "LIVE" },      reportedBy: { username: "@qa_tester",   avatarUrl: av("qa") },   reason: "Malware",                 description: "A script on the page triggers a suspicious download.",        status: "PENDING",   reportedAt: "2026-08-03T11:05:00Z" },
  { id: "sr4", site: { id: "s1",  name: "Aurora Portfolio", slug: "aurora-portfolio", creator: "Elena Voss",     status: "LIVE" },      reportedBy: { username: "@user_9981" },                          reason: "Inappropriate Content",  description: "Gallery contains images that violate the content policy.",     status: "RESOLVED",  reportedAt: "2026-07-28T14:22:00Z" },
  { id: "sr5", site: { id: "s11", name: "Event RSVP",       slug: "event-rsvp",       creator: "Marcus Chen",    status: "LIVE" },      reportedBy: { username: "@spam_hunter", avatarUrl: av("sh") },   reason: "Spam",                    description: "RSVP form is used to harvest emails for spam campaigns.",       status: "DISMISSED", reportedAt: "2026-07-25T08:00:00Z" },
];

export const MOCK_SITE_REPORT_STATS: SiteReportStats = {
  total: 5,
  pending: 3,
  resolved: 2,
};
