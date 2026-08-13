import type {
  Course,
  CourseCategory,
  CourseDifficulty,
  CourseEnrollment,
  CourseModule,
  CourseStatus,
} from "@/constants/education-mock-data";
import { dummyCover } from "@/constants/mock-data";
import { getInitials } from "@/lib/utils";
import { apiClient, type ApiError } from "@/services/api/client";
import { logEducationActivity } from "@/services/education-activity.service";

const BASE = "/api/admin/courses";
const CURRENT_ADMIN = "Jay Mandaliya";

/** Courses can grow past a single page — bump this if the catalog outgrows it. */
const LIST_LIMIT = 100;

const CATEGORIES: CourseCategory[] = ["Design", "Development", "Business", "Technology", "Marketing", "Finance", "Soft Skills"];
const DIFFICULTIES: CourseDifficulty[] = ["Beginner", "Intermediate", "Advanced"];
const STATUSES: CourseStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function mapCategory(c?: string): CourseCategory {
  return CATEGORIES.find((opt) => opt.toLowerCase() === (c ?? "").toLowerCase()) ?? "Development";
}
function mapDifficulty(l?: string): CourseDifficulty {
  return DIFFICULTIES.find((opt) => opt.toLowerCase() === (l ?? "").toLowerCase()) ?? "Beginner";
}
function mapStatus(s?: string): CourseStatus {
  const u = (s ?? "").toUpperCase();
  return STATUSES.includes(u as CourseStatus) ? (u as CourseStatus) : "DRAFT";
}

/** API duration is assumed to be minutes — unconfirmed against a non-zero sample. */
function formatDuration(minutes?: number): string {
  const total = Math.max(0, Math.round(minutes ?? 0));
  if (!total) return "";
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}
function parseDurationMinutes(input: string): number {
  const h = parseInt(/(\d+)\s*h/i.exec(input)?.[1] ?? "0", 10);
  const m = parseInt(/(\d+)\s*m/i.exec(input)?.[1] ?? "0", 10);
  return h * 60 + m;
}

interface ApiInstructor {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

interface ApiChapter {
  id?: string;
  _id?: string;
  title?: string;
  videoUrl?: string;
  notes?: string;
  order?: number;
}

interface ApiModule {
  id?: string;
  _id?: string;
  title?: string;
  order?: number;
  chapters?: ApiChapter[];
}

interface ApiEnrollment {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  studentName?: string;
  avatar?: string;
  avatarUrl?: string;
  progress?: number;
  progressPct?: number;
  enrolledAt?: string;
  lastActiveAt?: string;
}

interface ApiCourse {
  id?: string;
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  level?: string;
  status?: string;
  price?: number;
  pricingType?: string;
  coverImage?: string;
  instructor?: ApiInstructor | null;
  students?: number | ApiEnrollment[];
  totalEnrollments?: number;
  duration?: number;
  modules?: ApiModule[];
  createdAt?: string;
  updatedAt?: string;
}

interface ApiCourseList {
  success: boolean;
  courses: ApiCourse[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface ApiCourseDetail {
  success: boolean;
  course: ApiCourse;
}

function mapCourse(c: ApiCourse): Course {
  const instructorName = c.instructor?.name ?? "Unknown";
  const isFree = (c.pricingType ?? "").toLowerCase() === "free" || !c.price;
  const modules: CourseModule[] = (c.modules ?? []).map((m, mi) => ({
    id: m.id ?? m._id ?? `m${mi}`,
    title: m.title ?? `Module ${mi + 1}`,
    order: m.order ?? mi + 1,
    chapters: (m.chapters ?? []).map((ch, ci) => ({
      id: ch.id ?? ch._id ?? `ch${ci}`,
      title: ch.title ?? `Chapter ${ci + 1}`,
      videoUrl: ch.videoUrl,
      notes: ch.notes,
      order: ch.order ?? ci + 1,
    })),
  }));
  const enrolledCount = Array.isArray(c.students) ? c.students.length : c.students ?? c.totalEnrollments ?? 0;

  return {
    id: c.id ?? c._id ?? "",
    title: c.title ?? "",
    category: mapCategory(c.category),
    difficulty: mapDifficulty(c.level),
    instructor: { name: instructorName, avatarUrl: c.instructor?.avatar, initials: getInitials(instructorName) },
    duration: formatDuration(c.duration),
    isFree,
    price: isFree ? undefined : `$${(c.price ?? 0).toFixed(2)}`,
    status: mapStatus(c.status),
    coverUrl: c.coverImage || dummyCover(c.id ?? c.slug ?? c.title ?? "course"),
    description: c.description,
    createdAt: c.createdAt ?? "",
    modules,
    enrolledCount,
  };
}

async function fetchAllCourses(): Promise<Course[]> {
  const params = new URLSearchParams({ page: "1", limit: String(LIST_LIMIT) });
  const res = await apiClient.get<ApiCourseList>(`${BASE}?${params.toString()}`);
  return (res.courses ?? []).map(mapCourse);
}

export interface CreateCourseInput {
  title: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  instructorName: string;
  instructorAvatarUrl?: string;
  duration: string;
  isFree: boolean;
  price?: string;
  coverUrl?: string;
  description?: string;
  modules: CourseModule[];
}

export type UpdateCourseInput = Partial<{
  title: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  instructorName: string;
  instructorAvatarUrl: string;
  duration: string;
  isFree: boolean;
  price: string;
  status: CourseStatus;
  coverUrl: string;
  description: string;
  modules: CourseModule[];
}>;

/**
 * Instructor is populated server-side as { id, name, email, avatar } on read,
 * so instructorName/instructorAvatarUrl from the form aren't sent on write —
 * there's no confirmed field for assigning an instructor by name from this API.
 */
function toApiPayload(input: Partial<CreateCourseInput & UpdateCourseInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) body.title = input.title;
  if (input.description !== undefined) body.description = input.description;
  if (input.category !== undefined) body.category = input.category.toLowerCase();
  if (input.difficulty !== undefined) body.level = input.difficulty.toLowerCase();
  if (input.duration !== undefined) body.duration = parseDurationMinutes(input.duration);
  if (input.coverUrl !== undefined) body.coverImage = input.coverUrl;
  if (input.isFree !== undefined || input.price !== undefined) {
    const isFree = input.isFree ?? false;
    body.pricingType = isFree ? "free" : "paid";
    body.price = isFree ? 0 : Number((input.price ?? "").replace(/[^0-9.]/g, "")) || 0;
  }
  if (input.status !== undefined) body.status = input.status.toLowerCase();
  if (input.modules !== undefined) {
    body.modules = input.modules.map((m) => ({
      title: m.title,
      order: m.order,
      chapters: m.chapters.map((ch) => ({ title: ch.title, videoUrl: ch.videoUrl, notes: ch.notes, order: ch.order })),
    }));
  }
  return body;
}

export const coursesService = {
  async getCourses(): Promise<Course[]> {
    return fetchAllCourses();
  },

  async getCourseStats() {
    const courses = await fetchAllCourses();
    return {
      totalCourses: courses.length,
      published: courses.filter((c) => c.status === "PUBLISHED").length,
      draft: courses.filter((c) => c.status === "DRAFT").length,
      archived: courses.filter((c) => c.status === "ARCHIVED").length,
      freeCourses: courses.filter((c) => c.isFree).length,
      paidCourses: courses.filter((c) => !c.isFree).length,
    };
  },

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const res = await apiClient.get<ApiCourseDetail>(`${BASE}/${id}`);
      return res.course ? mapCourse(res.course) : null;
    } catch (err) {
      if ((err as ApiError)?.status === 404) return null;
      throw err;
    }
  },

