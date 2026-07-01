import type { Group, GroupCategory, GroupMember, GroupPost, GroupPrivacy, GroupStatus } from "@/constants/mock-data";
import { MOCK_GROUPS, MOCK_GROUP_MEMBERS, MOCK_GROUP_POSTS, MOCK_GROUP_STATS, dummyAvatar, dummyCover } from "@/constants/mock-data";
import { getInitials } from "@/lib/utils";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CATEGORY_ICON_COLOR: Record<GroupCategory, string> = {
  Tech: "#1d4ed8",
  Design: "#374151",
  Finance: "#065f46",
  Security: "#1e3a5f",
  Gaming: "#92400e",
  Social: "#0e7490",
};

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "group";
}

function formatToday(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
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

export const groupsService = {
  async getGroups(): Promise<Group[]> {
    await delay(250);
    return MOCK_GROUPS.map((g) => ({ ...g, owner: { ...g.owner } }));
  },

  async getGroupStats() {
    await delay(150);
    return MOCK_GROUP_STATS;
  },

  async getGroupById(id: string): Promise<Group | null> {
    await delay(200);
    const group = MOCK_GROUPS.find((g) => g.id === id);
    return group ? { ...group, owner: { ...group.owner } } : null;
  },

  async getGroupMembers(id: string): Promise<GroupMember[]> {
    await delay(200);
    const group = MOCK_GROUPS.find((g) => g.id === id);
    const admin: GroupMember = {
      id: `${id}-owner`,
      name: group?.owner.name ?? "Unknown",
      avatarUrl: group?.owner.avatarUrl,
      role: "Admin",
      joinedAt: group?.createdAt ?? "",
    };
    return [admin, ...MOCK_GROUP_MEMBERS.filter((m) => m.name !== admin.name)];
  },

  async getGroupPosts(id: string): Promise<GroupPost[]> {
    await delay(200);
    void id; // demo data is shared across groups
    return MOCK_GROUP_POSTS.map((p) => ({ ...p }));
  },

  async createGroup(input: CreateGroupInput): Promise<Group> {
    await delay(400);
    const group: Group = {
      id: `g-${slugify(input.name)}-${Date.now().toString(36)}`,
      name: input.name,
      category: input.category,
      privacy: input.privacy,
      owner: { name: input.ownerName, initials: getInitials(input.ownerName), avatarUrl: input.ownerAvatarUrl },
      members: 0,
      posts: 0,
      status: "ACTIVE",
      iconColor: CATEGORY_ICON_COLOR[input.category],
      createdAt: formatToday(),
      avatarUrl: dummyAvatar(slugify(input.name)),
      coverUrl: dummyCover(slugify(input.name)),
    };
    MOCK_GROUPS.push(group);
    return { ...group, owner: { ...group.owner } };
  },

  async updateGroup(id: string, input: UpdateGroupInput): Promise<Group> {
    await delay(400);
    const group = MOCK_GROUPS.find((g) => g.id === id);
    if (!group) throw new Error("Group not found");
    if (input.name !== undefined) group.name = input.name;
    if (input.category !== undefined) { group.category = input.category; group.iconColor = CATEGORY_ICON_COLOR[input.category]; }
    if (input.privacy !== undefined) group.privacy = input.privacy;
    if (input.status !== undefined) group.status = input.status;
    if (input.ownerName !== undefined) { group.owner.name = input.ownerName; group.owner.initials = getInitials(input.ownerName); }
    if (input.ownerAvatarUrl !== undefined) group.owner.avatarUrl = input.ownerAvatarUrl;
    return { ...group, owner: { ...group.owner } };
  },

  async deleteGroup(id: string): Promise<void> {
    await delay(300);
    const index = MOCK_GROUPS.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Group not found");
    MOCK_GROUPS.splice(index, 1);
  },
};
