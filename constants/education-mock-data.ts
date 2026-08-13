import { dummyAvatar, dummyCover } from "@/constants/mock-data";

/* ══════════════════════════════════════════════════════════════
   Courses
   ══════════════════════════════════════════════════════════════ */

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CourseCategory =
  | "Design"
  | "Development"
  | "Business"
  | "Technology"
  | "Marketing"
  | "Finance"
  | "Soft Skills";
export type CourseDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface CourseChapter {
  id: string;
  title: string;
  videoUrl?: string;
  notes?: string;
  order: number;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  chapters: CourseChapter[];
}

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  instructor: { name: string; avatarUrl?: string; initials: string };
  duration: string;
  isFree: boolean;
  price?: string;
  status: CourseStatus;
  coverUrl?: string;
  description?: string;
  createdAt: string;
  modules: CourseModule[];
  enrolledCount: number;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  studentName: string;
  studentAvatarUrl?: string;
  progressPct: number;
  enrolledAt: string;
  lastActiveAt: string;
}

/* ══════════════════════════════════════════════════════════════
   Library / Resources
   ══════════════════════════════════════════════════════════════ */

export type ResourceType = "Article" | "Video" | "Guide" | "Document";
export type ResourceStatus = "DRAFT" | "PUBLISHED";

export interface LibraryResource {
  id: string;
  title: string;
  type: ResourceType;
  category: CourseCategory;
  tags: string[];
  author?: { name: string; avatarUrl?: string };
  coverUrl?: string;
  videoUrl?: string;
  content?: string;
  status: ResourceStatus;
  createdAt: string;
}

export const MOCK_RESOURCES: LibraryResource[] = [
  {
    id: "r1", title: "Brand Identity Blueprint", type: "Article", category: "Design",
    tags: ["branding", "identity", "design-systems"],
    coverUrl: dummyCover("r1"),
    content: "A comprehensive guide to building resilient brand systems and visual languages.",
    status: "PUBLISHED", createdAt: "01/10/2026",
  },
  {
    id: "r2", title: "Growth Analytics Mastery", type: "Video", category: "Business",
    tags: ["analytics", "growth", "metrics"],
    coverUrl: dummyCover("r2"), videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    content: "Master the core metrics that drive business growth and product success.",
    status: "PUBLISHED", createdAt: "01/18/2026",
  },
  {
    id: "r3", title: "Agile Product Management", type: "Guide", category: "Business",
    tags: ["agile", "product-management", "sprint-planning"],
    coverUrl: dummyCover("r3"),
    content: "The complete handbook for agile product teams and sprint planning.",
    status: "PUBLISHED", createdAt: "02/02/2026",
  },
  {
    id: "r4", title: "Founder Agreement Template", type: "Document", category: "Business",
    tags: ["legal", "startup", "equity"],
    coverUrl: dummyCover("r4"),
    content: "Standardized founder vesting and intellectual property agreements.",
    status: "DRAFT", createdAt: "02/20/2026",
  },
  {
    id: "r5", title: "AI Implementation Guide", type: "Guide", category: "Development",
    tags: ["ai", "llm", "integration"],
    coverUrl: dummyCover("r5"),
    content: "Practical steps for integrating large language models into products.",
    status: "PUBLISHED", createdAt: "03/05/2026",
  },
  {
    id: "r6", title: "Advanced React Patterns", type: "Video", category: "Development",
    tags: ["react", "javascript", "development"],
    author: { name: "Mark Kovich", avatarUrl: dummyAvatar("author-mark") },
    coverUrl: dummyCover("r6"), videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
    content: "Master complex component structures, custom hooks, and state management strategies.",
    status: "PUBLISHED", createdAt: "03/22/2026",
  },
  {
    id: "r7", title: "Future of AI in Education 2026", type: "Document", category: "Technology",
    tags: ["ai", "report", "education"],
    author: { name: "Robert Fisher", avatarUrl: dummyAvatar("author-robert") },
    coverUrl: dummyCover("r7"),
    content: "An in-depth whitepaper exploring the latest trends and future impact of AI on learning.",
    status: "PUBLISHED", createdAt: "04/01/2026",
  },
  {
    id: "r8", title: "Principles of Web Accessibility", type: "Article", category: "Design",
    tags: ["design", "accessibility", "wcag"],
    author: { name: "Sarah Jenkins", avatarUrl: dummyAvatar("author-sarahj") },
    coverUrl: dummyCover("r8"),
    content: "Learn the fundamental guidelines for creating inclusive digital experiences.",
    status: "PUBLISHED", createdAt: "04/15/2026",
  },
  {
    id: "r9", title: "Effective User Interviewing", type: "Guide", category: "Design",
    tags: ["ux-research", "strategy", "user-interviews"],
    author: { name: "Elena Lu", avatarUrl: dummyAvatar("author-elena") },
    coverUrl: dummyCover("r9"),
    content: "How to ask the right questions and extract valuable insights from your audience.",
    status: "DRAFT", createdAt: "05/01/2026",
  },
  {
    id: "r10", title: "Tech Trends Webinar", type: "Video", category: "Technology",
    tags: ["ai", "trends", "webinar"],
    coverUrl: dummyCover("r10"), videoUrl: "https://samplelib.com/preview/mp4/sample-5s.mp4",
    content: "Recorded session with industry experts on the future of AI technology.",
    status: "PUBLISHED", createdAt: "05/20/2026",
  },
];

