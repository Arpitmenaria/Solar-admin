export type UserStatus = "ACTIVE" | "NEW" | "FLAGGED" | "PREMIUM";
export type AccountTier = "FREE" | "PREMIUM" | "ENTERPRISE";
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
  accountTier: AccountTier;
  registrationDate: string;
  stats: UserStats;
  groups: GroupStats;
  events: EventStats;
  subscription: Subscription;
}

export interface UserStats {
  friends: number;
  followers: number;
  following: number;
  reportedPosts: number;
  createdPosts: number;
  profileViews: number;
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
  validUntil: string;
  paymentMethod: string;
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

export interface ModerationItem {
  id: string;
  username: string;
  avatarUrl?: string;
  reportedAt: string;
  type: "Policy Violation" | "Spam Detection" | "Harassment";
  excerpt: string;
}

export interface ChartDataPoint {
  day: string;
  dau: number;
  mau: number;
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

export type PlanTier = "free" | "gold" | "premium";

export interface Plan {
  id: string;
  name: string;
  description?: string;
  tier: PlanTier;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string[];
  sortOrder: number;
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
