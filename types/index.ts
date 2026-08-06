export type UserStatus = "ACTIVE" | "INACTIVE" | "NEW" | "FLAGGED" | "PREMIUM";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface User {
  id: string;
  username: string;
  displayName: string;
  fullName: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
  location: string;
  profession: string;
  gender: string;
  relationshipStatus: string;
  dateOfBirth: string;
  avatarUrl: string;
  coverUrl?: string;
  status: UserStatus;
  /**
   * Backing field for the suspend toggle. `status` is derived server-side and
   * INACTIVE currently means "suspended", but deriving a mutation's direction
   * from a display string breaks the moment a second INACTIVE rule is added —
   * so the toggle reads this instead.
   */
  isSuspended: boolean;
  accountTier: PlanTier;
  registrationDate: string;
  stats: UserStats;
  groups: GroupStats;
  events: EventStats;
  /** null for users who have never subscribed. */
  subscription: Subscription | null;
}

export interface UserStats {
  friends: number;
  followers: number;
  following: number;
  reportedPosts: number;
  createdPosts: number;
  profileViews: number;
  /** How many reports other users have filed against this account. */
  reportedByCount: number;
}

export interface GroupStats {
  total: number;
  created: number;
  joined: number;
}

export interface EventStats {
  total: number;
  created: number;
  joined: number;
}

export interface Subscription {
  plan: string;
  status: SubscriptionStatus;
  /** null until a payment system is wired up on the backend. */
  validUntil: string | null;
  paymentMethod: string | null;
}

/** The four cards above the user directory. */
export interface UserStatsSummary {
  totalUsers: number;
  premiumUsers: number;
  /** Registrations in the last 30 days. */
  newSignups: number;
  flaggedUsers: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  flaggedUsers: number;
  newSignups: number;
  premiumUsers: number;
  totalEarnings: number;
  monthlyEarnings: number;
  totalPremiumUsers: number;
}

export interface NotificationSettings {
  newUser: boolean;
  postReport: boolean;
  commentReport: boolean;
  messageReport: boolean;
  groupReport: boolean;
}

export type AdminNotificationType =
  | "new_user"
  | "post_report"
  | "comment_report"
  | "message_report"
  | "group_report";

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  targetId: string | null;
  read: boolean;
  createdAt: string;
}

export interface ModerationItem {
  id: string;
  username: string;
  avatarUrl?: string;
  reportedAt: string;
  type: "Policy Violation" | "Spam Detection" | "Harassment";
  excerpt: string;
}

export type ChartPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface ChartDataPoint {
  label: string;
  totalUsers: number;
  premiumUsers: number;
}

export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export type ReportCategory =
  | "Spam"
  | "Harassment"
  | "Inappropriate Content"
  | "Scam / Fraud"
  | "Fake or Misleading"
  | "Hate Speech"
  | "Other";

export interface ReportTarget {
  id: string;
  name: string;
  avatarUrl?: string;
  /** secondary line under the name, e.g. "12,482 members" or "Sat, Aug 16 · 7:00 PM" */
  meta: string;
}

export interface ReportedBy {
  username: string;
  avatarUrl?: string;
}

export interface Report {
  id: string;
  target: ReportTarget;
  reportedBy: ReportedBy;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  reportedAt: string;
}

export interface ReportStats {
  total: number;
  pending: number;
  resolved: number;
  dismissed: number;
}

