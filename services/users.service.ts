import type { User, UserFilters, PaginatedUsers, ProfileFormValues } from "@/types";
import { MOCK_USERS, MOCK_DASHBOARD_STATS, MOCK_MODERATION, MOCK_CHART_DATA } from "@/constants/mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const usersService = {
  async getUsers(filters: Partial<UserFilters> = {}): Promise<PaginatedUsers> {
    await delay(300);
    let data = [...MOCK_USERS];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== "ALL") {
      data = data.filter((u) => u.status === filters.status);
    }
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;
    const total = 24970;
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getUserById(id: string): Promise<User | null> {
    await delay(200);
    return MOCK_USERS.find((u) => u.id === id) ?? null;
  },

  async updateUser(id: string, values: Partial<ProfileFormValues>): Promise<User> {
    await delay(500);
    const user = MOCK_USERS.find((u) => u.id === id);
    if (!user) throw new Error("User not found");
    return { ...user, ...values };
  },

  async blockUser(id: string): Promise<User> {
    await delay(400);
    const user = MOCK_USERS.find((u) => u.id === id);
    if (!user) throw new Error("User not found");
    user.status = "FLAGGED";
    return { ...user };
  },
};

export const dashboardService = {
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