export const MOCK_RESOURCE_STATS = {
  totalResources: MOCK_RESOURCES.length,
  published: MOCK_RESOURCES.filter((r) => r.status === "PUBLISHED").length,
  draft: MOCK_RESOURCES.filter((r) => r.status === "DRAFT").length,
  byType: {
    Article: MOCK_RESOURCES.filter((r) => r.type === "Article").length,
    Video: MOCK_RESOURCES.filter((r) => r.type === "Video").length,
    Guide: MOCK_RESOURCES.filter((r) => r.type === "Guide").length,
    Document: MOCK_RESOURCES.filter((r) => r.type === "Document").length,
  },
};

/* ══════════════════════════════════════════════════════════════
   Admin activity log
   ══════════════════════════════════════════════════════════════ */

export type EducationActivityAction = "CREATED" | "UPDATED" | "PUBLISHED" | "ARCHIVED" | "DELETED";
export type EducationEntityType = "Course" | "Resource";

export interface EducationActivity {
  id: string;
  adminName: string;
  action: EducationActivityAction;
  entityType: EducationEntityType;
  entityName: string;
  timestamp: string;
}

export const MOCK_EDUCATION_ACTIVITY: EducationActivity[] = [
  { id: "ea1", adminName: "Jay Mandaliya", action: "CREATED", entityType: "Course", entityName: "Advanced UI Design Systems", timestamp: "06/28/2026 09:12:04" },
  { id: "ea2", adminName: "Jay Mandaliya", action: "PUBLISHED", entityType: "Course", entityName: "Advanced UI Design Systems", timestamp: "06/28/2026 09:15:41" },
  { id: "ea3", adminName: "Arpit Menaria", action: "CREATED", entityType: "Resource", entityName: "Brand Identity Blueprint", timestamp: "06/29/2026 11:02:18" },
  { id: "ea4", adminName: "Arpit Menaria", action: "UPDATED", entityType: "Resource", entityName: "AI Implementation Guide", timestamp: "06/29/2026 14:47:55" },
  { id: "ea5", adminName: "Jay Mandaliya", action: "ARCHIVED", entityType: "Course", entityName: "Leadership & Team Management", timestamp: "06/30/2026 10:30:02" },
  { id: "ea6", adminName: "Priya Sood", action: "CREATED", entityType: "Course", entityName: "Modern Branding Strategies", timestamp: "07/01/2026 08:55:37" },
  { id: "ea7", adminName: "Priya Sood", action: "DELETED", entityType: "Resource", entityName: "Old Onboarding Checklist", timestamp: "07/01/2026 09:40:12" },
];
