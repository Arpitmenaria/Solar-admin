import type {
  User, UserFilters, PaginatedUsers,
  UserStatus, PlanTier, UserStatsSummary, Subscription, SubscriptionStatus,
} from "@/types";
import { MOCK_DASHBOARD_STATS, MOCK_MODERATION, MOCK_CHART_DATA } from "@/constants/mock-data";
import { apiClient, type ApiError } from "@/services/api/client";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "NEW", "FLAGGED", "PREMIUM"];
// The account tier shares the Plans vocabulary (free/gold/platinum), not the
// old FREE/PREMIUM/ENTERPRISE set — the API sends it lowercase.
const TIERS: PlanTier[] = ["free", "gold", "platinum"];
const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["ACTIVE", "EXPIRED", "CANCELLED"];

// The API sends this lowercase too.
function normalizeSubscriptionStatus(s?: string): SubscriptionStatus {
  const upper = s?.toUpperCase();
  return SUBSCRIPTION_STATUSES.includes(upper as SubscriptionStatus) ? (upper as SubscriptionStatus) : "EXPIRED";
}

interface ApiUser {
  _id?: string;
  id?: string;
  /** The backend stores a single name column; username/displayName may be absent. */
  fullName?: string;
  name?: string;
  username?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  website?: string;
  bio?: string;
  location?: string;
  profession?: string;
  gender?: string;
  relationshipStatus?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  coverUrl?: string;
  status?: string;
  isSuspended?: boolean;
  accountTier?: string;
  registrationDate?: string;
  stats?: Partial<User["stats"]>;
  groups?: Partial<User["groups"]>;
  events?: Partial<User["events"]>;
  subscription?: Partial<Subscription> | null;
}

const num = (v: number | undefined) => v ?? 0;

function mapApiUser(u: ApiUser): User {
  // One name column upstream: fall back so `username`/`displayName` are never
  // undefined (the edit form calls .replace() on username and would throw).
  const fullName = u.fullName ?? u.name ?? "";
  const status = STATUSES.includes(u.status as UserStatus) ? (u.status as UserStatus) : "ACTIVE";

  return {
    id: u._id ?? u.id ?? "",
    username: u.username ?? fullName,
    displayName: u.displayName ?? fullName,
    fullName,
    email: u.email ?? "",
    phone: u.phone ?? "",
    website: u.website ?? "",
    bio: u.bio ?? "",
    location: u.location ?? "",
    profession: u.profession ?? "",
    gender: u.gender ?? "",
    relationshipStatus: u.relationshipStatus ?? "",
    dateOfBirth: u.dateOfBirth ?? "",
    avatarUrl: u.avatarUrl ?? "",
    coverUrl: u.coverUrl,
    status,
    // Prefer the explicit flag; fall back to the derived status until the
    // backend adds `isSuspended` to the payload.
    isSuspended: u.isSuspended ?? status === "INACTIVE",
    accountTier: TIERS.includes(u.accountTier?.toLowerCase() as PlanTier) ? (u.accountTier!.toLowerCase() as PlanTier) : "free",
    registrationDate: u.registrationDate ?? "",
    stats: {
      friends: num(u.stats?.friends),
      followers: num(u.stats?.followers),
      following: num(u.stats?.following),
      reportedPosts: num(u.stats?.reportedPosts),
      createdPosts: num(u.stats?.createdPosts),
      profileViews: num(u.stats?.profileViews),
    },
    groups: {
      total: num(u.groups?.total),
      created: num(u.groups?.created),
      joined: num(u.groups?.joined),
    },
    events: {
      total: num(u.events?.total),
      created: num(u.events?.created),
      joined: num(u.events?.joined),
    },
    subscription: u.subscription
      ? {
          plan: u.subscription.plan ?? "—",
          status: normalizeSubscriptionStatus(u.subscription.status),
          validUntil: u.subscription.validUntil ?? null,
          paymentMethod: u.subscription.paymentMethod ?? null,
        }
      : null,
  };
}

interface ApiUserList {
  success: boolean;
  users: ApiUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const usersService = {
  async getUsers(filters: Partial<UserFilters> = {}): Promise<PaginatedUsers> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);

    const res = await apiClient.get<ApiUserList>(`/api/admin/users?${params.toString()}`);

    return {
      data: (res.users ?? []).map(mapApiUser),
      total: res.total ?? 0,
      page: res.page ?? page,
      pageSize: res.pageSize ?? pageSize,
      totalPages: res.totalPages ?? 1,
    };
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const res = await apiClient.get<{ success: boolean; user: ApiUser | null }>(`/api/admin/users/${id}`);
      return res.user ? mapApiUser(res.user) : null;
    } catch (err) {
      // The API answers a missing user with 404, which apiClient throws —
      // translate it back to null so the page renders "User not found".
      if ((err as ApiError)?.status === 404) return null;
      throw err;
    }
  },

  async getUserStats(): Promise<UserStatsSummary> {
    const res = await apiClient.get<{ success: boolean; stats: UserStatsSummary }>("/api/admin/users/stats");
    return res.stats;
  },

  /**
   * Toggles isSuspended and returns the resulting state. Suspending also
   * force-logs-out the user's session. Callers should report the returned
   * value rather than assuming the opposite of what they had — two admins
   * acting at once would otherwise get a toast that contradicts reality.
   */
  async toggleSuspend(id: string): Promise<boolean> {
    const res = await apiClient.patch<{ success: boolean; message: string; isSuspended: boolean }>(
      `/api/admin/users/${id}/suspend`,
      {}
    );
    return res.isSuspended;
  },
};

export const dashboardService = {
  // Still mock: no endpoint exposes earnings or the DAU/MAU series yet.
  async getStats() {
    await delay(200);
    return MOCK_DASHBOARD_STATS;
  },
  async getModeration() {
    await delay(150);
    return MOCK_MODERATION;
  },
  async getChartData() {
    await delay(200);
    return MOCK_CHART_DATA;
  },
};
