import type {
  CourseCategory,
  LibraryResource,
  ResourceStatus,
  ResourceType,
} from "@/constants/education-mock-data";
import { MOCK_RESOURCES, MOCK_RESOURCE_STATS } from "@/constants/education-mock-data";
import { dummyCover } from "@/constants/mock-data";
import { logEducationActivity } from "@/services/education-activity.service";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const CURRENT_ADMIN = "Jay Mandaliya";

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "resource";
}

function formatToday(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

export interface TagSummary {
  label: string;
  count: number;
}

export interface CreateResourceInput {
  title: string;
  type: ResourceType;
  category: CourseCategory;
  tags: string[];
  authorName?: string;
  authorAvatarUrl?: string;
  coverUrl?: string;
  videoUrl?: string;
  content?: string;
}

export type UpdateResourceInput = Partial<{
  title: string;
  type: ResourceType;
  category: CourseCategory;
  tags: string[];
  authorName: string;
  authorAvatarUrl: string;
  coverUrl: string;
  videoUrl: string;
  content: string;
  status: ResourceStatus;
}>;

export const libraryService = {
  async getResources(): Promise<LibraryResource[]> {
    await delay(250);
    return MOCK_RESOURCES.map((r) => ({ ...r, tags: [...r.tags], author: r.author ? { ...r.author } : undefined }));
  },

  async getResourceStats() {
    await delay(150);
    return MOCK_RESOURCE_STATS;
  },

  async getResourceById(id: string): Promise<LibraryResource | null> {
    await delay(200);
    const resource = MOCK_RESOURCES.find((r) => r.id === id);
    if (!resource) return null;
    return { ...resource, tags: [...resource.tags], author: resource.author ? { ...resource.author } : undefined };
  },

  async getTags(): Promise<TagSummary[]> {
    await delay(200);
    const counts = new Map<string, number>();
    for (const r of MOCK_RESOURCES) {
      for (const tag of r.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  },

  async renameTag(oldLabel: string, newLabel: string): Promise<void> {
    await delay(300);
    const trimmed = newLabel.trim();
    if (!trimmed) throw new Error("New tag name is required");
    for (const r of MOCK_RESOURCES) {
      r.tags = r.tags.map((t) => (t === oldLabel ? trimmed : t));
    }
  },

  async deleteTag(label: string): Promise<void> {
    await delay(300);
    for (const r of MOCK_RESOURCES) {
      r.tags = r.tags.filter((t) => t !== label);
    }
  },

  async createResource(input: CreateResourceInput): Promise<LibraryResource> {
    await delay(400);
    const resource: LibraryResource = {
      id: `r-${slugify(input.title)}-${Date.now().toString(36)}`,
      title: input.title,
      type: input.type,
      category: input.category,
      tags: input.tags,
      author: input.authorName ? { name: input.authorName, avatarUrl: input.authorAvatarUrl } : undefined,
      coverUrl: input.coverUrl || dummyCover(slugify(input.title)),
      videoUrl: input.type === "Video" ? input.videoUrl : undefined,
      content: input.content,
      status: "DRAFT",
      createdAt: formatToday(),
    };
    MOCK_RESOURCES.push(resource);
    logEducationActivity({ adminName: CURRENT_ADMIN, action: "CREATED", entityType: "Resource", entityName: resource.title });
    return { ...resource, tags: [...resource.tags] };
  },

  async updateResource(id: string, input: UpdateResourceInput): Promise<LibraryResource> {
    await delay(400);
    const resource = MOCK_RESOURCES.find((r) => r.id === id);
    if (!resource) throw new Error("Resource not found");

    if (input.title !== undefined) resource.title = input.title;
    if (input.type !== undefined) resource.type = input.type;
    if (input.category !== undefined) resource.category = input.category;
    if (input.tags !== undefined) resource.tags = input.tags;
    if (input.authorName !== undefined) resource.author = { name: input.authorName, avatarUrl: input.authorAvatarUrl ?? resource.author?.avatarUrl };
    if (input.coverUrl !== undefined) resource.coverUrl = input.coverUrl;
    if (input.videoUrl !== undefined) resource.videoUrl = input.videoUrl;
    if (input.content !== undefined) resource.content = input.content;

    if (input.status !== undefined && input.status !== resource.status) {
      resource.status = input.status;
      logEducationActivity({ adminName: CURRENT_ADMIN, action: input.status === "PUBLISHED" ? "PUBLISHED" : "UPDATED", entityType: "Resource", entityName: resource.title });
    } else {
      logEducationActivity({ adminName: CURRENT_ADMIN, action: "UPDATED", entityType: "Resource", entityName: resource.title });
    }

    return { ...resource, tags: [...resource.tags] };
  },

  async deleteResource(id: string): Promise<void> {
    await delay(300);
    const index = MOCK_RESOURCES.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Resource not found");
    const [removed] = MOCK_RESOURCES.splice(index, 1);
    logEducationActivity({ adminName: CURRENT_ADMIN, action: "DELETED", entityType: "Resource", entityName: removed.title });
  },
};