export interface UserFilters {
  search: string;
  status: UserStatus | "ALL";
  sortBy: string;
  page: number;
  pageSize: number;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ── User relations (connections / followers / following) ── */

export type RelationKind = "connections" | "followers" | "following";

/** A person in one of the relation lists — a thin slice of a user. */
export interface RelationUser {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  isSuspended: boolean;
}

export interface PaginatedRelations {
  data: RelationUser[];
  total: number;
  page: number;
  totalPages: number;
}

/* ── "Reported by" — users who filed reports against this account ── */

export interface Reporter {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  isSuspended: boolean;
  /** Reason the reporter gave, if any. */
  reason: string;
  /** When the report was filed. */
  reportedAt: string;
}

export interface PaginatedReporters {
  data: Reporter[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProfileFormValues {
  fullName: string;
  username: string;
  displayName: string;
  dateOfBirth: string;
  gender: string;
  relationshipStatus: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
}

/* ── Reported posts ─────────────────────────── */

/** The API uses lowercase; mapped to these at the service boundary. */
export type PostReportStatus = "PENDING" | "RESOLVED";

export interface PostMedia {
  url: string;
  type: string;
}

/** Reporter or post author — the API returns the same shape for both. */
export interface PostReportPerson {
  id: string;
  fullName: string;
  avatarUrl: string;
}

export interface ReportedPost {
  id: string;
  caption: string;
  media: PostMedia[];
  author: PostReportPerson;
}

export interface PostReport {
  reportId: string;
  postId: string;
  status: PostReportStatus;
  /**
   * The post row is gone, but `post` is still populated from the snapshot
   * captured when the report was filed.
   */
  postDeleted: boolean;
  /** Hidden from the public feed by an admin, but not deleted. */
  postHidden: boolean;
  /** Reports are grouped per post; this is how many were filed against it. */
  reportCount: number;
  reasons: string[];
  reportedAt: string;
  /** Every unique reporter for this post, not just the first. */
  reporters: PostReportPerson[];
  post: ReportedPost;
}

export interface PostReportStats {
  total: number;
  pending: number;
  resolved: number;
}

export interface PaginatedPostReports {
  data: PostReport[];
  total: number;
  page: number;
  totalPages: number;
  stats: PostReportStats;
}

/** An author who has at least one reported post — for the author filter. */
export interface ReportedPostAuthor {
  id: string;
  name: string;
}

/* ── Reported comments ─────────────────────────── */

/** The API uses lowercase; mapped to these at the service boundary. */
export type CommentReportStatus = "PENDING" | "RESOLVED";

export interface ReportedComment {
  id: string;
  text: string;
  author: PostReportPerson;
  postId: string;
  /** Snippet of the parent post's caption, for context. */
  postCaption: string;
}

export interface CommentReport {
  reportId: string;
  commentId: string;
  status: CommentReportStatus;
  /**
   * The comment row is gone, but `comment` is still populated from the
   * snapshot captured when the report was filed.
   */
  commentDeleted: boolean;
  /** Hidden from the public feed by an admin, but not deleted. */
  commentHidden: boolean;
  /** Reports are grouped per comment; this is how many were filed against it. */
  reportCount: number;
  reasons: string[];
  reportedAt: string;
  /** Every unique reporter for this comment, not just the first. */
  reporters: PostReportPerson[];
  comment: ReportedComment;
}

export interface CommentReportStats {
  total: number;
  pending: number;
  resolved: number;
}

export interface PaginatedCommentReports {
  data: CommentReport[];
  total: number;
  page: number;
  totalPages: number;
  stats: CommentReportStats;
}

/* ── Reported conversations ─────────────────────────── */

/** The API uses lowercase; mapped to these at the service boundary. */
export type ConversationReportStatus = "PENDING" | "RESOLVED";

/** A conversation is either a group chat or a 1:1 direct chat. */
export type ChatType = "group" | "direct";

/** Reporter or any other referenced person — the API returns the same shape for all of them. */
export interface MessageReportPerson {
  id: string;
  fullName: string;
  avatarUrl: string;
}

/** A reporter on the conversation-list view, with the reason they gave. */
export interface ConversationReporter extends MessageReportPerson {
  reason: string;
}

export interface MessageChatContext {
  type: ChatType;
  id: string;
  /** Group name for group chats; the other participant's name for DMs. */
  name: string;
}

/** One row in the reported-conversations list — reports merged per conversation. */
export interface ConversationReportSummary {
  conversationId: string;
  chat: MessageChatContext;
  status: ConversationReportStatus;
  /** Total reports filed against this conversation. */
  reportCount: number;
  /** Group chats only — undefined for direct messages. */
  memberCount?: number;
  /** Every reporter, each with the reason they gave. */
  reporters: ConversationReporter[];
  lastReportedAt: string;
}

export interface ConversationReportStats {
  total: number;
  pending: number;
  resolved: number;
}

export interface PaginatedConversationReports {
  data: ConversationReportSummary[];
  total: number;
  page: number;
  totalPages: number;
  stats: ConversationReportStats;
}

/* ── Admin audit log ─────────────────────────── */

/** Known action slugs. Kept as a plain string so the backend can add more
 *  without breaking the type; labels live in AUDIT_ACTION_LABELS. */
export type AuditAction = string;

/** One row in the admin action audit trail. */
export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  targetAuthorId: string;
  targetAuthorName: string;
  reason: string;
  notes: string;
  statusBefore: string;
  statusAfter: string;
  userNotified: boolean;
  notificationSent: boolean;
  emailSent: boolean;
  createdAt: string;
}

/** A report that triggered an audited action. */
export interface AuditLogReportRef {
  id: string;
  reason: string;
  reporterName: string;
}

/** Full audit entry — adds IP and the triggering reports. */
export interface AuditLogDetail extends AuditLog {
  ipAddress: string;
  relatedReports: AuditLogReportRef[];
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

/** One filed report within a conversation's report detail view. */
export interface ConversationMessageReport {
  reportId: string;
  reason: string;
  reportedAt: string;
  status: ConversationReportStatus;
  reporter: MessageReportPerson;
}

export interface ConversationReportDetail {
  conversationId: string;
  chat: MessageChatContext;
  memberCount?: number;
  reports: ConversationMessageReport[];
}

/** A single message in the conversation transcript. */
export interface ConversationMessage {
  sender: MessageReportPerson;
  text: string;
  timestamp: string;
}

/** Members + full message history — the context an admin reviews before acting. */
export interface ConversationTranscript {
  members: MessageReportPerson[];
  messages: ConversationMessage[];
}

export type PlanTier = "free" | "gold" | "platinum";
export type PlanBillingType = "weekly" | "monthly" | "quarterly" | "yearly";

export interface Plan {
  id: string;
  tier: PlanTier;
  type: PlanBillingType;
  price: number;
  features: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanMetricBreakdown {
  weekly: number;
  monthly: number;
  quarterly: number;
  yearly: number;
}

export interface PlanMetric {
  id: string;
  label: string;
  value: number;
  icon: "subscribers" | "trial" | "gold" | "premium";
  breakdown: PlanMetricBreakdown;
}