  /** Derived from the course detail's `students` array — no separate enrollments endpoint is confirmed. */
  async getCourseEnrollments(id: string): Promise<CourseEnrollment[]> {
    let students: ApiCourse["students"];
    try {
      const res = await apiClient.get<ApiCourseDetail>(`${BASE}/${id}`);
      students = res.course?.students;
    } catch (err) {
      if ((err as ApiError)?.status === 404) return [];
      throw err;
    }
    if (!Array.isArray(students)) return [];
    return students.map((s, i) => ({
      id: s.id ?? s._id ?? s.userId ?? `enr-${i}`,
      courseId: id,
      studentName: s.name ?? s.studentName ?? "Unknown",
      studentAvatarUrl: s.avatar ?? s.avatarUrl,
      progressPct: s.progress ?? s.progressPct ?? 0,
      enrolledAt: s.enrolledAt ?? "",
      lastActiveAt: s.lastActiveAt ?? "",
    }));
  },

  async createCourse(input: CreateCourseInput): Promise<Course> {
    const res = await apiClient.post<ApiCourseDetail>(BASE, toApiPayload(input));
    const course = mapCourse(res.course);
    logEducationActivity({ adminName: CURRENT_ADMIN, action: "CREATED", entityType: "Course", entityName: course.title });
    return course;
  },

  async updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
    const res = await apiClient.patch<ApiCourseDetail>(`${BASE}/${id}`, toApiPayload(input));
    const course = mapCourse(res.course);
    const action = input.status === "PUBLISHED" ? "PUBLISHED" : input.status === "ARCHIVED" ? "ARCHIVED" : "UPDATED";
    logEducationActivity({ adminName: CURRENT_ADMIN, action, entityType: "Course", entityName: course.title });
    return course;
  },

  async deleteCourse(id: string): Promise<void> {
    let name = id;
    try {
      const existing = await apiClient.get<ApiCourseDetail>(`${BASE}/${id}`);
      name = existing.course?.title ?? id;
    } catch {
      // best effort — only used for the activity log label
    }
    await apiClient.delete(`${BASE}/${id}`);
    logEducationActivity({ adminName: CURRENT_ADMIN, action: "DELETED", entityType: "Course", entityName: name });
  },
};
