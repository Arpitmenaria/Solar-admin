import { dummyAvatar, dummyCover } from "@/constants/mock-data";
import { getInitials } from "@/lib/utils";

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
}

function mod(id: string, title: string, order: number, chapters: CourseChapter[]): CourseModule {
  return { id, title, order, chapters };
}
function ch(id: string, title: string, order: number, videoUrl?: string, notes?: string): CourseChapter {
  return { id, title, order, videoUrl, notes };
}

export const MOCK_COURSES: Course[] = [
  {
    id: "c1",
    title: "Advanced UI Design Systems",
    category: "Design",
    difficulty: "Advanced",
    instructor: { name: "Alex Rivera", initials: getInitials("Alex Rivera"), avatarUrl: dummyAvatar("instr-alex") },
    duration: "12h 30m",
    isFree: false,
    price: "$89.99",
    status: "PUBLISHED",
    coverUrl: dummyCover("c1"),
    description:
      "A deep dive into building resilient, scalable design systems — typography, component architecture, and the tooling that keeps them from drifting.",
    createdAt: "02/14/2026",
    modules: [
      mod("m1", "Module 1: Design Systems Foundations", 1, [
        ch("ch1", "Typography Systems", 1, "https://www.w3schools.com/html/mov_bbb.mp4", "Type scales, hierarchy, and weight pairings."),
        ch("ch2", "Component Architecture", 2, "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4", "Atomic design tokens through organisms."),
      ]),
    ],
  },
  {
    id: "c2",
    title: "Full-Stack Web Architecture",
    category: "Development",
    difficulty: "Intermediate",
    instructor: { name: "Sarah Linden", initials: getInitials("Sarah Linden"), avatarUrl: dummyAvatar("instr-sarah") },
    duration: "24h 45m",
    isFree: false,
    price: "$129.00",
    status: "PUBLISHED",
    coverUrl: dummyCover("c2"),
    description: "Modern full-stack patterns from API design to deployment.",
    createdAt: "01/22/2026",
    modules: [
      mod("m1", "Module 1: Getting Started", 1, [
        ch("ch1", "Course Introduction", 1, "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"),
        ch("ch2", "Core Concepts", 2, "https://www.w3schools.com/html/movie.mp4"),
      ]),
    ],
  },
  {
    id: "c3",
    title: "Data Science for Business",
    category: "Technology",
    difficulty: "Beginner",
    instructor: { name: "Marcus Kane", initials: getInitials("Marcus Kane"), avatarUrl: dummyAvatar("instr-marcus") },
    duration: "8h 15m",
    isFree: true,
    status: "PUBLISHED",
    coverUrl: dummyCover("c3"),
    description: "Analytics fundamentals for non-technical decision makers.",
    createdAt: "03/02/2026",
    modules: [
      mod("m1", "Module 1: Getting Started", 1, [
        ch("ch1", "Course Introduction", 1, "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4"),
      ]),
    ],
  },
  {
    id: "c4",
    title: "Modern Branding Strategies",
    category: "Marketing",
    difficulty: "Intermediate",
    instructor: { name: "Elena Wong", initials: getInitials("Elena Wong"), avatarUrl: dummyAvatar("instr-elena") },
    duration: "15h 20m",
    isFree: false,
    price: "$59.99",
    status: "DRAFT",
    coverUrl: dummyCover("c4"),
    description: "Building brand systems for digital-first products.",
    createdAt: "04/10/2026",
    modules: [
      mod("m1", "Module 1: Getting Started", 1, [
        ch("ch1", "Course Introduction", 1, "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4"),
      ]),
    ],
  },
  {
    id: "c5",
    title: "Financial Modeling for Business Leaders",
    category: "Finance",
    difficulty: "Beginner",
    instructor: { name: "Marcus Thorne", initials: getInitials("Marcus Thorne"), avatarUrl: dummyAvatar("instr-thorne") },
    duration: "6h 45m",
    isFree: true,
    status: "PUBLISHED",
    coverUrl: dummyCover("c5"),
    description: "Core spreadsheet modeling skills for leaders who aren't finance specialists.",
    createdAt: "05/18/2026",
    modules: [
      mod("m1", "Module 1: Getting Started", 1, [
        ch("ch1", "Course Introduction", 1, "https://samplelib.com/preview/mp4/sample-5s.mp4"),
      ]),
    ],
  },
  {
    id: "c6",
    title: "Leadership & Team Management",
    category: "Soft Skills",
    difficulty: "Intermediate",
    instructor: { name: "Dr. Sarah Jenkins", initials: getInitials("Dr. Sarah Jenkins"), avatarUrl: dummyAvatar("instr-jenkins") },
    duration: "9h 20m",
    isFree: false,
    price: "$79.00",
    status: "ARCHIVED",
    coverUrl: dummyCover("c6"),
    description: "Practical management techniques for first-time tech leads.",
    createdAt: "12/05/2025",
    modules: [
      mod("m1", "Module 1: Getting Started", 1, [
        ch("ch1", "Course Introduction", 1, "https://www.w3schools.com/html/mov_bbb.mp4"),
      ]),
    ],
  },
  {
    id: "c7",
    title: "React Performance Patterns",
    category: "Development",
    difficulty: "Advanced",
    instructor: { name: "Leo Zhang", initials: getInitials("Leo Zhang"), avatarUrl: dummyAvatar("instr-leo") },
    duration: "11h 15m",
    isFree: false,
    price: "$94.99",
    status: "PUBLISHED",
    coverUrl: dummyCover("c7"),
    description: "Profiling, memoization, and rendering-cost patterns for large React apps.",
    createdAt: "02/28/2026",
    modules: [
      mod("m1", "Module 1: Profiling & Rendering", 1, [
        ch("ch1", "React DevTools", 1, "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4", "Reading the flamegraph."),
      ]),
    ],
  },
  {
    id: "c8",
    title: "Product Management Fundamentals",
    category: "Business",
    difficulty: "Intermediate",
    instructor: { name: "Sophia Bloom", initials: getInitials("Sophia Bloom"), avatarUrl: dummyAvatar("instr-sophia") },
    duration: "8h 40m",
    isFree: true,
    status: "PUBLISHED",
    coverUrl: dummyCover("c8"),
    description: "Stakeholder mapping, research ethics, and roadmap fundamentals.",
    createdAt: "03/15/2026",
    modules: [
      mod("m1", "Module 1: Research & Stakeholders", 1, [
        ch("ch1", "Stakeholder Mapping", 1, "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"),
        ch("ch2", "User Research Ethics", 2, "https://www.w3schools.com/html/movie.mp4"),
      ]),
    ],
  },
];

