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

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string[];
  recommended?: boolean;
  sortOrder: number;
}

export interface PlanMetric {
  id: string;
  label: string;
  value: number;
  changePercent: number;
  icon: "subscribers" | "active" | "free" | "trial";
}
