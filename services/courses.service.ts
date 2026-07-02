import type {
  Course,
  CourseCategory,
  CourseDifficulty,
  CourseEnrollment,
  CourseModule,
  CourseStatus,
} from "@/constants/education-mock-data";
import { MOCK_COURSES, MOCK_COURSE_ENROLLMENTS, MOCK_COURSE_STATS } from "@/constants/education-mock-data";
import { dummyCover } from "@/constants/mock-data";
import { getInitials } from "@/lib/utils";
import { logEducationActivity } from "@/services/education-activity.service";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const CURRENT_ADMIN = "Jay Mandaliya";

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "course";
}

function formatToday(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
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

export const coursesService = {
  async getCourses(): Promise<Course[]> {
    await delay(250);
    return MOCK_COURSES.map((c) => ({ ...c, instructor: { ...c.instructor }, modules: c.modules.map((m) => ({ ...m, chapters: [...m.chapters] })) }));
  },

  async getCourseStats() {
    await delay(150);
    return MOCK_COURSE_STATS;
  },

  async getCourseById(id: string): Promise<Course | null> {
    await delay(200);
    const course = MOCK_COURSES.find((c) => c.id === id);
    if (!course) return null;
    return { ...course, instructor: { ...course.instructor }, modules: course.modules.map((m) => ({ ...m, chapters: [...m.chapters] })) };
  },

  async getCourseEnrollments(id: string): Promise<CourseEnrollment[]> {
    await delay(200);
    return MOCK_COURSE_ENROLLMENTS.filter((e) => e.courseId === id).map((e) => ({ ...e }));
  },

  async createCourse(input: CreateCourseInput): Promise<Course> {
    await delay(400);
    const course: Course = {
      id: `c-${slugify(input.title)}-${Date.now().toString(36)}`,
      title: input.title,
      category: input.category,
      difficulty: input.difficulty,
      instructor: { name: input.instructorName, initials: getInitials(input.instructorName), avatarUrl: input.instructorAvatarUrl },
      duration: input.duration,
      isFree: input.isFree,
      price: input.isFree ? undefined : input.price,
      status: "DRAFT",
      coverUrl: input.coverUrl || dummyCover(slugify(input.title)),
      description: input.description,
      createdAt: formatToday(),
      modules: input.modules,
    };
    MOCK_COURSES.push(course);
    logEducationActivity({ adminName: CURRENT_ADMIN, action: "CREATED", entityType: "Course", entityName: course.title });
    return { ...course, instructor: { ...course.instructor } };
  },

  async updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
    await delay(400);
    const course = MOCK_COURSES.find((c) => c.id === id);
    if (!course) throw new Error("Course not found");

    if (input.title !== undefined) course.title = input.title;
    if (input.category !== undefined) course.category = input.category;
    if (input.difficulty !== undefined) course.difficulty = input.difficulty;
    if (input.instructorName !== undefined) { course.instructor.name = input.instructorName; course.instructor.initials = getInitials(input.instructorName); }
    if (input.instructorAvatarUrl !== undefined) course.instructor.avatarUrl = input.instructorAvatarUrl;
    if (input.duration !== undefined) course.duration = input.duration;
    if (input.isFree !== undefined) course.isFree = input.isFree;
    if (input.price !== undefined) course.price = input.price;
    if (input.coverUrl !== undefined) course.coverUrl = input.coverUrl;
    if (input.description !== undefined) course.description = input.description;
    if (input.modules !== undefined) course.modules = input.modules;

    if (input.status !== undefined && input.status !== course.status) {
      course.status = input.status;
      const action = input.status === "PUBLISHED" ? "PUBLISHED" : input.status === "ARCHIVED" ? "ARCHIVED" : "UPDATED";
      logEducationActivity({ adminName: CURRENT_ADMIN, action, entityType: "Course", entityName: course.title });
    } else {
      logEducationActivity({ adminName: CURRENT_ADMIN, action: "UPDATED", entityType: "Course", entityName: course.title });
    }

    return { ...course, instructor: { ...course.instructor } };
  },

  async deleteCourse(id: string): Promise<void> {
    await delay(300);
    const index = MOCK_COURSES.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Course not found");
    const [removed] = MOCK_COURSES.splice(index, 1);
    logEducationActivity({ adminName: CURRENT_ADMIN, action: "DELETED", entityType: "Course", entityName: removed.title });
  },
};