export const MOCK_COURSE_STATS = {
  totalCourses: MOCK_COURSES.length,
  published: MOCK_COURSES.filter((c) => c.status === "PUBLISHED").length,
  draft: MOCK_COURSES.filter((c) => c.status === "DRAFT").length,
  archived: MOCK_COURSES.filter((c) => c.status === "ARCHIVED").length,
  freeCourses: MOCK_COURSES.filter((c) => c.isFree).length,
  paidCourses: MOCK_COURSES.filter((c) => !c.isFree).length,
};

export interface CourseEnrollment {
  id: string;
  courseId: string;
  studentName: string;
  studentAvatarUrl?: string;
  progressPct: number;
  enrolledAt: string;
  lastActiveAt: string;
}

export const MOCK_COURSE_ENROLLMENTS: CourseEnrollment[] = [
  { id: "ce1", courseId: "c1", studentName: "Priya Nair", studentAvatarUrl: dummyAvatar("stu-priya"), progressPct: 100, enrolledAt: "03/01/2026", lastActiveAt: "06/20/2026" },
  { id: "ce2", courseId: "c1", studentName: "Rohan Mehta", studentAvatarUrl: dummyAvatar("stu-rohan"), progressPct: 40, enrolledAt: "04/12/2026", lastActiveAt: "06/25/2026" },
  { id: "ce3", courseId: "c1", studentName: "Sneha Kapoor", studentAvatarUrl: dummyAvatar("stu-sneha"), progressPct: 15, enrolledAt: "06/01/2026", lastActiveAt: "06/28/2026" },
  { id: "ce4", courseId: "c2", studentName: "Mark Kovich", studentAvatarUrl: dummyAvatar("stu-mark"), progressPct: 65, enrolledAt: "02/10/2026", lastActiveAt: "06/22/2026" },
  { id: "ce5", courseId: "c2", studentName: "Robert Fisher", studentAvatarUrl: dummyAvatar("stu-robert"), progressPct: 30, enrolledAt: "05/05/2026", lastActiveAt: "06/18/2026" },
  { id: "ce6", courseId: "c3", studentName: "Sarah Jenkins", studentAvatarUrl: dummyAvatar("stu-sarahj"), progressPct: 100, enrolledAt: "03/20/2026", lastActiveAt: "06/15/2026" },
  { id: "ce7", courseId: "c5", studentName: "Elena Lu", studentAvatarUrl: dummyAvatar("stu-elena"), progressPct: 50, enrolledAt: "05/28/2026", lastActiveAt: "06/27/2026" },
  { id: "ce8", courseId: "c7", studentName: "Chen Wei", studentAvatarUrl: dummyAvatar("stu-chen"), progressPct: 80, enrolledAt: "04/02/2026", lastActiveAt: "06/26/2026" },
  { id: "ce9", courseId: "c8", studentName: "Amara Okonkwo", studentAvatarUrl: dummyAvatar("stu-amara"), progressPct: 20, enrolledAt: "06/10/2026", lastActiveAt: "06/29/2026" },
  { id: "ce10", courseId: "c8", studentName: "Jake Torres", studentAvatarUrl: dummyAvatar("stu-jake"), progressPct: 90, enrolledAt: "03/25/2026", lastActiveAt: "06/24/2026" },
];

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
