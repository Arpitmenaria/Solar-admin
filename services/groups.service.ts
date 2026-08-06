import type { Group, GroupCategory, GroupMember, GroupPrivacy, GroupStatus } from "@/constants/mock-data";
import { getInitials } from "@/lib/utils";
import { apiClient } from "@/services/api/client";

const BASE = "/api/admin/groups";

const CATEGORY_ICON_COLOR: Record<GroupCategory, string> = {
  Tech: "#1d4ed8",
  Design: "#374151",
  Finance: "#065f46",
  Security: "#1e3a5f",
  Gaming: "#92400e",
  Social: "#0e7490",
};

const CATEGORIES: GroupCategory[] = ["Tech", "Design", "Finance", "Security", "Gaming", "Social"];
const STATUSES: GroupStatus[] = ["ACTIVE", "SUSPENDED", "PENDING", "REPORTED"];

interface ApiGroup {
  _id?: string;
  id?: string;
  name?: string;
  category?: string;
  privacy?: string;
  owner?: { name?: string; avatar?: string; avatarUrl?: string } | null;
  members?: number;
  posts?: number;
  status?: string;
  createdAt?: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  deletedAt?: string;
}

export interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  pendingApproval: number;
  privateGroups: number;
  publicGroups: number;
  reportedGroups: number;
  suspended: number;
  newlyCreated24h: number;
}

const EMPTY_STATS: GroupStats = {
  totalGroups: 0, activeGroups: 0, pendingApproval: 0, privateGroups: 0,
  publicGroups: 0, reportedGroups: 0, suspended: 0, newlyCreated24h: 0,
};

interface ApiGroupList {
  success: boolean;
  groups: ApiGroup[];
  total: number;
  page: number;
  totalPages: number;
  stats: GroupStats;
}

function mapCategory(c?: string): GroupCategory {
  return CATEGORIES.includes(c as GroupCategory) ? (c as GroupCategory) : "Social";
}

function mapStatus(s?: string): GroupStatus {
  const upper = (s ?? "").toUpperCase();
  return STATUSES.includes(upper as GroupStatus) ? (upper as GroupStatus) : "ACTIVE";
}

function mapGroup(g: ApiGroup): Group {
  const category = mapCategory(g.category);
  const ownerName = g.owner?.name ?? "Unknown";
  return {
    id: g._id ?? g.id ?? "",
    name: g.name ?? "",
    category,
    privacy: g.privacy === "Private" ? "Private" : "Public",
    owner: {
      name: ownerName,
      avatarUrl: g.owner?.avatarUrl ?? g.owner?.avatar,
      initials: getInitials(ownerName),
    },
    members: g.members ?? 0,
    posts: g.posts ?? 0,
    status: mapStatus(g.status),
    iconColor: CATEGORY_ICON_COLOR[category],
    createdAt: g.createdAt ?? "",
    deletedAt: g.deletedAt,
    description: g.description,
    avatarUrl: g.avatarUrl,
    coverUrl: g.coverUrl,
  };
}

export interface CreateGroupInput {
  name: string;
  category: GroupCategory;
  privacy: GroupPrivacy;
  ownerName: string;
  ownerAvatarUrl?: string;
}

export type UpdateGroupInput = Partial<{
  name: string;
  category: GroupCategory;
  privacy: GroupPrivacy;
  status: GroupStatus;
  ownerName: string;
  ownerAvatarUrl: string;
}>;

export interface GroupFilters {
  search: string;
  status: GroupStatus | "";
  privacy: GroupPrivacy | "";
  category: GroupCategory | "";
  /** When true, lists soft-deleted groups from the /deleted endpoint. */
  deleted: boolean;
  page: number;
  limit: number;
}

interface ApiDeletedGroupList {
  success: boolean;
  groups: ApiGroup[];
  total: number;
  page: number;
  totalPages: number;
  stats: { totalDeleted: number };
}

export interface PaginatedGroups {
  data: Group[];
  total: number;
  page: number;
  totalPages: number;
  stats: GroupStats;
}

export const groupsService = {
  async getGroups(filters: Partial<GroupFilters> = {}): Promise<PaginatedGroups> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.search) params.set("search", filters.search);

    // Deleted view: separate endpoint, only search/pagination apply. Its stats
    // carry just `totalDeleted`, so map that onto the TOTAL card.
    if (filters.deleted) {
      const res = await apiClient.get<ApiDeletedGroupList>(`${BASE}/deleted?${params.toString()}`);
      return {
        data: (res.groups ?? []).map(mapGroup),
        total: res.total ?? 0,
        page: res.page ?? page,
        totalPages: res.totalPages ?? 1,
        stats: { ...EMPTY_STATS, totalGroups: res.stats?.totalDeleted ?? res.total ?? 0 },
      };
    }

    if (filters.status) params.set("status", filters.status);
    if (filters.privacy) params.set("privacy", filters.privacy);
    if (filters.category) params.set("category", filters.category);

    const res = await apiClient.get<ApiGroupList>(`${BASE}?${params.toString()}`);
    return {
      data: (res.groups ?? []).map(mapGroup),
      total: res.total ?? 0,
      page: res.page ?? page,
      totalPages: res.totalPages ?? 1,
      stats: res.stats ?? EMPTY_STATS,
    };
  },

  async getGroupById(id: string): Promise<Group | null> {
    const res = await apiClient.get<{ success: boolean; group: ApiGroup | null }>(`${BASE}/${id}`);
    return res.group ? mapGroup(res.group) : null;
  },

  async getGroupMembers(id: string): Promise<GroupMember[]> {
    const res = await apiClient.get<{ success: boolean; members: { _id?: string; id?: string; name?: string; avatar?: string; avatarUrl?: string; role?: string; joinedAt?: string }[] }>(
      `${BASE}/${id}/members`,
    );
    return (res.members ?? []).map((m) => ({
      id: m._id ?? m.id ?? "",
      name: m.name ?? "",
      avatarUrl: m.avatarUrl ?? m.avatar,
      role: m.role === "Admin" || m.role === "Moderator" ? m.role : "Member",
      joinedAt: m.joinedAt ?? "",
    }));
  },

  async createGroup(input: CreateGroupInput): Promise<Group> {
    const res = await apiClient.post<{ success: boolean; group: ApiGroup }>(BASE, input);
    return mapGroup(res.group);
  },

  async updateGroup(id: string, input: UpdateGroupInput): Promise<Group> {
    const res = await apiClient.patch<{ success: boolean; group: ApiGroup }>(`${BASE}/${id}`, input);
    return mapGroup(res.group);
  },

  /** Audited actions — each requires a reason (min 5 chars) + optional notes. */
  async suspendGroup(id: string, reason: string, notes = ""): Promise<void> {
    await apiClient.patch(`${BASE}/${id}/suspend`, { reason, notes });
  },

  async unsuspendGroup(id: string, reason: string, notes = ""): Promise<void> {
    await apiClient.patch(`${BASE}/${id}/unsuspend`, { reason, notes });
  },

  async deleteGroup(id: string, reason: string, notes = ""): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`, { reason, notes });
  },
};
